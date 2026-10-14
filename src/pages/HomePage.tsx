import { useApp } from '@/context/AppContext';
import { mockBarbearias } from '@/data/mockData';
import { getServicosByBarbearia, getBarbeirosByBarbearia, formatPreco } from '@/utils/helpers';
import { Scissors, MapPin, Clock, Users, Calendar, ChevronRight, Sparkles } from 'lucide-react';

export function HomePage() {
  const { navigate } = useApp();

  return (
    <div className="min-h-screen bg-stone-950">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/3992856/pexels-photo-3992856.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Barbearia"
            className="h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/60 via-stone-950/70 to-stone-950" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-24 md:py-36">
          <div className="flex items-center gap-2 mb-4">
            <Scissors className="h-6 w-6 text-amber-500" />
            <span className="text-amber-500 font-semibold tracking-wide uppercase text-sm">BarberSync</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight max-w-2xl">
            Agende seu corte em <span className="text-amber-500">minutos</span>, não em horas.
          </h1>
          <p className="mt-6 text-lg text-stone-300 max-w-xl">
            Escolha sua barbearia, veja os serviços e encontre o barbeiro disponível no horário que você quer — tudo em tempo real, sem filas e sem ligações.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <button
              onClick={() => navigate({ name: 'barbearias' })}
              className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold px-8 py-3.5 rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-amber-500/20"
            >
              Agendar Agora
            </button>
            <button
              onClick={() => navigate({ name: 'admin-login' })}
              className="border border-stone-600 hover:border-amber-500 text-stone-300 hover:text-amber-500 font-semibold px-8 py-3.5 rounded-xl transition-all"
            >
              Sou Dono de Barbearia
            </button>
          </div>

          <div className="mt-16 flex gap-8 text-stone-400">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-500" />
              <span className="text-sm">{mockBarbearias.length} barbearias</span>
            </div>
            <div className="flex items-center gap-2">
              <Scissors className="h-5 w-5 text-amber-500" />
              <span className="text-sm">Barbeiros disponíveis em tempo real</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <span className="text-sm">Confirmação imediata</span>
            </div>
          </div>
        </div>
      </section>

      {/* Barbearias em destaque */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Barbearias Parceiras</h2>
            <p className="text-stone-400 mt-2">Escolha onde deseja ser atendido</p>
          </div>
          <button
            onClick={() => navigate({ name: 'barbearias' })}
            className="text-amber-500 hover:text-amber-400 font-semibold text-sm flex items-center gap-1 transition-colors"
          >
            Ver todas <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockBarbearias.map((barb) => {
            const servicos = getServicosByBarbearia(barb._id);
            const barbeiros = getBarbeirosByBarbearia(barb._id);
            const precoMin = Math.min(...servicos.map((s) => s.preco));
            return (
              <button
                key={barb._id}
                onClick={() => navigate({ name: 'barbearia-detail', barbeariaId: barb._id })}
                className="group text-left bg-stone-900 rounded-2xl overflow-hidden border border-stone-800 hover:border-amber-500/50 transition-all hover:shadow-xl hover:shadow-amber-500/5"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={barb.imagemUrl}
                    alt={barb.nome}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900 to-transparent" />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-500 transition-colors">{barb.nome}</h3>
                  <div className="flex items-center gap-1.5 mt-2 text-stone-400 text-sm">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{barb.endereco}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-stone-800">
                    <div className="flex items-center gap-1.5 text-stone-400 text-sm">
                      <Clock className="h-4 w-4 text-amber-500" />
                      {barb.horarioAbertura}–{barb.horarioFechamento}
                    </div>
                    <div className="flex items-center gap-1.5 text-stone-400 text-sm">
                      <Users className="h-4 w-4 text-amber-500" />
                      {barbeiros.length} barbeiros
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-stone-500 text-sm">A partir de</span>
                    <span className="text-amber-500 font-bold">{formatPreco(precoMin)}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Como funciona */}
      <section className="bg-stone-900/50 border-t border-stone-800">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center">Como Funciona</h2>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
                <MapPin className="h-7 w-7 text-amber-500" />
              </div>
              <h3 className="text-white font-semibold text-lg">1. Escolha a Barbearia</h3>
              <p className="text-stone-400 mt-2 text-sm">Selecione a unidade mais próxima de você e veja todos os serviços disponíveis.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
                <Scissors className="h-7 w-7 text-amber-500" />
              </div>
              <h3 className="text-white font-semibold text-lg">2. Escolha Serviço e Barbeiro</h3>
              <p className="text-stone-400 mt-2 text-sm">Veja quais barbeiros estão disponíveis no horário que você quer, em tempo real.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
                <Calendar className="h-7 w-7 text-amber-500" />
              </div>
              <h3 className="text-white font-semibold text-lg">3. Confirme o Agendamento</h3>
              <p className="text-stone-400 mt-2 text-sm">Preencha seus dados e receba a confirmação imediata do seu horário.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-stone-800 py-8">
        <div className="mx-auto max-w-6xl px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scissors className="h-5 w-5 text-amber-500" />
            <span className="text-stone-400 font-semibold">Smart Barber</span>
          </div>
          <p className="text-stone-600 text-sm">Plataforma SaaS para agendamento em barbearias</p>
        </div>
      </footer>
    </div>
  );
}
