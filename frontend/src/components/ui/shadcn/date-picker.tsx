import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "../../../lib/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export interface DatePickerProps {
  /** Date value */
  date?: Date;
  /** Callback when date changes */
  onDateChange?: (date?: Date) => void;
  /** Placeholder text when no date is selected */
  placeholder?: string;
  /** Disable the date picker */
  disabled?: boolean;
  /** CSS class name */
  className?: string;
  /** Format for displaying the date (date-fns format) */
  dateFormat?: string;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Label for the date picker */
  label?: string;
  /** Whether the label should be visually hidden */
  hideLabel?: boolean;
  /** Whether the date picker should be required */
  required?: boolean;
  /** Error message to display */
  error?: string;
  /** ID for the input element */
  id?: string;
  /** Name for the input element */
  name?: string;
  /** Whether the date picker should be compact */
  compact?: boolean;
}

/**
 * DatePicker component that combines Popover and Calendar for an accessible date selection experience
 */
export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  disabled = false,
  className,
  dateFormat = "PPP",
  minDate,
  maxDate,
  label,
  hideLabel = false,
  required = false,
  error,
  id,
  name,
  compact = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (selectedDate: Date | undefined) => {
    onDateChange?.(selectedDate);
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={id}
          className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            hideLabel && "sr-only"
          )}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            name={name}
            variant="outline"
            size={compact ? "sm" : "default"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
              error && "border-destructive",
              className
            )}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, dateFormat) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            initialFocus
            fromDate={minDate}
            toDate={maxDate}
            variant={compact ? "compact" : "default"}
          />
        </PopoverContent>
      </Popover>
      {error && (
        <p
          id={`${id}-error`}
          className="text-sm text-destructive mt-1"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export interface DateRangePickerProps {
  /** Date range value */
  dateRange?: {
    from: Date;
    to?: Date;
  };
  /** Callback when date range changes */
  onDateRangeChange?: (dateRange?: { from: Date; to?: Date }) => void;
  /** Placeholder text when no date range is selected */
  placeholder?: string;
  /** Disable the date range picker */
  disabled?: boolean;
  /** CSS class name */
  className?: string;
  /** Format for displaying the date (date-fns format) */
  dateFormat?: string;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Label for the date range picker */
  label?: string;
  /** Whether the label should be visually hidden */
  hideLabel?: boolean;
  /** Whether the date range picker should be required */
  required?: boolean;
  /** Error message to display */
  error?: string;
  /** ID for the input element */
  id?: string;
  /** Name for the input element */
  name?: string;
  /** Number of months to display */
  numberOfMonths?: number;
  /** Whether the date picker should be compact */
  compact?: boolean;
}

/**
 * DateRangePicker component that combines Popover and Calendar for an accessible date range selection experience
 */
export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  placeholder = "Pick a date range",
  disabled = false,
  className,
  dateFormat = "PPP",
  minDate,
  maxDate,
  label,
  hideLabel = false,
  required = false,
  error,
  id,
  name,
  numberOfMonths = 2,
  compact = false,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (range: { from: Date; to?: Date } | undefined) => {
    onDateRangeChange?.(range);
    if (range?.from && range?.to) {
      setOpen(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={id}
          className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            hideLabel && "sr-only"
          )}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            name={name}
            variant="outline"
            size={compact ? "sm" : "default"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !dateRange && "text-muted-foreground",
              error && "border-destructive",
              className
            )}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, dateFormat)} -{" "}
                  {format(dateRange.to, dateFormat)}
                </>
              ) : (
                format(dateRange.from, dateFormat)
              )
            ) : (
              placeholder
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0"
          align="start"
          side="bottom"
          sideOffset={5}
        >
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={handleSelect}
            initialFocus
            numberOfMonths={numberOfMonths}
            fromDate={minDate}
            toDate={maxDate}
            variant={compact ? "compact" : "default"}
          />
        </PopoverContent>
      </Popover>
      {error && (
        <p
          id={`${id}-error`}
          className="text-sm text-destructive mt-1"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
