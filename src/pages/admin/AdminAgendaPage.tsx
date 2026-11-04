import { useState } from 'react';
import { useAdmin } from '@/context/AppContext';
import { BackButton } from '@/components/BackButton';
import { adminApi } from '@/services/api';
import { useApiData } from '@/hooks/useApiData';
import { Loading, ErrorBox, FormError } from '@/components/Feedback';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { formatDateShort, formatPreco, getProximosDias, statusClasses } from '@/utils/helpers';
import type { StatusAgendamento } from '@/types';
import { Calendar, Clock, User, Scissors, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';

export function AdminAgendaPage() {
  const { barbeariaId, navigate } = useAdmin();
  const dias = getProximosDias(14);
  const [diaSelecionado, setDiaSelecionado] = useState(dias[0].iso);
  const [offset, setOffset] = useState(0);
  const [atualizando, setAtualizando] = useState<string | null>(null);
  const [erroAcao, setErroAcao] = useState('');

  const { data, loading, erro, reload } = useApiData(() => adminApi.agendamentos(barbeariaId), [barbeariaId]);

  if (loading && !data) return <Loading />;
  if (erro || !data) return <ErrorBox mensagem={erro ?? 'Erro ao carregar a agenda.'} onRetry={reload} />;

  const agendamentos = data;

  async function mudarStatus(id: string, status: StatusAgendamento, nomeCliente: string) {
    if (status === 'cancelado' && !window.confirm(`Cancelar o agendamento de ${nomeCliente}? O cliente será avisado por e-mail (se informou).`)) return;
    setAtualizando(id);
    setErroAcao('');
    try {
      await adminApi.atualizarStatus(id, status);
      reload();
    } catch (e) {
      setErroAcao((e as Error).message);
    } finally {
      setAtualizando(null);
    }
  }

  const agsDia = agendamentos
    .filter((a) => a.data === diaSelecionado && a.status !== 'cancelado')
    .sort((a, b) => a.horario.localeCompare(b.horario));

  const agsTotal = agendamentos.filter((a) => a.status !== 'cancelado');
  const diasVisiveis = dias.slice(offset, offset + 7);

  return (
    <div className="min-h-screen bg-stone-950">
      <div className="border-b border-stone-800 bg-stone-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center gap-3">
          <BackButton />
          <span className="text-white font-semibold text-sm">Agenda</span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Calendar className="h-6 w-6 text-amber-500" />
          <div>
            <h1 className="text-2xl font-bold text-white">Agenda</h1>
            <p className="text-stone-400 text-sm">Todos os agendamentos da barbearia</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-stone-900 rounded-xl border border-stone-800 p-4">
            <p className="text-2xl font-bold text-white">{agsDia.length}</p>
            <p className="text-stone-500 text-xs mt-1">Hoje Selecionado</p>
          </div>
          <div className="bg-stone-900 rounded-xl border border-stone-800 p-4">
            <p className="text-2xl font-bold text-white">{agsTotal.length}</p>
            <p className="text-stone-500 text-xs mt-1">Total</p>
          </div>
          <div className="bg-stone-900 rounded-xl border border-stone-800 p-4">
            <p className="text-2xl font-bold text-amber-500">
              {formatPreco(agsDia.reduce((sum, a) => sum + (a.servicoId?.preco || 0), 0))}
            </p>
            <p className="text-stone-500 text-xs mt-1">Faturamento do Dia</p>
          </div>
        </div>

        {/* Seletor de dia */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setOffset(Math.max(0, offset - 7))}
            disabled={offset === 0}
            className="p-2 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-amber-500 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 grid grid-cols-7 gap-2">
            {diasVisiveis.map((d) => {
              const count = agendamentos.filter((a) => a.data === d.iso && a.status !== 'cancelado').length;
              return (
                <button
                  key={d.iso}
                  onClick={() => setDiaSelecionado(d.iso)}
                  className={`flex flex-col items-center py-3 rounded-xl border transition-all ${
                    diaSelecionado === d.iso
                      ? 'bg-amber-500 text-stone-950 border-amber-500'
                      : 'bg-stone-900 text-stone-300 border-stone-800 hover:border-amber-500/40'
                  }`}
                >
                  <span className="text-xs">{d.label}</span>
                  <span className="text-lg font-bold mt-0.5">{d.dia}</span>
                  <span className={`text-xs ${diaSelecionado === d.iso ? 'text-stone-800' : 'text-stone-600'}`}>{count} ags</span>
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setOffset(Math.min(7, offset + 7))}
            disabled={offset >= 7}
            className="p-2 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-amber-500 disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <FormError mensagem={erroAcao} />

        {/* Lista de agendamentos */}
        <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden">
          <div className="p-5 border-b border-stone-800">
            <h2 className="text-lg font-bold text-white">
              {(() => {
                const [y, m, dd] = diaSelecionado.split('-').map(Number);
                return new Date(y, m - 1, dd).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
              })()}
            </h2>
          </div>
          {agsDia.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="h-10 w-10 text-stone-700 mx-auto mb-3" />
              <p className="text-stone-500 text-sm">Nenhum agendamento para este dia.</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-800">
              {agsDia.map((ag) => {
                const barbeiro = ag.barbeiroId;
                const servico = ag.servicoId;
                return (
                  <div key={ag._id} className="p-4 flex items-center gap-4 hover:bg-stone-800/30 transition-colors">
                    <div className="text-center flex-shrink-0 w-16">
                      <p className="text-amber-500 font-bold text-xl">{ag.horario}</p>
                    </div>
                    <div className="w-px h-12 bg-stone-800 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold">{ag.clienteNome}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-stone-400">
                        <span className="flex items-center gap-1"><Scissors className="h-3.5 w-3.5 text-amber-500" /> {servico?.nome}</span>
                        <span className="flex items-center gap-1"><User className="h-3.5 w-3.5 text-amber-500" /> {barbeiro?.nome}</span>
                        <span className="flex items-center gap-2">{ag.clienteTelefone} <WhatsAppButton telefone={ag.clienteTelefone} /></span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-amber-500 font-bold">{servico && formatPreco(servico.preco)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-md inline-block mt-1 ${statusClasses[ag.status]}`}>
                        {ag.status}
                      </span>
                      {(ag.status === 'confirmado' || ag.status === 'pendente') && (
                        <div className="flex gap-1.5 justify-end mt-2">
                          <button
                            disabled={atualizando === ag._id}
                            onClick={() => mudarStatus(ag._id, 'concluido', ag.clienteNome)}
                            title="Marcar como concluído"
                            className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-green-500 hover:bg-green-500/10 disabled:opacity-40 transition-colors"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            disabled={atualizando === ag._id}
                            onClick={() => mudarStatus(ag._id, 'cancelado', ag.clienteNome)}
                            title="Cancelar agendamento"
                            className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-40 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Todos os agendamentos */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-white mb-4">Todos os Agendamentos</h2>
          <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden">
            <div className="divide-y divide-stone-800">
              {[...agsTotal].sort((a, b) => b.data.localeCompare(a.data) || b.horario.localeCompare(a.horario)).map((ag) => {
                const barbeiro = ag.barbeiroId;
                const servico = ag.servicoId;
                return (
                  <div key={ag._id} className="p-4 flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <p className="text-stone-400 text-sm font-semibold">{formatDateShort(ag.data)}</p>
                      <p className="text-amber-500 font-bold">{ag.horario}</p>
                    </div>
                    <div className="w-px h-12 bg-stone-800 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm">{ag.clienteNome}</p>
                      <p className="text-stone-400 text-xs">{servico?.nome} · {barbeiro?.nome}</p>
                    </div>
                    <WhatsAppButton telefone={ag.clienteTelefone} />
                    <p className="text-amber-500 font-semibold text-sm flex-shrink-0">{servico && formatPreco(servico.preco)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
