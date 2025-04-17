import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import FamilyDashboard from '../../../../components/features/family/FamilyDashboard';
import { Family } from '../../../../types/family';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

describe('FamilyDashboard', () => {
  const mockFamily: Family = {
    _id: 'family-123',
    name: 'Test Family',
    createdBy: 'user-123',
    members: [
      {
        userId: 'user-123',
        email: 'parent@example.com',
        name: 'Parent User',
        role: 'admin',
      },
      {
        userId: 'user-456',
        email: 'child@example.com',
        name: 'Child User',
        role: 'member',
      },
      {
        userId: 'user-789',
        email: 'parent2@example.com',
        name: 'Second Parent',
        role: 'admin',
      },
    ],
    pendingInvitations: [
      {
        email: 'pending@example.com',
        role: 'member',
        invitedBy: 'user-123',
        invitedAt: '2023-05-01T12:00:00.000Z',
      },
      {
        email: 'pending2@example.com',
        role: 'admin',
        invitedBy: 'user-123',
        invitedAt: '2023-05-02T12:00:00.000Z',
      },
    ],
    createdAt: '2023-01-01T12:00:00.000Z',
    updatedAt: '2023-01-02T12:00:00.000Z',
  };

  it('renders the family dashboard with correct family name', () => {
    render(<FamilyDashboard family={mockFamily} currentUserId="user-123" />);
    
    expect(screen.getByText('Family Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Test Family')).toBeInTheDocument();
  });

  it('displays the correct creation date', () => {
    render(<FamilyDashboard family={mockFamily} currentUserId="user-123" />);
    
    expect(screen.getByText('Created on January 1, 2023')).toBeInTheDocument();
  });

  it('shows member statistics correctly', () => {
    render(<FamilyDashboard family={mockFamily} currentUserId="user-123" />);
    
    expect(screen.getByText('Members')).toBeInTheDocument();
    expect(screen.getByText('Total: 3')).toBeInTheDocument();
    expect(screen.getByText('2 Admins')).toBeInTheDocument();
    expect(screen.getByText('1 Member')).toBeInTheDocument();
  });

  it('shows pending invitations section for admin users', () => {
    render(<FamilyDashboard family={mockFamily} currentUserId="user-123" />);
    
    expect(screen.getByText('Pending Invitations')).toBeInTheDocument();
    expect(screen.getByText('2 Pending')).toBeInTheDocument();
    expect(screen.getByText('pending@example.com')).toBeInTheDocument();
    expect(screen.getByText('pending2@example.com')).toBeInTheDocument();
  });

  it('does not show pending invitations section for non-admin users', () => {
    render(<FamilyDashboard family={mockFamily} currentUserId="user-456" />);
    
    expect(screen.queryByText('Pending Invitations')).not.toBeInTheDocument();
  });

  it('shows quick actions section', () => {
    render(<FamilyDashboard family={mockFamily} currentUserId="user-123" />);
    
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('Invite Member')).toBeInTheDocument();
    expect(screen.getByText('Create Task')).toBeInTheDocument();
    expect(screen.getByText('Add Event')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('shows the correct number of pending invitations', () => {
    render(<FamilyDashboard family={mockFamily} currentUserId="user-123" />);
    
    const pendingChip = screen.getByText('2 Pending');
    expect(pendingChip).toBeInTheDocument();
  });

  it('shows "coming soon" tooltips for features not yet implemented', () => {
    render(<FamilyDashboard family={mockFamily} currentUserId="user-123" />);
    
    const tooltips = screen.getAllByTitle('Coming soon');
    expect(tooltips.length).toBe(3); // Create Task, Add Event, Notifications
  });

  it('renders family with no pending invitations correctly', () => {
    const familyWithoutInvitations = {
      ...mockFamily,
      pendingInvitations: []
    };
    
    render(<FamilyDashboard family={familyWithoutInvitations} currentUserId="user-123" />);
    
    expect(screen.queryByText('Pending Invitations')).not.toBeInTheDocument();
  });

  it('displays "View All Invitations" button when there are more than 3 invitations', () => {
    const familyWithManyInvitations = {
      ...mockFamily,
      pendingInvitations: [
        ...mockFamily.pendingInvitations,
        {
          email: 'pending3@example.com',
          role: 'member' as const,
          invitedBy: 'user-123',
          invitedAt: '2023-05-03T12:00:00.000Z',
        },
        {
          email: 'pending4@example.com',
          role: 'member' as const,
          invitedBy: 'user-123',
          invitedAt: '2023-05-04T12:00:00.000Z',
        },
      ]
    };
    
    render(<FamilyDashboard family={familyWithManyInvitations} currentUserId="user-123" />);
    
    expect(screen.getByText('View All Invitations')).toBeInTheDocument();
  });
}); 