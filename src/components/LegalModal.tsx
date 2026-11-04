import { X } from 'lucide-react';
import { TermosConteudo, PrivacidadeConteudo } from '@/components/LegalContent';

/** Mostra os Termos/Privacidade sem sair do formulário (não perde o que o usuário digitou). */
export function LegalModal({ documento, onFechar }: { documento: 'termos' | 'privacidade'; onFechar: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onFechar}>
      <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-stone-800">
          <h2 className="text-white font-bold">{documento === 'termos' ? 'Termos de Uso' : 'Política de Privacidade'}</h2>
          <button onClick={onFechar} aria-label="Fechar" className="text-stone-500 hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        <div className="overflow-y-auto p-5">{documento === 'termos' ? <TermosConteudo /> : <PrivacidadeConteudo />}</div>
      </div>
    </div>
  );
}

/** Caixa de aceite com links que abrem o modal. */
export function AceiteTermos({
  marcado, onChange, onAbrir,
}: { marcado: boolean; onChange: (v: boolean) => void; onAbrir: (d: 'termos' | 'privacidade') => void }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input type="checkbox" checked={marcado} onChange={(e) => onChange(e.target.checked)} className="mt-1 accent-amber-500" />
      <span className="text-stone-400 text-xs leading-relaxed">
        Li e aceito os{' '}
        <button type="button" onClick={() => onAbrir('termos')} className="text-amber-500 hover:text-amber-400 underline">Termos de Uso</button>{' '}
        e a{' '}
        <button type="button" onClick={() => onAbrir('privacidade')} className="text-amber-500 hover:text-amber-400 underline">Política de Privacidade</button>.
      </span>
    </label>
  );
}
