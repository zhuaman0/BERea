from __future__ import annotations

from fastapi import APIRouter

from app.domains.auth.router_auth import router as auth_router
from app.domains.users.router_users import router as users_router
from app.domains.catalog.router_catalog import router as catalog_router
from app.domains.categories.router_categories import router as categories_router
from app.domains.orders.router_orders import router as orders_router
from app.domains.configurator.router_configurator import router as configurator_router
from app.domains.reading.router_reading import router as reading_router

api_v1_router = APIRouter()

api_v1_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_v1_router.include_router(users_router, prefix="/users", tags=["users"])
api_v1_router.include_router(categories_router, prefix="/categories", tags=["categories"])
api_v1_router.include_router(catalog_router, prefix="/catalog", tags=["catalog"])
api_v1_router.include_router(configurator_router, prefix="/configurator", tags=["configurator"])
api_v1_router.include_router(orders_router, prefix="/orders", tags=["orders"])
api_v1_router.include_router(reading_router, prefix="/reading", tags=["reading"])
