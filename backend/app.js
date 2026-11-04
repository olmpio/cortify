import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { origemPermitidaCors } from './middleware/origem.js';
import { requestLogger } from './middleware/requestLogger.js';
import { sanitizar } from './middleware/sanitize.js';
import barbeariaRoutes from './routes/barbeariaRoutes.js';
import servicoRoutes from './routes/servicoRoutes.js';
import barbeiroRoutes from './routes/barbeiroRoutes.js';
import agendamentoRoutes from './routes/agendamentoRoutes.js';
import authRoutes from './routes/authRoutes.js';
import clienteRoutes from './routes/clienteRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import { limiteGeral } from './middleware/rateLimit.js';
import { metricsMiddleware } from './services/monitorService.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

// Atrás de proxy (Render, Railway, Nginx, Cloudflare...) o IP real vem em X-Forwarded-For.
// Necessário para o rate limit e os logs enxergarem o IP certo. TRUST_PROXY = nº de proxies na frente.
app.set('trust proxy', env.trustProxy);
app.disable('x-powered-by');

app.use(requestLogger);

// HTTPS obrigatório em produção (o health check é liberado para os monitores internos).
if (env.enforceHttps) {
  app.use((req, res, next) => {
    if (req.secure || req.path.startsWith('/health')) return next();
    res.redirect(308, `https://${req.headers.host}${req.originalUrl}`);
  });
}

// Esta API só devolve JSON/imagens: CSP restritiva impede que qualquer resposta seja usada como página.
app.use(
  helmet({
    contentSecurityPolicy: { directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"], baseUri: ["'none'"], formAction: ["'none'"] } },
    referrerPolicy: { policy: 'no-referrer' },
    strictTransportSecurity: { maxAge: 31_536_000, includeSubDomains: true },
  })
);
app.use(
  cors({
    origin(origin, cb) {
      // sem "origin" = chamadas servidor-a-servidor / curl / health checks
      if (origemPermitidaCors(origin)) return cb(null, true);
      cb(new Error('Origem não permitida pelo CORS'));
    },
    credentials: true, // necessário para o cookie httpOnly de renovação de sessão
    maxAge: 600,
  })
);

// Uploads de imagem (já comprimidas no navegador) precisam de um limite maior que o padrão.
// Este parser vem ANTES do global; depois que ele lê o corpo, o global não lê de novo.
app.use(['/api/barbearias/:id/imagem', '/api/barbeiros/:id/foto'], express.json({ limit: '1mb' }));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(sanitizar); // remove operadores $ / chaves perigosas (injeção NoSQL) de body, query e params
app.use(metricsMiddleware);

// Health checks ficam ANTES do rate limit para os monitores externos nunca serem bloqueados.
app.use('/health', healthRoutes);
app.use('/api', limiteGeral);

app.get('/', (_req, res) => {
  res.json({
    nome: 'BarberSync API',
    versao: '1.1.0',
    descricao: 'Sistema SaaS multi-barbearias para agendamento de horários',
    endpoints: {
      barbearias: '/api/barbearias',
      servicos: '/api/servicos',
      barbeiros: '/api/barbeiros',
      agendamentos: '/api/agendamentos',
      auth: '/api/auth',
      clientes: '/api/clientes',
      chat: '/api/chat',
      saude: '/health',
    },
  });
});

app.use('/api/barbearias', barbeariaRoutes);
app.use('/api/servicos', servicoRoutes);
app.use('/api/barbeiros', barbeiroRoutes);
app.use('/api/agendamentos', agendamentoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/chat', chatRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
