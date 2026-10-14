import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { PageView, Agendamento } from '@/types';
import { mockAgendamentos } from '@/data/mockData';

interface AppState {
  view: PageView;
  navigate: (view: PageView) => void;
  agendamentos: Agendamento[];
  adicionarAgendamento: (ag: Agendamento) => void;
  adminLogado: boolean;
  adminBarbeariaId: string | null;
  adminNome: string | null;
  setAdminLogado: (logado: boolean, barbeariaId?: string, nome?: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<PageView>({ name: 'home' });
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(mockAgendamentos);
  const [adminLogado, setAdminLogadoState] = useState(false);
  const [adminBarbeariaId, setAdminBarbeariaId] = useState<string | null>(null);
  const [adminNome, setAdminNome] = useState<string | null>(null);

  const navigate = useCallback((v: PageView) => {
    setView(v);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const adicionarAgendamento = useCallback((ag: Agendamento) => {
    setAgendamentos((prev) => [...prev, ag]);
  }, []);

  const setAdminLogado = useCallback((logado: boolean, barbeariaId?: string, nome?: string) => {
    setAdminLogadoState(logado);
    if (logado && barbeariaId) {
      setAdminBarbeariaId(barbeariaId);
      setAdminNome(nome || null);
    } else {
      setAdminBarbeariaId(null);
      setAdminNome(null);
    }
  }, []);

  return (
    <AppContext.Provider value={{ view, navigate, agendamentos, adicionarAgendamento, adminLogado, adminBarbeariaId, adminNome, setAdminLogado }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp deve ser usado dentro de AppProvider');
  return ctx;
}
