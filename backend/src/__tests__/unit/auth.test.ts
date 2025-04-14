import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateToken, generateRefreshToken } from '../../controllers/authController';
import jwt from 'jsonwebtoken';

describe('Auth Controller Unit Tests', () => {
  const mockUserId = '123456789';
  const mockRole = 'parent';

  beforeEach(() => {
    process.env.JWT_SECRET = 'test_secret';
    process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(mockUserId, mockRole);
      expect(token).toBeDefined();
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: string };
      expect(decoded.userId).toBe(mockUserId);
      expect(decoded.role).toBe(mockRole);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const refreshToken = generateRefreshToken(mockUserId);
      expect(refreshToken).toBeDefined();
      
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string };
      expect(decoded.userId).toBe(mockUserId);
    });
  });
}); 