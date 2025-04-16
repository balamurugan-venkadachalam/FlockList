import express from 'express';
const { body } = require('express-validator');
import {
  register,
  login,
  logout,
  getCurrentUser,
  refreshToken,
  googleAuth,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('role').isIn(['parent', 'child']).withMessage('Invalid role'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getCurrentUser);
router.post('/refresh-token', refreshToken);
router.post('/google', body('token').notEmpty().withMessage('Google token is required'), googleAuth);

export default router; 