// Rule applied: Write concise, technical TypeScript code with accurate examples
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import MemberSelectField from '@/components/features/tasks/MemberSelectField';
import * as flockService from '@/services/flockService';
import { FlockMember } from '@/types/flock';
import { 
  renderWithProviders, 
  setupShadcnMocks, 
  act,
  selectShadcnOption,
  userEvent,
  mockApiService,
  mockApiServiceError
} from '@/__tests__/utils/test-utils';

// Rule applied: Use absolute imports for all files @/...
// Mock the services
vi.mock('@/services/flockService');

// Setup Shadcn UI mocks
setupShadcnMocks();

describe('MemberSelectField Component with Shadcn UI', () => {
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

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default mock implementation
    mockApiService(flockService, 'getFlockById', mockFlockResponse);
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
      ...renderWithProviders(<MemberSelectField {...defaultProps} />),
      onChange
    };
  };

  it('renders with loading state initially', async () => {
    renderMemberSelectField();
    
    // Should show loading indicator
    expect(screen.getByText('Loading flock members...')).toBeDefined();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading flock members...')).toBeNull();
    });
    
    // Select should be enabled after loading
    await waitFor(() => {
      const combobox = screen.getByRole('combobox');
      expect(combobox).not.toHaveAttribute('aria-disabled', 'true');
    });
  });

  it('shows error message when flock members fail to load', async () => {
    // Mock failed API call
    mockApiServiceError(flockService, 'getFlockById', 'Failed to load flock');
    
    renderMemberSelectField();
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeDefined();
    });
  });

  it('displays flock members correctly', async () => {
    renderMemberSelectField();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading flock members...')).toBeNull();
    });
    
    // Open the dropdown using our Shadcn UI helper
    const user = userEvent.setup();
    const combobox = screen.getByRole('combobox');
    await user.click(combobox);
    
    // Check if all members are displayed
    expect(screen.getByText('Admin User')).toBeDefined();
    expect(screen.getByText('Parent User')).toBeDefined();
    expect(screen.getByText('Child User')).toBeDefined();
    expect(screen.getByText('noname@example.com')).toBeDefined();
    
    // Check if roles are displayed
    expect(screen.getAllByText('Admin').length).toBe(2);
    expect(screen.getAllByText('Member').length).toBe(2);
  });

  it('auto-selects current user when no value is provided', async () => {
    const { onChange } = renderMemberSelectField();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading flock members...')).toBeNull();
    });
    
    // Check if onChange was called with current user ID
    expect(onChange).toHaveBeenCalledWith(['user1']);
  });

  it('does not auto-select current user when value is provided', async () => {
    const { onChange } = renderMemberSelectField({ value: ['user2'] });
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading flock members...')).toBeNull();
    });
    
    // Open the dropdown
    const user = userEvent.setup();
    const combobox = screen.getByRole('combobox');
    await user.click(combobox);
    
    // Check if current user is highlighted with "(You)" label
    expect(screen.getByText('(You)')).toBeDefined();
    
    // Ensure onChange wasn't called to auto-select current user
    expect(onChange).not.toHaveBeenCalled();
  });

  it('allows selecting multiple members', async () => {
    const { onChange } = renderMemberSelectField();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading flock members...')).toBeNull();
    });
    
    // Open the dropdown
    const user = userEvent.setup();
    const combobox = screen.getByRole('combobox');
    await user.click(combobox);
    
    // Select the second member (Parent User)
    await user.click(screen.getByText('Parent User'));
    
    // Verify the second call includes user2
    expect(onChange).toHaveBeenCalledTimes(2); // First call is auto-select, second is our click
    expect(onChange.mock.calls[1][0]).toContain('user2');
    
    // Select the third member (Child User)
    await user.click(screen.getByText('Child User'));
    
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
      expect(screen.queryByText('Loading flock members...')).toBeNull();
    });
    
    // Check if selected users are displayed as chips
    expect(screen.getByText('Admin User')).toBeDefined();
    expect(screen.getByText('Child User')).toBeDefined();
  });

  it('displays email when name is not available', async () => {
    renderMemberSelectField();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading flock members...')).toBeNull();
    });
    
    // Open the dropdown
    const user = userEvent.setup();
    const combobox = screen.getByRole('combobox');
    await user.click(combobox);
    
    // Check if the user without a name is displayed with email
    expect(screen.getByText('noname@example.com')).toBeDefined();
  });

  it('respects the disabled prop', async () => {
    renderMemberSelectField({ disabled: true });
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading flock members...')).toBeNull();
    });
    
    // Check for aria-disabled attribute
    const combobox = screen.getByRole('combobox');
    expect(combobox).toHaveAttribute('aria-disabled', 'true');
  });

  it('shows error message when provided', async () => {
    renderMemberSelectField({ error: 'This field is required' });
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading flock members...')).toBeNull();
    });
    
    // Error message should be displayed
    expect(screen.getByText('This field is required')).toBeDefined();
  });

  it('uses custom label when provided', async () => {
    renderMemberSelectField({ label: 'Flock Members' });
    
    // Should show custom label
    expect(screen.getByLabelText('Flock Members')).toBeDefined();
  });

  it('displays message when no flock members are found', async () => {
    // Mock empty flock members array
    mockApiService(flockService, 'getFlockById', {
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
      expect(screen.queryByText('Loading flock members...')).toBeNull();
    });
    
    // Open the dropdown
    const user = userEvent.setup();
    const combobox = screen.getByRole('combobox');
    await user.click(combobox);
    
    // Should show no members message
    expect(screen.getByText('No flock members found')).toBeDefined();
  });

  it('has proper ARIA attributes for accessibility', async () => {
    renderMemberSelectField();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading flock members...')).toBeNull();
    });
    
    // Check for proper ARIA attributes
    const combobox = screen.getByRole('combobox');
    expect(combobox).toBeDefined();
    expect(combobox).toHaveAttribute('aria-expanded', 'false');
    expect(combobox).toHaveAttribute('aria-haspopup', 'listbox');
    
    // Check for proper labeling
    expect(screen.getByLabelText('Assign To')).toBeDefined();
  });
});
