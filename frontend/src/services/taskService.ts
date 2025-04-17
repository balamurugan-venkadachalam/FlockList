import api from './api';
import { TaskPriority, TaskStatus, TaskCategory } from '../types/task';

/**
 * API service for task management
 */

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  family: string;
  assignees: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  category: TaskCategory;
  completedAt?: string;
  completedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: TaskPriority;
  assignees?: string[];
  category?: TaskCategory;
  familyId: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: TaskPriority;
  assignees?: string[];
  category?: TaskCategory;
  status?: TaskStatus;
}

export interface TaskResponse {
  message: string;
  task: Task;
}

export interface TasksResponse {
  message: string;
  tasks: Task[];
}

export interface TaskQueryParams {
  status?: TaskStatus | TaskStatus[];
  priority?: TaskPriority | TaskPriority[];
  category?: TaskCategory | TaskCategory[];
  assignee?: string;
  familyId?: string;
  dueDate?: string;
  dueBefore?: string;
  dueAfter?: string;
}

/**
 * Create a new task
 * @param data task creation data
 * @returns Promise with the created task
 */
export const createTask = async (data: CreateTaskRequest): Promise<TaskResponse> => {
  try {
    const response = await api.post('/api/tasks', data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || 'Failed to create task';
  }
};

/**
 * Get all tasks with optional filtering
 * @param params query parameters for filtering
 * @returns Promise with tasks
 */
export const getTasks = async (params?: TaskQueryParams): Promise<TasksResponse> => {
  try {
    const response = await api.get('/api/tasks', { params });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || 'Failed to get tasks';
  }
};

/**
 * Get a task by ID
 * @param id task ID
 * @returns Promise with the task details
 */
export const getTaskById = async (id: string): Promise<TaskResponse> => {
  try {
    const response = await api.get(`/api/tasks/${id}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || 'Failed to get task details';
  }
};

/**
 * Update a task
 * @param id task ID
 * @param data update data
 * @returns Promise with the updated task
 */
export const updateTask = async (id: string, data: UpdateTaskRequest): Promise<TaskResponse> => {
  try {
    const response = await api.put(`/api/tasks/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || 'Failed to update task';
  }
};

/**
 * Delete a task
 * @param id task ID
 * @returns Promise with success message
 */
export const deleteTask = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await api.delete(`/api/tasks/${id}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || 'Failed to delete task';
  }
};

/**
 * Update a task's status
 * @param id task ID
 * @param status new status
 * @returns Promise with the updated task
 */
export const updateTaskStatus = async (id: string, status: TaskStatus): Promise<TaskResponse> => {
  try {
    const response = await api.patch(`/api/tasks/${id}/status`, { status });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || 'Failed to update task status';
  }
}; 