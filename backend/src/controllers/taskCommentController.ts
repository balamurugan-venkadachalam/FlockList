import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { TaskComment } from '../models/TaskComment';
import { Task } from '../models/Task';
import { taskHistoryService } from '../services/TaskHistoryService';
import { checkTaskMemberAccess } from '../utils/taskUtils';
import { logger } from '../utils/logger';

// Extended Request interface to include authenticated user
interface AuthRequest extends Request {
  user: {
    userId: string;
    role: string;
  };
}

/**
 * Get comments for a task
 */
export const getTaskComments = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    
    // Validate task ID
    if (!mongoose.isValidObjectId(taskId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format'
      });
    }
    
    // Get pagination parameters
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    
    // Fetch comments for the task
    const comments = await TaskComment.find({ task: taskId })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate('user', 'firstName lastName profilePicture');
    
    // Get total count for pagination
    const total = await TaskComment.countDocuments({ task: taskId });
    
    return res.status(200).json({
      success: true,
      data: {
        comments,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + comments.length < total
        }
      }
    });
  } catch (error) {
    logger.error('Error in getTaskComments:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Add a comment to a task
 */
export const addTaskComment = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;
    
    // Validate task ID
    if (!mongoose.isValidObjectId(taskId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format'
      });
    }
    
    // Check if content is provided
    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
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
        message: 'You do not have permission to comment on this task'
      });
    }
    
    // Create the comment
    const comment = new TaskComment({
      content,
      task: taskId,
      user: userId
    });
    
    await comment.save();
    
    // Add to task history
    await taskHistoryService.recordCommentAdded(
      task._id,
      comment._id,
      new mongoose.Types.ObjectId(userId),
      content
    );
    
    // Populate user data for the response
    await comment.populate('user', 'firstName lastName profilePicture');
    
    return res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    logger.error('Error in addTaskComment:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Update a task comment
 */
export const updateTaskComment = async (req: AuthRequest, res: Response) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;
    
    // Validate comment ID
    if (!mongoose.isValidObjectId(commentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid comment ID format'
      });
    }
    
    // Check if content is provided
    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }
    
    // Find the comment
    const comment = await TaskComment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    // Check if user is the comment author
    if (comment.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own comments'
      });
    }
    
    // Update the comment
    comment.content = content;
    await comment.save();
    
    // Populate user data for the response
    await comment.populate('user', 'firstName lastName profilePicture');
    
    return res.status(200).json({
      success: true,
      data: comment
    });
  } catch (error) {
    logger.error('Error in updateTaskComment:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Delete a task comment
 */
export const deleteTaskComment = async (req: AuthRequest, res: Response) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;
    
    // Validate comment ID
    if (!mongoose.isValidObjectId(commentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid comment ID format'
      });
    }
    
    // Find the comment
    const comment = await TaskComment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    // Find the task to check permissions
    const task = await Task.findById(comment.task);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    // Check if user is the comment author or task creator
    const isAuthor = comment.user.toString() === userId;
    const isTaskCreator = task.createdBy.toString() === userId;
    
    if (!isAuthor && !isTaskCreator) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own comments or comments on tasks you created'
      });
    }
    
    // Delete the comment
    await TaskComment.findByIdAndDelete(commentId);
    
    return res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    logger.error('Error in deleteTaskComment:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}; 