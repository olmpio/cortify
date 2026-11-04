import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { FormError } from '@/components/Feedback';
import { LegalModal, AceiteTermos } from '@/components/LegalModal';
import type { PageView } from '@/types';
import { Scissors, Mail, Lock, User, Phone, ArrowLeft, Loader2 } from 'lucide-react';

const input =
  'w-full bg-stone-800 border border-stone-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-stone-600 focus:border-amber-500 focus:outline-none transition-colors';
const icone = 'absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-600';
const rotulo = 'text-stone-400 text-sm font-medium block mb-1.5';

/**
 * Login e cadastro do cliente (mesma tela, duas abas).
 * `destino` = tela que o cliente queria abrir antes de ser barrado (ex.: escolher serviço).
 */
export function ClienteAcessoPage({ destino, modoInicial = 'login' }: { destino?: PageView; modoInicial?: 'login' | 'cadastro' }) {
  const { navigate, clienteLogin, clienteCadastrar } = useApp();
  const [modo, setModo] = useState<'login' | 'cadastro'>(modoInicial);
  const [form, setForm] = useState({ nome: '', telefone: '', email: '', senha: '', confirmar: '' });
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [aceite, setAceite] = useState(false);
  const [legal, setLegal] = useState<'termos' | 'privacidade' | null>(null);

  const set = (campo: string, valor: string) => { setForm((f) => ({ ...f, [campo]: valor })); setErro(''); };

  function validar(): string {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Informe um e-mail válido.';
    if (modo === 'login') return form.senha ? '' : 'Informe sua senha.';
    if (form.nome.trim().length < 2) return 'Informe seu nome.';
    if (form.telefone.replace(/\D/g, '').length < 10) return 'Informe um telefone válido com DDD.';
    if (form.senha.length < 8 || !/[A-Za-z]/.test(form.senha) || !/\d/.test(form.senha)) return 'A senha deve ter pelo menos 8 caracteres, com letras e números.';
    if (form.senha !== form.confirmar) return 'As senhas não conferem.';
    if (!aceite) return 'Para criar a conta, aceite os Termos de Uso e a Política de Privacidade.';
    return '';
  }

  async function enviar() {
    if (enviando) return;
    const msg = validar();
    if (msg) { setErro(msg); return; }
    setEnviando(true);
    try {
      if (modo === 'login') {
        await clienteLogin(form.email.trim(), form.senha);
      } else {
        await clienteCadastrar({ nome: form.nome.trim(), email: form.email.trim(), telefone: form.telefone.trim(), senha: form.senha, aceiteTermos: aceite });
      }
      navigate(destino ?? { name: 'home' });
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full">
        <button
          onClick={() => navigate({ name: 'home' })}
          className="text-stone-500 hover:text-amber-500 transition-colors mb-6 flex items-center gap-2 text-sm"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao site
        </button>

        <div className="bg-stone-900 rounded-2xl border border-stone-800 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <Scissors className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{modo === 'login' ? 'Entrar' : 'Criar conta'}</h1>
              <p className="text-stone-500 text-sm">BarberSync</p>
            </div>
          </div>

          {destino && (
            <p className="text-stone-400 text-sm mb-5 bg-amber-500/5 border border-amber-500/15 rounded-xl p-3">
              Para agendar, entre na sua conta ou crie uma — leva menos de um minuto. Seus agendamentos ficam salvos no histórico.
            </p>
          )}

          <div className="grid grid-cols-2 gap-1 bg-stone-800 rounded-xl p-1 mb-6">
            {(['login', 'cadastro'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setModo(m); setErro(''); }}
                className={`py-2 rounded-lg text-sm font-semibold transition-all ${
                  modo === m ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-white'
                }`}
              >
                {m === 'login' ? 'Já tenho conta' : 'Criar conta'}
              </button>
            ))}
          </div>

          <FormError mensagem={erro} />

          <div className="space-y-4">
            {modo === 'cadastro' && (
              <>
                <div>
                  <label className={rotulo}>Nome completo</label>
                  <div className="relative">
                    <User className={icone} />
                    <input className={input} value={form.nome} autoComplete="name" onChange={(e) => set('nome', e.target.value)} placeholder="Seu nome" />
                  </div>
                </div>
                <div>
                  <label className={rotulo}>Telefone / WhatsApp</label>
                  <div className="relative">
                    <Phone className={icone} />
                    <input type="tel" className={input} value={form.telefone} autoComplete="tel" onChange={(e) => set('telefone', e.target.value)} placeholder="(00) 00000-0000" />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className={rotulo}>E-mail</label>
              <div className="relative">
                <Mail className={icone} />
                <input
                  type="email"
                  className={input}
                  value={form.email}
                  autoComplete="username"
                  onChange={(e) => set('email', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && modo === 'login' && enviar()}
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-stone-400 text-sm font-medium">Senha</label>
                {modo === 'login' && (
                  <button type="button" onClick={() => navigate({ name: 'cliente-esqueci-senha' })} className="text-xs text-stone-500 hover:text-amber-500 transition-colors">
                    Esqueci minha senha
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className={icone} />
                <input
                  type="password"
                  className={input}
                  value={form.senha}
                  autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
                  onChange={(e) => set('senha', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && modo === 'login' && enviar()}
                  placeholder="••••••••"
                />
              </div>
              {modo === 'cadastro' && <p className="text-stone-600 text-xs mt-1">Mínimo de 8 caracteres, com letras e números</p>}
            </div>

            {modo === 'cadastro' && (
              <div>
                <label className={rotulo}>Confirmar senha</label>
                <div className="relative">
                  <Lock className={icone} />
                  <input
                    type="password"
                    className={input}
                    value={form.confirmar}
                    autoComplete="new-password"
                    onChange={(e) => set('confirmar', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && enviar()}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}
          </div>

          {modo === 'cadastro' && (
            <div className="mt-5">
              <AceiteTermos marcado={aceite} onChange={(v) => { setAceite(v); setErro(''); }} onAbrir={setLegal} />
            </div>
          )}

          <button
            onClick={enviar}
            disabled={enviando}
            className="w-full mt-6 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-stone-950 font-bold py-3.5 rounded-xl transition-all hover:scale-[1.01] shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            {enviando && <Loader2 className="h-4 w-4 animate-spin" />}
            {enviando ? 'Aguarde...' : modo === 'login' ? 'Entrar' : 'Criar conta e continuar'}
          </button>
        </div>
      </div>
      {legal && <LegalModal documento={legal} onFechar={() => setLegal(null)} />}
    </div>
  );
}
