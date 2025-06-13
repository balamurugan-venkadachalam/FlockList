import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "../../../lib/utils";

/**
 * Popover component built with Radix UI primitives
 * Provides an accessible popover that can be triggered by a button
 */
const Popover = PopoverPrimitive.Root;

/**
 * Trigger element that opens the popover when clicked
 */
const PopoverTrigger = PopoverPrimitive.Trigger;

/**
 * Content container for the popover
 */
const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
    variant?: "default" | "destructive" | "outline";
    size?: "sm" | "md" | "lg";
    align?: "center" | "start" | "end";
    sideOffset?: number;
  }
>(({ 
  className, 
  align = "center", 
  sideOffset = 4, 
  variant = "default",
  size = "md",
  ...props 
}, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        size === "sm" && "p-2",
        size === "md" && "p-4",
        size === "lg" && "p-6",
        variant === "default" && "border-border",
        variant === "destructive" && "border-destructive bg-destructive text-destructive-foreground",
        variant === "outline" && "border-2",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

/**
 * Enhanced popover with simpler API for common use cases
 */
interface EnhancedPopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  variant?: "default" | "destructive" | "outline";
  size?: "sm" | "md" | "lg";
  align?: "center" | "start" | "end";
  sideOffset?: number;
  className?: string;
  contentClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
}

const EnhancedPopover = ({
  trigger,
  children,
  variant,
  size,
  align,
  sideOffset,
  className,
  contentClassName,
  open,
  onOpenChange,
  defaultOpen,
}: EnhancedPopoverProps) => {
  return (
    <Popover open={open} onOpenChange={onOpenChange} defaultOpen={defaultOpen}>
      <PopoverTrigger className={className} asChild>
        {trigger}
      </PopoverTrigger>
      <PopoverContent 
        variant={variant} 
        size={size} 
        align={align} 
        sideOffset={sideOffset}
        className={contentClassName}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
};

export { Popover, PopoverTrigger, PopoverContent, EnhancedPopover };
