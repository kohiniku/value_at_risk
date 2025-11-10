"""Application settings and configuration helpers."""
from functools import lru_cache
from typing import Annotated, List, Optional

from pydantic import BeforeValidator
from pydantic_settings import BaseSettings, SettingsConfigDict


CorsOrigins = Annotated[List[str], BeforeValidator(lambda value: _split_cors(value))]


def _split_cors(value: List[str] | str) -> List[str]:
    if isinstance(value, str):
        return [origin.strip() for origin in value.split(",") if origin.strip()]
    return value


class Settings(BaseSettings):
    """Configuration values loaded from environment variables."""

    model_config = SettingsConfigDict(env_file=".env", env_nested_delimiter="__")

    app_name: str = "Value at Risk API"
    api_v1_str: str = "/api/v1"
    cors_origins: CorsOrigins = ["http://localhost:3000", "http://localhost:3100"]
    proxy_url: Optional[str] = None
    no_proxy: Optional[str] = None
    database_url: str = "sqlite:///./var_demo.db"


@lru_cache
def get_settings() -> Settings:
    """Return cached settings instance."""

    return Settings()


settings = get_settings()
