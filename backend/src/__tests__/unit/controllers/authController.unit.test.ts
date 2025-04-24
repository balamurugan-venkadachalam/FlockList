import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest, TokenPayload } from '../../../types/auth';

// Mock implementations must be defined before imports
vi.mock('mongoose');

// Mock User model
vi.mock('../../../models/User', () => {
  const MockUser: any = vi.fn(() => ({
    _id: new mongoose.Types.ObjectId(),
    save: vi.fn().mockResolvedValue(true),
    toJSON: vi.fn()
  }));
  
  // Add static methods to the constructor
  Object.assign(MockUser, {
    findOne: vi.fn(),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn()
  });
  
  return { User: MockUser };
});

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn().mockReturnValue('mock-refresh-token'),
    verify: vi.fn(),
    JsonWebTokenError: class JsonWebTokenError extends Error {
      constructor(message: string) {
        super(message);
        this.name = 'JsonWebTokenError';
      }
    },
    TokenExpiredError: class TokenExpiredError extends Error {
      expiredAt: Date;
      constructor(message: string, expiredAt: Date) {
        super(message);
        this.name = 'TokenExpiredError';
        this.expiredAt = expiredAt;
      }
    }
  }
}));

vi.mock('../../../utils/auth', () => ({
  generateToken: vi.fn().mockReturnValue('mock-token')
}));

vi.mock('../../../integrations/google', () => ({
  verifyGoogleToken: vi.fn()
}));

// Import after all mocks are defined
import { User } from '../../../models/User';
import * as googleIntegration from '../../../integrations/google';
import * as authUtils from '../../../utils/auth';
import jwt from 'jsonwebtoken';
import {
  register,
  login,
  logout,
  getCurrentUser,
  refreshToken,
  googleAuth
} from '../../../controllers/authController';

