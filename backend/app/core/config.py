from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

PROJECT_ROOT = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    """Runtime configuration loaded from environment variables or .env."""

    app_env: str = "development"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    database_path: str = "data/quantguard.duckdb"
    seed_data_path: str = "data"
    featherless_api_key: str | None = None
    featherless_model: str | None = None
    featherless_api_url: str = "https://api.featherless.ai/v1/chat/completions"
    featherless_timeout_seconds: float = 30.0
    frontend_origin: str = "http://localhost:5173"

    model_config = SettingsConfigDict(
        env_file=PROJECT_ROOT / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def database_file(self) -> Path:
        path = Path(self.database_path)
        return path if path.is_absolute() else PROJECT_ROOT / path

    @property
    def seed_directory(self) -> Path:
        path = Path(self.seed_data_path)
        return path if path.is_absolute() else PROJECT_ROOT / path


settings = Settings()
