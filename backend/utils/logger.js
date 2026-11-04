// Logs estruturados (1 linha JSON por evento): fáceis de filtrar em Datadog/Loki/CloudWatch/Papertrail.
// NUNCA logue senhas, tokens, cookies ou corpo de requisições.
export function log(nivel, msg, extra = {}) {
  const linha = JSON.stringify({ t: new Date().toISOString(), nivel, msg, ...extra });
  (nivel === 'error' ? console.error : console.log)(linha);
}

/** Eventos de segurança (login falho, reuso de token, CORS bloqueado...): alerte sobre picos deles. */
export const logSeguranca = (evento, dados = {}) => log('warn', `seguranca:${evento}`, dados);
