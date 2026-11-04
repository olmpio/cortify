import type {
  Mensagem, ConversaCliente, ConversaAdmin,
  Barbearia, Barbeiro, Servico, Agendamento, AgendamentoCriado, UsuarioAdmin, StatusAgendamento, Cliente,
} from '@/types';

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? 'http://localhost:5000/api';

/** Duas sessões independentes: dono da barbearia (admin) e cliente final. */
export type Perfil = 'admin' | 'cliente';

/**
 * Segurança da sessão:
 *  - o access token (15 min) vive SÓ NA MEMÓRIA desta aba; nada sensível é gravado em localStorage;
 *  - a renovação usa um cookie httpOnly (inacessível ao JavaScript, logo inroubável por XSS);
 *  - o localStorage guarda apenas um "indício" não sensível (1/0) para sabermos se vale tentar renovar ao abrir o site.
 */
const tokens: Record<Perfil, string | null> = { admin: null, cliente: null };
const INDICIO: Record<Perfil, string> = { admin: 'cortify_sessao_admin', cliente: 'cortify_sessao_cliente' };

export const sessao = {
  definir(perfil: Perfil, token: string) {
    tokens[perfil] = token;
    try { localStorage.setItem(INDICIO[perfil], '1'); } catch { /* modo privado */ }
  },
  limpar(perfil: Perfil) {
    tokens[perfil] = null;
    try { localStorage.removeItem(INDICIO[perfil]); } catch { /* modo privado */ }
  },
  temIndicio(perfil: Perfil): boolean {
    try { return localStorage.getItem(INDICIO[perfil]) === '1'; } catch { return false; }
  },
};

/** Origem da API (sem /api): usada para montar o endereço das imagens enviadas pelos usuários. */
export const API_ORIGIN = BASE_URL.replace(/\/api$/, '');

/** Imagens enviadas ficam na API (caminho começa com "/"); links externos passam direto. */
export function imgSrc(url?: string): string | undefined {
  if (!url) return undefined;
  return url.startsWith('/') ? `${API_ORIGIN}${url}` : url;
}

export class ApiError extends Error {
  status: number;
  codigo?: string;
  constructor(message: string, status: number, codigo?: string) {
    super(message);
    this.status = status;
    this.codigo = codigo;
  }
}

type Opts = { method?: string; body?: unknown; auth?: Perfil | false };

const ROTA_PERFIL: Record<Perfil, string> = { admin: 'auth', cliente: 'clientes' };
const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface RenovarResp { token: string; admin?: UsuarioAdmin; barbearia?: Barbearia; cliente?: Cliente }
const renovando: Partial<Record<Perfil, Promise<RenovarResp | null>>> = {};

/**
 * Troca o cookie httpOnly por um novo access token. Só UMA renovação por vez por perfil
 * (várias requisições que expiram juntas compartilham o mesmo pedido).
 * Retorna os dados da sessão, ou null se não há sessão válida.
 */
export function renovar(perfil: Perfil): Promise<RenovarResp | null> {
  const emAndamento = renovando[perfil];
  if (emAndamento) return emAndamento;

  const p = (async (): Promise<RenovarResp | null> => {
    try {
      for (let tentativa = 0; tentativa < 2; tentativa++) {
        const r = await fetch(`${BASE_URL}/${ROTA_PERFIL[perfil]}/refresh`, { method: 'POST', credentials: 'include' });
        if (r.ok) {
          const dados = (await r.json()) as RenovarResp;
          sessao.definir(perfil, dados.token);
          return dados;
        }
        const corpo = (await r.json().catch(() => ({}))) as { codigo?: string };
        // Outra aba renovou no mesmo instante: o cookie novo já chegou, é só tentar de novo
        if (r.status === 409 && corpo.codigo === 'REFRESH_CONCORRENTE') { await esperar(400); continue; }
        break;
      }
      sessao.limpar(perfil);
      return null;
    } catch {
      return null; // sem rede: não derruba a sessão à toa
    } finally {
      delete renovando[perfil];
    }
  })();
  renovando[perfil] = p;
  return p;
}

async function enviar(path: string, { method = 'GET', body, auth = false }: Opts): Promise<Response> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = auth ? tokens[auth] : null;
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  return fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

