import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Task } from '../models/Task';
import { taskHistoryService } from '../services/taskHistoryService';
import { checkTaskMemberAccess } from '../utils/taskUtils';
import { logger } from '../utils/logger';

// Extended Request interface for authenticated users
interface AuthRequest extends Request {
  user: {
    userId: string;
    role: string;
  };
}

/**
 * Get history for a task
 */
export const getTaskHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.userId;
    
    // Validate task ID
    if (!mongoose.isValidObjectId(taskId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format'
      });
    }
    
    // Find the task
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    // Check if user has access to the task
    const hasAccess = await checkTaskMemberAccess(task, userId);
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this task history'
      });
    }
    
    // Get pagination parameters
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    
    // Get task history
    const history = await taskHistoryService.getTaskHistory(
      task._id,
      limit,
      offset
    );
    
    return res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    logger.error('Error getting task history:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}; 