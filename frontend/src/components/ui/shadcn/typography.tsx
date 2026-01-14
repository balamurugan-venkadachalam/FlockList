import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../../lib/utils";

/**
 * Typography component for consistent text styling
 * Replaces Material UI Typography with a customizable component using Tailwind CSS
 */

const typographyVariants = cva("text-foreground", {
  variants: {
    variant: {
      h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
      h2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
      h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
      h4: "scroll-m-20 text-xl font-semibold tracking-tight",
      h5: "scroll-m-20 text-lg font-semibold tracking-tight",
      h6: "scroll-m-20 text-base font-semibold tracking-tight",
      p: "leading-7 [&:not(:first-child)]:mt-6",
      blockquote: "mt-6 border-l-2 pl-6 italic",
      ul: "my-6 ml-6 list-disc [&>li]:mt-2",
      ol: "my-6 ml-6 list-decimal [&>li]:mt-2",
      code: "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
      lead: "text-xl text-muted-foreground",
      large: "text-lg font-semibold",
      small: "text-sm font-medium leading-none",
      muted: "text-sm text-muted-foreground",
      subtle: "text-muted-foreground",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
      justify: "text-justify",
    },
    weight: {
      light: "font-light",
      regular: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
      extrabold: "font-extrabold",
    },
    transform: {
      uppercase: "uppercase",
      lowercase: "lowercase",
      capitalize: "capitalize",
      normal: "normal-case",
    },
    noMargin: {
      true: "m-0",
    },
    truncate: {
      true: "truncate",
    },
    responsive: {
      true: "text-base sm:text-sm md:text-base lg:text-lg xl:text-xl",
    },
  },
  defaultVariants: {
    variant: "p",
    align: "left",
  },
});

export interface TypographyProps
  extends React.HTMLAttributes<HTMLHeadingElement | HTMLParagraphElement>,
    VariantProps<typeof typographyVariants> {
  as?: React.ElementType;
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, align, weight, transform, noMargin, truncate, responsive, as, ...props }, ref) => {
    const Comp = as || 
      (variant === "h1" ? "h1" : 
       variant === "h2" ? "h2" : 
       variant === "h3" ? "h3" : 
       variant === "h4" ? "h4" : 
       variant === "h5" ? "h5" : 
       variant === "h6" ? "h6" : 
       variant === "blockquote" ? "blockquote" :
       variant === "ul" ? "ul" :
       variant === "ol" ? "ol" :
       variant === "code" ? "code" : "p");

    return (
      <Comp
        className={cn(typographyVariants({ 
          variant, 
          align, 
          weight, 
          transform, 
          noMargin, 
          truncate, 
          responsive,
          className 
        }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Typography.displayName = "Typography";

// Export specialized components for convenience
const H1 = (props: Omit<TypographyProps, "variant">) => <Typography variant="h1" {...props} />;
const H2 = (props: Omit<TypographyProps, "variant">) => <Typography variant="h2" {...props} />;
const H3 = (props: Omit<TypographyProps, "variant">) => <Typography variant="h3" {...props} />;
const H4 = (props: Omit<TypographyProps, "variant">) => <Typography variant="h4" {...props} />;
const H5 = (props: Omit<TypographyProps, "variant">) => <Typography variant="h5" {...props} />;
const H6 = (props: Omit<TypographyProps, "variant">) => <Typography variant="h6" {...props} />;
const Paragraph = (props: Omit<TypographyProps, "variant">) => <Typography variant="p" {...props} />;
const Blockquote = (props: Omit<TypographyProps, "variant">) => <Typography variant="blockquote" {...props} />;
const Lead = (props: Omit<TypographyProps, "variant">) => <Typography variant="lead" {...props} />;
const Large = (props: Omit<TypographyProps, "variant">) => <Typography variant="large" {...props} />;
const Small = (props: Omit<TypographyProps, "variant">) => <Typography variant="small" {...props} />;
const Muted = (props: Omit<TypographyProps, "variant">) => <Typography variant="muted" {...props} />;
const Subtle = (props: Omit<TypographyProps, "variant">) => <Typography variant="subtle" {...props} />;

export { 
  Typography, 
  H1, 
  H2, 
  H3, 
  H4, 
  H5, 
  H6, 
  Paragraph, 
  Blockquote, 
  Lead, 
  Large, 
  Small, 
  Muted, 
  Subtle,
  typographyVariants 
};
