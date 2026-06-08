from __future__ import annotations

import uuid
from decimal import Decimal
from datetime import datetime

from pydantic import BaseModel, EmailStr

from app.domains.orders.model_orders import OrderStatus


class OrderCreate(BaseModel):
    customer_name: str
    customer_phone: str
    customer_email: EmailStr | None = None
    note: str | None = None
    saved_design_id: uuid.UUID | None = None


class OrderOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID | None
    customer_name: str
    customer_phone: str
    customer_email: str | None
    status: OrderStatus
    note: str | None
    total_price: Decimal | None
    saved_design_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class OrderStatusUpdate(BaseModel):
    status: OrderStatus
