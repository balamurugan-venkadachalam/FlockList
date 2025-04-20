import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import TaskCreateForm from '../../../../components/features/tasks/TaskCreateForm';
import * as flockService from '../../../../services/flockService';
import * as taskService from '../../../../services/taskService';
import { Flock } from '../../../../types/flock';
import userEvent from '@testing-library/user-event';

// Mock the services
vi.mock('../../../../services/flockService');
vi.mock('../../../../services/taskService');
vi.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: vi.fn().mockImplementation(({ label, onChange }) => (
    <div data-testid="mock-date-picker">
      <label>{label}</label>
      <input data-testid="date-input" type="date" onChange={(e) => onChange(new Date(e.target.value))} />
    </div>
  ))
}));
vi.mock('@mui/x-date-pickers/LocalizationProvider', () => ({
  LocalizationProvider: vi.fn().mockImplementation(({ children }) => children)
}));
vi.mock('@mui/x-date-pickers/AdapterDateFns', () => ({
  AdapterDateFns: vi.fn()
}));

// Mock the MUI Select component to make it easier to test
vi.mock('@mui/material', async () => {
  const actual = await vi.importActual('@mui/material');
  return {
    ...actual,
    Select: vi.fn().mockImplementation(({ children, name, onChange, value, 'aria-label': ariaLabel }) => (
      <select 
        name={name} 
        value={value} 
        onChange={onChange} 
        aria-label={ariaLabel || name}
        data-testid={`select-${name}`}
      >
        {children}
      </select>
    )),
    MenuItem: vi.fn().mockImplementation(({ children, value }) => (
      <option value={value}>{children}</option>
    ))
  };
});

describe('TaskCreateForm', () => {
  const mockFamilies: Partial<Flock>[] = [
    { 
      _id: 'flock1', 
      name: 'Test Flock 1',
      createdBy: 'user1',
      members: [],
      pendingInvitations: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    { 
      _id: 'flock2', 
      name: 'Test Flock 2',
      createdBy: 'user1',
      members: [],
      pendingInvitations: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock the getFamilies function to return test data
    vi.mocked(flockService.getFamilies).mockResolvedValue({
      message: 'Families retrieved',
      families: mockFamilies as Flock[]
    });
    
    // Mock the createTask function
    vi.mocked(taskService.createTask).mockResolvedValue({
      message: 'Task created',
      task: {
        _id: 'task1',
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
        priority: 'medium',
        flock: 'flock1',
        assignees: [],
        category: 'other',
        createdBy: {
          _id: 'user1',
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
  });
  
  it('renders correctly with all form elements', async () => {
    await act(async () => {
      render(<TaskCreateForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
    });
    
    // Check if the main elements are rendered
    expect(screen.getByText('Create New Task')).toBeInTheDocument();
    expect(screen.getByLabelText('Task Title *')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    
    // Wait for families to load
    await waitFor(() => {
      expect(flockService.getFamilies).toHaveBeenCalledTimes(1);
    });
    
    // Check for the buttons
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Create Task')).toBeInTheDocument();
  });
  
  it('validates form and shows error messages', async () => {
    await act(async () => {
      render(<TaskCreateForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
    });
    
    // Try to submit without filling required fields
    await act(async () => {
      fireEvent.click(screen.getByText('Create Task'));
    });
    
    // Check for validation errors
    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(screen.getByText('Flock is required')).toBeInTheDocument();
    
    // Verify task was not created
    expect(taskService.createTask).not.toHaveBeenCalled();
  });
  
  it('allows cancelling the form', async () => {
    await act(async () => {
      render(<TaskCreateForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
    });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Cancel'));
    });
    
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
  
  it('submits the form successfully with valid data', async () => {
    await act(async () => {
      render(<TaskCreateForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
    });
    
    // Wait for families to load
    await waitFor(() => {
      expect(flockService.getFamilies).toHaveBeenCalledTimes(1);
    });
    
    // Fill in required fields
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Task Title *'), {
        target: { name: 'title', value: 'Test Task' }
      });
      
      // Use our mocked select
      fireEvent.change(screen.getByTestId('select-flockId'), {
        target: { value: 'flock1' }
      });
    });
    
    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByText('Create Task'));
    });
    
    // Check if the task was created with correct data
    await waitFor(() => {
      expect(taskService.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Task',
          flockId: 'flock1',
          priority: 'medium',
          category: 'other'
        })
      );
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });
  });
  
  it('handles API errors during submission', async () => {
    // Mock the createTask function to throw an error
    vi.mocked(taskService.createTask).mockRejectedValue('Failed to create task');
    
    await act(async () => {
      render(<TaskCreateForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
    });
    
    // Wait for families to load
    await waitFor(() => {
      expect(flockService.getFamilies).toHaveBeenCalledTimes(1);
    });
    
    // Fill in required fields
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Task Title *'), {
        target: { name: 'title', value: 'Test Task' }
      });
      
      // Use our mocked select
      fireEvent.change(screen.getByTestId('select-flockId'), {
        target: { value: 'flock1' }
      });
    });
    
    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByText('Create Task'));
    });
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to create task')).toBeInTheDocument();
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });
  
  it('handles date selection correctly', async () => {
    await act(async () => {
      render(<TaskCreateForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
    });
    
    // Wait for families to load
    await waitFor(() => {
      expect(flockService.getFamilies).toHaveBeenCalledTimes(1);
    });
    
    // Fill in required fields
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Task Title *'), {
        target: { name: 'title', value: 'Test Task' }
      });
      
      // Use our mocked select
      fireEvent.change(screen.getByTestId('select-flockId'), {
        target: { value: 'flock1' }
      });
      
      // Set the date
      const dateInput = screen.getByTestId('date-input');
      fireEvent.change(dateInput, { target: { value: '2023-12-31' } });
    });
    
    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByText('Create Task'));
    });
    
    // Check if the task was created with the correct date
    await waitFor(() => {
      expect(taskService.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Task',
          flockId: 'flock1',
          dueDate: expect.any(String)
        })
      );
      // The exact date string format might vary, so we just check that it contains 2023-12-31
      const callArgs = vi.mocked(taskService.createTask).mock.calls[0][0];
      expect(callArgs.dueDate).toContain('2023-12-31');
    });
  });
}); 