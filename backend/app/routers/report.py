"""
ScamSentry API — Report Router

GET /api/v1/report/summary   → Summary statistics of scans
GET /api/v1/report/hotspots  → Threat hotspots mapping
"""

from __future__ import annotations

from datetime import UTC, datetime

from fastapi import APIRouter, Depends
from sqlalchemy import select, func, case
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.scan import Scan, RiskLevel
from app.models.ledger import LedgerEntry
from app.schemas.report import SummaryReport, HotspotEntry, HotspotsReport

router = APIRouter(prefix="/report", tags=["report"])


def get_tld_coordinates(domain: str) -> tuple[float, float]:
    """Map a domain's TLD or hostname deterministically to coordinates."""
    parts = domain.lower().split(".")
    tld = f".{parts[-1]}" if len(parts) > 1 else ""

    tld_map = {
        ".us": (37.7749, -122.4194),
        ".uk": (51.5074, -0.1278),
        ".co.uk": (51.5074, -0.1278),
        ".jp": (35.6762, 139.6503),
        ".au": (-33.8688, 151.2093),
        ".sg": (1.3521, 103.8198),
        ".de": (52.5200, 13.4050),
        ".in": (28.6139, 77.2090),
        ".br": (-23.5505, -46.6333),
        ".eg": (30.0444, 31.2357),
        ".za": (-26.2041, 28.0473),
        ".ca": (45.4215, -75.6972),
        ".kr": (35.9078, 127.7669),
        ".cn": (39.9042, 116.4074),
        ".ru": (55.7558, 37.6173),
        ".tk": (-21.1333, -175.2),
        ".ml": (17.5707, -3.9962),
        ".ga": (-0.8037, 11.6094),
        ".cf": (6.6111, 20.9394),
        ".gq": (1.6508, 10.2679),
    }

    if tld in tld_map:
        return tld_map[tld]

    # Deterministic fallback hashing using domain name
    GLOBAL_NODES = [
        (37.7749, -122.4194),  # San Francisco
        (51.5074, -0.1278),  # London
        (35.6762, 139.6503),  # Tokyo
        (-33.8688, 151.2093),  # Sydney
        (1.3521, 103.8198),  # Singapore
        (52.5200, 13.4050),  # Berlin
        (28.6139, 77.2090),  # New Delhi
        (-23.5505, -46.6333),  # Sao Paulo
        (30.0444, 31.2357),  # Cairo
        (-26.2041, 28.0473),  # Johannesburg
        (45.4215, -75.6972),  # Ottawa
        (35.9078, 127.7669),  # Seoul
    ]
    hash_val = sum(ord(c) for c in domain)
    idx = hash_val % len(GLOBAL_NODES)
    return GLOBAL_NODES[idx]


@router.get("/summary", response_model=SummaryReport)
async def get_summary(db: AsyncSession = Depends(get_db)) -> SummaryReport:
    """Retrieve aggregate statistics of all scans and threats."""
    # Query scans stats
    stats_stmt = select(
        func.count(Scan.id).label("total_scans"),
        func.sum(case((Scan.risk_level == RiskLevel.dangerous, 1), else_=0)).label(
            "dangerous_count"
        ),
        func.sum(case((Scan.risk_level == RiskLevel.suspicious, 1), else_=0)).label(
            "suspicious_count"
        ),
        func.sum(case((Scan.risk_level == RiskLevel.safe, 1), else_=0)).label(
            "safe_count"
        ),
        func.avg(Scan.processing_time_ms).label("avg_time"),
    )

    stats_res = await db.execute(stats_stmt)
    stats = stats_res.fetchone()

    total_scans = stats.total_scans if stats and stats.total_scans else 0
    dangerous_count = stats.dangerous_count if stats and stats.dangerous_count else 0
    suspicious_count = stats.suspicious_count if stats and stats.suspicious_count else 0
    safe_count = stats.safe_count if stats and stats.safe_count else 0
    avg_processing_time_ms = float(stats.avg_time) if stats and stats.avg_time else 0.0

    # Query top threat types from the ledger
    threats_stmt = (
        select(LedgerEntry.threat_type, func.count(LedgerEntry.id).label("count"))
        .group_by(LedgerEntry.threat_type)
        .order_by(func.count(LedgerEntry.id).desc())
        .limit(5)
    )
    threats_res = await db.execute(threats_stmt)
    top_threats = [
        {"threat_type": row[0], "count": row[1]} for row in threats_res.fetchall()
    ]

    return SummaryReport(
        total_scans=total_scans,
        dangerous_count=dangerous_count,
        suspicious_count=suspicious_count,
        safe_count=safe_count,
        avg_processing_time_ms=avg_processing_time_ms,
        top_threat_types=top_threats,
    )


@router.get("/hotspots", response_model=HotspotsReport)
async def get_hotspots(db: AsyncSession = Depends(get_db)) -> HotspotsReport:
    """Retrieve all verified ledger entries mapped to geographic coordinates."""
    stmt = select(LedgerEntry).where(LedgerEntry.verified.is_(True))
    res = await db.execute(stmt)
    entries = res.scalars().all()

    hotspots = []
    for entry in entries:
        lat, lng = get_tld_coordinates(entry.domain)
        hotspots.append(
            HotspotEntry(
                domain=entry.domain,
                threat_type=entry.threat_type,
                latitude=lat,
                longitude=lng,
                count=1,
            )
        )

    return HotspotsReport(
        hotspots=hotspots,
        generated_at=datetime.now(UTC),
    )
