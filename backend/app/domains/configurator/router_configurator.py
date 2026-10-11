from __future__ import annotations

import uuid

from fastapi import APIRouter

from app.dependencies import CurrentUserId, DbSession
from app.domains.configurator import service_configurator
from app.domains.configurator.schema_configurator import SavedDesignCreate, SavedDesignOut, SavedDesignUpdate

router = APIRouter()


@router.get("/my", response_model=list[SavedDesignOut])
async def my_designs(db: DbSession, user_id: CurrentUserId) -> list[SavedDesignOut]:
    return await service_configurator.list_user_designs(db, uuid.UUID(user_id))


@router.post("", response_model=SavedDesignOut, status_code=201)
async def create_design(data: SavedDesignCreate, db: DbSession, user_id: CurrentUserId) -> SavedDesignOut:
    return await service_configurator.create_design(db, data, uuid.UUID(user_id))


@router.get("/shared/{token}", response_model=SavedDesignOut)
async def get_shared(token: str, db: DbSession) -> SavedDesignOut:
    return await service_configurator.get_shared_design(db, token)


@router.get("/{design_id}", response_model=SavedDesignOut)
async def get_design(design_id: uuid.UUID, db: DbSession, user_id: CurrentUserId) -> SavedDesignOut:
    return await service_configurator.get_design(db, design_id, uuid.UUID(user_id))


@router.patch("/{design_id}", response_model=SavedDesignOut)
async def update_design(design_id: uuid.UUID, data: SavedDesignUpdate, db: DbSession, user_id: CurrentUserId) -> SavedDesignOut:
    return await service_configurator.update_design(db, design_id, data, uuid.UUID(user_id))


@router.post("/{design_id}/share", response_model=SavedDesignOut)
async def share_design(design_id: uuid.UUID, db: DbSession, user_id: CurrentUserId) -> SavedDesignOut:
    return await service_configurator.share_design(db, design_id, uuid.UUID(user_id))


@router.delete("/{design_id}", status_code=204)
async def delete_design(design_id: uuid.UUID, db: DbSession, user_id: CurrentUserId) -> None:
    await service_configurator.delete_design(db, design_id, uuid.UUID(user_id))
