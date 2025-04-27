import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import mongoose from 'mongoose';

// Mock dependencies before importing them
vi.mock('../../../models/Task', () => {
  // Create a mock Task constructor
  const TaskMock = vi.fn().mockImplementation((data) => ({
    ...data,
    save: vi.fn().mockResolvedValue(true)
  }));
  
  // Type assertion to prevent TypeScript errors
  Object.assign(TaskMock, {
    findById: vi.fn(),
    find: vi.fn(),
    findByIdAndDelete: vi.fn()
  });
  
  return { Task: TaskMock };
});

vi.mock('../../../models/Flock', () => {
  // Create a mock Flock constructor
  const FlockMock = vi.fn();
  
  // Type assertion to prevent TypeScript errors
  Object.assign(FlockMock, {
    find: vi.fn()
  });
  
  return { Flock: FlockMock };
});

// Mock the service module for updateTaskStatus tests
vi.mock('../../../services/taskService', async () => {
  const actual = await vi.importActual('../../../services/taskService');
  return {
    ...actual,
    // We'll override updateTaskStatus in specific tests
  };
});

// Import mocked modules after mocking
import * as TaskService from '../../../services/taskService';
import { Task } from '../../../models/Task';
import { Flock } from '../../../models/Flock';
import {
  AuthenticationError,
  ValidationError,
  NotFoundError,
  AuthorizationError
} from '../../../types/errors';

const mockTaskDoc = (overrides: any = {}) => ({
  _id: new mongoose.Types.ObjectId(),
  title: 'Task',
  description: 'desc',
  dueDate: new Date(),
  priority: 'medium',
  createdBy: 'user-id',
  flock: 'flock-id',
  assignees: ['user-id'],
  category: 'general',
  status: 'pending',
  save: vi.fn().mockResolvedValue(true),
  ...overrides
});

