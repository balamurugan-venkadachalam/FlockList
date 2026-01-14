import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast";
import { Button } from "./button";
import { ToastProvider as CustomToastProvider, useToast } from "./toast-provider";

/**
 * # Toast Component
 * 
 * The Toast component is a notification element that provides feedback about an operation or important information.
 * It replaces the Material UI Snackbar/Alert components with a fully responsive and accessible alternative
 * built with Radix UI primitives and Tailwind CSS.
 * 
 * ## Features
 * - Built on Radix UI's accessible toast primitive
 * - Multiple variants (default, destructive, success, warning, info)
 * - Customizable duration
 * - Swipe to dismiss
 * - Responsive positioning
 * - Action buttons support
 * 
 * ## Accessibility Considerations
 * - Proper ARIA attributes for screen readers
 * - Automatic focus management
 * - Keyboard dismissal
 * - Proper color contrast for all variants
 * - Timeout pauses on hover/focus
 * 
 * ## Migration from Material UI
 * 
 * ### Material UI Snackbar/Alert Props to Shadcn Toast Props
 * | Material UI Prop | Shadcn UI Equivalent | Notes |
 * | --------------- | -------------------- | ----- |
 * | `open` | Handled by toast hook | Use useToast() hook |
 * | `onClose` | Handled by toast hook | Automatic with duration |
 * | `autoHideDuration` | `duration` | In milliseconds |
 * | `message` | `description` | Toast description text |
 * | `severity` | `variant` | "default", "destructive", "success", "warning", "info" |
 * | `action` | `action` | ToastAction component |
 * | `anchorOrigin` | Fixed positioning | Bottom right on desktop, bottom on mobile |
 * 
 * ### Example Migration
 * 
 * Material UI:
 * ```tsx
 * <Snackbar
 *   open={open}
 *   autoHideDuration={6000}
 *   onClose={handleClose}
 *   message="Note archived"
 *   action={
 *     <Button color="secondary" size="small" onClick={handleClose}>
 *       UNDO
 *     </Button>
 *   }
 * />
 * ```
 * 
 * Shadcn UI:
 * ```tsx
 * // At the app root
 * <ToastProvider>
 *   {children}
 * </ToastProvider>
 * 
 * // In your component
 * const { toast } = useToast();
 * 
 * // When you want to show a toast
 * toast({
 *   title: "Note archived",
 *   description: "Your note has been archived.",
 *   action: <ToastAction altText="Undo">UNDO</ToastAction>,
 *   duration: 6000,
 * });
 * ```
 */
const meta = {
  title: "UI/Shadcn/Toast",
  component: Toast,
  parameters: {
    layout: "centered",
    // Enable a11y checks for this component
    a11y: {
      config: {
        rules: [
          {
            id: "color-contrast",
            enabled: true,
          },
        ],
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "success", "warning", "info"],
      description: "The visual style of the toast",
    },
    duration: {
      control: "number",
      description: "The duration in milliseconds that the toast should remain visible",
    },
  },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic toast with title and description
 */
export const Default: Story = {
  render: (args) => (
    <ToastProvider>
      <Toast {...args}>
        <div className="grid gap-1">
          <ToastTitle>Toast Title</ToastTitle>
          <ToastDescription>
            Toast description with important information.
          </ToastDescription>
        </div>
        <ToastClose />
      </Toast>
      <ToastViewport />
    </ToastProvider>
  ),
  args: {
    variant: "default",
  },
};

/**
 * Toast with action button
 */
export const WithAction: Story = {
  render: (args) => (
    <ToastProvider>
      <Toast {...args}>
        <div className="grid gap-1">
          <ToastTitle>Scheduled: Catch up</ToastTitle>
          <ToastDescription>
            Friday, February 10, 2023 at 5:57 PM
          </ToastDescription>
        </div>
        <ToastAction altText="Goto schedule to undo">Undo</ToastAction>
        <ToastClose />
      </Toast>
      <ToastViewport />
    </ToastProvider>
  ),
  args: {
    variant: "default",
  },
};

/**
 * Toast variants for different types of notifications
 */
export const Variants: Story = {
  render: () => (
    <ToastProvider>
      <div className="flex flex-col space-y-4">
        <Toast variant="default">
          <div className="grid gap-1">
            <ToastTitle>Default Toast</ToastTitle>
            <ToastDescription>Default toast notification</ToastDescription>
          </div>
          <ToastClose />
        </Toast>
        
        <Toast variant="destructive">
          <div className="grid gap-1">
            <ToastTitle>Error</ToastTitle>
            <ToastDescription>Something went wrong!</ToastDescription>
          </div>
          <ToastClose />
        </Toast>
        
        <Toast variant="success">
          <div className="grid gap-1">
            <ToastTitle>Success</ToastTitle>
            <ToastDescription>Your changes have been saved</ToastDescription>
          </div>
          <ToastClose />
        </Toast>
        
        <Toast variant="warning">
          <div className="grid gap-1">
            <ToastTitle>Warning</ToastTitle>
            <ToastDescription>Your storage is almost full</ToastDescription>
          </div>
          <ToastClose />
        </Toast>
        
        <Toast variant="info">
          <div className="grid gap-1">
            <ToastTitle>Information</ToastTitle>
            <ToastDescription>A new version is available</ToastDescription>
          </div>
          <ToastClose />
        </Toast>
      </div>
      <ToastViewport />
    </ToastProvider>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story: "Different toast variants for different types of notifications: default, destructive (error), success, warning, and info.",
      },
    },
  },
};

