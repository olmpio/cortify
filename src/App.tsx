import { AppProvider, useApp } from '@/context/AppContext';
import { HomePage } from '@/pages/HomePage';
import { BarbeariasPage } from '@/pages/BarbeariasPage';
import { BarbeariaDetailPage } from '@/pages/BarbeariaDetailPage';
import { AgendamentoServicoPage } from '@/pages/AgendamentoServicoPage';
import { AgendamentoBarbeiroPage } from '@/pages/AgendamentoBarbeiroPage';
import { AgendamentoConfirmacaoPage } from '@/pages/AgendamentoConfirmacaoPage';
import { AgendamentoSucessoPage } from '@/pages/AgendamentoSucessoPage';
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminBarbeariaPage } from '@/pages/admin/AdminBarbeariaPage';
import { AdminBarbeirosPage } from '@/pages/admin/AdminBarbeirosPage';
import { AdminServicosPage } from '@/pages/admin/AdminServicosPage';
import { AdminAgendaPage } from '@/pages/admin/AdminAgendaPage';

function Router() {
  const { view } = useApp();

  switch (view.name) {
    case 'home':
      return <HomePage />;
    case 'barbearias':
      return <BarbeariasPage />;
    case 'barbearia-detail':
      return <BarbeariaDetailPage barbeariaId={view.barbeariaId} />;
    case 'agendamento-servico':
      return <AgendamentoServicoPage barbeariaId={view.barbeariaId} />;
    case 'agendamento-barbeiro':
      return <AgendamentoBarbeiroPage barbeariaId={view.barbeariaId} servicoId={view.servicoId} />;
    case 'agendamento-confirmacao':
      return (
        <AgendamentoConfirmacaoPage
          barbeariaId={view.barbeariaId}
          servicoId={view.servicoId}
          barbeiroId={view.barbeiroId}
          data={view.data}
          horario={view.horario}
        />
      );
    case 'agendamento-sucesso':
      return <AgendamentoSucessoPage agendamentoId={view.agendamentoId} />;
    case 'admin-login':
      return <AdminLoginPage />;
    case 'admin-dashboard':
      return <AdminDashboardPage />;
    case 'admin-barbearia':
      return <AdminBarbeariaPage />;
    case 'admin-barbeiros':
      return <AdminBarbeirosPage />;
    case 'admin-servicos':
      return <AdminServicosPage />;
    case 'admin-agenda':
      return <AdminAgendaPage />;
    default:
      return <HomePage />;
  }
}

function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}

export default App;
