import UsuarioAdmin from '../models/UsuarioAdmin.js';
import { assinarAcesso, verificarAcesso } from '../services/sessaoService.js';
import { idValido } from '../utils/http.js';

export const gerarToken = (admin) => assinarAcesso('admin', admin);

export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  try {
    // Valida assinatura, algoritmo (HS256), emissor e audiência ("admin"): token de cliente nunca passa aqui.
    const decoded = verificarAcesso(authHeader.split(' ')[1], 'admin');
    const admin = await UsuarioAdmin.findById(decoded.id);

    if (!admin) return res.status(401).json({ erro: 'Usuário não encontrado' });

    // Token emitido antes da última troca de senha => inválido.
    if (admin.senhaAlteradaEm && decoded.iat * 1000 < admin.senhaAlteradaEm.getTime() - 1000) {
      return res.status(401).json({ erro: 'Sessão expirada. Faça login novamente.', codigo: 'TOKEN_EXPIRADO' });
    }

    req.admin = admin;
    req.barbeariaId = admin.barbeariaId;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError' || err.name === 'NotBeforeError') {
      return res.status(401).json({ erro: 'Token inválido ou expirado', codigo: 'TOKEN_EXPIRADO' });
    }
    next(err); // erro real (ex.: banco fora) => 500 + alerta
  }
}

/**
 * Isolamento entre barbearias (multi-tenant):
 * garante que o :barbeariaId (ou :id) da URL é o da barbearia do usuário logado.
 */
export function exigirMinhaBarbearia(param = 'barbeariaId') {
  return (req, res, next) => {
    const alvo = req.params[param];
    if (!idValido(alvo)) return res.status(400).json({ erro: 'ID inválido' });
    if (alvo !== req.barbeariaId.toString()) {
      return res.status(403).json({ erro: 'Você só pode acessar dados da sua própria barbearia' });
    }
    next();
  };
}
