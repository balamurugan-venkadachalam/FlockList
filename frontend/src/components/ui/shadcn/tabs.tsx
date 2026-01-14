import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "../../../lib/utils";

/**
 * Tabs component built with Radix UI primitives
 * Provides an accessible tabbed interface with customizable styling
 */
const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    fullWidth?: boolean;
  }
>(({ className, fullWidth, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      fullWidth && "w-full",
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    fullWidth?: boolean;
  }
>(({ className, fullWidth, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      fullWidth && "flex-1",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

/**
 * ResponsiveTabs component that adapts to different screen sizes
 * On small screens, it stacks tabs vertically
 * On larger screens, it displays tabs horizontally
 */
interface ResponsiveTabsProps extends React.ComponentPropsWithoutRef<typeof Tabs> {
  orientation?: "horizontal" | "vertical" | "responsive";
  children: React.ReactNode;
}

const ResponsiveTabs = React.forwardRef<
  React.ElementRef<typeof Tabs>,
  ResponsiveTabsProps
>(({ className, orientation = "responsive", children, ...props }, ref) => {
  // Split children into triggers and content
  const childrenArray = React.Children.toArray(children);
  const triggersList = childrenArray.find(
    child => React.isValidElement(child) && child.type === TabsList
  );
  const contents = childrenArray.filter(
    child => React.isValidElement(child) && child.type === TabsContent
  );

  return (
    <Tabs
      ref={ref}
      className={cn(
        "w-full",
        orientation === "vertical" && "flex flex-col sm:flex-row gap-2",
        orientation === "responsive" && "flex flex-col sm:flex-row gap-2",
        className
      )}
      {...props}
    >
      {triggersList}
      <div className={cn(
        "flex-1",
        (orientation === "vertical" || orientation === "responsive") && "mt-2 sm:mt-0 sm:ml-2"
      )}>
        {contents}
      </div>
    </Tabs>
  );
});
ResponsiveTabs.displayName = "ResponsiveTabs";

export { Tabs, TabsList, TabsTrigger, TabsContent, ResponsiveTabs };
