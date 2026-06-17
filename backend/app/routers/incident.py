"""
ScamSentry API — Incident & BrandLockdown Router
"""

from __future__ import annotations

import logging
from datetime import UTC, datetime

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db, AsyncSessionLocal
from app.middleware.auth import verify_admin_key
from app.models.incident import BrandLockdown, Incident
from app.schemas.incident import BrandLockdownResponse, IncidentResponse
from app.services.scraper import scrape_cyber_incidents

router = APIRouter(tags=["incident"])
logger = logging.getLogger(__name__)


# ── GET /incidents ───────────────────────────────────────────────────


@router.get("/incidents", response_model=list[IncidentResponse])
async def get_incidents(
    offset: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
) -> list[Incident]:
    """Retrieve recent cybersecurity global incidents with pagination."""
    stmt = (
        select(Incident)
        .order_by(Incident.published_at.desc())
        .offset(offset)
        .limit(min(limit, 100))
    )
    result = await db.execute(stmt)
    incidents = list(result.scalars().all())

    # Pre-seed database if empty so user never sees a blank dashboard
    if not incidents:
        logger.info("No incidents found in DB; triggering initial scrape sync...")
        try:
            await scrape_cyber_incidents(db)
            # Re-fetch after scraping
            result = await db.execute(stmt)
            incidents = list(result.scalars().all())
        except Exception as exc:
            logger.error("Initial scrape sync failed: %s", exc, exc_info=True)

    return incidents


# ── GET /brand-lockdowns ─────────────────────────────────────────────


@router.get("/brand-lockdowns", response_model=list[BrandLockdownResponse])
async def get_brand_lockdowns(
    db: AsyncSession = Depends(get_db),
) -> list[BrandLockdown]:
    """Retrieve active brand lockdown warnings."""
    now = datetime.now(UTC).replace(tzinfo=None)
    stmt = select(BrandLockdown).where(
        BrandLockdown.expires_at > now, BrandLockdown.is_active
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


# ── POST /admin/scrape-incidents ─────────────────────────────────────


@router.post(
    "/admin/scrape-incidents",
    dependencies=[Depends(verify_admin_key)],
)
async def trigger_scrape_incidents(
    background_tasks: BackgroundTasks,
    background: bool = True,
) -> dict:
    """
    Trigger the cybersecurity incident RSS feeds scraper.

    Protected by the ``X-Admin-Key`` header.
    """

    if not background:
        # Run synchronously
        try:
            logger.info("Starting synchronous advisory scraping task...")
            async with AsyncSessionLocal() as session:
                stats = await scrape_cyber_incidents(session)
            logger.info("Synchronous advisory scraping task completed: %s", stats)
            return {
                "success": True,
                "processed": stats.get("processed", 0),
                "lockdowns_triggered": stats.get("lockdowns_triggered", 0),
                "reports_generated": stats.get("reports_generated", 0),
                "message": "Cybersecurity advisory scraping job completed synchronously.",
            }
        except Exception as exc:
            logger.error(
                "Error in synchronous advisory scraping task: %s", exc, exc_info=True
            )
            raise HTTPException(status_code=500, detail=f"Scraper failed: {str(exc)}")

    # Define the worker task that will run in background thread pool using its own session
    async def run_sync_task():
        try:
            logger.info("Starting background advisory scraping task...")
            async with AsyncSessionLocal() as session:
                stats = await scrape_cyber_incidents(session)
            logger.info("Background advisory scraping task completed: %s", stats)
        except Exception as exc:
            logger.error(
                "Error in background advisory scraping task: %s", exc, exc_info=True
            )

    background_tasks.add_task(run_sync_task)

    return {
        "success": True,
        "message": "Cybersecurity advisory scraping job queued in background.",
    }
