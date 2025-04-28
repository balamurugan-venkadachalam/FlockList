import { Request } from 'express';
import { ITask } from '../models/Task';

export interface TaskQueryParams {
  status?: 'todo' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  sortBy?: keyof ITask;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface TaskRequestBody {
  title: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
}

export interface TaskUpdateBody extends Partial<TaskRequestBody> {}

// Update to match the global Express.Request interface extension
export type TaskRequest = Request;

export type TaskCreateRequest = TaskRequest & { body: TaskRequestBody };
export type TaskUpdateRequest = TaskRequest & { body: TaskUpdateBody };
export type TaskQueryRequest = TaskRequest & { query: TaskQueryParams }; 