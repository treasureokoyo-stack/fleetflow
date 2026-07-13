import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { Icon } from "@/components/ui/Icon";
import { roleHome } from "@/lib/auth";

/**
 * Shared top navigation bar.
 *
 * Reproduces the header from the design HTML. Shows public navigation when
 * logged out, and role-appropriate navigation + user menu when logged in.
 *
 * This is a Server Component — the sign-out trigger is delegated to a small
 * client island via the UserMenu component.
 */
export async function SiteHeader({
  active,
}: {
  active?: "fleet" | "reservations" | "support" | "vehicles";
}) {
  const session = await auth();

  const navItem = (
    label: string,
    key: string,
    href: string
  ) => {
    const isActive = active === key;
    return (
      <Link
        href={href}
        className={`h-full flex items-center font-label-md text-label-md px-2 transition-colors ${
          isActive
            ? "text-secondary font-bold border-b-2 border-secondary"
            : "text-on-surface-variant hover:text-secondary hover:bg-surface-container-high rounded-lg px-3 py-2"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="bg-surface border-b border-outline-variant shadow-sm sticky top-0 w-full z-50">
      <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 max-w-container-max mx-auto w-full">
        {/* Brand */}
        <div className="flex items-center gap-md">
          <Link
            href="/"
            className="font-headline-md text-headline-md font-bold text-primary flex items-center gap-xs"
          >
            <Icon name="directions_car" filled className="text-[24px]" />
            FleetFlow
          </Link>
          <nav className="hidden md:flex gap-md ml-lg h-full items-center">
            {navItem("Fleet", "fleet", "/vehicles")}
            {session &&
              (navItem(
                "Reservations",
                "reservations",
                session.user.role === "CUSTOMER"
                  ? "/dashboard/bookings"
                  : "/admin/bookings"
              ))}
            {navItem("Support", "support", "/support")}
          </nav>
        </div>

        {/* Trailing actions */}
        <div className="flex items-center gap-sm">
          {!session ? (
            <>
              <Link
                href="/login"
                className="font-label-md text-label-md text-primary hover:text-secondary transition-colors px-md py-sm"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="font-label-md text-label-md bg-primary text-on-primary px-md py-sm rounded-xl hover:opacity-90 transition-opacity"
              >
                Get Started
              </Link>
            </>
          ) : (
            <>
              <button
                className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 scale-95 active:scale-90"
                aria-label="Notifications"
              >
                <Icon name="notifications" />
              </button>
              <Link
                href={roleHome(session.user.role)}
                className="w-10 h-10 rounded-full overflow-hidden bg-surface-variant border border-outline-variant hover:bg-surface-container-high transition-all"
                aria-label="Account"
              >
                <AvatarInitials
                  name={session.user.name ?? session.user.email ?? "U"}
                />
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="hidden md:flex items-center gap-xs font-label-sm text-label-sm text-on-surface-variant hover:text-error transition-colors px-sm py-sm rounded-lg hover:bg-surface-container-high"
                >
                  <Icon name="logout" className="text-[18px]" />
                  Sign out
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/** Small presentational helper rendering initials in a coloured circle. */
function AvatarInitials({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="w-full h-full flex items-center justify-center bg-secondary/10 text-secondary font-label-md text-label-md">
      {initials || "U"}
    </div>
  );
}

// Re-export so callers can use it without an extra import line.
export { redirect };
