import { useApp } from '@/context/AppContext';
import type { PageView } from '@/types';
import { ArrowLeft } from 'lucide-react';

/** Seta de voltar do painel. Por padrão volta ao Dashboard (de onde todas as telas são abertas). */
export function BackButton({ para = { name: 'admin-dashboard' } }: { para?: PageView }) {
  const { navigate } = useApp();
  return (
    <button
      onClick={() => navigate(para)}
      title="Voltar"
      aria-label="Voltar"
      className="p-2 -ml-2 rounded-lg text-stone-400 hover:text-amber-500 hover:bg-stone-800 transition-colors"
    >
      <ArrowLeft className="h-5 w-5" />
    </button>
  );
}
