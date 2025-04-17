import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmaster';

// Create and export the main database connection
export const dbConnection = mongoose.createConnection(MONGODB_URI);

export const connectDB = async (): Promise<void> => {
  try {
    // Wait for the connection to be established
    await dbConnection.asPromise();
    console.log(`MongoDB Connected: ${dbConnection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Handle connection events
dbConnection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

dbConnection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Handle process termination
process.on('SIGINT', async () => {
  try {
    await dbConnection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error during MongoDB connection closure:', err);
    process.exit(1);
  }
}); 