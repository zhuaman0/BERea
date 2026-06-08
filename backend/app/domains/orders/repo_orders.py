from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.orders.model_orders import Order, OrderStatus
from app.domains.orders.schema_orders import OrderCreate


async def create(db: AsyncSession, data: OrderCreate, user_id: uuid.UUID | None = None) -> Order:
    order = Order(**data.model_dump(), user_id=user_id)
    db.add(order)
    await db.commit()
    await db.refresh(order)
    return order


async def get_by_id(db: AsyncSession, order_id: uuid.UUID) -> Order | None:
    result = await db.execute(select(Order).where(Order.id == order_id))
    return result.scalar_one_or_none()


async def get_all(db: AsyncSession, limit: int = 50, offset: int = 0) -> list[Order]:
    result = await db.execute(
        select(Order).order_by(Order.created_at.desc()).limit(limit).offset(offset)
    )
    return list(result.scalars().all())


async def update_status(db: AsyncSession, order: Order, status: OrderStatus) -> Order:
    order.status = status
    await db.commit()
    await db.refresh(order)
    return order
