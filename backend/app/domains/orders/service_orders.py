from __future__ import annotations

import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.orders import repo_orders
from app.domains.orders.schema_orders import OrderCreate, OrderOut, OrderStatusUpdate
from app.domains.orders.model_orders import OrderStatus


async def place_order(db: AsyncSession, data: OrderCreate, user_id: uuid.UUID | None = None) -> OrderOut:
    order = await repo_orders.create(db, data, user_id=user_id)
    return OrderOut.model_validate(order)


async def get_order(db: AsyncSession, order_id: uuid.UUID) -> OrderOut:
    order = await repo_orders.get_by_id(db, order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")
    return OrderOut.model_validate(order)


async def list_orders(db: AsyncSession, limit: int = 50, offset: int = 0) -> list[OrderOut]:
    orders = await repo_orders.get_all(db, limit=limit, offset=offset)
    return [OrderOut.model_validate(o) for o in orders]


async def change_status(db: AsyncSession, order_id: uuid.UUID, data: OrderStatusUpdate) -> OrderOut:
    order = await repo_orders.get_by_id(db, order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")
    updated = await repo_orders.update_status(db, order, data.status)
    return OrderOut.model_validate(updated)
