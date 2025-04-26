import { Request, Response, NextFunction } from 'express';
import { Task, TaskStatus, TaskPriority, TaskCategory } from '../models/Task';
import { Flock } from '../models/Flock';
import { AuthRequest } from '../types/auth';
import mongoose from 'mongoose';
import { logger } from '../utils/logger';
import { AuthenticationError, ValidationError, NotFoundError, DatabaseError, AuthorizationError } from '../types/errors';

// Request body interfaces
interface CreateTaskBody {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: TaskPriority;
  assignees?: string[];
  category?: TaskCategory;
  flockId: string;
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
  flockId?: string;
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
      flockId
    } = req.body as CreateTaskBody;

    // Validate required fields
    if (!title) {
      throw new ValidationError('Title is required');
    }

    if (!flockId) {
      throw new ValidationError('Flock ID is required');
    }

    // Create new task
    const task = new Task({
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority,
      createdBy: req.user.userId,
      flock: flockId,
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
      flockId,
      dueDate,
      dueBefore,
      dueAfter
    } = req.query as unknown as TaskQueryParams;

    // Build query
    const query: any = {};
    
    // Flock filter - only return tasks from families the user belongs to
    if (flockId) {
      query.flock = flockId;
    } else {
      // If no specific flock is requested, get tasks from all families the user is part of
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
 * @route GET /api/tasks/:taskId
 */
export const getTaskById = async (req: AuthRequest<{ taskId: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Check if user is authenticated (assuming middleware adds req.user)
    if (!req.user || !req.user.userId) {
      return next(new AuthenticationError('User not authenticated or user ID missing'));
    }

    const { taskId } = req.params;

    // Validate taskId format
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return next(new ValidationError('Invalid task ID format'));
    }

    // Get task with populated fields
    const task = await Task.findById(taskId)
      .populate('createdBy', 'firstName lastName email')
      .populate('assignees', 'firstName lastName email')
      .populate('flock', 'name _id') // Ensure we get the flock _id
      .exec();

    // Check if task exists
    if (!task) {
      return next(new NotFoundError('Task not found'));
    }

    // Get user's flocks
    const userFlocks = await Flock.find({
      $or: [
        { members: new mongoose.Types.ObjectId(req.user.userId) },
        { createdBy: new mongoose.Types.ObjectId(req.user.userId) }
      ]
    }).select('_id');

    // Ensure userFlocks is an array before mapping
    if (!Array.isArray(userFlocks)) {
      logger.error('Flock.find did not return an array:', userFlocks);
      return next(new Error('Internal error processing user flocks'));
    }

    const userFlockIds = userFlocks.map(f => f._id.toString());

    // Check if the task belongs to a flock the user has access to
    // Task must have a flock, and the user must be part of that flock
    const taskFlockIdString = task.flock?._id?.toString();
    if (!taskFlockIdString || !userFlockIds.includes(taskFlockIdString)) {
      return next(new AuthenticationError('User does not have access to this task'));
    }

    logger.info(`Task retrieved successfully: ${taskId}`);
    res.status(200).json({ message: 'Task retrieved successfully', task });

  } catch (error) {
    logger.error(`Error in getTaskById (manual catch): ${error instanceof Error ? error.stack || error.message : String(error)}`);
    next(error); // Pass error to Express error handler
  }
};

/**
 * Update a task
 * @route PUT /api/tasks/:taskId
 */
export const updateTask = async (
  req: AuthRequest<{ taskId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      throw new AuthenticationError('User not authenticated');
    }

    const { taskId } = req.params;
    const updateData = req.body as UpdateTaskBody;

    // Validate taskId format
    if (!mongoose.isValidObjectId(taskId)) {
      throw new ValidationError('Invalid task ID format');
    }

    // Get task
    const task = await Task.findById(taskId);

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
      throw new AuthorizationError('Not authorized to update this task');
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
    const updatedTask = await Task.findById(taskId)
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
 * @route DELETE /api/tasks/:taskId
 */
export const deleteTask = async (
  req: AuthRequest<{ taskId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      throw new AuthenticationError('User not authenticated');
    }

    const { taskId } = req.params;

    // Get task
    const task = await Task.findById(taskId);

    // Check if task exists
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // Check if user has permission to delete this task
    const userIsCreator = task.createdBy.toString() === req.user.userId;

    if (!userIsCreator) {
      throw new AuthorizationError('Not authorized to delete this task');
    }

    // Delete task
    await Task.findByIdAndDelete(taskId);

    res.status(200).json({
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update task status
 * @route PATCH /api/tasks/:taskId/status
 */
export const updateTaskStatus = async (
  req: AuthRequest<{ taskId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      throw new AuthenticationError('User not authenticated');
    }

    const { taskId } = req.params;
    const { status } = req.body as UpdateTaskStatusBody;

    // Validate taskId format
    if (!mongoose.isValidObjectId(taskId)) {
      throw new ValidationError('Invalid task ID format');
    }

    // Validate status
    if (!status || !['pending', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      throw new ValidationError('Invalid status value');
    }

    // Get task with populated fields
    const task = await Task.findById(taskId)
      .populate('createdBy', 'firstName lastName email')
      .populate('assignees', 'firstName lastName email')
      .populate('completedBy', 'firstName lastName email')
      .populate('flock', 'name _id');

    // Check if task exists
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // Get user's flocks
    const userFlocks = await Flock.find({
      $or: [
        { members: new mongoose.Types.ObjectId(req.user.userId) },
        { createdBy: new mongoose.Types.ObjectId(req.user.userId) }
      ]
    }).select('_id');

    const userFlockIds = userFlocks.map(f => f._id.toString());
    const taskFlockId = task.flock._id.toString();

    // Check access levels
    const hasFlockAccess = userFlockIds.includes(taskFlockId);
    const userIsCreator = task.createdBy._id.toString() === req.user.userId;
    const userIsAssignee = task.assignees.some(assignee => 
      assignee._id.toString() === req.user?.userId
    );

    // Log access attempt for debugging
    logger.debug('Task status update attempt', {
      taskId,
      userId: req.user.userId,
      hasFlockAccess,
      userIsAssignee,
      userIsCreator,
      taskFlockId,
      userFlockIds,
      newStatus: status,
      currentStatus: task.status
    });

    if (!userIsAssignee && !userIsCreator && !hasFlockAccess) {
      throw new AuthorizationError('Not authorized to update this task');
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
    const updatedTask = await Task.findById(taskId)
      .populate('createdBy', 'firstName lastName email')
      .populate('assignees', 'firstName lastName email')
      .populate('completedBy', 'firstName lastName email')
      .populate('flock', 'name _id');

    res.status(200).json({
      message: 'Task status updated successfully',
      task: updatedTask
    });
  } catch (error) {
    // Log the error for debugging
    logger.error('Error in updateTaskStatus:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      taskId: req.params.taskId,
      userId: req.user?.userId,
      status: req.body?.status
    });
    next(error);
  }
}; 