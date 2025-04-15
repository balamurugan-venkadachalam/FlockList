import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus
} from '../../../controllers/taskController';
import { Task } from '../../../models/Task';
import {
  AuthenticationError,
  NotFoundError,
  ValidationError
} from '../../../types/errors';
import { TaskQueryParams, TaskRequestBody } from '../../../types/request';

// Mock Task model
vi.mock('../../../models/Task', () => ({
  Task: {
    create: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    findOneAndDelete: vi.fn(),
    save: vi.fn()
  }
}));

// Valid MongoDB ObjectId strings
const USER_ID = '507f1f77bcf86cd799439011';
const TASK_ID_1 = '507f1f77bcf86cd799439012';
const TASK_ID_2 = '507f1f77bcf86cd799439013';

interface MockTask {
  _id: string;
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
  save?: () => Promise<void>;
}

describe('Task Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let mockJson: ReturnType<typeof vi.fn>;
  let mockStatus: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockJson = vi.fn();
    mockStatus = vi.fn().mockReturnThis();
    mockRes = {
      json: mockJson,
      status: mockStatus,
    };
    mockReq = {
      body: {},
      params: {},
      query: {},
      user: {
        userId: USER_ID,
        role: 'parent'
      }
    };
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createTask', () => {
    it('should create a new task successfully', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'high',
        dueDate: new Date().toISOString()
      };
      mockReq.body = taskData;
      const mockCreatedTask: MockTask = {
        _id: TASK_ID_1,
        ...taskData,
        status: 'todo',
        userId: USER_ID,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (Task.create as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockCreatedTask);

      await createTask(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(Task.create).toHaveBeenCalledWith({
        ...taskData,
        userId: USER_ID
      });
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(mockCreatedTask);
    });

    it('should handle validation errors', async () => {
      mockReq.body = {
        title: '',  // Invalid title
        priority: 'invalid'  // Invalid priority
      };

      const error = new ValidationError('Invalid input');
      (Task.create as ReturnType<typeof vi.fn>).mockRejectedValueOnce(error);

      await createTask(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getTasks', () => {
    it('should return all tasks for the user', async () => {
      const mockTasks: MockTask[] = [
        {
          _id: TASK_ID_1,
          title: 'Task 1',
          description: 'Description 1',
          status: 'todo',
          priority: 'high',
          userId: USER_ID,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: TASK_ID_2,
          title: 'Task 2',
          description: 'Description 2',
          status: 'completed',
          priority: 'medium',
          userId: USER_ID,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      (Task.find as ReturnType<typeof vi.fn>).mockReturnValueOnce({
        sort: vi.fn().mockResolvedValueOnce(mockTasks)
      });

      await getTasks(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(Task.find).toHaveBeenCalledWith({ userId: USER_ID });
      expect(mockJson).toHaveBeenCalledWith(mockTasks);
    });

    it('should filter tasks by status', async () => {
      mockReq.query = { status: 'completed' };
      const mockTasks: MockTask[] = [];

      (Task.find as ReturnType<typeof vi.fn>).mockReturnValueOnce({
        sort: vi.fn().mockResolvedValueOnce(mockTasks)
      });

      await getTasks(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(Task.find).toHaveBeenCalledWith({
        userId: USER_ID,
        status: 'completed'
      });
      expect(mockJson).toHaveBeenCalledWith(mockTasks);
    });
  });

  describe('getTaskById', () => {
    it('should return a task by id', async () => {
      const mockTask: MockTask = {
        _id: TASK_ID_1,
        title: 'Test Task',
        description: 'Test Description',
        status: 'todo',
        priority: 'high',
        userId: USER_ID,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockReq.params = { id: TASK_ID_1 };
      (Task.findOne as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockTask);

      await getTaskById(
        mockReq as Request<{ id: string }>,
        mockRes as Response,
        mockNext
      );

      expect(Task.findOne).toHaveBeenCalledWith({ _id: TASK_ID_1, userId: USER_ID });
      expect(mockJson).toHaveBeenCalledWith(mockTask);
    });

    it('should return 404 if task not found', async () => {
      mockReq.params = { id: TASK_ID_1 };
      (Task.findOne as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

      await getTaskById(
        mockReq as Request<{ id: string }>,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.any(NotFoundError)
      );
    });
  });

  describe('updateTask', () => {
    it('should update a task successfully', async () => {
      const updateData = {
        title: 'Updated Task',
        description: 'Updated Description',
        priority: 'low'
      };
      mockReq.params = { id: TASK_ID_1 };
      mockReq.body = updateData;

      const mockTask: MockTask = {
        _id: TASK_ID_1,
        ...updateData,
        status: 'todo',
        userId: USER_ID,
        createdAt: new Date(),
        updatedAt: new Date(),
        save: vi.fn().mockResolvedValueOnce(undefined)
      };

      (Task.findOne as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockTask);

      await updateTask(
        mockReq as Request<{ id: string }>,
        mockRes as Response,
        mockNext
      );

      expect(Task.findOne).toHaveBeenCalledWith({ _id: TASK_ID_1, userId: USER_ID });
      expect(mockTask.save).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(mockTask);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task successfully', async () => {
      mockReq.params = { id: TASK_ID_1 };
      const mockTask: MockTask = { _id: TASK_ID_1, userId: USER_ID };

      (Task.findOneAndDelete as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockTask);

      await deleteTask(
        mockReq as Request<{ id: string }>,
        mockRes as Response,
        mockNext
      );

      expect(Task.findOneAndDelete).toHaveBeenCalledWith({ _id: TASK_ID_1, userId: USER_ID });
      expect(mockJson).toHaveBeenCalledWith({ message: 'Task deleted successfully' });
    });
  });

  describe('updateTaskStatus', () => {
    it('should update task status successfully', async () => {
      mockReq.params = { id: TASK_ID_1 };
      mockReq.body = { status: 'completed' };

      const mockTask: MockTask = {
        _id: TASK_ID_1,
        status: 'todo',
        userId: USER_ID,
        save: vi.fn().mockResolvedValueOnce(undefined)
      };

      (Task.findOne as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockTask);

      await updateTaskStatus(
        mockReq as Request<{ id: string }>,
        mockRes as Response,
        mockNext
      );

      expect(Task.findOne).toHaveBeenCalledWith({ _id: TASK_ID_1, userId: USER_ID });
      expect(mockTask.save).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(mockTask);
    });
  });
}); 