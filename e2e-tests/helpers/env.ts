import dotenv from 'dotenv';
import path from 'path';
import { LoginCredentials } from '../types';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Fallback values if environment variables are not set
const DEFAULT_CREDENTIALS = {
  testUser: {
    email: 'test@example.com',
    password: 'Password123!'
  },
  adminUser: {
    email: 'admin@example.com',
    password: 'AdminPass123!'
  },
  memberUser: {
    email: 'member@example.com',
    password: 'MemberPass123!'
  }
};

/**
 * Get test user credentials from environment variables or fallback to defaults
 */
export function getTestUserCredentials(): LoginCredentials {
  return {
    email: process.env.TEST_USER_EMAIL || DEFAULT_CREDENTIALS.testUser.email,
    password: process.env.TEST_USER_PASSWORD || DEFAULT_CREDENTIALS.testUser.password
  };
}

/**
 * Get admin user credentials from environment variables or fallback to defaults
 */
export function getAdminUserCredentials(): LoginCredentials {
  return {
    email: process.env.ADMIN_USER_EMAIL || DEFAULT_CREDENTIALS.adminUser.email,
    password: process.env.ADMIN_USER_PASSWORD || DEFAULT_CREDENTIALS.adminUser.password
  };
}

/**
 * Get member user credentials from environment variables or fallback to defaults
 */
export function getMemberUserCredentials(): LoginCredentials {
  return {
    email: process.env.MEMBER_USER_EMAIL || DEFAULT_CREDENTIALS.memberUser.email,
    password: process.env.MEMBER_USER_PASSWORD || DEFAULT_CREDENTIALS.memberUser.password
  };
}

/**
 * Get API base URL from environment variables or fallback to default
 */
export function getApiBaseUrl(): string {
  return process.env.API_BASE_URL || 'http://localhost:3001';
}

/**
 * Get frontend URL from environment variables or fallback to default
 */
export function getFrontendUrl(): string {
  return process.env.FRONTEND_URL || 'http://localhost:5173';
}
