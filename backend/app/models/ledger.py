"""
ScamSentry API — LedgerEntry ORM model.

Community / admin-maintained threat ledger for known malicious domains.
"""

import uuid
from datetime import UTC, datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

from app.database import Base


class LedgerEntry(Base):
    __tablename__ = "ledger"

    id = Column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    domain = Column(String(255), unique=True, index=True, nullable=False)
    threat_type = Column(
        String(100), nullable=False
    )  # e.g. "phishing", "job_scam", "malware"
    confidence = Column(Integer, nullable=False, default=0)  # 0–100
    source = Column(String(100), nullable=False)  # "community", "admin", "automated"
    reported_at = Column(DateTime, default=lambda: datetime.now(UTC))
    verified = Column(Boolean, default=False)

    def __repr__(self) -> str:
        return f"<LedgerEntry {self.domain!r} type={self.threat_type} verified={self.verified}>"
