import type { Meta, StoryObj } from "@storybook/react";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectField
} from "./select";
import { Label } from "./label";

/**
 * # Select Component
 * 
 * The Select component is a form control that allows users to select an option from a dropdown menu.
 * It replaces the Material UI Select component with a fully responsive and accessible alternative
 * built with Radix UI primitives and Tailwind CSS.
 * 
 * ## Features
 * - Built on Radix UI's accessible select primitives
 * - Keyboard navigation support
 * - Proper focus management
 * - Error state handling
 * - Helper text support
 * - Responsive design
 * - Group and label organization for options
 * 
 * ## Accessibility Considerations
 * - Proper ARIA attributes for screen readers
 * - Keyboard navigation support (arrow keys, Enter, Escape)
 * - Visual indicators for focus and selection states
 * - Proper color contrast for all states
 * - Support for form validation with error states
 * 
 * ## Migration from Material UI
 * 
 * ### Material UI Select Props to Shadcn Select Props
 * | Material UI Prop | Shadcn UI Equivalent | Notes |
 * | --------------- | -------------------- | ----- |
 * | `value` | `value` | Same functionality |
 * | `onChange` | `onValueChange` | Different callback signature |
 * | `error` | Use on `SelectTrigger` | Apply error prop to trigger |
 * | `fullWidth` | Use on `SelectTrigger` | Apply fullWidth prop to trigger |
 * | `label` | Use `Label` component | Compose with separate Label |
 * | `helperText` | Use `SelectField` | Use the SelectField wrapper |
 * | `variant` | N/A | Not needed in Shadcn UI |
 * | `MenuProps` | N/A | Handled internally |
 * 
 * ### Example Migration
 * 
 * Material UI:
 * ```tsx
 * <FormControl fullWidth error={!!error}>
 *   <InputLabel id="country-label">Country</InputLabel>
 *   <Select
 *     labelId="country-label"
 *     id="country"
 *     value={country}
 *     onChange={handleChange}
 *     label="Country"
 *   >
 *     <MenuItem value="us">United States</MenuItem>
 *     <MenuItem value="ca">Canada</MenuItem>
 *     <MenuItem value="mx">Mexico</MenuItem>
 *   </Select>
 *   <FormHelperText>{error || "Select your country"}</FormHelperText>
 * </FormControl>
 * ```
 * 
 * Shadcn UI:
 * ```tsx
 * <SelectField
 *   label="Country"
 *   value={country}
 *   onValueChange={handleChange}
 *   error={!!error}
 *   errorMessage={error}
 *   helperText="Select your country"
 *   fullWidth
 * >
 *   <SelectItem value="us">United States</SelectItem>
 *   <SelectItem value="ca">Canada</SelectItem>
 *   <SelectItem value="mx">Mexico</SelectItem>
 * </SelectField>
 * ```
 */
