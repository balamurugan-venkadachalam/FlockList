import { StoryObj, Meta } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import TaskDetailPage from './TaskDetailPage';
import React, { createContext } from 'react';
import { ToastProvider } from '../components/ui/shadcn/toast-provider';

// Import OpenAPI spec types
import { TaskStatus } from '../types/task';

// Define the base URL for API endpoints
const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Create a context for Auth
interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  profilePicture?: string;
  isEmailVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email?: string, password?: string) => Promise<void>;
  register: (userData?: any) => Promise<any>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  updateUser: (userData?: Partial<User>) => Promise<void>;
  verifyEmail: (token?: string) => Promise<any>;
  resendVerificationEmail: (email?: string) => Promise<any>;
  googleLogin: (token?: string) => Promise<void>;
}

// Create a context for Storybook
const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: false,
  login: async () => {},
  register: async () => ({}),
  logout: async () => {},
  isAuthenticated: false,
  updateUser: async () => {},
  verifyEmail: async () => ({}),
  resendVerificationEmail: async () => ({}),
  googleLogin: async () => {}
});

// Create mock users
const createMockUser = (role: string): AuthContextType => ({
  user: {
    _id: role === 'admin' ? 'admin1' : 'user1',
    email: `${role}@example.com`,
    firstName: role === 'admin' ? 'Admin' : 'John',
    lastName: role === 'admin' ? 'User' : 'Doe',
    role
  },
  token: 'mock-token',
  isLoading: false,
  login: async () => {},
  register: async () => ({}),
  logout: async () => {},
  isAuthenticated: true,
  updateUser: async () => {},
  verifyEmail: async () => ({}),
  resendVerificationEmail: async () => ({}),
  googleLogin: async () => {}
});

const mockRegularUser = createMockUser('user');
const mockAdminUser = createMockUser('admin');

// Helper function to create a story decorator with the appropriate context
const createDecorator = (user = mockRegularUser) => {
  return (Story: React.ComponentType): React.ReactElement => (
    <AuthContext.Provider value={user}>
      <ToastProvider>
        <Story />
      </ToastProvider>
    </AuthContext.Provider>
  );
};

// Mock task data based on OpenAPI schema
const mockTask = {
  _id: 'task123',
  title: 'Complete Project Documentation',
  description: 'Write comprehensive documentation for the TaskMaster project including API endpoints and component usage.',
  status: 'pending',
  priority: 'high',
  category: 'chore',
  dueDate: '2023-12-15T00:00:00.000Z',
  assignees: [{ _id: 'user1', firstName: 'John', lastName: 'Doe' }],
  createdBy: {
    _id: 'user2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com'
  },
  createdAt: '2023-11-01T00:00:00.000Z',
  updatedAt: '2023-11-01T00:00:00.000Z',
  flock: {
    _id: 'flock1',
    name: 'Development Team'
  }
};

const mockCompletedTask = {
  ...mockTask,
  _id: 'task456',
  title: 'Design User Interface',
  status: 'completed',
  completedAt: '2023-11-20T00:00:00.000Z',
  completedBy: {
    _id: 'user1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com'
  }
};

