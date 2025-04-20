import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import FlockDashboard from '../../../../components/features/flock/FlockDashboard';
import { Flock, FlockMember } from '../../../../types/flock';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

describe('FlockDashboard', () => {
  const mockMembers: FlockMember[] = [
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

  const mockFlock: Flock = {
    _id: 'flock123',
    name: 'Test Flock',
    createdBy: 'user123',
    members: mockMembers,
    pendingInvitations: [],
    createdAt: '2023-06-01T12:00:00Z',
    updatedAt: '2023-06-01T12:00:00Z'
  };

  it('renders the dashboard with flock information', () => {
    const { container } = render(<FlockDashboard flock={mockFlock} currentUserId="user123" />);
    
    // Check for dashboard title
    expect(screen.getByText('Flock Dashboard')).toBeInTheDocument();
    
    // Check for Members heading
    expect(screen.getByText('Members')).toBeInTheDocument();
    
    // Find the strong element containing the total count
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders member role distribution', () => {
    render(<FlockDashboard flock={mockFlock} currentUserId="user123" />);
    
    // Look for the chip labels directly
    expect(screen.getByText('2 Admins')).toBeInTheDocument();
    expect(screen.getByText('1 Member')).toBeInTheDocument();
  });

  it('displays quick actions section', () => {
    render(<FlockDashboard flock={mockFlock} currentUserId="user123" />);
    
    // Check for quick actions section
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
  });

  it('displays the flock created date', () => {
    render(<FlockDashboard flock={mockFlock} currentUserId="user123" />);
    
    // Find the chip containing the date by its content
    const dateChip = screen.getByText(/Created on/i);
    expect(dateChip).toBeInTheDocument();
  });
  
  it('displays empty stats for families with no members', () => {
    const emptyFlock: Flock = {
      ...mockFlock,
      members: []
    };
    
    render(<FlockDashboard flock={emptyFlock} currentUserId="user123" />);
    
    // Find the text showing zero members
    expect(screen.getByText('0')).toBeInTheDocument();
    
    // Check for 0 in role chip labels
    expect(screen.getByText('0 Admins')).toBeInTheDocument();
    expect(screen.getByText('0 Members')).toBeInTheDocument();
  });
}); 