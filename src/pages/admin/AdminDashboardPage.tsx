import { useApp } from '@/context/AppContext';
import { getBarbeariaById, getBarbeirosByBarbearia, getServicosByBarbearia, getAgendamentosByBarbearia, formatPreco } from '@/utils/helpers';
import { Scissors, Users, Calendar, TrendingUp, Clock, LogOut, Store, Settings, ListChecks } from 'lucide-react';
import type { PageView } from '@/types';

export function AdminDashboardPage() {
  const { navigate, adminBarbeariaId, adminNome, adminLogado, setAdminLogado, agendamentos } = useApp();

  if (!adminLogado || !adminBarbeariaId) {
    navigate({ name: 'admin-login' });
    return null;
  }

  const barbearia = getBarbeariaById(adminBarbeariaId);
  const barbeiros = getBarbeirosByBarbearia(adminBarbeariaId);
  const servicos = getServicosByBarbearia(adminBarbeariaId);

  const agsHoje = agendamentos.filter((a) => {
    const hoje = new Date().toISOString().split('T')[0];
    return a.barbeariaId === adminBarbeariaId && a.data === hoje && a.status !== 'cancelado';
  });

  const agsTotais = agendamentos.filter((a) => a.barbeariaId === adminBarbeariaId && a.status !== 'cancelado');
  const faturamento = agsTotais.reduce((sum, a) => {
    const s = servicos.find((sv) => sv._id === a.servicoId);
    return sum + (s?.preco || 0);
  }, 0);

  const menuItems: { label: string; icon: typeof Store; view: PageView }[] = [
    { label: 'Minha Barbearia', icon: Store, view: { name: 'admin-barbearia' } },
    { label: 'Barbeiros', icon: Users, view: { name: 'admin-barbeiros' } },
    { label: 'Serviços', icon: Scissors, view: { name: 'admin-servicos' } },
    { label: 'Agenda', icon: Calendar, view: { name: 'admin-agenda' } },
  ];

  const stats = [
    { label: 'Agendamentos Hoje', value: agsHoje.length.toString(), icon: Calendar, color: 'text-amber-500' },
    { label: 'Total de Agendamentos', value: agsTotais.length.toString(), icon: TrendingUp, color: 'text-green-500' },
    { label: 'Barbeiros Ativos', value: barbeiros.filter((b) => b.ativo).length.toString(), icon: Users, color: 'text-blue-500' },
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
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-stone-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-700/10 flex items-center justify-center text-amber-500 font-bold text-sm border border-amber-500/20">
              {adminNome?.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{adminNome}</p>
              <p className="text-stone-500 text-xs truncate">{barbearia?.nome}</p>
            </div>
          </div>
          <button
            onClick={() => { setAdminLogado(false); navigate({ name: 'home' }); }}
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
          <button onClick={() => { setAdminLogado(false); navigate({ name: 'home' }); }} className="text-stone-500">
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
            </button>
          ))}
        </div>

        <div className="p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-stone-400 text-sm mt-1">Bem-vindo, {adminNome?.split(' ')[0]}! Aqui está o resumo de {barbearia?.nome}.</p>
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
                  const barbeiro = barbeiros.find((b) => b._id === ag.barbeiroId);
                  const servico = servicos.find((s) => s._id === ag.servicoId);
                  return (
                    <div key={ag._id} className="flex items-center gap-4 bg-stone-800/50 rounded-xl p-3">
                      <div className="text-center flex-shrink-0 w-16">
                        <p className="text-amber-500 font-bold text-lg">{ag.horario}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm">{ag.clienteNome}</p>
                        <p className="text-stone-400 text-xs">{servico?.nome} · {barbeiro?.nome}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-md flex-shrink-0 ${
                        ag.status === 'confirmado' ? 'bg-green-500/10 text-green-500' :
                        ag.status === 'pendente' ? 'bg-amber-500/10 text-amber-500' :
                        ag.status === 'concluido' ? 'bg-blue-500/10 text-blue-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
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
