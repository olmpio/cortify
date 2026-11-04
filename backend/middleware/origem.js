import { env } from '../config/env.js';
import { logSeguranca } from '../utils/logger.js';

const permitida = (origin) => env.clientUrls.includes(origin) || (!env.isProd && /^https?:\/\/localhost(:\d+)?$/.test(origin));

/**
 * Proteção CSRF para rotas que usam COOKIE (refresh/logout): o navegador sempre envia o header Origin
 * em requisições POST cross-site, e ele não pode ser forjado por páginas maliciosas.
 * Sem Origin = cliente não-navegador (curl/servidor), que não carrega o cookie da vítima.
 */
export function exigirOrigemConfiavel(req, res, next) {
  const origin = req.headers.origin;
  if (origin && !permitida(origin)) {
    logSeguranca('origem_bloqueada', { origin, rota: req.path, ip: req.ip, id: req.id });
    return res.status(403).json({ erro: 'Origem não permitida' });
  }
  next();
}

export const origemPermitidaCors = (origin) => !origin || permitida(origin);
