import pytest
from unittest.mock import patch

from app.services.engine import run_engine


@pytest.mark.asyncio
async def test_engine_all_safe() -> None:
    # All layers return 0 score
    mock_l1 = {"score": 0, "passed": True, "details": {}}
    mock_l2 = {"score": 0, "passed": True, "details": {}}
    mock_l3 = {"score": 0, "passed": True, "details": {}}
    mock_l4 = {"score": 0, "passed": True, "details": {}}

    with (
        patch("app.services.engine.check_heuristics", return_value=mock_l1),
        patch("app.services.engine.check_dns", return_value=mock_l2),
        patch("app.services.engine.check_google_safe_browsing", return_value=mock_l3),
        patch("app.services.engine.check_ledger", return_value=mock_l4),
    ):
        res = await run_engine("https://safe-url.com")
        assert res["risk_score"] == 0
        assert res["risk_level"] == "safe"
        assert len(res["layer_results"]) == 4


@pytest.mark.asyncio
async def test_engine_suspicious_mapping() -> None:
    # Cumulative score is 45 -> suspicious
    mock_l1 = {"score": 20, "passed": False, "details": {}}
    mock_l2 = {"score": 25, "passed": False, "details": {}}
    mock_l3 = {"score": 0, "passed": True, "details": {}}
    mock_l4 = {"score": 0, "passed": True, "details": {}}

    with (
        patch("app.services.engine.check_heuristics", return_value=mock_l1),
        patch("app.services.engine.check_dns", return_value=mock_l2),
        patch("app.services.engine.check_google_safe_browsing", return_value=mock_l3),
        patch("app.services.engine.check_ledger", return_value=mock_l4),
    ):
        res = await run_engine("https://suspicious-url.com")
        assert res["risk_score"] == 45
        assert res["risk_level"] == "suspicious"


@pytest.mark.asyncio
async def test_engine_dangerous_mapping() -> None:
    # Cumulative score is 75 -> dangerous
    mock_l1 = {"score": 30, "passed": False, "details": {}}
    mock_l2 = {"score": 15, "passed": False, "details": {}}
    mock_l3 = {"score": 30, "passed": False, "details": {}}
    mock_l4 = {"score": 0, "passed": True, "details": {}}

    with (
        patch("app.services.engine.check_heuristics", return_value=mock_l1),
        patch("app.services.engine.check_dns", return_value=mock_l2),
        patch("app.services.engine.check_google_safe_browsing", return_value=mock_l3),
        patch("app.services.engine.check_ledger", return_value=mock_l4),
    ):
        res = await run_engine("https://dangerous-url.com")
        assert res["risk_score"] == 75
        assert res["risk_level"] == "dangerous"


@pytest.mark.asyncio
async def test_engine_early_exit_l1() -> None:
    # Let's mock a case where L1 + L2 is 100 (say L1 returns 30, L2 returns 75 or similar, or just sum of scores >= 100)
    # If we return L1 = 30 and L2 = 25 and L3 = 30, sum is 85.
    # What if we mock L1 = 30, L2 = 80? (Although L2 max is 25, the code allows total_score >= 100 check)
    # Let's mock L1 score = 100 (say a malformed check returned a huge score or something)
    mock_l1_huge = {"score": 100, "passed": False, "details": {}}

    with (
        patch("app.services.engine.check_heuristics", return_value=mock_l1_huge),
        patch("app.services.engine.check_dns") as mock_dns,
    ):
        res = await run_engine("https://early-exit-url.com")
        assert res["risk_score"] == 100
        # Check that check_dns (L2) was NEVER called because of early exit after L1
        mock_dns.assert_not_called()
        assert len(res["layer_results"]) == 1
