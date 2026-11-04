import { Router } from 'express';
import {
  login, cadastrar, perfil, refresh, logout, esqueciSenha, redefinirSenha, alterarSenha,
  verificarEmail, reenviarVerificacaoEmail,
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';
import { limiteAuth, limiteLoginPorEmail, limiteRefresh, limiteEmail } from '../middleware/rateLimit.js';
import { exigirOrigemConfiavel } from '../middleware/origem.js';

const router = Router();

router.post('/login', limiteAuth, limiteLoginPorEmail, login);
router.post('/cadastrar', limiteAuth, cadastrar);
router.post('/esqueci-senha', limiteAuth, esqueciSenha);
router.post('/redefinir-senha', limiteAuth, redefinirSenha);
router.post('/verificar-email', limiteAuth, verificarEmail);

// Rotas que usam o cookie httpOnly: exigem Origin confiável (anti-CSRF)
router.post('/refresh', exigirOrigemConfiavel, limiteRefresh, refresh);
router.post('/logout', exigirOrigemConfiavel, logout);

router.get('/perfil', authMiddleware, perfil);
router.post('/alterar-senha', limiteAuth, authMiddleware, alterarSenha);
router.post('/reenviar-verificacao', limiteEmail, authMiddleware, reenviarVerificacaoEmail);

export default router;
