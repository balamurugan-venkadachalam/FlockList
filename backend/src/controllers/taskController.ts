import { Request, Response, NextFunction } from 'express';
import { Task, TaskStatus, TaskPriority, TaskCategory } from '../models/Task';
import {
  AuthenticationError,
  ValidationError,
  NotFoundError,
  DatabaseError
} from '../types/errors';
import { AuthRequest } from '../types/auth';
import mongoose from 'mongoose';

// Request body interfaces
interface CreateTaskBody {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: TaskPriority;
  assignees?: string[];
  category?: TaskCategory;
  familyId: string;
}

interface UpdateTaskBody {
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: TaskPriority;
  assignees?: string[];
  category?: TaskCategory;
  status?: TaskStatus;
}

interface UpdateTaskStatusBody {
  status: TaskStatus;
}

// Query parameters interface
interface TaskQueryParams {
  status?: TaskStatus | TaskStatus[];
  priority?: TaskPriority | TaskPriority[];
  category?: TaskCategory | TaskCategory[];
  assignee?: string;
  familyId?: string;
  dueDate?: string;
  dueBefore?: string;
  dueAfter?: string;
}

/**
 * Create a new task
 * @route POST /api/tasks
 */
export const createTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      throw new AuthenticationError('User not authenticated');
    }

    const {
      title,
      description,
      dueDate,
      priority,
      assignees,
      category,
      familyId
    } = req.body as CreateTaskBody;

    // Validate required fields
    if (!title) {
      throw new ValidationError('Title is required');
    }

    if (!familyId) {
      throw new ValidationError('Family ID is required');
    }

    // Create new task
    const task = new Task({
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority,
      createdBy: req.user.userId,
      family: familyId,
      assignees: assignees || [req.user.userId],
      category : category
    });

    await task.save();

    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all tasks for the user
 * @route GET /api/tasks
 */
