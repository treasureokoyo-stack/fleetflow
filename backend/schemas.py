from pydantic import BaseModel, Field
from typing import Optional, List
import datetime

class VehicleBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    price_per_day: float
    image_url: Optional[str] = None
    available: bool = True

class VehicleCreate(VehicleBase):
    pass

class VehicleRead(VehicleBase):
    id: int

    class Config:
        orm_mode = True

class BookingBase(BaseModel):
    vehicle_id: int
    start_date: datetime.datetime
    end_date: datetime.datetime

class BookingCreate(BookingBase):
    pass

class BookingRead(BookingBase):
    id: int
    user_id: int
    total_price: float
    status: str
    created_at: datetime.datetime

    class Config:
        orm_mode = True
