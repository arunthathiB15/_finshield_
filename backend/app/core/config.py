from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime configuration loaded from environment variables or .env."""

    app_env: str = "development"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    database_path: str = "data/quantguard.duckdb"
    seed_data_path: str = "data"
    featherless_api_key: str | None = None
    featherless_model: str | None = None
    frontend_origin: str = "http://localhost:5173"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def database_file(self) -> Path:
        return Path(self.database_path)

    @property
    def seed_directory(self) -> Path:
        return Path(self.seed_data_path)


settings = Settings()
