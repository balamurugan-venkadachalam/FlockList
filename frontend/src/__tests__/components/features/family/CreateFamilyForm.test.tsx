import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import CreateFamilyForm from '../../../../components/features/family/CreateFamilyForm';
import * as familyService from '../../../../services/familyService';

// Mock the services and hooks
vi.mock('../../../../services/familyService');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn()
  };
});

describe('CreateFamilyForm', () => {
  const mockNavigate = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(familyService.createFamily).mockResolvedValue({
      message: 'Family created successfully',
      family: {
        _id: 'family123',
        name: 'Test Family',
        createdBy: 'user123',
        members: [],
        pendingInvitations: [],
        createdAt: '2023-07-10T12:00:00Z',
        updatedAt: '2023-07-10T12:00:00Z'
      }
    });
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <CreateFamilyForm />
      </MemoryRouter>
    );
  };

  it('renders the form with correct elements', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: /Create a New Family/i })).toBeInTheDocument();
    expect(screen.getByText(/Create a family group to manage tasks/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Family Name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Family/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });

  it('handles family name input change', () => {
    renderComponent();

    const nameInput = screen.getByLabelText(/Family Name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Family' } });

    expect(nameInput).toHaveValue('Test Family');
  });

  it('shows validation error when form is submitted with empty family name', () => {
    const { container } = renderComponent();

    // Find the form and submit it directly
    const form = container.querySelector('form');
    expect(form).not.toBeNull();
    
    // Trigger form submission (with empty input)
    fireEvent.submit(form!);
    
    // Validation should prevent the API call
    expect(familyService.createFamily).not.toHaveBeenCalled();
  });

  it('shows loading state during form submission', async () => {
    renderComponent();

    // Fill the form
    const nameInput = screen.getByLabelText(/Family Name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Family' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Create Family/i });
    fireEvent.click(submitButton);

    // Should show loading state
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    // Wait for the async operation to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  it('navigates to family detail page on successful submission', async () => {
    renderComponent();

    // Fill the form
    const nameInput = screen.getByLabelText(/Family Name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Family' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Create Family/i });
    fireEvent.click(submitButton);

    // Wait for the async operation and navigation
    await waitFor(() => {
      expect(familyService.createFamily).toHaveBeenCalledWith({ name: 'Test Family' });
      expect(mockNavigate).toHaveBeenCalledWith('/families/family123', {
        state: { message: 'Family created successfully!' }
      });
    });
  });

  it('handles API errors during form submission', async () => {
    // Set up the mock to reject
    const errorMessage = 'Failed to create family';
    vi.mocked(familyService.createFamily).mockRejectedValue(new Error(errorMessage));

    renderComponent();

    // Fill the form
    const nameInput = screen.getByLabelText(/Family Name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Family' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Create Family/i });
    fireEvent.click(submitButton);

    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // Should not navigate
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('clears error message when the alert is closed', async () => {
    // Set up the mock to reject
    const errorMessage = 'Failed to create family';
    vi.mocked(familyService.createFamily).mockRejectedValue(new Error(errorMessage));

    renderComponent();

    // Fill the form and submit
    const nameInput = screen.getByLabelText(/Family Name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Family' } });
    const submitButton = screen.getByRole('button', { name: /Create Family/i });
    fireEvent.click(submitButton);

    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // Close the error alert
    const closeButton = screen.getByRole('button', { name: /Close/i });
    fireEvent.click(closeButton);

    // Error message should be removed
    expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
  });

  it('navigates back when cancel button is clicked', () => {
    renderComponent();

    // Click the cancel button
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    // Should navigate back
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('disables buttons during form submission', async () => {
    renderComponent();

    // Fill the form
    const nameInput = screen.getByLabelText(/Family Name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Family' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Create Family/i });
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(submitButton);

    // Buttons should be disabled during submission
    expect(submitButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
    expect(nameInput).toBeDisabled();

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(familyService.createFamily).toHaveBeenCalled();
    });
  });
}); 