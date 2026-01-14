import type { Meta, StoryObj } from "@storybook/react";
import { RadioGroup, RadioGroupItem, RadioItem, RadioGroupField } from "./radio-group";
import { Label } from "./label";

/**
 * # Radio Group Component
 * 
 * The Radio Group component is a form control that allows users to select a single option from a set.
 * It replaces the Material UI Radio component with a fully responsive and accessible alternative
 * built with Radix UI primitives and Tailwind CSS.
 * 
 * ## Features
 * - Built on Radix UI's accessible radio primitives
 * - Keyboard navigation support
 * - Proper focus management
 * - Error state handling
 * - Helper text support
 * - Group organization for related radio options
 * 
 * ## Accessibility Considerations
 * - Proper ARIA attributes for screen readers
 * - Keyboard navigation support (Tab, Arrow keys, Space)
 * - Visual indicators for focus and selection states
 * - Proper color contrast for all states
 * - Support for form validation with error states
 * 
 * ## Migration from Material UI
 * 
 * ### Material UI Radio Props to Shadcn Radio Props
 * | Material UI Prop | Shadcn UI Equivalent | Notes |
 * | --------------- | -------------------- | ----- |
 * | `checked` | `value` on RadioGroup | Set on group instead of individual radio |
 * | `onChange` | `onValueChange` | Different callback signature |
 * | `disabled` | `disabled` | Same functionality |
 * | `error` | `error` | Apply to RadioGroupField |
 * | `FormControlLabel` | `RadioItem` | Use the RadioItem wrapper |
 * | `FormHelperText` | `helperText` | Use on RadioGroupField |
 * | `RadioGroup` | `RadioGroupField` | Use the RadioGroupField wrapper |
 * 
 * ### Example Migration
 * 
 * Material UI:
 * ```tsx
 * <FormControl error={!!error}>
 *   <FormLabel>Gender</FormLabel>
 *   <RadioGroup value={gender} onChange={handleGenderChange}>
 *     <FormControlLabel value="female" control={<Radio />} label="Female" />
 *     <FormControlLabel value="male" control={<Radio />} label="Male" />
 *     <FormControlLabel value="other" control={<Radio />} label="Other" />
 *   </RadioGroup>
 *   <FormHelperText>{error || "Please select your gender"}</FormHelperText>
 * </FormControl>
 * ```
 * 
 * Shadcn UI:
 * ```tsx
 * <RadioGroupField
 *   legend="Gender"
 *   value={gender}
 *   onValueChange={handleGenderChange}
 *   error={!!error}
 *   errorMessage={error}
 *   helperText="Please select your gender"
 * >
 *   <RadioItem id="gender-female" value="female" label="Female" />
 *   <RadioItem id="gender-male" value="male" label="Male" />
 *   <RadioItem id="gender-other" value="other" label="Other" />
 * </RadioGroupField>
 * ```
 */
