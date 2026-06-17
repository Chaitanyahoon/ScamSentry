"""
ScamSentry API — Configuration

All application settings loaded from environment variables via pydantic-settings.
"""

import logging
import secrets
from functools import lru_cache

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables / .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Database ──────────────────────────────────────────────────────
    DATABASE_URL: str = (
        "postgresql+asyncpg://postgres:password@localhost:5432/scamsentry"
    )

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_url(cls, v: str) -> str:
        if isinstance(v, str):
            if v.startswith("postgres://"):
                return v.replace("postgres://", "postgresql+asyncpg://", 1)
            elif v.startswith("postgresql://"):
                return v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v

    # ── Redis ─────────────────────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379"

    # ── External APIs ─────────────────────────────────────────────────
    GOOGLE_SAFE_BROWSING_API_KEY: str = ""

    # ── Auth ──────────────────────────────────────────────────────────
    API_SECRET_KEY: str = f"dev-{secrets.token_hex(16)}"
    ADMIN_API_KEY: str = f"admin-{secrets.token_hex(16)}"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_HOURS: int = 24
    CORS_ALLOWED_ORIGINS: str = "http://localhost:3000"

    # ── Environment ───────────────────────────────────────────────────
    ENVIRONMENT: str = "development"

    @model_validator(mode="after")
    def validate_production_secret(self) -> "Settings":
        if self.ENVIRONMENT == "production":
            if not self.API_SECRET_KEY or self.API_SECRET_KEY.startswith("dev-"):
                raise ValueError(
                    "API_SECRET_KEY must be set to a secure custom value in production!"
                )
            if not self.ADMIN_API_KEY or self.ADMIN_API_KEY.startswith("admin-"):
                raise ValueError(
                    "ADMIN_API_KEY must be set to a secure custom value in production!"
                )
        elif self.API_SECRET_KEY.startswith("dev-"):
            logger = logging.getLogger(__name__)
            logger.warning(
                "API_SECRET_KEY is using a generated dev default. "
                "Set a strong custom value before deploying to production."
            )
        return self


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings singleton."""
    logger = logging.getLogger(__name__)
    settings = Settings()
    if settings.CORS_ALLOWED_ORIGINS == "*":
        logger.warning(
            "CORS_ALLOWED_ORIGINS is set to '*' — this is insecure for production. "
            "Pin it to specific origins in production."
        )
    return settings
