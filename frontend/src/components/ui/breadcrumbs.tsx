import React from 'react';
import { cn } from '@/lib/utils';

interface BreadcrumbsProps extends React.HTMLAttributes<HTMLDivElement> {
  separator?: React.ReactNode;
  'aria-label'?: string;
}

const Breadcrumbs = React.forwardRef<HTMLDivElement, BreadcrumbsProps>(
  ({ className, separator = '/', children, 'aria-label': ariaLabel = 'breadcrumb', ...props }, ref) => {
    // Convert children to array and add separators
    const childrenArray = React.Children.toArray(children);
    const childrenWithSeparators = childrenArray.reduce<React.ReactNode[]>((acc, child, index) => {
      if (index < childrenArray.length - 1) {
        return [...acc, child, <span key={`separator-${index}`} className="mx-2 text-muted-foreground">{separator}</span>];
      }
      return [...acc, child];
    }, []);

    return (
      <nav aria-label={ariaLabel}>
        <div
          ref={ref}
          className={cn("flex items-center text-sm", className)}
          {...props}
        >
          {childrenWithSeparators}
        </div>
      </nav>
    );
  }
);

Breadcrumbs.displayName = "Breadcrumbs";

export { Breadcrumbs };
