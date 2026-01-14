import type { Meta, StoryObj } from "@storybook/react";
import { Switch, SwitchField, SwitchGroup } from "./switch";
import { Label } from "./label";

/**
 * # Switch Component
 * 
 * The Switch component is a form control that allows users to toggle between two states.
 * It replaces the Material UI Switch component with a fully responsive and accessible alternative
 * built with Radix UI primitives and Tailwind CSS.
 * 
 * ## Features
 * - Built on Radix UI's accessible switch primitive
 * - Keyboard navigation support
 * - Proper focus management
 * - Error state handling
 * - Helper text support
 * - Group organization for multiple switches
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
 * ### Material UI Switch Props to Shadcn Switch Props
 * | Material UI Prop | Shadcn UI Equivalent | Notes |
 * | --------------- | -------------------- | ----- |
 * | `checked` | `checked` | Same functionality |
 * | `onChange` | `onCheckedChange` | Different callback signature |
 * | `disabled` | `disabled` | Same functionality |
 * | `error` | `error` | Apply to SwitchField |
 * | `FormControlLabel` | `SwitchField` | Use the SwitchField wrapper |
 * | `FormHelperText` | `helperText` | Use on SwitchField |
 * | `FormGroup` | `SwitchGroup` | Use the SwitchGroup wrapper |
 * 
 * ### Example Migration
 * 
 * Material UI:
 * ```tsx
 * <FormControl error={!!error}>
 *   <FormLabel>Notification Settings</FormLabel>
 *   <FormGroup>
 *     <FormControlLabel
 *       control={<Switch checked={emailEnabled} onChange={handleEmailChange} />}
 *       label="Email Notifications"
 *     />
 *     <FormControlLabel
 *       control={<Switch checked={pushEnabled} onChange={handlePushChange} />}
 *       label="Push Notifications"
 *     />
 *   </FormGroup>
 *   <FormHelperText>{error || "Enable or disable notifications"}</FormHelperText>
 * </FormControl>
 * ```
 * 
 * Shadcn UI:
 * ```tsx
 * <SwitchGroup
 *   legend="Notification Settings"
 *   error={!!error}
 *   errorMessage={error}
 *   helperText="Enable or disable notifications"
 * >
 *   <SwitchField
 *     id="email-notifications"
 *     label="Email Notifications"
 *     checked={emailEnabled}
 *     onCheckedChange={handleEmailChange}
 *   />
 *   <SwitchField
 *     id="push-notifications"
 *     label="Push Notifications"
 *     checked={pushEnabled}
 *     onCheckedChange={handlePushChange}
 *   />
 * </SwitchGroup>
 * ```
 */
const meta = {
  title: "UI/Shadcn/Switch",
  component: SwitchField,
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
      description: "Whether the switch is checked",
    },
    disabled: {
      control: "boolean",
      description: "Whether the switch is disabled",
    },
    label: {
      control: "text",
      description: "Label text for the switch",
    },
    helperText: {
      control: "text",
      description: "Helper text to display below the switch",
    },
    error: {
      control: "boolean",
      description: "Whether the switch has an error",
    },
    errorMessage: {
      control: "text",
      description: "Error message to display",
    },
    labelPosition: {
      control: "radio",
      options: ["left", "right"],
      description: "Position of the label relative to the switch",
    },
  },
} satisfies Meta<typeof SwitchField>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic switch with label
 */
export const Default: Story = {
  args: {
    id: "airplane-mode",
    label: "Airplane Mode",
  },
};

/**
 * Switch with helper text
 */
export const WithHelperText: Story = {
  args: {
    id: "dark-mode",
    label: "Dark Mode",
    helperText: "Enable dark theme for the application",
  },
};

/**
 * Switch with error state
 */
export const WithError: Story = {
  args: {
    id: "terms",
    label: "Accept Terms",
    error: true,
    errorMessage: "You must accept the terms to continue",
  },
};

/**
 * Disabled switch
 */
export const Disabled: Story = {
  args: {
    id: "disabled-switch",
    label: "Unavailable Feature",
    disabled: true,
  },
};

/**
 * Switch with label on the left
 */
export const LabelOnLeft: Story = {
  args: {
    id: "notifications",
    label: "Enable Notifications",
    labelPosition: "left",
  },
  parameters: {
    docs: {
      description: {
        story: "Switch with label positioned on the left. This is useful for settings pages where you want the labels to be aligned.",
      },
    },
  },
};

/**
 * Switch group with multiple options
 */
export const SwitchGroupExample: Story = {
  render: () => (
    <div className="w-[300px]">
      <SwitchGroup
        legend="Privacy Settings"
        helperText="Control how your information is used"
      >
        <SwitchField
          id="data-collection"
          label="Allow data collection"
          labelPosition="left"
        />
        <SwitchField
          id="personalized-ads"
          label="Show personalized ads"
          labelPosition="left"
        />
        <SwitchField
          id="location-tracking"
          label="Enable location tracking"
          labelPosition="left"
        />
      </SwitchGroup>
    </div>
  ),
};

/**
 * Switch group with error state
 */
export const SwitchGroupWithError: Story = {
  render: () => (
    <div className="w-[300px]">
      <SwitchGroup
        legend="Required Settings"
        required
        error={true}
        errorMessage="At least one option must be enabled"
      >
        <SwitchField
          id="option-1"
          label="Option 1"
          labelPosition="left"
        />
        <SwitchField
          id="option-2"
          label="Option 2"
          labelPosition="left"
        />
        <SwitchField
          id="option-3"
          label="Option 3"
          labelPosition="left"
        />
      </SwitchGroup>
    </div>
  ),
};

/**
 * Basic switch without wrapper
 */
export const BasicSwitch: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="basic" />
      <Label htmlFor="basic">Airplane Mode</Label>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Basic switch without using the SwitchField wrapper. This approach gives more control over the layout.",
      },
    },
  },
};

/**
 * Responsive form with switch group
 */
export const ResponsiveForm: Story = {
  render: () => (
    <div className="w-full max-w-[500px] p-4 border rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Application Settings</h2>
      
      <div className="space-y-6">
        <SwitchGroup
          legend="Notification Preferences"
          helperText="Control when and how you receive notifications"
        >
          <div className="space-y-3">
            <SwitchField
              id="email-notifications"
              label="Email Notifications"
              labelPosition="left"
              helperText="Receive updates via email"
            />
            <SwitchField
              id="push-notifications"
              label="Push Notifications"
              labelPosition="left"
              helperText="Receive updates on your device"
            />
            <SwitchField
              id="sms-notifications"
              label="SMS Notifications"
              labelPosition="left"
              helperText="Receive updates via text message"
            />
          </div>
        </SwitchGroup>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SwitchField
            id="dark-mode"
            label="Dark Mode"
            labelPosition="left"
            helperText="Use dark theme"
          />
          <SwitchField
            id="auto-save"
            label="Auto Save"
            labelPosition="left"
            helperText="Save changes automatically"
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story: "A responsive form with switch groups that adapt to different screen sizes. The layout changes from single column on mobile to multi-column on larger screens.",
      },
    },
  },
};
