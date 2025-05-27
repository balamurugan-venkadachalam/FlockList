import { Router } from 'express';
import { body } from 'express-validator';
import { chatController } from '../controllers/chatController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import rateLimit from 'express-rate-limit';

// Rule applied: Use functional and declarative programming patterns; avoid classes
const router = Router();

// Rate limiting for chat messages to prevent abuse
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 chat requests per minute
  message: {
    error: 'Too many chat requests',
    message: 'Too many chat requests from this IP, please try again after 1 minute.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for E2E test requests that include the special header
    return req.headers['x-e2e-test'] === 'true';
  }
});

// Validation middleware
const chatMessageValidation = [
  body('message').notEmpty().withMessage('Message is required')
    .isString().withMessage('Message must be a string')
    .isLength({ min: 1, max: 1000 }).withMessage('Message must be between 1 and 1000 characters')
];

// Public routes - none for chat as all require authentication

// Protected routes
router.use(authenticate);

// Rule applied: Always ensure the response format matches the OpenAPI specification
// @ts-ignore - Type issues with validateRequest middleware
router.post(
  '/',  // Changed from '/chat' to '/' since the router is already mounted at '/api/chat'
  chatLimiter,
  chatMessageValidation,
  validateRequest,
  chatController.handleChatMessage
);

// @ts-ignore - Type issues with validateRequest middleware
router.post(
  '/clear',  // Changed from '/chat/clear' to '/clear' since the router is already mounted at '/api/chat'
  chatController.clearChatSession
);

export default router;
