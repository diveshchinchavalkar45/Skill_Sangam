import { Router } from 'express';
import { recommendProjects } from '../controllers/recommendationsController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/projects', requireAuth, recommendProjects);

export default router;
