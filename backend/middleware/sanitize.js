// Defesa contra injeção de operadores do MongoDB ({"email": {"$gt": ""}}) e prototype pollution.
// Remove chaves que começam com "$" ou contêm "." e chaves perigosas, em body/query/params.
const PERIGOSAS = new Set(['__proto__', 'constructor', 'prototype']);

export function limpar(valor, profundidade = 0) {
  if (!valor || typeof valor !== 'object') return valor;
  if (profundidade > 10) return {};
  for (const chave of Object.keys(valor)) {
    if (chave.startsWith('$') || chave.includes('.') || PERIGOSAS.has(chave)) {
      delete valor[chave];
    } else {
      limpar(valor[chave], profundidade + 1);
    }
  }
  return valor;
}

export function sanitizar(req, _res, next) {
  // HTTP parameter pollution: ?a=1&a=2 vira só o último valor (a API nunca espera arrays na query)
  if (req.query && typeof req.query === 'object') {
    for (const k of Object.keys(req.query)) {
      if (Array.isArray(req.query[k])) req.query[k] = req.query[k][req.query[k].length - 1];
    }
    limpar(req.query);
  }
  if (req.body) limpar(req.body);
  next();
}
