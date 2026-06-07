"""
ScamSentry API — Report schemas (Pydantic v2).
"""

from datetime import datetime

from pydantic import BaseModel


class SummaryReport(BaseModel):
    """Aggregate scan statistics."""

    total_scans: int
    dangerous_count: int
    suspicious_count: int
    safe_count: int
    avg_processing_time_ms: float
    top_threat_types: list[dict]


class HotspotEntry(BaseModel):
    """Single geographic threat hotspot."""

    domain: str
    threat_type: str
    latitude: float
    longitude: float
    count: int


class HotspotsReport(BaseModel):
    """Collection of threat hotspots for the map view."""

    hotspots: list[HotspotEntry]
    generated_at: datetime
