/**
 * Redimensiona e comprime uma foto escolhida pelo usuário, no próprio navegador,
 * e devolve uma data URL JPEG pronta para enviar à API (limite do servidor: 700 KB).
 */
export async function comprimirImagem(file: File, maxLado = 1280): Promise<string> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error('Use uma imagem JPG, PNG ou WebP.');
  if (file.size > 15 * 1024 * 1024) throw new Error('A imagem é muito grande (máximo de 15 MB).');

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new Error('Não foi possível abrir essa imagem.');
  }

  const escala = Math.min(1, maxLado / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * escala);
  canvas.height = Math.round(bitmap.height * escala);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Seu navegador não suporta o envio de imagens.');
  ctx.fillStyle = '#1c1917'; // fundo para PNG/WebP com transparência (JPEG não tem alfa)
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const LIMITE = 650 * 1024; // folga abaixo dos 700 KB do servidor
  let qualidade = 0.85;
  let url = canvas.toDataURL('image/jpeg', qualidade);
  while (url.length * 0.75 > LIMITE && qualidade > 0.4) {
    qualidade -= 0.1;
    url = canvas.toDataURL('image/jpeg', qualidade);
  }
  if (url.length * 0.75 > LIMITE) throw new Error('Não consegui reduzir essa imagem o bastante. Tente uma menor.');
  return url;
}
