import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { authApi, clienteApi } from '@/services/api';
import { Scissors, Check, AlertCircle, Loader2 } from 'lucide-react';

/** Destino do link "Confirmar e-mail" enviado por e-mail. */
export function VerificarEmailPage({ token, tipo }: { token: string; tipo: 'admin' | 'cliente' }) {
  const { navigate, recarregarAdmin, recarregarCliente } = useApp();
  const [estado, setEstado] = useState<'carregando' | 'ok' | 'erro'>('carregando');
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    let cancelado = false;
    (tipo === 'admin' ? authApi.verificarEmail(token) : clienteApi.verificarEmail(token))
      .then(async () => {
        if (cancelado) return;
        await (tipo === 'admin' ? recarregarAdmin() : recarregarCliente()).catch(() => {});
        if (!cancelado) setEstado('ok');
      })
      .catch((e: Error) => {
        if (cancelado) return;
        setMensagem(e.message);
        setEstado('erro');
      });
    return () => { cancelado = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, tipo]);

  const destino = tipo === 'admin' ? ({ name: 'admin-dashboard' } as const) : ({ name: 'home' } as const);

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-stone-900 rounded-2xl border border-stone-800 p-8 text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 mb-5">
          <Scissors className="h-7 w-7 text-amber-500" />
        </div>
        {estado === 'carregando' && (
          <p className="text-stone-400 text-sm flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin text-amber-500" /> Confirmando seu e-mail...</p>
        )}
        {estado === 'ok' && (
          <>
            <div className="mx-auto w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mb-4 border border-green-500/20"><Check className="h-7 w-7 text-green-500" /></div>
            <h1 className="text-white font-bold text-lg mb-2">E-mail confirmado!</h1>
            <p className="text-stone-400 text-sm mb-6">Sua conta está pronta para uso.</p>
            <button onClick={() => navigate(destino)} className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-3 rounded-xl transition-all">
              {tipo === 'admin' ? 'Ir para o painel' : 'Continuar'}
            </button>
          </>
        )}
        {estado === 'erro' && (
          <>
            <div className="mx-auto w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20"><AlertCircle className="h-7 w-7 text-red-400" /></div>
            <h1 className="text-white font-bold text-lg mb-2">Não foi possível confirmar</h1>
            <p className="text-stone-400 text-sm mb-6">{mensagem} Entre na sua conta e peça um novo link.</p>
            <button onClick={() => navigate(tipo === 'admin' ? { name: 'admin-login' } : { name: 'cliente-acesso', modo: 'login' })} className="w-full bg-stone-800 hover:bg-stone-700 text-white font-semibold py-3 rounded-xl transition-all">
              Entrar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
