import express, { RequestHandler, Request, Response, NextFunction } from 'express';
import * as taskController from '../controllers/taskController';
import * as taskCommentController from '../controllers/taskCommentController';
import * as taskAttachmentController from '../controllers/taskAttachmentController';
import * as taskHistoryController from '../controllers/taskHistoryController';
import * as taskDependencyController from '../controllers/taskDependencyController';
import * as recurringTaskController from '../controllers/recurringTaskController';
import { authenticate } from '../middleware/auth';
import multer from 'multer';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Apply auth middleware to all routes
router.use(authenticate);

// Basic task management routes
// @ts-ignore - Type issues with controller return types
router.get('/', taskController.getTasks);
// @ts-ignore - Type issues with controller return types
router.post('/', taskController.createTask);
// @ts-ignore - Type issues with controller return types
router.get('/:taskId', taskController.getTaskById);
// @ts-ignore - Type issues with controller return types
router.put('/:taskId', taskController.updateTask);
// @ts-ignore - Type issues with controller return types
router.delete('/:taskId', taskController.deleteTask);
// @ts-ignore - Type issues with controller return types
router.patch('/:taskId/status', taskController.updateTaskStatus);

// Task comment routes
// @ts-ignore - Type issues with controller return types
router.get('/:taskId/comments', taskCommentController.getTaskComments);
// @ts-ignore - Type issues with controller return types
router.post('/:taskId/comments', taskCommentController.addTaskComment);
// @ts-ignore - Type issues with controller return types
router.put('/comments/:commentId', taskCommentController.updateTaskComment);
// @ts-ignore - Type issues with controller return types
router.delete('/comments/:commentId', taskCommentController.deleteTaskComment);

// Task attachment routes
// @ts-ignore - Type issues with controller return types
router.get('/:taskId/attachments', taskAttachmentController.getTaskAttachments);
// @ts-ignore - Type issues with controller return types
router.post('/:taskId/attachments', upload.single('file') as any, taskAttachmentController.uploadTaskAttachment);
// @ts-ignore - Type issues with controller return types
router.delete('/:taskId/attachments/:attachmentId', taskAttachmentController.deleteTaskAttachment);

// Task history routes
// @ts-ignore - Type issues with controller return types
router.get('/:taskId/history', taskHistoryController.getTaskHistory);

// Task dependency routes
// @ts-ignore - Type issues with controller return types
router.get('/:taskId/dependencies', taskDependencyController.getTaskDependencies);
// @ts-ignore - Type issues with controller return types
router.post('/dependencies', taskDependencyController.addTaskDependency);
// @ts-ignore - Type issues with controller return types
router.delete('/dependencies/:dependencyId', taskDependencyController.deleteTaskDependency);

// Recurring task routes
// @ts-ignore - Type issues with controller return types
router.get('/recurring/flock/:flockId', recurringTaskController.getFlockRecurringTasks);
// @ts-ignore - Type issues with controller return types
router.get('/recurring/:recurringTaskId', recurringTaskController.getRecurringTask);
// @ts-ignore - Type issues with controller return types
router.post('/recurring', recurringTaskController.createRecurringTask);
// @ts-ignore - Type issues with controller return types
router.put('/recurring/:recurringTaskId', recurringTaskController.updateRecurringTask);
// @ts-ignore - Type issues with controller return types
router.delete('/recurring/:recurringTaskId', recurringTaskController.deleteRecurringTask);
// @ts-ignore - Type issues with controller return types
router.post('/recurring/:recurringTaskId/generate', recurringTaskController.generateNextInstance);

export default router; 