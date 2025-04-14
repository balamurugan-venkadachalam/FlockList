export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  TOKEN_ERROR = 'TOKEN_ERROR',
  INVALID_INPUT = 'INVALID_INPUT'
}

export interface ErrorResponse {
  code: ErrorCode;
  message: string;
  errors?: string[];
  stack?: string;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly errors?: string[];

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    errors?: string[]
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.errors = errors;
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error classes
export class ValidationError extends AppError {
  constructor(message: string, errors?: string[]) {
    super(ErrorCode.VALIDATION_ERROR, message, 400, errors);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string, errors?: string[]) {
    super(ErrorCode.AUTHENTICATION_ERROR, message, 401, errors);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string, errors?: string[]) {
    super(ErrorCode.AUTHORIZATION_ERROR, message, 403, errors);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, errors?: string[]) {
    super(ErrorCode.NOT_FOUND_ERROR, message, 404, errors);
    this.name = 'NotFoundError';
  }
}

export class TokenError extends AppError {
  constructor(message: string, errors?: string[]) {
    super(ErrorCode.TOKEN_ERROR, message, 401, errors);
    this.name = 'TokenError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, errors?: string[]) {
    super(ErrorCode.DATABASE_ERROR, message, 500, errors);
    this.name = 'DatabaseError';
  }
}

export class InvalidInputError extends AppError {
  constructor(message: string, errors?: string[]) {
    super(ErrorCode.INVALID_INPUT, message, 400, errors);
    this.name = 'InvalidInputError';
  }
} 