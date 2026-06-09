"""
ScamSentry API — Configuration

All application settings loaded from environment variables via pydantic-settings.
"""

from functools import lru_cache

from pydantic import field_validator
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
    GEMINI_API_KEY: str = ""  # Optional — reserved for future L5 layer

    # ── Security ──────────────────────────────────────────────────────
    API_SECRET_KEY: str = "change-me-in-production"
    CORS_ALLOWED_ORIGINS: str = "*"  # Comma-separated list of allowed origins or "*"

    # ── Environment ───────────────────────────────────────────────────
    ENVIRONMENT: str = "development"  # "development" | "production"


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings singleton."""
    return Settings()
