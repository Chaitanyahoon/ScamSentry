"""ScamSentry API — Pydantic schemas package."""

from app.schemas.scan import ScanRequest, ScanResponse, LayerResult
from app.schemas.report import SummaryReport, HotspotEntry, HotspotsReport

__all__ = [
    "ScanRequest",
    "ScanResponse",
    "LayerResult",
    "SummaryReport",
    "HotspotEntry",
    "HotspotsReport",
]
