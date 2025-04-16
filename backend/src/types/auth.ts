import { Request } from 'express';
import { IUser } from '../models/User';

export interface TokenPayload {
  userId: string;
  role: string;
}

export interface RegisterRequestBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'parent' | 'child';
}

export interface LoginRequestBody {
  email: string;
  password: string;
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
  user?: any;
  token?: string;
}

// Make AuthRequest generic to support different parameter types
export interface AuthRequest<
  P = {},
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: TokenPayload;
} 