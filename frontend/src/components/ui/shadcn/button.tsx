import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Define button variants with responsive and accessible styles
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        // Responsive sizes that adapt to screen width
        responsive: "h-8 px-2 sm:h-9 sm:px-3 md:h-10 md:px-4 lg:h-11 lg:px-8",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// Define button props with accessibility and responsive options
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  fullWidth?: boolean;
  // Accessibility props
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaExpanded?: boolean;
  ariaControls?: string;
}

/**
 * Button component with responsive design and accessibility features
 * 
 * @component
 * @example
 * // Basic usage
 * <Button>Click me</Button>
 * 
 * // With variants
 * <Button variant="destructive">Delete</Button>
 * 
 * // With responsive size
 * <Button size="responsive">Responsive Button</Button>
 * 
 * // With accessibility features
 * <Button 
 *   ariaLabel="Delete item" 
 *   ariaDescribedBy="delete-description"
 * >
 *   Delete
 * </Button>
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth,
    asChild = false, 
    ariaLabel,
    ariaDescribedBy,
    ariaExpanded,
    ariaControls,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    // Accessibility attributes
    const accessibilityProps: Record<string, string | boolean | undefined> = {};
    if (ariaLabel) accessibilityProps["aria-label"] = ariaLabel;
    if (ariaDescribedBy) accessibilityProps["aria-describedby"] = ariaDescribedBy;
    if (ariaExpanded !== undefined) accessibilityProps["aria-expanded"] = ariaExpanded;
    if (ariaControls) accessibilityProps["aria-controls"] = ariaControls;
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        {...accessibilityProps}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
