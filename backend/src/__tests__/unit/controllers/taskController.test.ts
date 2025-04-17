import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus
} from '../../../controllers/taskController';
import { AuthenticationError, NotFoundError, ValidationError } from '../../../types/errors';
import { AuthRequest } from '../../../types/auth';

// Define constants for testing
const USER_ID = '507f1f77bcf86cd799439011';
const FAMILY_ID = '507f1f77bcf86cd799439099';
const TASK_ID_1 = '507f1f77bcf86cd799439012';
const TASK_ID_2 = '507f1f77bcf86cd799439013';

// Define interfaces for test data
interface CreateTaskBody {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: string;
  assignees?: string[];
  category?: string;
  familyId: string;
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
      IN_PROGRESS: 'in-progress',
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

// Import Task after mocking it
import { Task } from '../../../models/Task';

describe('Task Controller', () => {
  // Set up mocks for request, response, and next function
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let mockJson: ReturnType<typeof vi.fn>;
  let mockStatus: ReturnType<typeof vi.fn>;
  
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Set up mocks for response
    mockJson = vi.fn();
    mockStatus = vi.fn().mockReturnThis();
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
        userId: USER_ID,
        role: 'parent'
      }
    };
    
    // Set up mock for next function
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
        familyId: FAMILY_ID
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
        family: FAMILY_ID,
        assignees: [USER_ID],
        save: vi.fn().mockResolvedValue(undefined)
      };
      
      // Set up Task constructor to return our mock instance
      (Task as any).mockImplementation(() => mockTaskInstance);
      
      // Act
      await createTask(
        mockReq as AuthRequest,
        mockRes as Response,
        mockNext
      );
      
      // Assert
      // Verify Task constructor was called
      expect(Task).toHaveBeenCalledWith({
        title: taskData.title,
        description: taskData.description,
        dueDate: expect.any(Date),
        priority: taskData.priority,
        createdBy: USER_ID,
        family: FAMILY_ID,
        assignees: [USER_ID],
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
        familyId: '' // Missing family ID
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
        familyId: FAMILY_ID
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
          family: FAMILY_ID,
          assignees: [{ _id: USER_ID, firstName: 'Test', lastName: 'User' }]
        },
        {
          _id: TASK_ID_2,
          title: 'Task 2',
          description: 'Description 2',
          status: 'completed',
          priority: 'medium',
          createdBy: { _id: USER_ID, firstName: 'Test', lastName: 'User' },
          family: FAMILY_ID,
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
      const mockTask = {
        _id: TASK_ID_1,
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
        priority: 'high',
        createdBy: { _id: USER_ID, toString: () => USER_ID },
        assignees: [{ _id: USER_ID, toString: () => USER_ID }]
      };

      mockReq.params = { id: TASK_ID_1 };
      
      // Mock findById and populate chain
      const mockPopulate3 = vi.fn().mockResolvedValue(mockTask);
      const mockPopulate2 = vi.fn().mockReturnValue({ populate: mockPopulate3 });
      const mockPopulate1 = vi.fn().mockReturnValue({ populate: mockPopulate2 });
      (Task.findById as any).mockReturnValue({ populate: mockPopulate1 });

      // Act
      await getTaskById(
        mockReq as AuthRequest<{ id: string }>,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(Task.findById).toHaveBeenCalledWith(TASK_ID_1);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Task retrieved successfully',
        task: mockTask
      });
    });

    it('should return 404 if task not found', async () => {
      // Arrange
      mockReq.params = { id: TASK_ID_1 };
      
      // Mock findById to return null
      const mockPopulate3 = vi.fn().mockResolvedValue(null);
      const mockPopulate2 = vi.fn().mockReturnValue({ populate: mockPopulate3 });
      const mockPopulate1 = vi.fn().mockReturnValue({ populate: mockPopulate2 });
      (Task.findById as any).mockReturnValue({ populate: mockPopulate1 });

      // Act
      await getTaskById(
        mockReq as AuthRequest<{ id: string }>,
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
      mockReq.params = { id: TASK_ID_1 };
      
      const originalTask = {
        _id: TASK_ID_1,
        title: 'Original Task',
        description: 'Original Description',
        status: 'pending',
        createdBy: { toString: () => USER_ID },
        assignees: [{ toString: () => USER_ID }],
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
        mockReq as AuthRequest<{ id: string }>,
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
      mockReq.params = { id: TASK_ID_1 };

      // Mock a task that the user created
      const task = {
        _id: TASK_ID_1,
        createdBy: { toString: () => USER_ID }
      };

      // Mock finding the task
      (Task.findById as any).mockResolvedValueOnce(task);
      
      // Mock successful deletion
      (Task.findByIdAndDelete as any).mockResolvedValueOnce(task);

      // Act
      await deleteTask(
        mockReq as AuthRequest<{ id: string }>,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(Task.findByIdAndDelete).toHaveBeenCalledWith(TASK_ID_1);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Task deleted successfully'
      });
    });
  });

  describe('updateTaskStatus', () => {
    it('should update task status successfully', async () => {
      // Arrange
      mockReq.params = { id: TASK_ID_1 };
      mockReq.body = { status: 'completed' };
      
      const originalTask = {
        _id: TASK_ID_1,
        status: 'pending',
        createdBy: { toString: () => USER_ID },
        assignees: [{ toString: () => USER_ID }],
        save: vi.fn().mockResolvedValue(undefined)
      };

      const updatedTask = {
        ...originalTask,
        status: 'completed',
        completedBy: new mongoose.Types.ObjectId(USER_ID),
        completedAt: expect.any(Date)
      };

      // Mock first findById to get the original task
      (Task.findById as any).mockResolvedValueOnce(originalTask);
      
      // Mock second findById and populate chain for getting the updated task
      const mockPopulate3 = vi.fn().mockResolvedValue(updatedTask);
      const mockPopulate2 = vi.fn().mockReturnValue({ populate: mockPopulate3 });
      const mockPopulate1 = vi.fn().mockReturnValue({ populate: mockPopulate2 });
      (Task.findById as any).mockReturnValueOnce({ populate: mockPopulate1 });

      // Act
      await updateTaskStatus(
        mockReq as AuthRequest<{ id: string }>,
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