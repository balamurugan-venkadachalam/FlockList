import express from 'express';
import { validateRequest } from '../middleware/validateRequest';
import { authenticate } from '../middleware/auth';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus
} from '../controllers/taskController';
import {
  createTaskSchema,
  getTasksSchema,
  getTaskSchema,
  updateTaskSchema,
  deleteTaskSchema,
  updateTaskStatusSchema
} from '../validation/taskSchema';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Create a new task
router.post(
  '/',
  validateRequest(createTaskSchema),
  createTask
);

// Get all tasks for a user
router.get(
  '/',
  validateRequest(getTasksSchema),
  getTasks
);

// Get a single task
router.get(
  '/:id',
  validateRequest(getTaskSchema),
  getTaskById
);

// Update a task
router.put(
  '/:id',
  validateRequest(updateTaskSchema),
  updateTask
);

// Delete a task
router.delete(
  '/:id',
  validateRequest(deleteTaskSchema),
  deleteTask
);

// Update task status
router.patch(
  '/:id/status',
  validateRequest(updateTaskStatusSchema),
  updateTaskStatus
);

export default router; 