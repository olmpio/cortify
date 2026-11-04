import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { publicApi } from '@/services/api';
import { Avatar } from '@/components/Avatar';
import { useApiData } from '@/hooks/useApiData';
import { Loading, ErrorBox } from '@/components/Feedback';
import {
  getProximosDias, formatPreco, formatDuracao, getDiaSemana, formatDate,
} from '@/utils/helpers';
import { ArrowLeft, Clock, Scissors, Calendar, User, Check } from 'lucide-react';

export function AgendamentoBarbeiroPage({ barbeariaId, servicoId }: { barbeariaId: string; servicoId: string }) {
  const { navigate } = useApp();
  const base = useApiData(
    () => Promise.all([publicApi.barbearia(barbeariaId), publicApi.servicos(barbeariaId), publicApi.barbeiros(barbeariaId)]),
    [barbeariaId]
  );
  const dias = getProximosDias(14);
  const [dataSelecionada, setDataSelecionada] = useState(dias[0].iso);
  const [barbeiroSelecionado, setBarbeiroSelecionado] = useState<string | null>(null);

  // Horários livres calculados pelo servidor (considera agendamentos reais, folgas e horário atual)
  const horariosQ = useApiData(
    () =>
      barbeiroSelecionado
        ? publicApi.horarios({ barbeariaId, barbeiroId: barbeiroSelecionado, servicoId, data: dataSelecionada })
        : Promise.resolve({ horarios: [] as string[] }),
    [barbeiroSelecionado, dataSelecionada, barbeariaId, servicoId]
  );

  if (base.loading) return <Loading />;
  if (base.erro || !base.data) return <ErrorBox mensagem={base.erro ?? 'Dados não encontrados.'} onRetry={base.reload} />;

  const [barbearia, servicos, barbeiros] = base.data;
  const servico = servicos.find((s) => s._id === servicoId);
  const todosBarbeiros = barbeiros.filter((b) => b.ativo);

  if (!servico) return <ErrorBox mensagem="Serviço não encontrado." />;

  const horariosDisponiveis = horariosQ.data?.horarios ?? [];

  return (
    <div className="min-h-screen bg-stone-950">
      <div className="border-b border-stone-800 bg-stone-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate({ name: 'agendamento-servico', barbeariaId })} className="text-stone-400 hover:text-amber-500 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <p className="text-stone-500 text-xs">Passo 2 de 3 — Agendamento</p>
            <p className="text-white font-semibold text-sm">{barbearia.nome} · {servico.nome}</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mx-auto max-w-5xl px-4 pt-6">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-amber-500 rounded-full" />
          <div className="flex-1 h-1.5 bg-amber-500 rounded-full" />
          <div className="flex-1 h-1.5 bg-stone-800 rounded-full" />
        </div>
        <div className="flex justify-between mt-2 text-xs">
          <span className="text-amber-500 font-semibold">Serviço</span>
          <span className="text-amber-500 font-semibold">Barbeiro & Horário</span>
          <span className="text-stone-600">Confirmação</span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Resumo do serviço */}
        <div className="bg-stone-900 rounded-xl border border-stone-800 p-4 flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <Scissors className="h-5 w-5 text-amber-500" />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold">{servico.nome}</p>
            <p className="text-stone-400 text-sm">{servico.categoria}</p>
          </div>
          <div className="text-right">
            <p className="text-amber-500 font-bold">{formatPreco(servico.preco)}</p>
            <p className="text-stone-500 text-xs flex items-center gap-1 justify-end mt-0.5">
              <Clock className="h-3 w-3" /> {formatDuracao(servico.duracaoMinutos)}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Coluna esquerda: data + barbeiro */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-500" /> Escolha a Data
            </h2>
            <div className="grid grid-cols-7 gap-2 mb-6">
              {dias.map((d) => {
                const funcionamentoOk = barbearia.diasFuncionamento.includes(d.diaSemana);
                return (
                  <button
                    key={d.iso}
                    disabled={!funcionamentoOk}
                    onClick={() => { setDataSelecionada(d.iso); setBarbeiroSelecionado(null); }}
                    className={`flex flex-col items-center py-2.5 rounded-lg border transition-all ${
                      dataSelecionada === d.iso
                        ? 'bg-amber-500 text-stone-950 border-amber-500 font-bold'
                        : funcionamentoOk
                        ? 'bg-stone-900 text-stone-300 border-stone-800 hover:border-amber-500/40'
                        : 'bg-stone-900/50 text-stone-700 border-stone-800/50 cursor-not-allowed'
                    }`}
                  >
                    <span className="text-xs">{d.label}</span>
                    <span className="text-sm font-semibold mt-0.5">{d.dia}</span>
                    <span className="text-[10px] opacity-70">{d.mes}</span>
                  </button>
                );
              })}
            </div>

            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-amber-500" /> Escolha o Barbeiro
            </h2>
            <div className="space-y-2">
              {todosBarbeiros.map((b) => {
                const folga = b.diasFolga.includes(new Date(dataSelecionada + 'T00:00:00').getDay());
                return (
                  <button
                    key={b._id}
                    disabled={folga}
                    onClick={() => setBarbeiroSelecionado(b._id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${
                      barbeiroSelecionado === b._id
                        ? 'bg-amber-500/10 border-amber-500'
                        : folga
                        ? 'bg-stone-900/50 border-stone-800/50 opacity-40 cursor-not-allowed'
                        : 'bg-stone-900 border-stone-800 hover:border-amber-500/40'
                    }`}
                  >
                    <Avatar nome={b.nome} foto={b.avatarUrl} tamanho="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm">{b.nome}</p>
                      <p className="text-stone-500 text-xs">{folga ? 'De folga neste dia' : `${b.horarioInicio}–${b.horarioFim}`}</p>
                    </div>
                    {barbeiroSelecionado === b._id && <Check className="h-5 w-5 text-amber-500 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Coluna direita: horários */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" /> Horários Disponíveis
            </h2>
            {!barbeiroSelecionado ? (
              <div className="bg-stone-900 rounded-xl border border-stone-800 p-8 text-center">
                <User className="h-10 w-10 text-stone-700 mx-auto mb-3" />
                <p className="text-stone-500 text-sm">Selecione um barbeiro para ver os horários disponíveis</p>
              </div>
            ) : horariosQ.loading ? (
              <Loading fullScreen={false} label="Buscando horários..." />
            ) : horariosQ.erro ? (
              <ErrorBox mensagem={horariosQ.erro} onRetry={horariosQ.reload} fullScreen={false} />
            ) : horariosDisponiveis.length === 0 ? (
              <div className="bg-stone-900 rounded-xl border border-stone-800 p-8 text-center">
                <Calendar className="h-10 w-10 text-stone-700 mx-auto mb-3" />
                <p className="text-stone-500 text-sm">Não há horários disponíveis para este barbeiro neste dia.</p>
                <p className="text-stone-600 text-xs mt-2">Tente outro barbeiro ou data.</p>
              </div>
            ) : (
              <>
                <p className="text-stone-400 text-sm mb-3">
                  {getDiaSemana(dataSelecionada)}, {formatDate(dataSelecionada)}
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-96 overflow-y-auto pr-1">
                  {horariosDisponiveis.map((h) => (
                    <button
                      key={h}
                      onClick={() => navigate({ name: 'agendamento-confirmacao', barbeariaId, servicoId, barbeiroId: barbeiroSelecionado, data: dataSelecionada, horario: h })}
                      className="bg-stone-900 hover:bg-amber-500 hover:text-stone-950 text-stone-300 font-semibold text-sm py-2.5 rounded-lg border border-stone-800 hover:border-amber-500 transition-all"
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
