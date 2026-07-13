import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Icon } from "@/components/ui/Icon";
import { Badge, statusTone } from "@/components/ui/Badge";
import { getVehicleBySlug } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { BookingWidget } from "./BookingWidget";

export const dynamic = "force-dynamic";

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle) notFound();

  const available = vehicle.status === "AVAILABLE";
  const gallery = vehicle.images && vehicle.images.length > 0
    ? vehicle.images
    : [{ id: "thumb", vehicle_id: vehicle.id, image_url: vehicle.thumbnail_url }];

  return (
    <>
      <SiteHeader active="fleet" />

      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-lg md:py-xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-sm mb-lg">
          <Link
            href="/vehicles"
            className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-xs font-label-sm text-label-sm"
          >
            <Icon name="arrow_back" className="text-[16px]" />
            Back to Fleet
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg lg:gap-gutter">
          {/* Left: Details */}
          <div className="lg:col-span-8 flex flex-col gap-lg">
            {/* Hero image + gallery */}
            <section className="flex flex-col gap-sm">
              <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-surface-container border border-outline-variant">
                <img
                  src={gallery[0].image_url}
                  alt={vehicle.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {gallery.length > 1 && (
                <div className="grid grid-cols-4 gap-sm">
                  {gallery.slice(0, 4).map((g, i) => (
                    <div
                      key={g.id}
                      className={`w-full aspect-[4/3] rounded-lg overflow-hidden border bg-surface-container ${
                        i === 0 ? "border-2 border-secondary" : "border-outline-variant"
                      }`}
                    >
                      <img
                        src={g.image_url}
                        alt={`${vehicle.name} ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Header info */}
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-md border-b border-outline-variant pb-md">
              <div>
                <div className="flex items-center gap-sm mb-xs">
                  <Badge tone={statusTone(vehicle.status)}>
                    <span
                      className="w-2 h-2 rounded-full bg-secondary inline-block"
                    />
                    {available ? "Available Now" : "Not Available"}
                  </Badge>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    {vehicle.fuel_type === "Electric"
                      ? "Electric Vehicle"
                      : vehicle.category}
                  </span>
                </div>
                <h1 className="font-headline-xl-mobile md:font-headline-xl text-headline-xl-mobile md:text-headline-xl text-primary">
                  {vehicle.name}
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
                  {vehicle.brand} {vehicle.model} • {vehicle.year}
                </p>
              </div>
              <div className="text-left md:text-right">
                <div className="font-headline-lg text-headline-lg text-secondary">
                  {formatCurrency(vehicle.daily_rate)}{" "}
                  <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">
                    / day
                  </span>
                </div>
                <div className="font-body-sm text-body-sm text-on-surface-variant">
                  Unlimited mileage included
                </div>
              </div>
            </section>

            {/* Specs bento */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-sm">
              <Spec icon="settings" label="Transmission" value={vehicle.transmission} />
              <Spec
                icon={vehicle.fuel_type === "Electric" ? "electric_car" : "local_gas_station"}
                label="Fuel Type"
                value={vehicle.fuel_type}
              />
              <Spec
                icon="airline_seat_recline_normal"
                label="Seats"
                value={`${vehicle.seat_count} Adults`}
              />
              <Spec icon="calendar_month" label="Year" value={String(vehicle.year)} />
            </section>

            {/* Description */}
            <section className="flex flex-col gap-md mt-sm">
              <h2 className="font-headline-md text-headline-md text-primary">
                About this vehicle
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                {vehicle.description}
              </p>
            </section>
          </div>

          {/* Right: Sticky Booking Widget */}
          <div className="lg:col-span-4 relative">
            <BookingWidget vehicle={vehicle} available={available} />
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}

function Spec({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-surface border border-outline-variant rounded-xl p-md flex flex-col items-center justify-center gap-xs shadow-natural">
      <Icon name={icon} className="text-[28px] text-secondary" />
      <span className="font-label-sm text-label-sm text-on-surface-variant">
        {label}
      </span>
      <span className="font-label-md text-label-md text-primary">{value}</span>
    </div>
  );
}
