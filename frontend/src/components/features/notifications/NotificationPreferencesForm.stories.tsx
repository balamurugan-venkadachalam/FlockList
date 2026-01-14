import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { rest } from 'msw';
import { ToastProvider } from '@/components/ui/shadcn/toast-provider';
import NotificationPreferencesForm from './NotificationPreferencesForm';

// Mock notification service responses
const mockSuccessHandlers = [
  rest.get('/api/notifications/preferences', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: {
          inApp: {
            taskCreated: true,
            deadlineApproaching: true,
            taskCompleted: true,
            memberAdded: false,
            invitationAccepted: true
          },
          email: {
            taskCreated: false,
            deadlineApproaching: true,
            taskCompleted: false,
            memberAdded: false,
            invitationAccepted: false
          },
          frequency: 'daily'
        }
      })
    );
  }),
  rest.post('/api/notifications/preferences', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ success: true })
    );
  })
];

const mockErrorHandlers = [
  rest.get('/api/notifications/preferences', (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({ message: 'Failed to load notification preferences' })
    );
  })
];

const mockLoadingHandlers = [
  rest.get('/api/notifications/preferences', (req, res, ctx) => {
    // This will cause the loading state to persist
    return res(ctx.delay('infinite'));
  })
];

const meta: Meta<typeof NotificationPreferencesForm> = {
  title: 'Features/Notifications/NotificationPreferencesForm',
  component: NotificationPreferencesForm,
  decorators: [
    (Story) => (
      <ToastProvider>
        <div className="p-4 max-w-4xl mx-auto">
          <Story />
        </div>
      </ToastProvider>
    ),
  ],
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof NotificationPreferencesForm>;

export const Default: Story = {
  parameters: {
    msw: {
      handlers: mockSuccessHandlers,
    },
  },
};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: mockLoadingHandlers,
    },
  },
};

export const Error: Story = {
  parameters: {
    msw: {
      handlers: mockErrorHandlers,
    },
  },
};

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    msw: {
      handlers: mockSuccessHandlers,
    },
  },
};

export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    msw: {
      handlers: mockSuccessHandlers,
    },
  },
};
