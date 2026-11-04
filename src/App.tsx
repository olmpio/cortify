import { AppProvider, useApp } from '@/context/AppContext';
import { Loading } from '@/components/Feedback';
import { VIEWS_PRIVADAS, VIEWS_CLIENTE } from '@/types';
import { HomePage } from '@/pages/HomePage';
import { BarbeariasPage } from '@/pages/BarbeariasPage';
import { BarbeariaDetailPage } from '@/pages/BarbeariaDetailPage';
import { AgendamentoServicoPage } from '@/pages/AgendamentoServicoPage';
import { AgendamentoBarbeiroPage } from '@/pages/AgendamentoBarbeiroPage';
import { AgendamentoConfirmacaoPage } from '@/pages/AgendamentoConfirmacaoPage';
import { AgendamentoSucessoPage } from '@/pages/AgendamentoSucessoPage';
import { ClienteAcessoPage } from '@/pages/ClienteAcessoPage';
import { ClienteAgendamentosPage } from '@/pages/ClienteAgendamentosPage';
import { ClienteChatPage } from '@/pages/ClienteChatPage';
import { ClienteVerificacaoPendentePage } from '@/pages/ClienteVerificacaoPendentePage';
import { VerificarEmailPage } from '@/pages/VerificarEmailPage';
import { LegalPage } from '@/pages/LegalPage';
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage';
import { AdminCadastroPage } from '@/pages/admin/AdminCadastroPage';
import { AdminEsqueciSenhaPage } from '@/pages/admin/AdminEsqueciSenhaPage';
import { AdminRedefinirSenhaPage } from '@/pages/admin/AdminRedefinirSenhaPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminBarbeariaPage } from '@/pages/admin/AdminBarbeariaPage';
import { AdminBarbeirosPage } from '@/pages/admin/AdminBarbeirosPage';
import { AdminServicosPage } from '@/pages/admin/AdminServicosPage';
import { AdminAgendaPage } from '@/pages/admin/AdminAgendaPage';
import { AdminMensagensPage } from '@/pages/admin/AdminMensagensPage';

function Router() {
  const { view, admin, sessaoCarregando, cliente, clienteCarregando } = useApp();

  // Rotas privadas: sem login => tela de login; restaurando sessão => loading.
  if (VIEWS_PRIVADAS.includes(view.name)) {
    if (sessaoCarregando) return <Loading />;
    if (!admin) return <AdminLoginPage />;
  }

  // Agendar (e ver o histórico) exige conta de cliente: visitantes veem a tela de acesso
  // e, depois de entrar, caem exatamente na tela que queriam abrir.
  if (VIEWS_CLIENTE.includes(view.name)) {
    if (clienteCarregando) return <Loading />;
    if (!cliente) return <ClienteAcessoPage destino={view} />;
    // Agendar e conversar exigem e-mail confirmado (anti-abuso: ninguém cadastra o e-mail de outra pessoa para enviar spam a ela)
    if (!cliente.emailVerificado && view.name !== 'cliente-agendamentos') return <ClienteVerificacaoPendentePage />;
  }

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
      return <AgendamentoSucessoPage />;
    case 'cliente-acesso':
      return <ClienteAcessoPage modoInicial={view.modo} />;
    case 'cliente-esqueci-senha':
      return <AdminEsqueciSenhaPage tipo="cliente" />;
    case 'cliente-redefinir-senha':
      return <AdminRedefinirSenhaPage token={view.token} tipo="cliente" />;
    case 'cliente-agendamentos':
      return <ClienteAgendamentosPage />;
    case 'cliente-chat':
      return <ClienteChatPage barbeariaId={view.barbeariaId} />;
    case 'verificar-email':
      return <VerificarEmailPage token={view.token} tipo={view.tipo} />;
    case 'legal':
      return <LegalPage documento={view.documento} />;
    case 'admin-login':
      // quem já está logado vai direto ao painel
      return admin ? <AdminDashboardPage /> : <AdminLoginPage />;
    case 'admin-cadastro':
      return <AdminCadastroPage />;
    case 'admin-esqueci-senha':
      return <AdminEsqueciSenhaPage />;
    case 'admin-redefinir-senha':
      return <AdminRedefinirSenhaPage token={view.token} />;
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
    case 'admin-mensagens':
      return <AdminMensagensPage />;
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
