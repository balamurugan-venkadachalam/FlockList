//@ts-nocheck - Disable TypeScript type checking for this test file
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Response, NextFunction } from 'express';

// Prevent real DB connections in unit tests
vi.mock('mongoose', () => ({
  ...require('mongoose'),
  connect: vi.fn(),
  model: vi.fn(),
  connection: { on: vi.fn(), once: vi.fn() }
}));

import mongoose from 'mongoose';
// Define test constants
const TEST_USER_ID = '507f1f77bcf86cd799439011';
const mockUserFlock = {
  _id: 'mockFlockId',
  members: [{ user: TEST_USER_ID, role: 'admin' }]
};

// Mock the service layer instead of the models directly
vi.mock('@/services/taskService', () => ({
  createTask: vi.fn(),
  getTasks: vi.fn(),
  getTaskById: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
  updateTaskStatus: vi.fn()
}));

// We still need these mocks for some direct model access in the controller
vi.mock('../../../models/Flock', () => ({
  Flock: {
    find: vi.fn().mockImplementation(() => ({
      select: vi.fn().mockImplementation(() => ({
        exec: vi.fn().mockResolvedValue([{ _id: { toString: () => 'mockFlockId' } }])
      }))
    })),
    findById: vi.fn().mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue({})
    }))
  }
}));

vi.mock('../../../models/User', () => ({ User: {} }));

import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus
} from '../../../controllers/taskController';
import { Flock } from '../../../models/Flock';
import { AuthenticationError, NotFoundError, ValidationError } from '../../../types/errors';
import { AuthRequest } from '../../../middleware/authMiddleware';
import { Task } from '../../../models/Task';
import * as taskService from '@/services/taskService';

// Define constants for testing
const USER_ID = '507f1f77bcf86cd799439011';
const FAMILY_ID = '507f1f77bcf86cd799439099';
const TASK_ID_1 = '60f1f77bcf86cd799439011a';
const TASK_ID_2 = '60f1f77bcf86cd799439012';

// Define interfaces for test data
interface CreateTaskBody {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: string;
  assignees?: string[];
  category?: string;
  flockId: string;
}

interface UpdateTaskBody {
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: string;
  assignees?: string[];
  category?: string;
  status?: string;
}

interface UpdateTaskStatusBody {
  status: string;
}

// Mock Task module before importing it
vi.mock('../../../models/Task', () => {
  // Create a mock implementation of the Task constructor and add static methods
  const TaskMock = vi.fn();
  
  // Type assertion here to prevent TypeScript errors
  Object.assign(TaskMock, {
    find: vi.fn(),
    findById: vi.fn(),
    findByIdAndDelete: vi.fn()
  });
  
  return {
    Task: TaskMock,
    TaskStatus: {
      PENDING: 'pending',
      IN_PROGRESS: 'in_progress',
      COMPLETED: 'completed',
      CANCELLED: 'cancelled'
    },
    TaskPriority: {
      LOW: 'low',
      MEDIUM: 'medium',
      HIGH: 'high'
    },
    TaskCategory: {
      HOUSEHOLD: 'household',
      SCHOOL: 'school',
      WORK: 'work',
      OTHER: 'other'
    }
  };
});

