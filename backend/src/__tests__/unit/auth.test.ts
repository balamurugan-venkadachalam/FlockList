import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateRefreshToken } from '../../controllers/authController';
import { generateToken } from '../../utils/auth';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { IUser } from '../../models/User';

describe('Auth Controller Unit Tests', () => {
  const mockUserId = new Types.ObjectId().toString();
  const mockRole = 'parent';
  const mockUser = {
    _id: mockUserId,
    role: mockRole as 'parent' | 'child',
    email: 'test@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
    refreshToken: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    comparePassword: async () => true,
    toJSON: () => ({
      _id: mockUserId,
      email: 'test@example.com',
      role: mockRole
    })
  } as unknown as IUser;

  beforeEach(() => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(mockUser);
      expect(token).toBeDefined();
      
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as { userId: string; role: string };
      expect(decoded.userId).toBe(mockUserId);
      expect(decoded.role).toBe(mockRole);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const refreshToken = generateRefreshToken(mockUserId);
      expect(refreshToken).toBeDefined();
      
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as { userId: string };
      expect(decoded.userId).toBe(mockUserId);
    });
  });
}); 