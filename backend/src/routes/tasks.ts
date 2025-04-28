import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus
} from '../controllers/taskController';

const router = Router();

// All task routes require authentication
router.use(authenticate);

// Task management routes
router.post('/', createTask);
router.get('/', getTasks);
router.get('/:taskId', getTaskById);
router.put('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);
router.patch('/:taskId/status', updateTaskStatus);

export default router; 