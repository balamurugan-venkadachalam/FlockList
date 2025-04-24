import mongoose from 'mongoose';

export async function connectDB(uri: string, options = {}) {
  try {
    await mongoose.connect(uri, options);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
}