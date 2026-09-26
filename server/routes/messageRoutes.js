import { Router } from 'express';
import { getProjectMessages, sendMessage, markAsRead } from '../controllers/messagesController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { messageSchema } from '../validators/schemas.js';
import { actionLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.get('/:projectId', requireAuth, getProjectMessages);
router.post('/:projectId', requireAuth, actionLimiter, validate(messageSchema), sendMessage);
router.put('/:id/read', requireAuth, markAsRead);

export default router;
