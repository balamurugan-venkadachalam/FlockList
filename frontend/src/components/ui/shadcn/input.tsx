import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Adds error styling to the input */
  error?: boolean;
  /** Error message to display (for screen readers) */
  errorMessage?: string;
  /** Makes the input take up the full width of its container */
  fullWidth?: boolean;
  /** Adds helper text below the input (for additional context) */
  helperText?: string;
  /** ID for the helper text element (for accessibility) */
  helperTextId?: string;
}

/**
 * Input component with responsive design and accessibility features
 * Replaces Material UI TextField/Input components
 * 
 * @component
 * @example
 * // Basic usage
 * <Input placeholder="Enter your name" />
 * 
 * // With error state
 * <Input 
 *   error={true}
 *   errorMessage="This field is required"
 *   aria-invalid={true}
 * />
 * 
 * // With helper text
 * <Input
 *   helperText="Your password must be at least 8 characters"
 *   helperTextId="password-helper"
 *   aria-describedby="password-helper"
 * />
 * 
 * // Full width responsive input
 * <Input fullWidth placeholder="Search..." />
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    error, 
    errorMessage,
    fullWidth,
    helperText,
    helperTextId,
    ...props 
  }, ref) => {
    // Generate a unique ID for helper/error text if not provided
    const uniqueId = React.useId();
    const helperId = helperTextId || `helper-${uniqueId}`;
    const errorId = `error-${uniqueId}`;
    
    // Determine if we need aria-describedby (for screen readers)
    const getAriaDescribedBy = () => {
      if (props["aria-describedby"]) return props["aria-describedby"];
      if (error && errorMessage) return errorId;
      if (helperText) return helperId;
      return undefined;
    };
    
    const ariaDescribedBy = getAriaDescribedBy();
    
    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
        <input
          type={type}
          className={cn(
            "flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive",
            fullWidth && "w-full",
            className
          )}
          ref={ref}
          aria-invalid={error}
          aria-describedby={ariaDescribedBy}
          {...props}
        />
        
        {/* Helper text for additional context */}
        {helperText && !error && (
          <p 
            id={helperId}
            className="text-sm text-muted-foreground"
          >
            {helperText}
          </p>
        )}
        
        {/* Error message for validation feedback */}
        {error && errorMessage && (
          <p 
            id={errorId}
            className="text-sm font-medium text-destructive"
          >
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
