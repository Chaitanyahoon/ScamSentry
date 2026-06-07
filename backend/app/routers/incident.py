"""
ScamSentry API — Incident & BrandLockdown Router
"""

from __future__ import annotations

import logging
from datetime import UTC, datetime

from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import verify_admin_key
from app.models.incident import BrandLockdown, Incident
from app.schemas.incident import BrandLockdownResponse, IncidentResponse
from app.services.scraper import scrape_cyber_incidents

router = APIRouter(tags=["incident"])
logger = logging.getLogger(__name__)


# ── GET /incidents ───────────────────────────────────────────────────


@router.get("/incidents", response_model=list[IncidentResponse])
async def get_incidents(
    limit: int = 30,
    db: AsyncSession = Depends(get_db),
) -> list[Incident]:
    """Retrieve recent cybersecurity global incidents."""
    stmt = select(Incident).order_by(Incident.published_at.desc()).limit(limit)
    result = await db.execute(stmt)
    return list(result.scalars().all())


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
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Trigger the cybersecurity incident RSS feeds scraper.

    This runs asynchronously in the background to avoid blocking and preventing
    gateway timeouts. Protected by the ``X-Admin-Key`` header.
    """

    # Define the worker task that will run in background thread pool
    async def run_sync_task():
        try:
            logger.info("Starting background advisory scraping task...")
            stats = await scrape_cyber_incidents(db)
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
