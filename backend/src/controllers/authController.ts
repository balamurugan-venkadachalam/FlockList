import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { SignOptions } from 'jsonwebtoken';
import {
  AuthRequest,
  RegisterRequestBody,
  LoginRequestBody,
  AuthResponse,
  TokenPayload
} from '../types/auth';
import {
  ValidationError,
  AuthenticationError,
  TokenError,
  DatabaseError
} from '../types/errors';
import mongoose from 'mongoose';
import { generateToken } from '../utils/auth';
import { verifyGoogleToken } from '../integrations/google';

// Generate refresh token
export const generateRefreshToken = (userId: string): string => {
  const options: SignOptions = {
    expiresIn: '7d' as const
  };
  return jwt.sign(
    { userId } as TokenPayload,
    process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_here',
    options
  );
};

// Register new user
export const register = async (
  req: Request<{}, {}, RegisterRequestBody>,
  res: Response<AuthResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ValidationError('Email already registered');
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role,
    });

    try {
      await user.save();
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        const errors = Object.values(error.errors).map(err => err.message);
        throw new ValidationError('Invalid user data', errors);
      }
      throw error;
    }

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user._id.toString());

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: user.toJSON(),
      token,
    });
  } catch (error) {
    next(error);
  }
};

// Login user
export const login = async (
  req: Request<{}, {}, LoginRequestBody>,
  res: Response<AuthResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user._id.toString());

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      token,
    });
  } catch (error) {
    next(error);
  }
};

// Logout user
export const logout = async (
  req: AuthRequest,
  res: Response<AuthResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (userId) {
      await User.findByIdAndUpdate(userId, { refreshToken: null });
    }

    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// Get current user
export const getCurrentUser = async (
  req: AuthRequest,
  res: Response<AuthResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      throw new DatabaseError('User not found');
    }

    res.json({ message: 'User retrieved successfully', user: user.toJSON() });
  } catch (error) {
    next(error);
  }
};

// Refresh token
export const refreshToken = async (
  req: Request,
  res: Response<AuthResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      throw new TokenError('Refresh token not found');
    }

    try {
      // Verify refresh token
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_here'
      ) as TokenPayload;

      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new TokenError('User not found');
      }

      if (user.refreshToken !== refreshToken) {
        throw new TokenError('Invalid refresh token');
      }

      // Generate new tokens
      const newToken = generateToken(user);
      const newRefreshToken = generateRefreshToken(user._id.toString());

      // Save new refresh token
      user.refreshToken = newRefreshToken;
      await user.save();

      // Set new refresh token in HTTP-only cookie
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        message: 'Token refreshed successfully',
        user: user.toJSON(),
        token: newToken,
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new TokenError('Invalid refresh token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new TokenError('Refresh token expired');
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

// Google Auth
export const googleAuth = async (
  req: Request,
  res: Response<AuthResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      throw new ValidationError('Google token is required');
    }

    // Verify Google token using our integration
    const googleUserInfo = await verifyGoogleToken(token);
    
    // Check if user already exists
    let user = await User.findOne({ email: googleUserInfo.email });
    
    if (!user) {
      // Create new user from Google information
      const randomPassword = Math.random().toString(36).slice(-8);
      user = new User({
        email: googleUserInfo.email,
        password: randomPassword, // Random password as they'll login via Google
        firstName: googleUserInfo.firstName,
        lastName: googleUserInfo.lastName,
        role: 'parent', // Default role
        googleId: googleUserInfo.googleId,
        profilePicture: googleUserInfo.profilePicture,
      });
      
      await user.save();
    } else if (!user.googleId) {
      // If user exists but doesn't have a googleId, update it
      user.googleId = googleUserInfo.googleId;
      
      // Optionally update profile picture if user doesn't have one
      if (!user.profilePicture && googleUserInfo.profilePicture) {
        user.profilePicture = googleUserInfo.profilePicture;
      }
      
      await user.save();
    }

    // Generate tokens
    const authToken = generateToken(user);
    const refreshToken = generateRefreshToken(user._id.toString());

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: 'Google login successful',
      user: user.toJSON(),
      token: authToken,
    });
  } catch (error) {
    next(error);
  }
}; 