"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export type SidebarItem = {
  label: string;
  href: string;
  icon: string;
};

/**
 * Shared dashboard shell: sidebar + main content area.
 *
 * Used by customer (/dashboard), staff (/staff) and admin (/admin) routes.
 * The sidebar items are passed in by each role-specific layout, so the
 * navigation is exactly what the design specifies per role.
 */
export function DashboardShell({
  items,
  children,
}: {
  items: SidebarItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex-grow max-w-container-max mx-auto w-full flex flex-col md:flex-row pt-lg pb-xl px-margin-mobile md:px-margin-desktop gap-lg">
      <aside className="w-full md:w-64 flex-shrink-0 flex flex-col gap-xs">
        <h2 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-sm px-md">
          Menu
        </h2>
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-md py-3 rounded-lg font-label-md text-label-md transition-colors",
                isActive
                  ? "bg-secondary-container text-on-secondary-container"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              )}
            >
              <Icon
                name={item.icon}
                filled={isActive}
                className="text-[22px]"
              />
              {item.label}
            </Link>
          );
        })}
      </aside>
      <main className="flex-grow flex flex-col gap-lg min-w-0">{children}</main>
    </div>
  );
}

/**
 * Section heading used at the top of dashboard pages.
 */
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
      <div>
        <h1 className="font-headline-xl-mobile md:font-headline-xl text-headline-xl-mobile md:text-headline-xl text-primary mb-2">
          {title}
        </h1>
        {description && (
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            {description}
          </p>
        )}
      </div>
      {action}
    </section>
  );
}

/**
 * Statistic card used in dashboards and the reporting page.
 */
export function StatCard({
  label,
  value,
  icon,
  tone = "bg-secondary/10 text-secondary",
  hint,
}: {
  label: string;
  value: string;
  icon: string;
  tone?: string;
  hint?: string;
}) {
  return (
    <div className="bg-surface rounded-xl border border-outline-variant shadow-natural p-md flex flex-col gap-sm">
      <div className="flex items-start justify-between">
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">
          {label}
        </span>
        <span
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            tone
          )}
        >
          <Icon name={icon} className="text-[22px]" />
        </span>
      </div>
      <div>
        <p className="font-headline-lg text-headline-lg text-primary">
          {value}
        </p>
        {hint && (
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}
