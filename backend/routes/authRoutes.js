import { Router } from 'express';
import { login, cadastrar, perfil } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/cadastrar', cadastrar);
router.get('/perfil', authMiddleware, perfil);

export default router;
