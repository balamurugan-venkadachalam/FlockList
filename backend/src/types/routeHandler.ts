import { RequestHandler } from 'express';
import { AuthRequest } from './auth';

/**
 * Type utility for creating properly typed route handlers that use AuthRequest
 * This follows TypeScript best practices for Express route typing
 */
export function createHandler<
  P = {},
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
>(
  handler: (
    req: AuthRequest<P, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction
  ) => Promise<void> | void
): RequestHandler<P, ResBody, ReqBody, ReqQuery> {
  return handler as RequestHandler<P, ResBody, ReqBody, ReqQuery>;
}

// Import these to make the function work correctly
import { Response, NextFunction } from 'express';