export const getTasks = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      throw new AuthenticationError('User not authenticated');
    }

    const {
      status,
      priority,
      category,
      assignee,
      familyId,
      dueDate,
      dueBefore,
      dueAfter
    } = req.query as unknown as TaskQueryParams;

    // Build query
    const query: any = {};
    
    // Family filter - only return tasks from families the user belongs to
    if (familyId) {
      query.family = familyId;
    } else {
      // If no specific family is requested, get tasks from all families the user is part of
      // This would require a more complex query that could be optimized in a real-world scenario
      // For now, we'll just get tasks where the user is an assignee or the creator
      query.$or = [
        { assignees: req.user.userId },
        { createdBy: req.user.userId }
      ];
    }

    // Status filter
    if (status) {
      if (Array.isArray(status)) {
        query.status = { $in: status };
      } else {
        query.status = status;
      }
    }

    // Priority filter
    if (priority) {
      if (Array.isArray(priority)) {
        query.priority = { $in: priority };
      } else {
        query.priority = priority;
      }
    }

    // Category filter
    if (category) {
      if (Array.isArray(category)) {
        query.category = { $in: category };
      } else {
        query.category = category;
      }
    }

    // Assignee filter
    if (assignee) {
      query.assignees = assignee;
    }

    // Due date filters
    if (dueDate) {
      // Match specific date
      const date = new Date(dueDate);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      query.dueDate = { $gte: date, $lt: nextDay };
    } else {
      // Date range
      if (dueBefore) {
        query.dueDate = { ...query.dueDate, $lt: new Date(dueBefore) };
      }
      if (dueAfter) {
        query.dueDate = { ...query.dueDate, $gte: new Date(dueAfter) };
      }
    }

    // Get tasks
    const tasks = await Task.find(query)
      .populate('createdBy', 'firstName lastName email')
      .populate('assignees', 'firstName lastName email')
      .populate('completedBy', 'firstName lastName email')
      .sort({ dueDate: 1, createdAt: -1 });

    res.status(200).json({
      message: 'Tasks retrieved successfully',
      tasks
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a task by ID
 * @route GET /api/tasks/:id
 */
export const getTaskById = async (
  req: AuthRequest<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      throw new AuthenticationError('User not authenticated');
    }

    const { id } = req.params;

    // Get task
    const task = await Task.findById(id)
      .populate('createdBy', 'firstName lastName email')
      .populate('assignees', 'firstName lastName email')
      .populate('completedBy', 'firstName lastName email');

    // Check if task exists
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // Check if user has access to this task
    const userIsAssignee = task.assignees.some(assignee => 
      assignee._id.toString() === req.user?.userId
    );
    const userIsCreator = task.createdBy._id.toString() === req.user.userId;

    if (!userIsAssignee && !userIsCreator) {
      throw new AuthenticationError('Not authorized to view this task');
    }

    res.status(200).json({
      message: 'Task retrieved successfully',
      task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a task
 * @route PUT /api/tasks/:id
 */
export const updateTask = async (
  req: AuthRequest<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      throw new AuthenticationError('User not authenticated');
    }

    const { id } = req.params;
    const updateData = req.body as UpdateTaskBody;

    // Format due date if provided
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate).toISOString();
    }

    // Get task
    const task = await Task.findById(id);

    // Check if task exists
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // Check if user has permission to update this task
    const userIsCreator = task.createdBy.toString() === req.user.userId;
    const userIsAssignee = task.assignees.some(assignee => 
      assignee.toString() === req.user?.userId
    );

    if (!userIsCreator && !userIsAssignee) {
      throw new AuthenticationError('Not authorized to update this task');
    }

    // Update completed information if status changed to completed
    if (updateData.status === 'completed' && task.status !== 'completed') {
      task.completedAt = new Date();
      task.completedBy = new mongoose.Types.ObjectId(req.user.userId);
    }

    // Remove completed information if status changed from completed
    if (updateData.status && updateData.status !== 'completed' && task.status === 'completed') {
      task.completedAt = undefined;
      task.completedBy = undefined;
    }

    // Update task fields
    Object.assign(task, updateData);

    await task.save();

    // Get updated task with populated fields
    const updatedTask = await Task.findById(id)
      .populate('createdBy', 'firstName lastName email')
      .populate('assignees', 'firstName lastName email')
      .populate('completedBy', 'firstName lastName email');

    res.status(200).json({
      message: 'Task updated successfully',
      task: updatedTask
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a task
 * @route DELETE /api/tasks/:id
 */
export const deleteTask = async (
  req: AuthRequest<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      throw new AuthenticationError('User not authenticated');
    }

    const { id } = req.params;

    // Get task
    const task = await Task.findById(id);

    // Check if task exists
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // Check if user has permission to delete this task
    const userIsCreator = task.createdBy.toString() === req.user.userId;

    if (!userIsCreator) {
      throw new AuthenticationError('Not authorized to delete this task');
    }

    // Delete task
    await Task.findByIdAndDelete(id);

    res.status(200).json({
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update task status
 * @route PATCH /api/tasks/:id/status
 */
export const updateTaskStatus = async (
  req: AuthRequest<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      throw new AuthenticationError('User not authenticated');
    }

    const { id } = req.params;
    const { status } = req.body as UpdateTaskStatusBody;

    // Validate status
    if (!status || !['pending', 'in-progress', 'completed', 'cancelled'].includes(status)) {
      throw new ValidationError('Invalid status value');
    }

    // Get task
    const task = await Task.findById(id);

    // Check if task exists
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // Check if user has permission to update this task
    const userIsCreator = task.createdBy.toString() === req.user.userId;
    const userIsAssignee = task.assignees.some(assignee => 
      assignee.toString() === req.user?.userId
    );

    if (!userIsCreator && !userIsAssignee) {
      throw new AuthenticationError('Not authorized to update this task');
    }

    // Update completed information if status changed to completed
    if (status === 'completed' && task.status !== 'completed') {
      task.completedAt = new Date();
      task.completedBy = new mongoose.Types.ObjectId(req.user.userId);
    }

    // Remove completed information if status changed from completed
    if (status !== 'completed' && task.status === 'completed') {
      task.completedAt = undefined;
      task.completedBy = undefined;
    }

    // Update status
    task.status = status;
    await task.save();

    // Get updated task with populated fields
    const updatedTask = await Task.findById(id)
      .populate('createdBy', 'firstName lastName email')
      .populate('assignees', 'firstName lastName email')
      .populate('completedBy', 'firstName lastName email');

    res.status(200).json({
      message: 'Task status updated successfully',
      task: updatedTask
    });
  } catch (error) {
    next(error);
  }
}; 