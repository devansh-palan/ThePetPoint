import { Router } from 'express';
import * as posts from '../controllers/postsController';
import { verifyToken } from '../middleware/verifyToken';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.get('/',      posts.getFeed);
router.post('/',     verifyToken, posts.createPost);
router.delete('/:id', verifyToken, requireRole('admin'), posts.deletePost);

export default router;
