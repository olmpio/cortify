/**
 * ✏️ DADOS DA EMPRESA — PREENCHA ANTES DE IR AO AR
 * Aparecem nos Termos de Uso e na Política de Privacidade (exigência da LGPD: identificar o controlador dos dados
 * e um canal para o titular exercer seus direitos). Enquanto houver "[...]" abaixo, as páginas legais mostram
 * um aviso vermelho. Revise os textos com um advogado antes de publicar (src/components/LegalContent.tsx).
 */
export const EMPRESA = {
  produto: 'BarberSync',
  razaoSocial: '[RAZÃO SOCIAL DA EMPRESA]',
  cnpj: '[CNPJ]',
  endereco: '[ENDEREÇO COMPLETO]',
  emailPrivacidade: '[E-MAIL DO ENCARREGADO DE DADOS (DPO)]',
  foro: '[CIDADE/UF DO FORO]',
  atualizadoEm: '[DATA DA ÚLTIMA ATUALIZAÇÃO]',
};

export const faltaPreencher = Object.values(EMPRESA).some((v) => v.startsWith('['));
