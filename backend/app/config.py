"""
Single source of truth for configuration. Everything env-driven so the
same image runs locally, on Render, or anywhere else with no code change.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    groq_api_key: str = ""
    database_url: str = "sqlite:///./complaints.db"
    cors_origins: str = "http://localhost:5173"

    extraction_model: str = "gemma2-9b-it"
    reasoning_model: str = "llama-3.3-70b-versatile"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
