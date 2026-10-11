from __future__ import annotations

import uuid

from fastapi import APIRouter, Query

from app.dependencies import CurrentUserId, DbSession
from app.domains.orders import service_orders
from app.domains.orders.schema_orders import OrderCreate, OrderOut, OrderStatusUpdate

router = APIRouter()


@router.post("", response_model=OrderOut, status_code=201)
async def place_order(data: OrderCreate, db: DbSession) -> OrderOut:
    return await service_orders.place_order(db, data)


@router.get("", response_model=list[OrderOut])
async def list_orders(
    db: DbSession,
    _: CurrentUserId,
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0, ge=0),
) -> list[OrderOut]:
    return await service_orders.list_orders(db, limit=limit, offset=offset)


@router.get("/{order_id}", response_model=OrderOut)
async def get_order(order_id: uuid.UUID, db: DbSession, _: CurrentUserId) -> OrderOut:
    return await service_orders.get_order(db, order_id)


@router.patch("/{order_id}/status", response_model=OrderOut)
async def update_status(order_id: uuid.UUID, data: OrderStatusUpdate, db: DbSession, _: CurrentUserId) -> OrderOut:
    return await service_orders.change_status(db, order_id, data)
