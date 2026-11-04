import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { authApi, type Perfil } from '@/services/api';
import { FormError } from '@/components/Feedback';
import { Scissors, Mail, ArrowLeft, Loader2, Check } from 'lucide-react';

export function AdminEsqueciSenhaPage({ tipo = 'admin' }: { tipo?: Perfil }) {
  const { navigate } = useApp();
  const [email, setEmail] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function enviar() {
    if (enviando) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErro('Informe um e-mail válido.');
      return;
    }
    setEnviando(true);
    setErro('');
    try {
      await authApi.esqueciSenha(email.trim(), tipo);
      setEnviado(true);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <button
          onClick={() => navigate(tipo === 'admin' ? { name: 'admin-login' } : { name: 'cliente-acesso', modo: 'login' })}
          className="text-stone-500 hover:text-amber-500 transition-colors mb-6 flex items-center gap-2 text-sm"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao login
        </button>

        <div className="bg-stone-900 rounded-2xl border border-stone-800 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <Scissors className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Recuperar senha</h1>
              <p className="text-stone-500 text-sm">BarberSync</p>
            </div>
          </div>

          {enviado ? (
            <div className="text-center py-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4 border border-green-500/20">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-white font-semibold mb-2">Verifique seu e-mail</p>
              <p className="text-stone-400 text-sm">
                Se <span className="text-stone-300">{email}</span> estiver cadastrado, você receberá um link para criar uma nova senha. O link vale por 1 hora.
              </p>
            </div>
          ) : (
            <>
              <p className="text-stone-400 text-sm mb-6">Informe o e-mail da sua conta e enviaremos um link para redefinir a senha.</p>
              <FormError mensagem={erro} />
              <label className="text-stone-400 text-sm font-medium block mb-1.5">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErro(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && enviar()}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-stone-600 focus:border-amber-500 focus:outline-none transition-colors"
                  placeholder="admin@sua.barbearia"
                />
              </div>
              <button
                onClick={enviar}
                disabled={enviando}
                className="w-full mt-6 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-stone-950 font-bold py-3.5 rounded-xl transition-all hover:scale-[1.01] shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                {enviando && <Loader2 className="h-4 w-4 animate-spin" />}
                {enviando ? 'Enviando...' : 'Enviar link'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
