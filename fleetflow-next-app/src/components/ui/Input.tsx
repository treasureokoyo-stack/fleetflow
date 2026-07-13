"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Form input matching DESIGN.md "Input Fields":
 *  - subtle light gray stroke (#E2E8F0 / outline-variant)
 *  - 16px corners
 *  - focus: 2px secondary border with 4px soft outer glow
 */
export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: string;
  invalid?: boolean;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, invalid, ...props }, ref) => {
    if (icon) {
      return (
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-outline pointer-events-none">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 20 }}
              aria-hidden
            >
              {icon}
            </span>
          </span>
          <input
            ref={ref}
            className={cn(
              "w-full pl-12 pr-4 py-3 bg-transparent border rounded-xl font-body-md text-body-md text-on-surface placeholder:text-outline outline-none transition-all duration-200",
              invalid
                ? "border-error focus:ring-2 focus:ring-error/30"
                : "border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/30",
              className
            )}
            {...props}
          />
        </div>
      );
    }
    return (
      <input
        ref={ref}
        className={cn(
          "w-full px-md py-sm bg-surface-container-lowest border rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-outline outline-none transition-all",
          invalid
            ? "border-error focus:ring-2 focus:ring-error/30"
            : "border-outline-variant focus:border-secondary focus:ring-1 focus:ring-secondary",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export const Label = ({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label
    className={cn(
      "font-label-sm text-label-sm text-on-surface-variant mb-xs block",
      className
    )}
    {...props}
  />
);

export const FieldError = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) =>
  children ? (
    <p className={cn("text-label-sm text-error mt-xs", className)}>{children}</p>
  ) : null;

export const FormField = ({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("flex flex-col gap-xs", className)}>
    <Label htmlFor={htmlFor}>{label}</Label>
    {children}
    {hint && !error && (
      <p className="text-label-sm text-on-surface-variant/80 mt-xs">{hint}</p>
    )}
    <FieldError>{error}</FieldError>
  </div>
);