const meta = {
  title: "UI/Shadcn/RadioGroup",
  component: RadioGroupField,
  parameters: {
    layout: "centered",
    // Enable a11y checks for this component
    a11y: {
      config: {
        rules: [
          {
            id: "radiogroup",
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
    legend: {
      control: "text",
      description: "Legend text for the radio group",
    },
    required: {
      control: "boolean",
      description: "Whether the radio group is required",
    },
    error: {
      control: "boolean",
      description: "Whether the radio group has an error",
    },
    errorMessage: {
      control: "text",
      description: "Error message to display",
    },
    helperText: {
      control: "text",
      description: "Helper text to display below the radio group",
    },
  },
} satisfies Meta<typeof RadioGroupField>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic radio group with options
 */
export const Default: Story = {
  render: (args) => (
    <div className="w-[300px]">
      <RadioGroupField
        legend="Notification Type"
        defaultValue="all"
        {...args}
      >
        <RadioItem id="r1" value="all" label="All Notifications" />
        <RadioItem id="r2" value="important" label="Important Only" />
        <RadioItem id="r3" value="none" label="None" />
      </RadioGroupField>
    </div>
  ),
};

/**
 * Radio group with error state
 */
export const WithError: Story = {
  render: (args) => (
    <div className="w-[300px]">
      <RadioGroupField
        legend="Required Selection"
        error={true}
        errorMessage="Please select an option"
        required
        {...args}
      >
        <RadioItem id="option1" value="option1" label="Option 1" />
        <RadioItem id="option2" value="option2" label="Option 2" />
        <RadioItem id="option3" value="option3" label="Option 3" />
      </RadioGroupField>
    </div>
  ),
};

/**
 * Radio group with helper text
 */
export const WithHelperText: Story = {
  render: (args) => (
    <div className="w-[300px]">
      <RadioGroupField
        legend="Shipping Method"
        helperText="Delivery times may vary based on location"
        defaultValue="standard"
        {...args}
      >
        <RadioItem 
          id="standard" 
          value="standard" 
          label="Standard Shipping" 
          helperText="3-5 business days"
        />
        <RadioItem 
          id="express" 
          value="express" 
          label="Express Shipping" 
          helperText="1-2 business days"
        />
        <RadioItem 
          id="overnight" 
          value="overnight" 
          label="Overnight Shipping" 
          helperText="Next business day"
        />
      </RadioGroupField>
    </div>
  ),
};

/**
 * Disabled radio group
 */
export const Disabled: Story = {
  render: (args) => (
    <div className="w-[300px]">
      <RadioGroupField
        legend="Unavailable Options"
        disabled
        defaultValue="option1"
        {...args}
      >
        <RadioItem id="disabled1" value="option1" label="Option 1" />
        <RadioItem id="disabled2" value="option2" label="Option 2" />
        <RadioItem id="disabled3" value="option3" label="Option 3" />
      </RadioGroupField>
    </div>
  ),
};

/**
 * Horizontal radio group layout
 */
export const HorizontalLayout: Story = {
  render: (args) => (
    <div className="w-[400px]">
      <RadioGroupField
        legend="Size Selection"
        defaultValue="medium"
        className="max-w-md"
        {...args}
      >
        <div className="flex space-x-4">
          <RadioItem id="size-s" value="small" label="Small" />
          <RadioItem id="size-m" value="medium" label="Medium" />
          <RadioItem id="size-l" value="large" label="Large" />
        </div>
      </RadioGroupField>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Radio group with horizontal layout. This is useful for a small number of options that fit well on a single line.",
      },
    },
  },
};

/**
 * Basic radio group without wrapper
 */
export const BasicRadioGroup: Story = {
  render: () => (
    <div className="w-[300px] space-y-2">
      <Label>Payment Method</Label>
      <RadioGroup defaultValue="card">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="card" id="card" />
          <Label htmlFor="card">Credit Card</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="paypal" id="paypal" />
          <Label htmlFor="paypal">PayPal</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="apple" id="apple" />
          <Label htmlFor="apple">Apple Pay</Label>
        </div>
      </RadioGroup>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Basic radio group without using the RadioGroupField wrapper. This approach gives more control over the layout.",
      },
    },
  },
};

/**
 * Responsive form with radio groups
 */
export const ResponsiveForm: Story = {
  render: () => (
    <div className="w-full max-w-[500px] p-4 border rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Survey Form</h2>
      
      <div className="space-y-6">
        <RadioGroupField
          legend="How did you hear about us?"
          required
          helperText="Please select one option"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <RadioItem id="source-search" value="search" label="Search Engine" />
            <RadioItem id="source-social" value="social" label="Social Media" />
            <RadioItem id="source-friend" value="friend" label="Friend/Colleague" />
            <RadioItem id="source-other" value="other" label="Other" />
          </div>
        </RadioGroupField>
        
        <RadioGroupField
          legend="How would you rate your experience?"
          required
        >
          <RadioItem 
            id="rating-excellent" 
            value="excellent" 
            label="Excellent" 
            helperText="Exceeded expectations"
          />
          <RadioItem 
            id="rating-good" 
            value="good" 
            label="Good" 
            helperText="Met expectations"
          />
          <RadioItem 
            id="rating-average" 
            value="average" 
            label="Average" 
            helperText="Neither good nor bad"
          />
          <RadioItem 
            id="rating-poor" 
            value="poor" 
            label="Poor" 
            helperText="Below expectations"
          />
        </RadioGroupField>
      </div>
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story: "A responsive form with radio groups that adapt to different screen sizes. On small screens, options stack vertically; on larger screens, some display in a two-column grid.",
      },
    },
  },
};
