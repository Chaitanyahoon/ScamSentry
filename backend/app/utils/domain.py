"""
ScamSentry API — Shared domain extraction utilities.
"""

from urllib.parse import urlparse


def extract_domain(url: str) -> str:
    """Pull the lowercase hostname out of a URL string.

    Handles URLs with and without a scheme.
    Returns an empty string on failure.
    """
    try:
        parsed = urlparse(url if "://" in url else f"http://{url}")
        return (parsed.hostname or "").lower()
    except Exception:
        return ""
