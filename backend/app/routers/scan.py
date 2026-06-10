"""
ScamSentry API — Scan Router

POST /api/v1/scan       → Run the 4-layer threat detection engine
GET  /api/v1/scan/{id}  → Retrieve a previous scan by UUID
"""

from __future__ import annotations

import logging
import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.scan import Scan, ScanResult, ScanStatus, RiskLevel, LayerName
from app.schemas.scan import ScanRequest, ScanResponse, LayerResult
from app.services.cache import get_cached_scan, set_cached_scan
from app.services.engine import run_engine

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/scan", tags=["scan"])


# ── POST /scan ────────────────────────────────────────────────────────


@router.post("", response_model=ScanResponse)
async def create_scan(
    body: ScanRequest,
    db: AsyncSession = Depends(get_db),
) -> ScanResponse:
    """Submit a URL for threat analysis."""
    url_str = str(body.url)

    # 1. Check Redis cache
    cached = await get_cached_scan(url_str)
    if cached is not None:
        return ScanResponse(
            scan_id=cached["scan_id"],
            url=cached["url"],
            risk_score=cached["risk_score"],
            safety_score=cached.get("safety_score", 100 - cached["risk_score"]),
            risk_level=cached["risk_level"],
            layer_results=[LayerResult(**lr) for lr in cached["layer_results"]],
            processing_time_ms=cached["processing_time_ms"],
            cached=True,
            submitted_at=cached["submitted_at"],
        )

    # 2. Try to run with database persistence
    database_ok = True
    try:
        scan = Scan(
            id=uuid.uuid4(),
            url=url_str,
            status=ScanStatus.processing,
            submitted_at=datetime.now(UTC),
        )
        db.add(scan)
        await db.flush()
    except Exception as db_exc:
        logger.warning("Database write failed on startup; running in stateless mode: %s", db_exc)
        database_ok = False

    if database_ok:
        try:
            result = await run_engine(url_str, db=db)
            
            # Save ScanResult rows per layer
            for lr in result["layer_results"]:
                scan_result = ScanResult(
                    id=uuid.uuid4(),
                    scan_id=scan.id,
                    layer=LayerName(lr["layer"]),
                    passed=lr["passed"],
                    score_contribution=lr["score_contribution"],
                    details=lr["details"],
                )
                db.add(scan_result)

            # Update Scan record
            scan.status = ScanStatus.complete
            scan.risk_score = result["risk_score"]
            scan.risk_level = RiskLevel(result["risk_level"])
            scan.processing_time_ms = result["processing_time_ms"]
            await db.commit()
            await db.refresh(scan)
            
            scan_id_str = str(scan.id)
            submitted_at_dt = scan.submitted_at
        except Exception as exc:
            scan.status = ScanStatus.error
            try:
                await db.commit()
            except Exception:
                pass
            raise HTTPException(status_code=500, detail=f"Engine error: {exc}") from exc
    else:
        # Stateless Fallback Engine (no db logs)
        result = await run_engine(url_str, db=None)
        scan_id_str = str(uuid.uuid4())
        submitted_at_dt = datetime.now(UTC)

    # 6. Build response
    response_data = {
        "scan_id": scan_id_str,
        "url": url_str,
        "risk_score": result["risk_score"],
        "safety_score": 100 - result["risk_score"],
        "risk_level": result["risk_level"],
        "layer_results": result["layer_results"],
        "processing_time_ms": result["processing_time_ms"],
        "cached": False,
        "submitted_at": submitted_at_dt.isoformat(),
    }

    # 7. Cache the result
    try:
        await set_cached_scan(url_str, response_data)
    except Exception as cache_exc:
        logger.warning("Cache write failed: %s", cache_exc)

    return ScanResponse(
        scan_id=scan_id_str,
        url=url_str,
        risk_score=result["risk_score"],
        safety_score=100 - result["risk_score"],
        risk_level=result["risk_level"],
        layer_results=[LayerResult(**lr) for lr in result["layer_results"]],
        processing_time_ms=result["processing_time_ms"],
        cached=False,
        submitted_at=submitted_at_dt,
    )


# ── GET /scan/{scan_id} ──────────────────────────────────────────────


@router.get("/{scan_id}", response_model=ScanResponse)
async def get_scan(
    scan_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> ScanResponse:
    """Retrieve a previously submitted scan by its UUID."""
    stmt = select(Scan).where(Scan.id == scan_id)
    result = await db.execute(stmt)
    scan = result.scalar_one_or_none()

    if scan is None:
        raise HTTPException(status_code=404, detail="Scan not found")

    layer_results = [
        LayerResult(
            layer=sr.layer.value,
            passed=sr.passed,
            score_contribution=sr.score_contribution,
            details=sr.details or {},
        )
        for sr in scan.results
    ]

    return ScanResponse(
        scan_id=str(scan.id),
        url=scan.url,
        risk_score=scan.risk_score or 0,
        safety_score=100 - (scan.risk_score or 0),
        risk_level=(scan.risk_level.value if scan.risk_level else "safe"),
        layer_results=layer_results,
        processing_time_ms=scan.processing_time_ms or 0,
        cached=False,
        submitted_at=scan.submitted_at,
    )
