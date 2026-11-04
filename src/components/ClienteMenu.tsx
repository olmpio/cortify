import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { getAvatarIniciais } from '@/utils/helpers';
import { LogIn, User, CalendarClock, LogOut, ChevronDown, MessageCircle } from 'lucide-react';

/** Botão de acesso do cliente: "Entrar" para visitantes, menu da conta para clientes logados. */
export function ClienteMenu() {
  const { cliente, navigate, clienteLogout } = useApp();
  const [aberto, setAberto] = useState(false);

  if (!cliente) {
    return (
      <button
        onClick={() => navigate({ name: 'cliente-acesso', modo: 'login' })}
        className="bg-stone-900/80 backdrop-blur-sm border border-stone-700 hover:border-amber-500 text-stone-200 hover:text-amber-500 font-semibold px-4 py-2 rounded-xl transition-all text-sm flex items-center gap-2"
      >
        <LogIn className="h-4 w-4" /> Entrar
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setAberto((v) => !v)}
        className="bg-stone-900/80 backdrop-blur-sm border border-stone-700 hover:border-amber-500 text-stone-200 px-3 py-1.5 rounded-xl transition-all text-sm flex items-center gap-2"
      >
        <span className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-700/10 flex items-center justify-center text-amber-500 font-bold text-xs border border-amber-500/20">
          {getAvatarIniciais(cliente.nome)}
        </span>
        <span className="hidden sm:block max-w-[120px] truncate font-medium">{cliente.nome.split(' ')[0]}</span>
        <ChevronDown className="h-4 w-4 text-stone-500" />
      </button>

      {aberto && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setAberto(false)} />
          <div className="absolute right-0 mt-2 w-60 z-30 bg-stone-900 border border-stone-800 rounded-xl shadow-xl shadow-black/40 overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-800">
              <p className="text-white text-sm font-semibold truncate flex items-center gap-2"><User className="h-4 w-4 text-amber-500" /> {cliente.nome}</p>
              <p className="text-stone-500 text-xs truncate mt-0.5">{cliente.email}</p>
            </div>
            <button
              onClick={() => { setAberto(false); navigate({ name: 'cliente-agendamentos' }); }}
              className="w-full text-left px-4 py-2.5 text-stone-300 hover:bg-stone-800 hover:text-white text-sm flex items-center gap-3 transition-colors"
            >
              <CalendarClock className="h-4 w-4 text-amber-500" /> Meus agendamentos
            </button>
            <button
              onClick={() => { setAberto(false); navigate({ name: 'cliente-chat' }); }}
              className="w-full text-left px-4 py-2.5 text-stone-300 hover:bg-stone-800 hover:text-white text-sm flex items-center gap-3 transition-colors"
            >
              <MessageCircle className="h-4 w-4 text-amber-500" /> Mensagens
            </button>
            <button
              onClick={() => { setAberto(false); clienteLogout(); navigate({ name: 'home' }); }}
              className="w-full text-left px-4 py-2.5 text-stone-500 hover:bg-stone-800 hover:text-red-400 text-sm flex items-center gap-3 transition-colors"
            >
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </div>
        </>
      )}
    </div>
  );
}
