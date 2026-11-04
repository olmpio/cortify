import { Router } from 'express';
import {
  listarBarbeirosPorBarbearia,
  criarBarbeiro,
  atualizarBarbeiro,
  deletarBarbeiro,
  buscarBarbeirosDisponiveis,
  buscarHorariosDisponiveis,
  atualizarFoto,
  obterFoto,
} from '../controllers/barbeiroController.js';
import { authMiddleware } from '../middleware/auth.js';
import { limiteUpload } from '../middleware/rateLimit.js';

const router = Router();

router.get('/barbearia/:barbeariaId', listarBarbeirosPorBarbearia);
router.get('/disponiveis', buscarBarbeirosDisponiveis);
router.get('/horarios-disponiveis', buscarHorariosDisponiveis);
router.get('/:id/foto', obterFoto);
router.put('/:id/foto', limiteUpload, authMiddleware, atualizarFoto);
router.post('/', authMiddleware, criarBarbeiro);
router.put('/:id', authMiddleware, atualizarBarbeiro);
router.delete('/:id', authMiddleware, deletarBarbeiro);

export default router;
