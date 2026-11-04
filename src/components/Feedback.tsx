import { Loader2, AlertCircle } from 'lucide-react';

export function Loading({ label = 'Carregando...', fullScreen = true }: { label?: string; fullScreen?: boolean }) {
  return (
    <div className={`${fullScreen ? 'min-h-screen bg-stone-950' : 'py-16'} flex items-center justify-center`}>
      <div className="flex items-center gap-3 text-stone-400 text-sm">
        <Loader2 className="h-5 w-5 animate-spin text-amber-500" /> {label}
      </div>
    </div>
  );
}

export function ErrorBox({ mensagem, onRetry, fullScreen = true }: { mensagem: string; onRetry?: () => void; fullScreen?: boolean }) {
  return (
    <div className={`${fullScreen ? 'min-h-screen bg-stone-950' : 'py-12'} flex items-center justify-center px-4`}>
      <div className="max-w-sm text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
          <AlertCircle className="h-7 w-7 text-red-400" />
        </div>
        <p className="text-stone-300 text-sm">{mensagem}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-5 bg-stone-800 hover:bg-stone-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all"
          >
            Tentar novamente
          </button>
        )}
      </div>
    </div>
  );
}

export function FormError({ mensagem }: { mensagem: string }) {
  if (!mensagem) return null;
  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 flex items-center gap-2">
      <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
      <p className="text-red-400 text-sm">{mensagem}</p>
    </div>
  );
}
