import pytest
from unittest.mock import patch

from app.models.scan import Scan, ScanStatus, RiskLevel
from app.models.ledger import LedgerEntry


# ── Health Endpoint Tests ─────────────────────────────────────────────


@pytest.mark.asyncio
async def test_health_check(client) -> None:
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "timestamp" in data
    assert data["environment"] == "development"


@pytest.mark.asyncio
async def test_health_check_text(client) -> None:
    response = await client.get("/health?format=text")
    assert response.status_code == 200
    assert response.text == "OK"
    assert "text/plain" in response.headers["content-type"]


# ── Scan Router Tests ─────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_create_scan_success(client, db) -> None:
    # We mock engine.run_engine to return a controlled result
    mock_engine_result = {
        "risk_score": 35,
        "risk_level": "suspicious",
        "layer_results": [
            {"layer": "L1", "passed": False, "score_contribution": 10, "details": {}},
            {"layer": "L2", "passed": False, "score_contribution": 25, "details": {}},
            {"layer": "L3", "passed": True, "score_contribution": 0, "details": {}},
            {"layer": "L4", "passed": True, "score_contribution": 0, "details": {}},
        ],
        "processing_time_ms": 120,
    }

    with patch("app.routers.scan.run_engine", return_value=mock_engine_result):
        payload = {"url": "https://suspicious-target.com"}
        response = await client.post("/api/v1/scan", json=payload)

        assert response.status_code == 200
        data = response.json()
        assert data["url"] == "https://suspicious-target.com/"
        assert data["risk_score"] == 35
        assert data["safety_score"] == 65
        assert data["risk_level"] == "suspicious"
        assert data["cached"] is False
        assert len(data["layer_results"]) == 4

        # Verify database persistence
        import uuid

        scan_id_uuid = uuid.UUID(data["scan_id"])
        from sqlalchemy import select

        stmt = select(Scan).where(Scan.id == scan_id_uuid)
        res = await db.execute(stmt)
        scan = res.scalar_one_or_none()
        assert scan is not None
        assert scan.url == "https://suspicious-target.com/"
        assert scan.status == ScanStatus.complete
        assert scan.risk_score == 35
        assert len(scan.results) == 4


