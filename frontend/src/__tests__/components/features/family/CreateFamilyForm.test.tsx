import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import CreateFlockForm from '../../../../components/features/flock/CreateFlockForm';
import * as flockService from '../../../../services/flockService';

// Mock the services and hooks
vi.mock('../../../../services/flockService');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn()
  };
});

describe('CreateFlockForm', () => {
  const mockNavigate = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(flockService.createFlock).mockResolvedValue({
      message: 'Flock created successfully',
      flock: {
        _id: 'flock123',
        name: 'Test Flock',
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
        <CreateFlockForm />
      </MemoryRouter>
    );
  };

  it('renders the form with correct elements', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: /Create a New Flock/i })).toBeInTheDocument();
    expect(screen.getByText(/Create a flock group to manage tasks/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Flock Name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Flock/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });

  it('handles flock name input change', () => {
    renderComponent();

    const nameInput = screen.getByLabelText(/Flock Name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Flock' } });

    expect(nameInput).toHaveValue('Test Flock');
  });

  it('shows validation error when form is submitted with empty flock name', () => {
    const { container } = renderComponent();

    // Find the form and submit it directly
    const form = container.querySelector('form');
    expect(form).not.toBeNull();
    
    // Trigger form submission (with empty input)
    fireEvent.submit(form!);
    
    // Validation should prevent the API call
    expect(flockService.createFlock).not.toHaveBeenCalled();
  });

  it('shows loading state during form submission', async () => {
    renderComponent();

    // Fill the form
    const nameInput = screen.getByLabelText(/Flock Name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Flock' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Create Flock/i });
    fireEvent.click(submitButton);

    // Should show loading state
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    // Wait for the async operation to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  it('navigates to flock detail page on successful submission', async () => {
    renderComponent();

    // Fill the form
    const nameInput = screen.getByLabelText(/Flock Name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Flock' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Create Flock/i });
    fireEvent.click(submitButton);

    // Wait for the async operation and navigation
    await waitFor(() => {
      expect(flockService.createFlock).toHaveBeenCalledWith({ name: 'Test Flock' });
      expect(mockNavigate).toHaveBeenCalledWith('/flocks/flock123', {
        state: { message: 'Flock created successfully!' }
      });
    });
  });

  it('handles API errors during form submission', async () => {
    // Set up the mock to reject
    const errorMessage = 'Failed to create flock';
    vi.mocked(flockService.createFlock).mockRejectedValue(new Error(errorMessage));

    renderComponent();

    // Fill the form
    const nameInput = screen.getByLabelText(/Flock Name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Flock' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Create Flock/i });
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
    const errorMessage = 'Failed to create flock';
    vi.mocked(flockService.createFlock).mockRejectedValue(new Error(errorMessage));

    renderComponent();

    // Fill the form and submit
    const nameInput = screen.getByLabelText(/Flock Name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Flock' } });
    const submitButton = screen.getByRole('button', { name: /Create Flock/i });
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
    const nameInput = screen.getByLabelText(/Flock Name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Flock' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Create Flock/i });
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(submitButton);

    // Buttons should be disabled during submission
    expect(submitButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
    expect(nameInput).toBeDisabled();

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(flockService.createFlock).toHaveBeenCalled();
    });
  });
}); 