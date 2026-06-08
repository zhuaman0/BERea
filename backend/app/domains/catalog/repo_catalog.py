from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.catalog.model_catalog import FurnitureItem
from app.domains.catalog.schema_catalog import FurnitureItemCreate, FurnitureItemUpdate


async def get_all(
    db: AsyncSession,
    category_id: uuid.UUID | None = None,
    featured_only: bool = False,
    limit: int = 50,
    offset: int = 0,
) -> list[FurnitureItem]:
    q = select(FurnitureItem).where(FurnitureItem.is_active == True)  # noqa: E712
    if category_id:
        q = q.where(FurnitureItem.category_id == category_id)
    if featured_only:
        q = q.where(FurnitureItem.is_featured == True)  # noqa: E712
    q = q.order_by(FurnitureItem.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(q)
    return list(result.scalars().all())


async def get_by_id(db: AsyncSession, item_id: uuid.UUID) -> FurnitureItem | None:
    result = await db.execute(select(FurnitureItem).where(FurnitureItem.id == item_id))
    return result.scalar_one_or_none()


async def create(db: AsyncSession, data: FurnitureItemCreate) -> FurnitureItem:
    item = FurnitureItem(**data.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


async def update(db: AsyncSession, item: FurnitureItem, data: FurnitureItemUpdate) -> FurnitureItem:
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(item, field, value)
    await db.commit()
    await db.refresh(item)
    return item


async def delete(db: AsyncSession, item: FurnitureItem) -> None:
    await db.delete(item)
    await db.commit()
