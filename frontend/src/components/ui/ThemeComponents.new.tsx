// Rule applied: Create Shared Component Libraries
// Rule applied: Use TypeScript for all code; prefer interfaces over types
import React from 'react';
import { cn } from '@/lib/utils';

// Rule applied: Use theme spacing for all margins, paddings, and gaps
// ContentCard - A styled card with consistent padding and margins
export const ContentCard: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ 
  className, 
  children,
  ...props 
}) => {
  return (
    <div 
      className={cn(
        "rounded-lg bg-card text-card-foreground shadow",
        "p-4 mb-4",
        "sm:p-6 sm:mb-6",
        "md:p-8 md:mb-8",
        "lg:p-9 lg:mb-9",
        "xl:p-10 xl:mb-10",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// PaperCard - A styled Paper component with consistent elevation and radius
export const PaperCard: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ 
  className, 
  children,
  ...props 
}) => {
  return (
    <div 
      className={cn(
        "rounded-lg bg-background shadow",
        "p-4",
        "sm:p-6",
        "md:p-8",
        "lg:p-9",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// FormContainer - A consistently styled container for forms
export const FormContainer: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ 
  className, 
  children,
  ...props 
}) => {
  return (
    <div 
      className={cn(
        "w-full max-w-md mx-auto",
        "p-4 flex flex-col gap-4",
        "sm:p-6 sm:gap-5",
        "md:p-8 md:gap-6",
        "lg:max-w-lg lg:p-8 lg:gap-6",
        "xl:max-w-xl xl:p-10 xl:gap-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Rule applied: Use functional components with TypeScript interfaces
// PageHeader - Consistent page header with responsive styling
interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  subtitle, 
  action,
  className,
  children,
  ...props
}) => {
  return (
    <div 
      className={cn(
        "mb-4 sm:mb-6 md:mb-8 lg:mb-10",
        className
      )}
      {...props}
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
        {action && (
          <div className="mt-4 sm:mt-0">
            {action}
          </div>
        )}
      </div>
      {children}
    </div>
  );
};

// ResponsiveContainer - A container with responsive padding
export const ResponsiveContainer: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ 
  className, 
  children,
  ...props 
}) => {
  return (
    <div 
      className={cn(
        "container mx-auto",
        "px-4 py-4",
        "sm:px-6 sm:py-6",
        "md:px-8 md:py-8",
        "lg:px-10 lg:py-10",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Rule applied: Use functional components with TypeScript interfaces
// GridContainer - A responsive grid container with proper spacing
interface GridContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  spacing?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
}

export const GridContainer: React.FC<GridContainerProps> = ({ 
  children, 
  spacing = 2,
  className,
  ...props 
}) => {
  // Map spacing values to Tailwind gap classes
  const gapMap = {
    1: 'gap-1 sm:gap-1.5 md:gap-2 lg:gap-2.5 xl:gap-3',
    2: 'gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6',
    3: 'gap-3 sm:gap-4.5 md:gap-6 lg:gap-7.5 xl:gap-9',
    4: 'gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12',
    5: 'gap-5 sm:gap-7.5 md:gap-10 lg:gap-12.5 xl:gap-15',
    6: 'gap-6 sm:gap-9 md:gap-12 lg:gap-15 xl:gap-18',
    8: 'gap-8 sm:gap-12 md:gap-16 lg:gap-20 xl:gap-24',
    10: 'gap-10 sm:gap-15 md:gap-20 lg:gap-25 xl:gap-30',
    12: 'gap-12 sm:gap-18 md:gap-24 lg:gap-30 xl:gap-36',
  };

  return (
    <div 
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
        gapMap[spacing],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
