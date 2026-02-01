"""
Application configuration and settings.
"""
from pydantic_settings import BaseSettings
from typing import Optional


def _default_cors_origins() -> list[str]:
    return [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "https://chlapp.vercel.app",
        "https://chlapp-production.vercel.app",
    ]


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # MongoDB settings
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "chl_datastore_db"
    
    # CORS: comma-separated origins (e.g. https://chlapp.vercel.app,https://*.vercel.app)
    # Vercel preview URLs use *.vercel.app
    cors_origins: Optional[str] = None
    
    # LLM settings
    llm_api_key: Optional[str] = None
    llm_model: str = "gpt-4"  # Default model, can be overridden
    llm_api_base_url: Optional[str] = None  # For custom API endpoints
    llm_temperature: float = 0.7
    llm_max_tokens: int = 1000

    # Tavily (optional — for reflection agent web search / James Clear content)
    tavily_api_key: Optional[str] = None
    
    # Application settings
    app_name: str = "CHL API"
    app_version: str = "1.0.0"
    debug: bool = False

    # Firebase (optional — if missing, auth is skipped for local dev)
    firebase_project_id: Optional[str] = None
    google_application_credentials: Optional[str] = None  # path to service account JSON file
    google_application_credentials_json: Optional[str] = None  # or entire JSON as string (e.g. for production env/secrets)
    admin_uids: Optional[str] = None  # comma-separated UIDs allowed for admin API (e.g. "uid1,uid2")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


settings = Settings()


def get_cors_origins() -> list[str]:
    """CORS allowed origins: CORS_ORIGINS env if set, else default localhost list."""
    if settings.cors_origins:
        return [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
    return _default_cors_origins()


def is_firebase_configured() -> bool:
    """True if Firebase is configured (project ID + credentials via file path or JSON env)."""
    return bool(
        settings.firebase_project_id
        and (settings.google_application_credentials or settings.google_application_credentials_json)
    )
