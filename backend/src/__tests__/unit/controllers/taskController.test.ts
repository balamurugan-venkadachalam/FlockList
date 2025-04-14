import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus
} from '../../../controllers/taskController';
import { Task, ITask } from '../../../models/Task';
import {
  AuthenticationError,
  NotFoundError,
  ValidationError
} from '../../../types/errors';
import { TaskQueryParams, TaskRequestBody } from '../../../../src/types/request';

// Mock Task model
vi.mock('../../../models/Task');

// Valid MongoDB ObjectId strings
const USER_ID = '507f1f77bcf86cd799439011';
const TASK_ID_1 = '507f1f77bcf86cd799439012';
const TASK_ID_2 = '507f1f77bcf86cd799439013';

describe('Task Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: ReturnType<typeof vi.fn>;
  let mockJson: any;
  let mockStatus: any;

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
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'medium' as const,
        dueDate: new Date(),
        status: 'todo' as const,
        userId: new mongoose.Types.ObjectId(USER_ID)
      };

      mockReq.body = taskData;
      const mockTask = {
        ...taskData,
        _id: new mongoose.Types.ObjectId(),
        userId: mockReq.user?.userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      vi.mocked(Task.create).mockResolvedValue(mockTask as any);

      await createTask(mockReq as Request, mockRes as Response, mockNext);

      expect(Task.create).toHaveBeenCalledWith({
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        dueDate: taskData.dueDate,
        userId: mockReq.user?.userId
      });
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Task created successfully',
        task: mockTask
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      mockReq.user = undefined;

      await createTask(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AuthenticationError));
    });
  });

  describe('getTasks', () => {
    it('should get all tasks for a user', async () => {
      const mockTasks = [{ id: '1', title: 'Test Task' }];
      const mockQuery = { userId: 'testUserId' };
      const mockFindResult = {
        sort: vi.fn().mockReturnThis(),
      };

      vi.mocked(Task.find).mockReturnValue(mockFindResult as any);
      mockFindResult.sort.mockResolvedValue(mockTasks);

      const req = {
        user: { userId: 'testUserId' },
        query: {}
      } as Request;
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis()
      } as unknown as Response;
      const next = vi.fn();

      await getTasks(req, res, next);

      expect(Task.find).toHaveBeenCalledWith(mockQuery);
      expect(mockFindResult.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.json).toHaveBeenCalledWith({
        message: 'Tasks retrieved successfully',
        tasks: mockTasks
      });
    });

    it('should filter tasks by status and priority', async () => {
      mockReq.query = { status: 'todo', priority: 'high' };
      const mockTasks: ITask[] = [
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Task 1',
          description: 'Description 1',
          status: 'todo' as const,
          priority: 'high' as const,
          dueDate: new Date(),
          userId: new mongoose.Types.ObjectId(USER_ID),
          createdAt: new Date(),
          updatedAt: new Date(),
          toJSON: () => ({
            _id: mockTasks[0]._id,
            title: mockTasks[0].title,
            description: mockTasks[0].description,
            status: mockTasks[0].status,
            priority: mockTasks[0].priority,
            dueDate: mockTasks[0].dueDate,
            userId: mockTasks[0].userId,
            createdAt: mockTasks[0].createdAt,
            updatedAt: mockTasks[0].updatedAt
          })
        } as unknown as ITask
      ];
      
      // Fix the mock to return tasks array after sort
      const mockFindResult = {
        sort: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(mockTasks)
        })
      };
      
      vi.mocked(Task.find).mockReturnValue(mockFindResult as unknown as mongoose.Query<ITask[], ITask, {}, ITask, ITask>);

      await getTasks(mockReq as Request, mockRes as Response, mockNext);

      expect(Task.find).toHaveBeenCalledWith({
        userId: USER_ID,
        status: 'todo',
        priority: 'high'
      });
    });
  });

  describe('getTaskById', () => {
    it('should get a task by id', async () => {
      const taskId = new mongoose.Types.ObjectId();
      mockReq.params = { id: taskId.toString() };
      const mockTask = new Task({
        _id: taskId,
        title: 'Test Task',
        description: 'Test Description',
        status: 'todo' as const,
        priority: 'high' as const,
        dueDate: new Date(),
        userId: new mongoose.Types.ObjectId(USER_ID),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      vi.mocked(Task.findOne).mockResolvedValue(mockTask);

      await getTaskById(mockReq as Request<{ id: string }>, mockRes as Response, mockNext);

      expect(Task.findOne).toHaveBeenCalledWith({
        _id: taskId.toString(),
        userId: USER_ID
      });
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Task retrieved successfully',
        task: mockTask
      });
    });

    it('should return 404 if task not found', async () => {
      mockReq.params = { id: TASK_ID_1 };
      vi.mocked(Task.findOne).mockResolvedValueOnce(null);

      await getTaskById(mockReq as Request<{ id: string }>, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
    });
  });

  describe('updateTask', () => {
    it('should update a task', async () => {
      const taskId = new mongoose.Types.ObjectId().toString();
      const updateData = {
        title: 'Updated Task',
        description: 'Updated Description',
        priority: 'high' as const,
        status: 'in_progress' as const
      };
      mockReq.params = { id: taskId };
      mockReq.body = updateData;

      const updatedTask = {
        _id: taskId,
        title: 'Updated Task',
        description: 'Updated Description',
        status: 'in_progress',
        priority: 'high',
        dueDate: new Date('2025-04-13T10:42:28.763Z'),
        userId: USER_ID,
        createdAt: new Date('2025-04-13T10:42:28.763Z'),
        updatedAt: new Date('2025-04-13T10:42:28.763Z')
      };

      const mockTaskWithMethods = {
        ...updatedTask,
        save: vi.fn().mockResolvedValue(updatedTask),
        toJSON: () => updatedTask
      };

      Task.findOne = vi.fn().mockResolvedValue(mockTaskWithMethods);

      await updateTask(mockReq as Request<{ id: string }, {}, TaskRequestBody>, mockRes as Response, mockNext);

      expect(Task.findOne).toHaveBeenCalledWith({ _id: taskId, userId: USER_ID });
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Task updated successfully',
        task: expect.objectContaining({
          _id: taskId,
          title: 'Updated Task',
          description: 'Updated Description',
          status: 'in_progress',
          priority: 'high',
          userId: USER_ID
        })
      }));
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      const taskId = new mongoose.Types.ObjectId();
      mockReq.params = { id: taskId.toString() };
      const mockDeletedTask = new Task({
        _id: taskId,
        title: 'Test Task',
        description: 'Test Description',
        status: 'todo' as const,
        priority: 'high' as const,
        dueDate: new Date(),
        userId: new mongoose.Types.ObjectId(USER_ID),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      vi.mocked(Task.findOneAndDelete).mockResolvedValue(mockDeletedTask);

      await deleteTask(mockReq as Request<{ id: string }>, mockRes as Response, mockNext);

      expect(Task.findOneAndDelete).toHaveBeenCalledWith({
        _id: taskId.toString(),
        userId: USER_ID
      });
      expect(mockJson).toHaveBeenCalledWith({ message: 'Task deleted successfully' });
    });
  });

  describe('updateTaskStatus', () => {
    it('should update task status successfully', async () => {
      const taskId = new mongoose.Types.ObjectId().toString();
      const status = 'completed' as const;
      mockReq.params = { id: taskId };
      mockReq.body = { status };

      const updatedTaskWithStatus = {
        _id: taskId,
        title: 'Test Task',
        description: 'Test Description',
        status: 'completed',
        priority: 'high',
        dueDate: new Date('2025-04-13T10:42:28.765Z'),
        userId: USER_ID,
        createdAt: new Date('2025-04-13T10:42:28.765Z'),
        updatedAt: new Date('2025-04-13T10:42:28.765Z')
      };

      const mockTaskWithMethods = {
        ...updatedTaskWithStatus,
        save: vi.fn().mockResolvedValue(updatedTaskWithStatus),
        toJSON: () => updatedTaskWithStatus
      };

      Task.findOne = vi.fn().mockResolvedValue(mockTaskWithMethods);

      await updateTaskStatus(mockReq as Request<{ id: string }>, mockRes as Response, mockNext);

      expect(Task.findOne).toHaveBeenCalledWith({ _id: taskId, userId: USER_ID });
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Task status updated successfully',
        task: expect.objectContaining({
          _id: taskId,
          title: 'Test Task',
          description: 'Test Description',
          status: 'completed',
          priority: 'high',
          userId: USER_ID
        })
      }));
    });

    it('should return 400 for invalid status', async () => {
      const taskId = new mongoose.Types.ObjectId().toString();
      mockReq.params = { id: taskId };
      mockReq.body = { status: 'invalid_status' };

      const mockTask = {
        _id: taskId,
        title: 'Test Task',
        description: 'Test Description',
        status: 'todo',
        priority: 'high',
        dueDate: new Date(),
        userId: USER_ID,
        save: vi.fn().mockRejectedValue(new ValidationError('Invalid status value'))
      };

      Task.findOne = vi.fn().mockResolvedValue(mockTask);

      await updateTaskStatus(mockReq as Request<{ id: string }>, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'ValidationError',
          message: 'Invalid status value'
        })
      );
    });
  });
}); 