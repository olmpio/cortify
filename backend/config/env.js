import dotenv from 'dotenv';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';
const lista = (v) => (v || '').split(',').map((s) => s.trim()).filter(Boolean);
const semBarra = (u) => u.replace(/\/$/, '');

const fraco = ['', 'fallback_secret', 'seu_segredo_jwt_super_secreto_troque_em_producao', 'troque_por_um_segredo_longo_e_aleatorio', 'dev_only_secret_change_me'];
const clientUrls = (lista(process.env.CLIENT_URL).length ? lista(process.env.CLIENT_URL) : ['http://localhost:5173']).map(semBarra);

// ───── Validações de produção: o servidor se RECUSA a subir configurado de forma insegura ─────
const problemas = [];
if (fraco.includes(process.env.JWT_SECRET || '') || (process.env.JWT_SECRET || '').length < 32) {
  problemas.push('JWT_SECRET ausente/fraco (use 48+ caracteres aleatórios: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))")');
}
if (!clientUrls.every((u) => u.startsWith('https://'))) problemas.push('CLIENT_URL deve usar https:// em produção');
if (!process.env.MONGODB_URI || /localhost|127\.0\.0\.1/.test(process.env.MONGODB_URI)) problemas.push('MONGODB_URI deve apontar para um banco gerenciado (não localhost)');
if ((process.env.SAMESITE || process.env.COOKIE_SAMESITE) === 'none' && process.env.COOKIE_SECURE === 'false') problemas.push('COOKIE_SAMESITE=none exige cookies Secure');

if (problemas.length) {
  if (isProd) {
    console.error('❌ Configuração insegura para produção:\n - ' + problemas.join('\n - '));
    process.exit(1);
  }
  const aviso = problemas.filter((x) => x.startsWith('JWT_SECRET'));
  if (aviso.length) console.warn('⚠️  ' + aviso.join('\n') + ' (aceitável só em desenvolvimento)');
}

export const env = {
  isProd,
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/barbersync',
  mongoPool: Number(process.env.MONGO_POOL_SIZE) || 20,
  clientUrls,
  clientUrl: clientUrls[0], // usada nos links dos e-mails
  trustProxy: Number(process.env.TRUST_PROXY ?? 1),
  enforceHttps: process.env.ENFORCE_HTTPS ? process.env.ENFORCE_HTTPS === 'true' : isProd,

  jwtSecret: process.env.JWT_SECRET || 'dev_only_secret_change_me',
  accessTtl: process.env.ACCESS_TOKEN_TTL || '15m', // token de acesso curto; a renovação usa o cookie httpOnly
  refreshDays: Number(process.env.REFRESH_TOKEN_DAYS) || 14,
  jwtIssuer: 'cortify',

  cookie: {
    // lax = front e API no MESMO site (ex.: app.seudominio.com e api.seudominio.com). none = sites diferentes.
    sameSite: process.env.COOKIE_SAMESITE || 'lax',
    secure: process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === 'true' : isProd,
    domain: process.env.COOKIE_DOMAIN || undefined,
  },

  rateLimitStore: process.env.RATE_LIMIT_STORE || 'memory', // 'mongo' quando houver mais de 1 instância

  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'BarberSync <no-reply@localhost>',
  },
  alerts: {
    emails: lista(process.env.ALERT_EMAILS),
    webhook: process.env.ALERT_WEBHOOK_URL || '',
    cooldownMs: (Number(process.env.ALERT_COOLDOWN_MIN) || 15) * 60 * 1000,
  },
  healthToken: process.env.HEALTH_TOKEN || '',
};
