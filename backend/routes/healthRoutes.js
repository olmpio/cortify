import crypto from 'crypto';
import { Router } from 'express';
import { env } from '../config/env.js';
import { statusDb, snapshot } from '../services/monitorService.js';
import { verificarSmtp } from '../services/emailService.js';

const router = Router();

// Liveness: o processo está de pé? (use no UptimeRobot / Better Stack / healthcheck do Docker)
router.get('/', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Readiness: o processo + banco estão funcionando? Retorna 503 se algo crítico falhou.
router.get('/ready', async (_req, res) => {
  const db = await statusDb();
  const ok = db === 'online';
  res.status(ok ? 200 : 503).json({ status: ok ? 'ready' : 'degraded', db });
});

// Detalhes internos — protegido por token.
router.get('/details', async (req, res) => {
  const enviado = Buffer.from(String(req.headers['x-health-token'] || ''));
  const esperado = Buffer.from(env.healthToken);
  if (!env.healthToken || enviado.length !== esperado.length || !crypto.timingSafeEqual(enviado, esperado)) {
    return res.status(401).json({ erro: 'Não autorizado' });
  }
  res.json({ db: await statusDb(), smtp: await verificarSmtp(), ...snapshot() });
});

export default router;
