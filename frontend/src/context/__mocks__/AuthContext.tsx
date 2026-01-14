import React, { createContext, useContext, ReactNode } from 'react';

// Define user type
export interface User {
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
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<any>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  updateUser: (userData: Partial<User>) => Promise<void>;
  verifyEmail: (token: string) => Promise<any>;
  resendVerificationEmail: (email: string) => Promise<any>;
  googleLogin: (token: string) => Promise<void>;
}

// Create the context with a default value
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

// Mock provider that can be configured
export const AuthProvider: React.FC<{ children: ReactNode; value?: AuthContextType }> = ({ children, value }) => {
  const defaultValue: AuthContextType = {
    user: {
      _id: 'user1',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user'
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
  };

  return (
    <AuthContext.Provider value={value || defaultValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  console.log('🔐 Mock useAuth called:', { user: context.user, token: context.token });
  return context;
};
