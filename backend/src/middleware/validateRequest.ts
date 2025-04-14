import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError, ZodIssue } from 'zod';
import { ValidationError } from '../types/errors';

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err: ZodIssue) => ({
          field: err.path.join('.'),
          message: err.message
        }));
        return next(new ValidationError('Validation failed', errors.map(e => e.message)));
      }
      return next(error);
    }
  };
}; 