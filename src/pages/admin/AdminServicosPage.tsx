import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { getServicosByBarbearia, formatPreco, formatDuracao } from '@/utils/helpers';
import { Scissors, Plus, Clock, X, DollarSign } from 'lucide-react';

export function AdminServicosPage() {
  const { adminBarbeariaId, navigate } = useApp();
  const servicos = getServicosByBarbearia(adminBarbeariaId || '');

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nome: '', descricao: '', preco: '', duracaoMinutos: '', categoria: 'Corte' });

  if (!adminBarbeariaId) {
    navigate({ name: 'admin-login' });
    return null;
  }

  const categorias = [...new Set(servicos.map((s) => s.categoria))];

  return (
    <div className="min-h-screen bg-stone-950">
      <div className="border-b border-stone-800 bg-stone-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate({ name: 'admin-dashboard' })} className="text-stone-400 hover:text-amber-500 transition-colors text-sm">
              Dashboard
            </button>
            <span className="text-stone-700">/</span>
            <span className="text-white font-semibold text-sm">Serviços</span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold px-4 py-2 rounded-lg transition-all text-sm flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Novo Serviço
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Scissors className="h-6 w-6 text-amber-500" />
          <div>
            <h1 className="text-2xl font-bold text-white">Serviços</h1>
            <p className="text-stone-400 text-sm">{servicos.length} serviços cadastrados</p>
          </div>
        </div>

        {categorias.map((cat) => (
          <div key={cat} className="mb-6">
            <h2 className="text-stone-500 text-sm uppercase tracking-wide mb-3">{cat}</h2>
            <div className="space-y-3">
              {servicos.filter((s) => s.categoria === cat).map((serv) => (
                <div key={serv._id} className="bg-stone-900 rounded-xl border border-stone-800 p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                    <Scissors className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold">{serv.nome}</p>
                    <p className="text-stone-400 text-sm line-clamp-1">{serv.descricao}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-stone-500 text-xs">
                        <Clock className="h-3.5 w-3.5" /> {formatDuracao(serv.duracaoMinutos)}
                      </span>
                    </div>
                  </div>
                  <p className="text-amber-500 font-bold text-lg flex-shrink-0">{formatPreco(serv.preco)}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-stone-900 rounded-2xl border border-stone-800 max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Novo Serviço</h2>
              <button onClick={() => setShowModal(false)} className="text-stone-500 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-stone-400 text-sm font-medium block mb-1.5">Nome do Serviço</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none transition-colors"
                  placeholder="Ex: Corte Degradê"
                />
              </div>
              <div>
                <label className="text-stone-400 text-sm font-medium block mb-1.5">Descrição</label>
                <textarea
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  rows={2}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none transition-colors resize-none"
                  placeholder="Descrição do serviço"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-stone-400 text-sm font-medium block mb-1.5 flex items-center gap-1.5"><DollarSign className="h-4 w-4" /> Preço (R$)</label>
                  <input
                    type="number"
                    value={form.preco}
                    onChange={(e) => setForm({ ...form, preco: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none transition-colors"
                    placeholder="45"
                  />
                </div>
                <div>
                  <label className="text-stone-400 text-sm font-medium block mb-1.5 flex items-center gap-1.5"><Clock className="h-4 w-4" /> Duração (min)</label>
                  <input
                    type="number"
                    value={form.duracaoMinutos}
                    onChange={(e) => setForm({ ...form, duracaoMinutos: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none transition-colors"
                    placeholder="40"
                  />
                </div>
              </div>
              <div>
                <label className="text-stone-400 text-sm font-medium block mb-1.5">Categoria</label>
                <select
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none transition-colors"
                >
                  <option value="Corte">Corte</option>
                  <option value="Combo">Combo</option>
                  <option value="Adicional">Adicional</option>
                  <option value="Tratamento">Tratamento</option>
                </select>
              </div>
              <button
                onClick={() => { setShowModal(false); setForm({ nome: '', descricao: '', preco: '', duracaoMinutos: '', categoria: 'Corte' }); }}
                className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-3.5 rounded-xl transition-all"
              >
                Cadastrar Serviço
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
