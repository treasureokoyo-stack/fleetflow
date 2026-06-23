// src/server.js
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "fleetflow-super-secret-key-12345";
const PORT = process.env.PORT || 3000;

// Initialize Prisma
let prisma;
let useMock = false;

try {
  if (process.env.DATABASE_URL) {
    prisma = new PrismaClient();
  } else {
    useMock = true;
  }
} catch (e) {
  console.warn("Prisma failed to initialize, switching to mock in-memory DB.", e);
  useMock = true;
}

// In-Memory Database Fallback for development/offline mode
const mockDb = {
  users: [
    {
      id: "u-admin-1",
      first_name: "Admin",
      last_name: "Owner",
      email: "admin@fleetflow.com",
      phone: "+1 (555) 111-2222",
      password_hash: await bcrypt.hash("admin123", 10),
      role: "ADMIN",
      created_at: new Date()
    },
    {
      id: "u-staff-1",
      first_name: "Jane",
      last_name: "Staffer",
      email: "staff@fleetflow.com",
      phone: "+1 (555) 333-4444",
      password_hash: await bcrypt.hash("staff123", 10),
      role: "STAFF",
      created_at: new Date()
    },
    {
      id: "u-customer-1",
      first_name: "John",
      last_name: "Doe",
      email: "customer@fleetflow.com",
      phone: "+1 (555) 555-6666",
      password_hash: await bcrypt.hash("customer123", 10),
      role: "CUSTOMER",
      created_at: new Date()
    }
  ],
  vehicles: [
    {
      id: "v-tesla-s",
      name: "Tesla Model S Plaid",
      slug: "tesla-model-s-plaid",
      category: "Electric",
      brand: "Tesla",
      model: "Model S",
      year: 2023,
      transmission: "Automatic",
      fuel_type: "Electric",
      seat_count: 5,
      daily_rate: 150,
      description: "Model S Plaid has the quickest acceleration of any vehicle in production. Sub-2 second 0-60 mph. Fully electric with dual motor drive.",
      thumbnail_url: "/vehicle_placeholder.png",
      status: "AVAILABLE",
      mileage: 5000,
      created_at: new Date()
    },
    {
      id: "v-audi-q7",
      name: "Audi Q7 Executive",
      slug: "audi-q7-executive",
      category: "SUV",
      brand: "Audi",
      model: "Q7",
      year: 2022,
      transmission: "Automatic",
      fuel_type: "Petrol",
      seat_count: 7,
      daily_rate: 180,
      description: "Premium SUV seating seven, equipped with high-end safety features, beautiful ambient lighting, and panoramic sunroof.",
      thumbnail_url: "/vehicle_placeholder.png",
      status: "AVAILABLE",
      mileage: 12000,
      created_at: new Date()
    },
    {
      id: "v-bmw-5",
      name: "BMW 5 Series",
      slug: "bmw-5-series",
      category: "Luxury",
      brand: "BMW",
      model: "5 Series",
      year: 2021,
      transmission: "Automatic",
      fuel_type: "Hybrid",
      seat_count: 5,
      daily_rate: 120,
      description: "Sophistication meets driver performance. Excellent handling, clean hybrid fuel economy, and plush premium leather upholstery.",
      thumbnail_url: "/vehicle_placeholder.png",
      status: "AVAILABLE",
      mileage: 18000,
      created_at: new Date()
    }
  ],
  bookings: [
    {
      id: "b-1",
      booking_reference: "FF-183920",
      customer_id: "u-customer-1",
      vehicle_id: "v-tesla-s",
      pickup_date: new Date(Date.now() + 86400000), // tomorrow
      return_date: new Date(Date.now() + 86400000 * 4), // 4 days later
      total_days: 3,
      daily_rate: 150,
      total_amount: 450,
      status: "CONFIRMED",
      created_at: new Date()
    }
  ]
};

// Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Access token required" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid or expired token" });
    req.user = user;
    next();
  });
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission to access this page." });
    }
    next();
  };
}

// ─── AUTH ENDPOINTS ───

