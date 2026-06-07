import pytest
from unittest.mock import patch, MagicMock

from app.services.l1_heuristics import check_heuristics
from app.services.l2_dns import check_dns
from app.services.l3_threat import check_google_safe_browsing
from app.services.l4_ledger import check_ledger
from app.services.cache import get_cached_scan, set_cached_scan
from app.models.ledger import LedgerEntry


# ── L1 Heuristics Tests ────────────────────────────────────────────────

def test_l1_heuristics_safe() -> None:
    res = check_heuristics("https://google.com")
    assert res["score"] == 0
    assert res["passed"] is True
    assert len(res["details"]["triggered_rules"]) == 0


def test_l1_heuristics_malicious() -> None:
    # IP address (+20), lookalike TLD (.tk) (+15), scam keywords (+10 each)
    # Total score should cap at 100
    res = check_heuristics("http://192.168.1.1/free-job-urgent-offer.tk")
    assert res["score"] == 100
    assert res["passed"] is False
    assert len(res["details"]["triggered_rules"]) > 0


# ── L2 DNS / WHOIS / SSL Tests ────────────────────────────────────────

@pytest.mark.asyncio
async def test_l2_dns_safe() -> None:
    mock_whois = {
        "creation_date": None,
        "registrar": "Google LLC",
        "raw": {"domain_name": "google.com", "registrar": "Google LLC", "creation_date": None},
    }
    mock_ssl = {"valid": True, "self_signed": False, "expired": False, "error": None}

    async def mock_query_doh(name, record_type):
        if record_type == "MX":
            return ["10 mail.example.com"]
        if record_type == "TXT" and not name.startswith("_dmarc"):
            return ["v=spf1 include:_spf.google.com ~all"]
        if record_type == "TXT" and name.startswith("_dmarc"):
            return ["v=DMARC1; p=reject"]
        return []

    with patch("app.services.l2_dns._whois_lookup", return_value=mock_whois), \
         patch("app.services.l2_dns._check_ssl", return_value=mock_ssl), \
         patch("app.services.l2_dns._query_doh", side_effect=mock_query_doh):
        res = await check_dns("https://google.com")
        assert res["score"] == 0
        assert res["passed"] is True


@pytest.mark.asyncio
async def test_l2_dns_malicious() -> None:
    # Registrar is low-reputation (+30), SSL is self-signed (+45) -> total capped at 100
    mock_whois = {
        "creation_date": None,
        "registrar": "namecheap",
        "raw": {"domain_name": "evil.tk", "registrar": "namecheap", "creation_date": None},
    }
    mock_ssl = {"valid": False, "self_signed": True, "expired": False, "error": None}

    async def mock_query_doh(name, record_type):
        if record_type == "MX":
            return ["10 mail.example.com"]
        if record_type == "TXT" and not name.startswith("_dmarc"):
            return ["v=spf1 include:_spf.google.com ~all"]
        if record_type == "TXT" and name.startswith("_dmarc"):
            return ["v=DMARC1; p=reject"]
        return []

    with patch("app.services.l2_dns._whois_lookup", return_value=mock_whois), \
         patch("app.services.l2_dns._check_ssl", return_value=mock_ssl), \
         patch("app.services.l2_dns._query_doh", side_effect=mock_query_doh):
        res = await check_dns("https://evil.tk")
        assert res["score"] == 75
        assert res["passed"] is False


# ── L3 Google Safe Browsing Tests ─────────────────────────────────────

@pytest.mark.asyncio
async def test_l3_google_safe_browsing_no_key() -> None:
    # When API key is not configured, it should skip gracefully with score 0
    with patch("app.services.l3_threat.get_settings") as mock_settings:
        mock_settings.return_value.GOOGLE_SAFE_BROWSING_API_KEY = ""
        res = await check_google_safe_browsing("https://test.com")
        assert res["score"] == 0
        assert res["passed"] is True
        assert "skipped" in res["details"]


@pytest.mark.asyncio
async def test_l3_google_safe_browsing_flagged() -> None:
    # Flagged url
    with patch("app.services.l3_threat.get_settings") as mock_settings, \
         patch("httpx.AsyncClient.post") as mock_post:
        mock_settings.return_value.GOOGLE_SAFE_BROWSING_API_KEY = "test-key"

        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "matches": [
                {
                    "threatType": "SOCIAL_ENGINEERING",
                    "platformType": "ANY_PLATFORM",
                    "threat": {"url": "https://malicious.com"},
                }
            ]
        }
        mock_post.return_value = mock_resp

        res = await check_google_safe_browsing("https://malicious.com")
        assert res["score"] == 100
        assert res["passed"] is False
        assert len(res["details"]["matches"]) == 1


