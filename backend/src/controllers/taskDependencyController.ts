import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { TaskDependency } from '../models/TaskDependency';
import { Task } from '../models/Task';
import { checkTaskEditAccess } from '../utils/taskUtils';
import { logger } from '../utils/logger';

// Extended Request interface for authenticated users
interface AuthRequest extends Request {
  user: {
    userId: string;
    role: string;
  };
}

/**
 * Add a dependency between tasks
 */
export const addTaskDependency = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const { parentTaskId, dependentTaskId, type } = req.body;
    
    // Validate required fields
    if (!parentTaskId || !dependentTaskId) {
      return res.status(400).json({
        success: false,
        message: 'Both parent task and dependent task IDs are required'
      });
    }
    
    // Validate task IDs
    if (!mongoose.isValidObjectId(parentTaskId) || !mongoose.isValidObjectId(dependentTaskId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format'
      });
    }
    
    // Validate that tasks are different
    if (parentTaskId === dependentTaskId) {
      return res.status(400).json({
        success: false,
        message: 'A task cannot depend on itself'
      });
    }
    
    // Find the tasks
    const [parentTask, dependentTask] = await Promise.all([
      Task.findById(parentTaskId),
      Task.findById(dependentTaskId)
    ]);
    
    if (!parentTask || !dependentTask) {
      return res.status(404).json({
        success: false,
        message: 'One or both tasks not found'
      });
    }
    
    // Check if both tasks belong to the same flock
    if (parentTask.flock.toString() !== dependentTask.flock.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Dependencies can only be created between tasks in the same flock'
      });
    }
    
    // Check if user has edit access to both tasks
    const [hasParentAccess, hasDependentAccess] = await Promise.all([
      checkTaskEditAccess(parentTask, userId),
      checkTaskEditAccess(dependentTask, userId)
    ]);
    
    if (!hasParentAccess || !hasDependentAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to create dependencies for these tasks'
      });
    }
    
    // Check if dependency already exists
    const existingDependency = await TaskDependency.findOne({
      parentTask: parentTaskId,
      dependentTask: dependentTaskId
    });
    
    if (existingDependency) {
      return res.status(400).json({
        success: false,
        message: 'Dependency already exists between these tasks'
      });
    }
    
    // Create the dependency
    const dependency = new TaskDependency({
      parentTask: parentTaskId,
      dependentTask: dependentTaskId,
      type: type || 'blocking',
      createdBy: userId
    });
    
    await dependency.save();
    
    return res.status(201).json({
      success: true,
      data: dependency
    });
  } catch (error) {
    // Special handling for circular dependency error
    if (error instanceof Error && error.message.includes('Circular dependency detected')) {
      return res.status(400).json({
        success: false,
        message: 'Circular dependency detected. This would create a dependency loop.'
      });
    }
    
    logger.error('Error adding task dependency:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get dependencies for a task
 */
export const getTaskDependencies = async (req: Request, res: Response) => {
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
    
    // Get parent tasks (tasks that this task depends on)
    const parentDependencies = await TaskDependency.find({
      dependentTask: taskId
    })
      .populate('parentTask', 'title status priority dueDate');
    
    // Get dependent tasks (tasks that depend on this task)
    const dependentDependencies = await TaskDependency.find({
      parentTask: taskId
    })
      .populate('dependentTask', 'title status priority dueDate');
    
    return res.status(200).json({
      success: true,
      data: {
        parents: parentDependencies,
        dependents: dependentDependencies
      }
    });
  } catch (error) {
    logger.error('Error getting task dependencies:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Delete a task dependency
 */
export const deleteTaskDependency = async (req: AuthRequest, res: Response) => {
  try {
    const { dependencyId } = req.params;
    const userId = req.user.userId;
    
    // Validate dependency ID
    if (!mongoose.isValidObjectId(dependencyId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid dependency ID format'
      });
    }
    
    // Find the dependency
    const dependency = await TaskDependency.findById(dependencyId);
    
    if (!dependency) {
      return res.status(404).json({
        success: false,
        message: 'Dependency not found'
      });
    }
    
    // Check if user has permission (created the dependency or has edit access to either task)
    if (dependency.createdBy.toString() !== userId) {
      const [parentTask, dependentTask] = await Promise.all([
        Task.findById(dependency.parentTask),
        Task.findById(dependency.dependentTask)
      ]);
      
      if (!parentTask || !dependentTask) {
        return res.status(404).json({
          success: false,
          message: 'One or both tasks not found'
        });
      }
      
      const [hasParentAccess, hasDependentAccess] = await Promise.all([
        checkTaskEditAccess(parentTask, userId),
        checkTaskEditAccess(dependentTask, userId)
      ]);
      
      if (!hasParentAccess && !hasDependentAccess) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to delete this dependency'
        });
      }
    }
    
    // Delete the dependency
    await TaskDependency.findByIdAndDelete(dependencyId);
    
    return res.status(200).json({
      success: true,
      message: 'Dependency deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting task dependency:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}; 