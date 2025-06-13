import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "../../../lib/utils";

/**
 * Slider component built with Radix UI primitives
 * Provides an accessible slider control for selecting values from a range
 */
const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    variant?: "default" | "success" | "warning" | "destructive";
    showValue?: boolean;
    formatValue?: (value: number[]) => string;
    thumbClassName?: string;
    trackClassName?: string;
    rangeClassName?: string;
    valueDisplayClassName?: string;
  }
>(({ 
  className, 
  variant = "default", 
  showValue = false,
  formatValue,
  thumbClassName,
  trackClassName,
  rangeClassName,
  valueDisplayClassName,
  ...props 
}, ref) => {
  const value = props.value || props.defaultValue || [0];
  
  const formattedValue = React.useMemo(() => {
    if (formatValue) {
      return formatValue(value);
    }
    return Array.isArray(value) ? value.map(v => v.toString()).join(" - ") : value.toString();
  }, [value, formatValue]);

  return (
    <div className="relative">
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className
        )}
        {...props}
      >
        <SliderPrimitive.Track
          className={cn(
            "relative h-2 w-full grow overflow-hidden rounded-full bg-secondary",
            trackClassName
          )}
        >
          <SliderPrimitive.Range
            className={cn(
              "absolute h-full",
              variant === "default" && "bg-primary",
              variant === "success" && "bg-success",
              variant === "warning" && "bg-warning",
              variant === "destructive" && "bg-destructive",
              rangeClassName
            )}
          />
        </SliderPrimitive.Track>
        {props.value?.map((_, i) => (
          <SliderPrimitive.Thumb
            key={i}
            className={cn(
              "block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              variant === "default" && "border-primary",
              variant === "success" && "border-success",
              variant === "warning" && "border-warning",
              variant === "destructive" && "border-destructive",
              thumbClassName
            )}
            aria-label={`Thumb ${i + 1}`}
          />
        ))}
        {props.defaultValue?.map((_, i) => (
          <SliderPrimitive.Thumb
            key={i}
            className={cn(
              "block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              variant === "default" && "border-primary",
              variant === "success" && "border-success",
              variant === "warning" && "border-warning",
              variant === "destructive" && "border-destructive",
              thumbClassName
            )}
            aria-label={`Thumb ${i + 1}`}
          />
        ))}
      </SliderPrimitive.Root>
      
      {showValue && (
        <div 
          className={cn(
            "absolute right-0 -top-6 text-xs font-medium",
            valueDisplayClassName
          )}
        >
          {formattedValue}
        </div>
      )}
    </div>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
