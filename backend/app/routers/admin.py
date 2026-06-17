"""
ScamSentry API — Admin Router

Admin-only endpoints for managing the threat ledger, syncing OSINT feeds,
and controlling the scraper.  Authentication uses JWT Bearer tokens obtained
from ``POST /api/v1/admin/login``.
"""

from __future__ import annotations

import hmac
import logging
import uuid
from datetime import UTC, datetime, timedelta

import jwt
import httpx
from fastapi import APIRouter, Body, Depends, HTTPException, Header, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_db
from app.middleware.auth import verify_admin_key
from app.models.ledger import LedgerEntry

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.post("/login")
async def admin_login(
    x_admin_key: str = Header(..., alias="X-Admin-Key"),
):
    """Exchange the static *ADMIN_API_KEY* for a short-lived JWT.

    Send::

        POST /api/v1/admin/login
        X-Admin-Key: <your-admin-key>

    Returns a JWT token valid for *JWT_EXPIRY_HOURS* hours.
    """
    settings = get_settings()

    if not x_admin_key or not hmac.compare_digest(x_admin_key, settings.ADMIN_API_KEY):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin key",
        )

    now = datetime.now(UTC)
    payload = {
        "iss": "scamsentry-api",
        "iat": now,
        "exp": now + timedelta(hours=settings.JWT_EXPIRY_HOURS),
        "sub": "admin",
        "role": "admin",
    }
    token = jwt.encode(
        payload, settings.API_SECRET_KEY, algorithm=settings.JWT_ALGORITHM
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": settings.JWT_EXPIRY_HOURS * 3600,
    }


# ── Ledger CRUD ─────────────────────────────────────────────────────────


@router.post("/ledger", dependencies=[Depends(verify_admin_key)])
async def create_ledger_entry(
    domain: str = Body(...),
    threat_type: str = Body(...),
    confidence: int = Body(50),
    source: str = Body("admin"),
    db: AsyncSession = Depends(get_db),
):
    """Add a verified domain to the threat ledger."""
    if confidence < 0 or confidence > 100:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Confidence must be between 0 and 100",
        )

    entry = LedgerEntry(
        id=uuid.uuid4(),
        domain=domain,
        threat_type=threat_type,
        confidence=confidence,
        source=source,
        reported_at=datetime.now(UTC),
        verified=True,
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)

    return {
        "id": str(entry.id),
        "domain": entry.domain,
        "threat_type": entry.threat_type,
        "confidence": entry.confidence,
        "source": entry.source,
        "reported_at": entry.reported_at.isoformat(),
        "verified": entry.verified,
    }


@router.get("/ledger", dependencies=[Depends(verify_admin_key)])
async def list_ledger_entries(
    offset: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(LedgerEntry)
        .offset(offset)
        .limit(limit)
        .order_by(LedgerEntry.reported_at.desc())
    )
    result = await db.execute(stmt)
    entries = result.scalars().all()
    return [
        {
            "id": str(e.id),
            "domain": e.domain,
            "threat_type": e.threat_type,
            "confidence": e.confidence,
            "source": e.source,
            "verified": e.verified,
        }
        for e in entries
    ]


@router.delete("/ledger/{entry_id}", dependencies=[Depends(verify_admin_key)])
async def delete_ledger_entry(
    entry_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(LedgerEntry).where(LedgerEntry.id == entry_id)
    result = await db.execute(stmt)
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Ledger entry not found"
        )

    await db.delete(entry)
    await db.commit()
    return {"success": True, "message": "Ledger entry deleted"}


# ── OSINT Sync ──────────────────────────────────────────────────────────


@router.post("/sync-osint", dependencies=[Depends(verify_admin_key)])
async def sync_osint(
    db: AsyncSession = Depends(get_db),
):
    """Pull known malicious URLs from URLhaus and insert into the ledger."""
    urlhaus_url = "https://urlhaus.abuse.ch/downloads/text_recent/"
    stats = {"success": True, "processed": 0, "inserted": 0}

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(urlhaus_url)

        if resp.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"URLhaus responded with HTTP {resp.status_code}",
            )

        lines = resp.text.strip().splitlines()
        # Skip comment lines and header
        urls = [
            line.strip() for line in lines if line.strip() and not line.startswith("#")
        ]

        # Collect unique domains from URLs
        from urllib.parse import urlparse

        domains = []
        for url in urls:
            stats["processed"] += 1
            try:
                parsed = urlparse(url)
                domain = (parsed.hostname or "").lower()
                if not domain:
                    continue
                domains.append(domain)
            except Exception as e:
                logger.warning("Failed to parse URL %s: %s", url, e)
                continue

        # Batch deduplicate: fetch all existing domains in one query
        if domains:
            unique_domains = list(set(domains))
            stmt = select(LedgerEntry.domain).where(
                LedgerEntry.domain.in_(unique_domains)
            )
            result = await db.execute(stmt)
            existing_domains = {row[0] for row in result.all()}

            # Batch insert only new domains
            new_entries = []
            for domain in unique_domains:
                if domain in existing_domains:
                    continue
                new_entries.append(
                    LedgerEntry(
                        id=uuid.uuid4(),
                        domain=domain,
                        threat_type="malware",
                        confidence=95,
                        source="OSINT Threat Feed (URLhaus)",
                        reported_at=datetime.now(UTC),
                        verified=True,
                    )
                )
            if new_entries:
                db.add_all(new_entries)
                stats["inserted"] = len(new_entries)

        await db.commit()

    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to fetch URLhaus feed: {exc}",
        )

    logger.info(
        "OSINT sync complete — processed=%d, inserted=%d",
        stats["processed"],
        stats["inserted"],
    )
    return stats
