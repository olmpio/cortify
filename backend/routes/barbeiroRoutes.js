import { Router } from 'express';
import {
  listarBarbeirosPorBarbearia,
  criarBarbeiro,
  atualizarBarbeiro,
  deletarBarbeiro,
  buscarBarbeirosDisponiveis,
  buscarHorariosDisponiveis,
} from '../controllers/barbeiroController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/barbearia/:barbeariaId', listarBarbeirosPorBarbearia);
router.get('/disponiveis', buscarBarbeirosDisponiveis);
router.get('/horarios-disponiveis', buscarHorariosDisponiveis);
router.post('/', authMiddleware, criarBarbeiro);
router.put('/:id', authMiddleware, atualizarBarbeiro);
router.delete('/:id', authMiddleware, deletarBarbeiro);

export default router;
