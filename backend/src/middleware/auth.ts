import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
      };
    }
  }
}

// Verify JWT token
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your_jwt_secret_here'
    ) as { userId: string; role: string };

    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
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
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    if (!user.isEmailVerified) {
      res.status(403).json({ 
        message: 'Email not verified. Please verify your email before accessing this resource.',
        requireEmailVerification: true
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Email verification check error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Check if user has required role
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    next();
  };
}; 