import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import TasksPage from '../../pages/TasksPage';
import * as taskService from '../../services/taskService';
import { Task, TasksResponse } from '../../services/taskService';
import { TaskStatus } from '../../types/task';
import { useAuth } from '../../context/AuthContext';

// Mock the taskService and AuthContext
vi.mock('../../services/taskService');
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

// Create a mockable useLocation
let locationState: any = null;

// Mock React Router's useLocation
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => ({
      pathname: '/tasks',
      state: locationState
    })
  };
});

// Mock the MUI Select component for easier testing
vi.mock('@mui/material', async () => {
  const actual = await vi.importActual('@mui/material');
  return {
    ...actual,
    Select: vi.fn().mockImplementation(({ children, name, onChange, value, 'aria-label': ariaLabel, labelId }) => (
      <select 
        name={name || 'status-filter'} 
        value={value} 
        onChange={(e) => onChange({ target: { value: e.target.value } })}
        aria-label={ariaLabel || labelId}
        data-testid={`select-${name || 'status-filter'}`}
      >
        {children}
      </select>
    )),
    MenuItem: vi.fn().mockImplementation(({ children, value }) => (
      <option value={value}>{children}</option>
    ))
  };
});

describe('TasksPage', () => {
  const mockTasks: Task[] = [
    {
      _id: 'task1',
      title: 'Test Task 1',
      description: 'Description for test task 1',
      status: 'pending' as TaskStatus,
      priority: 'high',
      family: 'family1',
      assignees: [
        {
          _id: 'user1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com'
        }
      ],
      category: 'chore',
      createdBy: {
        _id: 'user1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'task2',
      title: 'Test Task 2',
      description: 'Description for test task 2',
      status: 'in_progress' as TaskStatus,
      priority: 'medium',
      family: 'family1',
      assignees: [],
      category: 'homework',
      createdBy: {
        _id: 'user1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'task3',
      title: 'Test Task 3',
      description: 'Description for test task 3',
      status: 'completed' as TaskStatus,
      priority: 'low',
      family: 'family1',
      assignees: [
        {
          _id: 'user2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com'
        }
      ],
      category: 'activity',
      createdBy: {
        _id: 'user1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset location state
    locationState = null;
    
    // Mock the auth context with a parent user
    vi.mocked(useAuth).mockReturnValue({
      user: {
        _id: 'user1',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'parent'
      },
      token: 'mock-token',
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      googleLogin: vi.fn(),
      clearError: vi.fn()
    });
    
    // Mock the getTasks function to return test data
    vi.mocked(taskService.getTasks).mockResolvedValue({
      message: 'Tasks retrieved',
      tasks: mockTasks
    });
  });

  const renderWithRouter = (component: React.ReactNode) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  it('renders loading state initially', async () => {
    // Mock the getTasks function to delay so we can check the loading state
    // Create a promise that doesn't resolve immediately
    const loadingPromise = new Promise<taskService.TasksResponse>((resolve) => {
      setTimeout(() => {
        resolve({
          message: 'Tasks retrieved',
          tasks: mockTasks
        });
      }, 100);
    });

    vi.mocked(taskService.getTasks).mockReturnValueOnce(loadingPromise);
    
    renderWithRouter(<TasksPage />);
    
    // Check for loading indicator
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    // Wait for tasks to load
    await waitFor(() => {
      expect(taskService.getTasks).toHaveBeenCalledTimes(1);
    });
  });

  it('displays tasks after loading', async () => {
    await act(async () => {
      renderWithRouter(<TasksPage />);
    });
    
    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Check if task cards are rendered
    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    expect(screen.getByText('Test Task 3')).toBeInTheDocument();
    
    // Check for task descriptions
    expect(screen.getByText(/Description for test task 1/)).toBeInTheDocument();
    
    // Check for status chips
    expect(screen.getByText('pending')).toBeInTheDocument();
    expect(screen.getByText('in progress')).toBeInTheDocument();
    expect(screen.getByText('completed')).toBeInTheDocument();
  });

  it('shows Create Task button for parent users', async () => {
    await act(async () => {
      renderWithRouter(<TasksPage />);
    });
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('Create Task')).toBeInTheDocument();
  });

  it('hides Create Task button for child users', async () => {
    // Mock the auth context with a child user
    vi.mocked(useAuth).mockReturnValue({
      user: {
        _id: 'user2',
        email: 'jane@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'child'
      },
      token: 'mock-token',
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      googleLogin: vi.fn(),
      clearError: vi.fn()
    });
    
    await act(async () => {
      renderWithRouter(<TasksPage />);
    });
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    expect(screen.queryByText('Create Task')).not.toBeInTheDocument();
  });

  it('filters tasks by status', async () => {
    // Mock getTasks to return different results for different filter values
    vi.mocked(taskService.getTasks)
      .mockImplementation(async (params?: taskService.TaskQueryParams): Promise<TasksResponse> => {
        if (params?.status === 'pending') {
          return {
            message: 'Tasks retrieved',
            tasks: [mockTasks[0]]
          };
        } else if (params?.status === 'in_progress') {
          return {
            message: 'Tasks retrieved',
            tasks: [mockTasks[1]]
          };
        } else if (params?.status === 'completed') {
          return {
            message: 'Tasks retrieved',
            tasks: [mockTasks[2]]
          };
        } else {
          return {
            message: 'Tasks retrieved',
            tasks: mockTasks
          };
        }
      });
    
    await act(async () => {
      renderWithRouter(<TasksPage />);
    });
    
    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Initially all tasks should be displayed
    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    expect(screen.getByText('Test Task 3')).toBeInTheDocument();
    
    // Change the filter to 'pending'
    await act(async () => {
      fireEvent.change(screen.getByTestId('select-status-filter'), {
        target: { value: 'pending' }
      });
    });
    
    // Wait for filtered tasks to load
    await waitFor(() => {
      expect(taskService.getTasks).toHaveBeenCalledWith({ status: 'pending' });
    });
    
    // Check if only pending task is displayed
    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Task 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Test Task 3')).not.toBeInTheDocument();
    });
  });

  it('displays "No tasks found" when there are no tasks', async () => {
    // Mock getTasks to return empty array
    vi.mocked(taskService.getTasks).mockResolvedValueOnce({
      message: 'No tasks found',
      tasks: []
    });
    
    await act(async () => {
      renderWithRouter(<TasksPage />);
    });
    
    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('No tasks found')).toBeInTheDocument();
  });

  it('displays error message when task fetching fails', async () => {
    // Mock getTasks to throw an error
    vi.mocked(taskService.getTasks).mockRejectedValueOnce('Failed to fetch tasks');
    
    await act(async () => {
      renderWithRouter(<TasksPage />);
    });
    
    // Wait for error to appear
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('Failed to fetch tasks')).toBeInTheDocument();
  });

  it('displays notification when provided in location state', async () => {
    // Set the location state with notification
    locationState = {
      notification: {
        type: 'success',
        message: 'Task created successfully!'
      }
    };
    
    await act(async () => {
      renderWithRouter(<TasksPage />);
    });
    
    // Check for notification message
    await waitFor(() => {
      expect(screen.getByText('Task created successfully!')).toBeInTheDocument();
    });
  });
}); 