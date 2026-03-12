import { Router } from 'express';
import * as vendors from '../controllers/vendorsController';
import { verifyToken } from '../middleware/verifyToken';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.get('/',           vendors.listVendors);
router.get('/:id',        vendors.getVendor);
router.post('/register',  vendors.registerVendor);
router.patch('/:id',      verifyToken, requireRole('vendor', 'admin'), vendors.updateVendor);

export default router;