# ── L4 Ledger Tests ───────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_l4_ledger(db) -> None:
    # Populate DB with ledger entries
    verified_entry = LedgerEntry(
        domain="evil.com",
        threat_type="phishing",
        confidence=100,
        source="admin",
        verified=True,
    )
    unverified_entry = LedgerEntry(
        domain="suspicious.com",
        threat_type="malware",
        confidence=60,
        source="community",
        verified=False,
    )
    db.add(verified_entry)
    db.add(unverified_entry)
    await db.commit()

    # Exact verified match -> +100
    res1 = await check_ledger("https://evil.com/path", db)
    assert res1["score"] == 100
    assert res1["passed"] is False
    assert res1["details"]["match"]["verified"] is True

    # Subdomain verified match -> +100
    res2 = await check_ledger("https://sub.evil.com/path", db)
    assert res2["score"] == 100
    assert res2["passed"] is False

    # Unverified match -> +60
    res3 = await check_ledger("https://suspicious.com", db)
    assert res3["score"] == 60
    assert res3["passed"] is False

    # No match -> 0
    res4 = await check_ledger("https://safe.com", db)
    assert res4["score"] == 0
    assert res4["passed"] is True


# ── Redis Cache Tests ─────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_redis_cache_operations() -> None:
    url = "https://example-test-cache.com"
    data = {"scan_id": "test-id", "risk_score": 10}

    # Verify cache miss
    cached = await get_cached_scan(url)
    assert cached is None

    # Set cache
    await set_cached_scan(url, data)

    # Verify cache hit
    cached = await get_cached_scan(url)
    assert cached is not None
    assert cached["scan_id"] == "test-id"
    assert cached["risk_score"] == 10


# ── New Platform Optimizations Tests ───────────────────────────────────

def test_l1_brand_mimicry() -> None:
    # Mimics github but with typo (+15) -> total score capped at 30
    res = check_heuristics("https://githb-security.com")
    assert res["score"] >= 15
    assert res["passed"] is False
    assert any("mimics monitored brand" in r for r in res["details"]["triggered_rules"])


def test_l1_homoglyph_punycode() -> None:
    # Punycode starts with xn-- (+15)
    res = check_heuristics("https://xn--gthb-qqa.com")
    assert res["score"] >= 15
    assert res["passed"] is False
    assert any("Punycode" in r for r in res["details"]["triggered_rules"])


@pytest.mark.asyncio
async def test_l2_dns_doh_penalties() -> None:
    mock_whois = {
        "creation_date": None,
        "registrar": "Google LLC",
        "raw": {"domain_name": "google.com", "registrar": "Google LLC", "creation_date": None},
    }
    mock_ssl = {"valid": True, "self_signed": False, "expired": False, "error": None}

    # Simulate missing MX, SPF, DMARC (return empty lists)
    with patch("app.services.l2_dns._whois_lookup", return_value=mock_whois), \
         patch("app.services.l2_dns._check_ssl", return_value=mock_ssl), \
         patch("app.services.l2_dns._query_doh", return_value=[]):
        res = await check_dns("https://google.com")
        # MX missing (+35), SPF missing (+15), DMARC missing (+10) -> total 60
        assert res["score"] == 60
        assert res["passed"] is False
        assert any("no MX records" in r for r in res["details"]["triggered_checks"])
        assert any("lacks SPF" in r for r in res["details"]["triggered_checks"])
        assert any("lacks DMARC" in r for r in res["details"]["triggered_checks"])


@pytest.mark.asyncio
async def test_l3_threat_urlhaus_flagged() -> None:
    with patch("app.services.l3_threat.get_settings") as mock_settings, \
         patch("app.services.l3_threat.check_urlhaus", return_value=True):
        mock_settings.return_value.GOOGLE_SAFE_BROWSING_API_KEY = "" # Skip GSB
        res = await check_google_safe_browsing("https://malicious-urlhaus.com")
        assert res["score"] == 100
        assert res["passed"] is False
        assert len(res["details"]["matches"]) == 1
        assert res["details"]["matches"][0]["threat_type"] == "URLHAUS_MALICIOUS"


@pytest.mark.asyncio
async def test_cache_prewarming() -> None:
    from app.services.cache import prewarm_cache, get_cached_domain_reputation
    # Prewarm
    await prewarm_cache()
    # Check if google.com is pre-warmed
    cached = await get_cached_domain_reputation("google.com")
    assert cached is not None
    assert cached["score"] == 0
    assert cached["passed"] is True


def test_assemble_db_url() -> None:
    from app.config import Settings
    
    # 1. postgresql:// target
    res1 = Settings.assemble_db_url("postgresql://postgres:password@localhost:5432/scamsentry")
    assert res1 == "postgresql+asyncpg://postgres:password@localhost:5432/scamsentry"
    
    # 2. postgres:// target
    res2 = Settings.assemble_db_url("postgres://user:pass@render.com:5432/db")
    assert res2 == "postgresql+asyncpg://user:pass@render.com:5432/db"
    
    # 3. Already correct target
    res3 = Settings.assemble_db_url("postgresql+asyncpg://user:pass@localhost/db")
    assert res3 == "postgresql+asyncpg://user:pass@localhost/db"
    
    # 4. Other types/values
    res4 = Settings.assemble_db_url("sqlite:///:memory:")
    assert res4 == "sqlite:///:memory:"

