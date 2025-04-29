/**
 * Task model definitions with TypeScript utility types
 */
import { BaseUser, UserRoleType } from './user';

// Task status enum as const object with type assertion
export const TaskStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

export type TaskStatusType = typeof TaskStatus[keyof typeof TaskStatus];

// Task priority enum as const object with type assertion
export const TaskPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
} as const;

export type TaskPriorityType = typeof TaskPriority[keyof typeof TaskPriority];

// Task category enum as const object with type assertion
export const TaskCategory = {
  CHORE: 'chore',
  HOMEWORK: 'homework',
  ACTIVITY: 'activity',
  OTHER: 'other'
} as const;

export type TaskCategoryType = typeof TaskCategory[keyof typeof TaskCategory];

// UI display labels using Record utility type
export const TASK_STATUS_LABELS: Record<TaskStatusType, string> = {
  [TaskStatus.PENDING]: 'Pending',
  [TaskStatus.IN_PROGRESS]: 'In Progress',
  [TaskStatus.COMPLETED]: 'Completed',
  [TaskStatus.CANCELLED]: 'Cancelled'
};

export const TASK_PRIORITY_LABELS: Record<TaskPriorityType, string> = {
  [TaskPriority.LOW]: 'Low',
  [TaskPriority.MEDIUM]: 'Medium',
  [TaskPriority.HIGH]: 'High'
};

export const TASK_CATEGORY_LABELS: Record<TaskCategoryType, string> = {
  [TaskCategory.CHORE]: 'Chore',
  [TaskCategory.HOMEWORK]: 'Homework',
  [TaskCategory.ACTIVITY]: 'Activity',
  [TaskCategory.OTHER]: 'Other'
};

// Base task interface
export interface BaseTask {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatusType;
  priority: TaskPriorityType;
  category: TaskCategoryType;
  dueDate?: string | Date;
  createdAt: string;
  updatedAt: string;
}

// Task with flock and user information
export interface Task extends BaseTask {
  flock: {
    _id: string;
    name: string;
  };
  assignees: string[];
  createdBy: string | BaseUser;
}

// Task creation payload
export type TaskCreationPayload = Omit<BaseTask, '_id' | 'createdAt' | 'updatedAt' | 'status'> & {
  flockId: string;
  assignees?: string[];
};

// Task update payload
export type TaskUpdatePayload = Partial<Omit<BaseTask, '_id' | 'createdAt' | 'updatedAt'>> & {
  assignees?: string[];
};

// User info interface for task assignees and creators
export interface TaskUserInfo {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

// Detailed task interface with expanded user information
export interface TaskDetail extends Omit<Task, 'assignees' | 'createdBy' | 'completedBy'> {
  assignees: Array<string | TaskUserInfo>;
  createdBy: TaskUserInfo;
  completedBy?: TaskUserInfo;
  flock: {
    _id: string;
    name: string;
    members: Array<{
      _id: string;
      name: string;
    }>;
  };
}

// Task API response
export interface TaskResponse {
  task: TaskDetail;
  message?: string;
}

// Task list API response
export interface TaskListResponse {
  tasks: Task[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// Task filter options
export interface TaskFilterOptions {
  status?: TaskStatusType | TaskStatusType[];
  priority?: TaskPriorityType | TaskPriorityType[];
  category?: TaskCategoryType | TaskCategoryType[];
  assigneeId?: string;
  dueDate?: Date;
  searchTerm?: string;
  flockId?: string;
}
