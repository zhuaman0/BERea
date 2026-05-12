from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.ai_personas.model_ai_personas import AIPersona, PersonaInteraction


async def fetch_active_personas(db: AsyncSession) -> list[AIPersona]:
    result = await db.execute(select(AIPersona).where(AIPersona.is_active == True))  # noqa: E712
    return list(result.scalars().all())


async def fetch_persona_by_id(persona_id: uuid.UUID, db: AsyncSession) -> AIPersona | None:
    result = await db.execute(select(AIPersona).where(AIPersona.id == persona_id))
    return result.scalar_one_or_none()


async def save_interaction(
    persona_id: uuid.UUID,
    user_id: uuid.UUID,
    session_id: uuid.UUID | None,
    user_message: str,
    persona_response: str,
    db: AsyncSession,
) -> PersonaInteraction:
    interaction = PersonaInteraction(
        persona_id=persona_id,
        user_id=user_id,
        session_id=session_id,
        user_message=user_message,
        persona_response=persona_response,
        created_at=datetime.now(timezone.utc),
    )
    db.add(interaction)
    await db.commit()
    await db.refresh(interaction)
    return interaction
