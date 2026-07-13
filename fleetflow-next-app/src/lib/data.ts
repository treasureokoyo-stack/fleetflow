import "server-only";
import { prisma } from "@/lib/prisma";
import type {
  Vehicle,
  VehicleStatus,
  BookingStatus,
} from "@/lib/types";
import { Prisma } from "@prisma/client";

/**
 * Data-access layer.
 *
 * All Prisma reads go through here so we can (a) keep queries consistent and
 * (b) degrade gracefully when no database is connected — the app was built to
 * be deployable to Vercel/PostgreSQL, but for local dev without a DB we serve
 * curated sample data so every screen still renders.
 */

const DB_READY = process.env.SKIP_DB !== "true";

async function withFallback<T>(
  query: () => Promise<T>,
  fallback: T
): Promise<T> {
  if (!DB_READY) return fallback;
  try {
    return await query();
  } catch (err) {
    console.warn("[data] DB query failed, using fallback:", (err as Error).message);
    return fallback;
  }
}

// ---------- Vehicles ----------

export async function listVehicles(opts?: {
  category?: string;
  transmission?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: VehicleStatus | "ALL";
  search?: string;
  sort?: "recommended" | "price_asc" | "price_desc" | "newest";
  page?: number;
  pageSize?: number;
}): Promise<{ vehicles: Vehicle[]; total: number }> {
  const pageSize = opts?.pageSize ?? 12;
  const page = Math.max(1, opts?.page ?? 1);

  const where: Prisma.VehicleWhereInput = {};
  if (opts?.category && opts.category !== "All Categories") {
    where.category = { contains: opts.category, mode: "insensitive" };
  }
  if (opts?.transmission && opts.transmission !== "Any") {
    where.transmission = { equals: opts.transmission, mode: "insensitive" };
  }
  if (typeof opts?.minPrice === "number" && typeof opts?.maxPrice === "number") {
    where.daily_rate = { gte: opts.minPrice, lte: opts.maxPrice };
  } else if (typeof opts?.minPrice === "number") {
    where.daily_rate = { gte: opts.minPrice };
  } else if (typeof opts?.maxPrice === "number") {
    where.daily_rate = { lte: opts.maxPrice };
  }
  if (opts?.status && opts.status !== "ALL") {
    where.status = opts.status;
  }
  if (opts?.search) {
    where.OR = [
      { name: { contains: opts.search, mode: "insensitive" } },
      { brand: { contains: opts.search, mode: "insensitive" } },
      { model: { contains: opts.search, mode: "insensitive" } },
      { category: { contains: opts.search, mode: "insensitive" } },
    ];
  }

  let orderBy: Prisma.VehicleOrderByWithRelationInput = { created_at: "desc" };
  switch (opts?.sort) {
    case "price_asc":
      orderBy = { daily_rate: "asc" };
      break;
    case "price_desc":
      orderBy = { daily_rate: "desc" };
      break;
    case "newest":
      orderBy = { created_at: "desc" };
      break;
    default:
      orderBy = { daily_rate: "asc" };
  }

  return withFallback(
    async () => {
      const [rows, total] = await Promise.all([
        prisma.vehicle.findMany({
          where,
          orderBy,
          skip: (page - 1) * pageSize,
          take: pageSize,
          include: { images: true },
        }),
        prisma.vehicle.count({ where }),
      ]);
      return { vehicles: rows as Vehicle[], total };
    },
    (() => {
      const fallback = sampleVehicles();
      let rows = fallback;
      if (opts?.category && opts.category !== "All Categories") {
        rows = rows.filter((v) =>
          v.category.toLowerCase().includes(opts.category!.toLowerCase())
        );
      }
      if (opts?.transmission && opts.transmission !== "Any") {
        rows = rows.filter((v) => v.transmission === opts.transmission);
      }
      if (typeof opts?.minPrice === "number") {
        rows = rows.filter((v) => v.daily_rate >= opts.minPrice!);
      }
      if (typeof opts?.maxPrice === "number") {
        rows = rows.filter((v) => v.daily_rate <= opts.maxPrice!);
      }
      if (opts?.status && opts.status !== "ALL") {
        rows = rows.filter((v) => v.status === opts.status);
      }
      if (opts?.search) {
        const q = opts.search.toLowerCase();
        rows = rows.filter(
          (v) =>
            v.name.toLowerCase().includes(q) ||
            v.brand.toLowerCase().includes(q) ||
            v.category.toLowerCase().includes(q)
        );
      }
      switch (opts?.sort) {
        case "price_asc":
          rows = [...rows].sort((a, b) => a.daily_rate - b.daily_rate);
          break;
        case "price_desc":
          rows = [...rows].sort((a, b) => b.daily_rate - a.daily_rate);
          break;
        default:
          break;
      }
      const total = rows.length;
      const paged = rows.slice((page - 1) * pageSize, page * pageSize);
      return { vehicles: paged, total };
    })()
  );
}