// Register User
app.post("/api/auth/register", async (req, res) => {
  const { first_name, last_name, email, phone, password } = req.body;

  if (!first_name || !last_name || !email || !phone || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters" });
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);

    if (useMock) {
      const exists = mockDb.users.some(u => u.email === email);
      if (exists) return res.status(400).json({ message: "Email is already registered" });

      const newUser = {
        id: "u-" + Math.random().toString(36).substring(2, 9),
        first_name,
        last_name,
        email,
        phone,
        password_hash,
        role: "CUSTOMER",
        created_at: new Date()
      };
      mockDb.users.push(newUser);

      const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: "7d" });
      const { password_hash: _, ...userNoPass } = newUser;
      return res.json({ token, user: userNoPass });
    } else {
      const exists = await prisma.user.findUnique({ where: { email } });
      if (exists) return res.status(400).json({ message: "Email is already registered" });

      const newUser = await prisma.user.create({
        data: { first_name, last_name, email, phone, password_hash, role: "CUSTOMER" }
      });

      const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: "7d" });
      const { password_hash: _, ...userNoPass } = newUser;
      return res.json({ token, user: userNoPass });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login User
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    let user;
    if (useMock) {
      user = mockDb.users.find(u => u.email === email);
    } else {
      user = await prisma.user.findUnique({ where: { email } });
    }

    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    const { password_hash: _, ...userNoPass } = user;
    res.json({ token, user: userNoPass });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Profile
