import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginForm from '../../../components/auth/LoginForm';
import { useAuth } from '../../../context/AuthContext';
import type { AuthContextType } from '../../../context/AuthContext';

// Mock useLocation and useNavigate hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => ({ state: { from: { pathname: '/dashboard' } } }),
    useNavigate: () => mockNavigate
  };
});

// Mock AuthContext
vi.mock('../../../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

// Add type declarations for Google Sign-In
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

describe('LoginForm', () => {
  const mockLogin = vi.fn();
  const mockGoogleLogin = vi.fn();
  const mockClearError = vi.fn();
  const mockInitialize = vi.fn();
  const mockRenderButton = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock Google Sign-In
    window.google = {
      accounts: {
        id: {
          initialize: mockInitialize,
          renderButton: mockRenderButton,
          prompt: vi.fn(),
        },
      },
    };

    // Mock document.getElementById
    vi.spyOn(document, 'getElementById').mockImplementation((id: string) => {
      if (id === 'googleButton') {
        const div = document.createElement('div');
        div.id = 'googleButton';
        return div;
      }
      return null;
    });

    // Default mock implementation for useAuth
    const mockAuthContext: AuthContextType = {
      login: mockLogin,
      googleLogin: mockGoogleLogin,
      error: null,
      isLoading: false,
      clearError: mockClearError,
      user: null,
      token: null,
      register: vi.fn(),
      logout: vi.fn()
    };
    
    vi.mocked(useAuth).mockReturnValue(mockAuthContext);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    delete window.google;
  });

  const renderLoginForm = () => {
    return render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );
  };

  it('renders login form with all required fields', () => {
    renderLoginForm();
    
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    expect(screen.getByText('Forgot password?')).toBeInTheDocument();
  });

  it('handles input changes correctly', () => {
    renderLoginForm();
    
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('shows loading state during form submission', async () => {
    vi.mocked(useAuth).mockReturnValue({
      ...vi.mocked(useAuth)(),
      isLoading: true
    });

    renderLoginForm();
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /login/i })).not.toBeInTheDocument();
  });

  it('displays error message when login fails', () => {
    vi.mocked(useAuth).mockReturnValue({
      ...vi.mocked(useAuth)(),
      error: 'Invalid credentials'
    });

    renderLoginForm();
    
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  it('clears error when clicking on error alert close button', () => {
    vi.mocked(useAuth).mockReturnValue({
      ...vi.mocked(useAuth)(),
      error: 'Invalid credentials'
    });

    renderLoginForm();
    
    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);
    
    expect(mockClearError).toHaveBeenCalledTimes(1);
  });

  it('submits form with correct credentials', async () => {
    renderLoginForm();
    
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it.skip('loads Google Sign-In script', async () => {
    renderLoginForm();

    // Initially, the loading state should be shown
    expect(screen.getByText('Loading Google Sign-In...')).toBeInTheDocument();

    // Create a mock script element
    const mockScript = document.createElement('script');
    mockScript.src = 'https://accounts.google.com/gsi/client';
    mockScript.async = true;
    mockScript.defer = true;

    // Mock document.createElement and document.body.appendChild
    const createElementSpy = vi.spyOn(document, 'createElement');
    const appendChildSpy = vi.spyOn(document.body, 'appendChild');

    // Simulate script load
    mockScript.dispatchEvent(new Event('load'));

    await waitFor(() => {
      expect(createElementSpy).toHaveBeenCalledWith('script');
      expect(appendChildSpy).toHaveBeenCalled();
      expect(document.getElementById('googleButton')).not.toBeNull();
    });
  });

  it.skip('initializes Google Sign-In button when script is loaded', async () => {
    renderLoginForm();

    // Create and append the script element
    const mockScript = document.createElement('script');
    mockScript.src = 'https://accounts.google.com/gsi/client';
    document.body.appendChild(mockScript);

    // Simulate script load
    mockScript.dispatchEvent(new Event('load'));

    await waitFor(() => {
      expect(mockInitialize).toHaveBeenCalledWith(expect.objectContaining({
        client_id: expect.any(String),
        callback: expect.any(Function),
      }));
      expect(mockRenderButton).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.objectContaining({
          theme: 'outline',
          size: 'large',
          width: '100%'
        })
      );
    });
  });

  it.skip('handles Google Sign-In response', async () => {
    renderLoginForm();

    // Wait for the script to be loaded and Google Sign-In to be initialized
    await waitFor(() => {
      expect(window.google?.accounts.id.initialize).toHaveBeenCalled();
    });

    // Get the callback that was registered with Google Sign-In
    const initializeCall = vi.mocked(window.google!.accounts.id.initialize).mock.calls[0][0];
    const callback = initializeCall.callback;

    // Call the callback with a mock credential
    await callback({ credential: 'mock-credential' });

    // Verify the login was attempted and navigation occurred
    expect(mockGoogleLogin).toHaveBeenCalledWith('mock-credential');
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
  });

  it('shows loading state for Google Sign-In button when script is loading', () => {
    renderLoginForm();
    
    expect(screen.getByText('Loading Google Sign-In...')).toBeInTheDocument();
  });

  it('navigates to dashboard after successful login', async () => {
    mockLogin.mockResolvedValueOnce({});
    renderLoginForm();
    
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });
}); 