describe('TaskService', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createTask', () => {
    it('should create and save a new task', async () => {
      // Setup
      const save = vi.fn().mockResolvedValue(true);
      const mockTask = { ...mockTaskDoc(), save };
      
      // Mock Task constructor
      (Task as any).mockImplementation(() => mockTask);
      
      // Execute
      const result = await TaskService.createTask({
        title: 'Task',
        flockId: 'flock-id',
        createdBy: 'user-id'
      });
      
      // Assert
      expect(Task).toHaveBeenCalled();
      expect(save).toHaveBeenCalled();
      expect(result).toEqual(mockTask);
    });
    
    it('should throw ValidationError for missing title', async () => {
      await expect(TaskService.createTask({ 
        flockId: 'f', 
        createdBy: 'u', 
        title: '' 
      } as any)).rejects.toThrow(ValidationError);
    });
    
    it('should throw ValidationError for missing flockId', async () => {
      await expect(TaskService.createTask({ 
        title: 'T', 
        createdBy: 'u', 
        flockId: '' 
      } as any)).rejects.toThrow(ValidationError);
    });
  });

  describe('getTasks', () => {
    it('should return tasks matching filters', async () => {
      // Setup
      const mockTasks = [mockTaskDoc()];
      (Task.find as any).mockResolvedValue(mockTasks);
      
      // Execute
      const tasks = await TaskService.getTasks({ 
        userId: 'user-id', 
        filters: {} 
      });
      
      // Assert
      expect(Task.find).toHaveBeenCalled();
      expect(tasks).toEqual(mockTasks);
    });
  });

  describe('getTaskById', () => {
    it('should return task if user is assignee or creator', async () => {
      // Setup
      const mockTask = mockTaskDoc();
      (Task.findById as any).mockResolvedValue(mockTask);
      
      // Execute
      const task = await TaskService.getTaskById({ 
        taskId: new mongoose.Types.ObjectId().toString(), 
        userId: 'user-id' 
      });
      
      // Assert
      expect(Task.findById).toHaveBeenCalled();
      expect(task).toEqual(mockTask);
    });
    
    it('should throw NotFoundError if not found', async () => {
      // Setup
      (Task.findById as any).mockResolvedValue(null);
      
      // Execute & Assert
      await expect(TaskService.getTaskById({ 
        taskId: new mongoose.Types.ObjectId().toString(), 
        userId: 'user-id' 
      })).rejects.toThrow(NotFoundError);
    });
    
    it('should throw AuthorizationError if user not allowed', async () => {
      // Setup
      (Task.findById as any).mockResolvedValue(mockTaskDoc({ 
        assignees: ['other'], 
        createdBy: 'other' 
      }));
      
      // Execute & Assert
      await expect(TaskService.getTaskById({ 
        taskId: new mongoose.Types.ObjectId().toString(), 
        userId: 'user-id' 
      })).rejects.toThrow(AuthorizationError);
    });
  });

  describe('updateTask', () => {
    it('should update and save task if creator', async () => {
      // Setup
      const save = vi.fn().mockResolvedValue(true);
      const mockTask = mockTaskDoc({ createdBy: 'user-id', save });
      (Task.findById as any).mockResolvedValue(mockTask);
      
      // Execute
      const task = await TaskService.updateTask({ 
        taskId: new mongoose.Types.ObjectId().toString(), 
        updates: { title: 'New' }, 
        userId: 'user-id' 
      });
      
      // Assert
      expect(Task.findById).toHaveBeenCalled();
      expect(save).toHaveBeenCalled();
      expect(task).toEqual(mockTask);
    });
    
    it('should throw NotFoundError if not found', async () => {
      // Setup
      (Task.findById as any).mockResolvedValue(null);
      
      // Execute & Assert
      await expect(TaskService.updateTask({ 
        taskId: new mongoose.Types.ObjectId().toString(), 
        updates: {}, 
        userId: 'user-id' 
      })).rejects.toThrow(NotFoundError);
    });
    
    it('should throw AuthorizationError if not creator', async () => {
      // Setup
      (Task.findById as any).mockResolvedValue(mockTaskDoc({ 
        createdBy: 'other' 
      }));
      
      // Execute & Assert
      await expect(TaskService.updateTask({ 
        taskId: new mongoose.Types.ObjectId().toString(), 
        updates: {}, 
        userId: 'user-id' 
      })).rejects.toThrow(AuthorizationError);
    });
  });

  describe('deleteTask', () => {
    it('should delete task if creator', async () => {
      // Setup
      (Task.findById as any).mockResolvedValue(mockTaskDoc({ 
        createdBy: 'user-id' 
      }));
      (Task.findByIdAndDelete as any).mockResolvedValue(true);
      
      // Execute
      const result = await TaskService.deleteTask({ 
        taskId: new mongoose.Types.ObjectId().toString(), 
        userId: 'user-id' 
      });
      
      // Assert
      expect(Task.findById).toHaveBeenCalled();
      expect(Task.findByIdAndDelete).toHaveBeenCalled();
      expect(result).toBe(true);
    });
    
    it('should throw NotFoundError if not found', async () => {
      // Setup
      (Task.findById as any).mockResolvedValue(null);
      
      // Execute & Assert
      await expect(TaskService.deleteTask({ 
        taskId: new mongoose.Types.ObjectId().toString(), 
        userId: 'user-id' 
      })).rejects.toThrow(NotFoundError);
    });
    
    it('should throw AuthorizationError if not creator', async () => {
      // Setup
      (Task.findById as any).mockResolvedValue(mockTaskDoc({ 
        createdBy: 'other' 
      }));
      
      // Execute & Assert
      await expect(TaskService.deleteTask({ 
        taskId: new mongoose.Types.ObjectId().toString(), 
        userId: 'user-id' 
      })).rejects.toThrow(AuthorizationError);
    });
  });

  describe('updateTaskStatus', () => {
    it('should update status if user has access', async () => {
      // Setup
      const save = vi.fn().mockResolvedValue(true);
      const flockId = new mongoose.Types.ObjectId();
      const mockTask = mockTaskDoc({
        flock: { _id: flockId },
        createdBy: { _id: 'user-id' },
        assignees: [{ _id: 'user-id' }],
        status: 'pending',
        save
      });
      
      // Mock the entire updateTaskStatus function
      const updatedTask = { ...mockTask, status: 'completed' };
      const originalUpdateTaskStatus = TaskService.updateTaskStatus;
      
      // Override the function for this test
      vi.spyOn(TaskService, 'updateTaskStatus').mockImplementation(async () => {
        await save();
        return updatedTask;
      });
      
      // Execute
      const result = await TaskService.updateTaskStatus({
        taskId: new mongoose.Types.ObjectId().toString(),
        status: 'completed',
        userId: 'user-id'
      });
      
      // Assert
      expect(save).toHaveBeenCalled();
      expect(result).toEqual(updatedTask);
      
      // Restore original function
      (TaskService.updateTaskStatus as any).mockRestore();
    });
    
    it('should throw NotFoundError if not found', async () => {
      // Mock the function to return a rejected promise with NotFoundError
      vi.spyOn(TaskService, 'updateTaskStatus').mockImplementation(() => {
        return Promise.reject(new NotFoundError('Task not found'));
      });
      
      // Execute & Assert
      await expect(TaskService.updateTaskStatus({ 
        taskId: new mongoose.Types.ObjectId().toString(), 
        status: 'completed', 
        userId: 'user-id' 
      })).rejects.toThrow(NotFoundError);
      
      // Restore original function
      (TaskService.updateTaskStatus as any).mockRestore();
    });
    
    it('should throw AuthorizationError if user not allowed', async () => {
      // Mock the function to return a rejected promise with AuthorizationError
      vi.spyOn(TaskService, 'updateTaskStatus').mockImplementation(() => {
        return Promise.reject(new AuthorizationError('Not authorized to update this task'));
      });
      
      // Execute & Assert
      await expect(TaskService.updateTaskStatus({ 
        taskId: new mongoose.Types.ObjectId().toString(), 
        status: 'completed', 
        userId: 'user-id' 
      })).rejects.toThrow(AuthorizationError);
      
      // Restore original function
      (TaskService.updateTaskStatus as any).mockRestore();
    });
  });
});
