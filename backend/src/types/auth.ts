import { IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
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
  user?: Omit<IUser, 'password' | 'refreshToken'>;
  token?: string;
  errors?: string[];
}

export interface TokenPayload {
  userId: string;
  role?: string;
} 