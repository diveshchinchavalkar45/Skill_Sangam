import { Router } from 'express';
import {
  listProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject
} from '../controllers/projectsController.js';
import { getProjectTeam, updateMemberRole, removeMember } from '../controllers/teamController.js';
import { createJoinRequest, getProjectRequests } from '../controllers/requestsController.js';
import { createInvitation } from '../controllers/invitationsController.js';
import { recommendCandidates } from '../controllers/recommendationsController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  projectCreateSchema,
  projectUpdateSchema,
  joinRequestSchema,
  invitationSchema,
  teamRoleUpdateSchema
} from '../validators/schemas.js';
import { actionLimiter } from '../middleware/rateLimit.js';

const router = Router();

// Projects CRUD & Listing
router.get('/', optionalAuth, listProjects);
router.post('/', requireAuth, actionLimiter, validate(projectCreateSchema), createProject);
router.get('/:id', optionalAuth, getProjectById);
router.put('/:id', requireAuth, validate(projectUpdateSchema), updateProject);
router.delete('/:id', requireAuth, deleteProject);

// Team Management
router.get('/:id/team', optionalAuth, getProjectTeam);
router.put('/:id/team/:userId', requireAuth, validate(teamRoleUpdateSchema), updateMemberRole);
router.delete('/:id/team/:userId', requireAuth, removeMember);

// Requests & Invitations for project
router.post('/:id/join-request', requireAuth, actionLimiter, validate(joinRequestSchema), createJoinRequest);
router.get('/:id/requests', requireAuth, getProjectRequests);
router.post('/:id/invitations', requireAuth, actionLimiter, validate(invitationSchema), createInvitation);

// Candidate recommendations for project owner
router.get('/:id/recommended-candidates', requireAuth, recommendCandidates);

export default router;
