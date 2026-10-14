import { useApp } from '@/context/AppContext';
import { getBarbeariaById, getServicosByBarbearia, formatPreco, formatDuracao } from '@/utils/helpers';
import { ArrowLeft, Clock, Scissors, Check } from 'lucide-react';

export function AgendamentoServicoPage({ barbeariaId }: { barbeariaId: string }) {
  const { navigate } = useApp();
  const barbearia = getBarbeariaById(barbeariaId);
  const servicos = getServicosByBarbearia(barbeariaId);
  const categorias = [...new Set(servicos.map((s) => s.categoria))];

  if (!barbearia) {
    return <div className="min-h-screen bg-stone-950 flex items-center justify-center text-stone-400">Barbearia não encontrada.</div>;
  }

  return (
    <div className="min-h-screen bg-stone-950">
      <div className="border-b border-stone-800 bg-stone-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate({ name: 'barbearia-detail', barbeariaId })} className="text-stone-400 hover:text-amber-500 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <p className="text-stone-500 text-xs">Passo 1 de 3 — Agendamento</p>
            <p className="text-white font-semibold text-sm">{barbearia.nome}</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mx-auto max-w-4xl px-4 pt-6">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-amber-500 rounded-full" />
          <div className="flex-1 h-1.5 bg-stone-800 rounded-full" />
          <div className="flex-1 h-1.5 bg-stone-800 rounded-full" />
        </div>
        <div className="flex justify-between mt-2 text-xs">
          <span className="text-amber-500 font-semibold">Serviço</span>
          <span className="text-stone-600">Barbeiro & Horário</span>
          <span className="text-stone-600">Confirmação</span>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-1">Escolha o Serviço</h1>
        <p className="text-stone-400 text-sm mb-8">Selecione qual serviço deseja agendar</p>

        {categorias.map((cat) => (
          <div key={cat} className="mb-6">
            <h2 className="text-stone-500 text-sm uppercase tracking-wide mb-3">{cat}</h2>
            <div className="space-y-3">
              {servicos.filter((s) => s.categoria === cat).map((serv) => (
                <button
                  key={serv._id}
                  onClick={() => navigate({ name: 'agendamento-barbeiro', barbeariaId, servicoId: serv._id })}
                  className="w-full text-left bg-stone-900 rounded-xl border border-stone-800 hover:border-amber-500/50 p-5 transition-all group flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                    <Scissors className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold group-hover:text-amber-500 transition-colors">{serv.nome}</p>
                    <p className="text-stone-400 text-sm mt-0.5 line-clamp-1">{serv.descricao}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-stone-500 text-xs">
                        <Clock className="h-3.5 w-3.5" /> {formatDuracao(serv.duracaoMinutos)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-amber-500 font-bold text-lg">{formatPreco(serv.preco)}</p>
                    <span className="text-stone-600 text-xs flex items-center gap-1 justify-end mt-1">
                      <Check className="h-3 w-3" /> Selecionar
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
