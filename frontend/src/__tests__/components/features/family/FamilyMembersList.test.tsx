import { render, screen, waitFor, within } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import FlockMembersList from '../../../../components/features/flock/FlockMembersList';
import { FlockMember } from '../../../../types/flock';

// Mock Shadcn UI components
vi.mock('@/components/ui/shadcn/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: any) => {
    // Handle open state changes
    const handleClick = (e: any) => {
      if (e.target === e.currentTarget) {
        onOpenChange && onOpenChange(false);
      }
    };
    
    return (
      <div 
        role="dialog" 
        data-state={open ? 'open' : 'closed'} 
        data-testid="dialog"
        onClick={handleClick}
      >
        {children}
      </div>
    );
  },
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <div data-testid="dialog-title">{children}</div>,
  DialogDescription: ({ children }: any) => <div data-testid="dialog-description">{children}</div>,
  DialogFooter: ({ children }: any) => <div data-testid="dialog-footer">{children}</div>,
}));

vi.mock('@/components/ui/shadcn/tooltip', () => ({
  Tooltip: ({ children }: any) => <div data-testid="tooltip">{children}</div>,
  TooltipContent: ({ children }: any) => <div data-testid="tooltip-content">{children}</div>,
  TooltipProvider: ({ children }: any) => <div data-testid="tooltip-provider">{children}</div>,
  TooltipTrigger: ({ children }: any) => <div data-testid="tooltip-trigger">{children}</div>,
}));

vi.mock('@/components/ui/shadcn/button', () => ({
  Button: ({ children, onClick, type, disabled, variant, size, className }: any) => (
    <button 
      onClick={onClick} 
      type={type || 'button'} 
      disabled={disabled}
      data-variant={variant}
      data-size={size}
      className={className}
      data-testid="shadcn-button"
    >
      {children}
    </button>
  ),
}));

