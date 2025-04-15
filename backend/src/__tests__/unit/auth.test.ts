import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateToken, generateRefreshToken } from '../../controllers/authController';
import jwt from 'jsonwebtoken';

describe('Auth Controller Unit Tests', () => {
  const mockUserId = '123456789';
  const mockRole = 'parent';

  beforeEach(() => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(mockUserId, mockRole);
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