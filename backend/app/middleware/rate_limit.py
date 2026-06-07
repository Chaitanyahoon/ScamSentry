"""
ScamSentry API — Rate Limiting Middleware

Sliding-window rate limiter backed by Redis.
Default limit: 20 requests per minute per IP for ``/api/v1/scan``.
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

RATE_LIMIT = 20  # requests
WINDOW_SECONDS = 60  # per minute


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Sliding-window rate limiter for /api/v1/scan endpoints."""

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
        # Only rate-limit the scan endpoint
        if not request.url.path.startswith("/api/v1/scan"):
            return await call_next(request)

        # Only rate-limit POST (the actual scan)
        if request.method != "POST":
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"
        minute_bucket = int(time.time() // WINDOW_SECONDS)
        key = f"rate:{client_ip}:{minute_bucket}"

        redis = await self._get_redis()
        if redis is None:
            # Redis unavailable — let the request through
            return await call_next(request)

        try:
            current = await redis.incr(key)
            if current == 1:
                await redis.expire(key, WINDOW_SECONDS)

            if current > RATE_LIMIT:
                retry_after = WINDOW_SECONDS - int(time.time() % WINDOW_SECONDS)
                return JSONResponse(
                    status_code=429,
                    content={
                        "detail": f"Rate limit exceeded ({RATE_LIMIT} req/min). Try again later.",
                    },
                    headers={"Retry-After": str(retry_after)},
                )
        except Exception:
            logger.warning("Rate limit check failed — allowing request", exc_info=True)

        return await call_next(request)