export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
  return withFallback(
    async () => {
      const v = await prisma.vehicle.findUnique({
        where: { slug },
        include: { images: true },
      });
      return (v as Vehicle) ?? null;
    },
    sampleVehicles().find((v) => v.slug === slug) ?? null
  );
}

export async function getFeaturedVehicles(limit = 6): Promise<Vehicle[]> {
  return withFallback(
    async () => {
      const rows = await prisma.vehicle.findMany({
        where: { status: "AVAILABLE" },
        orderBy: { daily_rate: "asc" },
        take: limit,
        include: { images: true },
      });
      return rows as Vehicle[];
    },
    sampleVehicles()
      .filter((v) => v.status === "AVAILABLE")
      .slice(0, limit)
  );
}

export async function getVehicleCategories(): Promise<string[]> {
  return withFallback(
    async () => {
      const rows = await prisma.vehicle.findMany({
        select: { category: true },
        distinct: ["category"],
        orderBy: { category: "asc" },
      });
      return rows.map((r) => r.category);
    },
    Array.from(new Set(sampleVehicles().map((v) => v.category))).sort()
  );
}

// ---------- Bookings ----------

export async function listBookingsForCustomer(customerId: string) {
  return withFallback(
    async () =>
      prisma.booking.findMany({
        where: { customer_id: customerId },
        include: { vehicle: { include: { images: true } } },
        orderBy: { created_at: "desc" },
      }),
    []
  );
}

export async function listAllBookings() {
  return withFallback(
    async () =>
      prisma.booking.findMany({
        include: {
          vehicle: true,
          customer: true,
        },
        orderBy: { created_at: "desc" },
      }),
    []
  );
}

export async function countOverlappingBookings(
  vehicleId: string,
  pickup: Date,
  returnDate: Date,
  excludeBookingId?: string
): Promise<number> {
  return withFallback(
    async () => {
      // PRD section 8 overlap rule:
      //   requested_pickup <= existing_return AND requested_return >= existing_pickup
      // Only PENDING and CONFIRMED bookings block a vehicle.
      return prisma.booking.count({
        where: {
          vehicle_id: vehicleId,
          id: excludeBookingId ? { not: excludeBookingId } : undefined,
          status: { in: ["PENDING", "CONFIRMED"] },
          AND: [
            { pickup_date: { lte: returnDate } },
            { return_date: { gte: pickup } },
          ],
        },
      });
    },
    0
  );
}

// ---------- Customers ----------

export async function listCustomers(opts?: {
  search?: string;
}): Promise<
  Array<{
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    role: string;
    created_at: Date;
    bookingCount: number;
    totalSpent: number;
  }>
