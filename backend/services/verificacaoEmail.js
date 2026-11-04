import crypto from 'crypto';
import { env } from '../config/env.js';
import { sha256 } from '../utils/validacao.js';
import { enviarEmail } from './emailService.js';
import { templates } from './emailTemplates.js';

const VALIDADE_MS = 24 * 60 * 60 * 1000;
const INTERVALO_REENVIO_MS = 60 * 1000;

/** Gera um token, guarda só o hash e envia o link por e-mail. `tipo` = 'admin' | 'cliente'. */
export async function enviarVerificacao(Model, usuario, tipo) {
  const token = crypto.randomBytes(32).toString('hex');
  await Model.updateOne(
    { _id: usuario._id },
    { verificacaoHash: sha256(token), verificacaoExpira: new Date(Date.now() + VALIDADE_MS), verificacaoEnviadaEm: new Date() }
  );
  const link = `${env.clientUrl}/?verificar=${token}&tipo=${tipo}`;
  const t = templates.verificarEmail({ nome: usuario.nome, link });
  enviarEmail({ para: usuario.email, assunto: t.assunto, html: t.html });
}

/** Reenvio com intervalo mínimo de 60 s. Retorna false se pediu cedo demais. */
export async function reenviarVerificacao(Model, usuario, tipo) {
  const u = await Model.findById(usuario._id).select('+verificacaoEnviadaEm');
  if (u.verificacaoEnviadaEm && Date.now() - u.verificacaoEnviadaEm.getTime() < INTERVALO_REENVIO_MS) return false;
  await enviarVerificacao(Model, u, tipo);
  return true;
}

/** Confirma o e-mail a partir do token do link. Retorna true se válido. */
export async function confirmarVerificacao(Model, token) {
  if (typeof token !== 'string' || token.length < 32 || token.length > 200) return false;
  const u = await Model.findOneAndUpdate(
    { verificacaoHash: sha256(token), verificacaoExpira: { $gt: new Date() } },
    { emailVerificado: true, $unset: { verificacaoHash: 1, verificacaoExpira: 1 } }
  );
  return !!u;
}
