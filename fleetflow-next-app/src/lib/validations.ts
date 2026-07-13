import { z } from "zod";

/**
 * Shared Zod schemas for form validation (PRD section 16: Form Validation).
 */

export const registerSchema = z
  .object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().min(1, "Phone number is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
    terms: z
      .literal(true, { errorMap: () => ({ message: "You must accept the Terms" }) })
      .or(z.boolean()),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

/**
 * Vehicle create/edit validation (PRD section 12).
 */
export const vehicleSchema = z.object({
  name: z.string().min(1, "Vehicle name is required"),
  category: z.string().min(1, "Category is required"),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce
    .number()
    .int()
    .min(1900, "Enter a valid year")
    .max(new Date().getFullYear() + 1, "Enter a valid year"),
  transmission: z.enum(["Automatic", "Manual"]),
  fuel_type: z.string().min(1, "Fuel type is required"),
  seat_count: z.coerce
    .number()
    .int()
    .min(1, "Seat count must be at least 1"),
  daily_rate: z.coerce
    .number()
    .positive("Daily rate must be greater than zero"),
  mileage: z.coerce.number().int().min(0).default(0),
  description: z.string().min(1, "Description is required"),
  thumbnail_url: z.string().min(1, "A thumbnail image is required"),
  images: z.array(z.string()).optional().default([]),
  status: z
    .enum(["AVAILABLE", "BOOKED", "MAINTENANCE", "INACTIVE"])
    .default("AVAILABLE"),
});

/**
 * Booking validation (PRD section 8 + 16).
 *
 * Date rules enforced:
 *  - pickup cannot be in the past
 *  - return must be after pickup
 *  - minimum 1 day, maximum 60 days
 */
export const bookingSchema = z
  .object({
    vehicle_id: z.string().min(1),
    pickup_date: z.string().min(1, "Pick-up date is required"),
    return_date: z.string().min(1, "Return date is required"),
  })
  .superRefine((data, ctx) => {
    const pickup = new Date(data.pickup_date);
    const ret = new Date(data.return_date);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (isNaN(pickup.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Pick-up date is required",
        path: ["pickup_date"],
      });
      return;
    }
    if (pickup < today) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Pick-up date cannot be in the past",
        path: ["pickup_date"],
      });
    }
    if (ret <= pickup) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Return date must be after pick-up date",
        path: ["return_date"],
      });
      return;
    }
    const days = Math.round(
      (ret.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (days < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Minimum rental is 1 day",
        path: ["return_date"],
      });
    }
    if (days > 60) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Maximum rental is 60 days",
        path: ["return_date"],
      });
    }
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VehicleInput = z.infer<typeof vehicleSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
