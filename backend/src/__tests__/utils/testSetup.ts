import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// Global variable to hold MongoDB instance
let mongoServer: MongoMemoryServer;

/**
 * Initialize the MongoDB Memory Server before tests
 */
export const setupTestMongoDB = async (): Promise<string> => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Set environment variable so app.ts uses this connection string
  process.env.MONGODB_URI = mongoUri;
  
  // Connect to the in-memory database
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
    console.log('Connected to in-memory MongoDB');
  }
  
  return mongoUri;
};

/**
 * Clear all collections in the database
 */
export const clearDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
};

/**
 * Close MongoDB connection and stop server
 */
export const closeDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  if (mongoServer) {
    await mongoServer.stop();
    console.log('In-memory MongoDB server stopped');
  }
}; 