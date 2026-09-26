import { Router } from 'express';
import { getMyInvitations, updateInvitationStatus } from '../controllers/invitationsController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { invitationUpdateSchema } from '../validators/schemas.js';

const router = Router();

router.get('/', requireAuth, getMyInvitations);
router.put('/:id', requireAuth, validate(invitationUpdateSchema), updateInvitationStatus);

export default router;
