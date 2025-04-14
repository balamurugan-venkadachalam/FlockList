import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorResponse } from '../types/errors';
import mongoose from 'mongoose';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Handle mongoose validation errors
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map(error => error.message);
    return res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Validation Error',
      errors,
    } as ErrorResponse);
  }

  // Handle mongoose cast errors (invalid IDs)
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      code: 'INVALID_INPUT',
      message: 'Invalid ID format',
      errors: [err.message],
    } as ErrorResponse);
  }

  // Handle mongoose duplicate key errors
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    return res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Duplicate field value',
      errors: ['A record with this value already exists'],
    } as ErrorResponse);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      code: 'TOKEN_ERROR',
      message: 'Invalid token',
      errors: [err.message],
    } as ErrorResponse);
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      code: 'TOKEN_ERROR',
      message: 'Token expired',
      errors: [err.message],
    } as ErrorResponse);
  }

  // Handle custom AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      code: err.code,
      message: err.message,
      errors: err.errors,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    } as ErrorResponse);
  }

  // Handle unknown errors
  return res.status(500).json({
    code: 'SERVER_ERROR',
    message: 'Internal Server Error',
    errors: process.env.NODE_ENV === 'development' ? [err.message] : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  } as ErrorResponse);
}; 