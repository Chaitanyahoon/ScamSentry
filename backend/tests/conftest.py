from collections.abc import AsyncGenerator
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import StaticPool
from unittest.mock import patch
import fakeredis

from app.database import Base, get_db
from app.main import app

# Use in-memory SQLite for testing
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_db():
    """Initialise the in-memory SQLite database before running tests."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def db() -> AsyncGenerator[AsyncSession, None]:
    """Provide a clean database session per test."""
    async with TestingSessionLocal() as session:
        yield session
        # Clean up tables after each test to ensure test isolation
        try:
            await session.execute(Base.metadata.tables["scan_results"].delete())
            await session.execute(Base.metadata.tables["scans"].delete())
            await session.execute(Base.metadata.tables["ledger"].delete())
            await session.commit()
        except Exception:
            await session.rollback()


@pytest.fixture(autouse=True)
def override_db(db):
    """Override get_db dependency in the FastAPI application."""
    app.dependency_overrides[get_db] = lambda: db
    yield
    app.dependency_overrides.pop(get_db, None)


@pytest.fixture(autouse=True)
def mock_redis():
    """Mock Redis client using fakeredis."""
    # Use FakeAsyncRedis to support async await connection/calls in app code.
    fake_client = fakeredis.FakeAsyncRedis(decode_responses=True)

    with patch("redis.asyncio.from_url", return_value=fake_client), \
         patch("app.services.cache._client", fake_client), \
         patch("app.middleware.rate_limit.RateLimitMiddleware._get_redis", return_value=fake_client):
        yield fake_client


@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """Provide an HTTPX async client connected to the FastAPI application."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
