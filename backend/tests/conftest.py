from __future__ import annotations

import uuid
from collections.abc import AsyncIterator

import pytest
import pytest_asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, create_async_engine

from app.database import Base
from app.domains.reading.model_reading import ReadingTeam, ReadingUser


def pytest_addoption(parser: pytest.Parser) -> None:
    parser.addoption("--vote-test-db", help="PostgreSQL URL for isolated voting test schemas")


@pytest_asyncio.fixture
async def vote_engine(pytestconfig: pytest.Config) -> AsyncIterator[AsyncEngine]:
    url = pytestconfig.getoption("--vote-test-db")
    if not url:
        pytest.skip("Pass --vote-test-db to run PostgreSQL voting integration tests")
    schema = f"test_vote_{uuid.uuid4().hex}"
    bootstrap = create_async_engine(url)
    async with bootstrap.begin() as connection:
        await connection.execute(text(f'CREATE SCHEMA "{schema}"'))
    engine = create_async_engine(url, connect_args={"server_settings": {"search_path": schema}})
    try:
        async with engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all)
        yield engine
    finally:
        await engine.dispose()
        async with bootstrap.begin() as connection:
            await connection.execute(text(f'DROP SCHEMA "{schema}" CASCADE'))
        await bootstrap.dispose()


@pytest_asyncio.fixture
async def db(vote_engine: AsyncEngine) -> AsyncIterator[AsyncSession]:
    async with AsyncSession(vote_engine, expire_on_commit=False) as session:
        yield session


@pytest_asyncio.fixture
async def voters(db: AsyncSession) -> tuple[ReadingUser, ReadingUser]:
    team = ReadingTeam(name="QA Vote Tests")
    db.add(team)
    await db.flush()
    admin = ReadingUser(email="qa-vote-admin-verify@gmail.com", full_name="QA Admin", hashed_password="unused", is_admin=True, team_id=team.id)
    student = ReadingUser(email="qa-vote-student-verify@gmail.com", full_name="QA Student", hashed_password="unused", team_id=team.id)
    db.add_all([admin, student])
    await db.commit()
    return admin, student
