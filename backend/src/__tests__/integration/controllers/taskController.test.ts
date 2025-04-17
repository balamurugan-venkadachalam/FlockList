import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { Response } from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as taskController from '../../../controllers/taskController';
import { Task } from '../../../models/Task';
import { User } from '../../../models/User';
import { Family } from '../../../models/Family';
import { AuthRequest } from '../../../types/auth';

describe('Task Controller - Integration Tests', () => {
  let mongoServer: MongoMemoryServer;
  
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

  // Test family
  let testFamily: any;
  
  // Test task
  let testTask: any;
  
  // Setup mock request and response
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: ReturnType<typeof vi.fn>;

  beforeAll(async () => {
    // Connect to a new in-memory database
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    
    // Close any existing connections before creating a new one
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    await mongoose.connect(uri);

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

    // Create a test family
    testFamily = await Family.create({
      name: 'Test Family',
      createdBy: testUser._id,
      members: [
        {
          user: testUser._id,
          role: 'parent',
          joinedAt: new Date()
        }
      ]
    });
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
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
          dueDate: new Date('2023-12-31').toISOString(),
          familyId: testFamily._id.toString()
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
      expect(responseData.message).toBe('Task created successfully');
      expect(responseData.task.title).toBe('Test Task');
      expect(responseData.task.description).toBe('Test Description');
      expect(responseData.task.priority).toBe('high');
      expect(responseData.task.status).toBe('pending');
      
      // Save the created task for later tests
      testTask = responseData.task;
    });

    it('should throw an error if user is not authenticated', async () => {
      mockRequest = {
        user: undefined,
        body: {
          title: 'Test Task',
          description: 'Test Description',
          familyId: testFamily._id.toString()
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

    it('should throw an error if required fields are missing', async () => {
      mockRequest = {
        user: { userId: testUser.userId, role: testUser.role },
        body: {
          // Missing title
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
      expect(error.message).toBe('Title is required');
    });
  });

  describe('getTasks', () => {
    beforeEach(async () => {
      // Create test tasks for the user
      testTask = await Task.create({
        title: 'Task 1',
        description: 'Description 1',
        priority: 'medium',
        status: 'pending',
        createdBy: testUser._id,
        family: testFamily._id,
        assignees: [testUser._id]
      });

      await Task.create({
        title: 'Task 2',
        description: 'Description 2',
        priority: 'high',
        status: 'in-progress',
        createdBy: testUser._id,
        family: testFamily._id,
        assignees: [testUser._id]
      });

      // Create a task for another user
      await Task.create({
        title: 'Other User Task',
        description: 'Not for test user',
        priority: 'low',
        status: 'pending',
        createdBy: otherUser._id,
        family: testFamily._id,
        assignees: [otherUser._id]
      });
    });

    it('should return all tasks for a family', async () => {
      mockRequest = {
        user: { userId: testUser.userId, role: testUser.role },
        query: { 
          familyId: testFamily._id.toString() 
        },
      } as AuthRequest;

      await taskController.getTasks(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
      const jsonFn = mockResponse.json as ReturnType<typeof vi.fn>;
      const responseData = jsonFn.mock.calls[0][0];
      expect(responseData.message).toBe('Tasks retrieved successfully');
      expect(responseData.tasks.length).toBe(3);
      expect(responseData.tasks.some((task: any) => task.title === 'Task 1')).toBe(true);
      expect(responseData.tasks.some((task: any) => task.title === 'Task 2')).toBe(true);
      expect(responseData.tasks.some((task: any) => task.title === 'Other User Task')).toBe(true);
    });

    it('should return only tasks assigned to the user when no family specified', async () => {
      mockRequest = {
        user: { userId: testUser.userId, role: testUser.role },
        query: {},
      } as AuthRequest;

      await taskController.getTasks(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
      const jsonFn = mockResponse.json as ReturnType<typeof vi.fn>;
      const responseData = jsonFn.mock.calls[0][0];
      expect(responseData.message).toBe('Tasks retrieved successfully');
      expect(responseData.tasks.length).toBe(2);
      expect(responseData.tasks.some((task: any) => task.title === 'Task 1')).toBe(true);
      expect(responseData.tasks.some((task: any) => task.title === 'Task 2')).toBe(true);
      expect(responseData.tasks.some((task: any) => task.title === 'Other User Task')).toBe(false);
    });

    it('should filter tasks by status', async () => {
      mockRequest = {
        user: { userId: testUser.userId, role: testUser.role },
        query: { 
          status: 'in-progress',
          familyId: testFamily._id.toString()
        },
      } as AuthRequest;

      await taskController.getTasks(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
      const jsonFn = mockResponse.json as ReturnType<typeof vi.fn>;
      const responseData = jsonFn.mock.calls[0][0];
      expect(responseData.message).toBe('Tasks retrieved successfully');
      expect(responseData.tasks.length).toBe(1);
      expect(responseData.tasks[0].title).toBe('Task 2');
      expect(responseData.tasks[0].status).toBe('in-progress');
    });

    it('should filter tasks by priority', async () => {
      mockRequest = {
        user: { userId: testUser.userId, role: testUser.role },
        query: { 
          priority: 'high',
          familyId: testFamily._id.toString()
        },
      } as AuthRequest;

      await taskController.getTasks(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
      const jsonFn = mockResponse.json as ReturnType<typeof vi.fn>;
      const responseData = jsonFn.mock.calls[0][0];
      expect(responseData.message).toBe('Tasks retrieved successfully');
      expect(responseData.tasks.length).toBe(1);
      expect(responseData.tasks[0].title).toBe('Task 2');
      expect(responseData.tasks[0].priority).toBe('high');
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
        status: 'pending',
        createdBy: testUser._id,
        family: testFamily._id,
        assignees: [testUser._id]
      });
    });

    it('should return a task by ID if user is assignee', async () => {
      mockRequest = {
        user: { userId: testUser.userId, role: testUser.role },
        params: { id: testTask._id.toString() },
      } as unknown as AuthRequest<{ id: string }>;

      // Make sure the task is fully populated before the test
      await Task.findByIdAndUpdate(
        testTask._id,
        { 
          $set: { 
            createdBy: testUser._id,
            assignees: [testUser._id]
          } 
        },
        { new: true }
      );

      await taskController.getTaskById(
        mockRequest as AuthRequest<{ id: string }>,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
      const jsonFn = mockResponse.json as ReturnType<typeof vi.fn>;
      const responseData = jsonFn.mock.calls[0][0];
      expect(responseData.message).toBe('Task retrieved successfully');
      expect(responseData.task._id.toString()).toBe(testTask._id.toString());
      expect(responseData.task.title).toBe('Test Task');
      expect(responseData.task.description).toBe('Test Description');
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
    });

    it('should throw an error if user is not assignee or creator', async () => {
      // Create a different user for this test
      const nonAuthorizedUser = await User.create({
        name: 'Unauthorized User',
        email: 'unauthorized@example.com',
        password: 'password123',
        role: 'user',
      });

      mockRequest = {
        user: { userId: nonAuthorizedUser._id.toString(), role: nonAuthorizedUser.role },
        params: { id: testTask._id.toString() },
      } as unknown as AuthRequest<{ id: string }>;

      // Make sure the task has only the original user as creator and assignee
      await Task.findByIdAndUpdate(
        testTask._id,
        { 
          $set: { 
            createdBy: testUser._id,
            assignees: [testUser._id]
          } 
        },
        { new: true }
      );

      await taskController.getTaskById(
        mockRequest as AuthRequest<{ id: string }>,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      const nextFn = mockNext as ReturnType<typeof vi.fn>;
      const error = nextFn.mock.calls[0][0];
      expect(error).toBeInstanceOf(Error);
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Not authorized to view this task');
    });
  });

  describe('updateTask', () => {
    beforeEach(async () => {
      // Create a test task
      testTask = await Task.create({
        title: 'Original Title',
        description: 'Original Description',
        priority: 'medium',
        status: 'pending',
        createdBy: testUser._id,
        family: testFamily._id,
        assignees: [testUser._id]
      });
    });

    it('should update a task if user is creator', async () => {
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

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
      const jsonFn = mockResponse.json as ReturnType<typeof vi.fn>;
      const responseData = jsonFn.mock.calls[0][0];
      expect(responseData.message).toBe('Task updated successfully');
      expect(responseData.task.title).toBe('Updated Title');
      expect(responseData.task.description).toBe('Updated Description');
      expect(responseData.task.priority).toBe('high');
      
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
    });

    it('should throw an error if user is not creator or assignee', async () => {
      // Create a task that the other user is not assigned to
      const taskForTestUser = await Task.create({
        title: 'Not Assigned',
        description: 'Not assigned to other user',
        priority: 'medium',
        status: 'pending',
        createdBy: testUser._id,
        family: testFamily._id,
        assignees: [testUser._id] // Only the test user is assigned
      });

      mockRequest = {
        user: { userId: otherUser.userId, role: otherUser.role },
        params: { id: taskForTestUser._id.toString() },
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
      expect(error.message).toBe('Not authorized to update this task');
    });
  });

  describe('deleteTask', () => {
    beforeEach(async () => {
      // Create a test task
      testTask = await Task.create({
        title: 'Task to Delete',
        description: 'Will be deleted',
        priority: 'medium',
        status: 'pending',
        createdBy: testUser._id,
        family: testFamily._id,
        assignees: [testUser._id]
      });
    });

    it('should delete a task if user is creator', async () => {
      mockRequest = {
        user: { userId: testUser.userId, role: testUser.role },
        params: { id: testTask._id.toString() },
      } as unknown as AuthRequest<{ id: string }>;

      await taskController.deleteTask(
        mockRequest as AuthRequest<{ id: string }>,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
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
    });

    it('should throw an error if user is not the creator', async () => {
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
      expect(error.message).toBe('Not authorized to delete this task');
    });
  });

  describe('updateTaskStatus', () => {
    beforeEach(async () => {
      // Create a test task
      testTask = await Task.create({
        title: 'Status Task',
        description: 'Status will be updated',
        priority: 'medium',
        status: 'pending',
        createdBy: testUser._id,
        family: testFamily._id,
        assignees: [testUser._id]
      });
    });

    it('should update task status if user is assignee', async () => {
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

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
      const jsonFn = mockResponse.json as ReturnType<typeof vi.fn>;
      const responseData = jsonFn.mock.calls[0][0];
      expect(responseData.message).toBe('Task status updated successfully');
      expect(responseData.task.status).toBe('completed');
      
      // Verify in database
      const updatedTask = await Task.findById(testTask._id);
      expect(updatedTask?.status).toBe('completed');
      expect(updatedTask?.completedAt).toBeDefined();
      expect(updatedTask?.completedBy?.toString()).toBe(testUser._id.toString());
    });

    it('should update task status to in-progress', async () => {
      mockRequest = {
        user: { userId: testUser.userId, role: testUser.role },
        params: { id: testTask._id.toString() },
        body: {
          status: 'in-progress' as const
        },
      } as unknown as AuthRequest<{ id: string }>;

      await taskController.updateTaskStatus(
        mockRequest as AuthRequest<{ id: string }>,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
      
      // Verify in database
      const updatedTask = await Task.findById(testTask._id);
      expect(updatedTask?.status).toBe('in-progress');
    });

    it('should remove completedAt and completedBy when changing from completed to another status', async () => {
      // First mark as completed
      await Task.findByIdAndUpdate(testTask._id, {
        status: 'completed',
        completedAt: new Date(),
        completedBy: testUser._id
      });

      mockRequest = {
        user: { userId: testUser.userId, role: testUser.role },
        params: { id: testTask._id.toString() },
        body: {
          status: 'pending' as const
        },
      } as unknown as AuthRequest<{ id: string }>;

      await taskController.updateTaskStatus(
        mockRequest as AuthRequest<{ id: string }>,
        mockResponse as Response,
        mockNext
      );

      // Verify in database
      const updatedTask = await Task.findById(testTask._id);
      expect(updatedTask?.status).toBe('pending');
      expect(updatedTask?.completedAt).toBeUndefined();
      expect(updatedTask?.completedBy).toBeUndefined();
    });

    it('should throw an error for invalid status value', async () => {
      mockRequest = {
        user: { userId: testUser.userId, role: testUser.role },
        params: { id: testTask._id.toString() },
        body: {
          status: 'invalid-status' as any
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