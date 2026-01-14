import { StoryObj, Meta } from '@storybook/react';
import NotificationPreferencesPage from './NotificationPreferencesPage';
import React, { createContext } from 'react';
import { http, HttpResponse } from 'msw';

// Import handlers from our modular MSW setup
import { notificationHandlers } from '../mocks/handlers';

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
      <Story />
    </AuthContext.Provider>
  );
};

// Mock notification preferences data
const mockPreferences = {
  _id: 'pref1',
  userId: 'user1',
  emailNotifications: {
    taskAssigned: true,
    taskCompleted: true,
    taskDueSoon: true,
    flockInvitation: true,
    taskComment: false
  },
  pushNotifications: {
    taskAssigned: true,
    taskCompleted: false,
    taskDueSoon: true,
    flockInvitation: true,
    taskComment: true
  },
  updatedAt: '2023-11-01T00:00:00.000Z'
};

// Custom handlers for notification preferences
const preferencesHandlers = [
  // GET /api/users/preferences/notifications - Get notification preferences
  http.get(`${baseUrl}/api/users/preferences/notifications`, () => {
    return HttpResponse.json(
      mockPreferences,
      { status: 200 }
    );
  }),
  
  // PUT /api/users/preferences/notifications - Update notification preferences
  http.put(`${baseUrl}/api/users/preferences/notifications`, async ({ request }) => {
    const body = await request.json();
    
    return HttpResponse.json(
      {
        ...mockPreferences,
        ...body,
        updatedAt: new Date().toISOString()
      },
      { status: 200 }
    );
  })
];

// Loading handler
const loadingHandler = http.get(`${baseUrl}/api/users/preferences/notifications`, () => {
  // Never resolve to simulate loading
  return new Response(null, { status: 200 });
});

// Error handler
const errorHandler = http.get(`${baseUrl}/api/users/preferences/notifications`, () => {
  return HttpResponse.json(
    { message: 'Internal server error' },
    { status: 500 }
  );
});

// Update error handler
const updateErrorHandler = http.put(`${baseUrl}/api/users/preferences/notifications`, () => {
  return HttpResponse.json(
    { message: 'Failed to update preferences' },
    { status: 500 }
  );
});

const meta: Meta<typeof NotificationPreferencesPage> = {
  title: 'Pages/NotificationPreferencesPage',
  component: NotificationPreferencesPage,
  decorators: [createDecorator()],
  parameters: {
    msw: {
      handlers: [...notificationHandlers, ...preferencesHandlers]
    },
    layout: 'fullscreen'
  },
};

export default meta;
type Story = StoryObj<typeof NotificationPreferencesPage>;

// Define stories
export const Default: Story = {};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [loadingHandler]
    }
  }
};

export const Error: Story = {
  parameters: {
    msw: {
      handlers: [errorHandler]
    }
  }
};

export const UpdateError: Story = {
  parameters: {
    msw: {
      handlers: [
        // Use only GET handler from preferencesHandlers and add updateErrorHandler
        preferencesHandlers[0],
        updateErrorHandler
      ]
    }
  }
};

export const AdminView: Story = {
  decorators: [createDecorator(mockAdminUser)]
};