describe('Auth Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: any;

  beforeEach(() => {
    mockRequest = {
      body: {},
      cookies: {},
      user: { userId: 'mock-user-id' } as TokenPayload
    };
    
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      cookie: vi.fn(),
      clearCookie: vi.fn()
    };
    
    mockNext = vi.fn();

    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      // Setup
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'admin'
      };

      const mockUser = {
        _id: new mongoose.Types.ObjectId('mock-id'),
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'admin',
        refreshToken: '',
        save: vi.fn().mockResolvedValue(true),
        toJSON: vi.fn().mockReturnValue({
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'admin'
        })
      };

      // Mock the static findOne method
      vi.mocked(User.findOne).mockResolvedValue(null);
      
      // Mock the constructor instance
      const MockedUser = vi.mocked(User);
      MockedUser.mockImplementation(() => mockUser as any);

      // Execute
      await register(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockUser.save).toHaveBeenCalled();
      expect(authUtils.generateToken).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalled();
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'mock-refresh-token',
        expect.any(Object)
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User registered successfully',
        user: expect.any(Object),
        token: 'mock-token'
      });
    });

    it('should handle existing user error', async () => {
      // Setup
      mockRequest.body = {
        email: 'existing@example.com',
        password: 'password123'
      };

      vi.mocked(User.findOne).mockResolvedValue({ email: 'existing@example.com' } as any);

      // Execute
      await register(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'existing@example.com' });
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Email already registered'
      }));
    });
  });

  describe('login', () => {
    it('should successfully log in a user', async () => {
      // Setup
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        _id: 'mock-id',
        email: 'test@example.com',
        comparePassword: vi.fn().mockResolvedValue(true),
        refreshToken: '',
        save: vi.fn().mockResolvedValue(true),
        toJSON: vi.fn().mockReturnValue({
          email: 'test@example.com'
        })
      };

      vi.mocked(User.findOne).mockResolvedValue(mockUser as any);

      // Execute
      await login(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockUser.comparePassword).toHaveBeenCalledWith('password123');
      expect(authUtils.generateToken).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalled();
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'mock-refresh-token',
        expect.any(Object)
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Login successful',
        user: expect.any(Object),
        token: 'mock-token'
      });
    });

    it('should handle non-existent user', async () => {
      // Setup
      mockRequest.body = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      vi.mocked(User.findOne).mockResolvedValue(null);

      // Execute
      await login(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'nonexistent@example.com' });
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Invalid credentials'
      }));
    });

    it('should handle incorrect password', async () => {
      // Setup
      mockRequest.body = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const mockUser = {
        email: 'test@example.com',
        comparePassword: vi.fn().mockResolvedValue(false)
      };

      vi.mocked(User.findOne).mockResolvedValue(mockUser as any);

      // Execute
      await login(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockUser.comparePassword).toHaveBeenCalledWith('wrongpassword');
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Invalid credentials'
      }));
    });
  });

  describe('logout', () => {
    it('should successfully log out a user', async () => {
      // Setup
      const authRequest = {
        user: { userId: 'mock-user-id' }
      } as AuthRequest;

      vi.mocked(User.findByIdAndUpdate).mockResolvedValue({} as any);

      // Execute
      await logout(authRequest, mockResponse as Response, mockNext);

      // Assert
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith('mock-user-id', { refreshToken: null });
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refreshToken');
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Logged out successfully'
      });
    });
  });

  describe('getCurrentUser', () => {
    it('should get the current user', async () => {
      // Setup
      const authRequest = {
        user: { userId: 'mock-user-id' }
      } as AuthRequest;

      const mockUser = {
        _id: 'mock-user-id',
        email: 'test@example.com',
        toJSON: vi.fn().mockReturnValue({
          email: 'test@example.com'
        })
      };

      vi.mocked(User.findById).mockResolvedValue(mockUser as any);

      // Execute
      await getCurrentUser(authRequest, mockResponse as Response, mockNext);

      // Assert
      expect(User.findById).toHaveBeenCalledWith('mock-user-id');
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User retrieved successfully',
        user: expect.any(Object)
      });
    });

    it('should handle user not found', async () => {
      // Setup
      const authRequest = {
        user: { userId: 'nonexistent-id' }
      } as AuthRequest;

      vi.mocked(User.findById).mockResolvedValue(null);

      // Execute
      await getCurrentUser(authRequest, mockResponse as Response, mockNext);

      // Assert
      expect(User.findById).toHaveBeenCalledWith('nonexistent-id');
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'User not found'
      }));
    });
  });

  describe('refreshToken', () => {
    it('should refresh the token successfully', async () => {
      // Setup
      mockRequest.cookies = { refreshToken: 'valid-refresh-token' };

      const mockUser = {
        _id: new mongoose.Types.ObjectId('mock-user-id'),
        refreshToken: 'valid-refresh-token',
        save: vi.fn().mockResolvedValue(true),
        toJSON: vi.fn().mockReturnValue({
          email: 'test@example.com'
        })
      };

      vi.mocked(jwt.verify).mockReturnValue({ userId: 'mock-user-id' } as any);
      vi.mocked(User.findById).mockResolvedValue(mockUser as any);

      // Execute
      await refreshToken(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(
        'valid-refresh-token',
        expect.any(String)
      );
      expect(User.findById).toHaveBeenCalledWith('mock-user-id');
      expect(authUtils.generateToken).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalled();
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'mock-refresh-token',
        expect.any(Object)
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Token refreshed successfully',
        user: expect.any(Object),
        token: 'mock-token'
      });
    });

    it('should handle missing refresh token', async () => {
      // Setup
      mockRequest.cookies = {};

      // Execute
      await refreshToken(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Refresh token not found'
      }));
    });

    it('should handle invalid token', async () => {
      // Setup
      mockRequest.cookies = { refreshToken: 'invalid-token' };

      vi.mocked(jwt.verify).mockImplementation(() => {
        throw new jwt.JsonWebTokenError('Invalid token');
      });

      // Execute
      await refreshToken(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Invalid refresh token'
      }));
    });

    it('should handle expired token', async () => {
      // Setup
      mockRequest.cookies = { refreshToken: 'expired-token' };

      vi.mocked(jwt.verify).mockImplementation(() => {
        throw new jwt.TokenExpiredError('Expired token', new Date());
      });

      // Execute
      await refreshToken(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Refresh token expired'
      }));
    });
  });

  describe('googleAuth', () => {
    it('should authenticate with Google for a new user', async () => {
      // Setup
      mockRequest.body = { token: 'google-token' };

      const googleUserInfo = {
        email: 'google@example.com',
        firstName: 'Google',
        lastName: 'User',
        googleId: 'google-id-123',
        profilePicture: 'profile-url'
      };

      const mockUser = {
        _id: 'mock-user-id',
        email: 'google@example.com',
        firstName: 'Google',
        lastName: 'User',
        googleId: 'google-id-123',
        profilePicture: 'profile-url',
        role: 'admin',
        refreshToken: '',
        save: vi.fn().mockResolvedValue(true),
        toJSON: vi.fn().mockReturnValue({
          email: 'google@example.com'
        })
      };

      vi.mocked(googleIntegration.verifyGoogleToken).mockResolvedValue(googleUserInfo);
      vi.mocked(User.findOne).mockResolvedValue(null);
      vi.mocked(User).mockImplementation(() => mockUser as any);

      // Execute
      await googleAuth(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(googleIntegration.verifyGoogleToken).toHaveBeenCalledWith('google-token');
      expect(User.findOne).toHaveBeenCalledWith({ email: 'google@example.com' });
      expect(mockUser.save).toHaveBeenCalled();
      expect(authUtils.generateToken).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalled();
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'mock-refresh-token',
        expect.any(Object)
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Google login successful',
        user: expect.any(Object),
        token: 'mock-token'
      });
    });

    it('should authenticate with Google for an existing user without googleId', async () => {
      // Setup
      mockRequest.body = { token: 'google-token' };

      const googleUserInfo = {
        email: 'google@example.com',
        firstName: 'Google',
        lastName: 'User',
        googleId: 'google-id-123',
        profilePicture: 'profile-url'
      };

      const mockUser = {
        _id: 'mock-user-id',
        email: 'google@example.com',
        googleId: null,
        profilePicture: null,
        save: vi.fn().mockResolvedValue(true),
        toJSON: vi.fn().mockReturnValue({
          email: 'google@example.com'
        })
      };

      vi.mocked(googleIntegration.verifyGoogleToken).mockResolvedValue(googleUserInfo);
      vi.mocked(User.findOne).mockResolvedValue(mockUser as any);

      // Execute
      await googleAuth(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(googleIntegration.verifyGoogleToken).toHaveBeenCalledWith('google-token');
      expect(User.findOne).toHaveBeenCalledWith({ email: 'google@example.com' });
      expect(mockUser.googleId).toBe('google-id-123');
      expect(mockUser.profilePicture).toBe('profile-url');
      expect(mockUser.save).toHaveBeenCalled();
      expect(authUtils.generateToken).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Google login successful',
        user: expect.any(Object),
        token: 'mock-token'
      });
    });

    it('should handle missing Google token', async () => {
      // Setup
      mockRequest.body = {};

      // Execute
      await googleAuth(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Google token is required'
      }));
    });
  });
}); 