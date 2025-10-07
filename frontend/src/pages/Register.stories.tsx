import { StoryObj, Meta } from '@storybook/react';
import Register from './Register';
import React, { createContext } from 'react';
import { http } from 'msw';

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
  isLoading: false,
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

// Custom handlers for registration scenarios

const registerEmailExistsHandler = http.post(`${baseUrl}/api/auth/register`, async () => {
  return Response.json({
    message: 'Email already in use'
  }, { status: 409 });
});

const registerServerErrorHandler = http.post(`${baseUrl}/api/auth/register`, async () => {
  return Response.json({
    message: 'Internal server error'
  }, { status: 500 });
});

// Loading handler
const loadingHandler = http.post(`${baseUrl}/api/auth/register`, async () => {
  // Never resolve to simulate loading
  await new Promise(() => {});
  return new Response(null);
});

const meta: Meta<typeof Register> = {
  title: 'Pages/Register',
  component: Register,
  decorators: [createDecorator()],
  parameters: {
    msw: {
      handlers: authHandlers
    },
    layout: 'fullscreen',
    // Mock router for navigation
    reactRouter: {
      routePath: '/register',
      browserPath: '/register',
      searchParams: {}
    }
  },
};

export default meta;
type Story = StoryObj<typeof Register>;

// Define stories
export const Default: Story = {};

export const WithEmailExistsError: Story = {
  parameters: {
    msw: {
      handlers: [registerEmailExistsHandler]
    }
  }
};

export const WithServerError: Story = {
  parameters: {
    msw: {
      handlers: [registerServerErrorHandler]
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
      routePath: '/register',
      browserPath: '/register',
      searchParams: { redirect: '/dashboard' }
    }
  }
};
