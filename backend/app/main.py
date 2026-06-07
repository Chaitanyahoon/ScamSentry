"""
ScamSentry API — Main Entry Point

Configures FastAPI, registers middleware (CORS, Rate Limiting),
runs database migrations on startup, and exposes all routers.
"""

from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager
from datetime import UTC, datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.middleware.rate_limit import RateLimitMiddleware
from app.routers.scan import router as scan_router
from app.routers.report import router as report_router
from app.routers.admin import router as admin_router
from app.routers.incident import router as incident_router
from app.services.cache import close_redis

# ── Logging Setup ─────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


# ── Database Auto-Migrations ──────────────────────────────────────────


def run_migrations() -> None:
    """Run Alembic database migrations to upgrade to head."""
    from alembic import command
    from alembic.config import Config

    settings = get_settings()
    # In-memory SQLite files in tests don't run alembic
    if ":memory:" in settings.DATABASE_URL:
        logger.info(
            "In-memory SQLite database detected; skipping Alembic auto-migrations."
        )
        return

    try:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        ini_path = os.path.join(base_dir, "alembic.ini")
        if not os.path.exists(ini_path):
            logger.warning(
                "alembic.ini not found at %s. Skipping migrations.", ini_path
            )
            return

        logger.info("Running Alembic database migrations...")
        cfg = Config(ini_path)
        cfg.set_main_option("script_location", os.path.join(base_dir, "migrations"))
        cfg.set_main_option("sqlalchemy.url", settings.DATABASE_URL)
        command.upgrade(cfg, "head")
        logger.info("Database migrations completed successfully.")
    except Exception as exc:
        logger.error("Failed to run database migrations: %s", exc, exc_info=True)


# ── Lifespan Context Manager ──────────────────────────────────────────


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    # await asyncio.to_thread(run_migrations)

    from app.services.cache import prewarm_cache

    try:
        await prewarm_cache()
    except Exception as exc:
        logger.error("Failed to run cache pre-warming: %s", exc)

    yield
    # Shutdown actions
    logger.info("Closing Redis connection...")
    await close_redis()
    logger.info("Shutdown sequence complete.")


# ── FastAPI App Initialisation ────────────────────────────────────────

app = FastAPI(
    title="ScamSentry API",
    description="Forensic threat detection platform API",
    version="1.0.0",
    lifespan=lifespan,
)

# ── Middleware Configuration ──────────────────────────────────────────

# CORS Middleware
origins = [
    o.strip() for o in get_settings().CORS_ALLOWED_ORIGINS.split(",") if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate Limiting Middleware
app.add_middleware(RateLimitMiddleware)


# ── Route Registration ────────────────────────────────────────────────

app.include_router(scan_router, prefix="/api/v1")
app.include_router(report_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")
app.include_router(incident_router, prefix="/api/v1")


# ── Health Endpoints ──────────────────────────────────────────────────


@app.get("/health", tags=["system"])
async def health_check() -> dict:
    """Return system health and current timestamp."""
    return {
        "status": "ok",
        "timestamp": datetime.now(UTC).isoformat(),
        "environment": get_settings().ENVIRONMENT,
    }
