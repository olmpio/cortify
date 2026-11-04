import { useRef, useState, type ChangeEvent } from 'react';
import { comprimirImagem } from '@/utils/imagem';
import { imgSrc } from '@/services/api';
import { Camera, Loader2, Check, ImageIcon } from 'lucide-react';

interface Props {
  /** Foto atual (URL da API ou link externo). */
  atual?: string;
  /** Recebe a imagem já comprimida (data URL). Pode ser async (envio à API) ou só guardar no estado. */
  onEscolher: (dataUrl: string) => Promise<void> | void;
  formato: 'capa' | 'avatar';
  rotulo?: string;
  maxLado?: number;
}

/** Escolher foto → comprimir no navegador → entregar ao pai. Mostra prévia, carregando e erro. */
export function ImageUpload({ atual, onEscolher, formato, rotulo = 'Alterar foto', maxLado }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previa, setPrevia] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [ok, setOk] = useState(false);
  const [erro, setErro] = useState('');

  async function aoEscolher(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    e.target.value = ''; // permite escolher o mesmo arquivo de novo
    if (!arquivo) return;
    setErro('');
    setOk(false);
    setEnviando(true);
    try {
      const dataUrl = await comprimirImagem(arquivo, maxLado ?? (formato === 'capa' ? 1400 : 600));
      await onEscolher(dataUrl);
      setPrevia(dataUrl);
      setOk(true);
      setTimeout(() => setOk(false), 2500);
    } catch (err) {
      setErro((err as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  const src = previa ?? imgSrc(atual);
  const redondo = formato === 'avatar';

  return (
    <div className={redondo ? 'flex items-center gap-4' : ''}>
      <div
        className={`relative overflow-hidden bg-stone-800 border border-stone-700 flex items-center justify-center ${
          redondo ? 'w-20 h-20 rounded-full flex-shrink-0' : 'w-full h-44 rounded-xl'
        }`}
      >
        {src ? <img src={src} alt="Prévia" className="w-full h-full object-cover" /> : <ImageIcon className="h-8 w-8 text-stone-600" />}
        {enviando && (
          <div className="absolute inset-0 bg-stone-950/70 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
          </div>
        )}
      </div>

      <div className={redondo ? '' : 'mt-3'}>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={aoEscolher} className="hidden" />
        <button
          type="button"
          disabled={enviando}
          onClick={() => inputRef.current?.click()}
          className="bg-stone-800 hover:bg-stone-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
        >
          {ok ? <Check className="h-4 w-4 text-green-500" /> : <Camera className="h-4 w-4 text-amber-500" />}
          {ok ? 'Foto salva!' : rotulo}
        </button>
        <p className="text-stone-600 text-xs mt-1.5">JPG, PNG ou WebP. Ajustamos o tamanho automaticamente.</p>
        {erro && <p className="text-red-400 text-xs mt-1.5">{erro}</p>}
      </div>
    </div>
  );
}
