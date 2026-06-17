"""
ScamSentry API — Layer 2: DNS, WHOIS & SSL Checks

Async checks using python-whois (via asyncio.to_thread) and the ssl stdlib.
Max score contribution: 25 points.
"""

from __future__ import annotations

import asyncio
import logging
import socket
import ssl
from datetime import UTC, datetime
from urllib.parse import urlparse

import httpx

from app.services.cache import (
    get_cached_domain_reputation,
    set_cached_domain_reputation,
)

logger = logging.getLogger(__name__)

MAX_L2_SCORE = 100

# Registrars frequently associated with abuse / disposable registrations
LOW_REPUTATION_REGISTRARS: list[str] = [
    "freenom",
    "todaynic",
    "eranet",
    "cheapdomain",
    "1api",
    "bizcn",
    "reg.ru",
]

# TLDs frequently associated with disposable/spam registrations
LOW_REPUTATION_TLDS: set[str] = {
    ".xyz",
    ".top",
    ".click",
    ".buzz",
    ".club",
    ".work",
    ".online",
    ".site",
}


# ── Internal helpers ──────────────────────────────────────────────────


def _extract_domain(url: str) -> str:
    """Pull the hostname out of a URL string."""
    try:
        parsed = urlparse(url if "://" in url else f"http://{url}")
        return parsed.hostname or url
    except Exception:
        return url


def _whois_lookup(domain: str) -> dict:
    """Blocking WHOIS lookup — call via asyncio.to_thread()."""
    import socket

    orig_timeout = socket.getdefaulttimeout()
    try:
        # Prevent indefinite blocking
        socket.setdefaulttimeout(3.0)
        import whois  # python-whois

        w = whois.whois(domain)
        creation_date = w.creation_date
        if isinstance(creation_date, list):
            creation_date = creation_date[0]

        registrar = w.registrar or ""
        return {
            "creation_date": creation_date,
            "registrar": registrar,
            "raw": {
                "domain_name": w.domain_name,
                "registrar": registrar,
                "creation_date": str(creation_date) if creation_date else None,
            },
        }
    except Exception as exc:
        logger.warning("WHOIS lookup failed for %s: %s", domain, exc)
        return {"creation_date": None, "registrar": "", "raw": {}}
    finally:
        socket.setdefaulttimeout(orig_timeout)


def _extract_issuer_org(cert: dict) -> str:
    """Extract organization name from certificate issuer dict."""
    try:
        for rdn in cert.get("issuer", []):
            for item in rdn:
                if item[0] == "organizationName":
                    return str(item[1])
    except Exception:
        pass
    return ""


def _check_ssl(hostname: str) -> dict:
    """Check SSL certificate validity for *hostname*."""
    result = {
        "valid": False,
        "self_signed": False,
        "expired": False,
        "issuer_org": "",
        "error": None,
    }
    try:
        ctx = ssl.create_default_context()
        with socket.create_connection((hostname, 443), timeout=5) as sock:
            with ctx.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()
                if cert:
                    result["valid"] = True
                    result["issuer_org"] = _extract_issuer_org(cert)
                    # Check expiry
                    not_after = ssl.cert_time_to_seconds(cert["notAfter"])
                    if datetime.fromtimestamp(not_after, tz=UTC) < datetime.now(UTC):
                        result["expired"] = True
                        result["valid"] = False
    except ssl.SSLCertVerificationError:
        result["self_signed"] = True
    except Exception as exc:
        result["error"] = str(exc)
    return result


async def _query_doh(name: str, record_type: str) -> list[str]:
    """Query Cloudflare DoH API for resource records."""
    try:
        url = f"https://cloudflare-dns.com/dns-query?name={name}&type={record_type}"
        headers = {"Accept": "application/dns-json"}
        async with httpx.AsyncClient(timeout=3.0) as client:
            res = await client.get(url, headers=headers)
            if res.status_code == 200:
                data = res.json()
                return [ans.get("data", "") for ans in data.get("Answer", [])]
    except Exception as exc:
        logger.warning("DoH lookup failed for %s (%s): %s", name, record_type, exc)
    return []


# ── Public API ────────────────────────────────────────────────────────


