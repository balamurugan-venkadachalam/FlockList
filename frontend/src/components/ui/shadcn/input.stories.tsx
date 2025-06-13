import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./input";
import { Label } from "./label";

/**
 * # Input Component
 * 
 * The Input component is a form control that allows users to enter text.
 * It replaces the Material UI TextField/Input components with a fully responsive
 * and accessible alternative built with Tailwind CSS.
 * 
 * ## Features
 * - Clean, minimal design that adapts to different screen sizes
 * - Built-in error handling with visual indicators and messages
 * - Helper text support for additional context
 * - Full width option for responsive layouts
 * - Proper ARIA attributes for screen readers
 * 
 * ## Accessibility Considerations
 * - Uses proper labeling with htmlFor/id connections
 * - Provides visual error states with supporting text
 * - Includes helper text with proper ARIA connections
 * - High contrast focus states for keyboard navigation
 * - Supports screen readers with aria-invalid and aria-describedby
 * 
 * ## Migration from Material UI
 * 
 * ### Material UI TextField Props to Shadcn Input Props
 * | Material UI Prop | Shadcn UI Equivalent | Notes |
 * | --------------- | -------------------- | ----- |
 * | `variant` | N/A | Shadcn uses a single design |
 * | `error` | `error` | Similar functionality |
 * | `helperText` | `helperText` | Similar functionality |
 * | `fullWidth` | `fullWidth` | Same functionality |
 * | `disabled` | `disabled` | Same functionality |
 * | `label` | Use separate `Label` | Compose with Label component |
 * | `InputProps` | Direct HTML attributes | Apply directly to Input |
 * 
 * ### Example Migration
 * 
 * Material UI:
 * ```tsx
 * <TextField
 *   label="Email"
 *   variant="outlined"
 *   fullWidth
 *   error={!!emailError}
 *   helperText={emailError || "Enter your email address"}
 *   InputProps={{
 *     startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment>,
 *   }}
 * />
 * ```
 * 
 * Shadcn UI:
 * ```tsx
 * <div className="space-y-2">
 *   <Label htmlFor="email">Email</Label>
 *   <Input
 *     id="email"
 *     fullWidth
 *     error={!!emailError}
 *     errorMessage={emailError}
 *     helperText="Enter your email address"
 *   />
 * </div>
 * ```
 */
const meta = {
  title: "UI/Shadcn/Input",
  component: Input,
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
    type: {
      control: "select",
      options: ["text", "password", "email", "number", "tel", "url", "search"],
      description: "The type of input",
    },
    error: {
      control: "boolean",
      description: "Whether the input has an error",
    },
    errorMessage: {
      control: "text",
      description: "Error message to display",
    },
    fullWidth: {
      control: "boolean",
      description: "Whether the input should take up the full width of its container",
    },
    helperText: {
      control: "text",
      description: "Helper text to display below the input",
    },
    disabled: {
      control: "boolean",
      description: "Whether the input is disabled",
    },
    placeholder: {
      control: "text",
      description: "Placeholder text for the input",
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic input with label
 */
export const Default: Story = {
  render: (args) => (
    <div className="space-y-2 w-[300px]">
      <Label htmlFor="default-input">Username</Label>
      <Input id="default-input" placeholder="Enter username" {...args} />
    </div>
  ),
};

/**
 * Input with error state and message
 */
export const WithError: Story = {
  render: (args) => (
    <div className="space-y-2 w-[300px]">
      <Label htmlFor="error-input">Email</Label>
      <Input 
        id="error-input" 
        type="email" 
        placeholder="Enter email" 
        error={true}
        errorMessage="Please enter a valid email address"
        aria-invalid={true}
        {...args}
      />
    </div>
  ),
};

/**
 * Input with helper text for additional context
 */
export const WithHelperText: Story = {
  render: (args) => (
    <div className="space-y-2 w-[300px]">
      <Label htmlFor="helper-input">Password</Label>
      <Input 
        id="helper-input" 
        type="password" 
        placeholder="Enter password" 
        helperText="Password must be at least 8 characters"
        helperTextId="password-helper"
        aria-describedby="password-helper"
        {...args}
      />
    </div>
  ),
};

/**
 * Disabled input state
 */
export const Disabled: Story = {
  render: (args) => (
    <div className="space-y-2 w-[300px]">
      <Label htmlFor="disabled-input" className="text-muted-foreground">Username</Label>
      <Input 
        id="disabled-input" 
        placeholder="Enter username" 
        disabled
        {...args}
      />
    </div>
  ),
};

/**
 * Full width input for responsive layouts
 */
export const FullWidth: Story = {
  render: (args) => (
    <div className="space-y-2 w-full max-w-[500px]">
      <Label htmlFor="fullwidth-input">Search</Label>
      <Input 
        id="fullwidth-input" 
        placeholder="Search..." 
        fullWidth
        {...args}
      />
    </div>
  ),
  parameters: {
    layout: "padded",
  },
};

/**
 * Different input types for various use cases
 */
export const InputTypes: Story = {
  render: () => (
    <div className="space-y-4 w-[300px]">
      <div className="space-y-2">
        <Label htmlFor="text-input">Text</Label>
        <Input id="text-input" type="text" placeholder="Text input" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email-input">Email</Label>
        <Input id="email-input" type="email" placeholder="Email input" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password-input">Password</Label>
        <Input id="password-input" type="password" placeholder="Password input" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="number-input">Number</Label>
        <Input id="number-input" type="number" placeholder="Number input" />
      </div>
    </div>
  ),
};

/**
 * Responsive form layout example
 */
export const ResponsiveForm: Story = {
  render: () => (
    <div className="w-full max-w-[600px] p-4 border rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
      
      <div className="space-y-4">
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
          <Label htmlFor="email-address" required>Email Address</Label>
          <Input 
            id="email-address" 
            type="email" 
            placeholder="Email address" 
            fullWidth 
            helperText="We'll never share your email with anyone else."
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone-number">Phone Number</Label>
          <Input 
            id="phone-number" 
            type="tel" 
            placeholder="Phone number" 
            fullWidth 
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story: "A responsive form layout that adapts to different screen sizes. On small screens, form fields stack vertically; on larger screens, they display in a two-column grid.",
      },
    },
  },
};

/**
 * Input with custom styling
 */
export const CustomStyling: Story = {
  render: () => (
    <div className="space-y-2 w-[300px]">
      <Label htmlFor="custom-input" className="text-primary">Custom Input</Label>
      <Input 
        id="custom-input" 
        placeholder="Custom styled input" 
        className="border-primary focus-visible:ring-primary"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Input with custom styling applied using Tailwind classes. The border and focus ring colors have been customized.",
      },
    },
  },
};
