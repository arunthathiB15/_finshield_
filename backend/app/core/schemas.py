from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class AssetSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    symbol: str
    name: str
    source: str
    start_date: date
    end_date: date
    rows: int = Field(ge=1)
    last_close: float = Field(gt=0)
    total_return: float
    annualized_volatility: float
    missing_days: int = Field(ge=0)
    quality_status: str


class SeriesPoint(BaseModel):
    date: date
    open: float
    high: float
    low: float
    close: float
    adj_close: float
    volume: float
    sma_20: float | None = None
    ema_20: float | None = None
    rolling_volatility: float | None = None
    drawdown: float | None = None


class AssetSeries(BaseModel):
    symbol: str
    name: str
    data: list[SeriesPoint]
