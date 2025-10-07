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
const mockTasks: Task[] = [
  {
    _id: 'task1',
    title: 'Complete Project Documentation',
    description: 'Write comprehensive documentation for the TaskMaster project including API endpoints and component usage.',
    status: 'pending',
    priority: 'high',
    category: 'chore',
    dueDate: '2023-12-15T00:00:00.000Z',
    assignees: [{ _id: 'user1', firstName: 'John', lastName: 'Doe' }],
    createdBy: 'user2',
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
    createdBy: 'user2',
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
    assignees: [{ _id: 'user3', firstName: 'Jane', lastName: 'Smith' }],
    createdBy: 'user1',
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
