import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import Sessao from '../models/Sessao.js';
import { env } from '../config/env.js';
import { sha256 } from '../utils/validacao.js';
import { lerCookie } from '../utils/cookies.js';
import { logSeguranca } from '../utils/logger.js';

// Dois "perfis" independentes, cada um com seu cookie (e path) próprio
const PERFIS = {
  admin: { cookie: 'cortify_rt_admin', path: '/api/auth' },
  cliente: { cookie: 'cortify_rt_cliente', path: '/api/clientes' },
};

const JANELA_CONCORRENCIA_MS = 10_000; // 2 abas renovando ao mesmo tempo não é ataque

function opcoesCookie(tipo) {
  return {
    httpOnly: true, // JavaScript da página NÃO consegue ler: XSS não rouba o refresh token
    secure: env.cookie.secure,
    sameSite: env.cookie.sameSite,
    path: PERFIS[tipo].path,
    domain: env.cookie.domain,
  };
}

/** Access token curto (15 min). `audience` impede usar token de cliente no painel e vice-versa. */
export function assinarAcesso(tipo, usuario) {
  const payload = tipo === 'admin' ? { id: usuario._id, barbeariaId: usuario.barbeariaId, tipo } : { id: usuario._id, tipo };
  return jwt.sign(payload, env.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: env.accessTtl,
    issuer: env.jwtIssuer,
    audience: tipo,
  });
}

export function verificarAcesso(token, tipo) {
  return jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'], issuer: env.jwtIssuer, audience: tipo });
}

/** Cria uma sessão (família nova ou continuação) e grava o refresh token no cookie httpOnly. */
export async function iniciarSessao(req, res, tipo, usuarioId, familia = crypto.randomUUID()) {
  const token = crypto.randomBytes(48).toString('base64url');
  const expiraEm = new Date(Date.now() + env.refreshDays * 86_400_000);
  await Sessao.create({
    usuarioId,
    tipo,
    familia,
    tokenHash: sha256(token),
    expiraEm,
    userAgent: String(req.headers['user-agent'] || '').slice(0, 200),
  });
  res.cookie(PERFIS[tipo].cookie, token, { ...opcoesCookie(tipo), expires: expiraEm });
}

/**
 * Troca o refresh token por um novo (rotação). Retorna o usuarioId.
 * Lança { status, codigo } em caso de falha.
 */
export async function renovarSessao(req, res, tipo) {
  const token = lerCookie(req, PERFIS[tipo].cookie);
  if (!token) throw { status: 401, codigo: 'SEM_SESSAO' };

  const agora = new Date();
  const hash = sha256(token);

  // Atômico: só UMA requisição consegue "consumir" o token
  const sessao = await Sessao.findOneAndUpdate(
    { tokenHash: hash, tipo, usadoEm: null, revogadoEm: null, expiraEm: { $gt: agora } },
    { usadoEm: agora },
    { new: true }
  );

  if (!sessao) {
    const existente = await Sessao.findOne({ tokenHash: hash, tipo });
    if (existente && !existente.revogadoEm && existente.expiraEm > agora && existente.usadoEm) {
      if (agora - existente.usadoEm < JANELA_CONCORRENCIA_MS) {
        throw { status: 409, codigo: 'REFRESH_CONCORRENTE' }; // outra aba acabou de renovar; o front tenta de novo
      }
      // Token já usado reaparecendo fora da janela: alguém copiou o cookie. Derruba a sessão toda.
      await Sessao.updateMany({ familia: existente.familia }, { revogadoEm: agora });
      logSeguranca('refresh_token_reutilizado', { tipo, usuarioId: String(existente.usuarioId), ip: req.ip });
    }
    res.clearCookie(PERFIS[tipo].cookie, opcoesCookie(tipo));
    throw { status: 401, codigo: 'SESSAO_INVALIDA' };
  }

  await iniciarSessao(req, res, tipo, sessao.usuarioId, sessao.familia);
  return sessao.usuarioId;
}

/** Logout: revoga a família do cookie atual e apaga o cookie. */
export async function encerrarSessao(req, res, tipo) {
  const token = lerCookie(req, PERFIS[tipo].cookie);
  if (token) {
    const s = await Sessao.findOne({ tokenHash: sha256(token), tipo });
    if (s) await Sessao.updateMany({ familia: s.familia }, { revogadoEm: new Date() });
  }
  res.clearCookie(PERFIS[tipo].cookie, opcoesCookie(tipo));
}

/** Troca/redefinição de senha, exclusão de conta: derruba todos os dispositivos. */
export async function revogarTodas(tipo, usuarioId) {
  await Sessao.updateMany({ tipo, usuarioId, revogadoEm: null }, { revogadoEm: new Date() });
}
