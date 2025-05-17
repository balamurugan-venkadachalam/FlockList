import { Request, Response } from 'express';
import { User } from '../models/User';
import { Flock } from '../models/Flock';
import { Task } from '../models/Task';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

// We'll handle user verification directly without the model
// This avoids issues if the UserVerification model doesn't exist yet

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
      // Rule: Security - Implement proper password hashing
      const testSalt = await bcrypt.genSalt(10);
      const testHashedPassword = await bcrypt.hash('Password123!', testSalt);
      
      await User.create({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: testHashedPassword,
        role: 'member',
        isEmailVerified: true
      });
    }

    // Create admin user if it doesn't exist
    const adminUserExists = await User.findOne({ email: 'admin@example.com' });
    if (!adminUserExists) {
      // Rule: Security - Implement proper password hashing
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('AdminPass123!', salt);
      
      await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        isEmailVerified: true
      });
    }

    // Create member user if it doesn't exist
    const memberUserExists = await User.findOne({ email: 'member@example.com' });
    if (!memberUserExists) {
      // Rule: Security - Implement proper password hashing
      const memberSalt = await bcrypt.genSalt(10);
      const memberHashedPassword = await bcrypt.hash('MemberPass123!', memberSalt);
      
      await User.create({
        firstName: 'Member',
        lastName: 'User',
        email: 'member@example.com',
        password: memberHashedPassword,
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

/**
 * Check if a user exists in the system
 * Used by e2e tests to verify if test users need to be created
 */
export const checkUserExists = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    
    // Rule: Backend Controller Rules - Always ensure the response format matches the OpenAPI specification
    res.status(200).json({
      exists: !!user,
      email
    });
  } catch (error) {
    console.error('Error checking if user exists:', error);
    res.status(500).json({ message: 'Error checking if user exists' });
  }
};

/**
 * Validate a test user's email
 * This is only for testing purposes to bypass the email verification flow
 */
export const validateTestUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    
    // Find the user
    const user = await User.findOne({ email });
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    // Mark the user's email as verified
    user.isEmailVerified = true;
    await user.save();
    
    // We'll handle verification directly in the database
    // This is more reliable than depending on the UserVerification model
    try {
      await mongoose.connection.collection('userverifications').deleteMany({ userId: user._id });
    } catch (e) {
      console.warn('Could not clean up verification records, but continuing:', e);
    }
    
    // Rule: Backend Controller Rules - Always ensure the response format matches the OpenAPI specification
    res.status(200).json({
      message: `User ${email} email validated successfully`,
      user: {
        email: user.email,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Error validating test user:', error);
    res.status(500).json({ message: 'Error validating test user' });
  }
};

/**
 * Setup test users for e2e testing
 * This is a convenience endpoint that combines creating and validating test users
 */
export const setupTestUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    // Rule: Error Handling - Implement proper error handling
    console.log('Setting up test users...');
    
    // First, remove existing test users to ensure clean state
    await User.deleteMany({
      email: { $in: ['test@example.com', 'admin@example.com', 'member@example.com'] }
    });
    
    console.log('Deleted existing test users');
    
    // Create test user - password will be hashed by the User model's pre-save hook
    await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'Password123!',
      role: 'member',
      isEmailVerified: true
    });
    console.log('Created test user');

    // Create admin user - password will be hashed by the User model's pre-save hook
    await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: 'AdminPass123!',
      role: 'admin',
      isEmailVerified: true
    });
    console.log('Created admin user');

    // Create member user - password will be hashed by the User model's pre-save hook
    await User.create({
      firstName: 'Member',
      lastName: 'User',
      email: 'member@example.com',
      password: 'MemberPass123!',
      role: 'member',
      isEmailVerified: true
    });
    console.log('Created member user');
    
    res.status(200).json({ message: 'Test users created and validated successfully' });
  } catch (error) {
    console.error('Error setting up test users:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error setting up test users' });
    }
  }
};