async function request<T>(path: string, opts: Opts = {}): Promise<T> {
  let res: Response;
  try {
    res = await enviar(path, opts);
    // Access token expirou (ou a página foi recarregada): renova pelo cookie e repete a chamada uma vez
    if (res.status === 401 && opts.auth && (await renovar(opts.auth))) res = await enviar(path, opts);
  } catch {
    throw new ApiError('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.', 0);
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Sessão realmente inválida: o AppContext escuta este evento e faz logout.
    if (res.status === 401 && opts.auth) {
      sessao.limpar(opts.auth);
      window.dispatchEvent(new Event(`cortify:unauthorized:${opts.auth}`));
    }
    const d = data as { erro?: string; codigo?: string };
    throw new ApiError(d.erro ?? 'Erro inesperado. Tente novamente.', res.status, d.codigo);
  }
  return data as T;
}

/* ───────── Auth ───────── */
export interface CadastroPayload {
  nomeBarbearia: string; endereco: string; telefone: string; emailBarbearia?: string;
  horarioAbertura: string; horarioFechamento: string; diasFuncionamento: number[]; descricao?: string;
  nomeAdmin: string; emailAdmin: string; senha: string; aceiteTermos: boolean;
}
interface AuthResp { token: string; admin: UsuarioAdmin }

export const authApi = {
  login: (email: string, senha: string) => request<AuthResp>('/auth/login', { method: 'POST', body: { email, senha } }),
  /** Restaura a sessão ao abrir o site (usa o cookie httpOnly). */
  restaurar: () => renovar('admin'),
  logout: () => request<{ mensagem: string }>('/auth/logout', { method: 'POST' }),
  verificarEmail: (token: string) => request<{ mensagem: string }>('/auth/verificar-email', { method: 'POST', body: { token } }),
  reenviarVerificacao: () => request<{ mensagem: string }>('/auth/reenviar-verificacao', { method: 'POST', auth: 'admin' }),
  cadastrar: (p: CadastroPayload) => request<AuthResp & { barbearia: Barbearia }>('/auth/cadastrar', { method: 'POST', body: p }),
  perfil: () => request<{ admin: UsuarioAdmin; barbearia: Barbearia }>('/auth/perfil', { auth: 'admin' }),
  esqueciSenha: (email: string, tipo: Perfil = 'admin') =>
    request<{ mensagem: string }>(`/${tipo === 'admin' ? 'auth' : 'clientes'}/esqueci-senha`, { method: 'POST', body: { email } }),
  redefinirSenha: (token: string, novaSenha: string, tipo: Perfil = 'admin') =>
    request<{ mensagem: string }>(`/${tipo === 'admin' ? 'auth' : 'clientes'}/redefinir-senha`, { method: 'POST', body: { token, novaSenha } }),
};

/* ───────── Cliente final ───────── */
interface ClienteAuthResp { token: string; cliente: Cliente }

export const clienteApi = {
  login: (email: string, senha: string) => request<ClienteAuthResp>('/clientes/login', { method: 'POST', body: { email, senha } }),
  restaurar: () => renovar('cliente'),
  logout: () => request<{ mensagem: string }>('/clientes/logout', { method: 'POST' }),
  verificarEmail: (token: string) => request<{ mensagem: string }>('/clientes/verificar-email', { method: 'POST', body: { token } }),
  reenviarVerificacao: () => request<{ mensagem: string }>('/clientes/reenviar-verificacao', { method: 'POST', auth: 'cliente' }),
  /** LGPD: portabilidade e exclusão */
  exportarDados: () => request<unknown>('/clientes/meus-dados', { auth: 'cliente' }),
  excluirConta: (senha: string) => request<{ mensagem: string }>('/clientes/conta', { method: 'DELETE', body: { senha }, auth: 'cliente' }),
  cadastrar: (p: { nome: string; email: string; telefone: string; senha: string; aceiteTermos: boolean }) =>
    request<ClienteAuthResp>('/clientes/cadastrar', { method: 'POST', body: p }),
  perfil: () => request<{ cliente: Cliente }>('/clientes/perfil', { auth: 'cliente' }),
  atualizarPerfil: (dados: { nome?: string; telefone?: string }) =>
    request<{ cliente: Cliente }>('/clientes/perfil', { method: 'PUT', body: dados, auth: 'cliente' }),
  agendamentos: () => request<AgendamentoCriado[]>('/clientes/agendamentos', { auth: 'cliente' }),
};

