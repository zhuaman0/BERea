from __future__ import annotations

import uuid

from fastapi import APIRouter, Query

from app.dependencies import DbSession
from app.domains.catalog import service_catalog
from app.domains.catalog.schema_catalog import FurnitureItemCreate, FurnitureItemOut, FurnitureItemUpdate

router = APIRouter()


@router.get("", response_model=list[FurnitureItemOut])
async def list_items(
    db: DbSession,
    category_id: uuid.UUID | None = Query(default=None),
    featured: bool = Query(default=False),
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0, ge=0),
) -> list[FurnitureItemOut]:
    return await service_catalog.list_items(db, category_id=category_id, featured_only=featured, limit=limit, offset=offset)


@router.get("/{item_id}", response_model=FurnitureItemOut)
async def get_item(item_id: uuid.UUID, db: DbSession) -> FurnitureItemOut:
    return await service_catalog.get_item(db, item_id)


@router.post("", response_model=FurnitureItemOut, status_code=201)
async def create_item(data: FurnitureItemCreate, db: DbSession) -> FurnitureItemOut:
    return await service_catalog.create_item(db, data)


@router.patch("/{item_id}", response_model=FurnitureItemOut)
async def update_item(item_id: uuid.UUID, data: FurnitureItemUpdate, db: DbSession) -> FurnitureItemOut:
    return await service_catalog.update_item(db, item_id, data)


@router.delete("/{item_id}", status_code=204)
async def delete_item(item_id: uuid.UUID, db: DbSession) -> None:
    await service_catalog.delete_item(db, item_id)