async def check_dns(url: str) -> dict:
    """
    Run L2 DNS / WHOIS / SSL checks against *url*.

    Returns
    -------
    dict
        {
            "score": int (0–25),
            "passed": bool,
            "details": { "whois": {...}, "ssl": {...}, "triggered_checks": [...] },
        }
    """
    hostname = _extract_domain(url)

    # 1. Try to read from domain reputation cache
    cached = await get_cached_domain_reputation(hostname)
    if cached is not None:
        return cached

    score = 0
    triggered: list[str] = []

    # ── 1. Domain age (WHOIS) ──────────────────────────────────────
    whois_data = await asyncio.to_thread(_whois_lookup, hostname)
    creation_date = whois_data.get("creation_date")

    if creation_date and isinstance(creation_date, datetime):
        # Ensure timezone-aware comparison
        if creation_date.tzinfo is None:
            age_days = (datetime.now(UTC).replace(tzinfo=None) - creation_date).days
        else:
            age_days = (datetime.now(UTC) - creation_date).days

        if age_days < 15:
            score += 75
            triggered.append(f"Domain is ultra-new ({age_days} days old, <15)")
        elif age_days < 60:
            score += 45
            triggered.append(f"Domain is very new ({age_days} days old, <60)")
    elif creation_date is None:
        # WHOIS lookup returned nothing — not penalised heavily
        triggered.append("WHOIS creation date unavailable")

    # ── 2. SSL certificate ─────────────────────────────────────────
    ssl_data = await asyncio.to_thread(_check_ssl, hostname)

    if ssl_data.get("self_signed") or ssl_data.get("expired"):
        score += 45
        reason = "self-signed" if ssl_data["self_signed"] else "expired"
        triggered.append(f"SSL certificate is {reason}")
    elif ssl_data.get("error") and "Connection refused" not in str(ssl_data["error"]):
        # No HTTPS at all
        if not url.lower().startswith("https"):
            score += 40
            triggered.append("No HTTPS connection available")

    # ── 3. Low-reputation registrar ────────────────────────────────
    registrar = whois_data.get("registrar", "").lower()
    for bad_reg in LOW_REPUTATION_REGISTRARS:
        if bad_reg in registrar:
            score += 30
            triggered.append(f"Low-reputation registrar: {whois_data['registrar']}")
            break

    # ── 4. DNS checks (A, AAAA, MX, SPF, DMARC via DoH) ────────────
    try:
        (
            a_answers,
            aaaa_answers,
            mx_answers,
            txt_answers,
            dmarc_answers,
        ) = await asyncio.gather(
            _query_doh(hostname, "A"),
            _query_doh(hostname, "AAAA"),
            _query_doh(hostname, "MX"),
            _query_doh(hostname, "TXT"),
            _query_doh(f"_dmarc.{hostname}", "TXT"),
            return_exceptions=True,
        )
    except Exception:
        a_answers, aaaa_answers, mx_answers, txt_answers, dmarc_answers = (
            [],
            [],
            [],
            [],
            [],
        )

    a_answers = a_answers if isinstance(a_answers, list) else []
    aaaa_answers = aaaa_answers if isinstance(aaaa_answers, list) else []
    mx_answers = mx_answers if isinstance(mx_answers, list) else []
    txt_answers = txt_answers if isinstance(txt_answers, list) else []
    dmarc_answers = dmarc_answers if isinstance(dmarc_answers, list) else []

    has_mx = len(mx_answers) > 0
    has_spf = any("v=spf1" in record.lower() for record in txt_answers)
    has_dmarc = any("v=dmarc1" in record.lower() for record in dmarc_answers)

    if not has_mx:
        score += 35
        triggered.append("Domain has no MX records (cannot receive email)")

    if not has_spf:
        score += 15
        triggered.append("Domain lacks SPF email validation headers")

    if not has_dmarc:
        score += 10
        triggered.append("Domain lacks DMARC email spoofing protections")

    # ── 5. Unresolved Domain check ─────────────────────────────────
    has_a = len(a_answers) > 0
    has_aaaa = len(aaaa_answers) > 0
    if not has_a and not has_aaaa:
        try:
            loop = asyncio.get_running_loop()
            await loop.getaddrinfo(hostname, None, family=socket.AF_UNSPEC)
            has_a = True
        except Exception:
            pass

    if not has_a and not has_aaaa:
        score += 70
        triggered.append("Domain does not resolve to any active IP address (NXDOMAIN)")

    # ── 6. Low trust SSL + ultra-new domain age combo ────────────────
    ssl_issuer = ssl_data.get("issuer_org", "").lower()
    if creation_date and isinstance(creation_date, datetime) and ssl_issuer:
        # Ensure timezone-aware comparison
        if creation_date.tzinfo is None:
            age_days = (datetime.now(UTC).replace(tzinfo=None) - creation_date).days
        else:
            age_days = (datetime.now(UTC) - creation_date).days

        # If age is under 60 days and issuer is Let's Encrypt / ZeroSSL (commonly abused by burner phishing sites)
        if age_days < 60 and any(
            keyword in ssl_issuer
            for keyword in ["let's encrypt", "zerossl", "cpanel", "sectigo"]
        ):
            score += 35
            triggered.append(
                f"Suspicious combination: newly registered domain ({age_days} days) using temporary/free SSL issuer ({ssl_data.get('issuer_org')})"
            )

    # ── 7. Low-reputation TLD check ───────────────────────────────
    for tld in LOW_REPUTATION_TLDS:
        if hostname.endswith(tld):
            score += 30
            triggered.append(f"Low-reputation TLD: {tld}")
            break

    # Cap at MAX_L2_SCORE
    capped_score = min(score, MAX_L2_SCORE)

    result = {
        "score": capped_score,
        "passed": capped_score == 0,
        "details": {
            "whois": whois_data.get("raw", {}),
            "ssl": ssl_data,
            "triggered_checks": triggered,
        },
    }

    # Store result in domain reputation cache
    await set_cached_domain_reputation(hostname, result)

    return result
