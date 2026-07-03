from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2AuthorizationCodeBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, selectinload
from sqlalchemy import select, update, delete
import os
import httpx
from typing import List

from .models import Base, User, Vehicle, Booking
from .schemas import VehicleCreate, VehicleRead, BookingCreate, BookingRead

app = FastAPI()

# Database config (Local or Docker‑based PostgreSQL)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@localhost:5432/fleetflow",
)
engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

# Create tables on startup
@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# OAuth2 (Google) – token verification helper
oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl=os.getenv("OAUTH_AUTHORIZE_URL", "https://accounts.google.com/o/oauth2/v2/auth"),
    tokenUrl=os.getenv("OAUTH_TOKEN_URL", "https://oauth2.googleapis.com/token"),
    scopes={"openid": "OpenID Connect", "email": "User email", "profile": "User profile"},
)

# Dependency: DB session
async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session

# Helper: Get current user from Google token or dummy token used by UI
async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> User:
    # Simple dev shortcut – allow a static dummy token for UI flow
    if token == "dummy-token":
        result = await db.execute(select(User).limit(1))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No users in DB")
        return user
    # Verify token with Google tokeninfo endpoint
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://oauth2.googleapis.com/tokeninfo",
            params={"id_token": token},
            timeout=10,
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    info = resp.json()
    sub = info.get("sub")
    email = info.get("email")
    name = info.get("name")
    result = await db.execute(select(User).where(User.google_sub == sub))
    user = result.scalar_one_or_none()
    if not user:
        user = User(
            google_sub=sub,
            email=email,
            full_name=name,
            is_admin=False,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    return user

# Health check
@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

# ----- User endpoint -----
@app.get("/api/users/me", response_model=dict)
async def read_current_user(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "is_admin": current_user.is_admin,
    }

# ----- Vehicle endpoints -----
@app.get("/api/vehicles", response_model=List[VehicleRead])
async def list_vehicles(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Vehicle))
    vehicles = result.scalars().all()
    return vehicles

@app.post("/api/vehicles", response_model=VehicleRead, status_code=status.HTTP_201_CREATED)
async def create_vehicle(vehicle: VehicleCreate, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    db_vehicle = Vehicle(**vehicle.dict())
    db.add(db_vehicle)
    await db.commit()
    await db.refresh(db_vehicle)
    return db_vehicle

@app.get("/api/vehicles/{vehicle_id}", response_model=VehicleRead)
async def get_vehicle(vehicle_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Vehicle).where(Vehicle.id == vehicle_id))
    vehicle = result.scalar_one_or_none()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle

@app.put("/api/vehicles/{vehicle_id}", response_model=VehicleRead)
async def update_vehicle(vehicle_id: int, vehicle: VehicleCreate, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    result = await db.execute(select(Vehicle).where(Vehicle.id == vehicle_id))
    db_vehicle = result.scalar_one_or_none()
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    for field, value in vehicle.dict().items():
        setattr(db_vehicle, field, value)
    await db.commit()
    await db.refresh(db_vehicle)
    return db_vehicle

@app.delete("/api/vehicles/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_vehicle(vehicle_id: int, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    result = await db.execute(select(Vehicle).where(Vehicle.id == vehicle_id))
    db_vehicle = result.scalar_one_or_none()
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    await db.delete(db_vehicle)
    await db.commit()
    return

# ----- Booking endpoints -----
@app.get("/api/bookings", response_model=List[BookingRead])
async def list_bookings(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    result = await db.execute(select(Booking).where(Booking.user_id == user.id))
    bookings = result.scalars().all()
    return bookings

@app.post("/api/bookings", response_model=BookingRead, status_code=status.HTTP_201_CREATED)
async def create_booking(booking: BookingCreate, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    # Compute total_price based on vehicle price_per_day and dates
    vehicle_res = await db.execute(select(Vehicle).where(Vehicle.id == booking.vehicle_id))
    vehicle = vehicle_res.scalar_one_or_none()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    days = (booking.end_date - booking.start_date).days + 1
    total_price = days * vehicle.price_per_day
    db_booking = Booking(
        user_id=user.id,
        vehicle_id=booking.vehicle_id,
        start_date=booking.start_date,
        end_date=booking.end_date,
        total_price=total_price,
        status="pending",
    )
    db.add(db_booking)
    await db.commit()
    await db.refresh(db_booking)
    return db_booking

@app.get("/api/bookings/{booking_id}", response_model=BookingRead)
async def get_booking(booking_id: int, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    result = await db.execute(select(Booking).where(Booking.id == booking_id, Booking.user_id == user.id))
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking

@app.put("/api/bookings/{booking_id}", response_model=BookingRead)
async def update_booking(booking_id: int, booking: BookingCreate, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    result = await db.execute(select(Booking).where(Booking.id == booking_id, Booking.user_id == user.id))
    db_booking = result.scalar_one_or_none()
    if not db_booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    # Update fields
    db_booking.vehicle_id = booking.vehicle_id
    db_booking.start_date = booking.start_date
    db_booking.end_date = booking.end_date
    # Recalculate total_price
    vehicle_res = await db.execute(select(Vehicle).where(Vehicle.id == booking.vehicle_id))
    vehicle = vehicle_res.scalar_one_or_none()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    days = (booking.end_date - booking.start_date).days + 1
    db_booking.total_price = days * vehicle.price_per_day
    await db.commit()
    await db.refresh(db_booking)
    return db_booking

@app.delete("/api/bookings/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_booking(booking_id: int, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    result = await db.execute(select(Booking).where(Booking.id == booking_id, Booking.user_id == user.id))
    db_booking = result.scalar_one_or_none()
    if not db_booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    await db.delete(db_booking)
    await db.commit()
    return
