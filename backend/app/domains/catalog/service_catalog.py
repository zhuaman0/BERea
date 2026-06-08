from __future__ import annotations

import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.catalog import repo_catalog
from app.domains.catalog.schema_catalog import FurnitureItemCreate, FurnitureItemOut, FurnitureItemUpdate


async def list_items(
    db: AsyncSession,
    category_id: uuid.UUID | None = None,
    featured_only: bool = False,
    limit: int = 50,
    offset: int = 0,
) -> list[FurnitureItemOut]:
    items = await repo_catalog.get_all(db, category_id=category_id, featured_only=featured_only, limit=limit, offset=offset)
    return [FurnitureItemOut.model_validate(i) for i in items]


async def get_item(db: AsyncSession, item_id: uuid.UUID) -> FurnitureItemOut:
    item = await repo_catalog.get_by_id(db, item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Furniture item not found.")
    return FurnitureItemOut.model_validate(item)


async def create_item(db: AsyncSession, data: FurnitureItemCreate) -> FurnitureItemOut:
    item = await repo_catalog.create(db, data)
    return FurnitureItemOut.model_validate(item)


async def update_item(db: AsyncSession, item_id: uuid.UUID, data: FurnitureItemUpdate) -> FurnitureItemOut:
    item = await repo_catalog.get_by_id(db, item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Furniture item not found.")
    updated = await repo_catalog.update(db, item, data)
    return FurnitureItemOut.model_validate(updated)


async def delete_item(db: AsyncSession, item_id: uuid.UUID) -> None:
    item = await repo_catalog.get_by_id(db, item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Furniture item not found.")
    await repo_catalog.delete(db, item)
