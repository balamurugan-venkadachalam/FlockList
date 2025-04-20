import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { notificationService } from '../services/NotificationService';
import { Task } from '../models/Task';
import { logger } from '../utils/logger';

/**
 * Middleware to generate task-related notifications
 */
export const taskNotificationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Store the original end method
  const originalEnd = res.end;
  
  // Override the end method
  res.end = function(this: Response, chunk?: any, encoding?: any, callback?: any) {
    // Execute original end method and save result
    const result = originalEnd.call(this, chunk, encoding, callback);
    
    // Process notifications after response is sent
    processTaskNotifications(req, res).catch(err => {
      logger.error('Error generating task notifications:', err);
    });
    
    // Return original result
    return result;
  } as any;
  
  next();
};

/**
 * Process task notifications based on API request
 */
const processTaskNotifications = async (req: Request, res: Response) => {
  // Only process for successful task-related operations
  if (res.statusCode < 200 || res.statusCode >= 300) return;
  
  // Get response data
  const responseData = (res as any).responseData;
  if (!responseData || !responseData.success) return;
  
  const { method, path } = req;
  const taskId = req.params.id;
  
  // Task creation - POST /api/tasks
  if (method === 'POST' && path.match(/\/api\/tasks\/?$/)) {
    // Get created task
    const task = responseData.data || responseData.task;
    if (!task || !task._id) return;
    
    // Notify assignees
    if (task.assignees && task.assignees.length > 0) {
      await notificationService.notifyTaskCreated(
        new mongoose.Types.ObjectId(task._id),
        task.title,
        task.assignees.map((assignee: any) => 
          new mongoose.Types.ObjectId(assignee._id || assignee))
      );
      
      logger.info(`Generated notifications for task creation: ${task._id}`);
    }
  }
  
  // Task completion - PUT /api/tasks/:id/status
  if (method === 'PUT' && path.match(/\/api\/tasks\/[^/]+\/status$/)) {
    // Get task
    const task = responseData.data || responseData.task;
    if (!task || !task._id) return;
    
    // Check if status was changed to 'completed'
    if (task.status === 'completed') {
      // Load full task details if needed
      const fullTask = await Task.findById(task._id).populate('createdBy');
      if (!fullTask) return;
      
      // Notify creator if they're not the same as the user who completed it
      if (fullTask.createdBy && req.user && 
          fullTask.createdBy._id.toString() !== req.user.userId.toString()) {
        await notificationService.notifyTaskCompleted(
          fullTask._id,
          fullTask.title,
          fullTask.createdBy._id,
          new mongoose.Types.ObjectId(req.user.userId)
        );
        
        logger.info(`Generated notification for task completion: ${task._id}`);
      }
    }
  }
}; 