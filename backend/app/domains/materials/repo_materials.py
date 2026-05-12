from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.materials.model_materials import Flashcard, Material, TestQuestion
from app.domains.materials.schema_materials import FlashcardCreate, MaterialCreate, TestQuestionCreate


async def insert_material(user_id: uuid.UUID, payload: MaterialCreate, db: AsyncSession) -> Material:
    material = Material(
        user_id=user_id,
        type=payload.type,
        title=payload.title,
        description=payload.description,
        source_url=payload.source_url,
        content=payload.content,
    )
    db.add(material)
    await db.commit()
    await db.refresh(material)
    return material


async def fetch_user_materials(user_id: uuid.UUID, db: AsyncSession) -> list[Material]:
    result = await db.execute(select(Material).where(Material.user_id == user_id).order_by(Material.created_at.desc()))
    return list(result.scalars().all())


async def fetch_material(material_id: uuid.UUID, user_id: uuid.UUID, db: AsyncSession) -> Material | None:
    result = await db.execute(select(Material).where(Material.id == material_id, Material.user_id == user_id))
    return result.scalar_one_or_none()


async def save_material(material: Material, db: AsyncSession) -> None:
    db.add(material)
    await db.commit()
    await db.refresh(material)


async def remove_material(material: Material, db: AsyncSession) -> None:
    await db.delete(material)
    await db.commit()


async def insert_flashcard(material_id: uuid.UUID, payload: FlashcardCreate, db: AsyncSession) -> Flashcard:
    card = Flashcard(material_id=material_id, front=payload.front, back=payload.back, sort_order=payload.sort_order)
    db.add(card)
    await db.commit()
    await db.refresh(card)
    return card


async def insert_test_question(material_id: uuid.UUID, payload: TestQuestionCreate, db: AsyncSession) -> TestQuestion:
    question = TestQuestion(
        material_id=material_id,
        question=payload.question,
        options=payload.options,
        correct_index=payload.correct_index,
        explanation=payload.explanation,
        sort_order=payload.sort_order,
    )
    db.add(question)
    await db.commit()
    await db.refresh(question)
    return question
