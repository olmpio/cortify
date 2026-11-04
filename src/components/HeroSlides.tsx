import { useEffect, useState } from 'react';
import { HERO_IMAGES, HERO_INTERVALO_MS } from '@/config/siteImages';

/** Fundo do topo da home: alterna as fotos de HERO_IMAGES (edite em src/config/siteImages.ts). */
export function HeroSlides() {
  const [ativa, setAtiva] = useState(0);

  useEffect(() => {
    if (HERO_IMAGES.length < 2) return;
    const t = setInterval(() => setAtiva((i) => (i + 1) % HERO_IMAGES.length), HERO_INTERVALO_MS);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      {HERO_IMAGES.map((src, i) => (
        <img
          key={src}
          src={src}
          alt="Barbearia"
          loading={i === 0 ? 'eager' : 'lazy'}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${i === ativa ? 'opacity-40' : 'opacity-0'}`}
        />
      ))}
    </>
  );
}
