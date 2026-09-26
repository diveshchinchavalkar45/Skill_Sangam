import { Router } from 'express';
import {
  getOrganizerDashboard,
  getEvents,
  getEventUsers,
  getEventProjects
} from '../controllers/organizerController.js';
import { requireAuth, requireOrganizer } from '../middleware/auth.js';

const router = Router();

// Require authenticated user with organizer role
router.get('/dashboard', requireAuth, requireOrganizer, getOrganizerDashboard);
router.get('/events', requireAuth, requireOrganizer, getEvents);
router.get('/events/:eventId/users', requireAuth, requireOrganizer, getEventUsers);
router.get('/events/:eventId/projects', requireAuth, requireOrganizer, getEventProjects);

export default router;
