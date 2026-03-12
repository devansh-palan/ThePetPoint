import { Router } from 'express';
import * as users from '../controllers/usersController';
import { verifyToken } from '../middleware/verifyToken';

const router = Router();

router.get('/:username', users.getByUsername);
router.patch('/me',      verifyToken, users.updateMe);

export default router;
