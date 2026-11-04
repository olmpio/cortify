import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { FormError } from '@/components/Feedback';
import { Scissors, Mail, Lock, ArrowLeft, Loader2 } from 'lucide-react';

export function AdminLoginPage() {
  const { navigate, login } = useApp();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleLogin() {
    if (carregando) return;
    if (!email.trim() || !senha) {
      setErro('Informe e-mail e senha.');
      return;
    }
    setCarregando(true);
    setErro('');
    try {
      await login(email.trim(), senha);
      navigate({ name: 'admin-dashboard' });
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
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
              <h1 className="text-xl font-bold text-white">Painel Administrativo</h1>
              <p className="text-stone-500 text-sm">BarberSync</p>
            </div>
          </div>

          <p className="text-stone-400 text-sm mb-6">Acesse o painel de gerenciamento da sua barbearia</p>

          <FormError mensagem={erro} />

          <div className="space-y-4">
            <div>
              <label className="text-stone-400 text-sm font-medium block mb-1.5">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-600" />
                <input
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErro(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-stone-600 focus:border-amber-500 focus:outline-none transition-colors"
                  placeholder="admin@sua.barbearia"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-stone-400 text-sm font-medium">Senha</label>
                <button
                  type="button"
                  onClick={() => navigate({ name: 'admin-esqueci-senha' })}
                  className="text-xs text-stone-500 hover:text-amber-500 transition-colors"
                >
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-600" />
                <input
                  type="password"
                  autoComplete="current-password"
                  value={senha}
                  onChange={(e) => { setSenha(e.target.value); setErro(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-stone-600 focus:border-amber-500 focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={carregando}
            className="w-full mt-6 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-stone-950 font-bold py-3.5 rounded-xl transition-all hover:scale-[1.01] shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            {carregando && <Loader2 className="h-4 w-4 animate-spin" />}
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>

          <p className="text-center text-stone-500 text-sm mt-6">
            Ainda não tem conta?{' '}
            <button onClick={() => navigate({ name: 'admin-cadastro' })} className="text-amber-500 hover:text-amber-400 font-semibold">
              Cadastre sua barbearia
            </button>
          </p>

          {import.meta.env.DEV && (
            <div className="mt-6 bg-stone-800/50 rounded-xl p-4 border border-stone-800">
              <p className="text-stone-500 text-xs font-semibold uppercase tracking-wide mb-2">Contas de demonstração (apenas em dev)</p>
              <div className="space-y-1 text-xs text-stone-400">
                <p>admin@navalhadeouro.com · demo1234</p>
                <p>admin@studiocut.com · demo1234</p>
                <p>admin@irmaossteel.com · demo1234</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
