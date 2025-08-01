// Rule: Write concise, technical TypeScript code with accurate examples
// Rule: Use functional and declarative programming patterns
// Rule: Use descriptive variable names with auxiliary verbs

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import TaskCreateForm from '@/components/features/tasks/TaskCreateForm';
import { formSchema, TaskFormData } from '@/components/features/tasks/TaskForm';
import * as taskService from '@/services/taskService';
import * as flockService from '@/services/flockService';
import { Flock } from '@/types/models/flock';
import React from 'react';

// Mock services
vi.mock('@/services/taskService');
vi.mock('@/services/flockService');

const mockFlocks: Flock[] = [
  {
    _id: 'flock1',
    name: 'The Avengers',
    createdBy: 'tony_stark',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    members: [
      { _id: 'member1', user: { _id: 'user1', email: 'ironman@avengers.com', firstName: 'Tony', lastName: 'Stark' }, role: 'admin', joinedAt: new Date().toISOString() },
      { _id: 'member2', user: { _id: 'user2', email: 'cap@avengers.com', firstName: 'Steve', lastName: 'Rogers' }, role: 'member', joinedAt: new Date().toISOString() },
    ],
  },
  {
    _id: 'flock2',
    name: 'Justice League',
    createdBy: 'bruce_wayne',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    members: [
      { _id: 'member3', user: { _id: 'user3', email: 'superman@jl.com', firstName: 'Clark', lastName: 'Kent' }, role: 'admin', joinedAt: new Date().toISOString() },
      { _id: 'member4', user: { _id: 'user4', email: 'batman@jl.com', firstName: 'Bruce', lastName: 'Wayne' }, role: 'member', joinedAt: new Date().toISOString() },
    ],
  },
];

// A wrapper component to provide the react-hook-form context
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const form = useForm<TaskFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      category: 'chore',
      flockId: '',
      assignees: [],
      dueDate: null,
    },
  });

  return <FormProvider {...form}>{children}</FormProvider>;
};

describe('TaskCreateForm', () => {
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(flockService.getFamilies).mockResolvedValue(mockFlocks as Flock[]);
    vi.mocked(taskService.createTask).mockResolvedValue({} as any);
  });

  const renderComponent = () => {
    render(
      <TestWrapper>
        <TaskCreateForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      </TestWrapper>
    );
  };

  it('should render the form with initial values', async () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: /create new task/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    
    await waitFor(() => {
        expect(screen.getByLabelText(/flock/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/assignees/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pick a date/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should show validation errors for required fields', async () => {
    const user = userEvent.setup();
    renderComponent();

    const createTaskButton = screen.getByRole('button', { name: /create task/i });
    await user.click(createTaskButton);

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
      expect(screen.getByText('Flock is required')).toBeInTheDocument();
    });

    expect(taskService.createTask).not.toHaveBeenCalled();
  });

  it('should submit the form with valid data', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(flockService.getFamilies).toHaveBeenCalled();
    });

    // Fill out the form
    await user.type(screen.getByLabelText(/title/i), 'New Test Task');
    
    const flockSelect = screen.getByLabelText(/flock/i);
    await user.click(flockSelect);
    const flockSelectContent = await screen.findByTestId('flock-select-content');
    await user.click(within(flockSelectContent).getByText('The Avengers'));

    const prioritySelect = screen.getByLabelText(/priority/i);
    await user.click(prioritySelect);
    await user.click(await screen.findByText('High'));

    // Submit
    const createTaskButton = screen.getByRole('button', { name: /create task/i });
    await user.click(createTaskButton);

    await waitFor(() => {
      expect(taskService.createTask).toHaveBeenCalledWith(expect.objectContaining({
        title: 'New Test Task',
        flockId: 'flock1',
        priority: 'high',
      }));
    });

    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('should handle API errors on submission', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Network Error';
    vi.mocked(taskService.createTask).mockRejectedValue(new Error(errorMessage));
    
    renderComponent();

    await waitFor(() => expect(flockService.getFamilies).toHaveBeenCalled());

    // Fill out the form
    await user.type(screen.getByLabelText(/title/i), 'Another Task');
    const flockSelect = screen.getByLabelText(/flock/i);
    await user.click(flockSelect);
    const flockSelectContent = await screen.findByTestId('flock-select-content');
    await user.click(within(flockSelectContent).getByText('Justice League'));

    // Submit
    const createTaskButton = screen.getByRole('button', { name: /create task/i });
    await user.click(createTaskButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/failed to save task/i)).toBeInTheDocument();
    });

    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('should call onCancel when the cancel button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });
});
