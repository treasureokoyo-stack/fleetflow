"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

/**
 * Catalogue filter sidebar.
 *
 * Reads the current URL search params, lets the user adjust filters, and
 * rewrites the URL (which re-renders the server component) on submit.
 * Mirrors the filters in the browse_fleet design:
 *  - Price per day (min/max)
 *  - Vehicle Type (category)
 *  - Transmission
 *  - Availability
 */
export function CatalogueFilters({
  categories,
  category,
  transmission,
  minPrice,
  maxPrice,
  availability,
  sort,
}: {
  categories: string[];
  category: string;
  transmission: string;
  minPrice?: number;
  maxPrice?: number;
  availability: string;
  sort: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [localCategory, setLocalCategory] = useState(category);
  const [localTransmission, setLocalTransmission] = useState(transmission);
  const [localMin, setLocalMin] = useState(minPrice?.toString() ?? "");
  const [localMax, setLocalMax] = useState(maxPrice?.toString() ?? "");
  const [localAvailability, setLocalAvailability] = useState(availability);

  function apply() {
    const params = new URLSearchParams(searchParams.toString());
    const set = (k: string, v?: string) => {
      if (v && v.length) params.set(k, v);
      else params.delete(k);
    };
    set("category", localCategory === "All Categories" ? undefined : localCategory);
    set("transmission", localTransmission === "Any" ? undefined : localTransmission);
    set("minPrice", localMin);
    set("maxPrice", localMax);
    set(
      "availability",
      localAvailability === "ALL" ? undefined : localAvailability
    );
    params.delete("page");
    params.set("sort", sort);
    router.push(`/vehicles?${params.toString()}`);
  }

  function reset() {
    setLocalCategory("All Categories");
    setLocalTransmission("Any");
    setLocalMin("");
    setLocalMax("");
    setLocalAvailability("ALL");
    router.push("/vehicles");
  }

  return (
    <aside className="col-span-1 lg:col-span-3 hidden lg:flex flex-col gap-md">
      <div className="bg-surface rounded-xl p-md shadow-natural border border-outline-variant sticky top-24">
        <div className="flex items-center justify-between mb-md pb-sm border-b border-outline-variant">
          <h3 className="font-headline-md text-headline-md text-primary">
            Filters
          </h3>
          <button
            type="button"
            onClick={reset}
            className="font-label-sm text-label-sm text-secondary hover:underline"
          >
            Reset
          </button>
        </div>

        {/* Price Range */}
        <div className="mb-lg">
          <h4 className="font-label-md text-label-md text-on-surface mb-sm">
            Price per day
          </h4>
          <div className="flex items-center gap-sm">
            <input
              type="number"
              min={0}
              placeholder="Min $"
              value={localMin}
              onChange={(e) => setLocalMin(e.target.value)}
              className="w-full px-sm py-xs bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
            />
            <span className="text-outline">–</span>
            <input
              type="number"
              min={0}
              placeholder="Max $"
              value={localMax}
              onChange={(e) => setLocalMax(e.target.value)}
              className="w-full px-sm py-xs bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
            />
          </div>
        </div>

        {/* Vehicle Type */}
        <div className="mb-lg">
          <h4 className="font-label-md text-label-md text-on-surface mb-sm">
            Vehicle Type
          </h4>
          <div className="flex flex-col gap-sm">
            <label className="flex items-center gap-sm cursor-pointer">
              <input
                type="radio"
                name="category"
                value="All Categories"
                checked={localCategory === "All Categories"}
                onChange={() => setLocalCategory("All Categories")}
                className="w-4 h-4"
              />
              <span className="font-body-sm text-body-sm text-on-surface">
                All Categories
              </span>
            </label>
            {categories.map((c) => (
              <label key={c} className="flex items-center gap-sm cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  value={c}
                  checked={localCategory === c}
                  onChange={() => setLocalCategory(c)}
                  className="w-4 h-4"
                />
                <span className="font-body-sm text-body-sm text-on-surface">
                  {c}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Transmission */}
        <div className="mb-lg">
          <h4 className="font-label-md text-label-md text-on-surface mb-sm">
            Transmission
          </h4>
          <div className="flex flex-col gap-sm">
            {["Any", "Automatic", "Manual"].map((t) => (
              <label
                key={t}
                className="flex items-center gap-sm cursor-pointer"
              >
                <input
                  type="radio"
                  name="transmission"
                  value={t}
                  checked={localTransmission === t}
                  onChange={() => setLocalTransmission(t)}
                  className="w-4 h-4"
                />
                <span className="font-body-sm text-body-sm text-on-surface">
                  {t}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div className="mb-lg">
          <h4 className="font-label-md text-label-md text-on-surface mb-sm">
            Availability
          </h4>
          <div className="flex flex-col gap-sm">
            {[
              ["ALL", "All vehicles"],
              ["AVAILABLE", "Available only"],
            ].map(([v, label]) => (
              <label
                key={v}
                className="flex items-center gap-sm cursor-pointer"
              >
                <input
                  type="radio"
                  name="availability"
                  value={v}
                  checked={localAvailability === v}
                  onChange={() => setLocalAvailability(v)}
                  className="w-4 h-4"
                />
                <span className="font-body-sm text-body-sm text-on-surface">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={apply}
          className="w-full bg-secondary text-on-secondary font-label-md text-label-md py-sm rounded-lg hover:bg-secondary-container hover:text-on-secondary-container transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </aside>
  );
}
