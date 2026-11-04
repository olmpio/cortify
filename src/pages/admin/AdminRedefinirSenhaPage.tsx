import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { authApi, type Perfil } from '@/services/api';
import { FormError } from '@/components/Feedback';
import { Scissors, Lock, Loader2, Check } from 'lucide-react';

export function AdminRedefinirSenhaPage({ token, tipo = 'admin' }: { token: string; tipo?: Perfil }) {
  const { navigate } = useApp();
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [ok, setOk] = useState(false);

  async function salvar() {
    if (enviando) return;
    if (senha.length < 8 || !/[A-Za-z]/.test(senha) || !/\d/.test(senha)) {
      setErro('A senha deve ter pelo menos 8 caracteres, com letras e números.');
      return;
    }
    if (senha !== confirmar) {
      setErro('As senhas não conferem.');
      return;
    }
    setEnviando(true);
    setErro('');
    try {
      await authApi.redefinirSenha(token, senha, tipo);
      setOk(true);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-stone-900 rounded-2xl border border-stone-800 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <Scissors className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Nova senha</h1>
            <p className="text-stone-500 text-sm">BarberSync</p>
          </div>
        </div>

        {ok ? (
          <div className="text-center py-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4 border border-green-500/20">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-white font-semibold mb-2">Senha redefinida!</p>
            <p className="text-stone-400 text-sm mb-6">Agora você já pode entrar com a nova senha.</p>
            <button
              onClick={() => navigate(tipo === 'admin' ? { name: 'admin-login' } : { name: 'cliente-acesso', modo: 'login' })}
              className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-3.5 rounded-xl transition-all"
            >
              Ir para o login
            </button>
          </div>
        ) : (
          <>
            <FormError mensagem={erro} />
            <div className="space-y-4">
              {[
                { label: 'Nova senha', value: senha, set: setSenha, hint: 'Mínimo de 8 caracteres, com letras e números' },
                { label: 'Confirmar nova senha', value: confirmar, set: setConfirmar, hint: '' },
              ].map((f) => (
                <div key={f.label}>
                  <label className="text-stone-400 text-sm font-medium block mb-1.5">{f.label}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-600" />
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={f.value}
                      onChange={(e) => { f.set(e.target.value); setErro(''); }}
                      onKeyDown={(e) => e.key === 'Enter' && salvar()}
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-stone-600 focus:border-amber-500 focus:outline-none transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                  {f.hint && <p className="text-stone-600 text-xs mt-1">{f.hint}</p>}
                </div>
              ))}
            </div>
            <button
              onClick={salvar}
              disabled={enviando}
              className="w-full mt-6 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-stone-950 font-bold py-3.5 rounded-xl transition-all hover:scale-[1.01] shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              {enviando && <Loader2 className="h-4 w-4 animate-spin" />}
              {enviando ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
