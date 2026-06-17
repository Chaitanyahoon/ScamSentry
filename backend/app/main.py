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

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from app.config import get_settings
from app.middleware.rate_limit import RateLimitMiddleware
from starlette.responses import RedirectResponse
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

# Security Headers Middleware


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "0"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        if get_settings().ENVIRONMENT == "production":
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains"
            )
        return response


app.add_middleware(SecurityHeadersMiddleware)

# Request Body Size Limit Middleware
MAX_BODY_SIZE = 1_048_576  # 1 MB


class RequestBodySizeMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        content_length = request.headers.get("content-length")
        if content_length:
            try:
                if int(content_length) > MAX_BODY_SIZE:
                    return JSONResponse(
                        status_code=413,
                        content={
                            "detail": f"Request body too large. Max: {MAX_BODY_SIZE} bytes."
                        },
                    )
            except (ValueError, TypeError):
                return JSONResponse(
                    status_code=400,
                    content={"detail": "Invalid Content-Length header"},
                )
        return await call_next(request)


app.add_middleware(RequestBodySizeMiddleware)

# CORS Middleware
origins = [
    o.strip() for o in get_settings().CORS_ALLOWED_ORIGINS.split(",") if o.strip()
]
allow_credentials = True
if "*" in origins:
    allow_credentials = False

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# HTTPS Redirect Middleware (production only)


class HTTPSRedirectMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if get_settings().ENVIRONMENT == "production":
            proto = request.headers.get("X-Forwarded-Proto", request.url.scheme)
            if proto != "https":
                url = str(request.url).replace("http://", "https://", 1)
                return RedirectResponse(url=url, status_code=301)
        return await call_next(request)


app.add_middleware(HTTPSRedirectMiddleware)

# Rate Limiting Middleware
app.add_middleware(RateLimitMiddleware)


# ── Route Registration ────────────────────────────────────────────────

app.include_router(scan_router, prefix="/api/v1")
app.include_router(report_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")
app.include_router(incident_router, prefix="/api/v1")


# ── Health Endpoints ──────────────────────────────────────────────────


@app.get("/health", tags=["system"])
async def health_check(format: str | None = None):
    """Return system health. Use ?format=text for a minimal text response."""
    if format == "text":
        return Response(content="OK", media_type="text/plain")

    health: dict = {
        "status": "ok",
        "timestamp": datetime.now(UTC).isoformat(),
        "environment": get_settings().ENVIRONMENT,
    }

    # Check Redis connectivity
    try:
        from app.services.cache import _client as _redis_client

        if _redis_client is not None:
            await _redis_client.ping()
            health["redis"] = "ok"
        else:
            health["redis"] = "not_connected"
    except Exception:
        health["redis"] = "error"

    # Check database connectivity
    try:
        from app.database import engine as _db_engine
        from sqlalchemy.ext.asyncio import AsyncSession

        async with AsyncSession(_db_engine) as session:
            await session.execute(text("SELECT 1"))
        health["database"] = "ok"
    except Exception:
        health["database"] = "error"

    if health.get("redis") == "error" or health.get("database") == "error":
        health["status"] = "degraded"

    return health
