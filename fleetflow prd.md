# BUILD-READY PRODUCT SPECIFICATION
# Car Rental & Fleet Management System (Phase 1 MVP)

Version: 1.0

Purpose:
This document defines all business rules, user flows, database structures, permissions, validations, and UI requirements required to build the MVP without assumptions.

The system must be production-ready and deployable to Vercel.

No feature outside this document should be invented by the builder.

---

# 1. TECHNICAL STACK

## Frontend
- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Shadcn UI

## Backend
- Next.js Server Actions
- Route Handlers

## Database
- PostgreSQL

## ORM
- Prisma

## Authentication
- NextAuth/Auth.js Credentials Authentication

## Storage
- Cloudinary

## Hosting
- Vercel

---

# 2. USER ROLES

## CUSTOMER

Permissions:
- Register account
- Login
- Browse vehicles
- View vehicle details
- Create bookings
- View own bookings
- Cancel own bookings

Restrictions:
- Cannot access admin dashboard
- Cannot access reports
- Cannot manage vehicles
- Cannot view other customers

## STAFF

Permissions:
- Access dashboard
- View all bookings
- Update booking status
- View customer information
- Search customers

Restrictions:
- Cannot create vehicles
- Cannot delete vehicles
- Cannot access system settings

## ADMIN

Permissions:
- Full access
- Manage vehicles
- Manage bookings
- View reports
- View customers
- Manage staff users

---

# 3. SYSTEM ROUTES

## PUBLIC ROUTES

- `/`
- `/vehicles`
- `/vehicles/[id]`
- `/login`
- `/register`

## CUSTOMER ROUTES

- `/dashboard`
- `/dashboard/bookings`
- `/dashboard/profile`

## STAFF ROUTES

- `/staff`
- `/staff/bookings`
- `/staff/customers`

## ADMIN ROUTES

- `/admin`
- `/admin/vehicles`
- `/admin/vehicles/new`
- `/admin/bookings`
- `/admin/customers`
- `/admin/reports`

---

# 4. DATABASE DESIGN

## users

- id (uuid)
- first_name
- last_name
- email (unique)
- phone
- password_hash
- role
- created_at
- updated_at

## vehicles

- id (uuid)
- name
- slug
- category
- brand
- model
- year
- transmission
- fuel_type
- seat_count
- daily_rate
- description
- thumbnail_url
- status
- mileage
- created_at
- updated_at

## vehicle_images

- id
- vehicle_id
- image_url

## bookings

- id
- booking_reference
- customer_id
- vehicle_id
- pickup_date
- return_date
- total_days
- daily_rate
- total_amount
- status
- created_at
- updated_at

### Booking Status Enum
- PENDING
- CONFIRMED
- CANCELLED
- COMPLETED

### Vehicle Status Enum
- AVAILABLE
- BOOKED
- MAINTENANCE
- INACTIVE

---

# 5. LANDING PAGE

Sections:
1. Navigation
2. Hero Section
3. Featured Vehicles
4. Why Choose Us
5. Footer

---

# 6. VEHICLE CATALOGUE

Display:
- Vehicle Image
- Vehicle Name
- Category
- Daily Price
- Availability Status
- View Details Button

Filters:
- Category
- Transmission
- Minimum Price
- Maximum Price
- Availability

Pagination:
- 12 vehicles per page

---

# 7. VEHICLE DETAILS PAGE

Display:
- Gallery
- Vehicle Information
- Price
- Features
- Availability

Booking Widget:
- Pickup Date
- Return Date
- Book Vehicle Button

---

# 8. BOOKING ENGINE

Core Rule:
A vehicle cannot be booked twice for overlapping dates.

Validation Rule:

For every booking request:

requested_pickup <= existing_return

AND

requested_return >= existing_pickup

If true:

Reject booking.

Date Rules:
- Pickup date cannot be in the past
- Return date must be after pickup date
- Minimum rental: 1 day
- Maximum rental: 60 days

---

# 9. BOOKING WORKFLOW

1. Customer selects vehicle
2. Customer chooses pickup date
3. Customer chooses return date
4. System calculates total
5. Customer submits booking
6. Booking created with PENDING status
7. Staff reviews booking
8. Staff CONFIRMS or CANCELS booking

---

# 10. BOOKING CALCULATION

Formula:

total_amount = daily_rate × total_days

Taxes ignored for MVP.

Promo codes excluded from MVP.

---

# 11. CUSTOMER DASHBOARD

Metrics:
- Total Bookings
- Active Bookings
- Completed Bookings
- Cancelled Bookings

Booking Table:
- Booking Reference
- Vehicle
- Dates
- Status
- Amount

---

# 12. VEHICLE MANAGEMENT

Admin Only

Actions:
- Create Vehicle
- Edit Vehicle
- Deactivate Vehicle
- Delete Vehicle

Required Fields:
- Vehicle Name
- Category
- Brand
- Model
- Year
- Transmission
- Seat Count
- Daily Rate
- Description
- Minimum One Image

---

# 13. CUSTOMER MANAGEMENT

Staff + Admin

Features:
- View Customer
- Search Customer
- Filter Customer
- View Booking History

Customer Profile:
- Name
- Email
- Phone
- Booking Count
- Total Spending

---

# 14. REPORTING

Dashboard Cards:
- Total Revenue
- Total Bookings
- Total Customers
- Total Vehicles

Charts:
- Monthly Revenue
- Bookings By Month
- Vehicles By Status

---

# 15. ROLE SECURITY

- Unauthenticated users are redirected to login
- Customers cannot access staff/admin routes
- Staff cannot access admin routes
- Unauthorized access returns 403

---

# 16. FORM VALIDATION

- Valid email required
- Password minimum 8 characters
- Phone required
- Vehicle name required
- Daily rate must be greater than zero
- Booking dates required

---

# 17. EMPTY STATES

- No vehicles available
- No bookings found
- No customers found

---

# 18. ERROR STATES

Booking Conflict:
"This vehicle is unavailable for the selected dates."

Unauthorized:
"You do not have permission to access this page."

Vehicle Deleted:
"This vehicle no longer exists."

---

# 19. DEPLOYMENT REQUIREMENTS

- Deploy successfully to Vercel
- Environment variables documented
- Production database connected
- Responsive on desktop, tablet, and mobile

---

# 20. MVP COMPLETION CRITERIA

The MVP is complete only when:

- Authentication works
- Role permissions work
- Vehicle CRUD works
- Vehicle catalogue works
- Vehicle details page works
- Booking engine prevents double bookings
- Customer dashboard works
- Staff booking management works
- Customer management works
- Reporting dashboard works
- Application deploys successfully
