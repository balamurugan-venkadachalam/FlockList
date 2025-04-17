import { beforeAll, beforeEach, afterAll } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Global variable to hold MongoDB instance
let mongo: MongoMemoryServer;

// Setup before all tests
beforeAll(async () => {
  // Create MongoDB Memory Server instance
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  
  // Set environment variable for tests
  process.env.MONGODB_URI_TEST = uri;
  
  // Connect to in-memory database
  await mongoose.connect(uri);
});

// Reset database between tests
beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  
  // Clean all collections to ensure test isolation
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

// Cleanup after all tests
afterAll(async () => {
  // Disconnect mongoose and stop MongoDB Memory Server
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  if (mongo) {
    await mongo.stop();
  }
}); 