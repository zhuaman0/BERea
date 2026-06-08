from __future__ import annotations

import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.categories import repo_categories
from app.domains.categories.schema_categories import CategoryCreate, CategoryOut


async def list_categories(db: AsyncSession) -> list[CategoryOut]:
    categories = await repo_categories.get_all(db)
    return [CategoryOut.model_validate(c) for c in categories]


async def create_category(db: AsyncSession, data: CategoryCreate) -> CategoryOut:
    existing = await repo_categories.get_by_slug(db, data.slug)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already exists.")
    category = await repo_categories.create(db, data)
    return CategoryOut.model_validate(category)
