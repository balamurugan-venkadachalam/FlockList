import { StoryObj, Meta } from '@storybook/react';
import TaskDetailPage from './TaskDetailPage';
import React, { createContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastProvider } from '../components/ui/shadcn/toast-provider';

// Import shared MSW handlers
import { 
  taskHandlers,
  getTaskByIdErrorHandler,
  getTaskByIdNotFoundHandler,
  getTaskByIdLoadingHandler,
  deleteTaskErrorHandler
} from '../mocks/handlers/taskHandlers';

// Define User interface to match what the component expects
interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  profilePicture?: string;
  isEmailVerified?: boolean;
}

// Define AuthContextType to match the actual context
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<any>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  updateUser: (userData: Partial<User>) => Promise<void>;
  verifyEmail: (token: string) => Promise<any>;
  resendVerificationEmail: (email: string) => Promise<any>;
  googleLogin: (token: string) => Promise<void>;
}

// Create a context for Storybook that matches the actual AuthContext
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

// Create mock users with proper structure
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
  return (Story: React.ComponentType, context: any): React.ReactElement => {
    // Get the task ID from the story parameters
    const taskId = context?.parameters?.reactRouter?.routeParams?.id || 'task1';
    
    return (
      <AuthContext.Provider value={user}>
        <ToastProvider>
          {/* Wrap in Routes to handle the :id parameter */}
          <Routes>
            <Route path="/tasks/:id" element={<TaskDetailPage />} />
          </Routes>
        </ToastProvider>
      </AuthContext.Provider>
    );
  };
};

/**
 * Storybook Meta configuration for TaskDetailPage
 * 
 * This configures the TaskDetailPage stories with proper context providers,
 * MSW handlers for API mocking, and router parameters.
 */
const meta: Meta<typeof TaskDetailPage> = {
  title: 'Pages/TaskDetailPage',
  component: TaskDetailPage,
  decorators: [createDecorator()],
  parameters: {
    // Configure MSW handlers for API mocking - using shared handlers
    msw: {
      handlers: taskHandlers
    },
    // Use fullscreen layout for page components
    layout: 'fullscreen',
    // Configure the router to navigate to the task detail route
    reactRouter: {
      routePath: '/tasks/:id',
      routeParams: { id: 'task1' },
      location: '/tasks/task1'
    },
    // Add documentation
    docs: {
      description: {
        component: 'TaskDetailPage displays detailed information about a specific task, including status, assignees, and actions.'
      }
    }
  },
  // Add argTypes for any props (TaskDetailPage doesn't have props, but this is for documentation)
  argTypes: {}
};

export default meta;
type Story = StoryObj<typeof TaskDetailPage>;

/**
 * Story variants for TaskDetailPage
 * Each story represents a different state or scenario for the component
 */

// Default story - Pending task view (task1)
export const Default: Story = {
  parameters: {
    reactRouter: {
      routePath: '/tasks/:id',
      routeParams: { id: 'task1' },
      location: '/tasks/task1'
    },
    docs: {
      description: {
        story: 'Default view of a pending task with all details and actions available.'
      }
    }
  }
};

// In Progress task view (task2)
export const InProgressTask: Story = {
  parameters: {
    reactRouter: {
      routePath: '/tasks/:id',
      routeParams: { id: 'task2' },
      location: '/tasks/task2'
    },
    docs: {
      description: {
        story: 'View of a task that is currently in progress.'
      }
    }
  }
};

// Completed task view (task3)
export const CompletedTask: Story = {
  parameters: {
    reactRouter: {
      routePath: '/tasks/:id',
      routeParams: { id: 'task3' },
      location: '/tasks/task3'
    },
    docs: {
      description: {
        story: 'View of a completed task showing completion details and available actions.'
      }
    }
  }
};

// Loading state
export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [getTaskByIdLoadingHandler]
    },
    reactRouter: {
      routePath: '/tasks/:id',
      routeParams: { id: 'loading' },
      location: '/tasks/loading'
    },
    docs: {
      description: {
        story: 'Loading state while task data is being fetched from the API.'
      }
    }
  }
};

// Error state
export const Error: Story = {
  parameters: {
    msw: {
      handlers: [getTaskByIdErrorHandler]
    },
    reactRouter: {
      routePath: '/tasks/:id',
      routeParams: { id: 'error' },
      location: '/tasks/error'
    },
    docs: {
      description: {
        story: 'Error state when the API returns a server error.'
      }
    }
  }
};

// Not found state
export const NotFound: Story = {
  parameters: {
    msw: {
      handlers: [getTaskByIdNotFoundHandler]
    },
    reactRouter: {
      routePath: '/tasks/:id',
      routeParams: { id: 'notfound' },
      location: '/tasks/notfound'
    },
    docs: {
      description: {
        story: 'Not found state when the requested task does not exist.'
      }
    }
  }
};

// Delete error state
export const DeleteError: Story = {
  parameters: {
    msw: {
      handlers: [...taskHandlers, deleteTaskErrorHandler]
    },
    reactRouter: {
      routePath: '/tasks/:id',
      routeParams: { id: 'task1' },
      location: '/tasks/task1'
    },
    docs: {
      description: {
        story: 'Error state when attempting to delete a task without proper permissions.'
      }
    }
  }
};

// Admin user view
export const AdminView: Story = {
  decorators: [createDecorator(mockAdminUser)],
  parameters: {
    reactRouter: {
      routePath: '/tasks/:id',
      routeParams: { id: 'task1' },
      location: '/tasks/task1'
    },
    docs: {
      description: {
        story: 'Task view for an admin user with additional permissions.'
      }
    }
  }
};
