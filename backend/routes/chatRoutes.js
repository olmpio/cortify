import { Router } from 'express';
import {
  listarConversasCliente, iniciarConversa, mensagensCliente, enviarMensagemCliente,
  listarConversasAdmin, naoLidasAdmin, mensagensAdmin, enviarMensagemAdmin,
} from '../controllers/chatController.js';
import { authMiddleware } from '../middleware/auth.js';
import { clienteAuthMiddleware, exigirEmailVerificado } from '../middleware/authCliente.js';
import { limiteChat } from '../middleware/rateLimit.js';

const router = Router();

// Cliente final
router.get('/conversas', clienteAuthMiddleware, listarConversasCliente);
router.post('/conversas', clienteAuthMiddleware, exigirEmailVerificado, iniciarConversa);
router.get('/conversas/:id/mensagens', clienteAuthMiddleware, mensagensCliente);
router.post('/conversas/:id/mensagens', limiteChat, clienteAuthMiddleware, exigirEmailVerificado, enviarMensagemCliente);

// Painel da barbearia
router.get('/admin/conversas', authMiddleware, listarConversasAdmin);
router.get('/admin/nao-lidas', authMiddleware, naoLidasAdmin);
router.get('/admin/conversas/:id/mensagens', authMiddleware, mensagensAdmin);
router.post('/admin/conversas/:id/mensagens', limiteChat, authMiddleware, enviarMensagemAdmin);

export default router;
