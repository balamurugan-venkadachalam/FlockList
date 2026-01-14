import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";

/**
 * # Button Component
 * 
 * The Button component is a fundamental UI element that replaces the Material UI Button.
 * It's designed to be fully responsive and accessible, following WCAG and ARIA best practices.
 * 
 * ## Features
 * - Multiple variants (default, destructive, outline, secondary, ghost, link)
 * - Responsive sizing options
 * - Full width option
 * - Accessibility support with ARIA attributes
 * - Keyboard navigation support
 * - High contrast focus states
 * 
 * ## Accessibility Considerations
 * - Uses proper focus management with visible focus rings
 * - Includes support for aria-label for icon-only buttons
 * - Supports aria-describedby for additional descriptions
 * - Maintains sufficient color contrast in all variants
 * - Provides visual feedback for interactive states
 * 
 * ## Migration from Material UI
 * 
 * ### Material UI Button Props to Shadcn Button Props
 * | Material UI Prop | Shadcn UI Equivalent | Notes |
 * | --------------- | -------------------- | ----- |
 * | `variant` | `variant` | Similar options but different naming |
 * | `color` | Use `variant` instead | Shadcn uses variants for colors |
 * | `size` | `size` | Similar options |
 * | `fullWidth` | `fullWidth` | Same functionality |
 * | `disabled` | `disabled` | Same functionality |
 * | `startIcon` | Use children with icon | Compose manually |
 * | `endIcon` | Use children with icon | Compose manually |
 * 
 * ### Example Migration
 * 
 * Material UI:
 * ```tsx
 * <Button 
 *   variant="contained" 
 *   color="primary" 
 *   size="large"
 *   fullWidth
 *   startIcon={<SaveIcon />}
 * >
 *   Save
 * </Button>
 * ```
 * 
 * Shadcn UI:
 * ```tsx
 * <Button 
 *   variant="default" 
 *   size="lg"
 *   fullWidth
 * >
 *   <SaveIcon className="mr-2 h-4 w-4" /> Save
 * </Button>
 * ```
 */
const meta = {
  title: "UI/Shadcn/Button",
  component: Button,
  parameters: {
    layout: "centered",
    // Enable a11y checks for this component
    a11y: {
      config: {
        rules: [
          {
            id: "button-name",
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
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
      description: "The visual style of the button",
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon", "responsive"],
      description: "The size of the button",
    },
    fullWidth: {
      control: "boolean",
      description: "Whether the button should take up the full width of its container",
    },
    asChild: {
      control: "boolean",
      description: "Whether to render as a child component (e.g., for link buttons)",
    },
    disabled: {
      control: "boolean",
      description: "Whether the button is disabled",
    },
    ariaLabel: {
      control: "text",
      description: "Accessible label for the button (important for icon-only buttons)",
    },
    ariaDescribedBy: {
      control: "text",
      description: "ID of an element that describes the button",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default button with primary styling
 */
export const Default: Story = {
  args: {
    children: "Button",
    variant: "default",
  },
};

/**
 * Destructive button for actions like delete or remove
 */
export const Destructive: Story = {
  args: {
    children: "Delete",
    variant: "destructive",
  },
};

/**
 * Outline button with a border
 */
export const Outline: Story = {
  args: {
    children: "Outline",
    variant: "outline",
  },
};

/**
 * Secondary button for less prominent actions
 */
export const Secondary: Story = {
  args: {
    children: "Secondary",
    variant: "secondary",
  },
};

/**
 * Ghost button that only shows on hover/focus
 */
export const Ghost: Story = {
  args: {
    children: "Ghost",
    variant: "ghost",
  },
};

/**
 * Link button that looks like a hyperlink
 */
export const Link: Story = {
  args: {
    children: "Link",
    variant: "link",
  },
};

/**
 * Small sized button
 */
export const Small: Story = {
  args: {
    children: "Small",
    size: "sm",
  },
};

/**
 * Large sized button
 */
export const Large: Story = {
  args: {
    children: "Large",
    size: "lg",
  },
};

/**
 * Icon button with accessibility considerations
 */
export const Icon: Story = {
  args: {
    children: "🔍",
    size: "icon",
    ariaLabel: "Search",
  },
};

/**
 * Full width button that spans its container
 */
export const FullWidth: Story = {
  args: {
    children: "Full Width Button",
    fullWidth: true,
  },
  parameters: {
    layout: "padded",
  },
};

/**
 * Disabled button state
 */
export const Disabled: Story = {
  args: {
    children: "Disabled",
    disabled: true,
  },
};

/**
 * Responsive button that adapts to screen size
 */
export const Responsive: Story = {
  args: {
    children: "Responsive Button",
    size: "responsive",
  },
  parameters: {
    docs: {
      description: {
        story: "This button changes size based on the viewport. Try viewing it at different screen sizes.",
      },
    },
  },
};

/**
 * Button with icon and text for better accessibility
 */
export const WithIcon: Story = {
  render: (args) => (
    <Button {...args}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mr-2 h-4 w-4"
      >
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
      </svg>
      Save
    </Button>
  ),
  parameters: {
    docs: {
      description: {
        story: "Button with icon and text. The icon has proper spacing and is purely decorative, so no additional accessibility attributes are needed.",
      },
    },
  },
};

/**
 * Example showing different buttons in a group
 */
export const ButtonGroup: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Save</Button>
      <Button variant="outline">Cancel</Button>
      <Button variant="destructive">Delete</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Example of multiple buttons used together in a form or dialog.",
      },
    },
  },
};

/**
 * Example showing responsive button behavior across different screen sizes
 */
export const ResponsiveButtonGroup: Story = {
  render: () => (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full max-w-sm">
      <Button size="responsive" className="w-full sm:w-auto">Primary</Button>
      <Button size="responsive" variant="outline" className="w-full sm:w-auto">Secondary</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Example of responsive buttons that stack vertically on mobile and horizontally on larger screens.",
      },
    },
  },
};
