import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createFlock,
  getFlocks,
  getFlockById,
  inviteMember,
  acceptInvitation,
  removeMember,
  getUserInvitations,
  cancelInvitation
} from '../controllers/flockController';

const router = Router();

// All flock routes require authentication
router.use(authenticate);

// Flock management routes
router.post('/', createFlock);
router.get('/', getFlocks);

// Invitation routes - needs to be before /:id routes to avoid conflict
router.get('/invitations', getUserInvitations);
router.post('/accept-invitation', acceptInvitation);

// Flock routes with ID parameter
router.get('/:id', getFlockById);
router.post('/:id/invite', inviteMember);
router.delete('/:id/members/:userId', removeMember);
router.delete('/:id/invitations/:email', cancelInvitation);

export default router; 