describe('Task Controller', () => {
  // Set up mocks for request, response, and next function
  let mockReq: Partial<AuthRequest>;
  let mockRes: any;
  let mockNext: any;
  let mockJson: any;
  let mockStatus: any;
  
  
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Set up mocks for response
    mockJson = vi.fn().mockReturnThis();
    mockStatus = vi.fn().mockReturnThis();
    
    // Use @ts-ignore to bypass type checks for the test mocks
    // @ts-ignore
    mockRes = {
      json: mockJson,
      status: mockStatus,
    };
    
    // Set up mock for request
    mockReq = {
      body: {},
      params: {},
      query: {},
      user: {
        userId: TEST_USER_ID,
        role: 'admin'
      }
    };
    
    // Set up mock for next function
    // @ts-ignore
    mockNext = vi.fn();
  });

  describe('createTask', () => {
    it('should create a new task successfully', async () => {
      // Arrange
      const taskData: CreateTaskBody = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'high',
        dueDate: new Date().toISOString(),
        flockId: FAMILY_ID
      };
      
      mockReq.body = taskData;
      
      // Create a mock task instance that will be returned by the service
      const mockTaskInstance = {
        _id: new mongoose.Types.ObjectId(),
        title: taskData.title,
        description: taskData.description,
        status: 'pending',
        priority: taskData.priority,
        dueDate: new Date(taskData.dueDate),
        createdBy: TEST_USER_ID,
        flock: FAMILY_ID,
        assignees: [TEST_USER_ID]
      };
      
      // Mock the taskService.createTask to return our mock instance
      (taskService.createTask as any).mockResolvedValue(mockTaskInstance);
      
      // Act
      await createTask(
        mockReq as AuthRequest,
        mockRes as Response,
        mockNext
      );
      
      // Assert
      // Verify service was called with correct params
      expect(taskService.createTask).toHaveBeenCalledWith({
        ...taskData,
        createdBy: TEST_USER_ID
      });
      
      // Verify correct response
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Task created successfully',
        task: mockTaskInstance
      });
    });

    it('should handle validation errors', async () => {
      // Arrange
      mockReq.body = {
        title: '',  // Invalid title
        flockId: '' // Missing flock ID
      };
      
      // Mock taskService.createTask to throw a ValidationError
      (taskService.createTask as any).mockRejectedValue(new ValidationError('Validation failed'));

      // Act
      await createTask(
        mockReq as AuthRequest,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it('should handle authentication errors', async () => {
      // Arrange
      mockReq.body = {
        title: 'Test Task',
        flockId: FAMILY_ID
      };
      mockReq.user = null; // User not authenticated

      // Act
      await createTask(
        mockReq as AuthRequest,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(AuthenticationError));
    });
  });

  describe('getTasks', () => {
    it('should return all tasks for the user', async () => {
      // Arrange
      const mockTasks = [
        {
          _id: TASK_ID_1,
          title: 'Task 1',
          description: 'Description 1',
          status: 'pending',
          priority: 'high',
          flock: FAMILY_ID,
          createdBy: {
            _id: TEST_USER_ID,
            firstName: 'Test',
            lastName: 'User'
          },
          assignees: [
            {
              _id: TEST_USER_ID,
              firstName: 'Test',
              lastName: 'User'
            }
          ]
        },
        {
          _id: TASK_ID_2,
          title: 'Task 2',
          description: 'Description 2',
          status: 'completed',
          priority: 'medium',
          flock: FAMILY_ID,
          createdBy: {
            _id: TEST_USER_ID,
            firstName: 'Test',
            lastName: 'User'
          },
          assignees: [
            {
              _id: TEST_USER_ID,
              firstName: 'Test',
              lastName: 'User'
            }
          ]
        }
      ];

      // Mock taskService.getTasks to return our mock tasks
      (taskService.getTasks as any).mockResolvedValue(mockTasks);

      // Act
      await getTasks(
        mockReq as AuthRequest,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(taskService.getTasks).toHaveBeenCalledWith({
        userId: TEST_USER_ID,
        filters: {}
      });
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Tasks retrieved successfully',
        tasks: mockTasks
      });
    });
  });

  describe('getTaskById', () => {
    it('should return a task by id', async () => {
      // Arrange
      // Define fully populated mockTask for return
      const fullMockTask = {
        _id: TASK_ID_1,
        title: 'Task 1',
        description: 'Description 1',
        status: 'pending',
        priority: 'high',
        flock: {
          _id: FAMILY_ID,
          name: 'Test Flock'
        },
        createdBy: {
          _id: TEST_USER_ID,
          firstName: 'Test',
          lastName: 'User'
        },
        assignees: [
          {
            _id: TEST_USER_ID,
            firstName: 'Test',
            lastName: 'User'
          }
        ]
      };

      // Set up request params
      mockReq.params = { taskId: TASK_ID_1 };

      // Mock taskService.getTaskById to return our mock task
      (taskService.getTaskById as any).mockResolvedValue(fullMockTask);

      // Act
      await getTaskById(
        mockReq as AuthRequest<{ taskId: string }>,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(taskService.getTaskById).toHaveBeenCalledWith({
        taskId: TASK_ID_1,
        userId: TEST_USER_ID
      });
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Task retrieved successfully',
        task: fullMockTask
      });
    });

    it.skip('should return 404 if task not found', async () => {
      // Set up Flock.find to return an array with proper _id objects
      const mockFlockArray = [{ _id: { toString: () => 'mockFlockId' } }];
      const mockExec = vi.fn().mockResolvedValue(mockFlockArray);
      const mockSelect = vi.fn().mockReturnValue({ exec: mockExec });
      (Flock.find as any).mockReturnValue({ select: mockSelect });
      // Arrange
      mockReq.params = { taskId: TASK_ID_1 };
      // Helper to create deep populate chain
      function buildPopulateChain(result: any, depth: number) {
        let chain = { exec: vi.fn().mockResolvedValue(result) };
        for (let i = 0; i < depth; i++) {
          chain = { populate: vi.fn().mockReturnValue(chain), exec: chain.exec };
        }
        return chain;
      }
      (Task.findById as any).mockReturnValue(buildPopulateChain(null, 4));

      // Act
      await getTaskById(
        mockReq as AuthRequest<{ taskId: string }>,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
    });
  });

  describe('updateTask', () => {
    it('should update a task successfully', async () => {
      // Arrange
      const updateData: UpdateTaskBody = {
        title: 'Updated Task Title',
        description: 'Updated Description',
        priority: 'medium'
      };
      
      mockReq.params = { taskId: TASK_ID_1 };
      mockReq.body = updateData;
      
      // Create the updated task that will be returned after update
      const updatedTask = {
        _id: TASK_ID_1,
        title: updateData.title,
        description: updateData.description,
        priority: updateData.priority,
        status: 'pending',
        dueDate: new Date(),
        createdBy: { _id: TEST_USER_ID },
        flock: { _id: FAMILY_ID },
        assignees: [{ _id: TEST_USER_ID }]
      };
      
      // Mock taskService.updateTask to return our updated task
      (taskService.updateTask as any).mockResolvedValue(updatedTask);

      // Act
      await updateTask(
        mockReq as AuthRequest<{ taskId: string }>,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(taskService.updateTask).toHaveBeenCalledWith({
        taskId: TASK_ID_1,
        updates: updateData,
        userId: TEST_USER_ID
      });
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Task updated successfully',
        task: updatedTask
      });
    });
  });

  describe('deleteTask', () => {
    it('should delete a task successfully', async () => {
      // Arrange
      mockReq.params = { taskId: TASK_ID_1 };

      // Mock taskService.deleteTask to return success
      (taskService.deleteTask as any).mockResolvedValue({ success: true });

      // Act
      await deleteTask(mockReq as AuthRequest<{ taskId: string }>, mockRes, mockNext);

      // Assert
      expect(taskService.deleteTask).toHaveBeenCalledWith({
        taskId: TASK_ID_1,
        userId: TEST_USER_ID
      });
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Task deleted successfully'
      });
    });
  });


  describe('updateTaskStatus', () => {
    it.skip('should update task status successfully', async () => {
      // Set up Flock.find to return an array with proper _id objects
      const mockFlockArray = [{ _id: { toString: () => 'mockFlockId' } }];
      const mockExec = vi.fn().mockResolvedValue(mockFlockArray);
      const mockSelect = vi.fn().mockReturnValue({ exec: mockExec });
      (Flock.find as any).mockReturnValue({ select: mockSelect });
      
      // Set up Task.findById to return a task with the necessary properties
      // Arrange
      mockReq.params = { taskId: TASK_ID_1 };
      mockReq.body = { status: 'completed' };
      
      const originalTask = {
        _id: TASK_ID_1,
        status: 'pending',
        createdBy: new mongoose.Types.ObjectId(TEST_USER_ID), // <-- Revert to ObjectId
        assignees: [new mongoose.Types.ObjectId(TEST_USER_ID)], // <-- Revert to ObjectId
      };

      const updatedTask = {
        ...originalTask,
        status: 'completed',
        completedBy: { toString: () => TEST_USER_ID },
        completedAt: expect.any(Date)
      };

      // Helper to create deep populate chain
      function buildPopulateChain(result: any, depth: number) {
        let chain = { exec: vi.fn().mockResolvedValue(result) };
        for (let i = 0; i < depth; i++) {
          chain = { populate: vi.fn().mockReturnValue(chain), exec: chain.exec };
        }
        return chain;
      }

      // Add the save mock after the object is defined
      originalTask.save = vi.fn().mockResolvedValue(undefined);

      // Mock first findById to get the original task
      (Task.findById as any).mockResolvedValueOnce(originalTask);
      
      // Mock second findById and populate chain for getting the updated task
      (Task.findById as any).mockReturnValueOnce(buildPopulateChain(updatedTask, 4));

      // Act
      await updateTaskStatus(
        mockReq as AuthRequest<{ taskId: string }>,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(originalTask.save).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Task status updated successfully',
        task: updatedTask
      });
    });
  });
}); 