"""
ScamSentry API — Layer 3: Google Safe Browsing & URLhaus Threat Intelligence

Calls the Safe Browsing v4 API and the public URLhaus API to check if a URL is flagged.
Max score contribution: 30 points.
"""

from __future__ import annotations

import asyncio
import logging

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)

MAX_L3_SCORE = 100

SAFE_BROWSING_URL = "https://safebrowsing.googleapis.com/v4/threatMatches:find"


async def check_urlhaus(url: str) -> bool:
    """Check URLhaus API for threat matching."""
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            res = await client.post(
                "https://urlhaus-api.abuse.ch/v1/url/", data={"url": url}
            )
            if res.status_code == 200:
                data = res.json()
                return data.get("query_status") == "ok"
    except Exception as exc:
        logger.warning("URLhaus API call failed for %s: %s", url, exc)
    return False


async def _check_gsb(url: str, api_key: str) -> dict:
    """Helper to query Google Safe Browsing."""
    payload = {
        "client": {
            "clientId": "scamsentry-backend",
            "clientVersion": "1.0.0",
        },
        "threatInfo": {
            "threatTypes": [
                "MALWARE",
                "SOCIAL_ENGINEERING",
                "UNWANTED_SOFTWARE",
                "POTENTIALLY_HARMFUL_APPLICATION",
            ],
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": [{"url": url}],
        },
    }

    async with httpx.AsyncClient(timeout=6.0) as client:
        response = await client.post(
            SAFE_BROWSING_URL,
            params={"key": api_key},
            json=payload,
        )

    if response.status_code == 200:
        data = response.json()
        matches = data.get("matches", [])
        if matches:
            return {
                "passed": False,
                "details": {
                    "matches": [
                        {
                            "threat_type": m.get("threatType"),
                            "platform": m.get("platformType"),
                            "url": m.get("threat", {}).get("url"),
                        }
                        for m in matches
                    ]
                },
            }
        return {"passed": True, "details": {"matches": []}}
    else:
        return {
            "passed": True,
            "details": {"error": f"GSB API returned HTTP {response.status_code}"},
        }


async def check_google_safe_browsing(url: str) -> dict:
    """
    Query Safe Browsing threat intelligence sources (Google Safe Browsing & URLhaus).

    Returns
    -------
    dict
        {
            "score": int (0 or 30),
            "passed": bool,
            "details": { "matches": [...] | "error": str },
        }
    """
    settings = get_settings()
    api_key = settings.GOOGLE_SAFE_BROWSING_API_KEY

    tasks = [check_urlhaus(url)]
    if api_key:
        tasks.append(_check_gsb(url, api_key))
    else:
        logger.warning("GOOGLE_SAFE_BROWSING_API_KEY not set — skipping GSB lookup")

    results = await asyncio.gather(*tasks, return_exceptions=True)

    urlhaus_flagged = results[0] if not isinstance(results[0], Exception) else False
    gsb_result = None
    if len(results) > 1:
        gsb_result = results[1] if not isinstance(results[1], Exception) else None

    triggered_matches = []
    if urlhaus_flagged:
        triggered_matches.append(
            {
                "threat_type": "URLHAUS_MALICIOUS",
                "platform": "ANY_PLATFORM",
                "url": url,
            }
        )

    if gsb_result and not gsb_result.get("passed", True):
        matches = gsb_result.get("details", {}).get("matches", [])
        triggered_matches.extend(matches)

    if triggered_matches:
        return {
            "score": MAX_L3_SCORE,
            "passed": False,
            "details": {"matches": triggered_matches},
        }
    else:
        error_msg = None
        if gsb_result and gsb_result.get("details", {}).get("error"):
            error_msg = gsb_result["details"]["error"]

        details: dict = {"matches": []}
        if error_msg:
            details["error"] = error_msg
        if not api_key:
            details["google_safe_browsing_skipped"] = True
            details["skipped"] = True

        return {
            "score": 0,
            "passed": True,
            "details": details,
        }
