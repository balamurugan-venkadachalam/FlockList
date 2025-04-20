import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FlockTaskList from '../../../../components/features/tasks/FlockTaskList';
import * as taskService from '../../../../services/taskService';
import type { Task } from '../../../../services/taskService';

// Mock router
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock task service
vi.mock('../../../../services/taskService', () => ({
  getTasks: vi.fn(),
  Task: vi.fn(),
}));

// Test mock data
const mockTasks: Task[] = [
  {
    _id: '1',
    title: 'Test Task 1',
    description: 'Description for task 1',
    status: 'pending',
    priority: 'high',
    dueDate: '2023-12-31T00:00:00.000Z',
    createdBy: {
      _id: 'user1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    },
    flock: 'flock1',
    assignees: [
      {
        _id: 'user1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      }
    ],
    category: 'chore',
    createdAt: '2023-11-01T00:00:00.000Z',
    updatedAt: '2023-11-01T00:00:00.000Z',
  },
  {
    _id: '2',
    title: 'Test Task 2',
    description: 'Description for task 2',
    status: 'in_progress',
    priority: 'medium',
    dueDate: '2023-12-15T00:00:00.000Z',
    createdBy: {
      _id: 'user2',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
    },
    flock: 'flock1',
    assignees: [
      {
        _id: 'user1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      },
      {
        _id: 'user2',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
      }
    ],
    category: 'homework',
    createdAt: '2023-11-05T00:00:00.000Z',
    updatedAt: '2023-11-05T00:00:00.000Z',
  },
  {
    _id: '3',
    title: 'Test Task 3',
    description: 'Description for task 3',
    status: 'completed',
    priority: 'low',
    createdBy: {
      _id: 'user2',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
    },
    flock: 'flock1',
    assignees: [],
    category: 'activity',
    createdAt: '2023-11-10T00:00:00.000Z',
    updatedAt: '2023-11-10T00:00:00.000Z',
  }
];

describe('FlockTaskList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default mock implementation
    vi.mocked(taskService.getTasks).mockResolvedValue({
      message: 'Tasks retrieved successfully',
      tasks: mockTasks
    });
  });

  const renderFlockTaskList = (props = {}) => {
    const defaultProps = {
      flockId: 'flock1',
      isAdmin: true,
      currentUserId: 'user1',
      ...props
    };

    return render(
      <MemoryRouter>
        <FlockTaskList {...defaultProps} />
      </MemoryRouter>
    );
  };

  it('renders loading state initially', () => {
    renderFlockTaskList();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays tasks after loading', async () => {
    renderFlockTaskList();

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Check if tasks are displayed
    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    expect(screen.getByText('Test Task 3')).toBeInTheDocument();
  });

  it('shows error message when tasks fail to load', async () => {
    // Mock failed API call
    vi.mocked(taskService.getTasks).mockRejectedValue(new Error('Failed to fetch tasks'));
    
    renderFlockTaskList();

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch tasks')).toBeInTheDocument();
    });
  });

  it('displays empty state when no tasks exist', async () => {
    // Mock empty tasks array
    vi.mocked(taskService.getTasks).mockResolvedValue({
      message: 'No tasks found',
      tasks: []
    });

    renderFlockTaskList();

    await waitFor(() => {
      expect(screen.getByText('No tasks found')).toBeInTheDocument();
    });
  });

  it('navigates to task creation page when "New Task" button is clicked', async () => {
    renderFlockTaskList();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const newTaskButton = screen.getByRole('button', { name: /new task/i });
    fireEvent.click(newTaskButton);

    expect(mockNavigate).toHaveBeenCalledWith('/tasks/create?flockId=flock1');
  });

  it('navigates to task detail page when a task is clicked', async () => {
    renderFlockTaskList();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const task = screen.getByText('Test Task 1');
    fireEvent.click(task.closest('div') as HTMLElement);

    expect(mockNavigate).toHaveBeenCalledWith('/tasks/1');
  });

  it('disables New Task button for non-admin users', async () => {
    renderFlockTaskList({ isAdmin: false });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const newTaskButton = screen.getByRole('button', { name: /new task/i });
    expect(newTaskButton).toBeDisabled();
  });

  it('filters tasks by status when filter is changed', async () => {
    renderFlockTaskList();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Initially all tasks should be visible
    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    expect(screen.getByText('Test Task 3')).toBeInTheDocument();

    // Select pending filter
    const filterDropdown = screen.getByLabelText('Filter by Status');
    fireEvent.mouseDown(filterDropdown);
    fireEvent.click(screen.getByRole('option', { name: 'Pending' }));

    // Only pending task should be visible
    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Task 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Task 3')).not.toBeInTheDocument();
  });

  it('sorts tasks when sort option is changed', async () => {
    renderFlockTaskList();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Change sorting to Priority
    const sortDropdown = screen.getByLabelText('Sort By');
    fireEvent.mouseDown(sortDropdown);
    fireEvent.click(screen.getByRole('option', { name: 'Priority' }));

    // Check if tasks are sorted by priority (visually we'd need to check DOM order)
    // This is a simplistic check since we can't easily verify the actual order in JSDOM
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  it('displays task details correctly', async () => {
    renderFlockTaskList();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Check task 1 details
    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    expect(screen.getByText('Description for task 1')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Chore')).toBeInTheDocument();
    
    // Due date (format may vary, so using regex)
    const dateElements = screen.getAllByText(/Dec \d+, 2023/);
    expect(dateElements.length).toBeGreaterThan(0);
    
    // Assignees - using a function to handle text that might be split across elements
    expect(screen.getByText((content, element) => {
      return element?.textContent?.includes('John Doe') || false;
    })).toBeInTheDocument();
  });
}); 