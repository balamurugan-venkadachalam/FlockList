import type { Meta, StoryObj } from "@storybook/react";
import { Label } from "./label";
import { Input } from "./input";

/**
 * # Label Component
 * 
 * The Label component is a form control label that provides accessible text labels for inputs.
 * It replaces the Material UI FormLabel/InputLabel components with a fully responsive
 * and accessible alternative built with Radix UI primitives and Tailwind CSS.
 * 
 * ## Features
 * - Built on Radix UI's accessible label primitive
 * - Multiple size variants including responsive sizing
 * - Required field indicator support
 * - Proper HTML/ARIA connections with form controls
 * 
 * ## Accessibility Considerations
 * - Uses the native HTML `<label>` element for proper form associations
 * - Provides visual required field indicators
 * - Maintains proper text contrast for readability
 * - Supports proper focus management through label-input connections
 * 
 * ## Migration from Material UI
 * 
 * ### Material UI FormLabel/InputLabel Props to Shadcn Label Props
 * | Material UI Prop | Shadcn UI Equivalent | Notes |
 * | --------------- | -------------------- | ----- |
 * | `required` | `required` | Similar functionality |
 * | `error` | Use className | Apply `text-destructive` class |
 * | `disabled` | Use className | Apply `opacity-50` class |
 * | `shrink` | N/A | Not needed in Shadcn UI |
 * | `variant` | N/A | Not needed in Shadcn UI |
 * 
 * ### Example Migration
 * 
 * Material UI:
 * ```tsx
 * <FormLabel required error={hasError}>Email</FormLabel>
 * <TextField id="email" />
 * ```
 * 
 * Shadcn UI:
 * ```tsx
 * <Label htmlFor="email" required className={hasError ? "text-destructive" : ""}>Email</Label>
 * <Input id="email" />
 * ```
 */
const meta = {
  title: "UI/Shadcn/Label",
  component: Label,
  parameters: {
    layout: "centered",
    // Enable a11y checks for this component
    a11y: {
      config: {
        rules: [
          {
            id: "label",
            enabled: true,
          },
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
    size: {
      control: "select",
      options: ["default", "sm", "lg", "responsive"],
      description: "The size of the label text",
    },
    required: {
      control: "boolean",
      description: "Whether to show the required field indicator",
    },
    htmlFor: {
      control: "text",
      description: "The ID of the form element this label is associated with",
    },
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic label
 */
export const Default: Story = {
  args: {
    children: "Username",
    htmlFor: "username",
  },
  render: (args) => (
    <div className="space-y-2 w-[300px]">
      <Label {...args} />
      <Input id="username" placeholder="Enter username" />
    </div>
  ),
};

/**
 * Label for required field
 */
export const Required: Story = {
  args: {
    children: "Email Address",
    htmlFor: "email",
    required: true,
  },
  render: (args) => (
    <div className="space-y-2 w-[300px]">
      <Label {...args} />
      <Input id="email" type="email" placeholder="Enter email" required />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Label with required field indicator (asterisk). The required prop adds a visual indicator and the required attribute on the input improves form validation.",
      },
    },
  },
};

/**
 * Label with different sizes
 */
export const Sizes: Story = {
  render: () => (
    <div className="space-y-6 w-[300px]">
      <div className="space-y-2">
        <Label htmlFor="small" size="sm">Small Label</Label>
        <Input id="small" placeholder="Small label example" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="default" size="default">Default Label</Label>
        <Input id="default" placeholder="Default label example" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="large" size="lg">Large Label</Label>
        <Input id="large" placeholder="Large label example" />
      </div>
    </div>
  ),
};

/**
 * Responsive label that adapts to screen size
 */
export const Responsive: Story = {
  render: () => (
    <div className="space-y-2 w-[300px]">
      <Label htmlFor="responsive" size="responsive">Responsive Label</Label>
      <Input id="responsive" placeholder="Responsive label example" />
      <p className="text-xs text-muted-foreground">
        This label's text size adapts to the viewport width. Try viewing at different screen sizes.
      </p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Label with responsive text size that adapts to different screen sizes. The text will be smaller on mobile devices and larger on desktop.",
      },
    },
  },
};

/**
 * Label with error state
 */
export const Error: Story = {
  render: () => (
    <div className="space-y-2 w-[300px]">
      <Label htmlFor="error" className="text-destructive">Invalid Input</Label>
      <Input 
        id="error" 
        placeholder="Error example" 
        error={true}
        errorMessage="This field is required"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Label with error styling. Apply the text-destructive class to make the label match the error state of the input.",
      },
    },
  },
};

/**
 * Label with disabled state
 */
export const Disabled: Story = {
  render: () => (
    <div className="space-y-2 w-[300px]">
      <Label htmlFor="disabled" className="text-muted-foreground opacity-50">Disabled Field</Label>
      <Input id="disabled" placeholder="Disabled example" disabled />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Label with disabled styling. Apply text-muted-foreground and opacity-50 classes to make the label appear disabled.",
      },
    },
  },
};

/**
 * Form group with multiple labels and inputs
 */
export const FormGroup: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-[500px] p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Account Information</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first-name" required>First Name</Label>
          <Input id="first-name" placeholder="First name" fullWidth />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="last-name" required>Last Name</Label>
          <Input id="last-name" placeholder="Last name" fullWidth />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email-address" required size="responsive">Email Address</Label>
        <Input 
          id="email-address" 
          type="email" 
          placeholder="Email address" 
          fullWidth 
        />
      </div>
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story: "Example of multiple labels and inputs in a form group with responsive layout. The form adapts to different screen sizes.",
      },
    },
  },
};
