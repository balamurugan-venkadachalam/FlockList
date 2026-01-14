import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { addDays } from "date-fns";
import { DatePicker, DateRangePicker } from "./date-picker";

/**
 * # Date Picker Component
 * 
 * The DatePicker component provides an accessible date selection interface
 * that combines the Calendar component with a Popover for a complete date picking experience.
 * It replaces the Material UI DatePicker component with a fully accessible
 * alternative styled with Tailwind CSS.
 * 
 * ## Features
 * - Single date selection
 * - Date range selection
 * - Form integration with labels and error states
 * - Customizable date format
 * - Date constraints (min/max dates)
 * - Compact mode for space-constrained UIs
 * 
 * ## Accessibility Considerations
 * - Keyboard navigation support
 * - Proper ARIA attributes for screen readers
 * - Focus management
 * - Error messaging
 * - Required field indication
 * 
 * ## Migration from Material UI
 * 
 * ### Material UI DatePicker Props to Shadcn DatePicker Props
 * | Material UI Prop | Shadcn UI Equivalent | Notes |
 * | --------------- | -------------------- | ----- |
 * | `value` | `date` | Different naming |
 * | `onChange` | `onDateChange` | Different signature |
 * | `minDate` | `minDate` | Same functionality |
 * | `maxDate` | `maxDate` | Same functionality |
 * | `label` | `label` | Same functionality |
 * | `disabled` | `disabled` | Same functionality |
 * | `required` | `required` | Same functionality |
 * | `error` | `error` | Takes string instead of boolean |
 * | `helperText` | Use separate component | No direct equivalent |
 * | `inputFormat` | `dateFormat` | Uses date-fns format |
 * | `renderInput` | N/A | Different component structure |
 * | `PopperProps` | N/A | Different component structure |
 * 
 * ### Example Migration
 * 
 * Material UI:
 * ```tsx
 * <DatePicker
 *   label="Basic date picker"
 *   value={value}
 *   onChange={(newValue) => setValue(newValue)}
 *   renderInput={(params) => <TextField {...params} />}
 * />
 * ```
 * 
 * Shadcn UI:
 * ```tsx
 * <DatePicker
 *   label="Basic date picker"
 *   date={date}
 *   onDateChange={setDate}
 * />
 * ```
 */
const meta = {
  title: "UI/Shadcn/DatePicker",
  component: DatePicker,
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
    date: {
      control: "date",
      description: "The selected date",
    },
    placeholder: {
      control: "text",
      description: "Placeholder text when no date is selected",
    },
    disabled: {
      control: "boolean",
      description: "Whether the date picker is disabled",
    },
    dateFormat: {
      control: "text",
      description: "Format for displaying the date (date-fns format)",
    },
    label: {
      control: "text",
      description: "Label for the date picker",
    },
    required: {
      control: "boolean",
      description: "Whether the date picker is required",
    },
    error: {
      control: "text",
      description: "Error message to display",
    },
    compact: {
      control: "boolean",
      description: "Whether the date picker should be compact",
    },
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic date picker example
 */
export const Default: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    
    return (
      <div className="w-[300px]">
        <DatePicker
          date={date}
          onDateChange={setDate}
          label="Select a date"
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "A basic date picker with a label.",
      },
    },
  },
};

/**
 * Date picker with different states
 */
export const States: Story = {
  render: () => {
    const [date1, setDate1] = useState<Date | undefined>(new Date());
    const [date2, setDate2] = useState<Date | undefined>();
    const [date3, setDate3] = useState<Date | undefined>(new Date());
    
    return (
      <div className="w-[300px] space-y-6">
        <DatePicker
          date={date1}
          onDateChange={setDate1}
          label="Default state"
        />
        
        <DatePicker
          date={date2}
          onDateChange={setDate2}
          label="Empty state"
          placeholder="No date selected"
        />
        
        <DatePicker
          date={date3}
          onDateChange={setDate3}
          label="Disabled state"
          disabled
        />
        
        <DatePicker
          date={undefined}
          onDateChange={() => {}}
          label="Error state"
          error="Please select a valid date"
        />
        
        <DatePicker
          date={undefined}
          onDateChange={() => {}}
          label="Required field"
          required
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Date pickers in different states: default, empty, disabled, error, and required.",
      },
    },
  },
};

