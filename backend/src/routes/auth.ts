import { Router } from 'express';
import * as auth from '../controllers/authController';
import { verifyToken } from '../middleware/verifyToken';

const router = Router();

router.post('/signup',  auth.signup);
router.post('/login',   auth.login);
router.post('/logout',  verifyToken, auth.logout);
router.get('/me',       verifyToken, auth.me);

export default router;
