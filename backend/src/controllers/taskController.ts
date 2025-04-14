import { Request, Response, NextFunction } from 'express';
import { Task, ITask } from '../models/Task';
import {
  AuthenticationError,
  ValidationError,
  NotFoundError,
  DatabaseError
} from '../types/errors';

interface TaskRequestBody {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
  status?: 'todo' | 'in_progress' | 'completed';
}

interface TaskQueryParams {
  status?: 'todo' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Create a new task
export const createTask = async (
  req: Request<{}, {}, TaskRequestBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, description, priority, dueDate } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      throw new AuthenticationError('User not authenticated');
    }

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      userId
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

// Get all tasks for a user
export const getTasks = async (
  req: Request<{}, {}, {}, TaskQueryParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { status, priority, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    if (!userId) {
      throw new AuthenticationError('User not authenticated');
    }

    const query: Record<string, any> = { userId };
    
    if (status) {
      query.status = status;
    }
    
    if (priority) {
      query.priority = priority;
    }

    const tasks = await Task.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// Get a single task by ID
export const getTaskById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      throw new AuthenticationError('User not authenticated');
    }

    const task = await Task.findOne({ _id: id, userId });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

// Update a task
export const updateTask = async (
  req: Request<{ id: string }, {}, TaskRequestBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const updateData = req.body;

    if (!userId) {
      throw new AuthenticationError('User not authenticated');
    }

    const task = await Task.findOne({ _id: id, userId });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // Update task
    Object.assign(task, updateData);
    await task.save();

    res.json(task);
  } catch (error) {
    next(error);
  }
};

// Delete a task
export const deleteTask = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      throw new AuthenticationError('User not authenticated');
    }

    const task = await Task.findOneAndDelete({ _id: id, userId });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Update task status
export const updateTaskStatus = async (
  req: Request<{ id: string }, {}, { status: 'todo' | 'in_progress' | 'completed' }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      throw new AuthenticationError('User not authenticated');
    }

    const task = await Task.findOne({ _id: id, userId });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    task.status = status;
    await task.save();

    res.json(task);
  } catch (error) {
    next(error);
  }
}; 