const meta = {
  title: "UI/Shadcn/Select",
  component: SelectField,
  parameters: {
    layout: "centered",
    // Enable a11y checks for this component
    a11y: {
      config: {
        rules: [
          {
            id: "select-name",
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
    label: {
      control: "text",
      description: "Label text for the select",
    },
    placeholder: {
      control: "text",
      description: "Placeholder text when no option is selected",
    },
    error: {
      control: "boolean",
      description: "Whether the select has an error",
    },
    errorMessage: {
      control: "text",
      description: "Error message to display",
    },
    helperText: {
      control: "text",
      description: "Helper text to display below the select",
    },
    fullWidth: {
      control: "boolean",
      description: "Whether the select should take up the full width of its container",
    },
  },
} satisfies Meta<typeof SelectField>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic select with options
 */
export const Default: Story = {
  render: (args) => (
    <div className="w-[240px]">
      <SelectField
        label="Fruit"
        placeholder="Select a fruit"
        {...args}
      >
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="orange">Orange</SelectItem>
        <SelectItem value="grape">Grape</SelectItem>
      </SelectField>
    </div>
  ),
};

/**
 * Select with error state and message
 */
export const WithError: Story = {
  render: (args) => (
    <div className="w-[240px]">
      <SelectField
        label="Country"
        placeholder="Select a country"
        error={true}
        errorMessage="Please select a country"
        {...args}
      >
        <SelectItem value="us">United States</SelectItem>
        <SelectItem value="ca">Canada</SelectItem>
        <SelectItem value="mx">Mexico</SelectItem>
        <SelectItem value="uk">United Kingdom</SelectItem>
      </SelectField>
    </div>
  ),
};

/**
 * Select with helper text for additional context
 */
export const WithHelperText: Story = {
  render: (args) => (
    <div className="w-[240px]">
      <SelectField
        label="Language"
        placeholder="Select a language"
        helperText="This will be your default language"
        {...args}
      >
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="es">Spanish</SelectItem>
        <SelectItem value="fr">French</SelectItem>
        <SelectItem value="de">German</SelectItem>
      </SelectField>
    </div>
  ),
};

/**
 * Full width select for responsive layouts
 */
export const FullWidth: Story = {
  render: (args) => (
    <div className="w-full max-w-[500px]">
      <SelectField
        label="Category"
        placeholder="Select a category"
        fullWidth
        {...args}
      >
        <SelectItem value="electronics">Electronics</SelectItem>
        <SelectItem value="clothing">Clothing</SelectItem>
        <SelectItem value="books">Books</SelectItem>
        <SelectItem value="home">Home & Garden</SelectItem>
      </SelectField>
    </div>
  ),
  parameters: {
    layout: "padded",
  },
};

/**
 * Select with option groups for better organization
 */
export const WithGroups: Story = {
  render: (args) => (
    <div className="w-[240px]">
      <SelectField
        label="Vehicle"
        placeholder="Select a vehicle"
        {...args}
      >
        <SelectGroup>
          <SelectLabel>Cars</SelectLabel>
          <SelectItem value="sedan">Sedan</SelectItem>
          <SelectItem value="suv">SUV</SelectItem>
          <SelectItem value="coupe">Coupe</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Motorcycles</SelectLabel>
          <SelectItem value="cruiser">Cruiser</SelectItem>
          <SelectItem value="sport">Sport</SelectItem>
          <SelectItem value="touring">Touring</SelectItem>
        </SelectGroup>
      </SelectField>
    </div>
  ),
};

/**
 * Disabled select state
 */
export const Disabled: Story = {
  render: (args) => (
    <div className="w-[240px]">
      <SelectField
        label="Payment Method"
        placeholder="Select a payment method"
        disabled
        {...args}
      >
        <SelectItem value="credit">Credit Card</SelectItem>
        <SelectItem value="debit">Debit Card</SelectItem>
        <SelectItem value="paypal">PayPal</SelectItem>
      </SelectField>
    </div>
  ),
};

/**
 * Responsive form with multiple selects
 */
export const ResponsiveForm: Story = {
  render: () => (
    <div className="w-full max-w-[600px] p-4 border rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Shipping Information</h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            label="Country"
            placeholder="Select country"
            required
            fullWidth
          >
            <SelectItem value="us">United States</SelectItem>
            <SelectItem value="ca">Canada</SelectItem>
            <SelectItem value="mx">Mexico</SelectItem>
            <SelectItem value="uk">United Kingdom</SelectItem>
          </SelectField>
          
          <SelectField
            label="State/Province"
            placeholder="Select state"
            required
            fullWidth
          >
            <SelectItem value="ny">New York</SelectItem>
            <SelectItem value="ca">California</SelectItem>
            <SelectItem value="tx">Texas</SelectItem>
            <SelectItem value="fl">Florida</SelectItem>
          </SelectField>
        </div>
        
        <SelectField
          label="Shipping Method"
          placeholder="Select shipping method"
          fullWidth
          helperText="Delivery times may vary based on location"
        >
          <SelectItem value="standard">Standard (3-5 business days)</SelectItem>
          <SelectItem value="express">Express (1-2 business days)</SelectItem>
          <SelectItem value="overnight">Overnight (Next day)</SelectItem>
        </SelectField>
      </div>
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story: "A responsive form with multiple selects that adapt to different screen sizes. On small screens, selects stack vertically; on larger screens, they display in a two-column grid.",
      },
    },
  },
};

/**
 * Custom implementation with separate components
 */
export const CustomImplementation: Story = {
  render: () => (
    <div className="w-[240px] space-y-2">
      <Label htmlFor="custom-select">Custom Select</Label>
      <Select>
        <SelectTrigger id="custom-select" className="w-full">
          <SelectValue placeholder="Select a timezone" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>North America</SelectLabel>
            <SelectItem value="est">Eastern Time (EST)</SelectItem>
            <SelectItem value="cst">Central Time (CST)</SelectItem>
            <SelectItem value="mst">Mountain Time (MST)</SelectItem>
            <SelectItem value="pst">Pacific Time (PST)</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Europe</SelectLabel>
            <SelectItem value="gmt">GMT (Greenwich Mean Time)</SelectItem>
            <SelectItem value="cet">Central European Time (CET)</SelectItem>
            <SelectItem value="eet">Eastern European Time (EET)</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Example of custom implementation using individual select components.
      </p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Custom implementation using individual select components instead of the SelectField wrapper. This approach gives more control over the layout and styling.",
      },
    },
  },
};
