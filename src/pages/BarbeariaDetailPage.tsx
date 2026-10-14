import { useApp } from '@/context/AppContext';
import { getBarbeariaById, getServicosByBarbearia, getBarbeirosByBarbearia, formatPreco, formatDuracao } from '@/utils/helpers';
import { diasSemanaCurto } from '@/data/mockData';
import { MapPin, Clock, Phone, Users, Scissors, ArrowLeft, Calendar, Check } from 'lucide-react';

export function BarbeariaDetailPage({ barbeariaId }: { barbeariaId: string }) {
  const { navigate } = useApp();
  const barbearia = getBarbeariaById(barbeariaId);

  if (!barbearia) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <p className="text-stone-400">Barbearia não encontrada.</p>
      </div>
    );
  }

  const servicos = getServicosByBarbearia(barbeariaId);
  const barbeiros = getBarbeirosByBarbearia(barbeariaId);
  const categorias = [...new Set(servicos.map((s) => s.categoria))];

  return (
    <div className="min-h-screen bg-stone-950">
      {/* Header com imagem */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img src={barbearia.imagemUrl} alt={barbearia.nome} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/50 to-stone-950/20" />
        <button
          onClick={() => navigate({ name: 'barbearias' })}
          className="absolute top-4 left-4 bg-stone-900/80 backdrop-blur-sm text-stone-300 hover:text-amber-500 p-2 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="mx-auto max-w-5xl px-4 -mt-16 relative">
        {/* Card info */}
        <div className="bg-stone-900 rounded-2xl border border-stone-800 p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white">{barbearia.nome}</h1>
          <p className="text-stone-400 mt-2">{barbearia.descricao}</p>

          <div className="grid sm:grid-cols-3 gap-4 mt-6">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-stone-500 text-xs uppercase tracking-wide">Endereço</p>
                <p className="text-stone-300 text-sm">{barbearia.endereco}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-stone-500 text-xs uppercase tracking-wide">Horário</p>
                <p className="text-stone-300 text-sm">{barbearia.horarioAbertura} – {barbearia.horarioFechamento}</p>
                <div className="flex gap-1 mt-1">
                  {diasSemanaCurto.map((d, i) => (
                    <span
                      key={i}
                      className={`text-xs px-1.5 py-0.5 rounded ${
                        barbearia.diasFuncionamento.includes(i)
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-stone-800 text-stone-600'
                      }`}
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-stone-500 text-xs uppercase tracking-wide">Contato</p>
                <p className="text-stone-300 text-sm">{barbearia.telefone}</p>
                <p className="text-stone-400 text-sm">{barbearia.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Barbeiros */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-amber-500" />
            <h2 className="text-xl font-bold text-white">Nossos Barbeiros</h2>
            <span className="text-stone-500 text-sm">({barbeiros.length})</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {barbeiros.map((b) => (
              <div key={b._id} className="bg-stone-900 rounded-xl border border-stone-800 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-700/10 flex items-center justify-center text-amber-500 font-bold text-lg border border-amber-500/20">
                    {b.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{b.nome}</p>
                    <p className="text-stone-500 text-xs">{b.horarioInicio}–{b.horarioFim}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {b.especialidades.map((esp) => (
                    <span key={esp} className="text-xs bg-stone-800 text-stone-400 px-2 py-1 rounded-md">{esp}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Serviços */}
        <div className="mt-10 pb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Scissors className="h-5 w-5 text-amber-500" />
              <h2 className="text-xl font-bold text-white">Catálogo de Serviços</h2>
            </div>
            <button
              onClick={() => navigate({ name: 'agendamento-servico', barbeariaId })}
              className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold px-5 py-2.5 rounded-xl transition-all hover:scale-[1.02] text-sm"
            >
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Agendar
              </span>
            </button>
          </div>

          {categorias.map((cat) => (
            <div key={cat} className="mb-6">
              <h3 className="text-stone-500 text-sm uppercase tracking-wide mb-3">{cat}</h3>
              <div className="space-y-3">
                {servicos.filter((s) => s.categoria === cat).map((serv) => (
                  <button
                    key={serv._id}
                    onClick={() => navigate({ name: 'agendamento-servico', barbeariaId })}
                    className="w-full text-left bg-stone-900 rounded-xl border border-stone-800 hover:border-amber-500/40 p-4 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-white font-semibold group-hover:text-amber-500 transition-colors">{serv.nome}</p>
                        <p className="text-stone-400 text-sm mt-0.5">{serv.descricao}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="flex items-center gap-1 text-stone-500 text-xs">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDuracao(serv.duracaoMinutos)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-amber-500 font-bold text-lg">{formatPreco(serv.preco)}</p>
                        <span className="text-stone-600 text-xs flex items-center gap-1 justify-end mt-1">
                          <Check className="h-3 w-3" /> Disponível
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
