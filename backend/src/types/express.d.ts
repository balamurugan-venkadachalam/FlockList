import { Request } from 'express';

// Extend the Express Request interface to include the user property
declare global {
  namespace Express {
    interface Request {
      user: {
        userId: string;
        role: string;
      };
    }
  }
}
