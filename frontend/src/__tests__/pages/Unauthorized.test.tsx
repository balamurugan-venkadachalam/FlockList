// React is imported by default in the test environment
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Unauthorized from '../../pages/Unauthorized';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the useNavigate hook
const mockNavigate = vi.fn();

// Mock react-router-dom properly for Vitest
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Unauthorized Component', () => {
  beforeEach(() => {
    // Reset the mock before each test
    mockNavigate.mockReset();
  });

  it('renders the access denied message', () => {
    render(
      <MemoryRouter>
        <Unauthorized />
      </MemoryRouter>
    );
    
    // Check that the main heading is rendered
    const heading = screen.getByRole('heading', { name: /access denied/i });
    expect(heading).toBeDefined();
    
    // Check that the explanation text is rendered
    const text = screen.getByText(/you do not have permission to access this page/i);
    expect(text).toBeDefined();
  });

  it('navigates to dashboard when dashboard button is clicked', () => {
    render(
      <MemoryRouter>
        <Unauthorized />
      </MemoryRouter>
    );
    
    // Find and click the dashboard button
    const dashboardButton = screen.getByRole('button', { name: 'Go to dashboard page' });
    expect(dashboardButton).toBeDefined();
    fireEvent.click(dashboardButton);
    
    // Check that navigate was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('navigates back when go back button is clicked', () => {
    render(
      <MemoryRouter>
        <Unauthorized />
      </MemoryRouter>
    );
    
    // Find and click the go back button
    const goBackButton = screen.getByRole('button', { name: 'Return to previous page' });
    expect(goBackButton).toBeDefined();
    fireEvent.click(goBackButton);
    
    // Check that navigate was called with -1 (go back)
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('sets focus on the heading when component mounts', () => {
    render(
      <MemoryRouter>
        <Unauthorized />
      </MemoryRouter>
    );
    
    // Check that the heading has focus
    const heading = screen.getByRole('heading', { name: /access denied/i });
    expect(heading).toBeDefined();
    expect(document.activeElement).toBe(heading);
  });

  it('has proper ARIA attributes for accessibility', () => {
    render(
      <MemoryRouter>
        <Unauthorized />
      </MemoryRouter>
    );
    
    // Check that the alert role is present
    const alertElement = screen.getByRole('alert');
    expect(alertElement).toBeDefined();
    
    // Check that buttons have aria-labels
    const dashboardButton = screen.getByRole('button', { name: 'Go to dashboard page' });
    expect(dashboardButton).toBeDefined();
    expect(dashboardButton.getAttribute('aria-label')).toBe('Go to dashboard page');
    expect(dashboardButton.textContent).toBe('Go to Dashboard');
    
    const goBackButton = screen.getByRole('button', { name: 'Return to previous page' });
    expect(goBackButton).toBeDefined();
    expect(goBackButton.getAttribute('aria-label')).toBe('Return to previous page');
    expect(goBackButton.textContent).toBe('Go Back');
  });
});
