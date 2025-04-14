import { Request, Response, NextFunction } from 'express';
const { check, validationResult } = require('express-validator');

// Validation middleware to check for errors
const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Create task validation
export const validateCreateTask = [
  check('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot be more than 100 characters'),
  check('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters'),
  check('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  check('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  validate
];
// Update task validation
export const validateUpdateTask = [
  check('id')
    .isMongoId()
    .withMessage('Invalid task ID'),
  check('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Title cannot be more than 100 characters'),
  check('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters'),
  check('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  check('status')
    .optional()
    .isIn(['todo', 'in_progress', 'completed'])
    .withMessage('Status must be todo, in_progress, or completed'),
  check('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  validate
];

// Update task status validation
export const validateUpdateTaskStatus = [
  check('id')
    .isMongoId()
    .withMessage('Invalid task ID'),
  check('status')
    .isIn(['todo', 'in_progress', 'completed'])
    .withMessage('Status must be todo, in_progress, or completed'),
  validate
];

// Get tasks query validation
export const validateGetTasks = [
  check('status')
    .optional()
    .isIn(['todo', 'in_progress', 'completed'])
    .withMessage('Status must be todo, in_progress, or completed'),
  check('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  check('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'dueDate', 'priority', 'status'])
    .withMessage('Invalid sort field'),
  check('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  validate
];

// Get task by ID validation
export const validateGetTaskById = [
  check('id')
    .isMongoId()
    .withMessage('Invalid task ID'),
  validate
]; 