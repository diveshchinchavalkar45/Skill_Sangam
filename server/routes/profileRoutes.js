import { Router } from 'express';
import {
  getMyProfile,
  updateMyProfile,
  getUserProfile,
  getUserSkills,
  getUserProjects
} from '../controllers/profileController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { profileUpdateSchema } from '../validators/schemas.js';

export const profileRouter = Router();
profileRouter.get('/me', requireAuth, getMyProfile);
profileRouter.put('/me', requireAuth, validate(profileUpdateSchema), updateMyProfile);

export const userRouter = Router();
userRouter.get('/:id', optionalAuth, getUserProfile);
userRouter.get('/:id/skills', getUserSkills);
userRouter.get('/:id/projects', getUserProjects);

export default {
  profileRouter,
  userRouter
};
