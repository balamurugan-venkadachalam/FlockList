import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../../pages/Dashboard';
import * as familyService from '../../services/familyService';
import { AuthContext, AuthContextType } from '../../context/AuthContext';
import { Family } from '../../types/family';

// Mock services and hooks
vi.mock('../../services/familyService');

// Mock specific React Router hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null }),
  };
});

describe('Dashboard', () => {
  const mockUser = {
    _id: 'user123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'parent' as const
  };

  const mockFamilies: Family[] = [
    {
      _id: 'family123',
      name: 'Test Family 1',
      createdBy: 'user123',
      members: [
        {
          userId: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'admin'
        }
      ],
      pendingInvitations: [],
      createdAt: '2023-06-01T12:00:00Z',
      updatedAt: '2023-06-01T12:00:00Z'
    },
    {
      _id: 'family456',
      name: 'Test Family 2',
      createdBy: 'user123',
      members: [
        {
          userId: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'admin'
        }
      ],
      pendingInvitations: [],
      createdAt: '2023-06-05T12:00:00Z',
      updatedAt: '2023-06-05T12:00:00Z'
    }
  ];

  const mockFamiliesResponse = {
    message: 'Families retrieved successfully',
    families: mockFamilies
  };

  const mockAuthContext: AuthContextType = {
    user: mockUser,
    token: 'fake-token',
    isLoading: false,
    error: null,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    googleLogin: vi.fn(),
    clearError: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(familyService.getFamilies).mockResolvedValue(mockFamiliesResponse);
  });

  const renderComponent = (authContext = mockAuthContext) => {
    return render(
      <AuthContext.Provider value={authContext}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </AuthContext.Provider>
    );
  };

  it('displays user information', async () => {
    renderComponent();
    
    // Check for welcome message
    expect(screen.getByText(/Welcome to Your Dashboard/i)).toBeInTheDocument();
    
    // Check for user name
    expect(screen.getByText(/Hello, Test User/i)).toBeInTheDocument();
    
    // Check for user email and role
    expect(screen.getByText(/You are logged in as: test@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/Your role: parent/i)).toBeInTheDocument();
  });

  it('displays families after loading', async () => {
    renderComponent();
    
    // Wait for families to load
    await waitFor(() => {
      expect(screen.getByText('Test Family 1')).toBeInTheDocument();
      expect(screen.getByText('Test Family 2')).toBeInTheDocument();
    });
    
    // Check for member count
    const memberCounts = screen.getAllByText(/Members: 1/i);
    expect(memberCounts.length).toBe(2);
    
    // Check for view details buttons
    const viewDetailsButtons = screen.getAllByText('View Details');
    expect(viewDetailsButtons.length).toBe(2);
  });

  it('shows loading state while fetching families', async () => {
    // Mock loading state by not resolving the promise immediately
    vi.mocked(familyService.getFamilies).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockFamiliesResponse), 100))
    );
    
    renderComponent();
    
    // Should show loading state
    expect(screen.getByText('Loading families...')).toBeInTheDocument();
    
    // Wait for the loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading families...')).not.toBeInTheDocument();
    });
  });

  it('shows error message when family fetching fails', async () => {
    const errorMessage = 'Failed to fetch families';
    vi.mocked(familyService.getFamilies).mockRejectedValue(new Error(errorMessage));
    
    renderComponent();
    
    // Wait for the error to be displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
    
    // Check for retry button
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('shows no families message when user has no families', async () => {
    vi.mocked(familyService.getFamilies).mockResolvedValue({
      message: 'Families retrieved successfully',
      families: []
    });
    
    renderComponent();
    
    // Wait for the no families message
    await waitFor(() => {
      expect(screen.getByText("You don't have any families yet.")).toBeInTheDocument();
    });
  });

  it('displays create family button for parent users', async () => {
    renderComponent();
    
    // Wait for families to load
    await waitFor(() => {
      expect(screen.queryByText('Loading families...')).not.toBeInTheDocument();
    });
    
    // Check for create family button
    expect(screen.getByText('Create New Family')).toBeInTheDocument();
  });

  it('does not display create family button for non-parent users', async () => {
    const nonParentUser = {
      ...mockUser,
      role: 'child' as const
    };
    
    const nonParentAuthContext = {
      ...mockAuthContext,
      user: nonParentUser
    };
    
    renderComponent(nonParentAuthContext);
    
    // Wait for families to load
    await waitFor(() => {
      expect(screen.queryByText('Loading families...')).not.toBeInTheDocument();
    });
    
    // Check that create family button is not present
    expect(screen.queryByText('Create New Family')).not.toBeInTheDocument();
  });

  it('calls logout function when logout button is clicked', () => {
    renderComponent();
    
    // Click on the logout button
    fireEvent.click(screen.getByText('Logout'));
    
    // Check that logout function was called
    expect(mockAuthContext.logout).toHaveBeenCalledTimes(1);
  });
}); 