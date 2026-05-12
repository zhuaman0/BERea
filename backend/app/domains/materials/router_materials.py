from __future__ import annotations

import uuid

from fastapi import APIRouter

from app.dependencies import CurrentUserId, DbSession
from app.domains.materials.schema_materials import (
    FlashcardCreate,
    FlashcardResponse,
    MaterialCreate,
    MaterialResponse,
    MaterialUpdate,
    TestQuestionCreate,
    TestQuestionResponse,
)

router = APIRouter()


@router.post("/", response_model=MaterialResponse, status_code=201)
async def create_material(payload: MaterialCreate, user_id: CurrentUserId, db: DbSession) -> MaterialResponse:
    from app.domains.materials.service_materials import create_material

    return await create_material(user_id, payload, db)


@router.get("/", response_model=list[MaterialResponse])
async def list_materials(user_id: CurrentUserId, db: DbSession) -> list[MaterialResponse]:
    from app.domains.materials.service_materials import list_user_materials

    return await list_user_materials(user_id, db)


@router.get("/{material_id}", response_model=MaterialResponse)
async def get_material(material_id: uuid.UUID, user_id: CurrentUserId, db: DbSession) -> MaterialResponse:
    from app.domains.materials.service_materials import get_material

    return await get_material(material_id, user_id, db)


@router.patch("/{material_id}", response_model=MaterialResponse)
async def update_material(material_id: uuid.UUID, payload: MaterialUpdate, user_id: CurrentUserId, db: DbSession) -> MaterialResponse:
    from app.domains.materials.service_materials import update_material

    return await update_material(material_id, user_id, payload, db)


@router.delete("/{material_id}", status_code=204)
async def delete_material(material_id: uuid.UUID, user_id: CurrentUserId, db: DbSession) -> None:
    from app.domains.materials.service_materials import delete_material

    await delete_material(material_id, user_id, db)


@router.post("/{material_id}/flashcards", response_model=FlashcardResponse, status_code=201)
async def add_flashcard(material_id: uuid.UUID, payload: FlashcardCreate, user_id: CurrentUserId, db: DbSession) -> FlashcardResponse:
    from app.domains.materials.service_materials import add_flashcard

    return await add_flashcard(material_id, user_id, payload, db)


@router.post("/{material_id}/questions", response_model=TestQuestionResponse, status_code=201)
async def add_question(material_id: uuid.UUID, payload: TestQuestionCreate, user_id: CurrentUserId, db: DbSession) -> TestQuestionResponse:
    from app.domains.materials.service_materials import add_test_question

    return await add_test_question(material_id, user_id, payload, db)
