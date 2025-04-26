import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { RecurringTask } from '../models/RecurringTask';
import { recurringTaskService } from '../services/recurringTaskService';
import { checkTaskAdminAccess } from '../utils/taskUtils';
import { logger } from '../utils/logger';

// Extended Request interface for authenticated users
interface AuthRequest extends Request {
  user: {
    userId: string;
    role: string;
  };
}

/**
 * Create a new recurring task pattern
 */
export const createRecurringTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const {
      title,
      description,
      priority,
      frequency,
      interval,
      daysOfWeek,
      dayOfMonth,
      monthOfYear,
      startDate,
      endDate,
      occurrences,
      flock,
      assignees,
      category
    } = req.body;
    
    // Validate required fields
    if (!title || !flock || !frequency || !interval || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Create the recurring task
    const recurringTask = await recurringTaskService.createRecurringTask({
      title,
      description,
      priority: priority || 'medium',
      frequency,
      interval: parseInt(interval),
      daysOfWeek,
      dayOfMonth: dayOfMonth ? parseInt(dayOfMonth) : undefined,
      monthOfYear: monthOfYear ? parseInt(monthOfYear) : undefined,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      occurrences: occurrences ? parseInt(occurrences) : undefined,
      flock: new mongoose.Types.ObjectId(flock),
      createdBy: new mongoose.Types.ObjectId(userId),
      assignees: assignees?.map((id: string) => new mongoose.Types.ObjectId(id)) || [],
      category: category || 'other',
      active: true
    });
    
    return res.status(201).json({
      success: true,
      data: recurringTask
    });
  } catch (error) {
    logger.error('Error creating recurring task:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get recurring tasks for a flock
 */
export const getFlockRecurringTasks = async (req: Request, res: Response) => {
  try {
    const { flockId } = req.params;
    
    // Validate flock ID
    if (!mongoose.isValidObjectId(flockId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid flock ID format'
      });
    }
    
    // Get recurring tasks
    const recurringTasks = await RecurringTask.find({ flock: flockId })
      .populate('createdBy', 'firstName lastName')
      .populate('assignees', 'firstName lastName');
    
    return res.status(200).json({
      success: true,
      data: recurringTasks
    });
  } catch (error) {
    logger.error('Error getting recurring tasks for flock:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get a specific recurring task
 */
export const getRecurringTask = async (req: Request, res: Response) => {
  try {
    const { recurringTaskId } = req.params;
    
    // Validate recurring task ID
    if (!mongoose.isValidObjectId(recurringTaskId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recurring task ID format'
      });
    }
    
    // Get the recurring task
    const recurringTask = await RecurringTask.findById(recurringTaskId)
      .populate('createdBy', 'firstName lastName')
      .populate('assignees', 'firstName lastName')
      .populate('flock', 'name');
    
    if (!recurringTask) {
      return res.status(404).json({
        success: false,
        message: 'Recurring task not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: recurringTask
    });
  } catch (error) {
    logger.error('Error getting recurring task:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Update a recurring task pattern
 */
export const updateRecurringTask = async (req: AuthRequest, res: Response) => {
  try {
    const { recurringTaskId } = req.params;
    const userId = req.user.userId;
    const updateData = req.body;
    
    // Validate recurring task ID
    if (!mongoose.isValidObjectId(recurringTaskId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recurring task ID format'
      });
    }
    
    // Find the recurring task
    const recurringTask = await RecurringTask.findById(recurringTaskId);
    
    if (!recurringTask) {
      return res.status(404).json({
        success: false,
        message: 'Recurring task not found'
      });
    }
    
    // Check if user has admin access
    const hasAccess = await checkTaskAdminAccess(
      { _id: recurringTask._id, flock: recurringTask.flock, createdBy: recurringTask.createdBy } as any,
      userId
    );
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this recurring task'
      });
    }
    
    // Process update data
    const updates: any = { ...updateData };
    
    // Handle date conversions
    if (updates.startDate) {
      updates.startDate = new Date(updates.startDate);
    }
    
    if (updates.endDate) {
      updates.endDate = new Date(updates.endDate);
    }
    
    // Handle number conversions
    if (updates.interval) {
      updates.interval = parseInt(updates.interval);
    }
    
    if (updates.dayOfMonth) {
      updates.dayOfMonth = parseInt(updates.dayOfMonth);
    }
    
    if (updates.monthOfYear) {
      updates.monthOfYear = parseInt(updates.monthOfYear);
    }
    
    if (updates.occurrences) {
      updates.occurrences = parseInt(updates.occurrences);
    }
    
    // Handle ObjectId conversions
    if (updates.assignees) {
      updates.assignees = updates.assignees.map((id: string) => 
        new mongoose.Types.ObjectId(id)
      );
    }
    
    // Update the recurring task
    const updatedTask = await recurringTaskService.updateRecurringTask(
      recurringTask._id,
      updates
    );
    
    return res.status(200).json({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    logger.error('Error updating recurring task:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Delete a recurring task pattern
 */
export const deleteRecurringTask = async (req: AuthRequest, res: Response) => {
  try {
    const { recurringTaskId } = req.params;
    const userId = req.user.userId;
    const { deleteGeneratedTasks } = req.query;
    
    // Validate recurring task ID
    if (!mongoose.isValidObjectId(recurringTaskId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recurring task ID format'
      });
    }
    
    // Find the recurring task
    const recurringTask = await RecurringTask.findById(recurringTaskId);
    
    if (!recurringTask) {
      return res.status(404).json({
        success: false,
        message: 'Recurring task not found'
      });
    }
    
    // Check if user has admin access
    const hasAccess = await checkTaskAdminAccess(
      { _id: recurringTask._id, flock: recurringTask.flock, createdBy: recurringTask.createdBy } as any,
      userId
    );
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this recurring task'
      });
    }
    
    // Delete the recurring task
    const deleted = await recurringTaskService.deleteRecurringTask(
      recurringTask._id,
      deleteGeneratedTasks === 'true'
    );
    
    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete recurring task'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Recurring task deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting recurring task:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Generate the next task instance now (manually)
 */
export const generateNextInstance = async (req: AuthRequest, res: Response) => {
  try {
    const { recurringTaskId } = req.params;
    const userId = req.user.userId;
    
    // Validate recurring task ID
    if (!mongoose.isValidObjectId(recurringTaskId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recurring task ID format'
      });
    }
    
    // Find the recurring task
    const recurringTask = await RecurringTask.findById(recurringTaskId);
    
    if (!recurringTask) {
      return res.status(404).json({
        success: false,
        message: 'Recurring task not found'
      });
    }
    
    // Check if user has admin access
    const hasAccess = await checkTaskAdminAccess(
      { _id: recurringTask._id, flock: recurringTask.flock, createdBy: recurringTask.createdBy } as any,
      userId
    );
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to manage this recurring task'
      });
    }
    
    // Generate the next task instance
    const newTask = await recurringTaskService.generateNextInstance(recurringTask);
    
    if (!newTask) {
      return res.status(400).json({
        success: false,
        message: 'Failed to generate new task instance. The recurring pattern may have reached its end or is inactive.'
      });
    }
    
    return res.status(201).json({
      success: true,
      data: newTask,
      message: 'New task instance generated successfully'
    });
  } catch (error) {
    logger.error('Error generating next task instance:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}; 