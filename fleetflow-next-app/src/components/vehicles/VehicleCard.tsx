import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Badge, statusTone } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import type { Vehicle } from "@/lib/types";

/**
 * Vertical vehicle card used in the catalogue grid and the landing page
 * "Featured Vehicles" horizontal scroller. Matches the design exactly.
 */
export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const available = vehicle.status === "AVAILABLE";

  return (
    <div className="bg-surface rounded-xl border border-outline-variant overflow-hidden group hover:shadow-natural-hover transition-all duration-300 flex flex-col">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-surface-container-lowest">
        <img
          src={vehicle.thumbnail_url}
          alt={vehicle.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-sm left-sm">
          {available ? (
            <Badge tone={statusTone(vehicle.status)}>Available Now</Badge>
          ) : (
            <Badge tone={statusTone(vehicle.status)}>
              {labelForStatus(vehicle.status)}
            </Badge>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-md flex flex-col flex-1">
        <div className="flex justify-between items-start mb-sm">
          <div>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">
              {vehicle.category}
            </span>
            <h3 className="font-headline-md text-headline-md text-primary mt-xs">
              {vehicle.name}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-sm mb-lg text-on-surface-variant font-body-sm text-body-sm">
          <span className="flex items-center gap-xs">
            <Icon name="airline_seat_recline_normal" className="text-[16px]" />
            {vehicle.seat_count} Seats
          </span>
          <span className="w-1 h-1 rounded-full bg-outline-variant" />
          <span className="flex items-center gap-xs">
            <Icon
              name={vehicle.fuel_type === "Electric" ? "bolt" : "local_gas_station"}
              className="text-[16px]"
            />
            {vehicle.fuel_type}
          </span>
          <span className="w-1 h-1 rounded-full bg-outline-variant" />
          <span className="flex items-center gap-xs">
            <Icon name="settings" className="text-[16px]" />
            {vehicle.transmission === "Automatic" ? "Auto" : "Manual"}
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between border-t border-outline-variant pt-md">
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant mb-xs">
              From
            </p>
            <p className="font-headline-md text-headline-md text-primary">
              {formatCurrency(vehicle.daily_rate)}
              <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">
                /day
              </span>
            </p>
          </div>
          <Link
            href={`/vehicles/${vehicle.slug}`}
            className="bg-primary text-on-primary font-label-md text-label-md py-sm px-md rounded-xl hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

function labelForStatus(status: string): string {
  switch (status) {
    case "BOOKED":
      return "Currently Booked";
    case "MAINTENANCE":
      return "In Maintenance";
    case "INACTIVE":
      return "Unavailable";
    default:
      return status;
  }
}
