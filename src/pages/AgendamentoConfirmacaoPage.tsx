import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { publicApi, ApiError } from '@/services/api';
import { useApiData } from '@/hooks/useApiData';
import { Loading, ErrorBox, FormError } from '@/components/Feedback';
import { formatPreco, formatDuracao, formatDate, getDiaSemana } from '@/utils/helpers';
import { ArrowLeft, Scissors, User, Clock, Calendar, MapPin, Check, Loader2 } from 'lucide-react';

export function AgendamentoConfirmacaoPage({
  barbeariaId, servicoId, barbeiroId, data, horario,
}: {
  barbeariaId: string; servicoId: string; barbeiroId: string; data: string; horario: string;
}) {
  const { navigate, setUltimoAgendamento, cliente } = useApp();
  const base = useApiData(
    () => Promise.all([publicApi.barbearia(barbeariaId), publicApi.servicos(barbeariaId), publicApi.barbeiros(barbeariaId)]),
    [barbeariaId]
  );

  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState('');
  const [horarioOcupado, setHorarioOcupado] = useState(false);

  if (base.loading) return <Loading />;
  if (base.erro || !base.data) return <ErrorBox mensagem={base.erro ?? 'Dados não encontrados.'} onRetry={base.reload} />;

  const [barbearia, servicos, barbeiros] = base.data;
  const servico = servicos.find((s) => s._id === servicoId);
  const barbeiro = barbeiros.find((b) => b._id === barbeiroId);

  if (!servico || !barbeiro) return <ErrorBox mensagem="Dados não encontrados." />;

  async function confirmar() {
    if (enviando) return;
    setEnviando(true);
    setErroEnvio('');
    try {
      const { agendamento } = await publicApi.criarAgendamento({
        barbeariaId,
        barbeiroId,
        servicoId,
        data,
        horario,
      });
      setUltimoAgendamento(agendamento);
      navigate({ name: 'agendamento-sucesso' });
    } catch (e) {
      const err = e as ApiError;
      if (err.status === 401) return; // sessão expirou: o Router volta para a tela de login
      setErroEnvio(err.message);
      setHorarioOcupado(err.status === 409); // alguém reservou antes: sugerir outro horário
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-950">
      <div className="border-b border-stone-800 bg-stone-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate({ name: 'agendamento-barbeiro', barbeariaId, servicoId })} className="text-stone-400 hover:text-amber-500 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <p className="text-stone-500 text-xs">Passo 3 de 3 — Agendamento</p>
            <p className="text-white font-semibold text-sm">{barbearia.nome}</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mx-auto max-w-3xl px-4 pt-6">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-amber-500 rounded-full" />
          <div className="flex-1 h-1.5 bg-amber-500 rounded-full" />
          <div className="flex-1 h-1.5 bg-amber-500 rounded-full" />
        </div>
        <div className="flex justify-between mt-2 text-xs">
          <span className="text-amber-500 font-semibold">Serviço</span>
          <span className="text-amber-500 font-semibold">Barbeiro & Horário</span>
          <span className="text-amber-500 font-semibold">Confirmação</span>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-1">Confirme seu Agendamento</h1>
        <p className="text-stone-400 text-sm mb-8">Revise os detalhes e preencha seus dados</p>

        {/* Resumo */}
        <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5 mb-6">
          <p className="text-stone-500 text-xs uppercase tracking-wide mb-4">Resumo do Agendamento</p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Scissors className="h-5 w-5 text-amber-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-stone-500 text-xs">Serviço</p>
                <p className="text-white font-semibold">{servico.nome}</p>
              </div>
              <p className="text-amber-500 font-bold">{formatPreco(servico.preco)}</p>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-amber-500 flex-shrink-0" />
              <div>
                <p className="text-stone-500 text-xs">Barbeiro</p>
                <p className="text-white font-semibold">{barbeiro.nome}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-amber-500 flex-shrink-0" />
              <div>
                <p className="text-stone-500 text-xs">Data</p>
                <p className="text-white font-semibold">{getDiaSemana(data)}, {formatDate(data)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-amber-500 flex-shrink-0" />
              <div>
                <p className="text-stone-500 text-xs">Horário</p>
                <p className="text-white font-semibold">{horario} · {formatDuracao(servico.duracaoMinutos)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-stone-800">
              <MapPin className="h-5 w-5 text-amber-500 flex-shrink-0" />
              <div>
                <p className="text-stone-500 text-xs">Local</p>
                <p className="text-white text-sm">{barbearia.endereco}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dados do cliente (vêm da conta) */}
        <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5">
          <p className="text-stone-500 text-xs uppercase tracking-wide mb-4">Seus Dados</p>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div><p className="text-stone-500 text-xs">Nome</p><p className="text-white font-semibold">{cliente?.nome}</p></div>
            <div><p className="text-stone-500 text-xs">Telefone</p><p className="text-white font-semibold">{cliente?.telefone}</p></div>
            <div className="min-w-0"><p className="text-stone-500 text-xs">E-mail</p><p className="text-white font-semibold truncate">{cliente?.email}</p></div>
          </div>
          <p className="text-stone-600 text-xs mt-4">
            A confirmação será enviada para o seu e-mail. Para corrigir seus dados, acesse{' '}
            <button onClick={() => navigate({ name: 'cliente-agendamentos' })} className="text-amber-500 hover:text-amber-400">Meus agendamentos</button>.
          </p>

          <div className="mt-6">
            <FormError mensagem={erroEnvio} />
          </div>
          {horarioOcupado ? (
            <button
              onClick={() => navigate({ name: 'agendamento-barbeiro', barbeariaId, servicoId })}
              className="w-full bg-stone-800 hover:bg-stone-700 text-white font-bold py-4 rounded-xl transition-all"
            >
              Escolher outro horário
            </button>
          ) : (
            <button
              onClick={confirmar}
              disabled={enviando}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-stone-950 font-bold py-4 rounded-xl transition-all hover:scale-[1.01] shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              {enviando ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
              {enviando ? 'Confirmando...' : 'Confirmar Agendamento'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
