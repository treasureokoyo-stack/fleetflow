import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names, resolving conflicts.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as USD currency (no decimals shown for whole amounts).
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format an ISO date string as a short readable date (e.g. "Nov 15, 2024").
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format an ISO date string as a short date + time (e.g. "Nov 15, 2024, 10:00 AM").
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Convert arbitrary text into a URL-safe slug.
 */
export function slugify(input: string): string {
  return input
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Generate a short, human-readable booking reference, e.g. "FF-7G2K-9A1B".
 */
export function generateBookingReference(): string {
  const block = (n: number) =>
    Array.from({ length: n }, () =>
      "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".charAt(
        Math.floor(Math.random() * 32)
      )
    ).join("");
  return `FF-${block(4)}-${block(4)}`;
}

/**
 * Compute whole rental days between two dates (inclusive of pickup day).
 * Mirrors PRD rule: total_amount = daily_rate × total_days.
 */
export function computeTotalDays(
  pickup: Date | string,
  returnDate: Date | string
): number {
  const p = typeof pickup === "string" ? new Date(pickup) : pickup;
  const r = typeof returnDate === "string" ? new Date(returnDate) : returnDate;
  const ms = r.getTime() - p.getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

/**
 * Strip the time component from a date (set to midnight UTC) so date-only
 * comparisons are stable regardless of timezone offset.
 */
export function atMidnight(date: Date | string): Date {
  const d = typeof date === "string" ? new Date(date) : new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}
