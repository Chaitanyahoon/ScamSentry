"""
ScamSentry API — Layer 1: Heuristic URL Analysis

Pure-Python synchronous checks. No external API calls.
Max score contribution: 100 points.
"""

from __future__ import annotations

import difflib
import math
import re
from urllib.parse import urlparse

# ── Constants ─────────────────────────────────────────────────────────

MAX_L1_SCORE = 100

SPOOFED_BRANDS_PATTERN = re.compile(
    r"(paypal|apple|google|microsoft|amazon|netflix|meta|facebook|instagram|bankofamerica|chase|wellsfargo|binance|coinbase|stripe|twitch|adobe|dropbox|uber|airbnb|spotify)-?(login|secure|verify|update|support|auth|billing|account|confirm|validate|check)",
    re.IGNORECASE
)

SUSPICIOUS_KEYWORDS_PATTERN = re.compile(
    r"(free-iphone|hack|crack|cheats|generator|giveaway|claim-prize|free-money|verification-required|update-payment|urgent-action|account-suspended|confirm-identity|unusual-activity|click-here|act-now|limited-time|verify-account|unlock-account|suspicious-activity|click-link|validate-card|re-enter-password)",
    re.IGNORECASE
)

FREE_HOSTING_PATTERN = re.compile(
    r"\.(000webhostapp|herokuapp|vercel|netlify|onrender|pythonanywhere|duckdns|bounceme|no-ip|ngrok|replit|github\.io|pages|surge\.sh|netlify\.app|vercel\.app)\.",
    re.IGNORECASE
)

LOOKALIKE_TLDS: set[str] = {
    ".xyz", ".top", ".buzz", ".cn", ".ru", ".cc", ".pw", ".su", ".info", ".loan",
    ".club", ".work", ".gq", ".win", ".bid", ".tk", ".ml", ".ga", ".cf", ".zip",
    ".ltd", ".review", ".hair", ".racing", ".science", ".online", ".site", ".space",
    ".store", ".download", ".stream", ".webcam", ".accountant", ".date", ".men",
    ".monster"
}

IP_ADDRESS_PATTERN = re.compile(r"^https?://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}")

MONITORED_BRANDS: list[str] = [
    "vercel",
    "github",
    "paypal",
    "paytm",
    "amazon",
    "google",
    "microsoft",
    "apple",
    "facebook",
    "phonepe",
    "sbi",
    "hdfc",
    "uber",
    "tesla",
    "openai",
    "linkedin",
    "twitter",
    "whatsapp",
    "telegram",
    "discord",
]

HOMOGLYPH_MAP: dict[str, str] = {
    'а': 'a', 'е': 'e', 'і': 'i', 'о': 'o', 'р': 'p', 'с': 'c', 'у': 'y', 'х': 'x',
    'А': 'A', 'Е': 'E', 'І': 'I', 'О': 'O', 'Р': 'P', 'С': 'C', 'У': 'Y', 'Х': 'X',
    'α': 'a', 'ε': 'e', 'ι': 'i', 'ο': 'o', 'ρ': 'p', 'ν': 'v', 'τ': 't', 'χ': 'x',
    'ɩ': 'i', 'Ɩ': 'I', 'օ': 'o', 'ԁ': 'd', 'զ': 'q', 'ｗ': 'w', 'ｖ': 'v', 'ｕ': 'u',
    '0': 'o', '1': 'l',
}


# ── Internal Helpers ──────────────────────────────────────────────────


def _normalize_homoglyphs(text: str) -> str:
    return "".join(HOMOGLYPH_MAP.get(c, c) for c in text)


def _levenshtein_distance(a: str, b: str) -> int:
    if len(a) < len(b):
        return _levenshtein_distance(b, a)
    if len(b) == 0:
        return len(a)
    previous_row = range(len(b) + 1)
    for i, c1 in enumerate(a):
        current_row = [i + 1]
        for j, c2 in enumerate(b):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    return previous_row[-1]


def _calculate_entropy(s: str) -> float:
    if not s:
        return 0.0
    entropy = 0.0
    for x in range(256):
        p_x = s.count(chr(x)) / len(s)
        if p_x > 0:
            entropy += - p_x * math.log2(p_x)
    return entropy


def _check_brand_mimicry(domain: str) -> str | None:
    """Check if any label inside the domain closely mimics a monitored brand."""
    domain_clean = domain.lower()
    parts = re.split(r"[-.]", domain_clean)
    for part in parts:
        if not part:
            continue
        for brand in MONITORED_BRANDS:
            # Skip exact matches
            if part == brand:
                continue
            ratio = difflib.SequenceMatcher(None, part, brand).ratio()
            if ratio >= 0.8:
                return brand
    return None


# ── Public API ────────────────────────────────────────────────────────


