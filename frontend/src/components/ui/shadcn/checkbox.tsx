import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "../../../lib/utils";

/**
 * Checkbox component built with Radix UI primitives
 * Provides an accessible checkbox input with customizable styling
 */
const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
    error?: boolean;
    helperText?: string;
    fullWidth?: boolean;
  }
>(({ className, error, helperText, fullWidth, ...props }, ref) => (
  <div className={cn("flex items-start", fullWidth && "w-full")}>
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        error && "border-destructive",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn("flex items-center justify-center text-current")}
      >
        <Check className="h-3.5 w-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  </div>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

/**
 * CheckboxField component that includes a label, checkbox, and optional helper text
 * Provides a complete form field with proper accessibility attributes
 */
interface CheckboxFieldProps extends React.ComponentPropsWithoutRef<typeof Checkbox> {
  label: string;
  helperText?: string;
  errorMessage?: string;
  id: string;
}

const CheckboxField = React.forwardRef<
  React.ElementRef<typeof Checkbox>,
  CheckboxFieldProps
>(({ id, label, helperText, errorMessage, className, error, ...props }, ref) => {
  const hasError = error || !!errorMessage;
  const helperId = helperText || errorMessage ? `${id}-description` : undefined;
  
  return (
    <div className={cn("flex flex-col space-y-1", className)}>
      <div className="flex items-center space-x-2">
        <Checkbox
          ref={ref}
          id={id}
          error={hasError}
          aria-describedby={helperId}
          {...props}
        />
        <label
          htmlFor={id}
          className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            hasError && "text-destructive"
          )}
        >
          {label}
        </label>
      </div>
      
      {(helperText || errorMessage) && (
        <p
          id={helperId}
          className={cn(
            "text-xs",
            hasError ? "text-destructive" : "text-muted-foreground",
            "pl-6" // Align with checkbox label
          )}
        >
          {errorMessage || helperText}
        </p>
      )}
    </div>
  );
});
CheckboxField.displayName = "CheckboxField";

/**
 * CheckboxGroup component for grouping multiple checkboxes with a common label
 */
interface CheckboxGroupProps extends React.HTMLAttributes<HTMLFieldSetElement> {
  legend: string;
  legendClassName?: string;
  error?: boolean;
  errorMessage?: string;
  helperText?: string;
  required?: boolean;
}

const CheckboxGroup = React.forwardRef<
  HTMLFieldSetElement,
  CheckboxGroupProps
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
      ref={ref}
      className={cn("space-y-2", className)}
      aria-describedby={helperId}
      {...props}
    >
      <legend className={cn(
        "text-sm font-medium leading-none mb-2",
        hasError && "text-destructive",
        legendClassName
      )}>
        {legend}
        {required && <span className="text-destructive ml-1" aria-hidden="true">*</span>}
      </legend>
      
      <div className="space-y-2">
        {children}
      </div>
      
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
CheckboxGroup.displayName = "CheckboxGroup";

export { Checkbox, CheckboxField, CheckboxGroup };
