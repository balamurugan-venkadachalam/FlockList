/**
 * Task type definitions for the application
 */

// Task status types
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

// Task priority types
export type TaskPriority = 'low' | 'medium' | 'high';

// Task category types
export type TaskCategory = 'chore' | 'homework' | 'activity' | 'other';

// Labels for UI display
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  'pending': 'Pending',
  'in_progress': 'In Progress',
  'completed': 'Completed',
  'cancelled': 'Cancelled'
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  'low': 'Low',
  'medium': 'Medium',
  'high': 'High'
};

export const TASK_CATEGORY_LABELS: Record<TaskCategory, string> = {
  'chore': 'Chore',
  'homework': 'Homework',
  'activity': 'Activity',
  'other': 'Other'
};

// Task assignment interface
export interface TaskAssignment {
  userId: string;
  assignedAt: Date;
}

// Interface for task filtering options
export interface TaskFilterOptions {
  status?: TaskStatus | TaskStatus[];
  priority?: TaskPriority | TaskPriority[];
  category?: TaskCategory | TaskCategory[];
  assigneeId?: string;
  dueDate?: Date;
  searchTerm?: string;
} 