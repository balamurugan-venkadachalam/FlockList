import api from './api';
import type { 
  TaskCreationPayload, 
  TaskUpdatePayload, 
  TaskStatusType, 
  TaskFilterOptions, 
  TaskResponse, 
  TaskListResponse 
} from '../types/models/task';

// Re-export all task types for components to use
export type { 
  Task, 
  TaskDetail, 
  TaskCreationPayload, 
  TaskUpdatePayload, 
  TaskStatusType, 
  TaskFilterOptions, 
  TaskResponse, 
  TaskListResponse 
} from '../types/models/task';

/**
 * API service for task management
 */

// Using centralized model definitions from types/models/task

/**
 * Create a new task
 * @param data task creation data
 * @returns Promise with the created task
 */
export const createTask = async (data: TaskCreationPayload): Promise<TaskResponse> => {
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
export const getTasks = async (params?: TaskFilterOptions): Promise<TaskListResponse> => {
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
export const updateTask = async (id: string, data: TaskUpdatePayload): Promise<TaskResponse> => {
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
export const updateTaskStatus = async (id: string, status: TaskStatusType): Promise<TaskResponse> => {
  try {
    const response = await api.patch(`/api/tasks/${id}/status`, { status });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || 'Failed to update task status';
  }
}; 