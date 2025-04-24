import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

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
  isLoading: true,
  login: async () => {},
  register: async () => ({}),
  logout: async () => {},
  isAuthenticated: false,
  updateUser: async () => {},
  verifyEmail: async () => ({}),
  resendVerificationEmail: async () => ({}),
  googleLogin: async () => {}
});

// Create provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Add this method to mark a user as verified
  const updateUser = async (userData: Partial<User>): Promise<void> => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const response = await api.get('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setUser(response.data.user);
        } catch (error) {
          console.error('Error fetching user:', error);
          setToken(null);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [token]);

  // Login method
  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      
      // Check if email verification is required
      if (response.data.requireEmailVerification) {
        return Promise.reject({
          requireEmailVerification: true,
          message: response.data.message,
          email
        });
      }
      
      setUser(response.data.user);
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.response?.data?.requireEmailVerification) {
        return Promise.reject({
          requireEmailVerification: true,
          message: error.response.data.message,
          email
        });
      }
      return Promise.reject(error);
    }
  };

  // Google login method
  const googleLogin = async (token: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await api.post('/api/auth/google', { token });
      
      setUser(response.data.user);
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
    } catch (error) {
      console.error('Google login error:', error);
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Register method
  const register = async (userData: any): Promise<any> => {
    try {
      const response = await api.post('/api/auth/register', userData);
      
      // If email verification is required, return success but don't log in
      if (response.data.requireEmailVerification) {
        return {
          requireEmailVerification: true,
          message: response.data.message,
          email: userData.email
        };
      }
      
      setUser(response.data.user);
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      return Promise.reject(error);
    }
  };

  // Email verification method
  const verifyEmail = async (token: string): Promise<any> => {
    try {
      const response = await api.get(`/api/auth/verify-email?token=${token}`);
      
      // If verification successful and we have a token, log the user in
      if (response.data.token) {
        setUser(response.data.user);
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      console.error('Email verification error:', error);
      return Promise.reject(error);
    }
  };

  // Resend verification email
  const resendVerificationEmail = async (email: string): Promise<any> => {
    try {
      const response = await api.post('/api/auth/resend-verification', { email });
      return response.data;
    } catch (error) {
      console.error('Resend verification error:', error);
      return Promise.reject(error);
    }
  };

  // Logout method
  const logout = async (): Promise<void> => {
    try {
      if (token) {
        await api.post('/api/auth/logout', null, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
      
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
    }
  };

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token,
    updateUser,
    verifyEmail,
    resendVerificationEmail,
    googleLogin
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the context
export const useAuth = () => useContext(AuthContext); 