import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ValidationError } from '../types/errors';

/**
 * Middleware to handle validation errors from express-validator
 */
export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg);
    throw new ValidationError('Validation failed', errorMessages);
  }
  
  next();
}; 