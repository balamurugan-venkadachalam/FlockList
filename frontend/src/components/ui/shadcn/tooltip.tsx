import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "../../../lib/utils";

/**
 * Tooltip component built with Radix UI primitives
 * Provides an accessible tooltip with customizable styling
 */
const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
    size?: "sm" | "md" | "lg";
    variant?: "default" | "info" | "warning" | "error";
  }
>(({ className, size = "md", variant = "default", sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md px-3 py-1.5 text-xs animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      size === "sm" && "max-w-[200px]",
      size === "md" && "max-w-[250px]",
      size === "lg" && "max-w-[350px]",
      variant === "default" && "border bg-background text-foreground shadow-md",
      variant === "info" && "border-info bg-info text-info-foreground shadow-md",
      variant === "warning" && "border-warning bg-warning text-warning-foreground shadow-md",
      variant === "error" && "border-destructive bg-destructive text-destructive-foreground shadow-md",
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

/**
 * Enhanced tooltip component that combines all tooltip parts
 */
interface EnhancedTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  size?: "sm" | "md" | "lg";
  variant?: "default" | "info" | "warning" | "error";
  delayDuration?: number;
  skipDelayDuration?: number;
  className?: string;
  contentClassName?: string;
  asChild?: boolean;
}

const EnhancedTooltip = ({
  content,
  children,
  side = "top",
  align = "center",
  size = "md",
  variant = "default",
  delayDuration = 300,
  skipDelayDuration = 300,
  className,
  contentClassName,
  asChild = false,
}: EnhancedTooltipProps) => (
  <Tooltip delayDuration={delayDuration} skipDelayDuration={skipDelayDuration}>
    <TooltipTrigger asChild={asChild} className={className}>
      {children}
    </TooltipTrigger>
    <TooltipContent 
      side={side} 
      align={align} 
      size={size} 
      variant={variant}
      className={contentClassName}
      aria-live="polite"
    >
      {content}
    </TooltipContent>
  </Tooltip>
);

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, EnhancedTooltip };
