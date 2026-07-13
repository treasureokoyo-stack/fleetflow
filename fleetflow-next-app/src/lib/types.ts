/**
 * Shared plain types for client/server boundaries.
 *
 * These mirror the Prisma model shapes but are free of generated-client
 * imports so they can be safely serialized to client components.
 */

export type VehicleStatus =
  | "AVAILABLE"
  | "BOOKED"
  | "MAINTENANCE"
  | "INACTIVE";

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

export type Role = "CUSTOMER" | "STAFF" | "ADMIN";

export type VehicleImage = {
  id: string;
  vehicle_id: string;
  image_url: string;
};

export type Vehicle = {
  id: string;
  name: string;
  slug: string;
  category: string;
  brand: string;
  model: string;
  year: number;
  transmission: string;
  fuel_type: string;
  seat_count: number;
  daily_rate: number;
  description: string;
  thumbnail_url: string;
  status: VehicleStatus;
  mileage: number;
  images?: VehicleImage[];
};

export type BookingWithRelations = {
  id: string;
  booking_reference: string;
  customer_id: string;
  vehicle_id: string;
  pickup_date: Date | string;
  return_date: Date | string;
  total_days: number;
  daily_rate: number;
  total_amount: number;
  status: BookingStatus;
  created_at: Date | string;
  customer?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  vehicle?: Vehicle;
};

export type CustomerWithStats = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  created_at: Date | string;
  _count?: { bookings: number };
  _spent?: number;
};
