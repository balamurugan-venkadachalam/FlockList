import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { fileService } from '../services/fileService';
import { Task } from '../models/Task';
import { taskHistoryService } from '../services/taskHistoryService';
import { checkTaskEditAccess } from '../utils/taskUtils';
import { logger } from '../utils/logger';

// Extended Request interface for authenticated users
interface AuthRequest extends Request {
  user: {
    userId: string;
    role: string;
  };
  file?: Express.Multer.File;
}

/**
 * Upload a file attachment for a task
 */
export const uploadTaskAttachment = async (req: AuthRequest, res: Response) => {
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
    
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
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
    
    // Check if user has edit access to the task
    const hasAccess = await checkTaskEditAccess(task, userId);
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to add attachments to this task'
      });
    }
    
    // Upload the file
    const attachment = await fileService.uploadFile(
      req.file,
      task._id,
      new mongoose.Types.ObjectId(userId)
    );
    
    // Add to task history
    await taskHistoryService.recordAttachmentAdded(
      task._id,
      attachment._id,
      new mongoose.Types.ObjectId(userId),
      attachment.filename
    );
    
    return res.status(201).json({
      success: true,
      data: attachment
    });
  } catch (error) {
    logger.error('Error in uploadTaskAttachment:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get attachments for a task
 */
export const getTaskAttachments = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    
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
    
    // Get attachments
    const attachments = await fileService.getTaskAttachments(task._id);
    
    return res.status(200).json({
      success: true,
      data: attachments
    });
  } catch (error) {
    logger.error('Error in getTaskAttachments:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Delete a task attachment
 */
export const deleteTaskAttachment = async (req: AuthRequest, res: Response) => {
  try {
    const { attachmentId } = req.params;
    const userId = req.user.userId;
    
    // Validate attachment ID
    if (!mongoose.isValidObjectId(attachmentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid attachment ID format'
      });
    }
    
    // Find the attachment and populate the task
    const attachment = await mongoose.model('TaskAttachment').findById(attachmentId)
      .populate('task');
    
    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
    }
    
    // Check if user has permission (attachment uploader, task creator, or flock admin)
    const isUploader = attachment.uploadedBy.toString() === userId;
    
    if (!isUploader) {
      const task = attachment.task;
      
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Associated task not found'
        });
      }
      
      const hasAccess = await checkTaskEditAccess(task, userId);
      
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to delete this attachment'
        });
      }
    }
    
    // Delete the attachment
    const deleted = await fileService.deleteFile(attachment._id);
    
    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete attachment'
      });
    }
    
    // Add to task history
    await taskHistoryService.recordAttachmentRemoved(
      attachment.task._id,
      attachment._id,
      new mongoose.Types.ObjectId(userId),
      attachment.filename
    );
    
    return res.status(200).json({
      success: true,
      message: 'Attachment deleted successfully'
    });
  } catch (error) {
    logger.error('Error in deleteTaskAttachment:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Serve a local file attachment
 */
export const serveAttachment = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    
    // Get file info
    const fileInfo = await fileService.getLocalFile(key);
    
    if (!fileInfo) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    // Serve the file
    res.setHeader('Content-Type', fileInfo.mimetype);
    res.sendFile(fileInfo.path);
  } catch (error) {
    logger.error('Error in serveAttachment:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}; 