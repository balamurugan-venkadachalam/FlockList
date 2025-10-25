import { StoryObj, Meta } from '@storybook/react';
import FlockDetailPage from './FlockDetailPage';
import React, { createContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import { http, delay } from 'msw';

// Import handlers from our modular MSW setup
import { flockHandlers, flockNotFoundHandler, flockDetailErrorHandler, flockLoadingHandler } from '../mocks/handlers';

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

// Mock the useAuth hook at the module level
const mockUseAuth = (user: AuthContextType) => {
  // Store the mock in a way that can be accessed by the component
  (window as any).__STORYBOOK_AUTH_MOCK__ = user;
  return user;
};

// Helper function to create a story decorator with the appropriate context
const createDecorator = (user = mockRegularUser) => {
  return (Story: React.ComponentType, context: any): React.ReactElement => {
    console.log('FlockDetailPage Story - Auth Mock:', { 
      user: user.user, 
      token: user.token,
      isAuthenticated: user.isAuthenticated 
    });
    
    // Set up the mock before rendering
    mockUseAuth(user);
    
    return (
      <AuthContext.Provider value={user}>
        {/* Wrap in Routes to handle the :id parameter */}
        <Routes>
          <Route path="/flocks/:id" element={<FlockDetailPage />} />
        </Routes>
      </AuthContext.Provider>
    );
  };
};

// Note: We don't need to define mockFlock here as we're using the handlers from flockHandlers.ts

// We're using flockLoadingHandler imported from mocks/handlers/flockHandlers.ts

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
      routeParams: { id: 'flock1' },
      location: '/flocks/flock1'
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
      routeParams: { id: 'flock1' },
      location: '/flocks/flock1'
    }
  }
};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [flockLoadingHandler]
    },
    reactRouter: {
      routePath: '/flocks/:id',
      routeParams: { id: 'loading' },
      location: '/flocks/loading'
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
      routeParams: { id: 'notfound' },
      location: '/flocks/notfound'
    }
  }
};

export const Error: Story = {
  parameters: {
    msw: {
      handlers: [flockDetailErrorHandler]
    },
    reactRouter: {
      routePath: '/flocks/:id',
      routeParams: { id: 'error' },
      location: '/flocks/error'
    }
  }
};

export const AdminView: Story = {
  decorators: [createDecorator(mockAdminUser)],
  parameters: {
    reactRouter: {
      routePath: '/flocks/:id',
      routeParams: { id: 'flock1' },
      location: '/flocks/flock1'
    }
  }
};
