import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GoogleSignInButton from '../../../components/auth/GoogleSignInButton';
import { useAuth } from '../../../context/AuthContext';

// Mock the AuthContext
vi.mock('../../../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

describe('GoogleSignInButton', () => {
  const mockGoogleLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      googleLogin: mockGoogleLogin,
      isLoading: false,
      error: null
    });
  });

  it('renders the button with correct text when not loading', () => {
    render(<GoogleSignInButton />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button.textContent).toBe('Continue with Google');
    expect(button).not.toBeDisabled();
  });

  it('renders the button with loading state', () => {
    (useAuth as any).mockReturnValue({
      googleLogin: mockGoogleLogin,
      isLoading: true,
      error: null
    });

    render(<GoogleSignInButton />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button.textContent).toBe('Signing in...');
    expect(button).toBeDisabled();
  });

  it('calls googleLogin when clicked', async () => {
    render(<GoogleSignInButton />);
    const button = screen.getByRole('button');
    
    await fireEvent.click(button);
    
    expect(mockGoogleLogin).toHaveBeenCalledTimes(1);
    expect(mockGoogleLogin).toHaveBeenCalledWith('google-auth-token');
  });

  it('handles login error gracefully', async () => {
    const error = new Error('Login failed');
    const consoleSpy = vi.spyOn(console, 'error');
    mockGoogleLogin.mockRejectedValueOnce(error);

    render(<GoogleSignInButton />);
    const button = screen.getByRole('button');
    
    await fireEvent.click(button);
    
    expect(consoleSpy).toHaveBeenCalledWith('Google sign-in failed:', error);
    consoleSpy.mockRestore();
  });
}); 