import { Router } from 'express';
import { listarBarbearias, obterBarbearia, criarBarbearia, atualizarBarbearia } from '../controllers/barbeariaController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', listarBarbearias);
router.get('/:id', obterBarbearia);
router.post('/', criarBarbearia);
router.put('/:id', authMiddleware, atualizarBarbearia);

export default router;
