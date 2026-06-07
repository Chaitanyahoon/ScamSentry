"""
ScamSentry API — Admin Authentication Middleware

Simple API-key check for admin-only endpoints.
"""

from fastapi import Header, HTTPException

from app.config import get_settings


async def verify_admin_key(
    x_admin_key: str = Header(..., alias="X-Admin-Key"),
) -> str:
    """
    FastAPI dependency that validates the ``X-Admin-Key`` header
    against ``API_SECRET_KEY`` from settings.

    Raises 401 if the key is missing or incorrect.
    """
    settings = get_settings()
    if x_admin_key != settings.API_SECRET_KEY:
        raise HTTPException(
            status_code=401,
            detail="Invalid or missing admin key",
        )
    return x_admin_key
