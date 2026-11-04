import { useState } from 'react';
import { useAdmin } from '@/context/AppContext';
import { BackButton } from '@/components/BackButton';
import { adminApi } from '@/services/api';
import { FormError } from '@/components/Feedback';
import { ImageUpload } from '@/components/ImageUpload';
import { diasSemanaCurto } from '@/data/constants';
import { Store, Save, MapPin, Clock, Phone, Mail, Check, Loader2 } from 'lucide-react';

export function AdminBarbeariaPage() {
  const { barbearia, barbeariaId, navigate, setBarbearia } = useAdmin();

  const [form, setForm] = useState({
    nome: barbearia.nome || '',
    endereco: barbearia.endereco || '',
    telefone: barbearia.telefone || '',
    email: barbearia.email || '',
    horarioAbertura: barbearia.horarioAbertura || '',
    horarioFechamento: barbearia.horarioFechamento || '',
    descricao: barbearia.descricao || '',
    diasFuncionamento: barbearia.diasFuncionamento || [],
  });
  const [salvo, setSalvo] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  function toggleDia(dia: number) {
    setForm((prev) => ({
      ...prev,
      diasFuncionamento: prev.diasFuncionamento.includes(dia)
        ? prev.diasFuncionamento.filter((d) => d !== dia)
        : [...prev.diasFuncionamento, dia],
    }));
    setSalvo(false);
  }

  async function salvar() {
    if (salvando) return;
    if (form.nome.trim().length < 3) return setErro('O nome deve ter pelo menos 3 letras.');
    if (form.horarioAbertura >= form.horarioFechamento) return setErro('O horário de abertura deve ser antes do fechamento.');
    if (form.diasFuncionamento.length === 0) return setErro('Selecione ao menos um dia de funcionamento.');

    setSalvando(true);
    setErro('');
    try {
      const atualizada = await adminApi.atualizarBarbearia(barbeariaId, form);
      setBarbearia(atualizada);
      setSalvo(true);
      setTimeout(() => setSalvo(false), 2500);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-950">
      <div className="border-b border-stone-800 bg-stone-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton />
            <span className="text-white font-semibold text-sm">Minha Barbearia</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Store className="h-6 w-6 text-amber-500" />
          <div>
            <h1 className="text-2xl font-bold text-white">Minha Barbearia</h1>
            <p className="text-stone-400 text-sm">Edite as informações da sua barbearia</p>
          </div>
        </div>

        <FormError mensagem={erro} />

        <div className="bg-stone-900 rounded-2xl border border-stone-800 p-6 space-y-5">
          <div>
            <label className="text-stone-400 text-sm font-medium block mb-1.5">Foto principal (capa)</label>
            <p className="text-stone-600 text-xs mb-3">É a imagem que os clientes veem no topo da página da sua barbearia e nos cards da listagem. A troca é salva na hora.</p>
            <ImageUpload
              formato="capa"
              atual={barbearia.imagemUrl}
              rotulo="Alterar foto de capa"
              onEscolher={async (img) => {
                const atualizada = await adminApi.enviarCapa(barbeariaId, img);
                setBarbearia(atualizada);
              }}
            />
          </div>

          <div>
            <label className="text-stone-400 text-sm font-medium block mb-1.5">Nome da Barbearia</label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => { setForm({ ...form, nome: e.target.value }); setSalvo(false); }}
              className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-stone-400 text-sm font-medium block mb-1.5 flex items-center gap-1.5"><MapPin className="h-4 w-4" /> Endereço</label>
            <input
              type="text"
              value={form.endereco}
              onChange={(e) => { setForm({ ...form, endereco: e.target.value }); setSalvo(false); }}
              className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-stone-400 text-sm font-medium block mb-1.5 flex items-center gap-1.5"><Phone className="h-4 w-4" /> Telefone</label>
              <input
                type="text"
                value={form.telefone}
                onChange={(e) => { setForm({ ...form, telefone: e.target.value }); setSalvo(false); }}
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-stone-400 text-sm font-medium block mb-1.5 flex items-center gap-1.5"><Mail className="h-4 w-4" /> E-mail</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => { setForm({ ...form, email: e.target.value }); setSalvo(false); }}
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-stone-400 text-sm font-medium block mb-1.5 flex items-center gap-1.5"><Clock className="h-4 w-4" /> Horário de Abertura</label>
              <input
                type="time"
                value={form.horarioAbertura}
                onChange={(e) => { setForm({ ...form, horarioAbertura: e.target.value }); setSalvo(false); }}
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-stone-400 text-sm font-medium block mb-1.5 flex items-center gap-1.5"><Clock className="h-4 w-4" /> Horário de Fechamento</label>
              <input
                type="time"
                value={form.horarioFechamento}
                onChange={(e) => { setForm({ ...form, horarioFechamento: e.target.value }); setSalvo(false); }}
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-stone-400 text-sm font-medium block mb-3">Dias de Funcionamento</label>
            <div className="flex gap-2">
              {diasSemanaCurto.map((d, i) => (
                <button
                  key={i}
                  onClick={() => toggleDia(i)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    form.diasFuncionamento.includes(i)
                      ? 'bg-amber-500 text-stone-950'
                      : 'bg-stone-800 text-stone-500 hover:bg-stone-700'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-stone-400 text-sm font-medium block mb-1.5">Descrição</label>
            <textarea
              value={form.descricao}
              onChange={(e) => { setForm({ ...form, descricao: e.target.value }); setSalvo(false); }}
              rows={3}
              className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none transition-colors resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={salvar}
              disabled={salvando}
              className="bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-stone-950 font-bold px-6 py-3 rounded-xl transition-all hover:scale-[1.01] flex items-center gap-2"
            >
              {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {salvando ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            {salvo && (
              <span className="text-green-500 text-sm flex items-center gap-1.5">
                <Check className="h-4 w-4" /> Alterações salvas!
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
