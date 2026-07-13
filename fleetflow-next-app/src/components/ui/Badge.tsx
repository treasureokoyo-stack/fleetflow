import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Status pill badge.
 *
 * Per DESIGN.md: pill shape (full rounding), 10–15% opacity background of the
 * semantic color with full-saturation text for high legibility.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-sm py-[2px] font-label-sm text-label-sm border",
  {
    variants: {
      tone: {
        neutral:
          "bg-surface-container text-on-surface border-outline-variant",
        info: "bg-secondary-fixed text-on-secondary-fixed border-secondary/20",
        success:
          "bg-[#dbe1ff]/90 text-[#00174b] border-secondary/20",
        warning:
          "bg-[#fcdeb5]/90 text-[#574425] border-tertiary-fixed-dim/40",
        danger:
          "bg-[#ffdad6] text-[#93000a] border-error/20",
        muted:
          "bg-surface/90 text-on-surface border-outline-variant backdrop-blur-sm",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props} />
  );
}

/**
 * Map a FleetFlow booking/vehicle status string to the right badge tone.
 */
export function statusTone(
  status: string
): VariantProps<typeof badgeVariants>["tone"] {
  switch (status) {
    case "CONFIRMED":
    case "AVAILABLE":
    case "COMPLETED":
      return "success";
    case "PENDING":
    case "MAINTENANCE":
      return "warning";
    case "CANCELLED":
    case "INACTIVE":
      return "danger";
    case "BOOKED":
      return "info";
    default:
      return "neutral";
  }
}
