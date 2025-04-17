import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import InviteMemberForm from '../../../../components/features/family/InviteMemberForm';
import { InviteMemberFormData } from '../../../../types/family';

describe('InviteMemberForm', () => {
  const mockFamilyId = 'family123';
  const mockOnInviteMember = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnInviteMember.mockResolvedValue(undefined);
  });

  it('renders the form with default values', () => {
    render(
      <InviteMemberForm
        familyId={mockFamilyId}
        onInviteMember={mockOnInviteMember}
      />
    );

    // Check that the form elements are rendered
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Regular Member/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Administrator/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Invitation/i })).toBeInTheDocument();

    // The email field should be empty
    expect(screen.getByLabelText(/Email Address/i)).toHaveValue('');
    
    // The "Regular Member" radio should be selected by default
    expect(screen.getByLabelText(/Regular Member/i)).toBeChecked();
    expect(screen.getByLabelText(/Administrator/i)).not.toBeChecked();
  });

  it('updates form values when user inputs data', () => {
    render(
      <InviteMemberForm
        familyId={mockFamilyId}
        onInviteMember={mockOnInviteMember}
      />
    );

    // Type an email
    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(emailInput).toHaveValue('test@example.com');

    // Change the role to Administrator
    const adminRadio = screen.getByLabelText(/Administrator/i);
    fireEvent.click(adminRadio);
    expect(adminRadio).toBeChecked();
    expect(screen.getByLabelText(/Regular Member/i)).not.toBeChecked();
  });

  it('disables the send button when email is empty', () => {
    render(
      <InviteMemberForm
        familyId={mockFamilyId}
        onInviteMember={mockOnInviteMember}
      />
    );

    // The button should be disabled when email is empty
    expect(screen.getByRole('button', { name: /Send Invitation/i })).toBeDisabled();

    // Type an email
    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    // Button should now be enabled
    expect(screen.getByRole('button', { name: /Send Invitation/i })).not.toBeDisabled();
  });

  it('calls onInviteMember with correct data when form is submitted', async () => {
    render(
      <InviteMemberForm
        familyId={mockFamilyId}
        onInviteMember={mockOnInviteMember}
      />
    );

    // Type an email
    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    // Change the role to Administrator
    const adminRadio = screen.getByLabelText(/Administrator/i);
    fireEvent.click(adminRadio);

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Send Invitation/i });
    fireEvent.click(submitButton);

    // Check that onInviteMember was called with the correct data
    expect(mockOnInviteMember).toHaveBeenCalledWith(mockFamilyId, {
      email: 'test@example.com',
      role: 'admin'
    });

    // Check that the button shows loading state
    expect(screen.getByRole('button', { name: /Sending/i })).toBeInTheDocument();

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Send Invitation/i })).toBeInTheDocument();
    });
  });

  it('shows success message when invitation is sent', async () => {
    render(
      <InviteMemberForm
        familyId={mockFamilyId}
        onInviteMember={mockOnInviteMember}
      />
    );

    // Type an email and submit the form
    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    const submitButton = screen.getByRole('button', { name: /Send Invitation/i });
    fireEvent.click(submitButton);

    // Wait for the success message to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Invitation sent to test@example.com/i)).toBeInTheDocument();
    });

    // Form should be reset
    expect(emailInput).toHaveValue('');
    expect(screen.getByLabelText(/Regular Member/i)).toBeChecked();
  });

  it('shows error message when invitation fails', async () => {
    // Set up the mock to reject
    const errorMessage = 'Failed to send invitation';
    mockOnInviteMember.mockRejectedValue(new Error(errorMessage));

    render(
      <InviteMemberForm
        familyId={mockFamilyId}
        onInviteMember={mockOnInviteMember}
      />
    );

    // Type an email and submit the form
    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    const submitButton = screen.getByRole('button', { name: /Send Invitation/i });
    fireEvent.click(submitButton);

    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // Form should not be reset on error
    expect(emailInput).toHaveValue('test@example.com');
  });
}); 