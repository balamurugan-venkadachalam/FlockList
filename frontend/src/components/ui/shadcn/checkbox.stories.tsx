import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox, CheckboxField, CheckboxGroup } from "./checkbox";
import { Label } from "./label";

/**
 * # Checkbox Component
 * 
 * The Checkbox component is a form control that allows users to select one or more options from a set.
 * It replaces the Material UI Checkbox component with a fully responsive and accessible alternative
 * built with Radix UI primitives and Tailwind CSS.
 * 
 * ## Features
 * - Built on Radix UI's accessible checkbox primitive
 * - Keyboard navigation support
 * - Proper focus management
 * - Error state handling
 * - Helper text support
 * - Group organization for multiple checkboxes
 * 
 * ## Accessibility Considerations
 * - Proper ARIA attributes for screen readers
 * - Keyboard navigation support (Tab, Space)
 * - Visual indicators for focus and selection states
 * - Proper color contrast for all states
 * - Support for form validation with error states
 * 
 * ## Migration from Material UI
 * 
 * ### Material UI Checkbox Props to Shadcn Checkbox Props
 * | Material UI Prop | Shadcn UI Equivalent | Notes |
 * | --------------- | -------------------- | ----- |
 * | `checked` | `checked` | Same functionality |
 * | `onChange` | `onCheckedChange` | Different callback signature |
 * | `disabled` | `disabled` | Same functionality |
 * | `error` | `error` | Apply to CheckboxField |
 * | `FormControlLabel` | `CheckboxField` | Use the CheckboxField wrapper |
 * | `FormHelperText` | `helperText` | Use on CheckboxField |
 * | `FormGroup` | `CheckboxGroup` | Use the CheckboxGroup wrapper |
 * 
 * ### Example Migration
 * 
 * Material UI:
 * ```tsx
 * <FormControl error={!!error}>
 *   <FormLabel>Notification Preferences</FormLabel>
 *   <FormGroup>
 *     <FormControlLabel
 *       control={<Checkbox checked={emailChecked} onChange={handleEmailChange} />}
 *       label="Email"
 *     />
 *     <FormControlLabel
 *       control={<Checkbox checked={smsChecked} onChange={handleSmsChange} />}
 *       label="SMS"
 *     />
 *   </FormGroup>
 *   <FormHelperText>{error || "Select your notification preferences"}</FormHelperText>
 * </FormControl>
 * ```
 * 
 * Shadcn UI:
 * ```tsx
 * <CheckboxGroup
 *   legend="Notification Preferences"
 *   error={!!error}
 *   errorMessage={error}
 *   helperText="Select your notification preferences"
 * >
 *   <CheckboxField
 *     id="email-notifications"
 *     label="Email"
 *     checked={emailChecked}
 *     onCheckedChange={handleEmailChange}
 *   />
 *   <CheckboxField
 *     id="sms-notifications"
 *     label="SMS"
 *     checked={smsChecked}
 *     onCheckedChange={handleSmsChange}
 *   />
 * </CheckboxGroup>
 * ```
 */
const meta = {
  title: "UI/Shadcn/Checkbox",
  component: CheckboxField,
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
    checked: {
      control: "boolean",
      description: "Whether the checkbox is checked",
    },
    disabled: {
      control: "boolean",
      description: "Whether the checkbox is disabled",
    },
    label: {
      control: "text",
      description: "Label text for the checkbox",
    },
    helperText: {
      control: "text",
      description: "Helper text to display below the checkbox",
    },
    error: {
      control: "boolean",
      description: "Whether the checkbox has an error",
    },
    errorMessage: {
      control: "text",
      description: "Error message to display",
    },
  },
} satisfies Meta<typeof CheckboxField>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic checkbox with label
 */
export const Default: Story = {
  args: {
    id: "terms",
    label: "I agree to the terms and conditions",
  },
};

/**
 * Checkbox with helper text
 */
export const WithHelperText: Story = {
  args: {
    id: "newsletter",
    label: "Subscribe to newsletter",
    helperText: "We'll send you updates about our product",
  },
};

/**
 * Checkbox with error state
 */
export const WithError: Story = {
  args: {
    id: "required-checkbox",
    label: "I agree to the terms and conditions",
    error: true,
    errorMessage: "You must accept the terms to continue",
  },
};

/**
 * Disabled checkbox
 */
export const Disabled: Story = {
  args: {
    id: "disabled-checkbox",
    label: "Unavailable option",
    disabled: true,
  },
};

/**
 * Checkbox group with multiple options
 */
export const CheckboxGroupExample: Story = {
  render: () => (
    <div className="w-[300px]">
      <CheckboxGroup
        legend="Notification Preferences"
        helperText="Select all that apply"
      >
        <CheckboxField
          id="email-notifications"
          label="Email notifications"
        />
        <CheckboxField
          id="sms-notifications"
          label="SMS notifications"
        />
        <CheckboxField
          id="push-notifications"
          label="Push notifications"
        />
      </CheckboxGroup>
    </div>
  ),
};

/**
 * Checkbox group with error state
 */
export const CheckboxGroupWithError: Story = {
  render: () => (
    <div className="w-[300px]">
      <CheckboxGroup
        legend="Required Selection"
        required
        error={true}
        errorMessage="Please select at least one option"
      >
        <CheckboxField
          id="option-1"
          label="Option 1"
        />
        <CheckboxField
          id="option-2"
          label="Option 2"
        />
        <CheckboxField
          id="option-3"
          label="Option 3"
        />
      </CheckboxGroup>
    </div>
  ),
};

/**
 * Basic checkbox without wrapper
 */
export const BasicCheckbox: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="basic" />
      <Label htmlFor="basic">Accept terms and conditions</Label>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Basic checkbox without using the CheckboxField wrapper. This approach gives more control over the layout.",
      },
    },
  },
};

/**
 * Responsive form with checkbox group
 */
export const ResponsiveForm: Story = {
  render: () => (
    <div className="w-full max-w-[500px] p-4 border rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Account Preferences</h2>
      
      <div className="space-y-6">
        <CheckboxGroup
          legend="Privacy Settings"
          helperText="Control how your information is used"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <CheckboxField
              id="data-collection"
              label="Allow data collection"
            />
            <CheckboxField
              id="personalized-ads"
              label="Show personalized ads"
            />
            <CheckboxField
              id="third-party"
              label="Share with third parties"
            />
            <CheckboxField
              id="location"
              label="Use location data"
            />
          </div>
        </CheckboxGroup>
        
        <CheckboxGroup
          legend="Communication Preferences"
          required
          helperText="Select at least one communication channel"
        >
          <CheckboxField
            id="email-marketing"
            label="Email marketing"
          />
          <CheckboxField
            id="product-updates"
            label="Product updates"
            helperText="Receive information about new features"
          />
          <CheckboxField
            id="security-alerts"
            label="Security alerts"
          />
        </CheckboxGroup>
      </div>
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story: "A responsive form with checkbox groups that adapt to different screen sizes. On small screens, checkboxes stack vertically; on larger screens, they display in a two-column grid.",
      },
    },
  },
};
