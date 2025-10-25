import { StoryObj, Meta } from '@storybook/react';
import FlockDetailPage from './FlockDetailPage';
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import handlers from our modular MSW setup
import { flockHandlers, flockNotFoundHandler, flockDetailErrorHandler, flockLoadingHandler } from '../mocks/handlers';

// Helper function to create a story decorator
// AuthProvider is now provided globally in preview.tsx
const createDecorator = () => {
  return (Story: React.ComponentType): React.ReactElement => {
    return (
      <Routes>
        <Route path="/flocks/:id" element={<FlockDetailPage />} />
      </Routes>
    );
  };
};

// Note: AuthProvider is provided globally in preview.tsx
// MSW handlers are imported from mocks/handlers/flockHandlers.ts

const meta: Meta<typeof FlockDetailPage> = {
  title: 'Pages/FlockDetailPage',
  component: FlockDetailPage,
  decorators: [createDecorator()],
  parameters: {
    msw: {
      handlers: flockHandlers
    },
    layout: 'fullscreen',
    // Mock router params
    reactRouter: {
      routePath: '/flocks/:id',
      routeParams: { id: 'flock1' },
      location: '/flocks/flock1'
    }
  },
};

export default meta;
type Story = StoryObj<typeof FlockDetailPage>;

// Define stories
export const Default: Story = {
  parameters: {
    reactRouter: {
      routePath: '/flocks/:id',
      routeParams: { id: 'flock1' },
      location: '/flocks/flock1'
    }
  }
};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [flockLoadingHandler]
    },
    reactRouter: {
      routePath: '/flocks/:id',
      routeParams: { id: 'loading' },
      location: '/flocks/loading'
    }
  }
};

export const NotFound: Story = {
  parameters: {
    msw: {
      handlers: [flockNotFoundHandler]
    },
    reactRouter: {
      routePath: '/flocks/:id',
      routeParams: { id: 'notfound' },
      location: '/flocks/notfound'
    }
  }
};

export const Error: Story = {
  parameters: {
    msw: {
      handlers: [flockDetailErrorHandler]
    },
    reactRouter: {
      routePath: '/flocks/:id',
      routeParams: { id: 'error' },
      location: '/flocks/error'
    }
  }
};

export const AdminView: Story = {
  parameters: {
    reactRouter: {
      routePath: '/flocks/:id',
      routeParams: { id: 'flock1' },
      location: '/flocks/flock1'
    },
    docs: {
      description: {
        story: 'Flock detail view for an admin user (uses same mock as default for now).'
      }
    }
  }
};