// Create MSW handlers based on OpenAPI spec
const defaultHandlers = [
  // GET /api/tasks/:id - Get task by ID
  http.get(`${baseUrl}/api/tasks/:id`, ({ params }) => {
    const { id } = params;
    
    if (id === 'task123') {
      return HttpResponse.json({
        message: 'Task retrieved successfully',
        task: mockTask
      }, { status: 200 });
    } else if (id === 'task456') {
      return HttpResponse.json({
        message: 'Task retrieved successfully',
        task: mockCompletedTask
      }, { status: 200 });
    } else if (id === 'error') {
      return HttpResponse.json({
        message: 'Task not found'
      }, { status: 404 });
    }
    
    return HttpResponse.json({
      message: 'Task not found'
    }, { status: 404 });
  }),
  
  // PATCH /api/tasks/:id/status - Update task status
  http.patch(`${baseUrl}/api/tasks/:id/status`, async ({ request, params }) => {
    const { id } = params;
    const body = await request.json();
    const { status } = body as { status: TaskStatus };
    
    if (id === 'task123' || id === 'task456') {
      const updatedTask = {
        ...mockTask,
        status,
        updatedAt: new Date().toISOString()
      };
      
      if (status === 'completed') {
        // @ts-ignore - Adding dynamic properties
        updatedTask.completedAt = new Date().toISOString();
        // @ts-ignore - Adding dynamic properties
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
      }, { status: 200 });
    }
    
    return HttpResponse.json({
      message: 'Task not found'
    }, { status: 404 });
  }),
  
  // DELETE /api/tasks/:id - Delete task
  http.delete(`${baseUrl}/api/tasks/:id`, ({ params }) => {
    const { id } = params;
    
    if (id === 'task123' || id === 'task456') {
      return HttpResponse.json({
        message: 'Task deleted successfully',
        taskId: id
      }, { status: 200 });
    }
    
    return HttpResponse.json({
      message: 'Task not found'
    }, { status: 404 });
  })
];

// Error handlers
const errorHandlers = [
  http.get(`${baseUrl}/api/tasks/:id`, () => {
    return HttpResponse.json({
      message: 'Internal server error'
    }, { status: 500 });
  })
];

// Not found handlers
const notFoundHandlers = [
  http.get(`${baseUrl}/api/tasks/:id`, () => {
    return HttpResponse.json({
      message: 'Task not found'
    }, { status: 404 });
  })
];

// Loading handlers
const loadingHandlers = [
  http.get(`${baseUrl}/api/tasks/:id`, () => {
    // Never resolve to simulate loading
    return new Response(null, { status: 200 });
  })
];

// Delete error handlers
const deleteErrorHandlers = [
  ...defaultHandlers.filter(handler => 
    // @ts-ignore - MSW typing issue
    !handler.info.path.includes('/api/tasks/:id') || 
    // @ts-ignore - MSW typing issue
    handler.info.method !== 'DELETE'
  ),
  http.delete(`${baseUrl}/api/tasks/:id`, () => {
    return HttpResponse.json({
      message: 'You do not have permission to delete this task'
    }, { status: 403 });
  })
];

const meta: Meta<typeof TaskDetailPage> = {
  title: 'Pages/TaskDetailPage',
  component: TaskDetailPage,
  decorators: [createDecorator()],
  parameters: {
    msw: {
      handlers: defaultHandlers
    },
    layout: 'fullscreen',
    // Mock router params
    reactRouter: {
      routePath: '/tasks/:id',
      routeParams: { id: 'task123' }
    }
  },
};

export default meta;
type Story = StoryObj<typeof TaskDetailPage>;

// Define stories
export const Default: Story = {
  parameters: {
    reactRouter: {
      routePath: '/tasks/:id',
      routeParams: { id: 'task123' }
    }
  }
};

export const CompletedTask: Story = {
  parameters: {
    reactRouter: {
      routePath: '/tasks/:id',
      routeParams: { id: 'task456' }
    }
  }
};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: loadingHandlers
    },
    reactRouter: {
      routePath: '/tasks/:id',
      routeParams: { id: 'loading' }
    }
  }
};

export const Error: Story = {
  parameters: {
    msw: {
      handlers: errorHandlers
    },
    reactRouter: {
      routePath: '/tasks/:id',
      routeParams: { id: 'error' }
    }
  }
};

export const NotFound: Story = {
  parameters: {
    msw: {
      handlers: notFoundHandlers
    },
    reactRouter: {
      routePath: '/tasks/:id',
      routeParams: { id: 'notfound' }
    }
  }
};

export const DeleteError: Story = {
  parameters: {
    msw: {
      handlers: deleteErrorHandlers
    },
    reactRouter: {
      routePath: '/tasks/:id',
      routeParams: { id: 'task123' }
    }
  }
};

export const AdminView: Story = {
  decorators: [createDecorator(mockAdminUser)],
  parameters: {
    reactRouter: {
      routePath: '/tasks/:id',
      routeParams: { id: 'task123' }
    }
  }
};
