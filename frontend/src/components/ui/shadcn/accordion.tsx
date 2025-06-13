import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

import { cn } from "../../../lib/utils";

/**
 * Accordion component built with Radix UI primitives
 * Provides an accessible accordion with customizable styling
 */
const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> & {
    variant?: "default" | "bordered" | "ghost";
  }
>(({ className, variant = "default", ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(
      "transition-all",
      variant === "default" && "border-b",
      variant === "bordered" && "mb-2 rounded-md border",
      variant === "ghost" && "mb-2",
      className
    )}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> & {
    hideIcon?: boolean;
    iconPosition?: "start" | "end";
    iconClassName?: string;
  }
>(({ className, children, hideIcon = false, iconPosition = "end", iconClassName, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {iconPosition === "start" && !hideIcon && (
        <ChevronDown
          className={cn(
            "h-4 w-4 mr-2 shrink-0 transition-transform duration-200",
            iconClassName
          )}
        />
      )}
      {children}
      {iconPosition === "end" && !hideIcon && (
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-200",
            iconClassName
          )}
        />
      )}
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

/**
 * Enhanced accordion item that combines all accordion parts
 */
interface EnhancedAccordionItemProps {
  value: string;
  trigger: React.ReactNode;
  children: React.ReactNode;
  variant?: "default" | "bordered" | "ghost";
  hideIcon?: boolean;
  iconPosition?: "start" | "end";
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  iconClassName?: string;
}

const EnhancedAccordionItem = ({
  value,
  trigger,
  children,
  variant = "default",
  hideIcon = false,
  iconPosition = "end",
  disabled = false,
  className,
  triggerClassName,
  contentClassName,
  iconClassName,
}: EnhancedAccordionItemProps) => (
  <AccordionItem value={value} variant={variant} className={className}>
    <AccordionTrigger 
      hideIcon={hideIcon} 
      iconPosition={iconPosition}
      disabled={disabled}
      className={triggerClassName}
      iconClassName={iconClassName}
    >
      {trigger}
    </AccordionTrigger>
    <AccordionContent className={contentClassName}>
      {children}
    </AccordionContent>
  </AccordionItem>
);

export { 
  Accordion, 
  AccordionItem, 
  AccordionTrigger, 
  AccordionContent,
  EnhancedAccordionItem 
};
