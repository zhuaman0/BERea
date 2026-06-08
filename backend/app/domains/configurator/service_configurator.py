from __future__ import annotations

import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.configurator import repo_configurator
from app.domains.configurator.schema_configurator import SavedDesignCreate, SavedDesignOut, SavedDesignUpdate


async def create_design(db: AsyncSession, data: SavedDesignCreate, user_id: uuid.UUID) -> SavedDesignOut:
    design = await repo_configurator.create(db, data, user_id=user_id)
    return SavedDesignOut.model_validate(design)


async def get_design(db: AsyncSession, design_id: uuid.UUID, user_id: uuid.UUID) -> SavedDesignOut:
    design = await repo_configurator.get_by_id(db, design_id)
    if not design:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Design not found.")
    if design.user_id != user_id and not design.is_public:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
    return SavedDesignOut.model_validate(design)


async def get_shared_design(db: AsyncSession, token: str) -> SavedDesignOut:
    design = await repo_configurator.get_by_share_token(db, token)
    if not design or not design.is_public:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Design not found.")
    return SavedDesignOut.model_validate(design)


async def list_user_designs(db: AsyncSession, user_id: uuid.UUID) -> list[SavedDesignOut]:
    designs = await repo_configurator.get_user_designs(db, user_id)
    return [SavedDesignOut.model_validate(d) for d in designs]


async def update_design(db: AsyncSession, design_id: uuid.UUID, data: SavedDesignUpdate, user_id: uuid.UUID) -> SavedDesignOut:
    design = await repo_configurator.get_by_id(db, design_id)
    if not design:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Design not found.")
    if design.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
    updated = await repo_configurator.update(db, design, data)
    return SavedDesignOut.model_validate(updated)


async def share_design(db: AsyncSession, design_id: uuid.UUID, user_id: uuid.UUID) -> SavedDesignOut:
    design = await repo_configurator.get_by_id(db, design_id)
    if not design:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Design not found.")
    if design.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
    updated = await repo_configurator.generate_share_token(db, design)
    return SavedDesignOut.model_validate(updated)


async def delete_design(db: AsyncSession, design_id: uuid.UUID, user_id: uuid.UUID) -> None:
    design = await repo_configurator.get_by_id(db, design_id)
    if not design:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Design not found.")
    if design.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
    await repo_configurator.delete(db, design)
