import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { FormError } from '@/components/Feedback';
import { LegalModal, AceiteTermos } from '@/components/LegalModal';
import { diasSemanaCurto } from '@/data/constants';
import { Scissors, ArrowLeft, Loader2, Store, MapPin, Phone, Clock, User, Mail, Lock } from 'lucide-react';

const input =
  'w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white placeholder-stone-600 focus:border-amber-500 focus:outline-none transition-colors';
const label = 'text-stone-400 text-sm font-medium block mb-1.5';

export function AdminCadastroPage() {
  const { navigate, cadastrar } = useApp();
  const [form, setForm] = useState({
    nomeBarbearia: '', endereco: '', telefone: '', horarioAbertura: '09:00', horarioFechamento: '20:00',
    diasFuncionamento: [1, 2, 3, 4, 5, 6] as number[], descricao: '',
    nomeAdmin: '', emailAdmin: '', senha: '', confirmarSenha: '',
  });
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [aceite, setAceite] = useState(false);
  const [legal, setLegal] = useState<'termos' | 'privacidade' | null>(null);

  const set = (campo: string, valor: string) => { setForm((f) => ({ ...f, [campo]: valor })); setErro(''); };

  function toggleDia(dia: number) {
    setForm((f) => ({
      ...f,
      diasFuncionamento: f.diasFuncionamento.includes(dia) ? f.diasFuncionamento.filter((d) => d !== dia) : [...f.diasFuncionamento, dia],
    }));
  }

  function validar(): string {
    if (!form.nomeBarbearia.trim() || form.nomeBarbearia.trim().length < 3) return 'Informe o nome da barbearia (mínimo 3 letras).';
    if (!form.endereco.trim()) return 'Informe o endereço.';
    if (!form.telefone.trim()) return 'Informe o telefone.';
    if (form.diasFuncionamento.length === 0) return 'Selecione ao menos um dia de funcionamento.';
    if (form.horarioAbertura >= form.horarioFechamento) return 'O horário de abertura deve ser antes do fechamento.';
    if (!form.nomeAdmin.trim()) return 'Informe seu nome.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailAdmin)) return 'Informe um e-mail válido.';
    if (form.senha.length < 8 || !/[A-Za-z]/.test(form.senha) || !/\d/.test(form.senha)) return 'A senha deve ter pelo menos 8 caracteres, com letras e números.';
    if (form.senha !== form.confirmarSenha) return 'As senhas não conferem.';
    if (!aceite) return 'Para criar a conta, aceite os Termos de Uso e a Política de Privacidade.';
    return '';
  }

  async function enviar() {
    if (enviando) return;
    const msg = validar();
    if (msg) { setErro(msg); return; }
    setEnviando(true);
    try {
      await cadastrar({
        nomeBarbearia: form.nomeBarbearia.trim(),
        endereco: form.endereco.trim(),
        telefone: form.telefone.trim(),
        horarioAbertura: form.horarioAbertura,
        horarioFechamento: form.horarioFechamento,
        diasFuncionamento: form.diasFuncionamento,
        descricao: form.descricao.trim() || undefined,
        nomeAdmin: form.nomeAdmin.trim(),
        emailAdmin: form.emailAdmin.trim(),
        senha: form.senha,
        aceiteTermos: aceite,
      });
      navigate({ name: 'admin-dashboard' });
    } catch (e) {
      setErro((e as Error).message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate({ name: 'admin-login' })}
          className="text-stone-500 hover:text-amber-500 transition-colors mb-6 flex items-center gap-2 text-sm"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao login
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <Scissors className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Cadastre sua barbearia</h1>
            <p className="text-stone-400 text-sm">Crie sua conta e comece a receber agendamentos online</p>
          </div>
        </div>

        <FormError mensagem={erro} />

        <div className="bg-stone-900 rounded-2xl border border-stone-800 p-6 space-y-5 mb-6">
          <p className="text-stone-500 text-xs uppercase tracking-wide flex items-center gap-2"><Store className="h-4 w-4 text-amber-500" /> Dados da barbearia</p>
          <div>
            <label className={label}>Nome da barbearia *</label>
            <input className={input} value={form.nomeBarbearia} onChange={(e) => set('nomeBarbearia', e.target.value)} placeholder="Ex: Barbearia Navalha de Ouro" />
          </div>
          <div>
            <label className={`${label} flex items-center gap-1.5`}><MapPin className="h-4 w-4" /> Endereço *</label>
            <input className={input} value={form.endereco} onChange={(e) => set('endereco', e.target.value)} placeholder="Rua, número - bairro, cidade/UF" />
          </div>
          <div>
            <label className={`${label} flex items-center gap-1.5`}><Phone className="h-4 w-4" /> Telefone / WhatsApp *</label>
            <input className={input} value={form.telefone} onChange={(e) => set('telefone', e.target.value)} placeholder="(00) 00000-0000" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={`${label} flex items-center gap-1.5`}><Clock className="h-4 w-4" /> Abertura</label>
              <input type="time" className={input} value={form.horarioAbertura} onChange={(e) => set('horarioAbertura', e.target.value)} />
            </div>
            <div>
              <label className={`${label} flex items-center gap-1.5`}><Clock className="h-4 w-4" /> Fechamento</label>
              <input type="time" className={input} value={form.horarioFechamento} onChange={(e) => set('horarioFechamento', e.target.value)} />
            </div>
          </div>
          <div>
            <label className={`${label} mb-3`}>Dias de funcionamento</label>
            <div className="flex gap-2">
              {diasSemanaCurto.map((d, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleDia(i)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    form.diasFuncionamento.includes(i) ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-stone-500 hover:bg-stone-700'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={label}>Descrição</label>
            <textarea className={`${input} resize-none`} rows={3} maxLength={500} value={form.descricao} onChange={(e) => set('descricao', e.target.value)} placeholder="Conte um pouco sobre sua barbearia" />
          </div>
        </div>

        <div className="bg-stone-900 rounded-2xl border border-stone-800 p-6 space-y-5">
          <p className="text-stone-500 text-xs uppercase tracking-wide flex items-center gap-2"><User className="h-4 w-4 text-amber-500" /> Sua conta de acesso</p>
          <div>
            <label className={label}>Seu nome *</label>
            <input className={input} value={form.nomeAdmin} onChange={(e) => set('nomeAdmin', e.target.value)} placeholder="Nome completo" />
          </div>
          <div>
            <label className={`${label} flex items-center gap-1.5`}><Mail className="h-4 w-4" /> E-mail *</label>
            <input type="email" autoComplete="username" className={input} value={form.emailAdmin} onChange={(e) => set('emailAdmin', e.target.value)} placeholder="voce@suabarbearia.com" />
            <p className="text-stone-600 text-xs mt-1">Também receberá os avisos de novos agendamentos.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={`${label} flex items-center gap-1.5`}><Lock className="h-4 w-4" /> Senha *</label>
              <input type="password" autoComplete="new-password" className={input} value={form.senha} onChange={(e) => set('senha', e.target.value)} placeholder="••••••••" />
            </div>
            <div>
              <label className={label}>Confirmar senha *</label>
              <input type="password" autoComplete="new-password" className={input} value={form.confirmarSenha} onChange={(e) => set('confirmarSenha', e.target.value)} onKeyDown={(e) => e.key === 'Enter' && enviar()} placeholder="••••••••" />
            </div>
          </div>
          <p className="text-stone-600 text-xs -mt-2">Mínimo de 8 caracteres, com letras e números.</p>

          <AceiteTermos marcado={aceite} onChange={(v) => { setAceite(v); setErro(''); }} onAbrir={setLegal} />

          <button
            onClick={enviar}
            disabled={enviando}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-stone-950 font-bold py-3.5 rounded-xl transition-all hover:scale-[1.01] shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            {enviando && <Loader2 className="h-4 w-4 animate-spin" />}
            {enviando ? 'Criando conta...' : 'Criar conta e barbearia'}
          </button>
        </div>
      </div>
      {legal && <LegalModal documento={legal} onFechar={() => setLegal(null)} />}
    </div>
  );
}
