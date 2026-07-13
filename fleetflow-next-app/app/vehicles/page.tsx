import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Icon } from "@/components/ui/Icon";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { listVehicles, getVehicleCategories } from "@/lib/data";
import { CatalogueFilters } from "./CatalogueFilters";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

type SearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const get = (k: string) =>
    typeof sp[k] === "string" ? (sp[k] as string) : undefined;

  const category = get("category") ?? "All Categories";
  const transmission = get("transmission") ?? "Any";
  const minPrice = get("minPrice") ? Number(get("minPrice")) : undefined;
  const maxPrice = get("maxPrice") ? Number(get("maxPrice")) : undefined;
  const availability = get("availability") ?? "ALL";
  const sort = (get("sort") as
    | "recommended"
    | "price_asc"
    | "price_desc"
    | "newest") ?? "recommended";
  const page = Math.max(1, Number(get("page") ?? "1"));

  const [{ vehicles, total }, categories] = await Promise.all([
    listVehicles({
      category,
      transmission,
      minPrice,
      maxPrice,
      status: availability as "ALL" | "AVAILABLE",
      sort,
      page,
      pageSize: PAGE_SIZE,
    }),
    getVehicleCategories(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <SiteHeader active="fleet" />

      <main className="flex-1 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-lg grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Header & Sort bar */}
        <div className="col-span-1 lg:col-span-12 flex flex-col md:flex-row justify-between items-start md:items-end mb-lg">
          <div>
            <h1 className="font-headline-xl text-headline-xl text-primary mb-xs">
              Available Fleet
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Showing {total} premium vehicle{total === 1 ? "" : "s"} matching
              your criteria
            </p>
          </div>
          <form className="mt-md md:mt-0 flex items-center gap-sm">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Sort by
            </span>
            <select
              name="sort"
              defaultValue={sort}
              className="bg-surface border border-outline-variant text-on-surface font-body-sm text-body-sm rounded-xl py-sm px-md focus:border-secondary focus:ring-4 focus:ring-secondary/30 outline-none transition-all cursor-pointer"
            >
              <option value="recommended">Recommended</option>
              <option value="price_asc">Price (Low to High)</option>
              <option value="price_desc">Price (High to Low)</option>
              <option value="newest">Newest Additions</option>
            </select>
            {/* Preserve other filters when changing sort */}
            {category && category !== "All Categories" && (
              <input type="hidden" name="category" value={category} />
            )}
            {transmission && transmission !== "Any" && (
              <input type="hidden" name="transmission" value={transmission} />
            )}
            {minPrice && (
              <input type="hidden" name="minPrice" value={minPrice} />
            )}
            {maxPrice && (
              <input type="hidden" name="maxPrice" value={maxPrice} />
            )}
            {availability !== "ALL" && (
              <input type="hidden" name="availability" value={availability} />
            )}
          </form>
        </div>

        {/* Sidebar Filters */}
        <CatalogueFilters
          categories={categories}
          category={category}
          transmission={transmission}
          minPrice={minPrice}
          maxPrice={maxPrice}
          availability={availability}
          sort={sort}
        />

        {/* Vehicle Grid */}
        <div className="col-span-1 lg:col-span-9 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-md h-fit">
          {vehicles.length === 0 ? (
            <div className="col-span-full bg-surface rounded-xl border border-outline-variant p-xl text-center">
              <Icon
                name="directions_car"
                className="text-[48px] text-outline-variant mx-auto mb-md"
              />
              <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">
                No vehicles available
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-md">
                Try adjusting your filters to see more results.
              </p>
              <Link
                href="/vehicles"
                className="inline-flex items-center gap-xs font-label-md text-label-md text-secondary hover:underline"
              >
                <Icon name="refresh" className="text-[18px]" />
                Reset filters
              </Link>
            </div>
          ) : (
            vehicles.map((v) => <VehicleCard key={v.id} vehicle={v} />)
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="col-span-1 lg:col-span-12 flex justify-center items-center gap-sm mt-lg">
            <PaginationLink
              page={page - 1}
              disabled={page <= 1}
              sp={sp}
              label="Previous"
              icon="arrow_back"
            />
            <span className="font-label-md text-label-md text-on-surface">
              Page {page} of {totalPages}
            </span>
            <PaginationLink
              page={page + 1}
              disabled={page >= totalPages}
              sp={sp}
              label="Next"
              icon="arrow_forward"
            />
          </div>
        )}
      </main>

      <SiteFooter />
    </>
  );
}

function PaginationLink({
  page,
  disabled,
  sp,
  label,
  icon,
}: {
  page: number;
  disabled: boolean;
  sp: Record<string, string | string[] | undefined>;
  label: string;
  icon: string;
}) {
  if (disabled) {
    return (
      <span className="inline-flex items-center gap-xs font-label-md text-label-md text-outline-variant px-md py-sm rounded-xl border border-outline-variant opacity-50 cursor-not-allowed">
        <Icon name={icon} className="text-[18px]" />
        {label}
      </span>
    );
  }
  const qs = new URLSearchParams();
  Object.entries(sp).forEach(([k, v]) => {
    if (typeof v === "string") qs.set(k, v);
  });
  qs.set("page", String(page));
  return (
    <Link
      href={`/vehicles?${qs.toString()}`}
      className="inline-flex items-center gap-xs font-label-md text-label-md text-primary px-md py-sm rounded-xl border border-outline-variant hover:bg-surface-container transition-colors"
    >
      <Icon name={icon} className="text-[18px]" />
      {label}
    </Link>
  );
}
