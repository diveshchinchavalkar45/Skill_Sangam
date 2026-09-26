import { Router } from 'express';
import { getMyRequests, updateRequestStatus } from '../controllers/requestsController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { joinRequestUpdateSchema } from '../validators/schemas.js';

const router = Router();

router.get('/my', requireAuth, getMyRequests);
router.put('/:id', requireAuth, validate(joinRequestUpdateSchema), updateRequestStatus);

export default router;
