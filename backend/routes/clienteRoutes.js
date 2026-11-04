import { Router } from 'express';
import {
  cadastrar, login, refresh, logout, perfil, atualizarPerfil, meusAgendamentos, esqueciSenha, redefinirSenha,
  verificarEmail, reenviarVerificacaoEmail, exportarDados, excluirConta,
} from '../controllers/clienteController.js';
import { clienteAuthMiddleware } from '../middleware/authCliente.js';
import { limiteAuth, limiteLoginPorEmail, limiteRefresh, limiteEmail } from '../middleware/rateLimit.js';
import { exigirOrigemConfiavel } from '../middleware/origem.js';

const router = Router();

router.post('/cadastrar', limiteAuth, cadastrar);
router.post('/login', limiteAuth, limiteLoginPorEmail, login);
router.post('/esqueci-senha', limiteAuth, esqueciSenha);
router.post('/redefinir-senha', limiteAuth, redefinirSenha);
router.post('/verificar-email', limiteAuth, verificarEmail);

// Rotas que usam o cookie httpOnly: exigem Origin confiável (anti-CSRF)
router.post('/refresh', exigirOrigemConfiavel, limiteRefresh, refresh);
router.post('/logout', exigirOrigemConfiavel, logout);

router.get('/perfil', clienteAuthMiddleware, perfil);
router.put('/perfil', clienteAuthMiddleware, atualizarPerfil);
router.get('/agendamentos', clienteAuthMiddleware, meusAgendamentos);
router.post('/reenviar-verificacao', limiteEmail, clienteAuthMiddleware, reenviarVerificacaoEmail);

// LGPD: direitos do titular
router.get('/meus-dados', clienteAuthMiddleware, exportarDados);
router.delete('/conta', limiteAuth, clienteAuthMiddleware, excluirConta);

export default router;
