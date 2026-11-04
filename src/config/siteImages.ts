/**
 * ✏️ ONDE TROCAR AS IMAGENS DA PÁGINA INICIAL (HOME)
 * ───────────────────────────────────────────────────
 * É só editar a lista HERO_IMAGES abaixo. As fotos ficam como fundo do topo da home
 * e se alternam sozinhas (com 1 foto só, ela fica fixa).
 *
 * Duas formas de colocar uma foto:
 *   1) Link da internet:      'https://exemplo.com/minha-foto.jpg'
 *   2) Arquivo do projeto:    coloque a foto em  public/hero/  e use  '/hero/minha-foto.jpg'
 *
 * Dica: use fotos horizontais, de pelo menos 1600px de largura (JPG ou WebP, até ~400 KB).
 */
export const HERO_IMAGES: string[] = [
  'https://images.pexels.com/photos/3992856/pexels-photo-3992856.jpeg?auto=compress&cs=tinysrgb&w=1920',
  'https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&w=1920',
  'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1920',
];

/** Tempo (em milissegundos) que cada foto fica na tela antes de trocar. */
export const HERO_INTERVALO_MS = 6000;
