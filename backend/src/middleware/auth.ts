import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, TokenPayload } from '../types/auth';
import { AuthenticationError, TokenError } from '../types/errors';
import { HTTP_STATUS } from '../constants/httpStatus';
import { User } from '../models/User';

// Note: Express Request type is extended in types/express.d.ts

// Verify JWT token
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your_jwt_secret_here'
    ) as { userId: string; role: string };

    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: 'User not found' });
      return;
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: 'Invalid token' });
  }
};

// Check if user has verified email
export const requireEmailVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: 'Not authenticated' });
      return;
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: 'User not found' });
      return;
    }

    if (!user.isEmailVerified) {
      res.status(HTTP_STATUS.FORBIDDEN).json({ 
        message: 'Email not verified. Please verify your email before accessing this resource.',
        requireEmailVerification: true
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Email verification check error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
  }
};

// Check if user has required role
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: 'Not authenticated' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(HTTP_STATUS.FORBIDDEN).json({ message: 'Not authorized' });
      return;
    }

    next();
  };
}; 