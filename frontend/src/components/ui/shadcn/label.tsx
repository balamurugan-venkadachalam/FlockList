import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Label variants with responsive text sizes and proper contrast
 */
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  {
    variants: {
      size: {
        default: "text-sm",
        sm: "text-xs",
        lg: "text-base",
        // Responsive size that adapts to screen width
        responsive: "text-xs sm:text-sm md:text-base",
      },
      required: {
        true: "after:content-['*'] after:ml-0.5 after:text-destructive",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

/**
 * Label component with accessibility features
 * Replaces Material UI FormLabel/InputLabel components
 * 
 * @component
 * @example
 * // Basic usage
 * <Label htmlFor="email">Email</Label>
 * <Input id="email" />
 * 
 * // Required field
 * <Label htmlFor="name" required>Name</Label>
 * 
 * // With responsive size
 * <Label htmlFor="address" size="responsive">Address</Label>
 */
const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants> & {
      /** Marks the field as required with visual indicator */
      required?: boolean;
    }
>(({ className, size, required, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants({ size, required, className }))}
    {...props}
  />
));
Label.displayName = "Label";

export { Label };
