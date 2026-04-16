from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # App
    DEBUG: bool = False
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/ai_anime"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Clerk
    CLERK_SECRET_KEY: str = ""

    # Stripe
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    # R2/S3
    R2_ACCESS_KEY: str = ""
    R2_SECRET_KEY: str = ""
    R2_BUCKET: str = ""
    R2_ENDPOINT: str = ""

    # OpenAI
    OPENAI_API_KEY: str = ""

    # Sentry
    SENTRY_DSN: str = ""

    # PostHog
    POSTHOG_KEY: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()