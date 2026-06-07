"""
ScamSentry API — Incident & BrandLockdown Pydantic Schemas (Pydantic v2)
"""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class IncidentResponse(BaseModel):
    id: uuid.UUID
    title: str
    link: str
    description: str | None = None
    published_at: datetime
    source: str
    is_highlight: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BrandLockdownResponse(BaseModel):
    brand_name: str
    incident_title: str
    incident_link: str
    reported_at: datetime
    expires_at: datetime
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
