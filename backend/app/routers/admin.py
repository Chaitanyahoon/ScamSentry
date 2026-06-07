"""
ScamSentry API — Admin Router

POST /api/v1/admin/ledger  → Create a verified LedgerEntry (requires X-Admin-Key)
"""

from __future__ import annotations

import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, ConfigDict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import verify_admin_key
from app.models.ledger import LedgerEntry

router = APIRouter(prefix="/admin", tags=["admin"])


# ── Schemas ───────────────────────────────────────────────────────────


class LedgerCreate(BaseModel):
    """Schema for creating a new ledger entry via Admin API."""

    domain: str = Field(..., description="The domain name (e.g. evil.com)")
    threat_type: str = Field(
        ..., description="The type of threat (e.g. phishing, malware)"
    )
    confidence: int = Field(100, ge=0, le=100, description="Confidence level (0-100)")
    source: str = Field("admin", description="Source of report")


class LedgerResponse(BaseModel):
    """Response schema for created ledger entry."""

    id: uuid.UUID
    domain: str
    threat_type: str
    confidence: int
    source: str
    reported_at: datetime
    verified: bool

    model_config = ConfigDict(from_attributes=True)


# ── POST /admin/ledger ────────────────────────────────────────────────


@router.post(
    "/ledger",
    response_model=LedgerResponse,
    dependencies=[Depends(verify_admin_key)],
)
async def create_ledger_entry(
    body: LedgerCreate,
    db: AsyncSession = Depends(get_db),
) -> LedgerEntry:
    """
    Create a verified ledger entry.

    This endpoint is protected by the ``X-Admin-Key`` header.
    """
    # 1. Clean domain name
    domain = body.domain.strip().lower()

    # 2. Check if domain already exists in the ledger
    stmt = select(LedgerEntry).where(LedgerEntry.domain == domain)
    res = await db.execute(stmt)
    existing = res.scalar_one_or_none()

    if existing is not None:
        raise HTTPException(
            status_code=400,
            detail=f"Domain '{domain}' already exists in ledger",
        )

    # 3. Create entry
    entry = LedgerEntry(
        id=uuid.uuid4(),
        domain=domain,
        threat_type=body.threat_type,
        confidence=body.confidence,
        source=body.source,
        reported_at=datetime.now(UTC),
        verified=True,  # Admin entry is automatically verified
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)

    return entry


# ── POST /admin/sync-osint ────────────────────────────────────────────


@router.post(
    "/sync-osint",
    dependencies=[Depends(verify_admin_key)],
)
async def sync_osint(
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Fetch recent active threats from URLhaus and batch insert new domains into the ledger.
    """
    import httpx
    from urllib.parse import urlparse

    url = "https://urlhaus-api.abuse.ch/v1/urls/recent/"
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(url)

        if response.status_code != 200:
            raise HTTPException(
                status_code=502,
                detail=f"OSINT provider returned status {response.status_code}",
            )
        data = response.json()
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch threats from OSINT provider: {exc}",
        ) from exc

    urls_data = data.get("urls", [])
    if not urls_data:
        return {"success": True, "inserted": 0, "message": "No active threats found"}

    # Filter top 100 online active threats to control DB growth
    recent_threats = [t for t in urls_data if t.get("url_status") == "online"][:100]

    # Extract unique domains and their threat types
    domains_to_add: set[tuple[str, str]] = set()
    for threat in recent_threats:
        t_url = threat.get("url")
        if not t_url:
            continue
        try:
            parsed = urlparse(t_url if "://" in t_url else f"http://{t_url}")
            hostname = (parsed.hostname or "").lower().strip()
            if hostname:
                domains_to_add.add((hostname, threat.get("threat") or "phishing"))
        except Exception:
            continue

    if not domains_to_add:
        return {"success": True, "inserted": 0, "message": "No valid domains extracted"}

    # Check which domains already exist in the database
    candidate_domains = list({d[0] for d in domains_to_add})
    stmt = select(LedgerEntry.domain).where(LedgerEntry.domain.in_(candidate_domains))
    res = await db.execute(stmt)
    existing_domains = set(res.scalars().all())

    inserted = 0
    for domain, threat_type in domains_to_add:
        if domain not in existing_domains:
            entry = LedgerEntry(
                id=uuid.uuid4(),
                domain=domain,
                threat_type=threat_type,
                confidence=80,  # OSINT confidence defaults to 80%
                source="OSINT Threat Feed (URLhaus)",
                reported_at=datetime.now(UTC),
                verified=True,
            )
            db.add(entry)
            inserted += 1

    if inserted > 0:
        await db.commit()

    return {
        "success": True,
        "processed": len(recent_threats),
        "inserted": inserted,
        "message": f"Successfully synchronized {inserted} new threats from URLhaus",
    }
