import { Router } from 'express';
import { register, login, logout, getMe } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../validators/schemas.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);

export default router;
