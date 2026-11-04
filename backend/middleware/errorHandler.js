import { env } from '../config/env.js';
import { registrarErro } from '../services/monitorService.js';
import { log, logSeguranca } from '../utils/logger.js';

export function notFound(_req, res) {
  res.status(404).json({ erro: 'Rota não encontrada' });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ erro: 'JSON inválido' });
  if (err.type === 'entity.too.large') return res.status(413).json({ erro: 'Conteúdo grande demais' });
  if (err.message === 'Origem não permitida pelo CORS') {
    logSeguranca('cors_bloqueado', { origin: req.headers.origin, rota: req.originalUrl.split('?')[0], ip: req.ip, id: req.id });
    return res.status(403).json({ erro: err.message });
  }

  log('error', 'erro_interno', { id: req.id, rota: `${req.method} ${req.originalUrl.split('?')[0]}`, erro: err.message, stack: err.stack });
  registrarErro(err, req);

  // Nunca vaze stack/detalhes internos em produção. O id permite achar o erro nos logs.
  res.status(500).json({
    erro: 'Erro interno do servidor',
    ref: req.id,
    ...(env.isProd ? {} : { detalhe: err.message }),
  });
}
