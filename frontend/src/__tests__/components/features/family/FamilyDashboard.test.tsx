import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import FamilyDashboard from '../../../../components/features/family/FamilyDashboard';
import { Family, FamilyMember } from '../../../../types/family';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

describe('FamilyDashboard', () => {
  const mockMembers: FamilyMember[] = [
    {
      userId: 'user123',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin'
    },
    {
      userId: 'user456',
      email: 'parent@example.com',
      name: 'Parent User',
      role: 'admin'
    },
    {
      userId: 'user789',
      email: 'child@example.com',
      name: 'Child User',
      role: 'member'
    }
  ];

  const mockFamily: Family = {
    _id: 'family123',
    name: 'Test Family',
    createdBy: 'user123',
    members: mockMembers,
    pendingInvitations: [],
    createdAt: '2023-06-01T12:00:00Z',
    updatedAt: '2023-06-01T12:00:00Z'
  };

  it('renders the dashboard with family information', () => {
    const { container } = render(<FamilyDashboard family={mockFamily} currentUserId="user123" />);
    
    // Check for dashboard title
    expect(screen.getByText('Family Dashboard')).toBeInTheDocument();
    
    // Check for Members heading
    expect(screen.getByText('Members')).toBeInTheDocument();
    
    // Find the strong element containing the total count
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders member role distribution', () => {
    render(<FamilyDashboard family={mockFamily} currentUserId="user123" />);
    
    // Look for the chip labels directly
    expect(screen.getByText('2 Admins')).toBeInTheDocument();
    expect(screen.getByText('1 Member')).toBeInTheDocument();
  });

  it('displays quick actions section', () => {
    render(<FamilyDashboard family={mockFamily} currentUserId="user123" />);
    
    // Check for quick actions section
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
  });

  it('displays the family created date', () => {
    render(<FamilyDashboard family={mockFamily} currentUserId="user123" />);
    
    // Find the chip containing the date by its content
    const dateChip = screen.getByText(/Created on/i);
    expect(dateChip).toBeInTheDocument();
  });
  
  it('displays empty stats for families with no members', () => {
    const emptyFamily: Family = {
      ...mockFamily,
      members: []
    };
    
    render(<FamilyDashboard family={emptyFamily} currentUserId="user123" />);
    
    // Find the text showing zero members
    expect(screen.getByText('0')).toBeInTheDocument();
    
    // Check for 0 in role chip labels
    expect(screen.getByText('0 Admins')).toBeInTheDocument();
    expect(screen.getByText('0 Members')).toBeInTheDocument();
  });
}); 