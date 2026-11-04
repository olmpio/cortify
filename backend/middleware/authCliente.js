import Cliente from '../models/Cliente.js';
import { assinarAcesso, verificarAcesso } from '../services/sessaoService.js';

export const gerarTokenCliente = (cliente) => assinarAcesso('cliente', cliente);

/** Exige um cliente autenticado (access token com audiência "cliente"). Preenche req.cliente. */
export async function clienteAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Faça login para continuar' });
  }

  try {
    const decoded = verificarAcesso(authHeader.split(' ')[1], 'cliente');
    const cliente = await Cliente.findById(decoded.id);
    if (!cliente) return res.status(401).json({ erro: 'Conta não encontrada' });

    if (cliente.senhaAlteradaEm && decoded.iat * 1000 < cliente.senhaAlteradaEm.getTime() - 1000) {
      return res.status(401).json({ erro: 'Sessão expirada. Faça login novamente.', codigo: 'TOKEN_EXPIRADO' });
    }

    req.cliente = cliente;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError' || err.name === 'NotBeforeError') {
      return res.status(401).json({ erro: 'Sessão inválida ou expirada. Faça login novamente.', codigo: 'TOKEN_EXPIRADO' });
    }
    next(err);
  }
}

/** Ações que geram e-mails/mensagens para terceiros exigem e-mail confirmado (anti-abuso). */
export function exigirEmailVerificado(req, res, next) {
  if (!req.cliente.emailVerificado) {
    return res.status(403).json({
      erro: 'Confirme seu e-mail para continuar. Enviamos um link para a sua caixa de entrada.',
      codigo: 'EMAIL_NAO_VERIFICADO',
    });
  }
  next();
}
