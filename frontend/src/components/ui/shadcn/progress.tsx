import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "../../../lib/utils";

/**
 * Progress component built with Radix UI primitives
 * Provides an accessible progress indicator with customizable styling
 */
const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    variant?: "default" | "success" | "warning" | "destructive";
    size?: "sm" | "md" | "lg";
    showValue?: boolean;
    formatValue?: (value: number) => string;
    animate?: boolean;
  }
>(({ 
  className, 
  value, 
  variant = "default", 
  size = "md", 
  showValue = false,
  formatValue = (value) => `${value}%`,
  animate = true,
  ...props 
}, ref) => (
  <div className={cn("relative", className)}>
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative overflow-hidden rounded-full bg-secondary",
        size === "sm" && "h-1",
        size === "md" && "h-2",
        size === "lg" && "h-3",
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 transition-all",
          animate ? "transition-[width] duration-500 ease-in-out" : "",
          variant === "default" && "bg-primary",
          variant === "success" && "bg-success",
          variant === "warning" && "bg-warning",
          variant === "destructive" && "bg-destructive",
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
    
    {showValue && typeof value === "number" && (
      <div className="absolute right-0 top-0 -translate-y-full -translate-x-1 text-xs font-medium pr-1 pb-1">
        {formatValue(value)}
      </div>
    )}
  </div>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

/**
 * Indeterminate progress indicator for loading states
 */
const ProgressIndeterminate = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    variant?: "default" | "success" | "warning" | "destructive";
    size?: "sm" | "md" | "lg";
  }
>(({ className, variant = "default", size = "md", ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative overflow-hidden rounded-full bg-secondary",
      size === "sm" && "h-1",
      size === "md" && "h-2",
      size === "lg" && "h-3",
      className
    )}
    {...props}
  >
    <div
      className={cn(
        "animate-indeterminate-progress w-full h-full",
        variant === "default" && "bg-primary",
        variant === "success" && "bg-success",
        variant === "warning" && "bg-warning",
        variant === "destructive" && "bg-destructive",
      )}
    />
  </ProgressPrimitive.Root>
));
ProgressIndeterminate.displayName = "ProgressIndeterminate";

export { Progress, ProgressIndeterminate };
