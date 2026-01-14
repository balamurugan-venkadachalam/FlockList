// Rule applied: Use TypeScript for all code
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Define the color palette for the application
export const colors = {
  primary: {
    main: '#3f51b5',
    light: '#7986cb',
    dark: '#303f9f',
  },
  secondary: {
    main: '#f50057',
    light: '#ff4081',
    dark: '#c51162',
  },
  error: {
    main: '#f44336',
    light: '#e57373',
    dark: '#d32f2f',
  },
  warning: {
    main: '#ff9800',
    light: '#ffb74d',
    dark: '#f57c00',
  },
  info: {
    main: '#2196f3',
    light: '#64b5f6',
    dark: '#1976d2',
  },
  success: {
    main: '#4caf50',
    light: '#81c784',
    dark: '#388e3c',
  },
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.54)',
  },
  background: {
    default: '#fafafa',
    paper: '#ffffff',
  },
};

// Typography scale
export const typography = {
  fontFamily: 'Arial, sans-serif',
  h1: {
    fontSize: '2.5rem',
    fontWeight: 500,
    letterSpacing: '-0.015625em',
    lineHeight: 1.2
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 500,
    letterSpacing: '-0.015625em',
    lineHeight: 1.2
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 500,
    letterSpacing: '-0.015625em',
    lineHeight: 1.2
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 500,
    letterSpacing: '-0.015625em',
    lineHeight: 1.2
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 500,
    letterSpacing: '-0.015625em',
    lineHeight: 1.2
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 500,
    letterSpacing: '-0.015625em',
    lineHeight: 1.2
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.5
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.43
  },
  button: {
    fontWeight: 500,
    textTransform: 'none'
  }
};

// Utility function to merge class names with Tailwind
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Export theme configuration for Tailwind/Shadcn UI
export const theme = {
  colors,
  typography,
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  shadows: {
    sm: '0px 2px 4px rgba(0, 0, 0, 0.05)',
    md: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    lg: '0px 8px 24px rgba(0, 0, 0, 0.15)',
  },
};

export type AppTheme = typeof theme;
export default theme;
