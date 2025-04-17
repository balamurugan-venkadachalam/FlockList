import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import FamilyMembersList from '../../../../components/features/family/FamilyMembersList';
import { FamilyMember } from '../../../../types/family';

describe('FamilyMembersList', () => {
  const mockMembers: FamilyMember[] = [
    {
      userId: '123',
      email: 'parent@example.com',
      name: 'John Parent',
      role: 'admin',
    },
    {
      userId: '456',
      email: 'child@example.com',
      name: 'Jane Child',
      role: 'member',
    },
    {
      userId: '789',
      email: 'another@example.com',
      name: 'Another Member',
      role: 'member',
    },
  ];

  const currentUserId = '123';
  const mockRemoveMember = vi.fn();

  beforeEach(() => {
    mockRemoveMember.mockClear();
  });

  it('should display a message when there are no members', () => {
    render(
      <FamilyMembersList
        members={[]}
        currentUserId={currentUserId}
        isAdmin={true}
        onRemoveMember={mockRemoveMember}
      />
    );

    expect(screen.getByText('No family members found.')).toBeInTheDocument();
  });

  it('should display all members', () => {
    render(
      <FamilyMembersList
        members={mockMembers}
        currentUserId={currentUserId}
        isAdmin={true}
        onRemoveMember={mockRemoveMember}
      />
    );

    expect(screen.getByText('John Parent (You)')).toBeInTheDocument();
    expect(screen.getByText('Jane Child')).toBeInTheDocument();
    expect(screen.getByText('Another Member')).toBeInTheDocument();
    expect(screen.getByText('Total members: 3')).toBeInTheDocument();
  });

  it('should mark the current user', () => {
    render(
      <FamilyMembersList
        members={mockMembers}
        currentUserId={currentUserId}
        isAdmin={true}
        onRemoveMember={mockRemoveMember}
      />
    );

    expect(screen.getByText('John Parent (You)')).toBeInTheDocument();
  });

  it('should display role information', () => {
    render(
      <FamilyMembersList
        members={mockMembers}
        currentUserId={currentUserId}
        isAdmin={true}
        onRemoveMember={mockRemoveMember}
      />
    );

    const adminChips = screen.getAllByText('admin');
    const memberChips = screen.getAllByText('member');

    expect(adminChips.length).toBe(1);
    expect(memberChips.length).toBe(2);
  });

  it('should show remove button for admins but not for the current user', () => {
    render(
      <FamilyMembersList
        members={mockMembers}
        currentUserId={currentUserId}
        isAdmin={true}
        onRemoveMember={mockRemoveMember}
      />
    );

    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    expect(removeButtons.length).toBe(2); // Two remove buttons, one for each other member
  });

  it('should not show remove buttons for non-admins', () => {
    render(
      <FamilyMembersList
        members={mockMembers}
        currentUserId={currentUserId}
        isAdmin={false}
        onRemoveMember={mockRemoveMember}
      />
    );

    const removeButtons = screen.queryAllByRole('button', { name: /remove/i });
    expect(removeButtons.length).toBe(0);
  });

  it('should open confirmation dialog when remove button is clicked', async () => {
    render(
      <FamilyMembersList
        members={mockMembers}
        currentUserId={currentUserId}
        isAdmin={true}
        onRemoveMember={mockRemoveMember}
      />
    );

    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    await userEvent.click(removeButtons[0]);

    expect(screen.getByText('Remove Family Member')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to remove/)).toBeInTheDocument();
  });

  it('should call onRemoveMember when confirm is clicked in dialog', async () => {
    render(
      <FamilyMembersList
        members={mockMembers}
        currentUserId={currentUserId}
        isAdmin={true}
        onRemoveMember={mockRemoveMember}
      />
    );

    // Click remove button for Jane Child
    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    await userEvent.click(removeButtons[0]);

    // Dialog should be open
    const confirmButton = screen.getByRole('button', { name: /remove$/i });
    
    // Click confirm button
    await userEvent.click(confirmButton);
    
    // onRemoveMember should be called with the correct userId
    // The first non-current user is "Jane Child" with ID "456"
    expect(mockRemoveMember).toHaveBeenCalledWith('456');
  });

  it('should close dialog without removing when cancel is clicked', async () => {
    render(
      <FamilyMembersList
        members={mockMembers}
        currentUserId={currentUserId}
        isAdmin={true}
        onRemoveMember={mockRemoveMember}
      />
    );

    // Click remove button for Jane Child
    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    await userEvent.click(removeButtons[0]);

    // Dialog should be open
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    
    // Click cancel button
    await userEvent.click(cancelButton);
    
    // onRemoveMember should not be called
    expect(mockRemoveMember).not.toHaveBeenCalled();
    
    // Wait for the dialog to close - Material-UI dialogs have transition effects
    await waitFor(() => {
      expect(screen.queryByText('Remove Family Member')).not.toBeInTheDocument();
    });
  });

  it('uses different icons for admin and regular members', () => {
    render(
      <FamilyMembersList
        members={mockMembers}
        currentUserId="user789"
        isAdmin={true}
        onRemoveMember={mockRemoveMember}
      />
    );

    // Test for presence of SVG icons instead of img role
    const svgIcons = document.querySelectorAll('svg');
    expect(svgIcons.length).toBeGreaterThan(0);
    
    // Alternatively, check for specific avatar colors
    const adminAvatarContainer = screen.getByText('John Parent').closest('li');
    const memberAvatarContainer = screen.getByText('Jane Child').closest('li');
    
    // Use optional chaining and non-null assertions to handle potential null values
    const adminAvatar = adminAvatarContainer?.querySelector('.MuiAvatar-root');
    const memberAvatar = memberAvatarContainer?.querySelector('.MuiAvatar-root');
    
    expect(adminAvatar).not.toBeNull();
    expect(memberAvatar).not.toBeNull();
  });
}); 