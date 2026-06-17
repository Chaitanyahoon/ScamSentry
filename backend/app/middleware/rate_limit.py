"""
ScamSentry API — Rate Limiting Middleware

Sliding-window rate limiter backed by Redis.
Per-endpoint limits defined in ``ROUTE_LIMITS``.
"""

from __future__ import annotations

import logging
import time

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import JSONResponse

import redis.asyncio as aioredis

from app.config import get_settings

logger = logging.getLogger(__name__)

WINDOW_SECONDS = 60  # per minute

ROUTE_LIMITS: list[tuple[str, str, int]] = [
    ("/api/v1/admin", "GET", 60),  # admin reads
    ("/api/v1/admin", "POST", 60),  # admin writes (login)
    ("/api/v1/scan", "POST", 20),  # scan submissions
    ("/api/v1/incidents", "GET", 30),  # incident listing
    ("/api/v1/ledger", "GET", 30),  # ledger queries
    ("/api/v1/report", "GET", 20),  # report access
    ("/api/v1/vote", "POST", 30),  # voting
]


def _match_limit(path: str, method: str) -> int | None:
    for prefix, m, limit in ROUTE_LIMITS:
        if path.startswith(prefix) and method == m:
            return limit
    return None


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Sliding-window rate limiter with per-endpoint limits."""

    def __init__(self, app, redis_client: aioredis.Redis | None = None):
        super().__init__(app)
        self._redis = redis_client

    async def _get_redis(self) -> aioredis.Redis | None:
        if self._redis is None:
            try:
                settings = get_settings()
                self._redis = aioredis.from_url(
                    settings.REDIS_URL,
                    decode_responses=True,
                    socket_connect_timeout=2.0,
                    socket_timeout=2.0,
                )
            except Exception:
                logger.warning("Could not connect to Redis for rate limiting")
                return None
        return self._redis

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        rate_limit = _match_limit(str(request.url.path), request.method)
        if rate_limit is None:
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"
        minute_bucket = int(time.time() // WINDOW_SECONDS)
        key = f"rate:{client_ip}:{minute_bucket}"

        redis = await self._get_redis()
        if redis is None:
            logger.warning(
                "Rate limiter degraded: Redis unavailable — rate limiting bypassed for %s",
                client_ip,
            )
            return await call_next(request)

        try:
            current = await redis.incr(key)
            if current == 1:
                await redis.expire(key, WINDOW_SECONDS)

            if current > rate_limit:
                retry_after = WINDOW_SECONDS - int(time.time() % WINDOW_SECONDS)
                return JSONResponse(
                    status_code=429,
                    content={
                        "detail": f"Rate limit exceeded ({rate_limit} req/min). Try again later.",
                    },
                    headers={"Retry-After": str(retry_after)},
                )
        except Exception:
            logger.warning("Rate limit check failed — allowing request", exc_info=True)

        return await call_next(request)