/**
 * Interactive toast demo using the useToast hook
 */
export const ToastDemo: Story = {
  render: () => {
    return (
      <ToastDemoComponent />
    );
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story: "Interactive demo showing how to use the useToast hook to display toast notifications programmatically.",
      },
    },
  },
};

// Helper component for the interactive demo
function ToastDemoComponent() {
  const [mounted, setMounted] = useState(false);
  
  // Only render the provider client-side to avoid hydration issues
  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return (
      <div className="flex flex-col space-y-2">
        <p>Toast demo (loading...)</p>
      </div>
    );
  }
  
  return (
    <CustomToastProvider>
      <ToastButtons />
    </CustomToastProvider>
  );
}

function ToastButtons() {
  const { toast } = useToast();
  
  return (
    <div className="flex flex-col space-y-2">
      <h3 className="text-lg font-medium mb-2">Click to show toast:</h3>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() =>
            toast({
              title: "Default Toast",
              description: "This is a default toast notification",
            })
          }
        >
          Default Toast
        </Button>
        
        <Button
          variant="outline"
          onClick={() =>
            toast({
              title: "Error",
              description: "Something went wrong!",
              variant: "destructive",
            })
          }
        >
          Error Toast
        </Button>
        
        <Button
          variant="outline"
          onClick={() =>
            toast({
              title: "Success",
              description: "Your changes have been saved successfully.",
              variant: "success",
            })
          }
        >
          Success Toast
        </Button>
        
        <Button
          variant="outline"
          onClick={() =>
            toast({
              title: "Warning",
              description: "Your storage is almost full.",
              variant: "warning",
            })
          }
        >
          Warning Toast
        </Button>
        
        <Button
          variant="outline"
          onClick={() =>
            toast({
              title: "Information",
              description: "A new version is available.",
              variant: "info",
            })
          }
        >
          Info Toast
        </Button>
        
        <Button
          variant="outline"
          onClick={() =>
            toast({
              title: "With Action",
              description: "This toast has an action button.",
              action: (
                <ToastAction altText="Try again">Try again</ToastAction>
              ),
            })
          }
        >
          Toast with Action
        </Button>
        
        <Button
          variant="outline"
          onClick={() =>
            toast({
              description: "Simple toast with just a description.",
            })
          }
        >
          Simple Toast
        </Button>
        
        <Button
          variant="outline"
          onClick={() =>
            toast({
              title: "Custom Duration",
              description: "This toast will disappear in 10 seconds.",
              duration: 10000,
            })
          }
        >
          Long Duration (10s)
        </Button>
      </div>
      
      <p className="text-sm text-muted-foreground mt-4">
        Toasts will appear at the bottom right of the screen and can be dismissed by clicking the X,
        swiping, or waiting for the duration to expire.
      </p>
    </div>
  );
}

/**
 * Responsive toast example
 */
export const ResponsiveToast: Story = {
  render: () => (
    <ToastProvider>
      <div className="w-full">
        <p className="text-sm text-muted-foreground mb-4">
          Toasts are responsive by default. On mobile devices, they appear at the bottom of the screen.
          On larger screens, they appear at the bottom right corner.
        </p>
        <Toast>
          <div className="grid gap-1">
            <ToastTitle>Responsive Toast</ToastTitle>
            <ToastDescription>
              This toast adapts to different screen sizes. Try resizing your browser window.
            </ToastDescription>
          </div>
          <ToastClose />
        </Toast>
      </div>
      <ToastViewport />
    </ToastProvider>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story: "Toast notifications are responsive by default. They adapt to different screen sizes, appearing at the bottom on mobile and bottom right on desktop.",
      },
    },
  },
};
