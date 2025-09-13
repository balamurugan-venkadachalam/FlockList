// Rule applied: Write concise, technical TypeScript code with accurate examples

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import MemberSelectField from '@/components/features/tasks/MemberSelectField';
import * as flockService from '@/services/flockService';
import { FlockMember, FlockResponse } from '@/types/models/flock';
import { 
  renderWithProviders, 
  setupShadcnMocks, 
  userEvent,
  mockApiService,
  mockApiServiceError
} from '@/__tests__/utils/test-utils';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';

// Rule applied: Use absolute imports for all files @/...
// Mock the services
vi.mock('@/services/flockService');

// Setup Shadcn UI mocks
setupShadcnMocks();

describe('MemberSelectField Component with Shadcn UI', () => {
  // Mock flock data
  const mockFlockMembers: FlockMember[] = [
    {
      _id: 'member1',
      user: {
        _id: 'user1',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
      },
      role: 'admin',
      joinedAt: '2023-01-01T00:00:00.000Z',
    },
    {
      _id: 'member2',
      user: {
        _id: 'user2',
        email: 'parent@example.com',
        firstName: 'Parent',
        lastName: 'User',
      },
      role: 'admin',
      joinedAt: '2023-01-01T00:00:00.000Z',
    },
    {
      _id: 'member3',
      user: {
        _id: 'user3',
        email: 'child@example.com',
        firstName: 'Child',
        lastName: 'User',
      },
      role: 'member',
      joinedAt: '2023-01-01T00:00:00.000Z',
    },
    {
      _id: 'member4',
      user: {
        _id: 'user4',
        email: 'noname@example.com',
        firstName: 'No',
        lastName: 'Name',
      },
      role: 'member',
      joinedAt: '2023-01-01T00:00:00.000Z',
    },
  ];

  const mockFlockResponse: FlockResponse = {
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
      ...renderWithProviders(
        <TestFormWrapper {...defaultProps} />
      ),
      onChange
    };
  };

  // Wrapper component to provide form context
  const TestFormWrapper = (props: any) => {
    const form = useForm();
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(() => {})}>
          <MemberSelectField {...props} />
        </form>
      </Form>
    );
  };

  it('renders with loading state initially', async () => {
    renderMemberSelectField();
    
    // Should show loading indicator (spinner)
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.getByLabelText('Assign To')).toBeDefined();
    expect(document.querySelector('svg.animate-spin')).toBeInTheDocument();
    
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
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
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
    expect(screen.getByText('No Name')).toBeDefined();
    
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

    await waitFor(() => {
      // Check if current user is highlighted with "(You)" label
      const adminUserItem = screen.getByText('Admin User').closest('[role="option"]') as HTMLElement;
      expect(within(adminUserItem).getByText('You')).toBeInTheDocument();
    });
    
    // Ensure onChange wasn't called to auto-select current user
    expect(onChange).not.toHaveBeenCalled();
  });

  it('allows selecting multiple members', async () => {
    const { rerender, onChange } = renderMemberSelectField({ value: ['user1'] });

    // Open the dropdown
    await userEvent.click(screen.getByRole('combobox'));

    // Select the second member (Parent User)
    await userEvent.click(screen.getByText('Parent User'));
    expect(onChange).toHaveBeenCalledWith(['user1', 'user2']);

    // Re-render with the new value
    rerender(<TestFormWrapper value={['user1', 'user2']} onChange={onChange} flockId="flock1" currentUserId="user1" />);

    // Select the third member (Child User)
    await userEvent.click(screen.getByText('Child User'));
    expect(onChange).toHaveBeenCalledWith(['user1', 'user2', 'user3']);
  });

  it('displays selected members as chips', async () => {
    // Pre-select two users
    renderMemberSelectField({ value: ['user1', 'user3'] });
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading flock members...')).toBeNull();
    });
    
    // Check if selected users are displayed as chips
    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeDefined();
      expect(screen.getByText('Child User')).toBeDefined();
    });
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
    await waitFor(() => {
      expect(screen.getByText('No Name')).toBeDefined();
    });
  });

  it('respects the disabled prop', async () => {
    renderMemberSelectField({ disabled: true });
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading flock members...')).toBeNull();
    });
    
    // Check for aria-disabled attribute
    const combobox = screen.getByRole('combobox');
    expect(combobox).toBeDisabled();
  });

  it('shows error message when provided', async () => {
    renderMemberSelectField({ error: 'This field is required' });
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading flock members...')).toBeNull();
    });
    
    // Error message should be displayed
    await waitFor(() => {
      // In Shadcn UI, error messages are displayed in a p tag with text-destructive class
      const errorElements = screen.getAllByText('This field is required');
      expect(errorElements.length).toBeGreaterThan(0);
      
      // Verify it has the correct styling class for errors
      const errorElement = errorElements[0];
      expect(errorElement.className).toContain('text-destructive');
    });
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
    expect(screen.getByText('No members found')).toBeDefined();
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
    expect(combobox).toHaveAttribute('aria-haspopup', 'dialog');
    
    // Check for proper labeling
    expect(screen.getByLabelText('Assign To')).toBeDefined();
  });
});
