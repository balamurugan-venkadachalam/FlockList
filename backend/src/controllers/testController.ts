import { Request, Response } from 'express';
import { User } from '../models/User';
import { Flock } from '../models/Flock';
import { Task } from '../models/Task';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

// Store for tracking rate limit status in test environment
const rateLimitStore: { [key: string]: number } = {};

/**
 * Create test users for e2e testing
 */
export const createTestUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    // Create test user if it doesn't exist
    const testUserExists = await User.findOne({ email: 'test@example.com' });
    if (!testUserExists) {
      await User.create({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'Password123!',
        role: 'member',
        isEmailVerified: true
      });
    }

    // Create admin user if it doesn't exist
    const adminUserExists = await User.findOne({ email: 'admin@example.com' });
    if (!adminUserExists) {
      await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'AdminPass123!',
        role: 'admin',
        isEmailVerified: true
      });
    }

    // Create member user if it doesn't exist
    const memberUserExists = await User.findOne({ email: 'member@example.com' });
    if (!memberUserExists) {
      await User.create({
        firstName: 'Member',
        lastName: 'User',
        email: 'member@example.com',
        password: 'MemberPass123!',
        role: 'member',
        isEmailVerified: true
      });
    }

    res.status(200).json({ message: 'Test data setup complete' });
  } catch (error) {
    console.error('Error setting up test data:', error);
    res.status(500).json({ message: 'Error setting up test data' });
  }
};

/**
 * Clean up test data created during e2e tests
 */
export const cleanupTestData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { flockId } = req.query;
    
    if (flockId && typeof flockId === 'string') {
      // Clean up specific flock and its tasks
      if (!mongoose.Types.ObjectId.isValid(flockId)) {
        res.status(400).json({ message: 'Invalid flock ID' });
        return;
      }
      
      await Task.deleteMany({ flock: flockId });
      await Flock.findByIdAndDelete(flockId);
      
      res.status(200).json({ message: `Cleaned up flock ${flockId} and its tasks` });
    } else {
      // Clean up all test data that matches test pattern
      // Delete tasks and flocks with test in the name (case insensitive)
      await Task.deleteMany({ title: { $regex: /test/i } });
      await Flock.deleteMany({ name: { $regex: /test/i } });
      
      res.status(200).json({ message: 'Cleaned up all test data' });
    }
  } catch (error) {
    console.error('Error cleaning up test data:', error);
    res.status(500).json({ message: 'Error cleaning up test data' });
  }
};

/**
 * Reset rate limits for e2e testing
 * This is specifically for testing purposes to avoid rate limit issues during e2e tests
 */
export const resetRateLimits = async (req: Request, res: Response): Promise<void> => {
  try {
    // In a real implementation, this would interact with your rate limiting library/store
    // For this example, we're just clearing our test store
    Object.keys(rateLimitStore).forEach(key => {
      delete rateLimitStore[key];
    });
    
    // Log the reset for debugging
    console.log('Rate limits reset for e2e testing');
    
    res.status(200).json({ message: 'Rate limits reset successfully' });
  } catch (error) {
    console.error('Error resetting rate limits:', error);
    res.status(500).json({ message: 'Error resetting rate limits' });
  }
};