/**
 * Date picker with date constraints
 */
export const DateConstraints: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>();
    
    // Disable dates before today and after 30 days from now
    const today = new Date();
    const thirtyDaysFromNow = addDays(today, 30);
    
    return (
      <div className="w-[300px] space-y-4">
        <p className="text-sm text-muted-foreground">
          Only dates between today and 30 days from now are selectable.
        </p>
        <DatePicker
          date={date}
          onDateChange={setDate}
          label="Select a date"
          minDate={today}
          maxDate={thirtyDaysFromNow}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "A date picker with date constraints, allowing selection only within a specific range.",
      },
    },
  },
};

/**
 * Date picker with custom date format
 */
export const CustomDateFormat: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    
    return (
      <div className="w-[300px] space-y-6">
        <DatePicker
          date={date}
          onDateChange={setDate}
          label="Default format (PPP)"
          dateFormat="PPP"
        />
        
        <DatePicker
          date={date}
          onDateChange={setDate}
          label="Short format (P)"
          dateFormat="P"
        />
        
        <DatePicker
          date={date}
          onDateChange={setDate}
          label="Custom format (yyyy-MM-dd)"
          dateFormat="yyyy-MM-dd"
        />
        
        <DatePicker
          date={date}
          onDateChange={setDate}
          label="With day name (EEEE, MMMM d, yyyy)"
          dateFormat="EEEE, MMMM d, yyyy"
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Date pickers with different date formats using date-fns formatting.",
      },
    },
  },
};

/**
 * Compact date picker
 */
export const CompactDatePicker: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    
    return (
      <div className="w-[300px]">
        <DatePicker
          date={date}
          onDateChange={setDate}
          label="Compact date picker"
          compact
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "A compact variant of the date picker with smaller button and calendar.",
      },
    },
  },
};

/**
 * Date range picker
 */
export const DateRangePickerExample: Story = {
  render: () => {
    const [dateRange, setDateRange] = useState<{
      from: Date;
      to?: Date;
    }>({
      from: new Date(),
      to: addDays(new Date(), 7),
    });
    
    return (
      <div className="w-[300px]">
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          label="Select date range"
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "A date range picker for selecting a start and end date.",
      },
    },
  },
};

/**
 * Responsive date picker
 */
export const ResponsiveDatePicker: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [dateRange, setDateRange] = useState<{
      from: Date;
      to?: Date;
    }>({
      from: new Date(),
      to: addDays(new Date(), 7),
    });
    
    return (
      <div className="space-y-8 w-full max-w-md">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Responsive Date Picker</h3>
          <div className="hidden md:block">
            <DatePicker
              date={date}
              onDateChange={setDate}
              label="Standard size on larger screens"
            />
          </div>
          <div className="block md:hidden">
            <DatePicker
              date={date}
              onDateChange={setDate}
              label="Compact on mobile screens"
              compact
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Responsive Date Range Picker</h3>
          <div className="hidden md:block">
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              label="Two months on larger screens"
              numberOfMonths={2}
            />
          </div>
          <div className="block md:hidden">
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              label="One month on mobile screens"
              numberOfMonths={1}
              compact
            />
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Responsive date pickers that adapt to different screen sizes.",
      },
    },
    viewport: {
      defaultViewport: "md",
    },
  },
};

/**
 * Accessible date picker
 */
export const AccessibleDatePicker: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>();
    
    return (
      <div className="w-[300px] space-y-6">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Accessible Date Picker</h3>
          <p className="text-sm text-muted-foreground">
            This date picker follows accessibility best practices.
          </p>
        </div>
        
        <DatePicker
          id="accessible-date"
          name="accessible-date"
          date={date}
          onDateChange={setDate}
          label="Select a date"
          required
          error={!date ? "Please select a date" : undefined}
        />
        
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Accessibility features:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Proper labeling with label association</li>
            <li>Required field indication</li>
            <li>Error messaging with ARIA attributes</li>
            <li>Keyboard navigation in calendar</li>
            <li>Focus management</li>
            <li>Screen reader announcements</li>
          </ul>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "An accessible date picker with proper labeling, error states, and keyboard support.",
      },
    },
  },
};
