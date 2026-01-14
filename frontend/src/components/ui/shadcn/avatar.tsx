import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "../../../lib/utils";

/**
 * Avatar component built with Radix UI primitives
 * Provides an accessible avatar with fallback support
 */
const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    variant?: "circle" | "rounded" | "square";
  }
>(({ className, size = "md", variant = "circle", ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex shrink-0 overflow-hidden",
      size === "xs" && "h-6 w-6",
      size === "sm" && "h-8 w-8",
      size === "md" && "h-10 w-10",
      size === "lg" && "h-12 w-12",
      size === "xl" && "h-16 w-16",
      variant === "circle" && "rounded-full",
      variant === "rounded" && "rounded-md",
      variant === "square" && "rounded-none",
      className
    )}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> & {
    delayMs?: number;
    variant?: "default" | "primary" | "secondary" | "muted";
  }
>(({ className, delayMs, variant = "default", ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    delayMs={delayMs}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full text-sm font-medium",
      variant === "default" && "bg-muted text-muted-foreground",
      variant === "primary" && "bg-primary text-primary-foreground",
      variant === "secondary" && "bg-secondary text-secondary-foreground",
      variant === "muted" && "bg-muted/50 text-muted-foreground",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

/**
 * Enhanced avatar component that combines all avatar parts
 */
interface EnhancedAvatarProps {
  src?: string;
  alt?: string;
  fallback?: React.ReactNode;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "circle" | "rounded" | "square";
  fallbackVariant?: "default" | "primary" | "secondary" | "muted";
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
  delayMs?: number;
}

const EnhancedAvatar = ({
  src,
  alt,
  fallback,
  size = "md",
  variant = "circle",
  fallbackVariant = "default",
  className,
  imageClassName,
  fallbackClassName,
  delayMs,
}: EnhancedAvatarProps) => (
  <Avatar size={size} variant={variant} className={className}>
    {src && <AvatarImage src={src} alt={alt || ""} className={imageClassName} />}
    <AvatarFallback 
      variant={fallbackVariant} 
      className={fallbackClassName}
      delayMs={delayMs}
    >
      {fallback || (alt ? getInitials(alt) : null)}
    </AvatarFallback>
  </Avatar>
);

/**
 * Helper function to get initials from a name
 */
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

export { Avatar, AvatarImage, AvatarFallback, EnhancedAvatar };
