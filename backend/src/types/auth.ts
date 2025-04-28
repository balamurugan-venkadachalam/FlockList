import { Request } from 'express';
import { IUser } from '../models/User';
import { Document } from 'mongoose';

export interface TokenPayload {
  userId: string;
  role: string;
}

// Type alias for Request with guaranteed user property
// This is now just a type alias since we've extended the Express.Request interface globally
export type AuthRequest<
  P = {},
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
> = Request<P, ResBody, ReqBody, ReqQuery>;

export interface RegisterRequestBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'member';
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface GoogleAuthRequestBody {
  token: string;
}

export interface ValidationError {
  name: 'ValidationError';
  errors: {
    [key: string]: {
      message: string;
    };
  };
}

export interface AuthResponse {
  message: string;
  user?: Partial<IUser>;
  token?: string;
  requireEmailVerification?: boolean;
} 