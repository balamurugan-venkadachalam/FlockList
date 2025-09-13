import { StoryObj, Meta } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import TasksPage from '../pages/TasksPage';
import { Task, TaskListResponse } from '../types/models/task';
import React, { createContext } from 'react';
import { vi } from 'vitest';

// Mock the taskService
import * as taskService from '../services/taskService';

// Mock the getTasks function
vi.mock('../services/taskService', () => ({
  getTasks: vi.fn(),
}));

// Define interfaces for mock data
interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

// Interface for the context
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
    flock: {
      _id: 'flock1',
      name: 'Development Team'
    }
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
    flock: {
      _id: 'flock1',
      name: 'Development Team'
    }
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
    flock: {
      _id: 'flock1',
      name: 'Development Team'
    }
  },
];

// Mock user data with full AuthContextType interface
const mockRegularUser: AuthContextType = {
  user: {
    _id: 'user1',
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'user'
  },
  token: 'mock-token',
  isLoading: false,
  login: async (): Promise<void> => {},
  register: async (): Promise<Record<string, unknown>> => ({}),
  logout: async (): Promise<void> => {},
  isAuthenticated: true,
  updateUser: async (): Promise<void> => {},
  verifyEmail: async (): Promise<Record<string, unknown>> => ({}),
  resendVerificationEmail: async (): Promise<Record<string, unknown>> => ({}),
  googleLogin: async (): Promise<void> => {}
};

const mockAdminUser: AuthContextType = {
  user: {
    _id: 'admin1',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin'
  },
  token: 'mock-token',
  isLoading: false,
  login: async (): Promise<void> => {},
  register: async (): Promise<Record<string, unknown>> => ({}),
  logout: async (): Promise<void> => {},
  isAuthenticated: true,
  updateUser: async (): Promise<void> => {},
  verifyEmail: async (): Promise<Record<string, unknown>> => ({}),
  resendVerificationEmail: async (): Promise<Record<string, unknown>> => ({}),
  googleLogin: async (): Promise<void> => {}
};

/**
 * Sets up the mock getTasks function to return filtered tasks
 * based on the provided status parameter
 */
const setupMockGetTasks = (): void => {
  // Original implementation from taskService
  window.getTasks = async (params?: { status?: string }): Promise<TaskListResponse> => {
    const filteredTasks = params?.status 
      ? mockTasks.filter(task => task.status === params.status)
      : mockTasks;
    
    return {
      tasks: filteredTasks,
      pagination: {
        total: filteredTasks.length,
        limit: 10,
        offset: 0,
        hasMore: false,
      },
    };
  };
};

// Mock the original module
const meta: Meta<typeof TasksPage> = {
  title: 'Pages/TasksPage',
  component: TasksPage,
  decorators: [
    (Story): React.ReactElement => {
      // Setup mock before rendering
      setupMockGetTasks();
      
      return (
        <MemoryRouter initialEntries={["/tasks"]}>
          <AuthContext.Provider value={mockRegularUser}>
            <Story />
          </AuthContext.Provider>
        </MemoryRouter>
      );
    },
  ],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof TasksPage>;

// Define stories
export const Default: Story = {};

export const LoadingState: Story = {
  decorators: [
    (Story): React.ReactElement => {
      // Override getTasks to return a never-resolving promise for loading state
      window.getTasks = (): Promise<TaskListResponse> => new Promise(() => {});
      return (
        <MemoryRouter initialEntries={["/tasks"]}>
          <AuthContext.Provider value={mockRegularUser}>
            <Story />
          </AuthContext.Provider>
        </MemoryRouter>
      );
    },
  ],
};

export const ErrorState: Story = {
  decorators: [
    (Story): React.ReactElement => {
      // Override getTasks to return a rejected promise for error state
      window.getTasks = (): Promise<TaskListResponse> => Promise.reject({ message: 'Failed to fetch tasks' });
      return (
        <MemoryRouter initialEntries={["/tasks"]}>
          <AuthContext.Provider value={mockRegularUser}>
            <Story />
          </AuthContext.Provider>
        </MemoryRouter>
      );
    },
  ],
};

export const EmptyState: Story = {
  decorators: [
    (Story): React.ReactElement => {
      // Override getTasks to return empty tasks array
      window.getTasks = async (): Promise<TaskListResponse> => ({
        tasks: [],
        pagination: {
          total: 0,
          limit: 10,
          offset: 0,
          hasMore: false,
        },
      });
      return (
        <MemoryRouter initialEntries={["/tasks"]}>
          <AuthContext.Provider value={mockRegularUser}>
            <Story />
          </AuthContext.Provider>
        </MemoryRouter>
      );
    },
  ],
};

export const WithSuccessNotification: Story = {
  decorators: [
    (Story): React.ReactElement => {
      setupMockGetTasks();
      // Create a custom router with notification in state
      const RouterWithNotification = ({ children }: { children: React.ReactNode }): React.ReactElement => {
        return (
          <MemoryRouter initialEntries={["/tasks"]} initialIndex={0}>
            {children}
          </MemoryRouter>
        );
      };
      
      // Mock the useLocation hook to return notification state
      window.history.replaceState(
        { notification: { type: 'success', message: 'Task created successfully!' } },
        ''
      );
      
      return (
        <RouterWithNotification>
          <AuthContext.Provider value={mockRegularUser}>
            <Story />
          </AuthContext.Provider>
        </RouterWithNotification>
      );
    },
  ],
};

export const AdminUserView: Story = {
  decorators: [
    (Story): React.ReactElement => {
      setupMockGetTasks();
      return (
        <MemoryRouter initialEntries={["/tasks"]}>
          <AuthContext.Provider value={mockAdminUser}>
            <Story />
          </AuthContext.Provider>
        </MemoryRouter>
      );
    },
  ],
};

export const FilteredByStatus: Story = {
  decorators: [
    (Story): React.ReactElement => {
      // Override getTasks to filter by status
      window.getTasks = async (params?: { status?: string }): Promise<TaskListResponse> => {
        const filteredTasks = params?.status 
          ? mockTasks.filter(task => task.status === params.status)
          : mockTasks;
        
        return {
          tasks: filteredTasks,
          pagination: {
            total: filteredTasks.length,
            limit: 10,
            offset: 0,
            hasMore: false,
          },
        };
      };
      return (
        <MemoryRouter initialEntries={["/tasks"]}>
          <AuthContext.Provider value={mockRegularUser}>
            <Story />
          </AuthContext.Provider>
        </MemoryRouter>
      );
    },
  ],
};
