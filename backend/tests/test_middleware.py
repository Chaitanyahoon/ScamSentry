from unittest.mock import patch

import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app


@pytest.mark.asyncio
async def test_security_headers():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.get("/health")
    assert resp.status_code == 200
    assert resp.headers["x-content-type-options"] == "nosniff"
    assert resp.headers["x-frame-options"] == "DENY"
    assert resp.headers["x-xss-protection"] == "0"
    assert resp.headers["referrer-policy"] == "strict-origin-when-cross-origin"


@pytest.mark.asyncio
async def test_request_body_too_large():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.post(
            "/api/v1/scan",
            content=b"x" * 2_000_000,
            headers={"content-type": "application/json"},
        )
    assert resp.status_code == 413
    assert "too large" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_request_body_within_limit():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.post(
            "/api/v1/scan",
            content=b"{}",
            headers={"content-type": "application/json"},
        )
    assert resp.status_code != 413


@pytest.mark.asyncio
async def test_rate_limiter_degraded_mode(client):
    """When Redis is unavailable, rate limiter logs warning and passes request through."""
    from unittest.mock import patch

    mock_engine_result = {
        "risk_score": 15,
        "risk_level": "safe",
        "layer_results": [
            {"layer": "L1", "passed": True, "score_contribution": 0, "details": {}},
            {"layer": "L2", "passed": True, "score_contribution": 0, "details": {}},
            {"layer": "L3", "passed": True, "score_contribution": 0, "details": {}},
            {"layer": "L4", "passed": True, "score_contribution": 0, "details": {}},
        ],
        "processing_time_ms": 5,
    }

    with (
        patch(
            "app.middleware.rate_limit.RateLimitMiddleware._get_redis",
            return_value=None,
        ),
        patch("app.routers.scan.run_engine", return_value=mock_engine_result),
    ):
        resp = await client.post(
            "/api/v1/scan",
            json={"url": "https://degraded-test.example.com"},
        )
    assert resp.status_code == 200
    data = resp.json()
    assert data["risk_level"] == "safe"
