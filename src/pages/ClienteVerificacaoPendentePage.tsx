import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { AvisoEmail } from '@/components/AvisoEmail';
import { ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';

/** Mostrada no lugar do agendamento/chat enquanto o e-mail do cliente não foi confirmado. */
export function ClienteVerificacaoPendentePage() {
  const { cliente, navigate, recarregarCliente, clienteLogout } = useApp();
  const [verificando, setVerificando] = useState(false);

  async function jaConfirmei() {
    setVerificando(true);
    try { await recarregarCliente(); } finally { setVerificando(false); }
  }

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <button onClick={() => navigate({ name: 'home' })} className="text-stone-500 hover:text-amber-500 transition-colors mb-6 flex items-center gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" /> Voltar ao site
        </button>
        <div className="bg-stone-900 rounded-2xl border border-stone-800 p-8">
          <h1 className="text-xl font-bold text-white mb-2">Falta só confirmar seu e-mail</h1>
          <p className="text-stone-400 text-sm mb-6">
            Por segurança, precisamos confirmar que o endereço é seu antes de liberar agendamentos e mensagens. Abra o e-mail que
            enviamos e clique em <strong className="text-stone-300">Confirmar e-mail</strong>.
          </p>
          {cliente && <AvisoEmail perfil="cliente" email={cliente.email} />}
          <button
            onClick={jaConfirmei}
            disabled={verificando}
            className="w-full mt-5 bg-stone-800 hover:bg-stone-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
          >
            {verificando ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Já confirmei
          </button>
          <button onClick={() => { clienteLogout(); navigate({ name: 'home' }); }} className="w-full mt-3 text-stone-500 hover:text-stone-300 text-sm py-2">
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
