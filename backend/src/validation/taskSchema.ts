import { z } from 'zod';

// Base task schema with common fields
const taskBaseSchema = {
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title cannot be more than 100 characters')
    .trim(),
  description: z.string()
    .max(500, 'Description cannot be more than 500 characters')
    .trim()
    .optional(),
  priority: z.enum(['low', 'medium', 'high'], {
    errorMap: () => ({ message: 'Priority must be low, medium, or high' })
  }).optional(),
  dueDate: z.string()
    .datetime({ message: 'Invalid date format' })
    .optional()
    .transform((str: string | undefined) => str ? new Date(str) : undefined),
  status: z.enum(['todo', 'in_progress', 'completed'], {
    errorMap: () => ({ message: 'Status must be todo, in_progress, or completed' })
  }).optional()
};

// Schema for creating a new task
export const createTaskSchema = z.object({
  body: z.object(taskBaseSchema)
});

// Schema for updating a task
export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid task ID format')
  }),
  body: z.object(taskBaseSchema).partial()
});

// Schema for getting tasks with filters
export const getTasksSchema = z.object({
  query: z.object({
    status: z.enum(['todo', 'in_progress', 'completed']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    sortBy: z.enum(['createdAt', 'dueDate', 'priority', 'status']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional()
  })
});

// Schema for getting a single task
export const getTaskSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid task ID format')
  })
});

// Schema for updating task status
export const updateTaskStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid task ID format')
  }),
  body: z.object({
    status: z.enum(['todo', 'in_progress', 'completed'], {
      errorMap: () => ({ message: 'Status must be todo, in_progress, or completed' })
    })
  })
});

// Schema for deleting a task
export const deleteTaskSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid task ID format')
  })
}); 