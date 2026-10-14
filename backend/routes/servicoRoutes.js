import { Router } from 'express';
import { listarServicosPorBarbearia, criarServico, atualizarServico, deletarServico } from '../controllers/servicoController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/barbearia/:barbeariaId', listarServicosPorBarbearia);
router.post('/', authMiddleware, criarServico);
router.put('/:id', authMiddleware, atualizarServico);
router.delete('/:id', authMiddleware, deletarServico);

export default router;
