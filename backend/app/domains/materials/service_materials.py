from __future__ import annotations

import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.materials.schema_materials import (
    FlashcardCreate,
    FlashcardResponse,
    MaterialCreate,
    MaterialResponse,
    MaterialUpdate,
    TestQuestionCreate,
    TestQuestionResponse,
)


async def create_material(user_id: str, payload: MaterialCreate, db: AsyncSession) -> MaterialResponse:
    from app.domains.materials.repo_materials import insert_material

    material = await insert_material(uuid.UUID(user_id), payload, db)
    return MaterialResponse.model_validate(material)


async def list_user_materials(user_id: str, db: AsyncSession) -> list[MaterialResponse]:
    from app.domains.materials.repo_materials import fetch_user_materials

    materials = await fetch_user_materials(uuid.UUID(user_id), db)
    return [MaterialResponse.model_validate(m) for m in materials]


async def get_material(material_id: uuid.UUID, user_id: str, db: AsyncSession) -> MaterialResponse:
    from app.domains.materials.repo_materials import fetch_material

    material = await fetch_material(material_id, uuid.UUID(user_id), db)
    if not material:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Material not found")
    return MaterialResponse.model_validate(material)


async def update_material(material_id: uuid.UUID, user_id: str, payload: MaterialUpdate, db: AsyncSession) -> MaterialResponse:
    from app.domains.materials.repo_materials import fetch_material, save_material

    material = await fetch_material(material_id, uuid.UUID(user_id), db)
    if not material:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Material not found")

    if payload.title is not None:
        material.title = payload.title
    if payload.description is not None:
        material.description = payload.description
    if payload.content is not None:
        material.content = payload.content

    await save_material(material, db)
    return MaterialResponse.model_validate(material)


async def delete_material(material_id: uuid.UUID, user_id: str, db: AsyncSession) -> None:
    from app.domains.materials.repo_materials import fetch_material, remove_material

    material = await fetch_material(material_id, uuid.UUID(user_id), db)
    if not material:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Material not found")
    await remove_material(material, db)


async def add_flashcard(material_id: uuid.UUID, user_id: str, payload: FlashcardCreate, db: AsyncSession) -> FlashcardResponse:
    from app.domains.materials.repo_materials import fetch_material, insert_flashcard

    material = await fetch_material(material_id, uuid.UUID(user_id), db)
    if not material:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Material not found")

    card = await insert_flashcard(material_id, payload, db)
    return FlashcardResponse.model_validate(card)


async def add_test_question(material_id: uuid.UUID, user_id: str, payload: TestQuestionCreate, db: AsyncSession) -> TestQuestionResponse:
    from app.domains.materials.repo_materials import fetch_material, insert_test_question

    material = await fetch_material(material_id, uuid.UUID(user_id), db)
    if not material:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Material not found")

    question = await insert_test_question(material_id, payload, db)
    return TestQuestionResponse.model_validate(question)
