from __future__ import annotations

from fastapi import APIRouter

from app.domains.ai_personas.router_ai_personas import router as ai_personas_router
from app.domains.auth.router_auth import router as auth_router
from app.domains.integrations.router_integrations import router as integrations_router
from app.domains.materials.router_materials import router as materials_router
from app.domains.study_sessions.router_study_sessions import router as study_sessions_router
from app.domains.users.router_users import router as users_router

api_v1_router = APIRouter()

api_v1_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_v1_router.include_router(users_router, prefix="/users", tags=["users"])
api_v1_router.include_router(study_sessions_router, prefix="/study-sessions", tags=["study_sessions"])
api_v1_router.include_router(materials_router, prefix="/materials", tags=["materials"])
api_v1_router.include_router(ai_personas_router, prefix="/personas", tags=["ai_personas"])
api_v1_router.include_router(integrations_router, prefix="/integrations", tags=["integrations"])
