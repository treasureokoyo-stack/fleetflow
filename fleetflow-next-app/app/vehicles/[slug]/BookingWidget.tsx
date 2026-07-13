"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { formatCurrency } from "@/lib/utils";
import type { Vehicle } from "@/lib/types";

/**
 * Sticky booking widget on the vehicle details page.
 *
 * Live-calculates the total as the user picks dates, then routes to the
 * multi-step booking flow. The actual booking creation (with overlap check)
 * happens server-side via the booking server actions.
 */
export function BookingWidget({
  vehicle,
  available,
}: {
  vehicle: Vehicle;
  available: boolean;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [pickup, setPickup] = useState("");
  const [ret, setReturn] = useState("");
  const [error, setError] = useState("");

  const { days, total } = useMemo(() => {
    if (!pickup || !ret) return { days: 0, total: 0 };
    const p = new Date(pickup);
    const r = new Date(ret);
    const diff = Math.round(
      (r.getTime() - p.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (isNaN(diff) || diff <= 0) return { days: 0, total: 0 };
    return { days: diff, total: vehicle.daily_rate * diff };
  }, [pickup, ret, vehicle.daily_rate]);

  function handleReserve() {
    setError("");
    if (!available) {
      setError("This vehicle is currently unavailable.");
      return;
    }
    if (!pickup || !ret) {
      setError("Please select pick-up and return dates.");
      return;
    }
    const p = new Date(pickup);
    const r = new Date(ret);
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    if (p < t) {
      setError("Pick-up date cannot be in the past.");
      return;
    }
    if (r <= p) {
      setError("Return date must be after pick-up date.");
      return;
    }
    const d = Math.round(
      (r.getTime() - p.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (d < 1) {
      setError("Minimum rental is 1 day.");
      return;
    }
    if (d > 60) {
      setError("Maximum rental is 60 days.");
      return;
    }
    // Hand off to the booking route.
    const qs = new URLSearchParams({
      vehicle: vehicle.id,
      pickup,
      return: ret,
    });
    window.location.href = `/booking?${qs.toString()}`;
  }

  return (
    <div className="sticky top-[100px] bg-surface border border-outline-variant rounded-xl p-md shadow-natural flex flex-col gap-lg">
      <div>
        <h3 className="font-headline-md text-headline-md text-primary mb-sm">
          Reserve Vehicle
        </h3>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Select your dates to see total pricing.
        </p>
      </div>

      <div className="flex flex-col gap-md">
        {/* Date Pickers */}
        <div className="grid grid-cols-2 gap-sm">
          <div className="flex flex-col gap-xs">
            <label className="font-label-sm text-label-sm text-primary">
              Pick-up
            </label>
            <div className="relative">
              <Icon
                name="event"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]"
              />
              <input
                type="date"
                min={today}
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-surface border border-outline-variant rounded-lg font-body-sm text-body-sm text-primary focus:border-secondary focus:ring-2 focus:ring-secondary/30 transition-all outline-none"
              />
            </div>
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-sm text-label-sm text-primary">
              Drop-off
            </label>
            <div className="relative">
              <Icon
                name="event"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]"
              />
              <input
                type="date"
                min={pickup || today}
                value={ret}
                onChange={(e) => setReturn(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-surface border border-outline-variant rounded-lg font-body-sm text-body-sm text-primary focus:border-secondary focus:ring-2 focus:ring-secondary/30 transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* Price Calculation */}
        <div className="flex flex-col gap-sm border-t border-b border-outline-variant py-md">
          <div className="flex justify-between items-center font-body-md text-body-md text-on-surface-variant">
            <span>
              {formatCurrency(vehicle.daily_rate)} x {days || 0} day
              {days === 1 ? "" : "s"}
            </span>
            <span>{formatCurrency(vehicle.daily_rate * days)}</span>
          </div>
          <div className="flex justify-between items-center font-body-md text-body-md text-on-surface-variant">
            <span className="flex items-center gap-1">
              Service Fee{" "}
              <Icon name="info" className="text-[16px] text-outline cursor-help" />
            </span>
            <span>{formatCurrency(0)}</span>
          </div>
          <div className="flex justify-between items-center font-body-md text-body-md text-on-surface-variant">
            <span>Taxes</span>
            <span>{formatCurrency(0)}</span>
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="font-headline-md text-headline-md text-primary">
            Total
          </span>
          <span className="font-headline-md text-headline-md text-secondary">
            {formatCurrency(total)}
          </span>
        </div>

        {error && (
          <p className="text-label-sm text-error flex items-center gap-xs">
            <Icon name="error" className="text-[16px]" />
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleReserve}
          disabled={!available}
          className="w-full py-3 bg-primary text-on-primary font-label-md text-label-md rounded-xl hover:bg-primary/90 transition-colors flex justify-center items-center gap-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {available ? "Reserve Now" : "Unavailable"}
          {available && <Icon name="arrow_forward" className="text-[20px]" />}
        </button>

        <div className="text-center">
          <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center justify-center gap-1">
            <Icon name="lock" className="text-[16px]" />
            Secure checkout. Free cancellation up to 24h before.
          </span>
        </div>
      </div>
    </div>
  );
}
