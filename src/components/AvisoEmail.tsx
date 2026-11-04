import { useState } from 'react';
import { authApi, clienteApi, type Perfil } from '@/services/api';
import { MailWarning, Loader2 } from 'lucide-react';

/** Faixa "confirme seu e-mail" com botão de reenvio. */
export function AvisoEmail({ perfil, email }: { perfil: Perfil; email: string }) {
  const [estado, setEstado] = useState<'ocioso' | 'enviando' | 'enviado'>('ocioso');
  const [erro, setErro] = useState('');

  async function reenviar() {
    setEstado('enviando');
    setErro('');
    try {
      await (perfil === 'admin' ? authApi.reenviarVerificacao() : clienteApi.reenviarVerificacao());
      setEstado('enviado');
    } catch (e) {
      setErro((e as Error).message);
      setEstado('ocioso');
    }
  }

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex flex-wrap items-center gap-3">
      <MailWarning className="h-5 w-5 text-amber-500 flex-shrink-0" />
      <div className="flex-1 min-w-[200px]">
        <p className="text-amber-400 text-sm font-semibold">Confirme seu e-mail</p>
        <p className="text-stone-400 text-xs">
          Enviamos um link para <span className="text-stone-300">{email}</span>.
          {perfil === 'cliente' && ' Sem a confirmação não é possível agendar nem enviar mensagens.'}
        </p>
        {erro && <p className="text-red-400 text-xs mt-1">{erro}</p>}
      </div>
      <button
        onClick={reenviar}
        disabled={estado !== 'ocioso'}
        className="bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-stone-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2 transition-all"
      >
        {estado === 'enviando' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {estado === 'enviado' ? 'Link reenviado!' : 'Reenviar e-mail'}
      </button>
    </div>
  );
}
