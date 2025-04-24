// testFactory.ts
// Utility functions for generating test data for integration/unit tests
import { Types } from 'mongoose';
import { User } from '../../models/User';
import { Flock } from '../../models/Flock';
import { Task } from '../../models/Task';

export function createTestUser(overrides: Partial<Parameters<typeof User.create>[0]> = {}) {
  return {
    email: `user${Math.floor(Math.random()*10000)}@example.com`,
    password: 'TestPassword123!',
    isEmailVerified: true,
    ...overrides
  };
}

export function createTestFlock(overrides: Partial<Parameters<typeof Flock.create>[0]> = {}) {
  return {
    name: `Flock${Math.floor(Math.random()*10000)}`,
    members: [],
    ...overrides
  };
}

export function createTestTask(overrides: Partial<Parameters<typeof Task.create>[0]> = {}) {
  return {
    title: `Task${Math.floor(Math.random()*10000)}`,
    description: 'Sample task description',
    status: 'pending',
    dueDate: new Date(),
    ...overrides
  };
}