def check_heuristics(url: str) -> dict:
    """
    Run all L1 heuristic checks against *url*.

    Returns
    -------
    dict
        {
            "score": int (0–100),
            "passed": bool (True if score == 0),
            "details": {"triggered_rules": [...]},
        }
    """
    score = 0
    triggered: list[str] = []

    try:
        parsed = urlparse(url if "://" in url else f"http://{url}")
        hostname: str = parsed.hostname or ""
        full_url: str = url.lower()
    except Exception:
        return {
            "score": MAX_L1_SCORE,
            "passed": False,
            "details": {"triggered_rules": ["URL failed to parse"]},
        }

    # 1. IP address instead of domain name → +80
    if IP_ADDRESS_PATTERN.search(full_url):
        score += 80
        triggered.append("URL contains IP address instead of domain name")

    # 2. More than 4 subdomains → +40
    if hostname:
        subdomain_count = hostname.count(".")
        if subdomain_count > 4:
            score += 40
            triggered.append(f"Domain has {subdomain_count} subdomain levels (>4)")

    # 3. Spoofed Brands (Keywords combination) → +90
    if SPOOFED_BRANDS_PATTERN.search(full_url):
        score += 90
        triggered.append("URL structure mimics official brands using phishing keywords (e.g., login/verify)")

    # 4. Suspicious General Keywords → +30
    if SUSPICIOUS_KEYWORDS_PATTERN.search(full_url):
        score += 30
        triggered.append("URL contains high-risk scam incentive or urgency terminology")

    # 5. Free Hosting / DDNS → +45
    is_trusted = any(hostname == d or hostname.endswith("." + d) for d in ["scam-sentry.vercel.app", "scam-sentry.app", "scamsentry.app", "scamsentry.com"])
    if FREE_HOSTING_PATTERN.search(full_url) and not is_trusted:
        score += 45
        triggered.append("Domain relies on free hosting or Dynamic DNS, commonly abused by burner phishing sites")

    # 6. Lookalike TLDs → +50
    if hostname:
        for tld in LOOKALIKE_TLDS:
            if hostname.endswith(tld):
                score += 50
                triggered.append(f"Lookalike TLD detected: '{tld}'")
                break

    # 7. Excessive special characters (>3 hyphens) → +35
    special_count = hostname.count("-")
    if special_count >= 3:
        score += 35
        triggered.append(f"Excessive hyphens: {special_count} dashes")

    # 8. Domain length > 30 characters → +20
    if hostname and len(hostname) > 30:
        score += 20
        triggered.append(f"Domain length is {len(hostname)} characters (>30)")

    # 9. URL contains '@' symbol → +80
    if "@" in full_url:
        score += 80
        triggered.append("URL contains '@' symbol (common phishing trick)")

    # 10. Newly-registered pattern: <30 chars but 3+ numeric segments → +35
    if hostname and len(hostname) < 30:
        numeric_segments = [
            seg for seg in hostname.split(".") if any(c.isdigit() for c in seg)
        ]
        if len(numeric_segments) >= 3:
            score += 35
            triggered.append("Domain has 3+ segments containing digits (newly-registered pattern)")

    # 11. Brand mimicry detection → +90
    if hostname:
        mimicked = _check_brand_mimicry(hostname)
        if mimicked:
            score += 90
            triggered.append(f"Domain mimics monitored brand '{mimicked}'")

    # 12. Subdomain brand injection detection → +90
    if hostname:
        parts = hostname.split(".")
        if len(parts) > 2:
            for part in parts[:-2]:
                if part in MONITORED_BRANDS:
                    score += 90
                    triggered.append(f"Suspicious subdomain includes a major brand name as an embedded component: '{part}'")
                    break

    # 13. Homoglyph / visual lookalike character detection → +90
    if hostname:
        normalized = _normalize_homoglyphs(hostname)
        if hostname != normalized:
            score += 90
            triggered.append(f"Visual Spoofing detected: Hostname uses lookalike characters to mimic '{normalized}'")

    # 14. Homoglyph Punycode detection → +80
    if hostname and hostname.startswith("xn--"):
        score += 80
        triggered.append("Domain uses IDN Punycode encoding (potential homoglyph/spoofing)")

    # 15. Path and Query Entropy Analysis → +40
    path_and_query = parsed.path + parsed.query
    if len(path_and_query) > 30:
        entropy = _calculate_entropy(path_and_query)
        if entropy > 5.2:
            score += 40
            triggered.append(f"URL path/query has extreme entropy ({entropy:.2f}). Heavy obfuscation marker.")

    # Cap at MAX_L1_SCORE
    capped_score = min(score, MAX_L1_SCORE)

    return {
        "score": capped_score,
        "passed": capped_score == 0,
        "details": {"triggered_rules": triggered},
    }
