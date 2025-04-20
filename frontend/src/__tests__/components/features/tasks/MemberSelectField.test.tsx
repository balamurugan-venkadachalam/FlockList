import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MemberSelectField from '../../../../components/features/tasks/MemberSelectField';
import * as flockService from '../../../../services/flockService';
import { FlockMember } from '../../../../types/flock';

// Mock flock service
vi.mock('../../../../services/flockService', () => ({
  getFlockById: vi.fn(),
}));

// Mock flock data
const mockFlockMembers: FlockMember[] = [
  {
    userId: 'user1',
    email: 'admin@example.com',
    role: 'admin',
    name: 'Admin User'
  },
  {
    userId: 'user2',
    email: 'parent@example.com',
    role: 'admin',
    name: 'Parent User'
  },
  {
    userId: 'user3',
    email: 'child@example.com',
    role: 'member',
    name: 'Child User'
  },
  {
    userId: 'user4',
    email: 'noname@example.com',
    role: 'member'
  }
];

const mockFlockResponse = {
  message: 'Flock retrieved successfully',
  flock: {
    _id: 'flock1',
    name: 'Test Flock',
    members: mockFlockMembers,
    pendingInvitations: [],
    createdBy: 'user1',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  }
};

describe('MemberSelectField Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default mock implementation
    vi.mocked(flockService.getFlockById).mockResolvedValue(mockFlockResponse);
  });

  const renderMemberSelectField = (props = {}) => {
    const onChange = vi.fn();
    const defaultProps = {
      flockId: 'flock1',
      value: [],
      onChange,
      currentUserId: 'user1',
      ...props
    };

    return {
      ...render(<MemberSelectField {...defaultProps} />),
      onChange
    };
  };

  it('renders with loading state initially', async () => {
    renderMemberSelectField();
    
    // The select should be disabled while loading - check for aria-disabled attribute
    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('aria-disabled', 'true');
    
    // Should show loading indicator
    expect(screen.getByText('Loading flock members...')).toBeInTheDocument();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading flock members...')).not.toBeInTheDocument();
    });
    
    // Select should be enabled after loading
    await waitFor(() => {
      const updatedSelect = screen.getByRole('combobox');
      expect(updatedSelect).not.toHaveAttribute('aria-disabled', 'true');
    });
  });

  it('shows error message when flock members fail to load', async () => {
    // Mock failed API call
    vi.mocked(flockService.getFlockById).mockRejectedValue(new Error('Failed to load flock'));
    
    renderMemberSelectField();
    
    // Wait for error message - use a more generic regex pattern
    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });
  });

  it('displays flock members correctly', async () => {
    renderMemberSelectField();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading flock members...')).not.toBeInTheDocument();
    });
    
    // Open the dropdown
    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);
    
    // Check if all members are displayed
    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('Parent User')).toBeInTheDocument();
    expect(screen.getByText('Child User')).toBeInTheDocument();
    expect(screen.getByText('noname@example.com')).toBeInTheDocument();
    
    // Check if roles are displayed
    expect(screen.getAllByText('Admin').length).toBe(2);
    expect(screen.getAllByText('Member').length).toBe(2);
  });

  it('auto-selects current user when no value is provided', async () => {
    const { onChange } = renderMemberSelectField();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading flock members...')).not.toBeInTheDocument();
    });
    
    // Check if onChange was called with current user ID
    expect(onChange).toHaveBeenCalledWith(['user1']);
  });

  it('does not auto-select current user when value is provided', async () => {
    const { onChange } = renderMemberSelectField({ value: ['user2'] });
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading flock members...')).not.toBeInTheDocument();
    });
    
    // onChange should not be called since we already provided a value
    expect(onChange).not.toHaveBeenCalled();
  });

  it('highlights the current user in the dropdown', async () => {
    renderMemberSelectField();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading flock members...')).not.toBeInTheDocument();
    });
    
    // Open the dropdown
    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);
    
    // Check if current user is highlighted with "(You)" label
    expect(screen.getByText('(You)')).toBeInTheDocument();
  });

  it('allows selecting multiple members', async () => {
    const { onChange } = renderMemberSelectField();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading flock members...')).not.toBeInTheDocument();
    });
    
    // Open the dropdown
    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);
    
    // Select the second member (Parent User)
    fireEvent.click(screen.getByText('Parent User'));
    
    // Verify the second call includes user2
    expect(onChange).toHaveBeenCalledTimes(2); // First call is auto-select, second is our click
    expect(onChange.mock.calls[1][0]).toContain('user2');
    
    // Select the third member (Child User)
    fireEvent.click(screen.getByText('Child User'));
    
    // Verify the third call includes user3
    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange.mock.calls[2][0]).toContain('user3');
    
    // Make sure both user2 and user3 are now in the selection
    expect(onChange.mock.calls[2][0]).toEqual(expect.arrayContaining(['user2', 'user3']));
  });

  it('displays selected members as chips', async () => {
    // Pre-select two users
    renderMemberSelectField({ value: ['user1', 'user3'] });
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading flock members...')).not.toBeInTheDocument();
    });
    
    // Check if selected users are displayed as chips
    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('Child User')).toBeInTheDocument();
  });

  it('displays email when name is not available', async () => {
    renderMemberSelectField();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading flock members...')).not.toBeInTheDocument();
    });
    
    // Open the dropdown
    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);
    
    // Check if the user without a name is displayed with email
    expect(screen.getByText('noname@example.com')).toBeInTheDocument();
  });

  it('respects the disabled prop', async () => {
    renderMemberSelectField({ disabled: true });
    
    // Wait for loading to complete - even though disabled it still loads data
    await waitFor(() => {
      expect(screen.queryByText('Loading flock members...')).not.toBeInTheDocument();
    });
    
    // Check for aria-disabled attribute instead of using toBeDisabled
    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('aria-disabled', 'true');
  });

  it('shows error message when provided', async () => {
    renderMemberSelectField({ error: 'This field is required' });
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading flock members...')).not.toBeInTheDocument();
    });
    
    // Error message should be displayed
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('uses custom label when provided', async () => {
    renderMemberSelectField({ label: 'Flock Members' });
    
    // Should show custom label
    expect(screen.getByLabelText('Flock Members')).toBeInTheDocument();
  });

  it('displays message when no flock members are found', async () => {
    // Mock empty flock members array
    vi.mocked(flockService.getFlockById).mockResolvedValue({
      ...mockFlockResponse,
      flock: {
        ...mockFlockResponse.flock,
        members: [],
        pendingInvitations: []
      }
    });
    
    renderMemberSelectField();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading flock members...')).not.toBeInTheDocument();
    });
    
    // Open the dropdown
    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);
    
    // Should show no members message
    expect(screen.getByText('No flock members found')).toBeInTheDocument();
  });
}); 