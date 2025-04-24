import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate } from '@/middleware/auth';
import { AppError } from '@/types/errors';
import { User } from '@/models/User';

// Mock jwt
vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn(),
  },
}));

// Mock User model
vi.mock('@/models/User', () => ({
  User: {
    findById: vi.fn(),
  },
}));

describe('Auth Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Response;
  let mockNext: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  it('should throw error if no token provided', async () => {
    await authenticate(mockReq as Request, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'No token provided' });
  });

  it('should throw error if token format is invalid', async () => {
    mockReq.headers = {
      authorization: 'InvalidFormat token123',
    };

    await authenticate(mockReq as Request, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'No token provided' });
  });

  it('should add user to request if token is valid', async () => {
    const token = 'validToken';
    const userId = 'testUserId';
    const role = 'user';

    mockReq.headers = {
      authorization: `Bearer ${token}`,
    };

    (jwt.verify as any).mockReturnValue({ userId, role });
    (User.findById as any).mockResolvedValue({ _id: userId, role });

    await authenticate(mockReq as Request, mockRes, mockNext);

    expect(mockReq.user).toEqual({ userId, role });
    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle invalid token', async () => {
    mockReq.headers = {
      authorization: 'Bearer invalidToken',
    };

    (jwt.verify as any).mockImplementation(() => {
      const error = new Error('Invalid token');
      error.name = 'JsonWebTokenError';
      throw error;
    });

    await authenticate(mockReq as Request, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid token' });
  });

  it('should handle expired token', async () => {
    mockReq.headers = {
      authorization: 'Bearer expiredToken',
    };

    (jwt.verify as any).mockImplementation(() => {
      const error = new Error('Token expired');
      error.name = 'TokenExpiredError';
      throw error;
    });

    await authenticate(mockReq as Request, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid token' });
  });
}); 