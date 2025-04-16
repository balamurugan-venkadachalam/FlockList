import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegisterForm from '../../../components/auth/RegisterForm';
import { useAuth } from '../../../context/AuthContext';
import type { AuthContextType } from '../../../context/AuthContext';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: (props: any) => <a {...props} />,
  };
});

// Mock AuthContext
vi.mock('../../../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

describe('RegisterForm', () => {
  const mockRegister = vi.fn();
  const mockGoogleLogin = vi.fn();
  const mockClearError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    const mockAuthContext: AuthContextType = {
      register: mockRegister,
      googleLogin: mockGoogleLogin,
      error: null,
      isLoading: false,
      clearError: mockClearError,
      user: null,
      token: null,
      login: vi.fn(),
      logout: vi.fn(),
    };
    vi.mocked(useAuth).mockReturnValue(mockAuthContext);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  const renderRegisterForm = () => {
    return render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    );
  };

  it('renders register form with all required fields', () => {
    renderRegisterForm();
    expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /role/i })).toBeInTheDocument();
    
    // Check for password fields directly in the DOM since they have type="password" not textbox role
    const passwordField = document.querySelector('input[name="password"]');
    const confirmPasswordField = document.querySelector('input[name="confirmPassword"]');
    
    expect(passwordField).not.toBeNull();
    expect(confirmPasswordField).not.toBeNull();
    
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('handles input changes correctly', () => {
    renderRegisterForm();
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
    
    const roleSelect = screen.getByRole('combobox', { name: /role/i });
    fireEvent.mouseDown(roleSelect);
    
    const passwordField = document.querySelector('input[name="password"]');
    const confirmPasswordField = document.querySelector('input[name="confirmPassword"]');
    
    if (passwordField) {
      fireEvent.change(passwordField, { target: { value: 'password123' } });
    }
    
    if (confirmPasswordField) {
      fireEvent.change(confirmPasswordField, { target: { value: 'password123' } });
    }
    
    expect(screen.getByLabelText(/first name/i)).toHaveValue('John');
    expect(screen.getByLabelText(/last name/i)).toHaveValue('Doe');
    expect(screen.getByLabelText(/email/i)).toHaveValue('john@example.com');
    
    if (passwordField) {
      expect(passwordField).toHaveValue('password123');
    }
    
    if (confirmPasswordField) {
      expect(confirmPasswordField).toHaveValue('password123');
    }
  });

  it('shows loading state during form submission', () => {
    vi.mocked(useAuth).mockReturnValue({
      ...vi.mocked(useAuth)(),
      isLoading: true
    });
    renderRegisterForm();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /register/i })).not.toBeInTheDocument();
  });

  it('displays error message when registration fails', () => {
    vi.mocked(useAuth).mockReturnValue({
      ...vi.mocked(useAuth)(),
      error: 'Registration failed'
    });
    renderRegisterForm();
    expect(screen.getByText('Registration failed')).toBeInTheDocument();
  });

  it('clears error when clicking on error alert close button', () => {
    vi.mocked(useAuth).mockReturnValue({
      ...vi.mocked(useAuth)(),
      error: 'Registration failed'
    });
    renderRegisterForm();
    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);
    expect(mockClearError).toHaveBeenCalledTimes(1);
  });

  it('submits form with correct data', async () => {
    renderRegisterForm();
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
    
    const passwordField = document.querySelector('input[name="password"]');
    const confirmPasswordField = document.querySelector('input[name="confirmPassword"]');
    
    if (passwordField) {
      fireEvent.change(passwordField, { target: { value: 'password123' } });
    }
    
    if (confirmPasswordField) {
      fireEvent.change(confirmPasswordField, { target: { value: 'password123' } });
    }
    
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'parent',
      });
    });
  });

  it('shows loading state for Google Sign-In button when script is loading', () => {
    renderRegisterForm();
    expect(screen.getByText('Loading Google Sign-In...')).toBeInTheDocument();
  });
}); 