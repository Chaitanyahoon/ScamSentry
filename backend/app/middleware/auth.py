"""
ScamSentry API — Admin authentication middleware (JWT-based).
"""

from __future__ import annotations

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import get_settings

_security = HTTPBearer(auto_error=False)


def verify_admin_key(
    credentials: HTTPAuthorizationCredentials | None = Depends(_security),
) -> None:
    """Dependency that ensures a valid JWT Bearer token is present.

    Usage::

        @router.post("/admin/ledger", dependencies=[Depends(verify_admin_key)])
        async def create_ledger(...):
            ...
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header — use 'Authorization: Bearer <token>'",
        )

    settings = get_settings()
    token = credentials.credentials

    try:
        jwt.decode(
            token,
            settings.API_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Obtain a new one via POST /api/v1/admin/login",
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or malformed token",
        )
