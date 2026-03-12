import { Router } from 'express';
import * as bookings from '../controllers/bookingsController';
import { verifyToken } from '../middleware/verifyToken';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.post('/',               verifyToken, bookings.createBooking);
router.get('/me',              verifyToken, bookings.getMyBookings);
router.get('/vendor',          verifyToken, requireRole('vendor', 'admin'), bookings.getVendorBookings);
router.patch('/:id/status',    verifyToken, requireRole('vendor', 'admin'), bookings.updateStatus);

export default router;
