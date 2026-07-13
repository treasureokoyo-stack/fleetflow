/* eslint-disable no-console */
import { PrismaClient, Role, VehicleStatus, BookingStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

/**
 * Seed data for FleetFlow.
 *
 * Creates one user per role plus a representative catalogue of vehicles and
 * a handful of bookings so every dashboard has data on first run.
 *
 * Run with:  npm run db:seed   (after DATABASE_URL is set & db:push applied)
 */
const prisma = new PrismaClient();

const image = (id: string) =>
  `https://lh3.googleusercontent.com/aida-public/${id}`;

async function main() {
  console.log("Seeding FleetFlow…");

  const passwordHash = await bcrypt.hash("password123", 10);

  // ---------- Users ----------
  const [customer, staff, admin] = await Promise.all([
    prisma.user.upsert({
      where: { email: "customer@fleetflow.com" },
      update: {},
      create: {
        first_name: "Alex",
        last_name: "Morgan",
        email: "customer@fleetflow.com",
        phone: "+1 (555) 010-0001",
        password_hash: passwordHash,
        role: Role.CUSTOMER,
      },
    }),
    prisma.user.upsert({
      where: { email: "staff@fleetflow.com" },
      update: {},
      create: {
        first_name: "Jordan",
        last_name: "Lee",
        email: "staff@fleetflow.com",
        phone: "+1 (555) 010-0002",
        password_hash: passwordHash,
        role: Role.STAFF,
      },
    }),
    prisma.user.upsert({
      where: { email: "admin@fleetflow.com" },
      update: {},
      create: {
        first_name: "Sam",
        last_name: "Rivera",
        email: "admin@fleetflow.com",
        phone: "+1 (555) 010-0003",
        password_hash: passwordHash,
        role: Role.ADMIN,
      },
    }),
  ]);

  // Extra customers for the management screens.
  const extraCustomers = await Promise.all(
    [
      ["Sarah", "Johnson", "sarah@example.com", "+1 (555) 020-1001"],
      ["Michael", "Thompson", "michael@example.com", "+1 (555) 020-1002"],
      ["Elena", "Rodriguez", "elena@example.com", "+1 (555) 020-1003"],
    ].map(([first_name, last_name, email, phone], i) =>
      prisma.user.upsert({
        where: { email: email as string },
        update: {},
        create: {
          first_name,
          last_name,
          email,
          phone,
          password_hash: passwordHash,
          role: Role.CUSTOMER,
        },
      }).then((u) => ({ ...u, _idx: i }))
    )
  );

  // ---------- Vehicles ----------
  const vehiclesData = [
    {
      name: "Executive Sedan",
      slug: "executive-sedan",
      category: "Luxury Sedan",
      brand: "Mercedes-Benz",
      model: "S-Class",
      year: 2024,
      transmission: "Automatic",
      fuel_type: "Petrol",
      seat_count: 5,
      daily_rate: 120,
      mileage: 4200,
      description:
        "The flagship Mercedes-Benz S-Class delivers unparalleled executive comfort with handcrafted interior, ambient lighting, and a whisper-quiet cabin engineered for first-class travel.",
      thumbnail_url: image("AB6AXuCrXku4ubo4QlcacEHvo_yNqKmY5rusF3HyoLm9FexLICCCjGOZd-Ty3RsWXeR2Q3eopTMOm3n4S2AxFnZMfYuuUQ5Edlcgbfr3bmo2T5ukk5eeedeufljd4j24G-3ZJiDFcgVGdtKXQTnU49O5rzSbRtq8XWZCEM3ZjdNBO0tSrK8raPU1dj1oU9c6uro_L03ZkGJj1lrDa0lhY6ewe3JyTX37H8o9WL7HYo5mVJIKkzDvdSp1640OA-0hga7Zua5Dbu2LBr_9dlg"),
      status: VehicleStatus.AVAILABLE,
    },
    {
      name: "Premium SUV",
      slug: "premium-suv",
      category: "Premium SUV",
      brand: "Land Rover",
      model: "Range Rover Velar",
      year: 2024,
      transmission: "Automatic",
      fuel_type: "Petrol",
      seat_count: 5,
      daily_rate: 150,
      mileage: 8800,
      description:
        "A sophisticated SUV blending commanding presence with refined luxury. The Range Rover Velar offers terrain-conquering capability wrapped in a minimalist, design-led cabin.",
      thumbnail_url: image("AB6AXuBbRShrho6eclRZ2Zie3iwwmk6m01OA6u8GjU9v8FMuRrgAmkpn7qz3co5V4qBcangsldNbuFRw2DfpCr9SuTbWqJt5G9CNt92aDFUzFITx09YwxrZ25oHsbGGoPw4azcgbCcAdEN3UiYeeGLmpJg0ubbYecnfItyJNOkrGX29aGQUgn3u5BUEZgEbahyRWcCiMdvY9ZGMieXTAr5Z-EupPi_LshFLh5tkKdadwYn_fGZtp9p379AeShYCjI1N-vVMBIXR_uRqi61M"),
      status: VehicleStatus.AVAILABLE,
    },
    {
      name: "Electric Performance",
      slug: "electric-performance",
      category: "Electric",
      brand: "Tesla",
      model: "Model S",
      year: 2023,
      transmission: "Automatic",
      fuel_type: "Electric",
      seat_count: 5,
      daily_rate: 135,
      mileage: 12500,
      description:
        "Experience the pinnacle of electric performance with the Tesla Model S. Dual motor all-wheel drive delivers breathtaking acceleration, while the minimalist interior offers expansive headroom and an industry-leading infotainment center.",
      thumbnail_url: image("AB6AXuCb7sbRcGZlSI7Fo0x5cnxkfcO8pDea-_NQYSdaxdjSGtMrfsPcsERv0l-xx3HS9UWjcHmpvnJ9yzxKdH25aluPrXHpIykATeXC6uXy6MOH6ZHc8B4z00u3iTOQlTGPhT5gQMvCC7b8N_hGdQnakKOzb5TsAr9yvJ8dSvUVxX2G5BnG1O5v5PYi92j7YW6D6fS_sFge2O9QzK0Xkv_5U8Xu1O794k13gNik4GpCFkwr96dj9ElD7FFzJa-8fvIVYHjyM6ZD_hNpTeI"),
      status: VehicleStatus.AVAILABLE,
    },
    {
      name: "Aero Model S",
      slug: "aero-model-s",
      category: "Electric Sedan",
      brand: "Aero",
      model: "Model S",
      year: 2024,
      transmission: "Automatic",
      fuel_type: "Electric",
      seat_count: 5,
      daily_rate: 145,
      mileage: 3100,
      description:
        "A pristine electric sedan combining 400 miles of range with a panoramic glass roof and adaptive air suspension for a serene, emissions-free drive.",
      thumbnail_url: image("AB6AXuADOqcqWF68-vjSFIadboMxYs5D9p22zk1gPWb7UcrGZDT62n_QtP4VeGa6O7NWEGWwoIaaUysU-7M0mdNedVqMx91BDp1b-EPHUul0Bx82IAQINamtLY8_inFxCoYQsAaFzaMkVVOsQn5Ryiqhp-1Dwry8VPzdYFBRGhYYroCmT9RbwXeSj6ikqAbfHi5a6-HQNRfIy-HeUmibWJUyGfD--JCFPQ8lP0Y7PjsnDWGBvZsdh75icobBMQCFDajQbuoqi5IIBQYec3A"),
      status: VehicleStatus.AVAILABLE,
    },
    {
      name: "Atlas Grandeur",
      slug: "atlas-grandeur",
      category: "Premium SUV",
      brand: "Atlas",
      model: "Grandeur",
      year: 2024,
      transmission: "Automatic",
      fuel_type: "Petrol",
      seat_count: 7,
      daily_rate: 210,
      mileage: 6400,
      description:
        "A commanding three-row SUV with executive-grade leather, panoramic roof, and adaptive cruise control. Built for families that travel first class.",
      thumbnail_url: image("AB6AXuCPBGjpdMxZpRZCBiWPcajTL8ChJtfzyMC3yKLUl7SGKgmBTVoA4MxlWQjXWWLxUaD4buVyE-6LmXtVzAeQqn1cPooo_yhmlCDi7EPkSEM3guJR9ZeIeHnU0vQZ_dChQAeuJd2QwFJXHIA--yPcm7p5Nm3eSXaKiQBnZKmYAkxEgYHVEqA47N4jwkLePd-2YW-gaPQwD7QGO6pWR1p95HRq96SdHW5r5JVXfru9_hPDlnCO9KTwJZAA3blNayRWyKMFHOCAyCUAc04"),
      status: VehicleStatus.BOOKED,
    },
    {
      name: "Veloce GT",
      slug: "veloce-gt",
      category: "Sports Coupe",
      brand: "Veloce",
      model: "GT",
      year: 2023,
      transmission: "Automatic",
      fuel_type: "Petrol",
      seat_count: 2,
      daily_rate: 350,
      mileage: 9800,
      description:
        "A sleek silver sports coupe with carbon-fibre accents and a hand-stitched cabin. Engineered for drivers who demand precision and presence.",
      thumbnail_url: image("AB6AXuDfq5ZK15fq0k4Fzl3vUKNhzCVCN-sKxkxzigJcOYmCRpvkqGg0t-nu8vNgwYOwB8MBgRxfOA97hhFJ8T9nHijEpr5_1OcpXPz7O16WpDQmPn7MhdBSktF7D8jzsa_b5SPISe1i5HZt6i420YY3S2qCq1Em84pG8ZnqL9o0n2xMtTBHZcwX25PcTubtoWrxTGP7CjYgQucqwYRwXxrbxYfOeEji2ppAD8fv-6F5L8H3zqZJtTD8Fiqt-sLqQwlpeyBqudg11trZ2c0"),
      status: VehicleStatus.MAINTENANCE,
    },
    {
      name: "Mercedes-Benz E-Class",
      slug: "mercedes-benz-e-class",
      category: "Luxury Sedan",
      brand: "Mercedes-Benz",
      model: "E-Class",
      year: 2024,
      transmission: "Automatic",
      fuel_type: "Petrol",
      seat_count: 5,
      daily_rate: 150,
      mileage: 5200,
      description:
        "Refined German engineering with the latest MBUX infotainment, augmented reality navigation, and a silk-smooth inline-six engine.",
      thumbnail_url: image("AB6AXuAMM6KqzAH5yCKP5XvZgzf25WlkBXWAAiFGwVeITCa7DJ7zHjYqREeIol7qK_EB5NnfXoD6bX76wDZtsOwmpJKEneXfTbZuetyx4tT93UktFKc4FbfZyWk2U7gEgJw7CQsfQId3D16vgabOadKbA_OFNk7nYsgzj3MkMO8vDUwHW5Qa2cs57Z8aexRXZr0ZmjIxBjKBoSujrJltAFHhyApoQSm3lL0LRG15nueLscbIFKv9htjA8wswW06vSVqGwoYxQDqw7iAtfjc"),
      status: VehicleStatus.AVAILABLE,
    },
    {
      name: "Tesla Model Y",
      slug: "tesla-model-y",
      category: "Electric SUV",
      brand: "Tesla",
      model: "Model Y",
      year: 2024,
      transmission: "Automatic",
      fuel_type: "Electric",
      seat_count: 5,
      daily_rate: 130,
      mileage: 7300,
      description:
        "The world's best-selling electric SUV. 330 miles of range, full self-driving capability, and a cavernous cabin with a panoramic glass roof.",
      thumbnail_url: image("AB6AXuB60GUYVrQzsZ7CKdkfpdcZIX-wG0R-1CJFlurdi-orx39-O0Ezj7Bn-3h4mDgxId9YBknC0PcXwCf_EV19IVE6KkNUYZ4RfnSaQIskBbhjJH5yJMN1bv3V9v6LSIur5cUUakq5xTHStpSyAJbIsTlQSlYeZgnAUkNKKHa55R7PDWIkUiIG6N31v6K744L9D0nNFjoUaoyM1mSYmQB4GYZPZujh4FsFfdHuJIkRQvGS8zYn6LOyb7l90u97Bk7Q5Vac_TrfD6neN1E"),
      status: VehicleStatus.AVAILABLE,
    },
    {
      name: "2024 Polestar 2",
      slug: "2024-polestar-2",
      category: "Electric",
      brand: "Polestar",
      model: "2",
      year: 2024,
      transmission: "Automatic",
      fuel_type: "Electric",
      seat_count: 5,
      daily_rate: 125,
      mileage: 2900,
      description:
        "Scandinavian minimalism meets electric performance. The Polestar 2 offers a sleek fastback silhouette, vegan interior, and 270 miles of range.",
      thumbnail_url: image("AB6AXuABWzZsQdzbeoDXvpBgfMEllugDpJI4XC_BgMakqUlKQaKDNyzfll1z1m9e10sCZPrdYrDlBiBpOCs-6ORtUIdlpA6DgNW1iauMrN-tQsqKoIADFb7jy_WWAsNiErNjyxxjiqQImdMnTBRN3a7jRavyeAAS5rWyPpCSnHeim4D7fdfPV-YOuXUR8o-p5DMcvbuBJpHSZTO2IN3CnKxeEBjheBWmZXcaamV3bI65jdRvf0RpU8aT7KtwVgui2X50Gtf9ukf_xacYl9o"),
      status: VehicleStatus.AVAILABLE,
    },
    {
      name: "BMW 7 Series",
      slug: "bmw-7-series",
      category: "Luxury Sedan",
      brand: "BMW",
      model: "7 Series",
      year: 2024,
      transmission: "Automatic",
      fuel_type: "Petrol",
      seat_count: 5,
      daily_rate: 175,
      mileage: 4100,
      description:
        "The benchmark of executive luxury. The BMW 7 Series features the Theater Screen, executive lounge rear seats, and a plug-in hybrid powertrain.",
      thumbnail_url: image("AB6AXuCPBGjpdMxZpRZCBiWPcajTL8ChJtfzyMC3yKLUl7SGKgmBTVoA4MxlWQjXWWLxUaD4buVyE-6LmXtVzAeQqn1cPooo_yhmlCDi7EPkSEM3guJR9ZeIeHnU0vQZ_dChQAeuJd2QwFJXHIA--yPcm7p5Nm3eSXaKiQBnZKmYAkxEgYHVEqA47N4jwkLePd-2YW-gaPQwD7QGO6pWR1p95HRq96SdHW5r5JVXfru9_hPDlnCO9KTwJZAA3blNayRWyKMFHOCAyCUAc04"),
      status: VehicleStatus.AVAILABLE,
    },
    {
      name: "Audi Q7",
      slug: "audi-q7",
      category: "Premium SUV",
      brand: "Audi",
      model: "Q7",
      year: 2023,
      transmission: "Automatic",
      fuel_type: "Diesel",
      seat_count: 7,
      daily_rate: 165,
      mileage: 11800,
      description:
        "Seven seats, quattro all-wheel drive, and Virtual Cockpit Plus. The Audi Q7 is the executive family hauler of choice.",
      thumbnail_url: image("AB6AXuBbRShrho6eclRZ2Zie3iwwmk6m01OA6u8GjU9v8FMuRrgAmkpn7qz3co5V4qBcangsldNbuFRw2DfpCr9SuTbWqJt5G9CNt92aDFUzFITx09YwxrZ25oHsbGGoPw4azcgbCcAdEN3UiYeeGLmpJg0ubbYecnfItyJNOkrGX29aGQUgn3u5BUEZgEbahyRWcCiMdvY9ZGMieXTAr5Z-EupPi_LshFLh5tkKdadwYn_fGZtp9p379AeShYCjI1N-vVMBIXR_uRqi61M"),
      status: VehicleStatus.AVAILABLE,
    },
    {
      name: "Porsche 911 Carrera",
      slug: "porsche-911-carrera",
      category: "Sports Coupe",
      brand: "Porsche",
      model: "911 Carrera",
      year: 2024,
      transmission: "Automatic",
      fuel_type: "Petrol",
      seat_count: 2,
      daily_rate: 420,
      mileage: 5600,
      description:
        "The icon. The Porsche 911 Carrera blends timeless silhouette with cutting-edge engineering for the definitive sports car experience.",
      thumbnail_url: image("AB6AXuDfq5ZK15fq0k4Fzl3vUKNhzCVCN-sKxkxzigJcOYmCRpvkqGg0t-nu8vNgwYOwB8MBgRxfOA97hhFJ8T9nHijEpr5_1OcpXPz7O16WpDQmPn7MhdBSktF7D8jzsa_b5SPISe1i5HZt6i420YY3S2qCq1Em84pG8ZnqL9o0n2xMtTBHZcwX25PcTubtoWrxTGP7CjYgQucqwYRwXxrbxYfOeEji2ppAD8fv-6F5L8H3zqZJtTD8Fiqt-sLqQwlpeyBqudg11trZ2c0"),
      status: VehicleStatus.AVAILABLE,
    },
    {
      name: "Volvo XC90",
      slug: "volvo-xc90",
      category: "Premium SUV",
      brand: "Volvo",
      model: "XC90",
      year: 2024,
      transmission: "Automatic",
      fuel_type: "Petrol",
      seat_count: 7,
      daily_rate: 155,
      mileage: 6900,
      description:
        "Swedish luxury with an unwavering focus on safety. The XC90 Recharge offers a serene cabin and confident all-wheel-drive poise.",
      thumbnail_url: image("AB6AXuADOqcqWF68-vjSFIadboMxYs5D9p22zk1gPWb7UcrGZDT62n_QtP4VeGa6O7NWEGWwoIaaUysU-7M0mdNedVqMx91BDp1b-EPHUul0Bx82IAQINamtLY8_inFxCoYQsAaFzaMkVVOsQn5Ryiqhp-1Dwry8VPzdYFBRGhYYroCmT9RbwXeSj6ikqAbfHi5a6-HQNRfIy-HeUmibWJUyGfD--JCFPQ8lP0Y7PjsnDWGBvZsdh75icobBMQCFDajQbuoqi5IIBQYec3A"),
      status: VehicleStatus.INACTIVE,
    },
  ];

  const vehicles = [];
  for (const v of vehiclesData) {
    const created = await prisma.vehicle.upsert({
      where: { slug: v.slug },
      update: {},
      create: v,
    });
    vehicles.push(created);
  }

  // Gallery images for the Tesla Model S / first few vehicles.
  const galleryVehicles = vehicles.slice(0, 4);
  const galleryImages = [
    "AB6AXuCgy4PDSW4pp8MaQShVbLq-yYlZS0uTlBq-BE-0BCjUfzR2rzTwup0xHhjOnwuftsgyReEX3h2QuSW1e4ZMkx1LIMvyMeg179z-VbPQSlRdrfT8lHLy9hbU9jES80PRBzOhhNKv4bfPSNSfoubZnOhKI7gmGIoxjsLbassqTa-V5P6JEHhb2nmfxCu3F-CQ0DhmCOyciAUrOLI6wfS6D5p9UzvBn8inDl7CeqQjpHVh6PLKOR0yfq5pWafMVPlqYZKMOa4ItZmYlw",
    "AB6AXuAtzjJ_z-p7JNf2J2aT_uA_nmet2QSYndj0OC4l0uLzmpYchtbcopE9ytUTG8J0NFU-cjP_5cyTkrrLZ0rxzGTbr6T9TnSnGkOurlPiJ5cDYZxSgXhh4nrFfWZ1uMplS1A1UjdGiMdQtwdBKsj9OdyZh4xpNRkI4sHfCb45Wk4OwbUQ6mtM41EOegOArNlRQlABHgFlw6ZpVxui8Ykv-nJs1HO9L2jeSsm9V59dpLKSI-6RloFoL0G8fcUwMkfcsqMew62ekg7wuok",
    "AB6AXuCFyPgrAnXsmZyzrDXgjjX5b3aYshTPHkV8EwjFeqhBTt9JuZgiNa6JBI698-UPl9DMrPNmleiyjPDD3VkJ6muKlnS3MMFR9c0hpIo9X10uvLbgWHmRYf4npJ2BHk4qtPdhZPdcTT0m0-26spEgMG9rzHDXuojvyvYiAsDe9l9_nwWG4hc6iqf6P-8pgj4rL_IuK9RUTmI4On7BTaEsIc6Le_qzTgwItAH7yzgJ4rHvESmJh7A-0FLPJdN3e_3kDIb-ZlXwd6H8bY0",
  ];
  for (const v of galleryVehicles) {
    const existing = await prisma.vehicleImage.findFirst({
      where: { vehicle_id: v.id },
    });
    if (!existing) {
      await prisma.vehicleImage.createMany({
        data: galleryImages.map((url) => ({
          vehicle_id: v.id,
          image_url: image(url),
        })),
      });
    }
  }

  // ---------- Bookings ----------
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const day = 24 * 60 * 60 * 1000;

  const bookingsToSeed: Array<{
    ref: string;
    customerId: string;
    vehicleId: string;
    pickupOffset: number;
    days: number;
    status: BookingStatus;
  }> = [
    { ref: "FF-7G2K-9A1B", customerId: customer.id, vehicleId: vehicles[6].id, pickupOffset: -2, days: 3, status: BookingStatus.CONFIRMED },
    { ref: "FF-3H8M-2K4P", customerId: customer.id, vehicleId: vehicles[7].id, pickupOffset: 5, days: 4, status: BookingStatus.PENDING },
    { ref: "FF-5R1Q-8L9X", customerId: extraCustomers[0].id, vehicleId: vehicles[1].id, pickupOffset: -10, days: 5, status: BookingStatus.COMPLETED },
    { ref: "FF-9T4V-6N2W", customerId: extraCustomers[1].id, vehicleId: vehicles[8].id, pickupOffset: -30, days: 2, status: BookingStatus.COMPLETED },
    { ref: "FF-2Y7B-1C3D", customerId: extraCustomers[0].id, vehicleId: vehicles[2].id, pickupOffset: -45, days: 7, status: BookingStatus.CANCELLED },
    { ref: "FF-6P0E-4F5G", customerId: extraCustomers[2].id, vehicleId: vehicles[9].id, pickupOffset: -60, days: 3, status: BookingStatus.COMPLETED },
    { ref: "FF-8J3H-7K2L", customerId: extraCustomers[1].id, vehicleId: vehicles[0].id, pickupOffset: -75, days: 4, status: BookingStatus.COMPLETED },
    { ref: "FF-1M6N-9O4P", customerId: customer.id, vehicleId: vehicles[3].id, pickupOffset: -90, days: 2, status: BookingStatus.COMPLETED },
  ];

  for (const b of bookingsToSeed) {
    const existing = await prisma.booking.findUnique({
      where: { booking_reference: b.ref },
    });
    if (existing) continue;

    const vehicle = vehicles.find((v) => v.id === b.vehicleId)!;
    const pickup = new Date(today.getTime() + b.pickupOffset * day);
    const ret = new Date(pickup.getTime() + b.days * day);

    await prisma.booking.create({
      data: {
        booking_reference: b.ref,
        customer_id: b.customerId,
        vehicle_id: b.vehicleId,
        pickup_date: pickup,
        return_date: ret,
        total_days: b.days,
        daily_rate: vehicle.daily_rate,
        total_amount: vehicle.daily_rate * b.days,
        status: b.status,
      },
    });
  }

  console.log("✓ Seed complete.");
  console.log("  Login as:  customer@fleetflow.com / staff@fleetflow.com / admin@fleetflow.com");
  console.log("  Password:  password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
