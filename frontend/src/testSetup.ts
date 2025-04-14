import { vi } from 'vitest';
import React, { createContext, useContext, ReactNode } from 'react';

// Define the mock context type
interface MockContextType {
  user: null;
  token: null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  clearError: () => void;
}

// Create a mock context value
export const createMockContext = (overrides: Partial<MockContextType> = {}): MockContextType => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,
  login: vi.fn().mockResolvedValue(undefined),
  register: vi.fn().mockResolvedValue(undefined),
  logout: vi.fn().mockResolvedValue(undefined),
  googleLogin: vi.fn().mockResolvedValue(undefined),
  clearError: vi.fn(),
  ...overrides
});

// Create a mock context
const MockAuthContext = createContext<MockContextType | null>(null);

// Define the mock provider props
interface MockAuthProviderProps {
  children: ReactNode;
  value?: MockContextType;
}

// Create a mock provider component
export const MockAuthProvider = ({ children, value = createMockContext() }: MockAuthProviderProps) => {
  return React.createElement(MockAuthContext.Provider, { value }, children);
};

// Mock the AuthContext module
vi.mock('./context/AuthContext', () => ({
  useAuth: () => {
    const context = useContext(MockAuthContext);
    if (!context) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
  },
  AuthProvider: MockAuthProvider,
})); 