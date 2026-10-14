import { Router } from 'express';
import {
  criarAgendamento,
  listarAgendamentosPorBarbearia,
  obterAgendamento,
  atualizarStatusAgendamento,
} from '../controllers/agendamentoController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/', criarAgendamento);
router.get('/barbearia/:barbeariaId', authMiddleware, listarAgendamentosPorBarbearia);
router.get('/:id', obterAgendamento);
router.patch('/:id/status', authMiddleware, atualizarStatusAgendamento);

export default router;
