import React, { createContext } from 'react';

/**
 * Utility functions and types for creating Storybook stories
 * with consistent auth context and MSW handlers
 */

// User interface based on API schema
export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  profilePicture?: string;
  isEmailVerified?: boolean;
}

// Auth context interface
export interface AuthContextType {
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
export const StoryAuthContext = createContext<AuthContextType>({
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

/**
 * Create mock users with different roles
 */
export const createMockUser = (role: string): User => ({
  _id: role === 'admin' ? 'admin1' : 'user1',
  email: `${role}@example.com`,
  firstName: role === 'admin' ? 'Admin' : 'John',
  lastName: role === 'admin' ? 'User' : 'Doe',
  role,
  isEmailVerified: true
});

/**
 * Create mock auth state for stories
 */
export const createAuthState = (options: {
  isAuthenticated?: boolean;
  isLoading?: boolean;
  role?: string;
} = {}): AuthContextType => {
  const { 
    isAuthenticated = false, 
    isLoading = false,
    role = 'user'
  } = options;
  
  return {
    user: isAuthenticated ? createMockUser(role) : null,
    token: isAuthenticated ? 'mock-token' : null,
    isLoading,
    login: async () => {},
    register: async () => ({}),
    logout: async () => {},
    isAuthenticated,
    updateUser: async () => {},
    verifyEmail: async () => ({}),
    resendVerificationEmail: async () => ({}),
    googleLogin: async () => {}
  };
};

/**
 * Create a story decorator with the appropriate auth context
 */
export const createAuthDecorator = (options: {
  isAuthenticated?: boolean;
  isLoading?: boolean;
  role?: string;
} = {}) => {
  return (Story: React.ComponentType): React.ReactElement => (
    <StoryAuthContext.Provider value={createAuthState(options)}>
      <Story />
    </StoryAuthContext.Provider>
  );
};

/**
 * Helper function to filter handlers by method and path
 * Useful for replacing specific handlers in stories
 */
export const filterHandlers = (handlers: any[], methodToExclude: string, pathToExclude: string) => {
  return handlers.filter(handler => {
    try {
      // @ts-ignore - MSW typing issue
      return handler.info.method !== methodToExclude || !handler.info.path.includes(pathToExclude);
    } catch (error) {
      // If handler doesn't have info property, keep it
      return true;
    }
  });
};

/**
 * Base URL for API endpoints
 */
export const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
