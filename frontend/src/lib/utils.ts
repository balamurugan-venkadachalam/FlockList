import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names and merges Tailwind CSS classes efficiently
 * This utility helps with responsive and accessible component styling
 * 
 * @param inputs - Class values to be merged
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Creates responsive class names based on breakpoints
 * Follows Material UI breakpoint system for consistency
 * 
 * @param base - Base class for all screen sizes
 * @param sm - Class for sm screens (≥600px) and up
 * @param md - Class for md screens (≥900px) and up
 * @param lg - Class for lg screens (≥1200px) and up
 * @param xl - Class for xl screens (≥1536px) and up
 * @returns Combined responsive class string
 */
export function responsive(
  base: string,
  sm?: string,
  md?: string,
  lg?: string,
  xl?: string
): string {
  return cn(
    base,
    sm && `sm:${sm}`,
    md && `md:${md}`,
    lg && `lg:${lg}`,
    xl && `xl:${xl}`
  );
}

/**
 * Creates accessible visually hidden content for screen readers
 * Use this for content that should be announced by screen readers but not visible
 * 
 * @returns Class string for screen reader only content
 */
export function srOnly(): string {
  return "sr-only";
}

/**
 * Creates a focus ring style for accessible keyboard navigation
 * 
 * @returns Class string for focus ring
 */
export function focusRing(): string {
  return "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
}

/**
 * Creates accessible color contrast classes
 * Ensures text meets WCAG AA contrast requirements
 * 
 * @param background - Background color context
 * @returns Class string for accessible text color
 */
export function accessibleText(background: "light" | "dark" | "primary" | "secondary" = "light"): string {
  switch (background) {
    case "dark":
      return "text-white";
    case "primary":
      return "text-primary-foreground";
    case "secondary":
      return "text-secondary-foreground";
    default:
      return "text-foreground";
  }
}