app.put("/api/users/profile", authenticateToken, async (req, res) => {
  const { first_name, last_name, phone } = req.body;

  try {
    if (useMock) {
      const idx = mockDb.users.findIndex(u => u.id === req.user.id);
      if (idx === -1) return res.status(404).json({ message: "User not found" });

      mockDb.users[idx].first_name = first_name || mockDb.users[idx].first_name;
      mockDb.users[idx].last_name = last_name || mockDb.users[idx].last_name;
      mockDb.users[idx].phone = phone || mockDb.users[idx].phone;

      const { password_hash: _, ...userNoPass } = mockDb.users[idx];
      return res.json(userNoPass);
    } else {
      const updated = await prisma.user.update({
        where: { id: req.user.id },
        data: { first_name, last_name, phone }
      });
      const { password_hash: _, ...userNoPass } = updated;
      return res.json(userNoPass);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get customer total spending
app.get("/api/users/spending", authenticateToken, async (req, res) => {
  try {
    let bookings = [];
    if (useMock) {
      bookings = mockDb.bookings.filter(b => b.customer_id === req.user.id);
    } else {
      bookings = await prisma.booking.findMany({ where: { customer_id: req.user.id } });
    }

    const totalSpending = bookings.reduce((sum, b) => {
      if (b.status === "COMPLETED" || b.status === "CONFIRMED") {
        return sum + b.total_amount;
      }
      return sum;
    }, 0);

    res.json({ totalSpending });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Customers List (Staff/Admin only)
app.get("/api/users/customers", authenticateToken, requireRole(["STAFF", "ADMIN"]), async (req, res) => {
  try {
    if (useMock) {
      const customers = mockDb.users.filter(u => u.role === "CUSTOMER").map(c => {
        const bookings = mockDb.bookings.filter(b => b.customer_id === c.id);
        return { ...c, bookings };
      });
      return res.json(customers);
    } else {
      const customers = await prisma.user.findMany({
        where: { role: "CUSTOMER" },
        include: { bookings: true }
      });
      return res.json(customers);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── VEHICLES ENDPOINTS ───

// Get all vehicles
app.get("/api/vehicles", async (req, res) => {
  try {
    if (useMock) {
      return res.json(mockDb.vehicles);
    } else {
      const list = await prisma.vehicle.findMany({ include: { images: true } });
      return res.json(list);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single vehicle
app.get("/api/vehicles/:id", async (req, res) => {
  try {
    if (useMock) {
      const v = mockDb.vehicles.find(x => x.id === req.params.id);
      if (!v) return res.status(404).json({ message: "Vehicle deleted." });
      return res.json(v);
    } else {
      const v = await prisma.vehicle.findUnique({
        where: { id: req.params.id },
        include: { images: true }
      });
      if (!v) return res.status(404).json({ message: "Vehicle deleted." });
      return res.json(v);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create vehicle (Admin only)
app.post("/api/vehicles", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
  const { name, brand, model, year, category, transmission, fuel_type, seat_count, daily_rate, description, thumbnail_url, status, mileage } = req.body;

  if (!name || !brand || !model || !year || !category || !transmission || !seat_count || !daily_rate || !description || !thumbnail_url) {
    return res.status(400).json({ message: "All vehicle details are required." });
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  try {
    if (useMock) {
      const newV = {
        id: "v-" + Math.random().toString(36).substring(2, 9),
        name, slug, brand, model, year: parseInt(year), category, transmission,
        fuel_type: fuel_type || "Electric", seat_count: parseInt(seat_count),
        daily_rate: parseFloat(daily_rate), description, thumbnail_url,
        status: status || "AVAILABLE", mileage: parseInt(mileage || 0), created_at: new Date()
      };
      mockDb.vehicles.push(newV);
      return res.json(newV);
    } else {
      const newV = await prisma.vehicle.create({
        data: {
          name, slug, brand, model, year: parseInt(year), category, transmission,
          fuel_type: fuel_type || "Electric", seat_count: parseInt(seat_count),
          daily_rate: parseFloat(daily_rate), description, thumbnail_url,
          status: status || "AVAILABLE", mileage: parseInt(mileage || 0)
        }
      });
      return res.json(newV);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update vehicle (Admin only)
app.put("/api/vehicles/:id", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
  try {
    if (useMock) {
      const idx = mockDb.vehicles.findIndex(x => x.id === req.params.id);
      if (idx === -1) return res.status(404).json({ message: "Vehicle not found" });

      mockDb.vehicles[idx] = { ...mockDb.vehicles[idx], ...req.body };
      return res.json(mockDb.vehicles[idx]);
    } else {
      const updated = await prisma.vehicle.update({
        where: { id: req.params.id },
        data: req.body
      });
      return res.json(updated);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete vehicle (Admin only)
app.delete("/api/vehicles/:id", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
  try {
    if (useMock) {
      const idx = mockDb.vehicles.findIndex(x => x.id === req.params.id);
      if (idx === -1) return res.status(404).json({ message: "Vehicle not found" });
      
      mockDb.vehicles.splice(idx, 1);
      return res.json({ success: true });
    } else {
      await prisma.vehicle.delete({ where: { id: req.params.id } });
      return res.json({ success: true });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── BOOKINGS ENDPOINTS ───

// Get all bookings (Staff/Admin only)
app.get("/api/bookings", authenticateToken, requireRole(["STAFF", "ADMIN"]), async (req, res) => {
  try {
    if (useMock) {
      const bookingsWithInfo = mockDb.bookings.map(b => {
        const customer = mockDb.users.find(u => u.id === b.customer_id) || {};
        const vehicle = mockDb.vehicles.find(v => v.id === b.vehicle_id) || {};
        return { ...b, customer, vehicle };
      });
      return res.json(bookingsWithInfo);
    } else {
      const bookings = await prisma.booking.findMany({
        include: { customer: true, vehicle: true }
      });
      return res.json(bookings);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my bookings (Customer only)
app.get("/api/bookings/my-bookings", authenticateToken, async (req, res) => {
  try {
    if (useMock) {
      const list = mockDb.bookings
        .filter(b => b.customer_id === req.user.id)
        .map(b => {
          const vehicle = mockDb.vehicles.find(v => v.id === b.vehicle_id) || {};
          return { ...b, vehicle };
        });
      return res.json(list);
    } else {
      const list = await prisma.booking.findMany({
        where: { customer_id: req.user.id },
        include: { vehicle: true }
      });
      return res.json(list);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create booking
app.post("/api/bookings", authenticateToken, async (req, res) => {
  const { vehicle_id, pickup_date, return_date } = req.body;

  if (!vehicle_id || !pickup_date || !return_date) {
    return res.status(400).json({ message: "Booking dates and vehicle are required." });
  }

  const requestedPickup = new Date(pickup_date);
  const requestedReturn = new Date(return_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (requestedPickup < today) {
    return res.status(400).json({ message: "Pickup date cannot be in the past" });
  }

  if (requestedReturn <= requestedPickup) {
    return res.status(400).json({ message: "Return date must be after pickup date" });
  }

  const diffTime = requestedReturn.getTime() - requestedPickup.getTime();
  const total_days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (total_days < 1 || total_days > 60) {
    return res.status(400).json({ message: "Rental must be between 1 and 60 days." });
  }

  try {
    let vehicle;
    if (useMock) {
      vehicle = mockDb.vehicles.find(v => v.id === vehicle_id);
    } else {
      vehicle = await prisma.vehicle.findUnique({ where: { id: vehicle_id } });
    }

    if (!vehicle) return res.status(404).json({ message: "Vehicle not found." });

    // Check for overlaps
    // requested_pickup <= existing_return AND requested_return >= existing_pickup
    let overlaps = [];
    if (useMock) {
      overlaps = mockDb.bookings.filter(b => {
        if (b.vehicle_id !== vehicle_id) return false;
        if (b.status === "CANCELLED") return false;
        const existPickup = new Date(b.pickup_date);
        const existReturn = new Date(b.return_date);
        return requestedPickup <= existReturn && requestedReturn >= existPickup;
      });
    } else {
      overlaps = await prisma.booking.findMany({
        where: {
          vehicle_id,
          status: { not: "CANCELLED" },
          pickup_date: { lte: requestedReturn },
          return_date: { gte: requestedPickup }
        }
      });
    }

    if (overlaps.length > 0) {
      return res.status(400).json({ message: "This vehicle is unavailable for the selected dates." });
    }

    const total_amount = vehicle.daily_rate * total_days;
    const booking_reference = "FF-" + Math.floor(100000 + Math.random() * 900000);

    if (useMock) {
      const newB = {
        id: "b-" + Math.random().toString(36).substring(2, 9),
        booking_reference,
        customer_id: req.user.id,
        vehicle_id,
        pickup_date: requestedPickup,
        return_date: requestedReturn,
        total_days,
        daily_rate: vehicle.daily_rate,
        total_amount,
        status: "PENDING",
        created_at: new Date()
      };
      mockDb.bookings.push(newB);
      return res.json(newB);
    } else {
      const newB = await prisma.booking.create({
        data: {
          booking_reference,
          customer_id: req.user.id,
          vehicle_id,
          pickup_date: requestedPickup,
          return_date: requestedReturn,
          total_days,
          daily_rate: vehicle.daily_rate,
          total_amount,
          status: "PENDING"
        }
      });
      return res.json(newB);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Booking Status
app.put("/api/bookings/:id/status", authenticateToken, async (req, res) => {
  const { status } = req.body;

  if (!status) return res.status(400).json({ message: "Status is required" });

  try {
    let booking;
    if (useMock) {
      booking = mockDb.bookings.find(b => b.id === req.params.id);
    } else {
      booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    }

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Restrict cancellation to owning customer unless Staff/Admin
    if (status === "CANCELLED" && req.user.role === "CUSTOMER" && booking.customer_id !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized override action." });
    }

    if (req.user.role === "CUSTOMER" && status !== "CANCELLED") {
      return res.status(403).json({ message: "Customers can only cancel bookings." });
    }

    if (useMock) {
      const idx = mockDb.bookings.findIndex(b => b.id === req.params.id);
      mockDb.bookings[idx].status = status;
      return res.json(mockDb.bookings[idx]);
    } else {
      const updated = await prisma.booking.update({
        where: { id: req.params.id },
        data: { status }
      });
      return res.json(updated);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── ADMIN METRICS ENDPOINTS ───

app.get("/api/admin/metrics", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
  try {
    let revenue = 0;
    let bookingsCount = 0;
    let customersCount = 0;
    let vehiclesCount = 0;
    let vehiclesByStatus = { AVAILABLE: 0, BOOKED: 0, MAINTENANCE: 0, INACTIVE: 0 };
    let bookingsByMonth = { "June": 0, "July": 0, "August": 0 };

    if (useMock) {
      revenue = mockDb.bookings.reduce((sum, b) => {
        if (b.status === "COMPLETED" || b.status === "CONFIRMED") return sum + b.total_amount;
        return sum;
      }, 0);
      bookingsCount = mockDb.bookings.length;
      customersCount = mockDb.users.filter(u => u.role === "CUSTOMER").length;
      vehiclesCount = mockDb.vehicles.length;

      mockDb.vehicles.forEach(v => {
        if (vehiclesByStatus[v.status] !== undefined) {
          vehiclesByStatus[v.status]++;
        }
      });

      mockDb.bookings.forEach(b => {
        const month = new Date(b.pickup_date).toLocaleString("default", { month: "long" });
        if (bookingsByMonth[month] !== undefined) {
          bookingsByMonth[month]++;
        } else {
          bookingsByMonth[month] = 1;
        }
      });
    } else {
      const agg = await prisma.booking.aggregate({
        _sum: { total_amount: true },
        where: { status: { in: ["COMPLETED", "CONFIRMED"] } }
      });
      revenue = agg._sum.total_amount || 0;
      bookingsCount = await prisma.booking.count();
      customersCount = await prisma.user.count({ where: { role: "CUSTOMER" } });
      vehiclesCount = await prisma.vehicle.count();

      const vehicles = await prisma.vehicle.findMany();
      vehicles.forEach(v => {
        if (vehiclesByStatus[v.status] !== undefined) {
          vehiclesByStatus[v.status]++;
        }
      });

      const bookings = await prisma.booking.findMany();
      bookings.forEach(b => {
        const month = new Date(b.pickup_date).toLocaleString("default", { month: "long" });
        if (bookingsByMonth[month] !== undefined) {
          bookingsByMonth[month]++;
        } else {
          bookingsByMonth[month] = 1;
        }
      });
    }

    res.json({
      totalRevenue: revenue,
      totalBookings: bookingsCount,
      totalCustomers: customersCount,
      totalVehicles: vehiclesCount,
      vehiclesByStatus,
      bookingsByMonth
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Staff members (Admin only)
app.get("/api/admin/staff", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
  try {
    if (useMock) {
      const staff = mockDb.users.filter(u => u.role === "STAFF" || u.role === "ADMIN");
      return res.json(staff);
    } else {
      const staff = await prisma.user.findMany({
        where: { role: { in: ["STAFF", "ADMIN"] } }
      });
      return res.json(staff);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create Staff User (Admin only)
app.post("/api/admin/staff", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
  const { first_name, last_name, email, phone, password, role } = req.body;

  if (!first_name || !last_name || !email || !phone || !password || !role) {
    return res.status(400).json({ message: "All staff registration fields are required." });
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);

    if (useMock) {
      const exists = mockDb.users.some(u => u.email === email);
      if (exists) return res.status(400).json({ message: "Email is already registered." });

      const newS = {
        id: "u-" + Math.random().toString(36).substring(2, 9),
        first_name, last_name, email, phone, password_hash, role, created_at: new Date()
      };
      mockDb.users.push(newS);
      return res.json(newS);
    } else {
      const exists = await prisma.user.findUnique({ where: { email } });
      if (exists) return res.status(400).json({ message: "Email is already registered." });

      const newS = await prisma.user.create({
        data: { first_name, last_name, email, phone, password_hash, role }
      });
      return res.json(newS);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete Staff Member (Admin only)
app.delete("/api/admin/staff/:id", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
  try {
    if (useMock) {
      const idx = mockDb.users.findIndex(u => u.id === req.params.id);
      if (idx === -1) return res.status(404).json({ message: "Staff member not found" });
      mockDb.users.splice(idx, 1);
      return res.json({ success: true });
    } else {
      await prisma.user.delete({ where: { id: req.params.id } });
      return res.json({ success: true });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
