// Rule applied: Implement proper error handling
// Rule applied: Use TypeScript for all code; prefer interfaces over types
// Rule applied: Use explicit return types for all functions

import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to restrict routes to specific environments
 * @param allowedEnvironments Array of allowed environments (e.g., ['development', 'test'])
 * @returns Express middleware function
 */
export const restrictToEnvironments = (allowedEnvironments: string[]): (req: Request, res: Response, next: NextFunction) => void => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const currentEnv = process.env.NODE_ENV || 'development';
    
    if (allowedEnvironments.includes(currentEnv)) {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: `This endpoint is not available in ${currentEnv} environment`,
        code: 'ENVIRONMENT_RESTRICTED'
      });
    }
  };
};
