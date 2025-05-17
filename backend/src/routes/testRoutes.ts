import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { User } from '../models/User';
import { validateTestUser, checkUserExists, cleanupTestData, setupTestUsers } from '../controllers/testController';

// Rule: Backend Controller Rules - Always ensure the response format matches the OpenAPI specification

const router = Router();

// Validation middleware
const validateUserValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
];

const checkUserValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
];

// Test routes - only available in development and test environments
if (process.env.NODE_ENV !== 'production') {
  // Setup test users (creates and validates them)
  router.post('/setup', setupTestUsers);
  
  // Check if a user exists
  router.post('/check-user', checkUserValidation, validateRequest, checkUserExists);
  
  // Validate a test user's email
  router.post('/validate-user', validateUserValidation, validateRequest, validateTestUser);
  
  // Clean up test data
  router.post('/cleanup', cleanupTestData);
} else {
  // In production, return 404 for all test routes
  router.all('*', (req, res) => {
    res.status(404).json({ message: 'Not found' });
  });
}

export default router;
