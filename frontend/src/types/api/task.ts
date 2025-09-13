import { Task } from '../models/task';

/**
 * Task list API response
 */
export interface TaskListResponse {
  tasks: Task[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
