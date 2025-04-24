import { Router } from 'express';
import { body, query } from 'express-validator';
import { authenticate } from '../middleware/auth';
import rateLimit from 'express-rate-limit';
import {
  register,
  login,
  logout,
  getCurrentUser,
  refreshToken,
  googleAuth,
  verifyEmail,
  resendVerificationEmail
} from '../controllers/authController';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: {
    error: 'Too many login attempts',
    message: 'Too many login attempts from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation middleware
const registerValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('role').isIn(['admin', 'member']).withMessage('Invalid role'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

const resendVerificationValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
];

const verifyEmailValidation = [
  query('token').notEmpty().withMessage('Verification token is required'),
];

// Public routes
// @ts-ignore - Type issues with validateRequest middleware
router.post('/register', registerValidation, validateRequest, register);
// @ts-ignore - Type issues with validateRequest middleware
router.post('/login', loginLimiter, loginValidation, validateRequest, login);
router.post('/refresh-token', refreshToken);
// @ts-ignore - Type issues with validateRequest middleware
router.post('/google', body('token').notEmpty().withMessage('Google token is required'), validateRequest, googleAuth);
// @ts-ignore - Type issues with validateRequest middleware
router.get('/verify-email', verifyEmailValidation, validateRequest, verifyEmail);
// @ts-ignore - Type issues with validateRequest middleware
router.post('/resend-verification', resendVerificationValidation, validateRequest, resendVerificationEmail);

// Protected routes
router.use(authenticate);
router.post('/logout', logout);
router.get('/me', getCurrentUser);

export default router; 