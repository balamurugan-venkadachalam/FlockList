import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import * as AuthContext from '../../context/AuthContext';

// Mock the useAuth hook
vi.mock('../../context/AuthContext', () => {
  const original = vi.importActual('../../context/AuthContext');
  return {
    ...original,
    useAuth: vi.fn()
  };
});

describe('ProtectedRoute', () => {
  // Setup routes to test redirection
  const renderWithAuth = (authState: any, roles?: string[]) => {
    // Mock the useAuth hook
    vi.mocked(AuthContext.useAuth).mockReturnValue(authState);

    return render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/unauthorized" element={<div>Unauthorized Page</div>} />
          <Route path="/protected" element={<ProtectedRoute roles={roles} />}>
            <Route index element={<div>Protected Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state when authentication is in progress', () => {
    // Mock loading state
    renderWithAuth({
      isLoading: true,
      user: null,
      token: null,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      googleLogin: vi.fn(),
      clearError: vi.fn()
    });
    
    expect(screen.getByText('Authenticating...')).toBeInTheDocument();
  });

  it('redirects to login page when user is not authenticated', () => {
    // Mock unauthenticated state
    renderWithAuth({
      isLoading: false,
      user: null,
      token: null,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      googleLogin: vi.fn(),
      clearError: vi.fn()
    });
    
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('redirects to unauthorized page when user does not have required role', () => {
    // Mock authenticated user with insufficient role
    renderWithAuth({
      isLoading: false,
      user: {
        _id: '1',
        email: 'user@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'child'
      },
      token: 'test-token',
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      googleLogin: vi.fn(),
      clearError: vi.fn()
    }, ['parent']);
    
    expect(screen.getByText('Unauthorized Page')).toBeInTheDocument();
  });

  it('renders protected content when user is authenticated with required role', () => {
    // Mock authenticated user with required role
    renderWithAuth({
      isLoading: false,
      user: {
        _id: '1',
        email: 'user@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'parent'
      },
      token: 'test-token',
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      googleLogin: vi.fn(),
      clearError: vi.fn()
    }, ['parent']);
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders protected content when no specific roles are required', () => {
    // Mock authenticated user
    renderWithAuth({
      isLoading: false,
      user: {
        _id: '1',
        email: 'user@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'child'
      },
      token: 'test-token',
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      googleLogin: vi.fn(),
      clearError: vi.fn()
    });
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
}); 