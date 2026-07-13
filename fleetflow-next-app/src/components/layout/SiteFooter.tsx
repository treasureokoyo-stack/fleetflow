import Link from "next/link";

/**
 * Shared site footer — reproduces the footer used across all public pages.
 */
export function SiteFooter() {
  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant w-full mt-auto">
      <div className="w-full py-xl px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-4 gap-gutter max-w-container-max mx-auto">
        <div className="flex flex-col gap-sm">
          <span className="font-headline-md text-headline-md font-bold text-primary">
            FleetFlow
          </span>
          <p className="font-body-sm text-body-sm text-on-surface-variant opacity-80">
            © {new Date().getFullYear()} FleetFlow. Premium Car Rentals.
          </p>
        </div>
        <div className="flex flex-col gap-sm">
          <h4 className="font-label-md text-label-md text-on-surface mb-xs">
            Company
          </h4>
          <Link
            href="/about"
            className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary hover:underline opacity-80 hover:opacity-100"
          >
            About Us
          </Link>
          <Link
            href="/careers"
            className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary hover:underline opacity-80 hover:opacity-100"
          >
            Careers
          </Link>
        </div>
        <div className="flex flex-col gap-sm">
          <h4 className="font-label-md text-label-md text-on-surface mb-xs">
            Legal
          </h4>
          <Link
            href="/terms"
            className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary hover:underline opacity-80 hover:opacity-100"
          >
            Terms of Service
          </Link>
          <Link
            href="/privacy"
            className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary hover:underline opacity-80 hover:opacity-100"
          >
            Privacy Policy
          </Link>
        </div>
        <div className="flex flex-col gap-sm">
          <h4 className="font-label-md text-label-md text-on-surface mb-xs">
            Help
          </h4>
          <Link
            href="/support"
            className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary hover:underline opacity-80 hover:opacity-100"
          >
            Support Center
          </Link>
        </div>
      </div>
    </footer>
  );
}
