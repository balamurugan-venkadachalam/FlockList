import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import PendingInvitationsList from '../../../../components/features/flock/PendingInvitationsList';

interface PendingInvitation {
  email: string;
  role: 'admin' | 'member';
  invitedBy: string;
  expiresAt: string;
}

describe('PendingInvitationsList', () => {
  const mockInvitations: PendingInvitation[] = [
    {
      email: 'pending1@example.com',
      role: 'member',
      invitedBy: 'user123',
      expiresAt: '2023-07-01T12:00:00Z'
    },
    {
      email: 'pending2@example.com',
      role: 'admin',
      invitedBy: 'user123',
      expiresAt: '2023-07-02T15:30:00Z'
    }
  ];

  const mockCancelInvitation = vi.fn();

  it('renders the component with invitations', () => {
    render(
      <PendingInvitationsList
        invitations={mockInvitations}
        onCancelInvitation={mockCancelInvitation}
      />
    );

    // Check for emails and roles
    expect(screen.getByText('pending1@example.com')).toBeInTheDocument();
    expect(screen.getByText('pending2@example.com')).toBeInTheDocument();
    expect(screen.getByText('member')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
    
    // Check for date information using a more flexible approach
    const listItems = screen.getAllByRole('listitem');
    expect(listItems.length).toBe(2);
    
    // Check for the presence of expiration dates
    expect(screen.getAllByText(/Expires on/i).length).toBe(2);
  });

  it('shows no invitations message when invitations array is empty', () => {
    render(
      <PendingInvitationsList
        invitations={[]}
        onCancelInvitation={mockCancelInvitation}
      />
    );

    expect(screen.getByText('No pending invitations.')).toBeInTheDocument();
  });

  it('renders correct number of cancel buttons', () => {
    render(
      <PendingInvitationsList
        invitations={mockInvitations}
        onCancelInvitation={mockCancelInvitation}
      />
    );

    const cancelButtons = screen.getAllByRole('button', { name: /cancel invitation/i });
    expect(cancelButtons).toHaveLength(2);
  });

  it('calls onCancelInvitation with correct email when cancel button is clicked', () => {
    render(
      <PendingInvitationsList
        invitations={mockInvitations}
        onCancelInvitation={mockCancelInvitation}
      />
    );

    // Get all cancel buttons
    const cancelButtons = screen.getAllByRole('button', { name: /cancel invitation/i });
    
    // Click the first one
    fireEvent.click(cancelButtons[0]);
    
    // Should call onCancelInvitation with the correct email
    expect(mockCancelInvitation).toHaveBeenCalledWith('pending1@example.com');
    
    // Click the second one
    fireEvent.click(cancelButtons[1]);
    
    // Should call onCancelInvitation with the correct email
    expect(mockCancelInvitation).toHaveBeenCalledWith('pending2@example.com');
    
    // Should have been called twice in total
    expect(mockCancelInvitation).toHaveBeenCalledTimes(2);
  });

  it('does not show cancel buttons when onCancelInvitation is not provided', () => {
    render(
      <PendingInvitationsList
        invitations={mockInvitations}
      />
    );

    const cancelButtons = screen.queryAllByRole('button', { name: /cancel invitation/i });
    expect(cancelButtons).toHaveLength(0);
  });

  it('formats dates correctly', () => {
    render(
      <PendingInvitationsList
        invitations={mockInvitations}
        onCancelInvitation={mockCancelInvitation}
      />
    );

    // We'll check that the component renders without errors
    // and that we have the expected number of list items
    const listItems = screen.getAllByRole('listitem');
    expect(listItems.length).toBe(2);
    
    // Check for the presence of month names in the document
    const monthsRegex = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i;
    const documentText = document.body.textContent || '';
    expect(monthsRegex.test(documentText)).toBe(true);
  });

  it('handles invalid dates gracefully', () => {
    const invalidDateInvitations: PendingInvitation[] = [
      {
        email: 'invalid@example.com',
        role: 'member',
        invitedBy: 'user123',
        expiresAt: 'not-a-date'
      }
    ];

    render(
      <PendingInvitationsList
        invitations={invalidDateInvitations}
        onCancelInvitation={mockCancelInvitation}
      />
    );

    // Check the document for "Unknown date" text (our fallback value)
    expect(screen.getByText(/Unknown date/i)).toBeInTheDocument();
  });

  it('displays badges for different roles', () => {
    render(
      <PendingInvitationsList
        invitations={mockInvitations}
        onCancelInvitation={mockCancelInvitation}
      />
    );

    // Check that the role badges are rendered
    const memberBadge = screen.getByText('member');
    const adminBadge = screen.getByText('admin');
    
    expect(memberBadge).toBeInTheDocument();
    expect(adminBadge).toBeInTheDocument();
    
    // Check that they're inside badge elements
    expect(memberBadge.closest('.badge')).toBeTruthy();
    expect(adminBadge.closest('.badge')).toBeTruthy();
  });
}); 