import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Icon } from "@/components/ui/Icon";
import { getFeaturedVehicles } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const featured = await getFeaturedVehicles(6);

  return (
    <>
      <SiteHeader />

      <main className="flex-grow flex flex-col w-full">
        {/* ===== Hero ===== */}
        <section className="w-full relative bg-surface-container-lowest pt-xl pb-lg px-margin-mobile md:px-margin-desktop flex flex-col items-center text-center overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-full bg-gradient-to-b from-surface-container-high/30 to-transparent pointer-events-none" />
          <div className="max-w-3xl z-10 flex flex-col items-center gap-md mt-lg">
            <h1 className="font-headline-xl-mobile md:font-headline-xl text-headline-xl-mobile md:text-headline-xl text-on-surface leading-tight tracking-tight">
              Rent Premium Cars in Minutes
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
              Affordable. Verified. Instant booking. Experience seamless mobility
              designed for modern professionals.
            </p>
            <div className="flex flex-col sm:flex-row gap-sm mt-md w-full sm:w-auto">
              <Link
                href="/vehicles"
                className="bg-primary text-on-primary font-label-md text-label-md px-lg py-sm rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap flex items-center justify-center gap-xs"
              >
                Browse Cars
                <Icon name="arrow_forward" className="text-[18px]" />
              </Link>
              <Link
                href="/vehicles"
                className="bg-transparent border border-outline text-primary font-label-md text-label-md px-lg py-sm rounded-xl hover:bg-surface-container-low transition-colors whitespace-nowrap flex items-center justify-center"
              >
                Check Availability
              </Link>
            </div>
          </div>

          {/* Quick Search Widget */}
          <QuickSearch />
        </section>

        {/* ===== Featured Vehicles ===== */}
        <section className="w-full max-w-container-max mx-auto py-xl px-margin-mobile md:px-margin-desktop">
          <div className="flex justify-between items-end mb-lg">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">
                Featured Vehicles
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
                Curated selection for your next journey.
              </p>
            </div>
            <Link
              href="/vehicles"
              className="hidden md:flex items-center gap-xs text-secondary font-label-sm text-label-sm hover:underline"
            >
              View full fleet <Icon name="arrow_forward" className="text-[16px]" />
            </Link>
          </div>

          {featured.length === 0 ? (
            <p className="font-body-md text-body-md text-on-surface-variant text-center py-xl">
              No vehicles available right now. Please check back soon.
            </p>
          ) : (
            <div className="flex overflow-x-auto gap-gutter snap-x snap-mandatory no-scrollbar pb-sm">
              {featured.map((v) => (
                <FeaturedCard key={v.id} vehicle={v} />
              ))}
            </div>
          )}
        </section>

        {/* ===== Why Choose Us ===== */}
        <section className="w-full bg-surface-container-lowest py-xl">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="text-center mb-lg max-w-2xl mx-auto">
              <h2 className="font-headline-lg text-headline-lg text-on-surface">
                Why Choose FleetFlow?
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-sm">
                We&apos;ve engineered every aspect of our service to provide a
                frictionless, premium rental experience.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
              {BENEFITS.map((b) => (
                <div
                  key={b.title}
                  className="bg-surface rounded-xl p-md border border-outline-variant flex flex-col items-start hover:border-secondary-fixed-dim transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-sm text-secondary">
                    <Icon name={b.icon} />
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface text-[18px] mb-xs">
                    {b.title}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {b.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Testimonials ===== */}
        <section className="w-full max-w-container-max mx-auto py-xl px-margin-mobile md:px-margin-desktop">
          <h2 className="font-headline-lg text-headline-lg text-on-surface text-center mb-lg">
            What Our Clients Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="bg-surface-container-low rounded-xl p-md flex flex-col relative"
              >
                <Icon
                  name="format_quote"
                  className="absolute top-md right-md text-outline-variant opacity-30 text-[48px]"
                />
                <div className="flex items-center gap-sm mb-md z-10">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center font-label-md text-label-md">
                    {t.name.split(" ").map((p) => p[0]).join("")}
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">
                      {t.name}
                    </p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">
                      {t.role}
                    </p>
                  </div>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant italic z-10">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

/** Quick search widget in the hero — links to the catalogue. */
function QuickSearch() {
  return (
    <form
      action="/vehicles"
      className="mt-xl z-20 w-full max-w-4xl bg-surface rounded-xl shadow-natural border border-surface-variant p-md"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-md items-end">
        <div className="flex flex-col gap-xs">
          <label className="font-label-sm text-label-sm text-on-surface-variant ml-xs">
            Pickup Date
          </label>
          <div className="relative">
            <Icon
              name="calendar_today"
              className="absolute left-sm top-1/2 -translate-y-1/2 text-outline text-[20px]"
            />
            <input
              type="date"
              name="pickup"
              className="w-full pl-lg pr-sm py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
            />
          </div>
        </div>
        <div className="flex flex-col gap-xs">
          <label className="font-label-sm text-label-sm text-on-surface-variant ml-xs">
            Return Date
          </label>
          <div className="relative">
            <Icon
              name="event"
              className="absolute left-sm top-1/2 -translate-y-1/2 text-outline text-[20px]"
            />
            <input
              type="date"
              name="return"
              className="w-full pl-lg pr-sm py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
            />
          </div>
        </div>
        <div className="flex flex-col gap-xs">
          <label className="font-label-sm text-label-sm text-on-surface-variant ml-xs">
            Car Type
          </label>
          <div className="relative">
            <Icon
              name="directions_car"
              className="absolute left-sm top-1/2 -translate-y-1/2 text-outline text-[20px]"
            />
            <select
              name="category"
              defaultValue="All Categories"
              className="w-full pl-lg pr-sm py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all appearance-none"
            >
              <option>All Categories</option>
              <option>Luxury Sedan</option>
              <option>Premium SUV</option>
              <option>Electric</option>
              <option>Sports Coupe</option>
            </select>
            <Icon
              name="expand_more"
              className="absolute right-sm top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none"
            />
          </div>
        </div>
        <button
          type="submit"
          className="bg-secondary text-on-secondary font-label-md text-label-md h-[42px] rounded-lg hover:bg-secondary-container hover:text-on-secondary-container transition-colors flex items-center justify-center gap-xs"
        >
          <Icon name="search" className="text-[20px]" />
          Search
        </button>
      </div>
    </form>
  );
}

/** Horizontal scroll card used in the featured section. */
function FeaturedCard({
  vehicle,
}: {
  vehicle: Awaited<ReturnType<typeof getFeaturedVehicles>>[number];
}) {
  return (
    <Link
      href={`/vehicles/${vehicle.slug}`}
      className="min-w-[300px] md:min-w-[350px] snap-start bg-surface rounded-xl border border-surface-variant shadow-natural overflow-hidden flex flex-col group hover:shadow-natural-hover transition-shadow duration-300"
    >
      <div className="h-48 w-full relative bg-surface-container-low overflow-hidden">
        <img
          src={vehicle.thumbnail_url}
          alt={vehicle.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {vehicle.fuel_type === "Electric" && (
          <div className="absolute top-sm left-sm bg-secondary/10 px-xs py-[2px] rounded-sm border border-secondary/20 flex items-center gap-[2px]">
            <Icon name="bolt" className="text-[14px] text-secondary" />
            <span className="font-label-sm text-label-sm text-secondary">
              Electric
            </span>
          </div>
        )}
      </div>
      <div className="p-md flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-sm">
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface text-[20px]">
              {vehicle.name}
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {vehicle.brand} {vehicle.model} or similar
            </p>
          </div>
          <div className="text-right">
            <p className="font-headline-md text-headline-md text-primary text-[18px]">
              {formatCurrency(vehicle.daily_rate)}
            </p>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              / day
            </p>
          </div>
        </div>
        <div className="flex items-center gap-sm mt-auto pt-sm border-t border-surface-variant text-on-surface-variant">
          <span className="flex items-center gap-xs">
            <Icon name="group" className="text-[16px]" />
            <span className="font-label-sm text-label-sm">{vehicle.seat_count}</span>
          </span>
          <span className="flex items-center gap-xs">
            <Icon name="settings" className="text-[16px]" />
            <span className="font-label-sm text-label-sm">
              {vehicle.transmission === "Automatic" ? "Auto" : "Manual"}
            </span>
          </span>
          {vehicle.fuel_type === "Electric" ? (
            <span className="flex items-center gap-xs">
              <Icon name="battery_charging_full" className="text-[16px]" />
              <span className="font-label-sm text-label-sm">EV</span>
            </span>
          ) : (
            <span className="flex items-center gap-xs">
              <Icon name="local_gas_station" className="text-[16px]" />
              <span className="font-label-sm text-label-sm">{vehicle.fuel_type}</span>
            </span>
          )}
        </div>
        <span className="w-full mt-md bg-surface-container-highest text-on-surface font-label-md text-label-md py-sm rounded-lg group-hover:bg-primary group-hover:text-on-primary transition-colors text-center">
          Book Now
        </span>
      </div>
    </Link>
  );
}

const BENEFITS = [
  {
    icon: "verified",
    title: "Verified Cars",
    body: "Every vehicle undergoes a strict 50-point inspection before it reaches our platform.",
  },
  {
    icon: "flash_on",
    title: "Instant Booking",
    body: "No waiting for approvals. Book your car instantly and securely in just a few taps.",
  },
  {
    icon: "payments",
    title: "Transparent Pricing",
    body: "What you see is what you pay. Zero hidden fees, clear deposit terms, and simple invoices.",
  },
  {
    icon: "support_agent",
    title: "24/7 Support",
    body: "Our dedicated concierge team is available around the clock to assist with your journey.",
  },
];

const TESTIMONIALS = [
  {
    name: "Sarah J.",
    role: "Corporate Director",
    quote:
      "The fastest rental experience I've ever had. The car was immaculate and the process was entirely frictionless. FleetFlow is my new standard for business travel.",
  },
  {
    name: "Michael T.",
    role: "Creative Director",
    quote:
      "Transparent pricing actually means transparent here. No surprises at the counter. The app interface is beautiful and intuitive. Highly recommended.",
  },
  {
    name: "Elena R.",
    role: "Entrepreneur",
    quote:
      "I needed a premium SUV at the last minute. FleetFlow delivered flawlessly. The vehicle quality was exceptional, exactly as pictured in the app.",
  },
];
