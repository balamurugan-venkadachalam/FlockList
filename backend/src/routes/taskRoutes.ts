import express from 'express';
import * as taskController from '../controllers/taskController';
import * as taskCommentController from '../controllers/taskCommentController';
import * as taskAttachmentController from '../controllers/taskAttachmentController';
import * as taskHistoryController from '../controllers/taskHistoryController';
import * as taskDependencyController from '../controllers/taskDependencyController';
import * as recurringTaskController from '../controllers/recurringTaskController';
import { authenticate } from '../middleware/auth';
import multer from 'multer';
import { RequestHandler } from 'express';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Create a wrapper middleware function to handle file uploads
const handleFileUpload: RequestHandler = (req, res, next) => {
  const uploadMiddleware = upload.single('file');
  uploadMiddleware(req as any, res as any, (err: any) => {
    if (err) {
      return next(err);
    }
    next();
  });
};

// Apply auth middleware to all routes
router.use(authenticate);

// Basic task management routes
router.get('/', taskController.getTasks);
router.post('/', taskController.createTask);
router.get('/:taskId', taskController.getTaskById);
router.put('/:taskId', taskController.updateTask);
router.delete('/:taskId', taskController.deleteTask);
router.patch('/:taskId/status', taskController.updateTaskStatus as unknown as RequestHandler);

// Task comment routes
router.get('/:taskId/comments', taskCommentController.getTaskComments);
router.post('/:taskId/comments', taskCommentController.addTaskComment as unknown as RequestHandler);
router.put('/comments/:commentId', taskCommentController.updateTaskComment as unknown as RequestHandler);
router.delete('/comments/:commentId', taskCommentController.deleteTaskComment as unknown as RequestHandler);

// Task attachment routes
router.get('/:taskId/attachments', taskAttachmentController.getTaskAttachments);
router.post('/:taskId/attachments', handleFileUpload, taskAttachmentController.uploadTaskAttachment as unknown as RequestHandler);
router.delete('/:taskId/attachments/:attachmentId', taskAttachmentController.deleteTaskAttachment as unknown as RequestHandler);

// Task history routes
router.get('/:taskId/history', taskHistoryController.getTaskHistory as unknown as RequestHandler);

// Task dependency routes
router.get('/:taskId/dependencies', taskDependencyController.getTaskDependencies);
router.post('/dependencies', taskDependencyController.addTaskDependency as unknown as RequestHandler);
router.delete('/dependencies/:dependencyId', taskDependencyController.deleteTaskDependency as unknown as RequestHandler);

// Recurring task routes
router.get('/recurring/flock/:flockId', recurringTaskController.getFlockRecurringTasks);
router.get('/recurring/:recurringTaskId', recurringTaskController.getRecurringTask);
router.post('/recurring', recurringTaskController.createRecurringTask as unknown as RequestHandler);
router.put('/recurring/:recurringTaskId', recurringTaskController.updateRecurringTask as unknown as RequestHandler);
router.delete('/recurring/:recurringTaskId', recurringTaskController.deleteRecurringTask as unknown as RequestHandler);
router.post('/recurring/:recurringTaskId/generate', recurringTaskController.generateNextInstance as unknown as RequestHandler);

export default router; 