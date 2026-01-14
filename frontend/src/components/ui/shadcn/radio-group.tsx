import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";

import { cn } from "../../../lib/utils";

/**
 * RadioGroup component built with Radix UI primitives
 * Provides an accessible radio button group with customizable styling
 */
const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> & {
    error?: boolean;
    fullWidth?: boolean;
  }
>(({ className, error, fullWidth, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", fullWidth && "w-full", className)}
      {...props}
      ref={ref}
    />
  );
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

/**
 * RadioGroupItem component for individual radio buttons
 */
const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & {
    error?: boolean;
  }
>(({ className, error, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        error && "border-destructive",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

/**
 * RadioItem component that includes a label and radio button
 * Provides a complete form field with proper accessibility attributes
 */
interface RadioItemProps extends React.ComponentPropsWithoutRef<typeof RadioGroupItem> {
  label: string;
  helperText?: string;
}

const RadioItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupItem>,
  RadioItemProps
>(({ id, label, helperText, className, ...props }, ref) => {
  const helperId = helperText ? `${id}-description` : undefined;
  
  return (
    <div className={cn("flex items-start space-x-2", className)}>
      <RadioGroupItem
        ref={ref}
        id={id}
        aria-describedby={helperId}
        {...props}
      />
      <div className="grid gap-1.5 leading-none">
        <label
          htmlFor={id}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </label>
        {helperText && (
          <p
            id={helperId}
            className="text-xs text-muted-foreground"
          >
            {helperText}
          </p>
        )}
      </div>
    </div>
  );
});
RadioItem.displayName = "RadioItem";

/**
 * RadioGroupField component that includes a fieldset, legend, and radio group
 * Provides a complete form field with proper accessibility attributes
 */
interface RadioGroupFieldProps extends React.ComponentPropsWithoutRef<typeof RadioGroup> {
  legend: string;
  legendClassName?: string;
  errorMessage?: string;
  helperText?: string;
  required?: boolean;
}

const RadioGroupField = React.forwardRef<
  React.ElementRef<typeof RadioGroup>,
  RadioGroupFieldProps
>(({ 
  legend, 
  legendClassName, 
  children, 
  className, 
  error, 
  errorMessage, 
  helperText, 
  required,
  ...props 
}, ref) => {
  const hasError = error || !!errorMessage;
  const id = React.useId();
  const helperId = helperText || errorMessage ? `${id}-description` : undefined;
  
  return (
    <fieldset 
      className={cn("space-y-2", className)}
      aria-describedby={helperId}
    >
      <legend className={cn(
        "text-sm font-medium leading-none mb-2",
        hasError && "text-destructive",
        legendClassName
      )}>
        {legend}
        {required && <span className="text-destructive ml-1" aria-hidden="true">*</span>}
      </legend>
      
      <RadioGroup 
        ref={ref}
        error={hasError}
        {...props}
      >
        {children}
      </RadioGroup>
      
      {(helperText || errorMessage) && (
        <p
          id={helperId}
          className={cn(
            "text-xs",
            hasError ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {errorMessage || helperText}
        </p>
      )}
    </fieldset>
  );
});
RadioGroupField.displayName = "RadioGroupField";

export { RadioGroup, RadioGroupItem, RadioItem, RadioGroupField };
