import { imgSrc } from '@/services/api';
import { getAvatarIniciais } from '@/utils/helpers';

const TAMANHOS = {
  sm: 'w-9 h-9 text-sm',
  md: 'w-12 h-12 text-lg',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
};

/** Foto de perfil redonda; sem foto, mostra as iniciais (visual original). */
export function Avatar({ nome, foto, tamanho = 'md' }: { nome: string; foto?: string; tamanho?: keyof typeof TAMANHOS }) {
  const base = `${TAMANHOS[tamanho]} rounded-full flex-shrink-0 border border-amber-500/20`;
  if (foto) {
    return <img src={imgSrc(foto)} alt={nome} loading="lazy" className={`${base} object-cover bg-stone-800`} />;
  }
  return (
    <div className={`${base} bg-gradient-to-br from-amber-500/20 to-amber-700/10 flex items-center justify-center text-amber-500 font-bold`}>
      {getAvatarIniciais(nome)}
    </div>
  );
}
