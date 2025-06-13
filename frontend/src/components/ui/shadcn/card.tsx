import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Card component with responsive design and accessibility features
 * Replaces Material UI Card component
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    /** Adds elevation shadow to the card */
    elevation?: 0 | 1 | 2 | 3 | 4 | 5;
  }
>(({ className, elevation = 1, ...props }, ref) => {
  // Shadow classes based on elevation level (similar to Material UI)
  const shadowClasses = {
    0: "",
    1: "shadow-sm",
    2: "shadow",
    3: "shadow-md",
    4: "shadow-lg",
    5: "shadow-xl",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-card text-card-foreground",
        shadowClasses[elevation],
        className
      )}
      {...props}
    />
  );
});
Card.displayName = "Card";

/**
 * CardHeader component for card titles and descriptions
 * Responsive padding that adapts to screen size
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-4 sm:p-5 md:p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

/**
 * CardTitle component with proper heading semantics for accessibility
 */
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & { 
    /** HTML heading level for proper document structure */
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" 
  }
>(({ className, as: Comp = "h3", ...props }, ref) => (
  // @ts-ignore - The 'as' prop is handled manually
  <Comp
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight sm:text-xl",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

/**
 * CardDescription component with proper text contrast for accessibility
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

/**
 * CardContent component with responsive padding
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-4 sm:p-5 md:p-6 pt-0", className)}
    {...props}
  />
));
CardContent.displayName = "CardContent";

/**
 * CardFooter component with responsive padding and flex layout
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-4 sm:p-5 md:p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

/**
 * PaperCard component - a styled Card variant that mimics Material UI's Paper component
 * Includes responsive padding and elevation
 */
const PaperCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    /** Adds elevation shadow to the card */
    elevation?: 0 | 1 | 2 | 3 | 4 | 5;
  }
>(({ className, elevation = 1, ...props }, ref) => (
  <Card
    ref={ref}
    elevation={elevation}
    className={cn("p-4 sm:p-5 md:p-6", className)}
    {...props}
  />
));
PaperCard.displayName = "PaperCard";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  PaperCard,
};
