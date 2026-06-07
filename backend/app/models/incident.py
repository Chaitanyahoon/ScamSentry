"""
ScamSentry API — Incident & BrandLockdown ORM Models
"""

from __future__ import annotations

import uuid
from datetime import UTC, datetime

from sqlalchemy import Column, DateTime, String, Boolean
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

from app.database import Base


class Incident(Base):
    __tablename__ = "global_incidents"

    id = Column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    title = Column(String(512), nullable=False)
    link = Column(String(1024), nullable=False, unique=True, index=True)
    description = Column(String(2048), nullable=True)
    published_at = Column(DateTime, nullable=False, default=lambda: datetime.now(UTC))
    source = Column(String(100), nullable=False)
    is_highlight = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(UTC))

    def __repr__(self) -> str:
        return f"<Incident {self.title!r} source={self.source}>"


class BrandLockdown(Base):
    __tablename__ = "active_brand_lockdowns"

    brand_name = Column(String(100), primary_key=True)
    incident_title = Column(String(512), nullable=False)
    incident_link = Column(String(1024), nullable=False)
    reported_at = Column(DateTime, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)

    def __repr__(self) -> str:
        return f"<BrandLockdown brand={self.brand_name!r} is_active={self.is_active}>"
