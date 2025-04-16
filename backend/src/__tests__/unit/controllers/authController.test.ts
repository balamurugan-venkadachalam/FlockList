import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { User } from '../../../models/User';
import * as googleIntegration from '../../../integrations/google';
import { googleAuth } from '../../../controllers/authController';
import { ValidationError } from '../../../types/errors';
import * as authUtils from '../../../utils/auth';

// Create a mock user class
class MockUser {
  _id = new mongoose.Types.ObjectId();
  email: string;
  googleId: string | null;
  profilePicture: string | null;
  save: any;
  toJSON: any;

  constructor(userData: any) {
    this.email = userData.email;
    this.googleId = userData.googleId || null;
    this.profilePicture = userData.profilePicture || null;
    this.save = vi.fn().mockResolvedValue(true);
    this.toJSON = vi.fn().mockReturnValue({ id: this._id.toString(), email: this.email });
  }
}

// Mock the modules
vi.mock('../../../models/User');
vi.mock('../../../utils/auth', () => ({
  generateToken: vi.fn().mockReturnValue('mock_token'),
  generateRefreshToken: vi.fn().mockReturnValue('mock_refresh_token'),
}));

// Mock Google integration
vi.mock('../../../integrations/google', () => ({
  verifyGoogleToken: vi.fn(),
}));

// Type assertion for the mocked User
const UserMock = User as unknown as {
  findOne: ReturnType<typeof vi.fn>;
  new(): MockUser;
};

describe('Auth Controller - Google Auth', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: any;

  beforeEach(() => {
    mockReq = {
      body: {},
    };
    mockRes = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
      cookie: vi.fn(),
    };
    mockNext = vi.fn();

    vi.clearAllMocks();
    
    // Setup default mocks
    vi.mocked(UserMock.findOne).mockReset();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should throw an error if token is missing', async () => {
    // Setup
    mockReq.body = {};
    
    // Execute
    await googleAuth(mockReq as Request, mockRes as Response, mockNext);
    
    // Verify
    expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    expect(mockNext.mock.calls[0][0].message).toBe('Google token is required');
  });

  it('should create a new user if one does not exist', async () => {
    // Setup
    mockReq.body = { token: 'valid_google_token' };
    
    const googleUserInfo = {
      googleId: '12345',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      profilePicture: 'https://example.com/photo.jpg',
    };
    
    vi.mocked(googleIntegration.verifyGoogleToken).mockResolvedValueOnce(googleUserInfo);
    
    // Mock that no user is found
    vi.mocked(UserMock.findOne).mockResolvedValueOnce(null);
    
    // Create a mock user that will be returned after creation
    const mockUser = new MockUser({
      email: googleUserInfo.email,
      googleId: googleUserInfo.googleId,
      profilePicture: googleUserInfo.profilePicture,
    });
    
    // Mock the User constructor
    vi.mocked(User).mockImplementation(() => mockUser as any);
    
    // Execute
    await googleAuth(mockReq as Request, mockRes as Response, mockNext);
    
    // Verify
    expect(googleIntegration.verifyGoogleToken).toHaveBeenCalledWith('valid_google_token');
    expect(UserMock.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(mockUser.save).toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Google login successful',
      })
    );
  });

  it('should update an existing user with googleId if they do not have one', async () => {
    // Setup
    mockReq.body = { token: 'valid_google_token' };
    
    const googleUserInfo = {
      googleId: '12345',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      profilePicture: 'https://example.com/photo.jpg',
    };
    
    vi.mocked(googleIntegration.verifyGoogleToken).mockResolvedValueOnce(googleUserInfo);
    
    const mockUser = {
      _id: new mongoose.Types.ObjectId(),
      email: 'test@example.com',
      googleId: null,
      profilePicture: null,
      save: vi.fn().mockResolvedValue(true),
      toJSON: vi.fn().mockReturnValue({ id: 'user_id', email: 'test@example.com' }),
    };
    
    vi.mocked(UserMock.findOne).mockResolvedValueOnce(mockUser as any);
    
    // Execute
    await googleAuth(mockReq as Request, mockRes as Response, mockNext);
    
    // Verify
    expect(mockUser.googleId).toBe('12345');
    expect(mockUser.profilePicture).toBe('https://example.com/photo.jpg');
    expect(mockUser.save).toHaveBeenCalled();
  });

  it('should handle verification errors', async () => {
    // Setup
    mockReq.body = { token: 'invalid_token' };
    
    const error = new ValidationError('Invalid Google token');
    vi.mocked(googleIntegration.verifyGoogleToken).mockRejectedValueOnce(error);
    
    // Execute
    await googleAuth(mockReq as Request, mockRes as Response, mockNext);
    
    // Verify
    expect(mockNext).toHaveBeenCalledWith(error);
  });
}); 