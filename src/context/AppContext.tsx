import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { PageView, UsuarioAdmin, Barbearia, AgendamentoCriado, Cliente } from '@/types';
import { authApi, clienteApi, sessao, type CadastroPayload } from '@/services/api';

interface AppState {
  view: PageView;
  navigate: (view: PageView) => void;

  /** Usuário autenticado do painel (null = visitante) */
  admin: UsuarioAdmin | null;
  /** Barbearia do usuário autenticado */
  barbearia: Barbearia | null;
  /** true enquanto restauramos a sessão (cookie httpOnly) ao abrir o site */
  sessaoCarregando: boolean;
  login: (email: string, senha: string) => Promise<void>;
  cadastrar: (payload: CadastroPayload) => Promise<void>;
  logout: () => void;
  setBarbearia: (b: Barbearia) => void;
  /** Relê o perfil do servidor (ex.: depois de confirmar o e-mail) */
  recarregarAdmin: () => Promise<void>;

  /** Cliente final autenticado (null = visitante) */
  cliente: Cliente | null;
  clienteCarregando: boolean;
  clienteLogin: (email: string, senha: string) => Promise<void>;
  clienteCadastrar: (p: { nome: string; email: string; telefone: string; senha: string; aceiteTermos: boolean }) => Promise<void>;
  clienteLogout: () => void;
  setCliente: (c: Cliente) => void;
  recarregarCliente: () => Promise<void>;

  /** Último agendamento criado (tela de sucesso) */
  ultimoAgendamento: AgendamentoCriado | null;
  setUltimoAgendamento: (a: AgendamentoCriado) => void;
}

const AppContext = createContext<AppState | null>(null);

/**
 * Links que chegam por e-mail:
 *   ?reset=TOKEN[&tipo=cliente]     → tela de nova senha
 *   ?verificar=TOKEN&tipo=...       → confirmação de e-mail
 * O token é removido da barra de endereço (histórico/compartilhamento de tela).
 */
function viewInicial(): PageView {
  const params = new URLSearchParams(window.location.search);
  const reset = params.get('reset');
  const verificar = params.get('verificar');
  const tipo = params.get('tipo');
  if (reset || verificar) window.history.replaceState({}, '', window.location.pathname);

  if (reset) return tipo === 'cliente' ? { name: 'cliente-redefinir-senha', token: reset } : { name: 'admin-redefinir-senha', token: reset };
  if (verificar) return { name: 'verificar-email', token: verificar, tipo: tipo === 'cliente' ? 'cliente' : 'admin' };
  return { name: 'home' };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<PageView>(viewInicial);
  const [admin, setAdmin] = useState<UsuarioAdmin | null>(null);
  const [barbearia, setBarbearia] = useState<Barbearia | null>(null);
  const [sessaoCarregando, setSessaoCarregando] = useState<boolean>(() => sessao.temIndicio('admin'));
  const [ultimoAgendamento, setUltimoAgendamento] = useState<AgendamentoCriado | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [clienteCarregando, setClienteCarregando] = useState<boolean>(() => sessao.temIndicio('cliente'));

  const navigate = useCallback((v: PageView) => {
    setView(v);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const limparAdmin = useCallback(() => {
    sessao.limpar('admin');
    setAdmin(null);
    setBarbearia(null);
  }, []);

  const limparCliente = useCallback(() => {
    sessao.limpar('cliente');
    setCliente(null);
  }, []);

  const logout = useCallback(() => {
    authApi.logout().catch(() => {}); // revoga a sessão no servidor e apaga o cookie
    limparAdmin();
  }, [limparAdmin]);

  const clienteLogout = useCallback(() => {
    clienteApi.logout().catch(() => {});
    limparCliente();
  }, [limparCliente]);

  // Restaura as sessões ao abrir o site (cookie httpOnly → novo access token em memória)
  useEffect(() => {
    if (sessao.temIndicio('admin')) {
      authApi
        .restaurar()
        .then((r) => {
          if (r?.admin && r.barbearia) { setAdmin(r.admin); setBarbearia(r.barbearia); }
        })
        .finally(() => setSessaoCarregando(false));
    }
    if (sessao.temIndicio('cliente')) {
      clienteApi
        .restaurar()
        .then((r) => { if (r?.cliente) setCliente(r.cliente); })
        .finally(() => setClienteCarregando(false));
    }
  }, []);

  // Sessão realmente inválida em qualquer chamada => desloga o perfil correspondente
  useEffect(() => {
    window.addEventListener('cortify:unauthorized:admin', limparAdmin);
    window.addEventListener('cortify:unauthorized:cliente', limparCliente);
    return () => {
      window.removeEventListener('cortify:unauthorized:admin', limparAdmin);
      window.removeEventListener('cortify:unauthorized:cliente', limparCliente);
    };
  }, [limparAdmin, limparCliente]);

  const login = useCallback(async (email: string, senha: string) => {
    const { token } = await authApi.login(email, senha);
    sessao.definir('admin', token);
    const perfil = await authApi.perfil();
    setAdmin(perfil.admin);
    setBarbearia(perfil.barbearia);
  }, []);

  const cadastrar = useCallback(async (payload: CadastroPayload) => {
    const { token, admin: a, barbearia: b } = await authApi.cadastrar(payload);
    sessao.definir('admin', token);
    setAdmin(a);
    setBarbearia(b);
  }, []);

  const recarregarAdmin = useCallback(async () => {
    if (!sessao.temIndicio('admin')) return;
    const perfil = await authApi.perfil();
    setAdmin(perfil.admin);
    setBarbearia(perfil.barbearia);
  }, []);

  const clienteLogin = useCallback(async (email: string, senha: string) => {
    const { token, cliente: c } = await clienteApi.login(email, senha);
    sessao.definir('cliente', token);
    setCliente(c);
  }, []);

  const clienteCadastrar = useCallback(async (p: { nome: string; email: string; telefone: string; senha: string; aceiteTermos: boolean }) => {
    const { token, cliente: c } = await clienteApi.cadastrar(p);
    sessao.definir('cliente', token);
    setCliente(c);
  }, []);

  const recarregarCliente = useCallback(async () => {
    if (!sessao.temIndicio('cliente')) return;
    const { cliente: c } = await clienteApi.perfil();
    setCliente(c);
  }, []);

  return (
    <AppContext.Provider
      value={{
        view, navigate, admin, barbearia, sessaoCarregando, login, cadastrar, logout, setBarbearia, recarregarAdmin,
        cliente, clienteCarregando, clienteLogin, clienteCadastrar, clienteLogout, setCliente, recarregarCliente,
        ultimoAgendamento, setUltimoAgendamento,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp deve ser usado dentro de AppProvider');
  return ctx;
}

/** Para telas privadas: o Router já garante que existe um usuário logado. */
export function useAdmin() {
  const ctx = useApp();
  if (!ctx.admin || !ctx.barbearia) throw new Error('useAdmin usado sem usuário autenticado');
  return { ...ctx, admin: ctx.admin, barbearia: ctx.barbearia, barbeariaId: ctx.admin.barbeariaId };
}
