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
// Mock Flock and User models to prevent real DB calls during populate
const TEST_USER_ID = '507f1f77bcf86cd799439011';
const mockUserFlock = {
  _id: 'mockFlockId',
  members: [{ user: TEST_USER_ID, role: 'admin' }]
};

// Mock Flock and User models to prevent real DB calls during populate
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
      
      // Create a mock for the Task instance
      const mockTaskInstance = {
        _id: TASK_ID_1,
        title: taskData.title,
        description: taskData.description,
        status: 'pending',
        priority: taskData.priority,
        createdBy: USER_ID,
        flock: FAMILY_ID,
        assignees: [USER_ID],
        save: vi.fn().mockResolvedValue(undefined)
      };
      
      // Set up Task constructor to return our mock instance
      (Task as any).mockImplementation(() => mockTaskInstance);
      
      // Act
      // @ts-ignore
      await createTask(mockReq, mockRes, mockNext);
      
      // Assert
      // Verify Task constructor was called
      expect(Task).toHaveBeenCalledWith({
        title: taskData.title,
        description: taskData.description,
        dueDate: expect.any(Date),
        priority: taskData.priority,
        createdBy: TEST_USER_ID,
        flock: FAMILY_ID,
        assignees: [TEST_USER_ID],
        category: undefined
      });
      
      // Verify save was called
      expect(mockTaskInstance.save).toHaveBeenCalled();
      
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
      mockReq.user = undefined; // User not authenticated

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
          createdBy: { _id: USER_ID, firstName: 'Test', lastName: 'User' },
          flock: FAMILY_ID,
          assignees: [{ _id: USER_ID, firstName: 'Test', lastName: 'User' }]
        },
        {
          _id: TASK_ID_2,
          title: 'Task 2',
          description: 'Description 2',
          status: 'completed',
          priority: 'medium',
          createdBy: { _id: USER_ID, firstName: 'Test', lastName: 'User' },
          flock: FAMILY_ID,
          assignees: [{ _id: USER_ID, firstName: 'Test', lastName: 'User' }]
        }
      ];

      // Mock the chain of method calls
      const mockSort = vi.fn().mockResolvedValue(mockTasks);
      const mockPopulate3 = vi.fn().mockReturnValue({ sort: mockSort });
      const mockPopulate2 = vi.fn().mockReturnValue({ populate: mockPopulate3 });
      const mockPopulate1 = vi.fn().mockReturnValue({ populate: mockPopulate2 });
      (Task.find as any).mockReturnValue({ populate: mockPopulate1 });

      // Act
      await getTasks(
        mockReq as AuthRequest,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(Task.find).toHaveBeenCalled();
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
      const mockUserId = TEST_USER_ID; // Use a consistent user ID
      const mockFlockId = '60f1f77bcf86cd79943901a'; // Also use a valid ObjectId string for consistency

      // Define minimal mockTask for access check
      const minimalMockTask = {
        _id: TASK_ID_1,
        // Ensure flock and its _id structure is present and correct
        flock: { _id: { toString: () => mockFlockId } }
      };

      mockReq.params = { taskId: TASK_ID_1 };
      mockReq.user = { userId: mockUserId } as any; // Ensure user is set

      // Mock Task.findById -> populate -> populate -> populate -> exec()
      const mockTaskExec = vi.fn().mockResolvedValueOnce(minimalMockTask);
      vi.mocked(Task.findById).mockReturnValueOnce({
        // Use mockReturnThis for populate to allow chaining
        populate: vi.fn().mockReturnThis(),
        // Ensure the final exec method resolves
        exec: mockTaskExec
      } as any);

      // Mock Flock.find().select()
      const mockFlockSelect = vi.fn().mockResolvedValueOnce([
        { _id: { toString: () => mockFlockId } } // Array with object having _id with toString
      ]);
      vi.mocked(Flock.find).mockReturnValueOnce({
        select: mockFlockSelect // Use the separate mock function
      } as any);

      // Act
      await getTaskById(
        mockReq as AuthRequest<{ taskId: string }>,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(Task.findById).toHaveBeenCalledWith(TASK_ID_1);
      expect(mockTaskExec).toHaveBeenCalled(); // Check if exec was called
      expect(Flock.find).toHaveBeenCalled(); // Check Flock.find was called
      expect(mockFlockSelect).toHaveBeenCalledWith('_id'); // Check if select was called with '_id'
      expect(mockStatus).toHaveBeenCalledWith(200);
      // Adjust assertion to match the structure returned by the controller
      // Note: The actual response might differ now as we simplified the mockTask
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Task retrieved successfully',
        task: minimalMockTask // Expecting the simplified task now
      });
      // Check if Flock.find was called correctly
      expect(Flock.find).toHaveBeenCalledWith({
        $or: [
          { members: new mongoose.Types.ObjectId(mockUserId) }, // Use mockUserId
          { createdBy: new mongoose.Types.ObjectId(mockUserId) }, // Use mockUserId
        ],
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
        title: 'Updated Task',
        description: 'Updated Description'
      };
      
      mockReq.body = updateData;
      mockReq.params = { taskId: TASK_ID_1 };
      
      const originalTask: any = {
        _id: TASK_ID_1,
        title: 'Original Task',
        description: 'Original Description',
        status: 'pending',
        createdBy: new mongoose.Types.ObjectId(TEST_USER_ID), // <-- Revert to ObjectId
        assignees: [new mongoose.Types.ObjectId(TEST_USER_ID)], // <-- Revert to ObjectId
        // Mock the save method
        save: vi.fn().mockResolvedValue(undefined)
      };

      const updatedTask = {
        ...originalTask,
        title: updateData.title,
        description: updateData.description
      };

      // Mock first findById to get the original task
      (Task.findById as any).mockResolvedValueOnce(originalTask);
      
      // Mock second findById and populate chain for getting the updated task
      const mockPopulate3 = vi.fn().mockResolvedValue(updatedTask);
      const mockPopulate2 = vi.fn().mockReturnValue({ populate: mockPopulate3 });
      const mockPopulate1 = vi.fn().mockReturnValue({ populate: mockPopulate2 });
      (Task.findById as any).mockReturnValueOnce({ populate: mockPopulate1 });

      // Act
      await updateTask(
        mockReq as AuthRequest<{ taskId: string }>,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(originalTask.save).toHaveBeenCalled();
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

      // Mock a task that the user created - revert createdBy
      const mockTaskToDelete = {
        _id: TASK_ID_1,
        title: 'Task to Delete',
        createdBy: new mongoose.Types.ObjectId(TEST_USER_ID), // <-- Revert to ObjectId
      };

      // Mock Task.findById to return the task for ownership check
      vi.mocked(Task.findById).mockResolvedValueOnce(mockTaskToDelete as any);
      // Mock Task.findByIdAndDelete to simulate deletion
      vi.mocked(Task.findByIdAndDelete).mockResolvedValueOnce(mockTaskToDelete as any);

      // Act
      await deleteTask(mockReq as AuthRequest<{ taskId: string }>, mockRes, mockNext);

      // Assert
      expect(Task.findById).toHaveBeenCalledWith(TASK_ID_1); // Check findById was called for ownership
      expect(Task.findByIdAndDelete).toHaveBeenCalledWith(TASK_ID_1);
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