import React, { ReactElement } from 'react';
import { render, RenderOptions, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ToastProvider } from '@/components/ui/shadcn/toast-provider';
import { MemoryRouter } from 'react-router-dom';
import { expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

/**
 * Custom render function that wraps components with necessary providers
 * @param ui - The React component to render
 * @param options - Additional render options
 * @param route - Initial route for MemoryRouter
 * @returns The render result
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
  { route = '/' } = {}
) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <MemoryRouter initialEntries={[route]}>
        <ToastProvider>{children}</ToastProvider>
      </MemoryRouter>
    );
  };

  return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Setup common mocks for Shadcn UI components that need special handling in tests
 */
export function setupShadcnMocks() {
  // Mock ResizeObserver for Radix UI components
  if (typeof window !== 'undefined' && !window.ResizeObserver) {
    window.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
  
  // Mock IntersectionObserver for Radix UI components
  if (typeof window !== 'undefined' && !window.IntersectionObserver) {
    window.IntersectionObserver = class IntersectionObserver {
      constructor() {}
      observe() {}
      unobserve() {}
      disconnect() {}
    } as any;
  }
  
  // Mock matchMedia for responsive components
  if (typeof window !== 'undefined' && !window.matchMedia) {
    window.matchMedia = () => ({
      matches: false,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as any;
  }
}

/**
 * Helper function to fill a form field
 * @param labelText - The label text of the field
 * @param value - The value to set
 * @param options - Additional options like selector
 */
export async function fillField(labelText: string, value: string, options: { selector?: string } = {}) {
  await act(async () => {
    fireEvent.change(screen.getByLabelText(labelText, options), {
      target: { value }
    });
  });
}

/**
 * Helper function to select an option from a select field
 * @param name - The name of the select field
 * @param value - The value to select
 */
export async function selectOption(name: string, value: string) {
  await act(async () => {
    fireEvent.change(screen.getByTestId(`select-${name}`), {
      target: { value }
    });
  });
}

/**
 * Helper function to click a button
 * @param text - The button text
 * @param options - Additional options for getByText
 */
export async function clickButton(text: string, options = {}) {
  await act(async () => {
    fireEvent.click(screen.getByText(text, options));
  });
}

/**
 * Helper function to submit a form
 * @param submitButtonText - The text on the submit button
 */
export async function submitForm(submitButtonText = 'Submit') {
  await clickButton(submitButtonText);
}

/**
 * Helper function to wait for API calls
 * @param apiCall - The mocked API function
 * @param times - Number of times the API should be called
 */
export async function waitForApiCall(apiCall: any, times = 1) {
  await waitFor(() => {
    expect(apiCall).toHaveBeenCalledTimes(times);
  });
}

/**
 * Helper function to interact with Shadcn UI select/combobox components
 * @param labelText - The label text of the select field
 * @param optionText - The text of the option to select
 */
export async function selectShadcnOption(labelText: string, optionText: string) {
  const user = userEvent.setup();
  
  // Open the select dropdown
  const selectTrigger = screen.getByLabelText(labelText, { selector: 'button' });
  await user.click(selectTrigger);
  
  // Select the option
  const option = screen.getByRole('option', { name: optionText });
  await user.click(option);
}

/**
 * Helper function to interact with Shadcn UI checkbox components
 * @param labelText - The label text of the checkbox
 * @param checked - Whether to check or uncheck
 */
export async function toggleShadcnCheckbox(labelText: string, checked: boolean) {
  const user = userEvent.setup();
  const checkbox = screen.getByLabelText(labelText);
  
  if ((checkbox as HTMLInputElement).checked !== checked) {
    await user.click(checkbox);
  }
}

/**
 * Helper function to interact with Shadcn UI radio components
 * @param labelText - The label text of the radio option
 */
export async function selectShadcnRadio(labelText: string) {
  const user = userEvent.setup();
  const radio = screen.getByLabelText(labelText);
  await user.click(radio);
}

/**
 * Helper function to interact with Shadcn UI switch components
 * @param labelText - The label text of the switch
 * @param checked - Whether to turn on or off
 */
export async function toggleShadcnSwitch(labelText: string, checked: boolean) {
  const user = userEvent.setup();
  const switchEl = screen.getByLabelText(labelText);
  
  if ((switchEl as HTMLInputElement).checked !== checked) {
    await user.click(switchEl);
  }
}

/**
 * Helper function to interact with Shadcn UI date picker
 * @param labelText - The label text of the date picker
 * @param date - The date to set (YYYY-MM-DD format)
 */
export async function setShadcnDate(labelText: string, date: string) {
  const user = userEvent.setup();
  
  // Open the date picker
  const datePicker = screen.getByLabelText(labelText, { selector: 'button' });
  await user.click(datePicker);
  
  // Parse the date parts (only using day for now)
  const day = date.split('-')[2];
  
  // Select the date (this is a simplified implementation)
  // In real tests, you might need to navigate to the right month/year first
  const dayButton = screen.getByRole('button', { name: new RegExp(`^${day}$`) });
  await user.click(dayButton);
}

/**
 * Helper function to mock API services
 * @param serviceName - The service to mock
 * @param methodName - The method to mock
 * @param returnValue - The value to return
 */
export function mockApiService(serviceName: any, methodName: string, returnValue: any) {
  vi.mocked(serviceName[methodName]).mockResolvedValue(returnValue);
}

/**
 * Helper function to mock API service errors
 * @param serviceName - The service to mock
 * @param methodName - The method to mock
 * @param errorMessage - The error message
 */
export function mockApiServiceError(serviceName: any, methodName: string, errorMessage: string) {
  vi.mocked(serviceName[methodName]).mockRejectedValue(errorMessage);
}

// Export common testing functions
export { act, waitFor, fireEvent, screen } from '@testing-library/react';
export { vi } from 'vitest';
