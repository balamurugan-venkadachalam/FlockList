/**
 * Type definitions for e2e tests
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface TaskData {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  category?: 'chore' | 'homework' | 'activity' | 'other';
  dueDate?: Date;
  assignees?: string[];
}

export interface FlockData {
  name: string;
  description?: string;
}

export interface UserData {
  name: string;
  email: string;
  password: string;
}
