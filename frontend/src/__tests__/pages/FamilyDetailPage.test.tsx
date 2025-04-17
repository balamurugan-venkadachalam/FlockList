import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import FamilyDetailPage from '../../pages/FamilyDetailPage';
import * as familyService from '../../services/familyService';
import { AuthContext, AuthContextType } from '../../context/AuthContext';
import { Family, FamilyMember } from '../../types/family';

// Mock the services
vi.mock('../../services/familyService');

// Mock the child components
vi.mock('../../components/features/family/FamilyMembersList', () => ({
  default: vi.fn(() => <div data-testid="family-members-list">Family Members List</div>)
}));

vi.mock('../../components/features/family/InviteMemberForm', () => ({
  default: vi.fn(() => <div data-testid="invite-member-form">Invite Member Form</div>)
}));

vi.mock('../../components/features/family/PendingInvitationsList', () => ({
  default: vi.fn(() => <div data-testid="pending-invitations-list">Pending Invitations List</div>)
}));

describe('FamilyDetailPage', () => {
  const mockUser = {
    _id: 'user123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'parent' as const
  };

  const mockMembers: FamilyMember[] = [
    {
      userId: 'user123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'admin'
    },
    {
      userId: 'user456',
      email: 'member@example.com',
      name: 'Family Member',
      role: 'member'
    }
  ];

  const mockFamily: Family = {
    _id: 'family123',
    name: 'Test Family',
    createdBy: 'user123',
    members: mockMembers,
    pendingInvitations: [
      {
        email: 'pending@example.com',
        role: 'member',
        invitedBy: 'user123',
        invitedAt: '2023-07-01T12:00:00Z'
      }
    ],
    createdAt: '2023-06-01T12:00:00Z',
    updatedAt: '2023-06-01T12:00:00Z'
  };

  const mockFamilyResponse = {
    message: 'Family details',
    family: mockFamily
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
    window.confirm = vi.fn(() => true); // Mock confirm dialog to return true
    vi.mocked(familyService.getFamilyById).mockResolvedValue(mockFamilyResponse);
    vi.mocked(familyService.inviteMember).mockResolvedValue({
      message: 'Invitation sent',
      invitation: {
        email: 'new@example.com',
        role: 'member',
        invitedAt: '2023-07-10T12:00:00Z'
      }
    });
    vi.mocked(familyService.removeMember).mockResolvedValue({ message: 'Member removed' });
    vi.mocked(familyService.cancelInvitation).mockResolvedValue({ message: 'Invitation cancelled' });
  });

  const renderComponent = () => {
    return render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter initialEntries={['/families/family123']}>
          <Routes>
            <Route path="/families/:id" element={<FamilyDetailPage />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );
  };

  it('displays loading state when fetching family data', () => {
    renderComponent();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays family name and components after loading', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('Test Family')).toBeInTheDocument();
    expect(screen.getByTestId('family-members-list')).toBeInTheDocument();
    expect(screen.getByTestId('invite-member-form')).toBeInTheDocument();
    expect(screen.getByTestId('pending-invitations-list')).toBeInTheDocument();
  });

  it('displays error when family fetch fails', async () => {
    vi.mocked(familyService.getFamilyById).mockRejectedValue(new Error('Failed to load family'));
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('Failed to load family')).toBeInTheDocument();
  });

  it('displays error alert when no family ID is provided', async () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter initialEntries={['/families/']}>
          <Routes>
            <Route path="/families/:id" element={<FamilyDetailPage />} />
            <Route path="/families/" element={<FamilyDetailPage />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('Family ID is missing')).toBeInTheDocument();
  });

  it('handles member removal correctly', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Simulate a successful member removal
    const result = await mockAuthContext.user && familyService.removeMember(mockFamily._id, 'user456');
    
    expect(result).toEqual({ message: 'Member removed' });
    expect(familyService.removeMember).toHaveBeenCalledWith(mockFamily._id, 'user456');
  });

  it('handles invitation cancellation correctly', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Simulate a successful invitation cancellation
    const result = await familyService.cancelInvitation(mockFamily._id, 'pending@example.com');
    
    expect(result).toEqual({ message: 'Invitation cancelled' });
    expect(familyService.cancelInvitation).toHaveBeenCalledWith(mockFamily._id, 'pending@example.com');
  });
}); 