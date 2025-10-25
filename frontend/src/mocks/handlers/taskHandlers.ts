import { http, HttpResponse, delay, PathParams } from 'msw';
import { Task, TaskListResponse } from '../../types/models/task';

// Base URL for API endpoints
const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// API endpoints
const ENDPOINTS = {
  TASKS: `${baseUrl}/api/tasks`,
  TASK_BY_ID: `${baseUrl}/api/tasks/:id`,
};

// Default pagination settings
const DEFAULT_PAGINATION = {
  limit: 10,
  offset: 0,
  hasMore: false,
};

// Mock tasks data
const mockTasks: any[] = [
  {
    _id: 'task1',
    title: 'Complete Project Documentation',
    description: 'Write comprehensive documentation for the TaskMaster project including API endpoints and component usage.',
    status: 'pending',
    priority: 'high',
    category: 'chore',
    dueDate: '2023-12-15T00:00:00.000Z',
    assignees: [{ _id: 'user1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' }],
    createdBy: {
      _id: 'user2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com'
    },
    createdAt: '2023-11-01T00:00:00.000Z',
    updatedAt: '2023-11-01T00:00:00.000Z',
    flock: { _id: 'flock1', name: 'Development Team' }
  },
  {
    _id: 'task2',
    title: 'Implement Authentication Flow',
    description: 'Set up JWT authentication with refresh tokens and secure API endpoints.',
    status: 'in_progress',
    priority: 'high',
    category: 'activity',
    dueDate: '2023-12-10T00:00:00.000Z',
    assignees: [],
    createdBy: {
      _id: 'user2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com'
    },
    createdAt: '2023-11-02T00:00:00.000Z',
    updatedAt: '2023-11-05T00:00:00.000Z',
    flock: { _id: 'flock1', name: 'Development Team' }
  },
  {
    _id: 'task3',
    title: 'Design User Dashboard',
    description: 'Create wireframes and implement the user dashboard with task statistics and activity feed.',
    status: 'completed',
    priority: 'medium',
    category: 'activity',
    dueDate: '2023-11-30T00:00:00.000Z',
    assignees: [{ _id: 'user3', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com' }],
    createdBy: {
      _id: 'user1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com'
    },
    completedAt: '2023-11-20T00:00:00.000Z',
    completedBy: {
      _id: 'user3',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com'
    },
    createdAt: '2023-11-03T00:00:00.000Z',
    updatedAt: '2023-11-20T00:00:00.000Z',
    flock: { _id: 'flock1', name: 'Development Team' }
  },
];

/**
 * Helper function to filter tasks based on query parameters
 */
const filterTasks = (params: URLSearchParams): Task[] => {
  const status = params.get('status');
  return status && status !== 'all'
    ? mockTasks.filter(task => task.status === status)
    : [...mockTasks];
};

/**
 * Create a task list response with the given tasks
 */
const createTaskListResponse = (tasks: Task[]): TaskListResponse => ({
  tasks,
  pagination: {
    ...DEFAULT_PAGINATION,
    total: tasks.length,
  },
});

/**
 * Create a handler for the GET /api/tasks endpoint
 */
const createGetTasksHandler = (
  responseFactory: (info: { request: Request; params: PathParams }) => Promise<HttpResponse<any>> | HttpResponse<any>
) => http.get(ENDPOINTS.TASKS, responseFactory);

// Standard task handlers
export const taskHandlers = [
  // GET /api/tasks - Get all tasks with optional filtering
  createGetTasksHandler(async ({ request }) => {
    await delay(500);
    const url = new URL(request.url);
    const filteredTasks = filterTasks(url.searchParams);
    return HttpResponse.json(createTaskListResponse(filteredTasks));
  }),
  
  // GET /api/tasks/:id - Get a specific task by ID
  http.get(ENDPOINTS.TASK_BY_ID, async ({ params }) => {
    await delay(300);
    const { id } = params;
    const task = mockTasks.find(t => t._id === id);
    
    return task
      ? HttpResponse.json({ task })
      : new HttpResponse(null, { status: 404 });
  }),
  
  // PATCH /api/tasks/:id/status - Update task status
  http.patch(`${baseUrl}/api/tasks/:id/status`, async ({ request, params }) => {
    await delay(300);
    const { id } = params;
    const body = await request.json() as { status: string };
    const task = mockTasks.find(t => t._id === id);
    
    if (!task) {
      return new HttpResponse(null, { status: 404 });
    }
    
    const updatedTask: any = {
      ...task,
      status: body.status,
      updatedAt: new Date().toISOString()
    };
    
    if (body.status === 'completed') {
      updatedTask.completedAt = new Date().toISOString();
      updatedTask.completedBy = {
        _id: 'user1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      };
    }
    
    return HttpResponse.json({
      message: 'Task status updated successfully',
      task: updatedTask
    });
  }),
  
  // DELETE /api/tasks/:id - Delete task
  http.delete(`${baseUrl}/api/tasks/:id`, async ({ params }) => {
    await delay(300);
    const { id } = params;
    const task = mockTasks.find(t => t._id === id);
    
    return task
      ? HttpResponse.json({
          message: 'Task deleted successfully',
          taskId: id
        })
      : new HttpResponse(null, { status: 404 });
  }),
];

// Special handlers for different story scenarios
export const getTasksErrorHandler = createGetTasksHandler(async () => {
  await delay(500);
  return new HttpResponse(null, { status: 500 });
});

export const getTasksEmptyHandler = createGetTasksHandler(async () => {
  await delay(500);
  return HttpResponse.json(createTaskListResponse([]));
});

export const getTasksLoadingHandler = createGetTasksHandler(async () => {
  await delay('infinite');
  return HttpResponse.json({});
});

// Task detail page specific handlers
export const getTaskByIdErrorHandler = http.get(ENDPOINTS.TASK_BY_ID, async () => {
  await delay(300);
  return new HttpResponse(null, { status: 500 });
});

export const getTaskByIdNotFoundHandler = http.get(ENDPOINTS.TASK_BY_ID, async () => {
  await delay(300);
  return HttpResponse.json({ message: 'Task not found' }, { status: 404 });
});

export const getTaskByIdLoadingHandler = http.get(ENDPOINTS.TASK_BY_ID, async () => {
  await delay('infinite');
  return HttpResponse.json({});
});

export const deleteTaskErrorHandler = http.delete(`${baseUrl}/api/tasks/:id`, async () => {
  await delay(300);
  return HttpResponse.json(
    { message: 'You do not have permission to delete this task' },
    { status: 403 }
  );
});