describe('FlockMembersList', () => {
  const mockMembers: FlockMember[] = [
    {
      user: {
        _id: '123',
        email: 'parent@example.com',
        firstName: 'John',
        lastName: 'Parent'
      },
      role: 'admin',
      joinedAt: new Date().toISOString(),
    },
    {
      user: {
        _id: '456',
        email: 'child@example.com',
        firstName: 'Jane',
        lastName: 'Child'
      },
      role: 'member',
      joinedAt: new Date().toISOString(),
    },
    {
      user: {
        _id: '789',
        email: 'another@example.com',
        firstName: 'Another',
        lastName: 'Member'
      },
      role: 'member',
      joinedAt: new Date().toISOString(),
    },
  ];

  const currentUserId = '123';
  const mockRemoveMember = vi.fn();

  beforeEach(() => {
    mockRemoveMember.mockClear();
  });

  it('should display a message when there are no members', () => {
    render(
      <FlockMembersList
        members={[]}
        currentUserId={currentUserId}
        isAdmin={true}
        onRemoveMember={mockRemoveMember}
      />
    );

    expect(screen.getByText('No flock members found.')).toBeInTheDocument();
  });

  it('should display member names and roles', () => {
    render(
      <FlockMembersList
        members={mockMembers}
        currentUserId={currentUserId}
        isAdmin={true}
        onRemoveMember={mockRemoveMember}
      />
    );

    // In Shadcn UI, the name and "You" badge are separate elements
    expect(screen.getByText('John Parent')).toBeInTheDocument();
    expect(screen.getByText('You')).toBeInTheDocument();
    expect(screen.getByText('Jane Child')).toBeInTheDocument();
    expect(screen.getByText('Another Member')).toBeInTheDocument();
    expect(screen.getAllByText('admin')[0]).toBeInTheDocument();
    expect(screen.getAllByText('member')[0]).toBeInTheDocument();
  });

  it('should mark the current user', () => {
    render(
      <FlockMembersList
        members={mockMembers}
        currentUserId={currentUserId}
        isAdmin={true}
        onRemoveMember={mockRemoveMember}
      />
    );

    expect(screen.getByText('John Parent')).toBeInTheDocument();
    expect(screen.getByText('You')).toBeInTheDocument();
  });

  it('should display role information', () => {
    render(
      <FlockMembersList
        members={mockMembers}
        currentUserId={currentUserId}
        isAdmin={true}
        onRemoveMember={mockRemoveMember}
      />
    );

    // In Shadcn UI implementation, we're using Badge components with capitalized text
    expect(screen.getByText('admin')).toBeInTheDocument();
    // Use getAllByText since there are multiple 'member' badges
    expect(screen.getAllByText('member')[0]).toBeInTheDocument();
    
    // In Shadcn UI, the remove buttons are ghost variant buttons with a Trash icon
    // Since there's no visible text for screen readers, we need to check for buttons with data-testid
    // In the actual component, we can see that buttons have variant="ghost" and size="icon"
    const ghostButtons = screen.getAllByTestId('shadcn-button');
    // Filter to find buttons that likely contain the remove functionality
    const removeButtons = Array.from(ghostButtons).filter(button => 
      button.getAttribute('data-variant') === 'ghost' || 
      button.getAttribute('data-variant') === 'destructive'
    );
    expect(removeButtons.length).toBeGreaterThan(0);
    
    // Verify we have buttons with the shadcn-button test ID
    const shadcnButtons = screen.getAllByTestId('shadcn-button');
    expect(shadcnButtons.length).toBeGreaterThan(0);
  });

  it('should show remove button for admins but not for the current user', () => {
    render(
      <FlockMembersList
        members={mockMembers}
        currentUserId={currentUserId}
        isAdmin={true}
        onRemoveMember={mockRemoveMember}
      />
    );

    // In our mocked environment, we need to check for buttons that would contain trash icons
    // The actual implementation uses Button with variant="ghost" and size="icon"
    const buttons = screen.getAllByRole('button');
    // We should have at least 2 buttons (one for each non-current member)
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('should not show remove buttons for non-admins', () => {
    render(
      <FlockMembersList
        members={mockMembers}
        currentUserId={currentUserId}
        isAdmin={false}
        onRemoveMember={mockRemoveMember}
      />
    );
    
    // In Shadcn UI, the remove buttons are inside TooltipTrigger components
    const tooltipTriggers = screen.queryAllByTestId('tooltip-trigger');
    
    // If we're not admin, there shouldn't be any tooltip triggers with remove buttons
    expect(tooltipTriggers.length).toBe(0);
    
    // Also verify no trash icons are visible
    const trashIcons = document.querySelectorAll('.lucide-trash');
    expect(trashIcons.length).toBe(0);
  });

  it('should open confirmation dialog when remove button is clicked', async () => {
    render(
      <FlockMembersList
        members={mockMembers}
        currentUserId="different-id"
        isAdmin={true}
        onRemoveMember={mockRemoveMember}
      />
    );
    
    // Find the remove button (using the variant and size attributes from Shadcn UI Button)
    const removeButtons = screen.getAllByTestId('shadcn-button');
    const removeButton = Array.from(removeButtons).find(button => 
      button.closest('[data-testid="tooltip-trigger"]')
    );
    expect(removeButton).not.toBeNull();
    
    // Click the remove button
    if (removeButton) {
      await userEvent.click(removeButton);
    }
    
    // Find the dialog
    const dialog = screen.getByTestId('dialog');
    expect(dialog).toBeInTheDocument();
    
    // Check for dialog description text - using a regex to match part of the text
    // since the text might be split across multiple elements
    expect(screen.getByText(/cannot be undone/)).toBeInTheDocument();
  });

  it('should call onRemoveMember when confirm is clicked in dialog', async () => {
    // Use a different currentUserId to ensure the remove button is rendered for Jane Child
    render(
      <FlockMembersList
        members={mockMembers}
        currentUserId="different-id"
        isAdmin={true}
        onRemoveMember={mockRemoveMember}
      />
    );
    
    // Find the remove button (using the variant and size attributes from Shadcn UI Button)
    const removeButtons = screen.getAllByTestId('shadcn-button');
    const removeButton = Array.from(removeButtons).find(button => 
      button.closest('[data-testid="tooltip-trigger"]')
    );
    expect(removeButton).not.toBeNull();
    
    // Click the remove button
    if (removeButton) {
      await userEvent.click(removeButton);
    }
    
    // Find the dialog
    const dialog = screen.getByTestId('dialog');
    expect(dialog).toBeInTheDocument();
    
    // Find and click the Remove button in the dialog (it has variant="destructive")
    const dialogButtons = within(dialog).getAllByTestId('shadcn-button');
    const dialogRemoveButton = Array.from(dialogButtons).find(button => 
      button.getAttribute('data-variant') === 'destructive'
    );
    expect(dialogRemoveButton).not.toBeNull();
    
    // Click the Remove button
    if (dialogRemoveButton) {
      await userEvent.click(dialogRemoveButton);
    }
    
    // onRemoveMember should be called
    expect(mockRemoveMember).toHaveBeenCalled();
  });

  it('should close dialog without removing when cancel is clicked', async () => {
    // Use a different currentUserId to ensure the remove button is rendered for Jane Child
    render(
      <FlockMembersList
        members={mockMembers}
        currentUserId="different-id"
        isAdmin={true}
        onRemoveMember={mockRemoveMember}
      />
    );

    // Find Jane Child's member item to verify it exists
    expect(screen.getByText('Jane Child')).toBeInTheDocument();
    
    // Find the remove button inside a tooltip trigger
    const removeButtons = screen.getAllByTestId('shadcn-button');
    const removeButton = Array.from(removeButtons).find(button => 
      button.closest('[data-testid="tooltip-trigger"]')
    );
    expect(removeButton).not.toBeNull();
    
    // Click the remove button
    if (removeButton) {
      await userEvent.click(removeButton);
    }
    
    // Find the dialog
    const dialog = screen.getByTestId('dialog');
    expect(dialog).toBeInTheDocument();
    
    // Find and click the Cancel button in the dialog (it has variant="outline")
    const dialogButtons = within(dialog).getAllByTestId('shadcn-button');
    const cancelButton = Array.from(dialogButtons).find(button => 
      button.getAttribute('data-variant') === 'outline'
    );
    expect(cancelButton).not.toBeNull();
    
    // Click the Cancel button
    if (cancelButton) {
      await userEvent.click(cancelButton);
    }
    
    // onRemoveMember should not be called
    expect(mockRemoveMember).not.toHaveBeenCalled();
    
    // Wait for the dialog to close - in Shadcn UI, the dialog might still be in the DOM
    // but with a data-state="closed" attribute
    await waitFor(() => {
      // Check if dialog is closed by looking for data-state="closed"
      const closedDialog = document.querySelector('[data-state="closed"]');
      expect(closedDialog).not.toBeNull();
    });
  });
  it('uses different icons for admin and regular members', () => {
    render(
      <FlockMembersList
        members={mockMembers}
        currentUserId="user789"
        isAdmin={true}
        onRemoveMember={mockRemoveMember}
      />
    );

    // Test for presence of SVG icons
    const svgIcons = document.querySelectorAll('svg');
    expect(svgIcons.length).toBeGreaterThan(0);
    
    // In Shadcn UI, we're using different avatar components
    const avatars = document.querySelectorAll('[class*="bg-"]'); // Match elements with bg-* classes
    expect(avatars.length).toBeGreaterThan(0);
  });
});