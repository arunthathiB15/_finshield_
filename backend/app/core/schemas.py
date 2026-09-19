from datetime import date

from typing import Literal

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


class BacktestPeriod(BaseModel):
    start: date | None = None
    end: date | None = None


class BacktestRequest(BaseModel):
    symbol: str
    strategy: Literal["sma_crossover"]
    params: dict[str, int | float] = Field(
        default_factory=lambda: {"fast_window": 20, "slow_window": 50}
    )
    capital: float = Field(default=100_000, gt=0)
    cost: float = Field(default=0.001, ge=0, le=0.1)
    slippage: float = Field(default=0.0005, ge=0, le=0.1)
    period: BacktestPeriod = Field(default_factory=BacktestPeriod)


class BacktestMetrics(BaseModel):
    cagr: float
    total_return: float
    annualized_volatility: float
    sharpe: float
    sortino: float
    max_drawdown: float
    calmar: float
    win_rate: float
    trade_count: int
    turnover: float
    cost_drag: float


class EquityPoint(BaseModel):
    date: date
    strategy_equity: float
    benchmark_equity: float
    strategy_drawdown: float
    benchmark_drawdown: float
    position: float


class TradeEvent(BaseModel):
    date: date
    action: Literal["BUY", "SELL"]
    price: float
    position: float
    turnover: float
    cost: float


class BacktestResponse(BaseModel):
    symbol: str
    strategy: str
    parameters: dict[str, int | float]
    capital: float
    transaction_cost: float
    slippage: float
    period_start: date
    period_end: date
    metrics: BacktestMetrics
    benchmark_metrics: BacktestMetrics
    equity_curve: list[EquityPoint]
    trades: list[TradeEvent]
