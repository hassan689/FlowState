import asyncio
import os
from pathlib import Path
from uuid import uuid4

import pytest

# Load repo .env so TEST_DATABASE_URL / DATABASE_URL are available when running pytest locally
try:
    from dotenv import load_dotenv

    _env = Path(__file__).resolve().parent.parent / ".env"
    if _env.is_file():
        load_dotenv(_env)
except ImportError:
    pass
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.main import app
from app.db.base import Base
from app.db.session import get_db
from app.models.user import User
from app.core.security import get_password_hash


def _postgres_async_url() -> str:
    """Resolve test DB URL; tests run only against PostgreSQL (asyncpg)."""
    url = (os.getenv("TEST_DATABASE_URL") or os.getenv("DATABASE_URL") or "").strip()
    if not url:
        pytest.fail(
            "PostgreSQL is required for tests. Set TEST_DATABASE_URL (recommended, e.g. a "
            "dedicated flowstate_test database) or DATABASE_URL to "
            "postgresql+asyncpg://user:pass@host:5432/dbname"
        )
    if "sqlite" in url.lower():
        pytest.fail("SQLite is not supported. Use PostgreSQL with postgresql+asyncpg://...")
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgresql://") and "+asyncpg" not in url:
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    if not url.startswith("postgresql+asyncpg://"):
        pytest.fail("Tests require an async PostgreSQL URL (postgresql+asyncpg://...).")
    return url


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
async def db_engine():
    url = _postgres_async_url()
    engine = create_async_engine(url, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest.fixture
async def db_session(db_engine):
    async_session = async_sessionmaker(
        db_engine, class_=AsyncSession, expire_on_commit=False
    )
    async with async_session() as session:
        yield session
        await session.rollback()


@pytest.fixture
def override_get_db(db_session):
    async def _get_db():
        yield db_session

    return _get_db


@pytest.fixture
async def client(override_get_db):
    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest.fixture
async def test_user(db_session):
    user = User(
        id=uuid4(),
        email="test@example.com",
        name="Test User",
        password_hash=get_password_hash("password123"),
        study_preferences={},
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user
