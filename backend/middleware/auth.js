import jwt from 'jsonwebtoken';
import UsuarioAdmin from '../models/UsuarioAdmin.js';
import Barbearia from '../models/Barbearia.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await UsuarioAdmin.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({ erro: 'Usuário não encontrado' });
    }

    req.admin = admin;
    req.barbeariaId = admin.barbeariaId;
    next();
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
}

export async function proprietarioMiddleware(req, res, next) {
  if (!req.admin || !req.barbeariaId) {
    return res.status(403).json({ erro: 'Acesso negado' });
  }

  const barbeariaIdParam = req.params.barbeariaId || req.params.id || req.body.barbeariaId;

  if (barbeariaIdParam && barbeariaIdParam.toString() !== req.barbeariaId.toString()) {
    return res.status(403).json({ erro: 'Você só pode gerenciar sua própria barbearia' });
  }

  next();
}

export { JWT_SECRET };
