import { StoryObj, Meta } from '@storybook/react';
import FlockDetailPage from './FlockDetailPage';
import React, { createContext } from 'react';
import { http } from 'msw';
import { ToastProvider } from '../components/ui/shadcn/toast-provider';

// Import handlers from our modular MSW setup
import { flockHandlers, flockNotFoundHandler, flocksErrorHandler } from '../mocks/handlers';

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

// Note: We don't need to define mockFlock here as we're using the handlers from flockHandlers.ts

// Loading handlers
const loadingHandler = http.get(`${baseUrl}/api/flocks/:id`, () => {
  // Never resolve to simulate loading
  return new Response(null, { status: 200 });
});

const meta: Meta<typeof FlockDetailPage> = {
  title: 'Pages/FlockDetailPage',
  component: FlockDetailPage,
  decorators: [createDecorator()],
  parameters: {
    msw: {
      handlers: flockHandlers
    },
    layout: 'fullscreen',
    // Mock router params
    reactRouter: {
      routePath: '/flocks/:id',
      routeParams: { id: 'flock1' }
    }
  },
};

export default meta;
type Story = StoryObj<typeof FlockDetailPage>;

// Define stories
export const Default: Story = {
  parameters: {
    reactRouter: {
      routePath: '/flocks/:id',
      routeParams: { id: 'flock1' }
    }
  }
};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [loadingHandler]
    },
    reactRouter: {
      routePath: '/flocks/:id',
      routeParams: { id: 'loading' }
    }
  }
};

export const NotFound: Story = {
  parameters: {
    msw: {
      handlers: [flockNotFoundHandler]
    },
    reactRouter: {
      routePath: '/flocks/:id',
      routeParams: { id: 'notfound' }
    }
  }
};

export const Error: Story = {
  parameters: {
    msw: {
      handlers: [flocksErrorHandler]
    },
    reactRouter: {
      routePath: '/flocks/:id',
      routeParams: { id: 'error' }
    }
  }
};

export const AdminView: Story = {
  decorators: [createDecorator(mockAdminUser)],
  parameters: {
    reactRouter: {
      routePath: '/flocks/:id',
      routeParams: { id: 'flock1' }
    }
  }
};