/* ───────── Público ───────── */
export const publicApi = {
  barbearias: () => request<Barbearia[]>('/barbearias'),
  barbearia: (id: string) => request<Barbearia>(`/barbearias/${id}`),
  servicos: (barbeariaId: string) => request<Servico[]>(`/servicos/barbearia/${barbeariaId}`),
  barbeiros: (barbeariaId: string) => request<Barbeiro[]>(`/barbeiros/barbearia/${barbeariaId}`),
  horarios: (p: { barbeariaId: string; barbeiroId: string; servicoId: string; data: string }) =>
    request<{ horarios: string[] }>(`/barbeiros/horarios-disponiveis?${new URLSearchParams(p)}`),
  /** Exige cliente logado; nome/telefone/e-mail vêm da conta no servidor. */
  criarAgendamento: (p: { barbeariaId: string; barbeiroId: string; servicoId: string; data: string; horario: string }) =>
    request<{ agendamento: AgendamentoCriado }>('/agendamentos', { method: 'POST', body: p, auth: 'cliente' }),
};

/* ───────── Admin (token + isolamento por barbearia no servidor) ───────── */
export const adminApi = {
  agendamentos: (barbeariaId: string) => request<Agendamento[]>(`/agendamentos/barbearia/${barbeariaId}`, { auth: 'admin' }),
  atualizarStatus: (id: string, status: StatusAgendamento) =>
    request<Agendamento>(`/agendamentos/${id}/status`, { method: 'PATCH', body: { status }, auth: 'admin' }),

  atualizarBarbearia: (id: string, dados: Partial<Barbearia>) =>
    request<Barbearia>(`/barbearias/${id}`, { method: 'PUT', body: dados, auth: 'admin' }),

  /** `imagem` = data URL JPEG/PNG/WebP já comprimida (ver utils/imagem.ts). */
  enviarCapa: (id: string, imagem: string) =>
    request<Barbearia>(`/barbearias/${id}/imagem`, { method: 'PUT', body: { imagem }, auth: 'admin' }),
  enviarFotoBarbeiro: (id: string, imagem: string) =>
    request<Barbeiro>(`/barbeiros/${id}/foto`, { method: 'PUT', body: { imagem }, auth: 'admin' }),

  criarBarbeiro: (dados: Partial<Barbeiro>) => request<Barbeiro>('/barbeiros', { method: 'POST', body: dados, auth: 'admin' }),
  atualizarBarbeiro: (id: string, dados: Partial<Barbeiro>) =>
    request<Barbeiro>(`/barbeiros/${id}`, { method: 'PUT', body: dados, auth: 'admin' }),
  desativarBarbeiro: (id: string) => request<{ mensagem: string }>(`/barbeiros/${id}`, { method: 'DELETE', auth: 'admin' }),

  criarServico: (dados: Partial<Servico>) => request<Servico>('/servicos', { method: 'POST', body: dados, auth: 'admin' }),
  removerServico: (id: string) => request<{ mensagem: string }>(`/servicos/${id}`, { method: 'DELETE', auth: 'admin' }),
};

/* ───────── Chat cliente ↔ barbearia (atualização por polling) ───────── */
const qs = (depois?: string) => (depois ? `?depois=${encodeURIComponent(depois)}` : '');

export const chatApi = {
  cliente: {
    conversas: () => request<ConversaCliente[]>('/chat/conversas', { auth: 'cliente' }),
    iniciar: (barbeariaId: string) => request<ConversaCliente>('/chat/conversas', { method: 'POST', body: { barbeariaId }, auth: 'cliente' }),
    mensagens: (id: string, depois?: string) => request<Mensagem[]>(`/chat/conversas/${id}/mensagens${qs(depois)}`, { auth: 'cliente' }),
    enviar: (id: string, texto: string) => request<Mensagem>(`/chat/conversas/${id}/mensagens`, { method: 'POST', body: { texto }, auth: 'cliente' }),
  },
  admin: {
    conversas: () => request<ConversaAdmin[]>('/chat/admin/conversas', { auth: 'admin' }),
    naoLidas: () => request<{ total: number }>('/chat/admin/nao-lidas', { auth: 'admin' }),
    mensagens: (id: string, depois?: string) => request<Mensagem[]>(`/chat/admin/conversas/${id}/mensagens${qs(depois)}`, { auth: 'admin' }),
    enviar: (id: string, texto: string) => request<Mensagem>(`/chat/admin/conversas/${id}/mensagens`, { method: 'POST', body: { texto }, auth: 'admin' }),
  },
};
