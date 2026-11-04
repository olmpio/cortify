import { Router } from 'express';
import {
  criarAgendamento,
  listarAgendamentosPorBarbearia,
  obterAgendamento,
  atualizarStatusAgendamento,
} from '../controllers/agendamentoController.js';
import { authMiddleware, exigirMinhaBarbearia } from '../middleware/auth.js';
import { clienteAuthMiddleware, exigirEmailVerificado } from '../middleware/authCliente.js';
import { limiteAgendamento } from '../middleware/rateLimit.js';

const router = Router();

// Agendar exige conta de cliente: nome, telefone e e-mail vêm da conta, não do corpo da requisição.
router.post('/', limiteAgendamento, clienteAuthMiddleware, exigirEmailVerificado, criarAgendamento);
router.get('/barbearia/:barbeariaId', authMiddleware, exigirMinhaBarbearia('barbeariaId'), listarAgendamentosPorBarbearia);
router.get('/:id', authMiddleware, obterAgendamento);
router.patch('/:id/status', authMiddleware, atualizarStatusAgendamento);

export default router;
