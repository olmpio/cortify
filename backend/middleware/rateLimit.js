import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import { MongoRateLimitStore } from '../services/mongoRateLimitStore.js';
import { logSeguranca } from '../utils/logger.js';

const msg = (texto) => ({ erro: texto });

// Com mais de 1 instância da API, use RATE_LIMIT_STORE=mongo (ou Redis) para o limite valer no conjunto.
const store = (prefixo) => (env.rateLimitStore === 'mongo' ? new MongoRateLimitStore(prefixo) : undefined);

const criar = (prefixo, { windowMs, limit, mensagem, keyGenerator }) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: msg(mensagem),
    store: store(prefixo),
    ...(keyGenerator ? { keyGenerator } : {}),
    handler(req, res, _next, options) {
      logSeguranca('rate_limit', { limitador: prefixo, ip: req.ip, rota: req.path, id: req.id });
      res.status(options.statusCode).json(options.message);
    },
  });

// Geral: protege a API inteira contra abuso.
export const limiteGeral = criar('geral', { windowMs: 60_000, limit: 300, mensagem: 'Muitas requisições. Tente novamente em instantes.' });

// Login/cadastro/reset por IP: freia força bruta e criação em massa de contas.
export const limiteAuth = criar('auth', { windowMs: 15 * 60_000, limit: 20, mensagem: 'Muitas tentativas. Aguarde 15 minutos e tente novamente.' });

// Login por E-MAIL alvo (independente do IP): freia força bruta distribuída contra UMA conta.
// Vale igualmente para e-mails que existem ou não (não revela quais contas existem).
export const limiteLoginPorEmail = criar('login-email', {
  windowMs: 15 * 60_000,
  limit: 10,
  mensagem: 'Muitas tentativas para este e-mail. Aguarde 15 minutos ou redefina sua senha.',
  keyGenerator: (req) => String(typeof req.body?.email === 'string' ? req.body.email : '').toLowerCase().trim().slice(0, 254) || 'vazio',
});

// Renovação de sessão (cookie): mais folgado que o login, pois acontece em uso normal.
export const limiteRefresh = criar('refresh', { windowMs: 15 * 60_000, limit: 60, mensagem: 'Muitas renovações de sessão. Aguarde alguns minutos.' });

// Reenvio de e-mails (verificação)
export const limiteEmail = criar('email', { windowMs: 60 * 60_000, limit: 6, mensagem: 'Limite de e-mails por hora atingido. Tente mais tarde.' });

// Criação pública de agendamento: freia spam de reservas falsas.
export const limiteAgendamento = criar('agendamento', { windowMs: 60 * 60_000, limit: 30, mensagem: 'Limite de agendamentos por hora atingido. Tente mais tarde.' });

// Envio de mensagens no chat: freia spam.
export const limiteChat = criar('chat', { windowMs: 60_000, limit: 30, mensagem: 'Você está enviando mensagens rápido demais. Aguarde um instante.' });

// Upload de imagens (corpo grande): freia abuso de armazenamento/banda.
export const limiteUpload = criar('upload', { windowMs: 60 * 60_000, limit: 20, mensagem: 'Limite de envios de imagem por hora atingido.' });
