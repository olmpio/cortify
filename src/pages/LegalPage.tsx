import { useApp } from '@/context/AppContext';
import { TermosConteudo, PrivacidadeConteudo } from '@/components/LegalContent';
import { ArrowLeft } from 'lucide-react';

export function LegalPage({ documento }: { documento: 'termos' | 'privacidade' }) {
  const { navigate } = useApp();
  return (
    <div className="min-h-screen bg-stone-950">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <button onClick={() => navigate({ name: 'home' })} className="text-stone-500 hover:text-amber-500 transition-colors mb-6 flex items-center gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" /> Voltar ao site
        </button>
        <h1 className="text-2xl font-bold text-white mb-6">{documento === 'termos' ? 'Termos de Uso' : 'Política de Privacidade'}</h1>
        <div className="bg-stone-900 rounded-2xl border border-stone-800 p-6 md:p-8">
          {documento === 'termos' ? <TermosConteudo /> : <PrivacidadeConteudo />}
        </div>
      </div>
    </div>
  );
}
