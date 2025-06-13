import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { addDays, format } from "date-fns";
import { Calendar } from "./calendar";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "../../../lib/utils";
import { CalendarIcon } from "lucide-react";

/**
 * # Calendar Component
 * 
 * The Calendar component provides an accessible date picker built with react-day-picker.
 * It replaces the Material UI DatePicker component with a fully accessible
 * alternative styled with Tailwind CSS.
 * 
 * ## Features
 * - Single date selection
 * - Date range selection
 * - Multiple date selection
 * - Compact variant
 * - Customizable styling
 * 
 * ## Accessibility Considerations
 * - Keyboard navigation support
 * - Proper ARIA attributes for screen readers
 * - Focus management
 * - Sufficient color contrast
 * 
 * ## Migration from Material UI
 * 
 * ### Material UI DatePicker Props to Shadcn Calendar Props
 * | Material UI Prop | Shadcn UI Equivalent | Notes |
 * | --------------- | -------------------- | ----- |
 * | `value` | `selected` | Different naming |
 * | `onChange` | `onSelect` | Different signature |
 * | `minDate` | `fromDate` | Different naming |
 * | `maxDate` | `toDate` | Different naming |
 * | `disablePast` | `fromDate={new Date()}` | Different approach |
 * | `disableFuture` | `toDate={new Date()}` | Different approach |
 * | `renderDay` | `components.Day` | Different API |
 * | `sx` | `className` | Use Tailwind classes |
 * 
 * ### Example Migration
 * 
 * Material UI:
 * ```tsx
 * <DatePicker
 *   label="Basic date picker"
 *   value={value}
 *   onChange={(newValue) => setValue(newValue)}
 * />
 * ```
 * 
 * Shadcn UI:
 * ```tsx
 * <Calendar
 *   mode="single"
 *   selected={date}
 *   onSelect={setDate}
 * />
 * ```
 */
const meta = {
  title: "UI/Shadcn/Calendar",
  component: Calendar,
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
    mode: {
      control: "select",
      options: ["single", "multiple", "range"],
      description: "The selection mode of the calendar",
    },
    selected: {
      control: "date",
      description: "The selected date(s)",
    },
    variant: {
      control: "select",
      options: ["default", "compact"],
      description: "The visual style of the calendar",
    },
    showOutsideDays: {
      control: "boolean",
      description: "Whether to show days from the previous/next month",
    },
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic calendar example with single date selection
 */
export const Default: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    
    return (
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: "A basic calendar with single date selection.",
      },
    },
  },
};

/**
 * Calendar with date range selection
 */
export const DateRange: Story = {
  render: () => {
    const [dateRange, setDateRange] = useState<{
      from: Date;
      to?: Date;
    }>({
      from: new Date(),
      to: addDays(new Date(), 7),
    });
    
    return (
      <Calendar
        mode="range"
        selected={dateRange}
        onSelect={setDateRange}
        className="rounded-md border"
        numberOfMonths={2}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: "A calendar with date range selection.",
      },
    },
  },
};

/**
 * Calendar with multiple date selection
 */
export const MultipleDates: Story = {
  render: () => {
    const [dates, setDates] = useState<Date[]>([
      new Date(),
      addDays(new Date(), 2),
      addDays(new Date(), 5),
    ]);
    
    return (
      <Calendar
        mode="multiple"
        selected={dates}
        onSelect={setDates}
        className="rounded-md border"
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: "A calendar with multiple date selection.",
      },
    },
  },
};

/**
 * Calendar with compact variant
 */
export const CompactVariant: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    
    return (
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
        variant="compact"
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: "A compact variant of the calendar with smaller cells and text.",
      },
    },
  },
};

/**
 * Calendar with date constraints
 */
export const DateConstraints: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    
    // Disable dates before today and after 30 days from now
    const today = new Date();
    const thirtyDaysFromNow = addDays(today, 30);
    
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Only dates between today and 30 days from now are selectable.
        </p>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
          fromDate={today}
          toDate={thirtyDaysFromNow}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "A calendar with date constraints, allowing selection only within a specific range.",
      },
    },
  },
};

/**
 * Calendar with date picker popover
 */
export const DatePickerWithPopover: Story = {
  render: () => {
    const [date, setDate] = useState<Date>();
    
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "A date picker implementation using the Calendar component inside a Popover.",
      },
    },
  },
};

/**
 * Responsive calendar
 */
export const ResponsiveCalendar: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This calendar adapts to different screen sizes.
        </p>
        <div className="hidden md:block">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
            numberOfMonths={2}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Showing 2 months on medium and larger screens
          </p>
        </div>
        <div className="block md:hidden">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
            numberOfMonths={1}
            variant="compact"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Showing 1 month in compact mode on smaller screens
          </p>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "A responsive calendar that adapts to different screen sizes.",
      },
    },
    viewport: {
      defaultViewport: "md",
    },
  },
};

/**
 * Calendar with custom styling
 */
export const CustomStyling: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    
    return (
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border p-0"
        classNames={{
          day_selected: "bg-blue-500 text-white hover:bg-blue-600",
          day_today: "bg-yellow-100 text-yellow-900",
          caption: "flex justify-center pt-2 relative items-center bg-gray-50",
          caption_label: "text-base font-bold",
          nav_button: "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 hover:bg-gray-100",
          table: "w-full border-collapse space-y-1 bg-white",
        }}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: "A calendar with custom styling applied using the classNames prop.",
      },
    },
  },
};

/**
 * Accessible calendar with keyboard navigation
 */
export const AccessibleCalendar: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Accessible Calendar</h3>
          <p className="text-sm text-muted-foreground">
            This calendar supports keyboard navigation. Try using arrow keys, Home, End, Page Up, and Page Down.
          </p>
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
          initialFocus
        />
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Keyboard controls:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Arrow keys: Navigate between days</li>
            <li>Home/End: Go to the first/last day of the week</li>
            <li>Page Up/Down: Go to the previous/next month</li>
            <li>Shift + Page Up/Down: Go to the previous/next year</li>
            <li>Space/Enter: Select the focused day</li>
            <li>Escape: Return focus to the calendar without selecting a date</li>
          </ul>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "An accessible calendar with keyboard navigation instructions.",
      },
    },
  },
};
