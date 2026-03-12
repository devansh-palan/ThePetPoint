import { Router } from 'express';
import * as events from '../controllers/eventsController';
import { verifyToken } from '../middleware/verifyToken';
import { optionalVerifyToken } from '../middleware/optionalVerifyToken';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.get('/',         optionalVerifyToken, events.listEvents);
router.get('/:id',      events.getEvent);
router.post('/',        verifyToken, requireRole('admin', 'vendor'), events.createEvent);
router.post('/:id/rsvp', verifyToken, events.rsvpEvent);

export default router;