@pytest.mark.asyncio
async def test_create_scan_invalid_url(client) -> None:
    # Invalid URL formatting
    payload = {"url": "not-a-valid-url"}
    response = await client.post("/api/v1/scan", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_get_scan_not_found(client) -> None:
    import uuid

    random_uuid = uuid.uuid4()
    response = await client.get(f"/api/v1/scan/{random_uuid}")
    assert response.status_code == 404
    assert response.json()["detail"] == "Scan not found"


# ── Report Router Tests ───────────────────────────────────────────────


@pytest.mark.asyncio
async def test_report_summary(client, db) -> None:
    # Insert dummy scans
    scan1 = Scan(
        url="https://a.com",
        status=ScanStatus.complete,
        risk_score=10,
        risk_level=RiskLevel.safe,
        processing_time_ms=50,
    )
    scan2 = Scan(
        url="https://b.com",
        status=ScanStatus.complete,
        risk_score=85,
        risk_level=RiskLevel.dangerous,
        processing_time_ms=150,
    )
    db.add(scan1)
    db.add(scan2)

    # Insert dummy threat ledger items for top threats
    entry1 = LedgerEntry(
        domain="evil-a.com",
        threat_type="phishing",
        confidence=90,
        source="admin",
        verified=True,
    )
    entry2 = LedgerEntry(
        domain="evil-b.com",
        threat_type="phishing",
        confidence=80,
        source="admin",
        verified=True,
    )
    db.add(entry1)
    db.add(entry2)
    await db.commit()

    response = await client.get("/api/v1/report/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_scans"] == 2
    assert data["safe_count"] == 1
    assert data["dangerous_count"] == 1
    assert data["avg_processing_time_ms"] == 100.0
    assert len(data["top_threat_types"]) == 1
    assert data["top_threat_types"][0]["threat_type"] == "phishing"
    assert data["top_threat_types"][0]["count"] == 2


@pytest.mark.asyncio
async def test_report_hotspots(client, db) -> None:
    # Insert verified ledger entries
    entry = LedgerEntry(
        domain="evil-hotspot.uk",
        threat_type="job_scam",
        confidence=100,
        source="admin",
        verified=True,
    )
    db.add(entry)
    await db.commit()

    response = await client.get("/api/v1/report/hotspots")
    assert response.status_code == 200
    data = response.json()
    assert len(data["hotspots"]) == 1
    assert data["hotspots"][0]["domain"] == "evil-hotspot.uk"
    assert data["hotspots"][0]["threat_type"] == "job_scam"
    # Verification of TLD coordinates mapping: .uk should map to London (51.5074, -0.1278)
    assert data["hotspots"][0]["latitude"] == 51.5074
    assert data["hotspots"][0]["longitude"] == -0.1278


# ── Admin Router & Authentication Tests ───────────────────────────────


@pytest.mark.asyncio
async def test_create_ledger_entry_no_auth(client) -> None:
    payload = {
        "domain": "hacker.com",
        "threat_type": "phishing",
        "confidence": 95,
    }
    response = await client.post("/api/v1/admin/ledger", json=payload)
    # Header missing X-Admin-Key
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_ledger_entry_invalid_auth(client) -> None:
    payload = {
        "domain": "hacker.com",
        "threat_type": "phishing",
        "confidence": 95,
    }
    headers = {"X-Admin-Key": "wrong-secret-key"}
    response = await client.post("/api/v1/admin/ledger", json=payload, headers=headers)
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid or missing admin key"


@pytest.mark.asyncio
async def test_create_ledger_entry_success(client, db) -> None:
    payload = {
        "domain": "hacker-success.com",
        "threat_type": "phishing",
        "confidence": 95,
    }
    headers = {"X-Admin-Key": "test-admin-secret-key-12345"}
    response = await client.post("/api/v1/admin/ledger", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["domain"] == "hacker-success.com"
    assert data["verified"] is True

    # Check database persistence
    from sqlalchemy import select

    stmt = select(LedgerEntry).where(LedgerEntry.domain == "hacker-success.com")
    res = await db.execute(stmt)
    entry = res.scalar_one_or_none()
    assert entry is not None
    assert entry.threat_type == "phishing"
    assert entry.verified is True


@pytest.mark.asyncio
async def test_sync_osint_success(client, db) -> None:
    import uuid

    # Mock URLhaus response payload
    mock_urlhaus_payload = {
        "query_status": "ok",
        "urls": [
            {
                "id": "12345",
                "url": "https://urlhaus-threat-example.com/malware.exe",
                "url_status": "online",
                "threat": "malware",
                "reporter": "admin",
                "tags": ["exe", "malware"],
            },
            {
                "id": "67890",
                "url": "http://already-existing-domain.com/phish",
                "url_status": "online",
                "threat": "phishing",
                "reporter": "admin",
                "tags": ["phish"],
            },
            {
                "id": "11111",
                "url": "https://offline-example.com/login",
                "url_status": "offline",  # should be filtered out
                "threat": "phishing",
            },
        ],
    }

    # Pre-populate already-existing-domain.com in the database to test deduplication
    existing_entry = LedgerEntry(
        id=uuid.uuid4(),
        domain="already-existing-domain.com",
        threat_type="phishing",
        confidence=100,
        source="admin",
        verified=True,
    )
    db.add(existing_entry)
    await db.commit()

    # We patch httpx.AsyncClient.get to return a mock response
    class MockResponse:
        def __init__(self, json_data, status_code=200):
            self._json_data = json_data
            self.status_code = status_code

        def json(self):
            return self._json_data

    headers = {"X-Admin-Key": "test-admin-secret-key-12345"}

    with patch(
        "httpx.AsyncClient.get", return_value=MockResponse(mock_urlhaus_payload)
    ):
        response = await client.post("/api/v1/admin/sync-osint", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert (
            data["processed"] == 2
        )  # online ones: urlhaus-threat-example.com and already-existing-domain.com
        assert (
            data["inserted"] == 1
        )  # only urlhaus-threat-example.com is inserted (already-existing-domain.com is skipped)

        # Verify persistence of the newly synchronized domain
        from sqlalchemy import select

        stmt = select(LedgerEntry).where(
            LedgerEntry.domain == "urlhaus-threat-example.com"
        )
        res = await db.execute(stmt)
        entry = res.scalar_one_or_none()
        assert entry is not None
        assert entry.threat_type == "malware"
        assert entry.source == "OSINT Threat Feed (URLhaus)"
        assert entry.verified is True


# ── Advisory & Lockdown Incident Tests ─────────────────────────────────


@pytest.mark.asyncio
async def test_get_incidents(client, db) -> None:
    # Insert some dummy incidents
    import uuid
    from datetime import datetime, UTC
    from app.models.incident import Incident

    inc1 = Incident(
        id=uuid.uuid4(),
        title="Critical Ransomware Attack",
        link="https://incident-a.com/attack",
        description="A major ransomware attack on critical infrastructure.",
        published_at=datetime.now(UTC).replace(tzinfo=None),
        source="BleepingComputer",
        is_highlight=True,
        created_at=datetime.now(UTC).replace(tzinfo=None),
    )
    inc2 = Incident(
        id=uuid.uuid4(),
        title="Nominal Phishing Wave",
        link="https://incident-b.com/phish",
        description="A minor phishing campaign spotted.",
        published_at=datetime.now(UTC).replace(tzinfo=None),
        source="The Hacker News",
        is_highlight=False,
        created_at=datetime.now(UTC).replace(tzinfo=None),
    )
    db.add(inc1)
    db.add(inc2)
    await db.commit()

    response = await client.get("/api/v1/incidents")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2
    titles = [x["title"] for x in data]
    assert "Critical Ransomware Attack" in titles
    assert "Nominal Phishing Wave" in titles


@pytest.mark.asyncio
async def test_get_brand_lockdowns(client, db) -> None:
    # Insert dummy brand lockdown
    from datetime import datetime, UTC, timedelta
    from app.models.incident import BrandLockdown

    lockdown = BrandLockdown(
        brand_name="vercel",
        incident_title="Vercel Domain Hijack",
        incident_link="https://vercel-hijack-alert.org",
        reported_at=datetime.now(UTC).replace(tzinfo=None),
        expires_at=datetime.now(UTC).replace(tzinfo=None) + timedelta(days=5),
        is_active=True,
    )
    db.add(lockdown)
    await db.commit()

    response = await client.get("/api/v1/brand-lockdowns")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    brands = [x["brand_name"] for x in data]
    assert "vercel" in brands


@pytest.mark.asyncio
async def test_trigger_scrape_incidents_success(client) -> None:
    headers = {"X-Admin-Key": "test-admin-secret-key-12345"}
    # Mock the scrape_cyber_incidents service call to avoid making network requests
    with patch(
        "app.routers.incident.scrape_cyber_incidents",
        return_value={"processed": 5, "lockdowns_triggered": 1},
    ):
        response = await client.post("/api/v1/admin/scrape-incidents", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "queued" in data["message"].lower()
