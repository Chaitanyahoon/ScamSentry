"""
ScamSentry API — Scan & ScanResult ORM models.
"""

import enum
import uuid
from datetime import UTC, datetime

from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    String,
    Boolean,
    JSON,
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship

from app.database import Base


# ── Enums ─────────────────────────────────────────────────────────────


class ScanStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    complete = "complete"
    error = "error"


class RiskLevel(str, enum.Enum):
    safe = "safe"
    suspicious = "suspicious"
    dangerous = "dangerous"


class LayerName(str, enum.Enum):
    L1 = "L1"
    L2 = "L2"
    L3 = "L3"
    L4 = "L4"


# ── Scan ──────────────────────────────────────────────────────────────


class Scan(Base):
    __tablename__ = "scans"

    id = Column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    url = Column(String(2048), nullable=False, index=True)
    submitted_at = Column(DateTime, default=lambda: datetime.now(UTC))
    status = Column(
        Enum(ScanStatus),
        nullable=False,
        default=ScanStatus.pending,
    )
    risk_score = Column(Integer, nullable=True)
    risk_level = Column(Enum(RiskLevel), nullable=True, index=True)
    processing_time_ms = Column(Integer, nullable=True)

    __table_args__ = (Index("ix_scans_status", "status"),)

    # Relationship
    results = relationship(
        "ScanResult",
        back_populates="scan",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Scan {self.id} url={self.url!r} status={self.status}>"


# ── ScanResult ────────────────────────────────────────────────────────


class ScanResult(Base):
    __tablename__ = "scan_results"

    id = Column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    scan_id = Column(
        PG_UUID(as_uuid=True),
        ForeignKey("scans.id", ondelete="CASCADE"),
        nullable=False,
    )
    layer = Column(Enum(LayerName), nullable=False)
    passed = Column(Boolean, nullable=False)
    score_contribution = Column(Integer, nullable=False, default=0)
    details = Column(JSON, nullable=True)
    checked_at = Column(DateTime, default=lambda: datetime.now(UTC))

    # Relationship
    scan = relationship("Scan", back_populates="results")

    def __repr__(self) -> str:
        return f"<ScanResult {self.layer} scan_id={self.scan_id} score={self.score_contribution}>"
