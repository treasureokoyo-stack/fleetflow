import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * FleetFlow button.
 *
 * Variants mirror the DESIGN.md button spec:
 *  - primary  : Deep Navy background, white text
 *  - action   : Accent Blue background for high-priority conversion
 *  - secondary: Transparent background, 1px border, Deep Navy text
 *  - ghost    : Subtle hover surface, no border
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-label-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-50 disabled:pointer-events-none active:translate-y-[1px]",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-on-primary shadow-sm hover:opacity-90",
        action:
          "bg-secondary text-on-secondary hover:bg-secondary-container hover:text-on-secondary-container shadow-sm",
        secondary:
          "bg-transparent border border-outline-variant text-primary hover:bg-surface-container-low",
        ghost:
          "bg-transparent text-on-surface hover:bg-surface-container-high",
        outline:
          "bg-surface border border-outline-variant text-primary hover:bg-surface-container",
      },
      size: {
        sm: "h-9 px-sm text-label-sm",
        md: "h-11 px-md",
        lg: "h-[52px] px-lg text-base",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
