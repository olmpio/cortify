import { useApp } from '@/context/AppContext';
import { mockBarbearias } from '@/data/mockData';
import { getServicosByBarbearia, getBarbeirosByBarbearia, formatPreco } from '@/utils/helpers';
import { MapPin, Clock, Users, Scissors, ChevronRight, ArrowLeft } from 'lucide-react';

export function BarbeariasPage() {
  const { navigate } = useApp();

  return (
    <div className="min-h-screen bg-stone-950">
      <div className="border-b border-stone-800 bg-stone-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate({ name: 'home' })} className="text-stone-400 hover:text-amber-500 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Scissors className="h-5 w-5 text-amber-500" />
            <span className="text-white font-bold">BarberSync</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Todas as Barbearias</h1>
        <p className="text-stone-400 mb-8">Escolha a unidade onde deseja ser atendido</p>

        <div className="grid md:grid-cols-2 gap-6">
          {mockBarbearias.map((barb) => {
            const servicos = getServicosByBarbearia(barb._id);
            const barbeiros = getBarbeirosByBarbearia(barb._id);
            const precoMin = Math.min(...servicos.map((s) => s.preco));
            return (
              <button
                key={barb._id}
                onClick={() => navigate({ name: 'barbearia-detail', barbeariaId: barb._id })}
                className="group text-left bg-stone-900 rounded-2xl overflow-hidden border border-stone-800 hover:border-amber-500/50 transition-all flex flex-col sm:flex-row"
              >
                <div className="relative sm:w-2/5 h-48 sm:h-auto overflow-hidden flex-shrink-0">
                  <img
                    src={barb.imagemUrl}
                    alt={barb.nome}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-500 transition-colors">{barb.nome}</h3>
                  <p className="text-stone-400 text-sm mt-1 line-clamp-2">{barb.descricao}</p>
                  <div className="flex items-center gap-1.5 mt-3 text-stone-500 text-sm">
                    <MapPin className="h-4 w-4 flex-shrink-0 text-amber-500" />
                    <span>{barb.endereco}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5 text-stone-400 text-sm">
                      <Clock className="h-4 w-4 text-amber-500" />
                      {barb.horarioAbertura}–{barb.horarioFechamento}
                    </div>
                    <div className="flex items-center gap-1.5 text-stone-400 text-sm">
                      <Users className="h-4 w-4 text-amber-500" />
                      {barbeiros.length} barbeiros
                    </div>
                  </div>
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <div>
                      <span className="text-stone-500 text-xs block">A partir de</span>
                      <span className="text-amber-500 font-bold">{formatPreco(precoMin)}</span>
                    </div>
                    <span className="text-amber-500 group-hover:translate-x-1 transition-transform">
                      <ChevronRight className="h-5 w-5" />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
