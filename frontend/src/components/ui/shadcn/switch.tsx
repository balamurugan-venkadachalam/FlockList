import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "../../../lib/utils";

/**
 * Switch component built with Radix UI primitives
 * Provides an accessible toggle switch with customizable styling
 */
const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & {
    error?: boolean;
  }
>(({ className, error, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      error && "border-destructive",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

/**
 * SwitchField component that includes a label, switch, and optional helper text
 * Provides a complete form field with proper accessibility attributes
 */
interface SwitchFieldProps extends React.ComponentPropsWithoutRef<typeof Switch> {
  label: string;
  helperText?: string;
  errorMessage?: string;
  id: string;
  labelPosition?: "left" | "right";
}

const SwitchField = React.forwardRef<
  React.ElementRef<typeof Switch>,
  SwitchFieldProps
>(({ id, label, helperText, errorMessage, className, error, labelPosition = "right", ...props }, ref) => {
  const hasError = error || !!errorMessage;
  const helperId = helperText || errorMessage ? `${id}-description` : undefined;
  
  return (
    <div className={cn("space-y-2", className)}>
      <div className={cn(
        "flex items-center justify-between",
        labelPosition === "left" ? "flex-row" : "flex-row-reverse",
        labelPosition === "left" ? "justify-between" : "justify-end gap-2"
      )}>
        <label
          htmlFor={id}
          className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            hasError && "text-destructive"
          )}
        >
          {label}
        </label>
        <Switch
          ref={ref}
          id={id}
          error={hasError}
          aria-describedby={helperId}
          {...props}
        />
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
    </div>
  );
});
SwitchField.displayName = "SwitchField";

/**
 * SwitchGroup component for grouping multiple switches with a common label
 */
interface SwitchGroupProps extends React.HTMLAttributes<HTMLFieldSetElement> {
  legend: string;
  legendClassName?: string;
  error?: boolean;
  errorMessage?: string;
  helperText?: string;
  required?: boolean;
}

const SwitchGroup = React.forwardRef<
  HTMLFieldSetElement,
  SwitchGroupProps
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
      className={cn("space-y-4", className)}
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
      
      <div className="space-y-3">
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
SwitchGroup.displayName = "SwitchGroup";

export { Switch, SwitchField, SwitchGroup };
