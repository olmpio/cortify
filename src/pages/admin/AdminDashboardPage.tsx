import { useAdmin } from '@/context/AppContext';
import { adminApi, publicApi, chatApi } from '@/services/api';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { AvisoEmail } from '@/components/AvisoEmail';
import { useApiData } from '@/hooks/useApiData';
import { Loading, ErrorBox } from '@/components/Feedback';
import { formatPreco, hojeISO, statusClasses } from '@/utils/helpers';
import { Scissors, Users, Calendar, TrendingUp, Clock, LogOut, Store, Settings, ListChecks, MessageCircle } from 'lucide-react';
import type { PageView } from '@/types';

export function AdminDashboardPage() {
  const { navigate, admin, barbearia, barbeariaId, logout } = useAdmin();
  const adminNome = admin.nome;

  const { data, loading, erro, reload } = useApiData(
    () =>
      Promise.all([
        adminApi.agendamentos(barbeariaId),
        publicApi.barbeiros(barbeariaId),
        chatApi.admin.naoLidas().catch(() => ({ total: 0 })), // o painel não quebra se o contador falhar
      ]),
    [barbeariaId]
  );

  if (loading) return <Loading />;
  if (erro || !data) return <ErrorBox mensagem={erro ?? 'Erro ao carregar o painel.'} onRetry={reload} />;

  const [agendamentos, barbeiros, naoLidas] = data;
  const hoje = hojeISO();

  const agsHoje = agendamentos.filter((a) => a.data === hoje && a.status !== 'cancelado');
  const agsTotais = agendamentos.filter((a) => a.status !== 'cancelado');
  const faturamento = agsTotais.reduce((sum, a) => sum + (a.servicoId?.preco || 0), 0);

  const menuItems: { label: string; icon: typeof Store; view: PageView; badge?: number }[] = [
    { label: 'Minha Barbearia', icon: Store, view: { name: 'admin-barbearia' } },
    { label: 'Barbeiros', icon: Users, view: { name: 'admin-barbeiros' } },
    { label: 'Serviços', icon: Scissors, view: { name: 'admin-servicos' } },
    { label: 'Agenda', icon: Calendar, view: { name: 'admin-agenda' } },
    { label: 'Mensagens', icon: MessageCircle, view: { name: 'admin-mensagens' }, badge: naoLidas.total },
  ];

  const stats = [
    { label: 'Agendamentos Hoje', value: agsHoje.length.toString(), icon: Calendar, color: 'text-amber-500' },
    { label: 'Total de Agendamentos', value: agsTotais.length.toString(), icon: TrendingUp, color: 'text-green-500' },
    { label: 'Barbeiros Ativos', value: barbeiros.length.toString(), icon: Users, color: 'text-blue-500' },
    { label: 'Faturamento Total', value: formatPreco(faturamento), icon: Scissors, color: 'text-amber-500' },
  ];

  return (
    <div className="min-h-screen bg-stone-950 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-stone-900 border-r border-stone-800 flex flex-col flex-shrink-0 hidden md:flex">
        <div className="p-6 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Scissors className="h-6 w-6 text-amber-500" />
            <div>
              <p className="text-white font-bold text-sm">BarberSync</p>
              <p className="text-stone-500 text-xs">Painel Admin</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => navigate({ name: 'admin-dashboard' })}
            className="w-full text-left px-4 py-2.5 rounded-xl bg-amber-500/10 text-amber-500 font-semibold text-sm flex items-center gap-3"
          >
            <ListChecks className="h-4 w-4" /> Dashboard
          </button>
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.view)}
              className="w-full text-left px-4 py-2.5 rounded-xl text-stone-400 hover:bg-stone-800 hover:text-white font-medium text-sm flex items-center gap-3 transition-colors"
            >
              <item.icon className="h-4 w-4" /> {item.label}
              {item.badge ? (
                <span className="ml-auto bg-amber-500 text-stone-950 text-[11px] font-bold min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center">{item.badge}</span>
              ) : null}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-stone-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-700/10 flex items-center justify-center text-amber-500 font-bold text-sm border border-amber-500/20">
              {adminNome.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{adminNome}</p>
              <p className="text-stone-500 text-xs truncate">{barbearia.nome}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate({ name: 'home' }); }}
            className="w-full text-left px-4 py-2 rounded-xl text-stone-500 hover:text-red-400 font-medium text-sm flex items-center gap-3 transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Top bar (mobile) */}
        <div className="md:hidden bg-stone-900 border-b border-stone-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="h-5 w-5 text-amber-500" />
            <span className="text-white font-bold text-sm">BarberSync Admin</span>
          </div>
          <button onClick={() => { logout(); navigate({ name: 'home' }); }} className="text-stone-500">
            <LogOut className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex gap-2 px-4 py-3 bg-stone-900/50 border-b border-stone-800 overflow-x-auto">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.view)}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-stone-800 text-stone-400 text-xs font-medium flex items-center gap-1.5"
            >
              <item.icon className="h-3.5 w-3.5" /> {item.label}
              {item.badge ? <span className="bg-amber-500 text-stone-950 text-[10px] font-bold px-1.5 rounded-full">{item.badge}</span> : null}
            </button>
          ))}
        </div>

        <div className="p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-stone-400 text-sm mt-1">Bem-vindo, {adminNome.split(' ')[0]}! Aqui está o resumo de {barbearia.nome}.</p>
            {!admin.emailVerificado && (
              <div className="mt-4"><AvisoEmail perfil="admin" email={admin.email} /></div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-stone-900 rounded-2xl border border-stone-800 p-5">
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-stone-500 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Agendamentos de hoje */}
          <div className="bg-stone-900 rounded-2xl border border-stone-800 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-bold text-white">Agendamentos de Hoje</h2>
            </div>
            {agsHoje.length === 0 ? (
              <p className="text-stone-500 text-sm py-8 text-center">Nenhum agendamento para hoje.</p>
            ) : (
              <div className="space-y-2">
                {agsHoje.sort((a, b) => a.horario.localeCompare(b.horario)).map((ag) => {
                  return (
                    <div key={ag._id} className="flex items-center gap-4 bg-stone-800/50 rounded-xl p-3">
                      <div className="text-center flex-shrink-0 w-16">
                        <p className="text-amber-500 font-bold text-lg">{ag.horario}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm">{ag.clienteNome}</p>
                        <p className="text-stone-400 text-xs">{ag.servicoId?.nome} · {ag.barbeiroId?.nome}</p>
                      </div>
                      <WhatsAppButton telefone={ag.clienteTelefone} />
                      <span className={`text-xs px-2 py-1 rounded-md flex-shrink-0 ${statusClasses[ag.status]}`}>
                        {ag.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Atalhos */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.view)}
                className="bg-stone-900 rounded-2xl border border-stone-800 hover:border-amber-500/40 p-5 transition-all group text-left"
              >
                <item.icon className="h-6 w-6 text-amber-500 mb-3" />
                <p className="text-white font-semibold text-sm group-hover:text-amber-500 transition-colors">{item.label}</p>
                <p className="text-stone-500 text-xs mt-0.5">Gerenciar</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