> {
  return withFallback(
    async () => {
      const users = await prisma.user.findMany({
        where: {
          role: "CUSTOMER",
          ...(opts?.search
            ? {
                OR: [
                  { first_name: { contains: opts.search, mode: "insensitive" } },
                  { last_name: { contains: opts.search, mode: "insensitive" } },
                  { email: { contains: opts.search, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        orderBy: { created_at: "desc" },
        include: {
          bookings: { select: { total_amount: true, status: true } },
        },
      });
      return users.map((u) => ({
        id: u.id,
        first_name: u.first_name,
        last_name: u.last_name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        created_at: u.created_at,
        bookingCount: u.bookings.length,
        totalSpent: u.bookings
          .filter((b) => b.status !== "CANCELLED")
          .reduce((sum, b) => sum + b.total_amount, 0),
      }));
    },
    []
  );
}

// ---------- Reporting aggregates ----------

export async function getReportStats() {
  return withFallback(
    async () => {
      const [revenueAgg, bookings, customers, vehicles] = await Promise.all([
        prisma.booking.aggregate({
          _sum: { total_amount: true },
          where: { status: { not: "CANCELLED" } },
        }),
        prisma.booking.count(),
        prisma.user.count({ where: { role: "CUSTOMER" } }),
        prisma.vehicle.count(),
      ]);

      const monthly = await getMonthlyRevenue();
      const byStatus = await getBookingsByMonth();

      const vehiclesByStatusRaw = await prisma.vehicle.groupBy({
        by: ["status"],
        _count: true,
      });
      const vehiclesByStatus = vehiclesByStatusRaw.map((r) => ({
        name: r.status,
        value: r._count,
      }));

      return {
        totalRevenue: revenueAgg._sum.total_amount ?? 0,
        totalBookings: bookings,
        totalCustomers: customers,
        totalVehicles: vehicles,
        monthlyRevenue: monthly,
        bookingsByMonth: byStatus,
        vehiclesByStatus,
      };
    },
    {
      totalRevenue: 0,
      totalBookings: 0,
      totalCustomers: 0,
      totalVehicles: 0,
      monthlyRevenue: [] as { month: string; revenue: number }[],
      bookingsByMonth: [] as { month: string; bookings: number }[],
      vehiclesByStatus: [] as { name: string; value: number }[],
    }
  );
}

async function getMonthlyRevenue() {
  const year = new Date().getFullYear();
  const rows = await prisma.$queryRaw<
    Array<{ month: number; revenue: number }>
  >(Prisma.sql`
    SELECT EXTRACT(MONTH FROM pickup_date)::int AS month,
           COALESCE(SUM(total_amount), 0)::float AS revenue
    FROM bookings
    WHERE status != 'CANCELLED' AND EXTRACT(YEAR FROM pickup_date) = ${year}
    GROUP BY month ORDER BY month;
  `);
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return monthNames.map((m, i) => ({
    month: m,
    revenue: rows.find((r) => r.month === i + 1)?.revenue ?? 0,
  }));
}

async function getBookingsByMonth() {
  const year = new Date().getFullYear();
  const rows = await prisma.$queryRaw<
    Array<{ month: number; bookings: number }>
  >(Prisma.sql`
    SELECT EXTRACT(MONTH FROM created_at)::int AS month,
           COUNT(*)::int AS bookings
    FROM bookings
    WHERE EXTRACT(YEAR FROM created_at) = ${year}
    GROUP BY month ORDER BY month;
  `);
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return monthNames.map((m, i) => ({
    month: m,
    bookings: rows.find((r) => r.month === i + 1)?.bookings ?? 0,
  }));
}

// ---------- Sample data (fallback when no DB) ----------

const img = (id: string) => `https://lh3.googleusercontent.com/aida-public/${id}`;

function sampleVehicles(): Vehicle[] {
  return [
    {
      id: "v1", name: "Executive Sedan", slug: "executive-sedan",
      category: "Luxury Sedan", brand: "Mercedes-Benz", model: "S-Class",
      year: 2024, transmission: "Automatic", fuel_type: "Petrol", seat_count: 5,
      daily_rate: 120, mileage: 4200, status: "AVAILABLE",
      thumbnail_url: img("AB6AXuCrXku4ubo4QlcacEHvo_yNqKmY5rusF3HyoLm9FexLICCCjGOZd-Ty3RsWXeR2Q3eopTMOm3n4S2AxFnZMfYuuUQ5Edlcgbfr3bmo2T5ukk5eeedeufljd4j24G-3ZJiDFcgVGdtKXQTnU49O5rzSbRtq8XWZCEM3ZjdNBO0tSrK8raPU1dj1oU9c6uro_L03ZkGJj1lrDa0lhY6ewe3JyTX37H8o9WL7HYo5mVJIKkzDvdSp1640OA-0hga7Zua5Dbu2LBr_9dlg"),
      description: "The flagship Mercedes-Benz S-Class delivers unparalleled executive comfort with handcrafted interior, ambient lighting, and a whisper-quiet cabin engineered for first-class travel.",
    },
    {
      id: "v2", name: "Premium SUV", slug: "premium-suv",
      category: "Premium SUV", brand: "Land Rover", model: "Range Rover Velar",
      year: 2024, transmission: "Automatic", fuel_type: "Petrol", seat_count: 5,
      daily_rate: 150, mileage: 8800, status: "AVAILABLE",
      thumbnail_url: img("AB6AXuBbRShrho6eclRZ2Zie3iwwmk6m01OA6u8GjU9v8FMuRrgAmkpn7qz3co5V4qBcangsldNbuFRw2DfpCr9SuTbWqJt5G9CNt92aDFUzFITx09YwxrZ25oHsbGGoPw4azcgbCcAdEN3UiYeeGLmpJg0ubbYecnfItyJNOkrGX29aGQUgn3u5BUEZgEbahyRWcCiMdvY9ZGMieXTAr5Z-EupPi_LshFLh5tkKdadwYn_fGZtp9p379AeShYCjI1N-vVMBIXR_uRqi61M"),
      description: "A sophisticated SUV blending commanding presence with refined luxury. The Range Rover Velar offers terrain-conquering capability wrapped in a minimalist, design-led cabin.",
    },
    {
      id: "v3", name: "Electric Performance", slug: "electric-performance",
      category: "Electric", brand: "Tesla", model: "Model S",
      year: 2023, transmission: "Automatic", fuel_type: "Electric", seat_count: 5,
      daily_rate: 135, mileage: 12500, status: "AVAILABLE",
      thumbnail_url: img("AB6AXuCb7sbRcGZlSI7Fo0x5cnxkfcO8pDea-_NQYSdaxdjSGtMrfsPcsERv0l-xx3HS9UWjcHmpvnJ9yzxKdH25aluPrXHpIykATeXC6uXy6MOH6ZHc8B4z00u3iTOQlTGPhT5gQMvCC7b8N_hGdQnakKOzb5TsAr9yvJ8dSvUVxX2G5BnG1O5v5PYi92j7YW6D6fS_sFge2O9QzK0Xkv_5U8Xu1O794k13gNik4GpCFkwr96dj9ElD7FFzJa-8fvIVYHjyM6ZD_hNpTeI"),
      description: "Experience the pinnacle of electric performance with the Tesla Model S. Dual motor all-wheel drive delivers breathtaking acceleration, while the minimalist interior offers expansive headroom and an industry-leading infotainment center.",
    },
    {
      id: "v4", name: "Aero Model S", slug: "aero-model-s",
      category: "Electric Sedan", brand: "Aero", model: "Model S",
      year: 2024, transmission: "Automatic", fuel_type: "Electric", seat_count: 5,
      daily_rate: 145, mileage: 3100, status: "AVAILABLE",
      thumbnail_url: img("AB6AXuADOqcqWF68-vjSFIadboMxYs5D9p22zk1gPWb7UcrGZDT62n_QtP4VeGa6O7NWEGWwoIaaUysU-7M0mdNedVqMx91BDp1b-EPHUul0Bx82IAQINamtLY8_inFxCoYQsAaFzaMkVVOsQn5Ryiqhp-1Dwry8VPzdYFBRGhYYroCmT9RbwXeSj6ikqAbfHi5a6-HQNRfIy-HeUmibWJUyGfD--JCFPQ8lP0Y7PjsnDWGBvZsdh75icobBMQCFDajQbuoqi5IIBQYec3A"),
      description: "A pristine electric sedan combining 400 miles of range with a panoramic glass roof and adaptive air suspension for a serene, emissions-free drive.",
    },
    {
      id: "v5", name: "Atlas Grandeur", slug: "atlas-grandeur",
      category: "Premium SUV", brand: "Atlas", model: "Grandeur",
      year: 2024, transmission: "Automatic", fuel_type: "Petrol", seat_count: 7,
      daily_rate: 210, mileage: 6400, status: "BOOKED",
      thumbnail_url: img("AB6AXuCPBGjpdMxZpRZCBiWPcajTL8ChJtfzyMC3yKLUl7SGKgmBTVoA4MxlWQjXWWLxUaD4buVyE-6LmXtVzAeQqn1cPooo_yhmlCDi7EPkSEM3guJR9ZeIeHnU0vQZ_dChQAeuJd2QwFJXHIA--yPcm7p5Nm3eSXaKiQBnZKmYAkxEgYHVEqA47N4jwkLePd-2YW-gaPQwD7QGO6pWR1p95HRq96SdHW5r5JVXfru9_hPDlnCO9KTwJZAA3blNayRWyKMFHOCAyCUAc04"),
      description: "A commanding three-row SUV with executive-grade leather, panoramic roof, and adaptive cruise control. Built for families that travel first class.",
    },
    {
      id: "v6", name: "Veloce GT", slug: "veloce-gt",
      category: "Sports Coupe", brand: "Veloce", model: "GT",
      year: 2023, transmission: "Automatic", fuel_type: "Petrol", seat_count: 2,
      daily_rate: 350, mileage: 9800, status: "MAINTENANCE",
      thumbnail_url: img("AB6AXuDfq5ZK15fq0k4Fzl3vUKNhzCVCN-sKxkxzigJcOYmCRpvkqGg0t-nu8vNgwYOwB8MBgRxfOA97hhFJ8T9nHijEpr5_1OcpXPz7O16WpDQmPn7MhdBSktF7D8jzsa_b5SPISe1i5HZt6i420YY3S2qCq1Em84pG8ZnqL9o0n2xMtTBHZcwX25PcTubtoWrxTGP7CjYgQucqwYRwXxrbxYfOeEji2ppAD8fv-6F5L8H3zqZJtTD8Fiqt-sLqQwlpeyBqudg11trZ2c0"),
      description: "A sleek silver sports coupe with carbon-fibre accents and a hand-stitched cabin. Engineered for drivers who demand precision and presence.",
    },
    {
      id: "v7", name: "Mercedes-Benz E-Class", slug: "mercedes-benz-e-class",
      category: "Luxury Sedan", brand: "Mercedes-Benz", model: "E-Class",
      year: 2024, transmission: "Automatic", fuel_type: "Petrol", seat_count: 5,
      daily_rate: 150, mileage: 5200, status: "AVAILABLE",
      thumbnail_url: img("AB6AXuAMM6KqzAH5yCKP5XvZgzf25WlkBXWAAiFGwVeITCa7DJ7zHjYqREeIol7qK_EB5NnfXoD6bX76wDZtsOwmpJKEneXfTbZuetyx4tT93UktFKc4FbfZyWk2U7gEgJw7CQsfQId3D16vgabOadKbA_OFNk7nYsgzj3MkMO8vDUwHW5Qa2cs57Z8aexRXZr0ZmjIxBjKBoSujrJltAFHhyApoQSm3lL0LRG15nueLscbIFKv9htjA8wswW06vSVqGwoYxQDqw7iAtfjc"),
      description: "Refined German engineering with the latest MBUX infotainment, augmented reality navigation, and a silk-smooth inline-six engine.",
    },
    {
      id: "v8", name: "Tesla Model Y", slug: "tesla-model-y",
      category: "Electric SUV", brand: "Tesla", model: "Model Y",
      year: 2024, transmission: "Automatic", fuel_type: "Electric", seat_count: 5,
      daily_rate: 130, mileage: 7300, status: "AVAILABLE",
      thumbnail_url: img("AB6AXuB60GUYVrQzsZ7CKdkfpdcZIX-wG0R-1CJFlurdi-orx39-O0Ezj7Bn-3h4mDgxId9YBknC0PcXwCf_EV19IVE6KkNUYZ4RfnSaQIskBbhjJH5yJMN1bv3V9v6LSIur5cUUakq5xTHStpSyAJbIsTlQSlYeZgnAUkNKKHa55R7PDWIkUiIG6N31v6K744L9D0nNFjoUaoyM1mSYmQB4GYZPZujh4FsFfdHuJIkRQvGS8zYn6LOyb7l90u97Bk7Q5Vac_TrfD6neN1E"),
      description: "The world's best-selling electric SUV. 330 miles of range, full self-driving capability, and a cavernous cabin with a panoramic glass roof.",
    },
    {
      id: "v9", name: "2024 Polestar 2", slug: "2024-polestar-2",
      category: "Electric", brand: "Polestar", model: "2",
      year: 2024, transmission: "Automatic", fuel_type: "Electric", seat_count: 5,
      daily_rate: 125, mileage: 2900, status: "AVAILABLE",
      thumbnail_url: img("AB6AXuABWzZsQdzbeoDXvpBgfMEllugDpJI4XC_BgMakqUlKQaKDNyzfll1z1m9e10sCZPrdYrDlBiBpOCs-6ORtUIdlpA6DgNW1iauMrN-tQsqKoIADFb7jy_WWAsNiErNjyxxjiqQImdMnTBRN3a7jRavyeAAS5rWyPpCSnHeim4D7fdfPV-YOuXUR8o-p5DMcvbuBJpHSZTO2IN3CnKxeEBjheBWmZXcaamV3bI65jdRvf0RpU8aT7KtwVgui2X50Gtf9ukf_xacYl9o"),
      description: "Scandinavian minimalism meets electric performance. The Polestar 2 offers a sleek fastback silhouette, vegan interior, and 270 miles of range.",
    },
    {
      id: "v10", name: "BMW 7 Series", slug: "bmw-7-series",
      category: "Luxury Sedan", brand: "BMW", model: "7 Series",
      year: 2024, transmission: "Automatic", fuel_type: "Petrol", seat_count: 5,
      daily_rate: 175, mileage: 4100, status: "AVAILABLE",
      thumbnail_url: img("AB6AXuCPBGjpdMxZpRZCBiWPcajTL8ChJtfzyMC3yKLUl7SGKgmBTVoA4MxlWQjXWWLxUaD4buVyE-6LmXtVzAeQqn1cPooo_yhmlCDi7EPkSEM3guJR9ZeIeHnU0vQZ_dChQAeuJd2QwFJXHIA--yPcm7p5Nm3eSXaKiQBnZKmYAkxEgYHVEqA47N4jwkLePd-2YW-gaPQwD7QGO6pWR1p95HRq96SdHW5r5JVXfru9_hPDlnCO9KTwJZAA3blNayRWyKMFHOCAyCUAc04"),
      description: "The benchmark of executive luxury. The BMW 7 Series features the Theater Screen, executive lounge rear seats, and a plug-in hybrid powertrain.",
    },
    {
      id: "v11", name: "Audi Q7", slug: "audi-q7",
      category: "Premium SUV", brand: "Audi", model: "Q7",
      year: 2023, transmission: "Automatic", fuel_type: "Diesel", seat_count: 7,
      daily_rate: 165, mileage: 11800, status: "AVAILABLE",
      thumbnail_url: img("AB6AXuBbRShrho6eclRZ2Zie3iwwmk6m01OA6u8GjU9v8FMuRrgAmkpn7qz3co5V4qBcangsldNbuFRw2DfpCr9SuTbWqJt5G9CNt92aDFUzFITx09YwxrZ25oHsbGGoPw4azcgbCcAdEN3UiYeeGLmpJg0ubbYecnfItyJNOkrGX29aGQUgn3u5BUEZgEbahyRWcCiMdvY9ZGMieXTAr5Z-EupPi_LshFLh5tkKdadwYn_fGZtp9p379AeShYCjI1N-vVMBIXR_uRqi61M"),
      description: "Seven seats, quattro all-wheel drive, and Virtual Cockpit Plus. The Audi Q7 is the executive family hauler of choice.",
    },
    {
      id: "v12", name: "Porsche 911 Carrera", slug: "porsche-911-carrera",
      category: "Sports Coupe", brand: "Porsche", model: "911 Carrera",
      year: 2024, transmission: "Automatic", fuel_type: "Petrol", seat_count: 2,
      daily_rate: 420, mileage: 5600, status: "AVAILABLE",
      thumbnail_url: img("AB6AXuDfq5ZK15fq0k4Fzl3vUKNhzCVCN-sKxkxzigJcOYmCRpvkqGg0t-nu8vNgwYOwB8MBgRxfOA97hhFJ8T9nHijEpr5_1OcpXPz7O16WpDQmPn7MhdBSktF7D8jzsa_b5SPISe1i5HZt6i420YY3S2qCq1Em84pG8ZnqL9o0n2xMtTBHZcwX25PcTubtoWrxTGP7CjYgQucqwYRwXxrbxYfOeEji2ppAD8fv-6F5L8H3zqZJtTD8Fiqt-sLqQwlpeyBqudg11trZ2c0"),
      description: "The icon. The Porsche 911 Carrera blends timeless silhouette with cutting-edge engineering for the definitive sports car experience.",
    },
  ];
}
