import { Router } from 'express';
import { listarBarbearias, obterBarbearia, atualizarBarbearia, atualizarImagem, obterImagem } from '../controllers/barbeariaController.js';
import { authMiddleware, exigirMinhaBarbearia } from '../middleware/auth.js';
import { limiteUpload } from '../middleware/rateLimit.js';

const router = Router();

router.get('/', listarBarbearias);
router.get('/:id', obterBarbearia);
router.get('/:id/imagem', obterImagem);
router.put('/:id/imagem', limiteUpload, authMiddleware, exigirMinhaBarbearia('id'), atualizarImagem);
router.put('/:id', authMiddleware, exigirMinhaBarbearia('id'), atualizarBarbearia);

export default router;
