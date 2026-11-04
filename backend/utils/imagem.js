// Upload de imagens sem dependências extras: o front redimensiona/comprime a foto e envia
// como data URL (JSON). Aqui validamos de verdade (tipo, assinatura do arquivo e tamanho)
// e guardamos os bytes no MongoDB; a imagem é servida por uma rota própria (com cache).

const MAX_BYTES = 700 * 1024; // 700 KB depois de comprimida no navegador
const DATA_URL = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/;

function assinaturaOk(tipo, buf) {
  if (tipo === 'image/jpeg') return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  if (tipo === 'image/png') return buf.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  if (tipo === 'image/webp') return buf.subarray(0, 4).toString() === 'RIFF' && buf.subarray(8, 12).toString() === 'WEBP';
  return false;
}

/** Converte "data:image/jpeg;base64,..." em { tipo, dados } ou lança Error com mensagem amigável. */
export function lerDataUrl(valor) {
  if (typeof valor !== 'string') throw new Error('Envie uma imagem válida');
  const m = DATA_URL.exec(valor);
  if (!m) throw new Error('Formato inválido. Use JPG, PNG ou WebP.');
  const dados = Buffer.from(m[2], 'base64');
  if (dados.length > MAX_BYTES) throw new Error('Imagem muito grande (máximo 700 KB depois de comprimida).');
  if (!assinaturaOk(m[1], dados)) throw new Error('O arquivo não parece ser uma imagem válida.');
  return { tipo: m[1], dados };
}

/** Envia os bytes ao navegador com cache. CORP cross-origin: o front roda em outro domínio/porta. */
export function enviarImagem(res, tipo, dados) {
  res.set({
    'Content-Type': tipo,
    'Cache-Control': 'public, max-age=86400',
    'Cross-Origin-Resource-Policy': 'cross-origin',
  });
  res.send(dados);
}
