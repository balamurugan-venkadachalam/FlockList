import { Request, Response, NextFunction } from 'express';
import { TaskStatus, TaskPriority, TaskCategory } from '../models/Task';
import * as TaskService from '@/services/taskService';
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
    if (!req.user) throw new AuthenticationError('User not authenticated');
    const task = await TaskService.createTask({
      ...req.body,
      createdBy: req.user.userId
    });
    res.status(201).json({ message: 'Task created successfully', task });
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
    if (!req.user) throw new AuthenticationError('User not authenticated');
    const tasks = await TaskService.getTasks({
      userId: req.user.userId,
      filters: req.query as unknown as TaskService.GetTasksParams['filters']
    });
    res.status(200).json({ message: 'Tasks retrieved successfully', tasks });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a task by ID
 * @route GET /api/tasks/:taskId
 */
export const getTaskById = async (
  req: AuthRequest<{ taskId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) throw new AuthenticationError('User not authenticated');
    const task = await TaskService.getTaskById({
      taskId: req.params.taskId,
      userId: req.user.userId
    });
    res.status(200).json({ message: 'Task retrieved successfully', task });
  } catch (error) {
    next(error);
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
    if (!req.user) throw new AuthenticationError('User not authenticated');
    const task = await TaskService.updateTask({
      taskId: req.params.taskId,
      updates: req.body,
      userId: req.user.userId
    });
    res.status(200).json({ message: 'Task updated successfully', task });
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
    if (!req.user) throw new AuthenticationError('User not authenticated');
    await TaskService.deleteTask({
      taskId: req.params.taskId,
      userId: req.user.userId
    });
    res.status(200).json({ message: 'Task deleted successfully' });
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
    if (!req.user) throw new AuthenticationError('User not authenticated');
    const updatedTask = await TaskService.updateTaskStatus({
      taskId: req.params.taskId,
      status: req.body.status,
      userId: req.user.userId
    });
    res.status(200).json({ message: 'Task status updated successfully', task: updatedTask });
  } catch (error) {
    next(error);
  }
}; 