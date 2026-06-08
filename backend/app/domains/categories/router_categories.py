from __future__ import annotations

from fastapi import APIRouter

from app.dependencies import DbSession
from app.domains.categories import service_categories
from app.domains.categories.schema_categories import CategoryCreate, CategoryOut

router = APIRouter()


@router.get("", response_model=list[CategoryOut])
async def list_categories(db: DbSession) -> list[CategoryOut]:
    return await service_categories.list_categories(db)


@router.post("", response_model=CategoryOut, status_code=201)
async def create_category(data: CategoryCreate, db: DbSession) -> CategoryOut:
    return await service_categories.create_category(db, data)
