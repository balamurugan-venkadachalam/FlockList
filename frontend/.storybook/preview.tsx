import React, { useEffect } from "react";
import type { Preview } from "@storybook/react";
import "../src/globals.css";
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../src/components/ui/shadcn/toast-provider';

// Import MSW addon
import { initialize, mswLoader } from 'msw-storybook-addon';

// Initialize MSW
initialize();

// Define viewport presets for responsive testing
const customViewports = {
  xs: {
    name: 'XS (Mobile)',
    styles: {
      width: '360px',
      height: '640px',
    },
  },
  sm: {
    name: 'SM (Tablet)',
    styles: {
      width: '600px',
      height: '960px',
    },
  },
  md: {
    name: 'MD (Small Laptop)',
    styles: {
      width: '900px',
      height: '1080px',
    },
  },
  lg: {
    name: 'LG (Desktop)',
    styles: {
      width: '1200px',
      height: '1080px',
    },
  },
  xl: {
    name: 'XL (Large Desktop)',
    styles: {
      width: '1536px',
      height: '1080px',
    },
  },
};

// Theme decorator for toggling between light and dark mode
const withThemeDecorator = (Story, context) => {
  const { theme } = context.globals;
  
  React.useEffect(() => {
    const htmlTag = document.documentElement;
    
    // Apply the selected theme
    if (theme === 'dark') {
      htmlTag.classList.add('dark');
    } else {
      htmlTag.classList.remove('dark');
    }
  }, [theme]);
  
  return <Story />;
};

// Router decorator for providing routing context to all stories
const withRouterDecorator = (Story) => {
  return (
    <MemoryRouter initialEntries={["/tasks"]}>
      <Story />
    </MemoryRouter>
  );
};

// Auth context decorator for components that use useAuth hook
const withAuthContext = (Story) => {
  return <Story />;
};

// Loading state handler decorator
const withLoadingHandler = (Story) => {
  // Add a global script to handle loading states in Storybook
  useEffect(() => {
    // This script will run in the iframe context
    const script = document.createElement('script');
    script.textContent = `
      // Override loading spinners in Storybook environment
      (function() {
        // Wait for the DOM to be fully loaded
        setTimeout(() => {
          // Find all loading spinners and replace them with static content
          const spinners = document.querySelectorAll('.animate-spin');
          spinners.forEach(spinner => {
            spinner.classList.remove('animate-spin');
          });
          
          // Find all disabled buttons that might be in loading state
          const buttons = document.querySelectorAll('button[disabled]');
          buttons.forEach(button => {
            // If it's a loading button, enable it for Storybook
            if (button.querySelector('.animate-spin')) {
              button.disabled = false;
            }
          });
        }, 1000);
      })();
    `;
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);
  
  return <Story />;
};

// Toast provider decorator for components that use useToast hook
const withToastDecorator = (Story) => {
  return (
    <ToastProvider>
      <Story />
    </ToastProvider>
  );
};

const preview: Preview = {
  loaders: [mswLoader],
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Configure a11y addon parameters
    a11y: {
      // Optional configuration
      config: {
        rules: [
          {
            // Enable all rules by default
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
      // Optional options
      options: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
        },
      },
    },
    // Configure viewport addon with our custom viewports
    viewport: { 
      viewports: customViewports,
      defaultViewport: 'md'
    },
  },
  // Add theme toggle tool
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
        ],
        showName: true,
      },
    },
  },
  decorators: [withThemeDecorator, withRouterDecorator, withToastDecorator, withAuthContext, withLoadingHandler],
  // MSW is now configured globally for all stories
};

export default preview;
