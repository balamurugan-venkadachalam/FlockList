import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { Response } from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as taskController from '../../../controllers/taskController';
import { Task } from '../../../models/Task';
import { User } from '../../../models/User';
import { AuthRequest } from '../../../types/auth';

describe('Task Controller - Integration Tests', () => {
  // Test users
  const testUser = {
    _id: new mongoose.Types.ObjectId(),
    userId: '',
    email: 'user@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'parent'
  };
  
  const otherUser = {
    _id: new mongoose.Types.ObjectId(),
    userId: '',
    email: 'other@example.com',
    firstName: 'Other',
    lastName: 'User',
    role: 'parent'
  };

  // Test task
  let testTask: any;
  
  // Setup mock request and response
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: ReturnType<typeof vi.fn>;

  beforeAll(async () => {
    // Set user IDs
    testUser.userId = testUser._id.toString();
    otherUser.userId = otherUser._id.toString();

    // Create test users in the database
    await User.create({
      _id: testUser._id,
      email: testUser.email,
      firstName: testUser.firstName,
      lastName: testUser.lastName,
      password: 'password123',
      role: testUser.role,
    });

    await User.create({
      _id: otherUser._id,
      email: otherUser.email,
      firstName: otherUser.firstName,
      lastName: otherUser.lastName,
      password: 'password123',
      role: otherUser.role,
    });
  });

  beforeEach(() => {
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockNext = vi.fn();
  });

  afterEach(async () => {
    // Clean up tasks after each test
    await Task.deleteMany({});
    vi.clearAllMocks();
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      mockRequest = {
        user: { userId: testUser.userId, role: testUser.role },
        body: {
          title: 'Test Task',
          description: 'Test Description',
          priority: 'high' as const,
          dueDate: new Date('2023-12-31'),
        },
      } as AuthRequest;

      await taskController.createTask(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalled();
      
      const jsonFn = mockResponse.json as ReturnType<typeof vi.fn>;
      const responseData = jsonFn.mock.calls[0][0];
      expect(responseData.title).toBe('Test Task');
      expect(responseData.description).toBe('Test Description');
      expect(responseData.priority).toBe('high');
      expect(responseData.status).toBe('todo');
      
      // Save the created task for later tests
      testTask = responseData;
    });

    it('should throw an error if user is not authenticated', async () => {
      mockRequest = {
        user: undefined,
        body: {
          title: 'Test Task',
          description: 'Test Description',
        },
      } as AuthRequest;

      await taskController.createTask(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error.message).toBe('User not authenticated');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('getTasks', () => {
    beforeEach(async () => {
      // Create test tasks for the user
      testTask = await Task.create({
        title: 'Task 1',
        description: 'Description 1',
        priority: 'medium',
        status: 'todo',
        userId: testUser._id
      });

      await Task.create({
        title: 'Task 2',
        description: 'Description 2',
        priority: 'high',
        status: 'in_progress',
        userId: testUser._id
      });

      // Create a task for another user
      await Task.create({
        title: 'Other User Task',
        description: 'Not for test user',
        priority: 'low',
        status: 'todo',
        userId: otherUser._id
      });
    });

    it('should return all tasks for a user', async () => {
      mockRequest = {
        user: { userId: testUser.userId, role: testUser.role },
        query: {},
      } as AuthRequest;

      await taskController.getTasks(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalled();
      const jsonFn = mockResponse.json as ReturnType<typeof vi.fn>;
      const responseData = jsonFn.mock.calls[0][0];
      expect(responseData.length).toBe(2);
      expect(responseData.some((task: any) => task.title === 'Task 1')).toBe(true);
      expect(responseData.some((task: any) => task.title === 'Task 2')).toBe(true);
      expect(responseData.some((task: any) => task.title === 'Other User Task')).toBe(false);
    });

    it('should filter tasks by status', async () => {
      mockRequest = {
        user: { userId: testUser.userId, role: testUser.role },
        query: { status: 'in_progress' },
      } as AuthRequest;

      await taskController.getTasks(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalled();
      const jsonFn = mockResponse.json as ReturnType<typeof vi.fn>;
      const responseData = jsonFn.mock.calls[0][0];
      expect(responseData.length).toBe(1);
      expect(responseData[0].title).toBe('Task 2');
      expect(responseData[0].status).toBe('in_progress');
    });

    it('should filter tasks by priority', async () => {
      mockRequest = {
        user: { userId: testUser.userId, role: testUser.role },
        query: { priority: 'high' },
      } as AuthRequest;

      await taskController.getTasks(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalled();
      const jsonFn = mockResponse.json as ReturnType<typeof vi.fn>;
      const responseData = jsonFn.mock.calls[0][0];
      expect(responseData.length).toBe(1);
      expect(responseData[0].title).toBe('Task 2');
      expect(responseData[0].priority).toBe('high');
    });

    it('should throw an error if user is not authenticated', async () => {
      mockRequest = {
        user: undefined,
        query: {},
      } as AuthRequest;

      await taskController.getTasks(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error.message).toBe('User not authenticated');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('getTaskById', () => {
    beforeEach(async () => {
      // Create a test task
      testTask = await Task.create({
        title: 'Test Task',
        description: 'Test Description',
        priority: 'medium',
        status: 'todo',
        userId: testUser._id
      });
    });

    it('should return a task by ID if user owns it', async () => {
      mockRequest = {
        user: { userId: testUser.userId, role: testUser.role },
        params: { id: testTask._id.toString() },
      } as unknown as AuthRequest<{ id: string }>;

      await taskController.getTaskById(
        mockRequest as AuthRequest<{ id: string }>,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalled();
      const jsonFn = mockResponse.json as ReturnType<typeof vi.fn>;
      const responseData = jsonFn.mock.calls[0][0];
      expect(responseData._id.toString()).toBe(testTask._id.toString());
      expect(responseData.title).toBe('Test Task');
      expect(responseData.description).toBe('Test Description');
    });

    it('should throw an error if task does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      mockRequest = {
        user: { userId: testUser.userId, role: testUser.role },
        params: { id: nonExistentId.toString() },
      } as unknown as AuthRequest<{ id: string }>;

      await taskController.getTaskById(
        mockRequest as AuthRequest<{ id: string }>,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error.message).toBe('Task not found');
      expect(error.statusCode).toBe(404);
    });

    it('should throw an error if user is trying to access another user\'s task', async () => {
      mockRequest = {
        user: { userId: otherUser.userId, role: otherUser.role },
        params: { id: testTask._id.toString() },
      } as unknown as AuthRequest<{ id: string }>;

      await taskController.getTaskById(
        mockRequest as AuthRequest<{ id: string }>,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error.message).toBe('Task not found');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('updateTask', () => {
    beforeEach(async () => {
      // Create a test task
      testTask = await Task.create({
        title: 'Original Title',
        description: 'Original Description',
        priority: 'medium',
        status: 'todo',
        userId: testUser._id
      });
    });

    it('should update a task if user owns it', async () => {
      mockRequest = {
        user: { userId: testUser.userId, role: testUser.role },
        params: { id: testTask._id.toString() },
        body: {
          title: 'Updated Title',
          description: 'Updated Description',
          priority: 'high' as const
        },
      } as unknown as AuthRequest<{ id: string }>;

      await taskController.updateTask(
        mockRequest as AuthRequest<{ id: string }>,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalled();
      const jsonFn = mockResponse.json as ReturnType<typeof vi.fn>;
      const responseData = jsonFn.mock.calls[0][0];
      expect(responseData.title).toBe('Updated Title');
      expect(responseData.description).toBe('Updated Description');
      expect(responseData.priority).toBe('high');
      
      // Verify in database
      const updatedTask = await Task.findById(testTask._id);
      expect(updatedTask?.title).toBe('Updated Title');
      expect(updatedTask?.description).toBe('Updated Description');
    });

    it('should throw an error if task does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      mockRequest = {
        user: { userId: testUser.userId, role: testUser.role },
        params: { id: nonExistentId.toString() },
        body: {
          title: 'Updated Title',
        },
      } as unknown as AuthRequest<{ id: string }>;

      await taskController.updateTask(
        mockRequest as AuthRequest<{ id: string }>,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error.message).toBe('Task not found');
      expect(error.statusCode).toBe(404);
    });

    it('should throw an error if user is trying to update another user\'s task', async () => {
      mockRequest = {
        user: { userId: otherUser.userId, role: otherUser.role },
        params: { id: testTask._id.toString() },
        body: {
          title: 'Should Not Update',
        },
      } as unknown as AuthRequest<{ id: string }>;

      await taskController.updateTask(
        mockRequest as AuthRequest<{ id: string }>,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error.message).toBe('Task not found');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('deleteTask', () => {
    beforeEach(async () => {
      // Create a test task
      testTask = await Task.create({
        title: 'Task to Delete',
        description: 'Will be deleted',
        priority: 'medium',
        status: 'todo',
        userId: testUser._id
      });
    });

    it('should delete a task if user owns it', async () => {
      mockRequest = {
        user: { userId: testUser.userId, role: testUser.role },
        params: { id: testTask._id.toString() },
      } as unknown as AuthRequest<{ id: string }>;

      await taskController.deleteTask(
        mockRequest as AuthRequest<{ id: string }>,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalled();
      const jsonFn = mockResponse.json as ReturnType<typeof vi.fn>;
      const responseData = jsonFn.mock.calls[0][0];
      expect(responseData.message).toBe('Task deleted successfully');
      
      // Verify task is deleted in database
      const deletedTask = await Task.findById(testTask._id);
      expect(deletedTask).toBeNull();
    });

    it('should throw an error if task does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      mockRequest = {
        user: { userId: testUser.userId, role: testUser.role },
        params: { id: nonExistentId.toString() },
      } as unknown as AuthRequest<{ id: string }>;

      await taskController.deleteTask(
        mockRequest as AuthRequest<{ id: string }>,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error.message).toBe('Task not found');
      expect(error.statusCode).toBe(404);
    });

    it('should throw an error if user is trying to delete another user\'s task', async () => {
      mockRequest = {
        user: { userId: otherUser.userId, role: otherUser.role },
        params: { id: testTask._id.toString() },
      } as unknown as AuthRequest<{ id: string }>;

      await taskController.deleteTask(
        mockRequest as AuthRequest<{ id: string }>,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error.message).toBe('Task not found');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('updateTaskStatus', () => {
    beforeEach(async () => {
      // Create a test task
      testTask = await Task.create({
        title: 'Status Task',
        description: 'Status will be updated',
        priority: 'medium',
        status: 'todo',
        userId: testUser._id
      });
    });

    it('should update task status if user owns it', async () => {
      mockRequest = {
        user: { userId: testUser.userId, role: testUser.role },
        params: { id: testTask._id.toString() },
        body: {
          status: 'completed' as const
        },
      } as unknown as AuthRequest<{ id: string }>;

      await taskController.updateTaskStatus(
        mockRequest as AuthRequest<{ id: string }>,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalled();
      const jsonFn = mockResponse.json as ReturnType<typeof vi.fn>;
      const responseData = jsonFn.mock.calls[0][0];
      expect(responseData.status).toBe('completed');
      
      // Verify in database
      const updatedTask = await Task.findById(testTask._id);
      expect(updatedTask?.status).toBe('completed');
    });

    it('should throw an error if task does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      mockRequest = {
        user: { userId: testUser.userId, role: testUser.role },
        params: { id: nonExistentId.toString() },
        body: {
          status: 'in_progress' as const
        },
      } as unknown as AuthRequest<{ id: string }>;

      await taskController.updateTaskStatus(
        mockRequest as AuthRequest<{ id: string }>,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error.message).toBe('Task not found');
      expect(error.statusCode).toBe(404);
    });

    it('should throw an error if user is trying to update another user\'s task status', async () => {
      mockRequest = {
        user: { userId: otherUser.userId, role: otherUser.role },
        params: { id: testTask._id.toString() },
        body: {
          status: 'in_progress' as const
        },
      } as unknown as AuthRequest<{ id: string }>;

      await taskController.updateTaskStatus(
        mockRequest as AuthRequest<{ id: string }>,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error.message).toBe('Task not found');
      expect(error.statusCode).toBe(404);
    });
  });
}); 