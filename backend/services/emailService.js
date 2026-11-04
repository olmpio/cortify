import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!env.smtp.host) return null;
  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
    pool: true,
    maxConnections: 3,
  });
  return transporter;
}

/**
 * Envia um e-mail. NUNCA lança erro: falha de e-mail não pode derrubar
 * o fluxo principal (ex.: agendamento já foi salvo). Retorna { ok, erro? }.
 * Sem SMTP configurado, imprime o e-mail no console (modo dev).
 */
export async function enviarEmail({ para, assunto, html, texto }) {
  if (!para || (Array.isArray(para) && para.length === 0)) {
    return { ok: false, erro: 'Sem destinatário' };
  }

  const t = getTransporter();
  if (!t) {
    console.log(`\n📧 [E-MAIL SIMULADO] Para: ${[].concat(para).join(', ')}\n   Assunto: ${assunto}\n   (configure SMTP_HOST no .env para enviar de verdade)\n`);
    return { ok: true, simulado: true };
  }

  try {
    await t.sendMail({ from: env.smtp.from, to: para, subject: assunto, html, text: texto });
    return { ok: true };
  } catch (err) {
    console.error(`❌ Falha ao enviar e-mail "${assunto}":`, err.message);
    return { ok: false, erro: err.message };
  }
}

export async function verificarSmtp() {
  const t = getTransporter();
  if (!t) return { configurado: false };
  try {
    await t.verify();
    return { configurado: true, ok: true };
  } catch (err) {
    return { configurado: true, ok: false, erro: err.message };
  }
}
