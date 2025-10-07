import { StoryObj, Meta } from '@storybook/react';
import TaskCreatePage from './TaskCreatePage';
import { http } from 'msw';

// Import handlers from our modular MSW setup
import { taskHandlers, flockHandlers } from '../mocks/handlers';

// Import story utilities
import { 
  createAuthDecorator, 
  baseUrl
} from '../utils/storyUtils';

// Custom handlers for task creation scenarios

const createTaskErrorHandler = http.post(`${baseUrl}/api/tasks`, async () => {
  return Response.json({
    message: 'Failed to create task'
  }, { status: 500 });
});

const createTaskValidationErrorHandler = http.post(`${baseUrl}/api/tasks`, async () => {
  return Response.json({
    message: 'Validation error',
    errors: {
      title: 'Title is required',
      priority: 'Invalid priority value'
    }
  }, { status: 400 });
});

// Loading handler
const loadingHandler = http.post(`${baseUrl}/api/tasks`, async () => {
  // Never resolve to simulate loading
  await new Promise(() => {});
  return new Response(null);
});

const meta: Meta<typeof TaskCreatePage> = {
  title: 'Pages/TaskCreatePage',
  component: TaskCreatePage,
  decorators: [createAuthDecorator({ isAuthenticated: true })],
  parameters: {
    msw: {
      handlers: [...taskHandlers, ...flockHandlers]
    },
    layout: 'fullscreen',
    // Mock router for navigation
    reactRouter: {
      routePath: '/tasks/create',
      browserPath: '/tasks/create',
      searchParams: {}
    }
  },
};

export default meta;
type Story = StoryObj<typeof TaskCreatePage>;

// Define stories
export const Default: Story = {};

export const WithServerError: Story = {
  parameters: {
    msw: {
      handlers: [
        createTaskErrorHandler,
        ...taskHandlers,
        ...flockHandlers
      ]
    }
  }
};

export const WithValidationError: Story = {
  parameters: {
    msw: {
      handlers: [
        createTaskValidationErrorHandler,
        ...taskHandlers,
        ...flockHandlers
      ]
    }
  }
};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        loadingHandler,
        ...taskHandlers,
        ...flockHandlers
      ]
    }
  }
};

export const AdminView: Story = {
  decorators: [createAuthDecorator({ isAuthenticated: true, role: 'admin' })]
};
