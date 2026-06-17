"""
ScamSentry API — Scan request / response schemas (Pydantic v2).
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, HttpUrl


class ScanRequest(BaseModel):
    """Incoming scan request — a single URL to analyse."""

    url: HttpUrl


class LayerResult(BaseModel):
    """Per-layer detection result."""

    layer: str
    passed: bool
    score_contribution: int
    details: dict


class ScanResponse(BaseModel):
    """Full scan response returned to the frontend."""

    scan_id: str
    url: str
    risk_score: int  # 0-100 (risk metric)
    safety_score: int  # 0-100 (safety/trust metric: 100 is safe, 0 is unsafe)
    risk_level: str  # "safe" | "suspicious" | "dangerous"
    layer_results: list[LayerResult]
    processing_time_ms: int
    cached: bool
    submitted_at: datetime

    model_config = ConfigDict(from_attributes=True)


class VoteRequest(BaseModel):
    """Payload for submitting a community vote on domain safety."""

    url: str
    vote: str
    threat_type: str = "community_flagged"


class VoteResponse(BaseModel):
    """Response returned after processing a community vote."""

    success: bool
    message: str
    domain: str
    confidence: int
    verified: bool
