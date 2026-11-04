import crypto from 'crypto';
import { log } from '../utils/logger.js';

/** Dá um ID a cada requisição (header X-Request-Id) e registra 1 linha JSON por resposta, sem dados sensíveis. */
export function requestLogger(req, res, next) {
  req.id = crypto.randomUUID();
  res.set('X-Request-Id', req.id);
  const inicio = process.hrtime.bigint();

  res.on('finish', () => {
    if (req.originalUrl.startsWith('/health')) return; // evita ruído dos monitores
    log(res.statusCode >= 500 ? 'error' : 'info', 'http', {
      id: req.id,
      metodo: req.method,
      rota: req.originalUrl.split('?')[0], // sem query string (pode conter tokens)
      status: res.statusCode,
      ms: Number((process.hrtime.bigint() - inicio) / 1_000_000n),
      ip: req.ip,
    });
  });
  next();
}
