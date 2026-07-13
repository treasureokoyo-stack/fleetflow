"use server";

import { redirect } from "next/navigation";
import { auth, roleHome } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { loginSchema, registerSchema } from "@/lib/validations";

/**
 * Authenticate a user with email + password credentials.
 */
export async function authenticateUser(formData: FormData): Promise<{
  error?: string;
}> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.email?.[0] ?? "Invalid input" };
  }

  try {
    const result = await auth.api.signIn({
      body: { email: parsed.data.email, password: parsed.data.password },
    });
    if (result) {
      redirect(roleHome(result.user.role ?? "CUSTOMER"));
    }
    return { error: "Invalid email or password." };
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
      throw err; // let Next handle the redirect
    }
    return { error: "Invalid email or password." };
  }
}

/**
 * Register a new customer account.
 */
export async function registerUser(formData: FormData): Promise<{
  error?: string;
}> {
  const raw = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
    terms: formData.get("terms") === "on",
  };
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.flatten().fieldErrors;
    const msg =
      firstError.email?.[0] ??
      firstError.password?.[0] ??
      firstError.confirmPassword?.[0] ??
      firstError.terms?.[0] ??
      "Please correct the form errors.";
    return { error: msg };
  }

  const { first_name, last_name, email, phone, password } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return { error: "An account with this email already exists." };
    }

    const password_hash = await hashPassword(password);
    await prisma.user.create({
      data: {
        first_name,
        last_name,
        email: email.toLowerCase(),
        phone,
        password_hash,
        role: "CUSTOMER",
      },
    });

    redirect("/login?registered=1");
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
      throw err;
    }
    return { error: "Something went wrong. Please try again." };
  }
}

/**
 * Create a booking with overlap validation (PRD section 8).
 */
export async function createBooking(formData: FormData): Promise<{
  error?: string;
  bookingReference?: string;
}> {
  const vehicleId = formData.get("vehicle_id") as string;
  const pickupStr = formData.get("pickup_date") as string;
  const returnStr = formData.get("return_date") as string;

  if (!vehicleId || !pickupStr || !returnStr) {
    return { error: "Missing booking data." };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in to book a vehicle." };
  }

  const pickup = new Date(pickupStr);
  const ret = new Date(returnStr);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  if (pickup < today) {
    return { error: "Pick-up date cannot be in the past." };
  }
  if (ret <= pickup) {
    return { error: "Return date must be after pick-up date." };
  }
  const days = Math.round((ret.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 1) return { error: "Minimum rental is 1 day." };
  if (days > 60) return { error: "Maximum rental is 60 days." };

  const { countOverlappingBookings } = await import("@/lib/data");
  const { generateBookingReference } = await import("@/lib/utils");

  const overlapping = await countOverlappingBookings(vehicleId, pickup, ret);
  if (overlapping > 0) {
    return { error: "This vehicle is unavailable for the selected dates." };
  }

  // Fetch vehicle to get daily_rate.
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) return { error: "This vehicle no longer exists." };

  const total_amount = vehicle.daily_rate * days;
  const booking_reference = generateBookingReference();

  await prisma.booking.create({
    data: {
      booking_reference,
      customer_id: session.user.id,
      vehicle_id: vehicleId,
      pickup_date: pickup,
      return_date: ret,
      total_days: days,
      daily_rate: vehicle.daily_rate,
      total_amount,
      status: "PENDING",
    },
  });

  return { bookingReference };
}

/**
 * Cancel a booking (customer action).
 */
export async function cancelBooking(bookingId: string): Promise<{
  error?: string;
}> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.customer_id !== session.user.id) {
    return { error: "Booking not found." };
  }
  if (booking.status !== "PENDING" && booking.status !== "CONFIRMED") {
    return { error: "This booking cannot be cancelled." };
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });
  return {};
}

/**
 * Update booking status (staff/admin action).
 */
export async function updateBookingStatus(
  bookingId: string,
  status: string
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };
  const role = session.user.role;
  if (role !== "STAFF" && role !== "ADMIN") return { error: "Unauthorized." };

  const valid = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];
  if (!valid.includes(status)) return { error: "Invalid status." };

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status },
  });
  return {};
}
