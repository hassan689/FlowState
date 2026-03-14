from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # App
    DEBUG: bool = False
    SECRET_KEY: str = "change-me-in-production-min-32-chars"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://flowstate:password@localhost:5432/flowstate"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    CACHE_URL: str = "redis://localhost:6379/1"
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"

    # JWT
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_LIFETIME_MINUTES: int = 60
    JWT_REFRESH_LIFETIME_DAYS: int = 7

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]


settings = Settings()
