// React is imported by default in the test environment
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ToastProvider } from '@/components/ui/shadcn/toast-provider';
import NotificationPreferencesForm from '@/components/features/notifications/NotificationPreferencesForm';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the notification service
vi.mock('@/services/notificationService', async () => ({
  default: {
    getNotificationPreferences: vi.fn(),
    updateNotificationPreferences: vi.fn(),
  },
}));

// Mock the toast hook
const mockToast = vi.fn();
vi.mock('@/components/ui/shadcn/toast-provider', async () => {
  const actual = await vi.importActual('@/components/ui/shadcn/toast-provider');
  return {
    ...actual,
    useToast: () => ({ toast: mockToast }),
  };
});

// Import the mocked service for assertions
import notificationService from '@/services/notificationService';

describe('NotificationPreferencesForm Component', () => {
  const mockPreferences = {
    data: {
      inApp: {
        taskCreated: true,
        deadlineApproaching: true,
        taskCompleted: false,
        memberAdded: true,
        invitationAccepted: false,
      },
      email: {
        taskCreated: false,
        deadlineApproaching: true,
        taskCompleted: false,
        memberAdded: false,
        invitationAccepted: true,
      },
      frequency: 'daily',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful API response
    (notificationService.getNotificationPreferences as any).mockResolvedValue(mockPreferences);
    (notificationService.updateNotificationPreferences as any).mockResolvedValue({ success: true });
  });

  it('renders loading state initially', async () => {
    // Mock the API call to prevent it from resolving immediately
    (notificationService.getNotificationPreferences as any).mockImplementation(() => {
      return new Promise(() => {}); // Never resolves during the test
    });
    
    await act(async () => {
      render(
        <ToastProvider>
          <NotificationPreferencesForm />
        </ToastProvider>
      );
    });
    
    // Now we can check for the loading state
    const loadingText = screen.getByText(/loading notification preferences/i);
    expect(loadingText).toBeDefined();
  });

  it('loads and displays notification preferences', async () => {
    await act(async () => {
      render(
        <ToastProvider>
          <NotificationPreferencesForm />
        </ToastProvider>
      );
    });

    // Wait for the form to load
    await waitFor(() => {
      const loadingText = screen.queryByText(/loading notification preferences/i);
      expect(loadingText).toBeNull();
    });

    // Check that the form sections are rendered
    const inAppSection = screen.getByText(/in-app notifications/i, { selector: 'h3' });
    expect(inAppSection).toBeDefined();
    
    const emailSection = screen.getByText(/email notifications/i, { selector: 'h3' });
    expect(emailSection).toBeDefined();
    
    const frequencySection = screen.getByText(/notification frequency/i, { selector: 'h3' });
    expect(frequencySection).toBeDefined();

    // Check that the API was called
    expect(notificationService.getNotificationPreferences).toHaveBeenCalledTimes(1);
  });

  it('handles form submission correctly', async () => {
    await act(async () => {
      render(
        <ToastProvider>
          <NotificationPreferencesForm />
        </ToastProvider>
      );
    });

    // Wait for the form to load
    await waitFor(() => {
      const loadingText = screen.queryByText(/loading notification preferences/i);
      expect(loadingText).toBeNull();
    });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /save preferences/i });
    expect(submitButton).toBeDefined();
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Check that the API was called with the correct data
    await waitFor(() => {
      expect(notificationService.updateNotificationPreferences).toHaveBeenCalledTimes(1);
      expect(notificationService.updateNotificationPreferences).toHaveBeenCalledWith(mockPreferences.data);
    });

    // Check that the toast was shown
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'Notification preferences updated successfully',
    });
  });

  it('toggles switches correctly', async () => {
    await act(async () => {
      render(
        <ToastProvider>
          <NotificationPreferencesForm />
        </ToastProvider>
      );
    });

    // Wait for the form to load
    await waitFor(() => {
      const loadingText = screen.queryByText(/loading notification preferences/i);
      expect(loadingText).toBeNull();
    });

    // Find and toggle a switch
    const taskCreatedSwitch = screen.getByLabelText(/task created/i, { selector: '#inApp-taskCreated' });
    expect(taskCreatedSwitch).toBeDefined();
    await act(async () => {
      fireEvent.click(taskCreatedSwitch);
    });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /save preferences/i });
    expect(submitButton).toBeDefined();
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Check that the API was called with the updated data
    await waitFor(() => {
      expect(notificationService.updateNotificationPreferences).toHaveBeenCalledTimes(1);
      const expectedData = {
        ...mockPreferences.data,
        inApp: {
          ...mockPreferences.data.inApp,
          taskCreated: false, // Toggled from true to false
        },
      };
      expect(notificationService.updateNotificationPreferences).toHaveBeenCalledWith(expectedData);
    });
  });

  it('changes radio selection correctly', async () => {
    await act(async () => {
      render(
        <ToastProvider>
          <NotificationPreferencesForm />
        </ToastProvider>
      );
    });

    // Wait for the form to load
    await waitFor(() => {
      const loadingText = screen.queryByText(/loading notification preferences/i);
      expect(loadingText).toBeNull();
    });

    // Find and select a different radio option
    const weeklyRadio = screen.getByLabelText(/weekly digest/i);
    expect(weeklyRadio).toBeDefined();
    await act(async () => {
      fireEvent.click(weeklyRadio);
    });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /save preferences/i });
    expect(submitButton).toBeDefined();
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Check that the API was called with the updated data
    await waitFor(() => {
      expect(notificationService.updateNotificationPreferences).toHaveBeenCalledTimes(1);
      const expectedData = {
        ...mockPreferences.data,
        frequency: 'weekly', // Changed from 'daily' to 'weekly'
      };
      expect(notificationService.updateNotificationPreferences).toHaveBeenCalledWith(expectedData);
    });
  });

  it('handles API error correctly', async () => {
    // Mock API error
    const errorMessage = 'Failed to update preferences';
    (notificationService.updateNotificationPreferences as any).mockRejectedValue(new Error(errorMessage));

    await act(async () => {
      render(
        <ToastProvider>
          <NotificationPreferencesForm />
        </ToastProvider>
      );
    });

    // Wait for the form to load
    await waitFor(() => {
      const loadingText = screen.queryByText(/loading notification preferences/i);
      expect(loadingText).toBeNull();
    });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /save preferences/i });
    expect(submitButton).toBeDefined();
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Check that the error is displayed
    await waitFor(() => {
      const errorText = screen.getByText(/error/i);
      expect(errorText).toBeDefined();
      const errorMessageText = screen.getByText(errorMessage);
      expect(errorMessageText).toBeDefined();
    });
  });

  it('has proper ARIA attributes for accessibility', async () => {
    await act(async () => {
      render(
        <ToastProvider>
          <NotificationPreferencesForm />
        </ToastProvider>
      );
    });

    // Wait for the form to load
    await waitFor(() => {
      const loadingText = screen.queryByText(/loading notification preferences/i);
      expect(loadingText).toBeNull();
    });

    // Check form has proper role and label
    const form = screen.getByRole('form');
    expect(form).toBeDefined();
    expect(form.getAttribute('aria-label')).toBe('Notification preferences form');

    // Check section headings have proper IDs
    const inAppHeading = screen.getByText(/in-app notifications/i, { selector: 'h3' });
    expect(inAppHeading).toBeDefined();
    expect(inAppHeading.id).toBe('inapp-section');
    
    const emailHeading = screen.getByText(/email notifications/i, { selector: 'h3' });
    expect(emailHeading).toBeDefined();
    expect(emailHeading.id).toBe('email-section');
    
    // Check sections have proper aria-labelledby
    // First find the in-app section container
    const inAppContainer = screen.getByText(/notifications shown within the application/i).closest('div.space-y-4');
    expect(inAppContainer).toBeDefined();
    
    // Then find the switches section within that container
    const inAppSwitchesSection = inAppContainer?.querySelector('div.space-y-3');
    expect(inAppSwitchesSection).toBeDefined();
    expect(inAppSwitchesSection?.getAttribute('aria-labelledby')).toBe('inapp-section');
    
    // Check radio group has proper aria-labelledby
    const radioGroup = screen.getByRole('radiogroup');
    expect(radioGroup).toBeDefined();
    expect(radioGroup.getAttribute('aria-labelledby')).toBe('frequency-section');
  });
});
