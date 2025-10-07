import { StoryObj, Meta } from '@storybook/react';
import Login from './Login';
import React, { createContext } from 'react';
import { http, delay } from 'msw';

// Import handlers from our modular MSW setup
import { authHandlers } from '../mocks/handlers';

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
  isLoading: false, // Explicitly set to false to prevent loading state
  login: async () => {},
  register: async () => ({}),
  logout: async () => {},
  isAuthenticated: false,
  updateUser: async () => {},
  verifyEmail: async () => ({}),
  resendVerificationEmail: async () => ({}),
  googleLogin: async () => {}
});

// Create mock auth state
const createAuthState = (isAuthenticated: boolean): AuthContextType => ({
  user: isAuthenticated ? {
    _id: 'user1',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'user',
    isEmailVerified: true
  } : null,
  token: isAuthenticated ? 'mock-token' : null,
  isLoading: false, // Ensure this is false so the login button doesn't show loading state
  login: async () => {},
  register: async () => ({}),
  logout: async () => {},
  isAuthenticated,
  updateUser: async () => {},
  verifyEmail: async () => ({}),
  resendVerificationEmail: async () => ({}),
  googleLogin: async () => {}
});

// Helper function to create a story decorator with the appropriate context
const createDecorator = (isAuthenticated = false) => {
  return (Story: React.ComponentType): React.ReactElement => (
    <AuthContext.Provider value={createAuthState(isAuthenticated)}>
      <Story />
    </AuthContext.Provider>
  );
};

// Custom handlers for login scenarios
const loginSuccessHandler = http.post(`${baseUrl}/api/auth/login`, async () => {
  await delay(300);
  return Response.json({
    message: 'Login successful',
    user: {
      _id: 'user1',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user',
      isEmailVerified: true
    },
    token: 'mock-token'
  }, { status: 200 });
});

const loginErrorHandler = http.post(`${baseUrl}/api/auth/login`, async () => {
  return Response.json({
    message: 'Authentication failed - invalid credentials'
  }, { status: 401 });
});

const loginServerErrorHandler = http.post(`${baseUrl}/api/auth/login`, async () => {
  return Response.json({
    message: 'Internal server error'
  }, { status: 500 });
});

// Loading handler
const loadingHandler = http.post(`${baseUrl}/api/auth/login`, async () => {
  // Never resolve to simulate loading
  await new Promise(() => {});
  return new Response(null);
});

const meta: Meta<typeof Login> = {
  title: 'Pages/Login',
  component: Login,
  decorators: [createDecorator()],
  parameters: {
    msw: {
      handlers: [loginSuccessHandler, ...authHandlers.filter(handler => 
        // @ts-ignore - MSW typing issue
        !(handler.info.path.includes('/api/auth/login') && handler.info.method === 'POST')
      )]
    },
    layout: 'fullscreen',
    // Mock router for navigation
    reactRouter: {
      routePath: '/login',
      browserPath: '/login',
      searchParams: {}
    }
  },
};

export default meta;
type Story = StoryObj<typeof Login>;

// Define stories
export const Default: Story = {};

export const WithError: Story = {
  parameters: {
    msw: {
      handlers: [loginErrorHandler]
    }
  }
};

export const WithServerError: Story = {
  parameters: {
    msw: {
      handlers: [loginServerErrorHandler]
    }
  }
};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [loadingHandler]
    }
  }
};

export const AlreadyLoggedIn: Story = {
  decorators: [createDecorator(true)],
  parameters: {
    reactRouter: {
      routePath: '/login',
      browserPath: '/login',
      searchParams: { redirect: '/dashboard' }
    }
  }
};
