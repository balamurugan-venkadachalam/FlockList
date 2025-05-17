import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.test file
dotenv.config({ path: path.resolve(__dirname, '../../../.env.test') });

// Interface for test user credentials
interface UserCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'member';
}

/**
 * Get admin user credentials from environment variables
 */
export function getAdminUserCredentials(): UserCredentials {
  return {
    email: process.env.ADMIN_USER_EMAIL || 'admin@example.com',
    password: process.env.ADMIN_USER_PASSWORD || 'AdminPass123!',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin'
  };
}

/**
 * Get member user credentials from environment variables
 */
export function getMemberUserCredentials(): UserCredentials {
  return {
    email: process.env.MEMBER_USER_EMAIL || 'member@example.com',
    password: process.env.MEMBER_USER_PASSWORD || 'MemberPass123!',
    firstName: 'Member',
    lastName: 'User',
    role: 'member'
  };
}

/**
 * Get test user credentials from environment variables
 */
export function getTestUserCredentials(): UserCredentials {
  return {
    email: process.env.TEST_USER_EMAIL || 'test@example.com',
    password: process.env.TEST_USER_PASSWORD || 'Password123!',
    firstName: 'Test',
    lastName: 'User',
    role: 'member'
  };
}
