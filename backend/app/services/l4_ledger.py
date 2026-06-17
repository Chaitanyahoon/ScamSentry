"""
ScamSentry API — Layer 4: Internal Threat Ledger

Queries the PostgreSQL ``ledger`` table for known malicious domains.
Max score contribution: 15 points.
"""

from __future__ import annotations

import logging
from urllib.parse import urlparse

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ledger import LedgerEntry

logger = logging.getLogger(__name__)

MAX_L4_SCORE = 100


def _extract_domain(url: str) -> str:
    """Pull the hostname out of a URL string."""
    try:
        parsed = urlparse(url if "://" in url else f"http://{url}")
        return (parsed.hostname or "").lower()
    except Exception:
        return ""


async def check_ledger(url: str, db: AsyncSession) -> dict:
    """
    Query the ledger for the domain (or parent domain) of *url*.

    Returns
    -------
    dict
        {
            "score": int (0, 8, or 15),
            "passed": bool,
            "details": { "domain": str, "match": dict | None },
        }
    """
    domain = _extract_domain(url)
    if not domain:
        return {
            "score": 0,
            "passed": True,
            "details": {"domain": "", "match": None},
        }

    # Build candidate domains: exact + parent domains for subdomain matching
    # e.g. "a.b.evil.com" → ["a.b.evil.com", "b.evil.com", "evil.com"]
    parts = domain.split(".")
    candidates: list[str] = []
    for i in range(len(parts)):
        candidate = ".".join(parts[i:])
        if "." in candidate:  # need at least a TLD
            candidates.append(candidate)

    if not candidates:
        return {
            "score": 0,
            "passed": True,
            "details": {"domain": domain, "match": None},
        }

    try:
        stmt = select(LedgerEntry).where(LedgerEntry.domain.in_(candidates))
        result = await db.execute(stmt)
        entries = result.scalars().all()
    except Exception as exc:
        logger.warning("Ledger query failed: %s", exc)
        return {
            "score": 0,
            "passed": True,
            "details": {"domain": domain, "match": None, "error": str(exc)},
        }

    if not entries:
        return {
            "score": 0,
            "passed": True,
            "details": {"domain": domain, "match": None},
        }

    # Prefer verified entries
    best: LedgerEntry | None = None
    for entry in entries:
        if entry.verified:
            best = entry
            break
    if best is None:
        best = entries[0]

    score = 100 if best.verified else 60

    return {
        "score": min(score, MAX_L4_SCORE),
        "passed": False,
        "details": {
            "domain": domain,
            "match": {
                "ledger_domain": best.domain,
                "threat_type": best.threat_type,
                "confidence": best.confidence,
                "source": best.source,
                "verified": best.verified,
            },
        },
    }
