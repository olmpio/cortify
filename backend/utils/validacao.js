// Funções puras de validação (sem dependências) — testáveis isoladamente.
import crypto from 'crypto';

export const sha256 = (v) => crypto.createHash('sha256').update(v).digest('hex');

export const emailValido = (e) => typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 254;
export const dataValida = (d) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d));
export const horaValida = (h) => typeof h === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(h);

// eslint-disable-next-line no-control-regex
const CONTROLE = /[\u0000-\u001F\u007F]/;
/** Nome de pessoa/estabelecimento: texto simples, sem caracteres de controle (evita injeção em logs/e-mails). */
export const nomeValido = (n, min = 2, max = 100) =>
  typeof n === 'string' && n.trim().length >= min && n.length <= max && !CONTROLE.test(n);
export const telefoneValido = (t) =>
  typeof t === 'string' && t.length <= 30 && !CONTROLE.test(t) && t.replace(/\D/g, '').length >= 10;

export function pick(obj = {}, chaves = []) {
  const out = {};
  for (const k of chaves) if (obj[k] !== undefined) out[k] = obj[k];
  return out;
}

// Senhas comuns que passariam na regra "8+ caracteres com letras e números"
const COMUNS = new Set([
  '12345678', '123456789', '1234567890', 'password', 'password1', 'password123', 'senha123', 'senha1234',
  'qwerty123', 'abc12345', 'admin123', 'admin1234', 'demo1234', 'a1234567', '11111111', '00000000',
  'barbearia1', 'barbearia123', 'barbeiro123', 'mudar123', 'trocar123', 'teste123', 'teste1234', 'iloveyou1',
]);

/** Retorna a mensagem de erro da política de senha, ou null se a senha é aceitável. */
export function senhaForte(senha, { email } = {}) {
  if (typeof senha !== 'string' || senha.length < 8) return 'A senha deve ter pelo menos 8 caracteres';
  if (Buffer.byteLength(senha) > 72) return 'A senha deve ter no máximo 72 caracteres'; // limite do bcrypt é em BYTES
  if (!/[A-Za-z]/.test(senha) || !/\d/.test(senha)) return 'A senha deve conter letras e números';
  if (COMUNS.has(senha.toLowerCase())) return 'Essa senha é muito comum. Escolha outra.';
  const parteEmail = typeof email === 'string' ? email.split('@')[0].toLowerCase() : '';
  if (parteEmail.length >= 4 && senha.toLowerCase().includes(parteEmail)) return 'A senha não pode conter o seu e-mail';
  return null;
}

/** Data/hora atual no fuso do Brasil (as barbearias operam em horário de Brasília). */
export function agoraBrasil() {
  const partes = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).format(new Date());
  const [data, hora] = partes.split(' ');
  return { data, hora };
}

export const paraMinutos = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
