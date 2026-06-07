"""
ScamSentry API — Redis Cache Wrapper

Async Redis client for caching scan results.
Key pattern: ``scan:<sha256(url)>``  TTL: 1 hour.
"""

from __future__ import annotations

import hashlib
import json
import logging

import redis.asyncio as aioredis

from app.config import get_settings

logger = logging.getLogger(__name__)

CACHE_TTL: int = 3600  # 1 hour

# ── Internal helpers ──────────────────────────────────────────────────

_client: aioredis.Redis | None = None


async def _get_redis() -> aioredis.Redis:
    """Return (and lazily create) the async Redis client."""
    global _client
    if _client is None:
        settings = get_settings()
        _client = aioredis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
            socket_connect_timeout=2.0,
            socket_timeout=2.0,
        )
    return _client


def _cache_key(url: str) -> str:
    """Deterministic cache key for a URL."""
    digest = hashlib.sha256(url.encode()).hexdigest()
    return f"scan:{digest}"


# ── Public API ────────────────────────────────────────────────────────


async def get_cached_scan(url: str) -> dict | None:
    """Return the cached scan result dict, or *None* on cache miss."""
    try:
        client = await _get_redis()
        raw = await client.get(_cache_key(url))
        if raw is not None:
            return json.loads(raw)
    except Exception:
        logger.warning("Redis GET failed — treating as cache miss", exc_info=True)
    return None


async def set_cached_scan(url: str, result: dict) -> None:
    """Store *result* in Redis with the default TTL."""
    try:
        client = await _get_redis()
        await client.set(
            _cache_key(url),
            json.dumps(result, default=str),
            ex=CACHE_TTL,
        )
    except Exception:
        logger.warning("Redis SET failed — result not cached", exc_info=True)


async def close_redis() -> None:
    """Gracefully close the Redis connection (called on app shutdown)."""
    global _client
    if _client is not None:
        await _client.aclose()
        _client = None


async def get_cached_domain_reputation(domain: str) -> dict | None:
    """Return cached WHOIS & SSL checks for a domain, or *None*."""
    try:
        client = await _get_redis()
        raw = await client.get(f"domain:rep:{domain}")
        if raw is not None:
            return json.loads(raw)
    except Exception:
        logger.warning("Redis GET failed for domain reputation cache", exc_info=True)
    return None


async def set_cached_domain_reputation(domain: str, data: dict) -> None:
    """Store domain reputation in Redis with a 24-hour TTL."""
    try:
        client = await _get_redis()
        # 24 hours = 86400 seconds
        await client.set(
            f"domain:rep:{domain}",
            json.dumps(data, default=str),
            ex=86400,
        )
    except Exception:
        logger.warning("Redis SET failed for domain reputation cache", exc_info=True)


async def prewarm_cache() -> None:
    """Pre-populate domain reputation cache for top common trusted domains."""
    logger.info("Checking Redis connection for cache pre-warming...")
    try:
        client = await _get_redis()
        await client.ping()
    except Exception:
        logger.warning("Redis is offline — skipping cache pre-warming")
        return

    top_domains = [
        "google.com",
        "github.com",
        "vercel.app",
        "microsoft.com",
        "apple.com",
        "amazon.com",
        "facebook.com",
        "netflix.com",
        "openai.com",
        "linkedin.com",
        "twitter.com",
        "whatsapp.com",
        "telegram.org",
        "discord.com",
        "youtube.com",
    ]
    logger.info("Starting domain reputation cache pre-warming...")
    prewarmed_count = 0
    try:
        for domain in top_domains:
            cached = await get_cached_domain_reputation(domain)
            if cached is None:
                clean_rep = {
                    "score": 0,
                    "passed": True,
                    "details": {
                        "whois": {
                            "domain_name": domain,
                            "registrar": "Pre-warmed Safe Domain Key Resolver",
                            "creation_date": "Historical",
                        },
                        "ssl": {
                            "valid": True,
                            "self_signed": False,
                            "expired": False,
                            "error": None,
                        },
                        "triggered_checks": [],
                    },
                }
                await set_cached_domain_reputation(domain, clean_rep)
                prewarmed_count += 1
        logger.info("Cache pre-warming completed. Seeded %d domains.", prewarmed_count)
    except Exception as exc:
        logger.error("Failed to pre-warm cache: %s", exc, exc_info=True)
