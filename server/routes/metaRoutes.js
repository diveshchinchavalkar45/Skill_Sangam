import { Router } from 'express';
import { getSkills, getSkillCategories, getDomains, getRoles } from '../controllers/metaController.js';
import { getMyAvailability, updateMyAvailability } from '../controllers/availabilityController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { availabilitySchema } from '../validators/schemas.js';

export const skillsRouter = Router();
skillsRouter.get('/', getSkills);
skillsRouter.get('/categories', getSkillCategories);

export const domainsRouter = Router();
domainsRouter.get('/', getDomains);

export const rolesRouter = Router();
rolesRouter.get('/', getRoles);

export const availabilityRouter = Router();
availabilityRouter.get('/me', requireAuth, getMyAvailability);
availabilityRouter.put('/me', requireAuth, validate(availabilitySchema), updateMyAvailability);

export default {
  skillsRouter,
  domainsRouter,
  rolesRouter,
  availabilityRouter
};
