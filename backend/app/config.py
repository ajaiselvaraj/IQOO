from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "ORBITA"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"

    # Supabase (gracefully optional for demo)
    SUPABASE_URL: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None
    SUPABASE_SERVICE_KEY: Optional[str] = None

    # GitHub
    GITHUB_APP_ID: Optional[str] = None
    GITHUB_APP_PRIVATE_KEY: Optional[str] = None
    GITHUB_WEBHOOK_SECRET: Optional[str] = "orbita-webhook-secret"
    GITHUB_PERSONAL_ACCESS_TOKEN: Optional[str] = None

    # AI Provider — swap by changing this env var
    LLM_PROVIDER: str = "gemini"  # Options: gemini | openai | anthropic

    # Gemini
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.0-flash-exp"

    # OpenAI (optional alternative)
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o"

    # Anthropic (optional alternative)
    ANTHROPIC_API_KEY: Optional[str] = None
    ANTHROPIC_MODEL: str = "claude-3-5-sonnet-20241022"

    # Analysis settings
    MAX_DIFF_SIZE_CHARS: int = 60000
    MAX_CONTEXT_FILES: int = 8
    FINDING_CONFIDENCE_THRESHOLD: float = 0.70

    # Demo mode
    DEMO_MODE: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()
