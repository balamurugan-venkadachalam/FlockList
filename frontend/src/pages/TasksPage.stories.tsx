import { StoryObj, Meta } from '@storybook/react';
import TasksPage from '../pages/TasksPage';
import React, { createContext } from 'react';

// Import MSW handlers
import { taskHandlers, getTasksErrorHandler, getTasksEmptyHandler, getTasksLoadingHandler } from '../mocks/handlers/taskHandlers';

// Define interfaces for mock data
interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  profilePicture?: string;
  isEmailVerified?: boolean;
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
      <Story />
    </AuthContext.Provider>
  );
};

// Helper function to create MSW handlers that replace specific endpoints
const createHandlers = (specialHandler: any) => [
  specialHandler,
  // Keep other handlers except the one being replaced
  ...taskHandlers.filter(handler => 
    // @ts-ignore - MSW typing issue
    handler.info.path !== specialHandler.info.path
  )
];

const meta: Meta<typeof TasksPage> = {
  title: 'Pages/TasksPage',
  component: TasksPage,
  decorators: [createDecorator()],
  parameters: {
    msw: { handlers: taskHandlers },
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof TasksPage>;

// Define stories
export const Default: Story = {};

export const LoadingState: Story = {
  parameters: {
    msw: { handlers: createHandlers(getTasksLoadingHandler) }
  }
};

export const ErrorState: Story = {
  parameters: {
    msw: { handlers: createHandlers(getTasksErrorHandler) }
  }
};

export const EmptyState: Story = {
  parameters: {
    msw: { handlers: createHandlers(getTasksEmptyHandler) }
  }
};

export const WithSuccessNotification: Story = {
  decorators: [
    (Story): React.ReactElement => {
      // Mock the useLocation hook to return notification state
      window.history.replaceState(
        { notification: { type: 'success', message: 'Task created successfully!' } },
        ''
      );
      return createDecorator()(Story);
    },
  ],
};

export const AdminUserView: Story = {
  decorators: [createDecorator(mockAdminUser)]
};

export const FilteredByStatus: Story = {};
