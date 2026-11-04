import { useState } from 'react';
import { useAdmin } from '@/context/AppContext';
import { Avatar } from '@/components/Avatar';
import { ImageUpload } from '@/components/ImageUpload';
import { comprimirImagem } from '@/utils/imagem';
import { BackButton } from '@/components/BackButton';
import { adminApi, publicApi } from '@/services/api';
import { useApiData } from '@/hooks/useApiData';
import { Loading, ErrorBox, FormError } from '@/components/Feedback';
import { diasSemanaCurto } from '@/data/constants';
import { Users, Plus, Clock, X, Trash2, Loader2, Camera, Scissors as ScissorIcon } from 'lucide-react';

export function AdminBarbeirosPage() {
  const { barbeariaId, navigate } = useAdmin();
  const { data, loading, erro, reload } = useApiData(() => publicApi.barbeiros(barbeariaId), [barbeariaId]);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nome: '', especialidades: '', horarioInicio: '09:00', horarioFim: '18:00', diasFolga: [] as number[] });
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState('');
  const [erroAcao, setErroAcao] = useState('');
  const [fotoNova, setFotoNova] = useState<string | null>(null); // foto escolhida no cadastro (enviada após criar)
  const [fotoEnviando, setFotoEnviando] = useState<string | null>(null); // id do barbeiro cuja foto está sendo trocada

  if (loading && !data) return <Loading />;
  if (erro || !data) return <ErrorBox mensagem={erro ?? 'Erro ao carregar barbeiros.'} onRetry={reload} />;
  const barbeiros = data;

  async function trocarFoto(id: string, arquivo: File) {
    setErroAcao('');
    setFotoEnviando(id);
    try {
      await adminApi.enviarFotoBarbeiro(id, await comprimirImagem(arquivo, 600));
      reload();
    } catch (e) {
      setErroAcao((e as Error).message);
    } finally {
      setFotoEnviando(null);
    }
  }

  function fecharModal() {
    setShowModal(false);
    setFotoNova(null);
    setErroForm('');
    setForm({ nome: '', especialidades: '', horarioInicio: '09:00', horarioFim: '18:00', diasFolga: [] });
  }

  async function cadastrar() {
    if (salvando) return;
    if (!form.nome.trim()) return setErroForm('Informe o nome do barbeiro.');
    if (form.horarioInicio >= form.horarioFim) return setErroForm('O início do expediente deve ser antes do fim.');
    setSalvando(true);
    setErroForm('');
    try {
      const criado = await adminApi.criarBarbeiro({
        nome: form.nome.trim(),
        especialidades: form.especialidades.split(',').map((e) => e.trim()).filter(Boolean),
        horarioInicio: form.horarioInicio,
        horarioFim: form.horarioFim,
        diasFolga: form.diasFolga,
      });
      if (fotoNova) {
        try {
          await adminApi.enviarFotoBarbeiro(criado._id, fotoNova);
        } catch (e) {
          setErroAcao(`Barbeiro cadastrado, mas a foto não foi enviada: ${(e as Error).message}`);
        }
      }
      fecharModal();
      reload();
    } catch (e) {
      setErroForm((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  async function desativar(id: string, nome: string) {
    if (!window.confirm(`Desativar ${nome}? Ele deixará de aparecer para novos agendamentos (os já marcados continuam).`)) return;
    setErroAcao('');
    try {
      await adminApi.desativarBarbeiro(id);
      reload();
    } catch (e) {
      setErroAcao((e as Error).message);
    }
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
            <BackButton />
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

        <FormError mensagem={erroAcao} />
        {barbeiros.length === 0 && (
          <p className="text-stone-500 text-sm py-12 text-center">Nenhum barbeiro cadastrado ainda. Clique em "Novo Barbeiro" para começar.</p>
        )}
        <div className="grid sm:grid-cols-2 gap-4">
          {barbeiros.map((b) => (
            <div key={b._id} className="bg-stone-900 rounded-2xl border border-stone-800 p-5">
              <div className="flex items-start gap-4">
                <div className="relative flex-shrink-0">
                  <Avatar nome={b.nome} foto={b.avatarUrl} tamanho="lg" />
                  <label
                    title="Trocar foto"
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center cursor-pointer hover:bg-amber-400 transition-colors"
                  >
                    {fotoEnviando === b._id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      disabled={fotoEnviando !== null}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        e.target.value = '';
                        if (f) trocarFoto(b._id, f);
                      }}
                    />
                  </label>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold">{b.nome}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-md ${b.ativo ? 'bg-green-500/10 text-green-500' : 'bg-stone-800 text-stone-500'}`}>
                      {b.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                    <button
                      onClick={() => desativar(b._id, b.nome)}
                      title="Desativar barbeiro"
                      className="ml-auto p-1.5 rounded-lg text-stone-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
              <button onClick={fecharModal} className="text-stone-500 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <FormError mensagem={erroForm} />
            <div className="space-y-4">
              <div>
                <label className="text-stone-400 text-sm font-medium block mb-2">Foto de perfil (opcional)</label>
                <ImageUpload formato="avatar" atual={undefined} rotulo="Escolher foto" onEscolher={(img) => setFotoNova(img)} />
              </div>
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
                onClick={cadastrar}
                disabled={salvando}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-stone-950 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {salvando && <Loader2 className="h-4 w-4 animate-spin" />}
                {salvando ? 'Salvando...' : 'Cadastrar Barbeiro'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
