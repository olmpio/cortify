export interface Barbearia {
  _id: string;
  nome: string;
  endereco: string;
  telefone: string;
  email: string;
  horarioAbertura: string;
  horarioFechamento: string;
  diasFuncionamento: number[];
  descricao?: string;
  imagemUrl?: string;
  createdAt: string;
  /** Preenchidos apenas pela listagem GET /barbearias */
  precoMinimo?: number | null;
  totalBarbeiros?: number;
}

export interface UsuarioAdmin {
  id: string;
  nome: string;
  email: string;
  barbeariaId: string;
  emailVerificado: boolean;
}

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  emailVerificado: boolean;
}

export interface Barbeiro {
  _id: string;
  nome: string;
  barbeariaId: string;
  especialidades: string[];
  horarioInicio: string;
  horarioFim: string;
  diasFolga: number[];
  avatarUrl?: string;
  ativo: boolean;
}

export interface Servico {
  _id: string;
  nome: string;
  descricao: string;
  preco: number;
  duracaoMinutos: number;
  barbeariaId: string;
  categoria: string;
}

export type StatusAgendamento = 'pendente' | 'confirmado' | 'concluido' | 'cancelado';

/** Agendamento como a API devolve na listagem do admin (barbeiro e serviço populados). */
export interface Agendamento {
  _id: string;
  barbeariaId: string;
  barbeiroId: { _id: string; nome: string };
  servicoId: { _id: string; nome: string; preco: number; duracaoMinutos: number };
  clienteNome: string;
  clienteTelefone: string;
  clienteEmail: string;
  data: string;
  horario: string;
  status: StatusAgendamento;
  createdAt: string;
}

/** Agendamento recém-criado (barbearia também populada). */
export interface AgendamentoCriado extends Omit<Agendamento, 'barbeariaId'> {
  barbeariaId: { _id: string; nome: string; endereco: string; telefone?: string };
}

export interface Mensagem {
  _id: string;
  conversaId: string;
  de: 'cliente' | 'barbearia';
  texto: string;
  createdAt: string;
}

/** Conversa vista pelo cliente (a "outra ponta" é a barbearia). */
export interface ConversaCliente {
  _id: string;
  barbeariaId: { _id: string; nome: string; imagemUrl?: string };
  ultimaMensagem: string;
  ultimaMensagemEm: string;
  naoLidasCliente: number;
}

/** Conversa vista pela barbearia (a "outra ponta" é o cliente). */
export interface ConversaAdmin {
  _id: string;
  clienteId: { _id: string; nome: string; telefone: string; email: string };
  ultimaMensagem: string;
  ultimaMensagemEm: string;
  naoLidasBarbearia: number;
}

export type PageView =
  | { name: 'home' }
  | { name: 'barbearias' }
  | { name: 'barbearia-detail'; barbeariaId: string }
  | { name: 'agendamento-servico'; barbeariaId: string }
  | { name: 'agendamento-barbeiro'; barbeariaId: string; servicoId: string }
  | { name: 'agendamento-confirmacao'; barbeariaId: string; servicoId: string; barbeiroId: string; data: string; horario: string }
  | { name: 'agendamento-sucesso' }
  | { name: 'cliente-acesso'; modo?: 'login' | 'cadastro' }
  | { name: 'cliente-esqueci-senha' }
  | { name: 'cliente-redefinir-senha'; token: string }
  | { name: 'cliente-agendamentos' }
  | { name: 'cliente-chat'; barbeariaId?: string }
  | { name: 'verificar-email'; token: string; tipo: 'admin' | 'cliente' }
  | { name: 'legal'; documento: 'termos' | 'privacidade' }
  | { name: 'admin-login' }
  | { name: 'admin-cadastro' }
  | { name: 'admin-esqueci-senha' }
  | { name: 'admin-redefinir-senha'; token: string }
  | { name: 'admin-dashboard' }
  | { name: 'admin-barbearia' }
  | { name: 'admin-barbeiros' }
  | { name: 'admin-servicos' }
  | { name: 'admin-agenda' }
  | { name: 'admin-mensagens' };

/** Telas que exigem CLIENTE logado: todo o fluxo de agendamento + histórico. */
export const VIEWS_CLIENTE: PageView['name'][] = [
  'agendamento-servico', 'agendamento-barbeiro', 'agendamento-confirmacao', 'cliente-agendamentos', 'cliente-chat',
];

/** Telas que exigem usuário autenticado (painel da barbearia). */
export const VIEWS_PRIVADAS: PageView['name'][] = [
  'admin-dashboard', 'admin-barbearia', 'admin-barbeiros', 'admin-servicos', 'admin-agenda', 'admin-mensagens',
];
