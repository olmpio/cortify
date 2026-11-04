import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { enviarEmail } from './emailService.js';
import { templates } from './emailTemplates.js';

const iniciadoEm = Date.now();
const ultimosAlertas = new Map(); // tipo -> timestamp
const ultimosErros = []; // buffer circular dos últimos erros 5xx

const metricas = {
  requisicoes: 0,
  respostas5xx: 0,
  respostas4xx: 0,
  alertasEnviados: 0,
};

const janela5xx = []; // timestamps de 5xx no último minuto
let dbOnline = true;
let timers = [];

/**
 * Dispara um alerta por e-mail e/ou webhook.
 * Alertas do mesmo `tipo` respeitam um cooldown para não inundar a caixa de entrada.
 * `forcar` ignora o cooldown (usado em eventos de recuperação).
 */
export async function alertar(tipo, titulo, detalhes, { forcar = false } = {}) {
  const agora = Date.now();
  const ultimo = ultimosAlertas.get(tipo) || 0;
  if (!forcar && agora - ultimo < env.alerts.cooldownMs) return { enviado: false, motivo: 'cooldown' };
  ultimosAlertas.set(tipo, agora);
  metricas.alertasEnviados += 1;

  console.error(`🚨 ALERTA [${tipo}] ${titulo}\n${detalhes}`);

  const tarefas = [];

  if (env.alerts.emails.length) {
    const tpl = templates.alerta({ titulo, detalhes });
    tarefas.push(enviarEmail({ para: env.alerts.emails, assunto: tpl.assunto, html: tpl.html, texto: `${titulo}\n\n${detalhes}` }));
  }

  if (env.alerts.webhook) {
    tarefas.push(
      fetch(env.alerts.webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // "content" => Discord · "text" => Slack. Os dois campos são ignorados se não reconhecidos.
        body: JSON.stringify({ content: `🚨 **${titulo}**\n\`\`\`${detalhes.slice(0, 1500)}\`\`\``, text: `🚨 *${titulo}*\n${detalhes.slice(0, 1500)}` }),
        signal: AbortSignal.timeout(5000),
      }).catch((e) => console.error('Falha ao chamar webhook de alerta:', e.message))
    );
  }

  await Promise.allSettled(tarefas);
  return { enviado: true };
}

/** Middleware: conta requisições/erros e alerta em picos de 5xx. */
export function metricsMiddleware(req, res, next) {
  metricas.requisicoes += 1;
  res.on('finish', () => {
    if (res.statusCode >= 500) {
      metricas.respostas5xx += 1;
      const agora = Date.now();
      janela5xx.push(agora);
      while (janela5xx.length && agora - janela5xx[0] > 60_000) janela5xx.shift();
      if (janela5xx.length >= 10) {
        alertar('pico_5xx', 'Pico de erros 500 na API', `${janela5xx.length} respostas 5xx no último minuto.\nÚltima rota: ${req.method} ${req.originalUrl}`);
      }
    } else if (res.statusCode >= 400) {
      metricas.respostas4xx += 1;
    }
  });
  next();
}

/** Registra um erro no buffer e alerta (com cooldown por rota). */
export function registrarErro(err, req) {
  ultimosErros.unshift({
    quando: new Date().toISOString(),
    rota: `${req.method} ${req.originalUrl}`,
    mensagem: err.message,
  });
  if (ultimosErros.length > 20) ultimosErros.pop();

  alertar(
    `erro:${req.method}:${req.route?.path || req.path}`,
    'Erro interno na API',
    `${req.method} ${req.originalUrl}\n\n${err.stack || err.message}`
  );
}

async function pingDb() {
  if (mongoose.connection.readyState !== 1) return false;
  try {
    await mongoose.connection.db.admin().ping();
    return true;
  } catch {
    return false;
  }
}

export async function statusDb() {
  return (await pingDb()) ? 'online' : 'offline';
}

async function checarSaude() {
  // Banco de dados
  const ok = await pingDb();
  if (!ok && dbOnline) {
    dbOnline = false;
    await alertar('db_down', 'Banco de dados fora do ar', 'O MongoDB não respondeu ao ping. Os agendamentos não estão sendo gravados.');
  } else if (ok && !dbOnline) {
    dbOnline = true;
    await alertar('db_up', '✅ Banco de dados recuperado', 'O MongoDB voltou a responder.', { forcar: true });
  }

  // Memória (heap do Node)
  const { heapUsed, heapTotal } = process.memoryUsage();
  const uso = heapUsed / heapTotal;
  if (heapTotal > 150 * 1024 * 1024 && uso > 0.92) {
    await alertar('memoria', 'Uso de memória muito alto', `Heap em ${(uso * 100).toFixed(0)}% (${(heapUsed / 1048576).toFixed(0)} MB de ${(heapTotal / 1048576).toFixed(0)} MB). Possível vazamento de memória.`);
  }
}

/** Liga a checagem periódica e os handlers globais do processo. */
export function iniciarMonitoramento() {
  timers.push(setInterval(checarSaude, 30_000));
  timers.forEach((t) => t.unref?.());

  mongoose.connection.on('disconnected', () => {
    alertar('db_disconnected', 'Conexão com o MongoDB perdida', 'O driver reportou "disconnected".');
  });

  process.on('unhandledRejection', async (motivo) => {
    const msg = motivo instanceof Error ? motivo.stack : String(motivo);
    await alertar('unhandled', 'Promise rejeitada sem tratamento', msg, { forcar: true });
  });

  process.on('uncaughtException', async (err) => {
    await Promise.race([
      alertar('uncaught', '💥 Servidor caiu (uncaughtException)', err.stack || err.message, { forcar: true }),
      new Promise((r) => setTimeout(r, 4000)),
    ]);
    process.exit(1); // deixa o PM2/Docker/Render reiniciar o processo
  });
}

export function pararMonitoramento() {
  timers.forEach(clearInterval);
  timers = [];
}

export function snapshot() {
  const mem = process.memoryUsage();
  return {
    uptimeSegundos: Math.round((Date.now() - iniciadoEm) / 1000),
    iniciadoEm: new Date(iniciadoEm).toISOString(),
    memoriaMB: { rss: +(mem.rss / 1048576).toFixed(1), heapUsado: +(mem.heapUsed / 1048576).toFixed(1) },
    metricas,
    ultimosErros,
    alertasConfigurados: { email: env.alerts.emails.length > 0, webhook: !!env.alerts.webhook },
  };
}
