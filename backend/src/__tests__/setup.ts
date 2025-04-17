import mongoose from 'mongoose';
import { beforeAll, afterAll } from 'vitest';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock environment variables for testing
process.env.JWT_ACCESS_SECRET = 'test-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.MONGODB_URI = 'mongodb://localhost:27017/taskmaster-test';

// Increase timeout for all hooks
const TIMEOUT = 30000;

beforeAll(async () => {
  // Close any existing connections
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  // Connect to test database
  await mongoose.createConnection(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmaster_test');
}, TIMEOUT);

afterAll(async () => {
  // Clean up and close connection
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
}, TIMEOUT); 