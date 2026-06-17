"""
ScamSentry API — Scan Router

POST /api/v1/scan       → Run the 4-layer threat detection engine
GET  /api/v1/scan/{id}  → Retrieve a previous scan by UUID
"""

from __future__ import annotations

import ipaddress
import logging
import uuid
from datetime import UTC, datetime
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import verify_admin_key
from app.models.scan import Scan, ScanResult, ScanStatus, RiskLevel, LayerName
from app.models.ledger import LedgerEntry
from app.schemas.scan import (
    ScanRequest,
    ScanResponse,
    LayerResult,
    VoteRequest,
    VoteResponse,
)
from app.utils.domain import extract_domain
from app.services.cache import get_cached_scan, set_cached_scan
from app.services.engine import run_engine

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/scan", tags=["scan"])

_BLOCKED_NETWORKS = [
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("169.254.0.0/16"),
    ipaddress.ip_network("::1/128"),
    ipaddress.ip_network("fc00::/7"),
]


def _is_private_ip(hostname: str) -> bool:
    """Return True if hostname resolves to a private/loopback address."""
    try:
        addr = ipaddress.ip_address(hostname)
        return any(addr in net for net in _BLOCKED_NETWORKS)
    except ValueError:
        # hostname is not an IP literal — resolve it
        import socket

        try:
            resolved = socket.getaddrinfo(hostname, None)
            for family, _, _, _, sockaddr in resolved:
                addr = ipaddress.ip_address(sockaddr[0])
                if any(addr in net for net in _BLOCKED_NETWORKS):
                    return True
        except (socket.gaierror, OSError):
            return False
    return False


# ── POST /scan ────────────────────────────────────────────────────────


@router.post("", response_model=ScanResponse)
async def create_scan(
    body: ScanRequest,
    db: AsyncSession = Depends(get_db),
) -> ScanResponse:
    """Submit a URL for threat analysis."""
    url_str = str(body.url).replace("\n", "").replace("\r", "")

    # SSRF protection: block private/internal IPs
    try:
        parsed = urlparse(url_str)
        hostname = parsed.hostname or ""
        if _is_private_ip(hostname):
            raise HTTPException(
                status_code=400,
                detail="Scanning private/internal network addresses is not allowed",
            )
    except HTTPException:
        raise
    except Exception:
        pass

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
        logger.warning(
            "Database write failed on startup; running in stateless mode: %s", db_exc
        )
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


@router.post("/vote", response_model=VoteResponse, dependencies=[Depends(verify_admin_key)])
async def cast_vote(
    body: VoteRequest,
    db: AsyncSession = Depends(get_db),
) -> VoteResponse:
    """Cast a community vote ('safe' or 'unsafe') on a domain."""
    url_str = body.url.strip()
    vote_type = body.vote.lower().strip()

    if vote_type not in ("safe", "unsafe"):
        raise HTTPException(status_code=422, detail="Vote must be 'safe' or 'unsafe'")

    domain = extract_domain(url_str)
    if not domain:
        raise HTTPException(status_code=400, detail="Invalid URL or domain")

    # Query existing ledger entry
    stmt = select(LedgerEntry).where(LedgerEntry.domain == domain)
    result = await db.execute(stmt)
    entry = result.scalar_one_or_none()

    message = ""
    confidence = 0
    verified = False

    if vote_type == "unsafe":
        success = True
        if entry is None:
            # Create a new community threat entry
            entry = LedgerEntry(
                domain=domain,
                threat_type=body.threat_type,
                confidence=10,
                source="community",
                verified=False,
            )
            db.add(entry)
            message = "Domain successfully flagged by community."
            confidence = 10
        else:
            # If it's a community entry, increase confidence
            if entry.source == "community":
                entry.confidence = min(entry.confidence + 10, 100)
                message = f"Community flagging recorded. Confidence increased to {entry.confidence}%."
            else:
                message = f"Domain is already recorded in the threat ledger (source: {entry.source})."
            confidence = entry.confidence
            verified = entry.verified

        await db.commit()

    elif vote_type == "safe":
        if entry is None:
            success = False
            message = "Domain is not in the threat ledger."
        else:
            success = True
            if entry.source == "community":
                entry.confidence -= 10
                if entry.confidence <= 0:
                    await db.delete(entry)
                    message = "Domain removed from community threat ledger due to safety consensus."
                    confidence = 0
                else:
                    message = f"Safety vote recorded. Threat confidence reduced to {entry.confidence}%."
                    confidence = entry.confidence
            else:
                message = (
                    f"Safety vote recorded but overridden by {entry.source} authority."
                )
                confidence = entry.confidence
                verified = entry.verified

        await db.commit()

    return VoteResponse(
        success=success,
        message=message,
        domain=domain,
        confidence=confidence,
        verified=verified,
    )
