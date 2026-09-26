import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getAssignments,
  getAssignmentById,
  createGroup,
  joinGroup,
  leaveGroup,
  submitGroupAssignment,
  addCommunityPost
} from '../controllers/assignmentController.js';

const router = Router();

// List assignments with stats
router.get('/', requireAuth, getAssignments);

// Assignment details + groups + community feed
router.get('/:id', requireAuth, getAssignmentById);

// Create group under assignment
router.post('/:id/groups', requireAuth, createGroup);

// Join existing group
router.post('/:id/groups/:groupId/join', requireAuth, joinGroup);

// Leave group
router.post('/:id/groups/:groupId/leave', requireAuth, leaveGroup);

// Submit group assignment
router.post('/:id/groups/:groupId/submit', requireAuth, submitGroupAssignment);

// Post to assignment community
router.post('/:id/community', requireAuth, addCommunityPost);

export default router;
