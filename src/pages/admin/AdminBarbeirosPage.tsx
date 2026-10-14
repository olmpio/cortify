import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { getBarbeirosByBarbearia } from '@/utils/helpers';
import { diasSemanaCurto } from '@/data/mockData';
import { Users, Plus, Clock, X, Scissors as ScissorIcon } from 'lucide-react';

export function AdminBarbeirosPage() {
  const { adminBarbeariaId, navigate } = useApp();
  const barbeiros = getBarbeirosByBarbearia(adminBarbeariaId || '');

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nome: '', especialidades: '', horarioInicio: '09:00', horarioFim: '18:00', diasFolga: [] as number[] });

  if (!adminBarbeariaId) {
    navigate({ name: 'admin-login' });
    return null;
  }

  function toggleFolga(dia: number) {
    setForm((prev) => ({
      ...prev,
      diasFolga: prev.diasFolga.includes(dia) ? prev.diasFolga.filter((d) => d !== dia) : [...prev.diasFolga, dia],
    }));
  }

  return (
    <div className="min-h-screen bg-stone-950">
      <div className="border-b border-stone-800 bg-stone-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate({ name: 'admin-dashboard' })} className="text-stone-400 hover:text-amber-500 transition-colors text-sm">
              Dashboard
            </button>
            <span className="text-stone-700">/</span>
            <span className="text-white font-semibold text-sm">Barbeiros</span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold px-4 py-2 rounded-lg transition-all text-sm flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Novo Barbeiro
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Users className="h-6 w-6 text-amber-500" />
          <div>
            <h1 className="text-2xl font-bold text-white">Barbeiros</h1>
            <p className="text-stone-400 text-sm">{barbeiros.length} profissionais cadastrados</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {barbeiros.map((b) => (
            <div key={b._id} className="bg-stone-900 rounded-2xl border border-stone-800 p-5">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-700/10 flex items-center justify-center text-amber-500 font-bold text-lg border border-amber-500/20 flex-shrink-0">
                  {b.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold">{b.nome}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-md ${b.ativo ? 'bg-green-500/10 text-green-500' : 'bg-stone-800 text-stone-500'}`}>
                      {b.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-stone-400 text-sm">
                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                    {b.horarioInicio} – {b.horarioFim}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {b.especialidades.map((esp) => (
                  <span key={esp} className="text-xs bg-stone-800 text-stone-400 px-2 py-1 rounded-md flex items-center gap-1">
                    <ScissorIcon className="h-3 w-3" /> {esp}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-stone-800">
                <span className="text-stone-500 text-xs mr-1">Folga:</span>
                {b.diasFolga.length === 0 ? (
                  <span className="text-stone-600 text-xs">Nenhuma</span>
                ) : (
                  b.diasFolga.map((d) => (
                    <span key={d} className="text-xs bg-stone-800 text-stone-500 px-1.5 py-0.5 rounded">{diasSemanaCurto[d]}</span>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-stone-900 rounded-2xl border border-stone-800 max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Novo Barbeiro</h2>
              <button onClick={() => setShowModal(false)} className="text-stone-500 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-stone-400 text-sm font-medium block mb-1.5">Nome</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none transition-colors"
                  placeholder="Nome do barbeiro"
                />
              </div>
              <div>
                <label className="text-stone-400 text-sm font-medium block mb-1.5">Especialidades (separadas por vírgula)</label>
                <input
                  type="text"
                  value={form.especialidades}
                  onChange={(e) => setForm({ ...form, especialidades: e.target.value })}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none transition-colors"
                  placeholder="Corte, Barba, Degradê"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-stone-400 text-sm font-medium block mb-1.5">Início</label>
                  <input type="time" value={form.horarioInicio} onChange={(e) => setForm({ ...form, horarioInicio: e.target.value })} className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="text-stone-400 text-sm font-medium block mb-1.5">Fim</label>
                  <input type="time" value={form.horarioFim} onChange={(e) => setForm({ ...form, horarioFim: e.target.value })} className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none transition-colors" />
                </div>
              </div>
              <div>
                <label className="text-stone-400 text-sm font-medium block mb-2">Dias de Folga</label>
                <div className="flex gap-1.5">
                  {diasSemanaCurto.map((d, i) => (
                    <button
                      key={i}
                      onClick={() => toggleFolga(i)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                        form.diasFolga.includes(i) ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => { setShowModal(false); setForm({ nome: '', especialidades: '', horarioInicio: '09:00', horarioFim: '18:00', diasFolga: [] }); }}
                className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-3.5 rounded-xl transition-all"
              >
                Cadastrar Barbeiro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
