from __future__ import annotations

import secrets
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.configurator.model_configurator import SavedDesign
from app.domains.configurator.schema_configurator import SavedDesignCreate, SavedDesignUpdate


async def create(db: AsyncSession, data: SavedDesignCreate, user_id: uuid.UUID) -> SavedDesign:
    design = SavedDesign(**data.model_dump(), user_id=user_id)
    db.add(design)
    await db.commit()
    await db.refresh(design)
    return design


async def get_by_id(db: AsyncSession, design_id: uuid.UUID) -> SavedDesign | None:
    result = await db.execute(select(SavedDesign).where(SavedDesign.id == design_id))
    return result.scalar_one_or_none()


async def get_by_share_token(db: AsyncSession, token: str) -> SavedDesign | None:
    result = await db.execute(select(SavedDesign).where(SavedDesign.share_token == token))
    return result.scalar_one_or_none()


async def get_user_designs(db: AsyncSession, user_id: uuid.UUID) -> list[SavedDesign]:
    result = await db.execute(
        select(SavedDesign)
        .where(SavedDesign.user_id == user_id)
        .order_by(SavedDesign.updated_at.desc())
    )
    return list(result.scalars().all())


async def update(db: AsyncSession, design: SavedDesign, data: SavedDesignUpdate) -> SavedDesign:
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(design, field, value)
    await db.commit()
    await db.refresh(design)
    return design


async def generate_share_token(db: AsyncSession, design: SavedDesign) -> SavedDesign:
    design.share_token = secrets.token_urlsafe(32)
    design.is_public = True
    await db.commit()
    await db.refresh(design)
    return design


async def delete(db: AsyncSession, design: SavedDesign) -> None:
    await db.delete(design)
    await db.commit()
