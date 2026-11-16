"""Configuración centralizada leyendo exclusivamente desde .env / entorno."""

from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # App
    APP_ENV: str = Field(default="production")
    APP_HOST: str = Field(default="127.0.0.1")
    APP_PORT: int = Field(gt=0, lt=65536)
    CORS_ORIGINS: str = Field(min_length=1)
    RATE_LIMIT_PER_MIN: int = Field(default=20, gt=0)
    MAX_QUERY_LENGTH: int = Field(default=500, gt=10, le=2000)
    CACHE_TTL_SECONDS: int = Field(default=300, ge=0)

    # Qdrant
    QDRANT_HOST: str = Field(min_length=1)
    QDRANT_PORT: int = Field(gt=0, lt=65536)
    QDRANT_API_KEY: str = Field(min_length=1)
    QDRANT_COLLECTION: str = Field(min_length=1)
    QDRANT_TOP_K: int = Field(default=5, ge=1, le=20)
    QDRANT_SCORE_THRESHOLD: float = Field(default=0.45, ge=0.0, le=1.0)

    # Embeddings locales
    EMBEDDING_MODEL: str = Field(min_length=1)
    EMBEDDING_DIM: int = Field(gt=0)

    # LLM (Grok / OpenAI-compatible)
    LLM_BASE_URL: str = Field(min_length=1)
    LLM_API_KEY: str = Field(min_length=1)
    LLM_MODEL: str = Field(min_length=1)
    LLM_MAX_CONCURRENCY: int = Field(default=2, ge=1, le=10)
    LLM_TIMEOUT_SECONDS: int = Field(default=30, ge=5, le=120)
    LLM_MAX_TOKENS: int = Field(default=900, ge=100, le=4096)
    LLM_TEMPERATURE: float = Field(default=0.1, ge=0.0, le=1.0)

    # Telegram
    TELEGRAM_ENABLED: bool = Field(default=False)
    TELEGRAM_BOT_TOKEN: str = Field(default="")
    TELEGRAM_ALLOWED_USER_IDS: str = Field(default="")

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def telegram_allowed_ids(self) -> set[int]:
        ids: set[int] = set()
        for item in self.TELEGRAM_ALLOWED_USER_IDS.split(","):
            item = item.strip()
            if item.isdigit():
                ids.add(int(item))
        return ids


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
