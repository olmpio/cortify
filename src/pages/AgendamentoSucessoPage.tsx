import { useApp } from '@/context/AppContext';
import { formatDate, getDiaSemana, formatPreco } from '@/utils/helpers';
import { Check, Calendar, CalendarClock, Clock, User, Scissors, MapPin, Home } from 'lucide-react';

export function AgendamentoSucessoPage() {
  const { navigate, ultimoAgendamento: ag } = useApp();

  if (!ag) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center gap-4 text-stone-400">
        <p>Nenhum agendamento recente encontrado.</p>
        <button onClick={() => navigate({ name: 'home' })} className="text-amber-500 hover:text-amber-400 text-sm font-semibold">
          Voltar ao início
        </button>
      </div>
    );
  }

  const barbearia = ag.barbeariaId;
  const servico = ag.servicoId;
  const barbeiro = ag.barbeiroId;

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-4 border border-green-500/20">
            <Check className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">Agendamento Confirmado!</h1>
          <p className="text-stone-400 mt-2 text-sm">Seu horário foi reservado com sucesso. Apresente-se na barbearia no horário marcado.</p>
          {ag.clienteEmail && (
            <p className="text-stone-500 mt-2 text-xs">Enviamos a confirmação para {ag.clienteEmail}.</p>
          )}
        </div>

        <div className="bg-stone-900 rounded-2xl border border-stone-800 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Scissors className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-stone-500 text-xs">Serviço</p>
              <p className="text-white font-semibold">{servico?.nome}</p>
            </div>
            <p className="text-amber-500 font-bold">{servico && formatPreco(servico.preco)}</p>
          </div>
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-stone-500 text-xs">Barbeiro</p>
              <p className="text-white font-semibold">{barbeiro?.nome}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-stone-500 text-xs">Data</p>
              <p className="text-white font-semibold">{getDiaSemana(ag.data)}, {formatDate(ag.data)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-stone-500 text-xs">Horário</p>
              <p className="text-white font-semibold">{ag.horario}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-3 border-t border-stone-800">
            <MapPin className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-stone-500 text-xs">Local</p>
              <p className="text-white text-sm">{barbearia?.nome}</p>
              <p className="text-stone-500 text-xs">{barbearia?.endereco}</p>
            </div>
          </div>
          <div className="pt-3 border-t border-stone-800">
            <p className="text-stone-500 text-xs">Cliente</p>
            <p className="text-white font-semibold">{ag.clienteNome}</p>
            <p className="text-stone-400 text-sm">{ag.clienteTelefone}</p>
          </div>
        </div>

        <button
          onClick={() => navigate({ name: 'cliente-agendamentos' })}
          className="w-full mt-6 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <CalendarClock className="h-5 w-5" />
          Ver meus agendamentos
        </button>
        <button
          onClick={() => navigate({ name: 'home' })}
          className="w-full mt-3 bg-stone-800 hover:bg-stone-700 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <Home className="h-5 w-5" />
          Voltar ao Início
        </button>
      </div>
    </div>
  );
}
