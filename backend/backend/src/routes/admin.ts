import { Router } from 'express';
import { getPendingVendors, approveVendor, getUnapprovedEvents, approveEvent, getAllBookings } from '../controllers/adminController';
import { verifyToken } from '../middleware/verifyToken';
import { requireRole } from '../middleware/requireRole';

const router = Router();

// Only admins can access these routes
router.use(verifyToken);
router.use(requireRole('admin'));

router.get('/vendors/pending', getPendingVendors);
router.patch('/vendors/:id/approve', approveVendor);

router.get('/events', getUnapprovedEvents);
router.patch('/events/:id/approve', approveEvent);

router.get('/bookings', getAllBookings);

export default router;
