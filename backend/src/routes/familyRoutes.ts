import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createFamily,
  getFamilies,
  getFamilyById,
  inviteMember,
  acceptInvitation,
  removeMember
} from '../controllers/familyController';

const router = Router();

// All family routes require authentication
router.use(authenticate);

// Family management routes
router.post('/', createFamily);
router.get('/', getFamilies);
router.get('/:id', getFamilyById);

// Family member management routes
router.post('/:id/invite', inviteMember);
router.post('/accept-invitation', acceptInvitation);
router.delete('/:id/members/:userId', removeMember);

export default router; 