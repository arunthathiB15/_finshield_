from datetime import date, datetime

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


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
    periods_per_year: int
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


class CorrelationPair(BaseModel):
    left_symbol: str
    right_symbol: str
    left_name: str
    right_name: str
    correlation: float = Field(ge=-1, le=1)
    observations: int = Field(ge=2)
    start_date: date
    end_date: date


class CorrelationResponse(BaseModel):
    symbols: list[str] = Field(min_length=2)
    names: dict[str, str]
    matrix: dict[str, dict[str, float]]
    pairs: list[CorrelationPair]
    method: str


class NewsArticle(BaseModel):
    id: str
    title: str
    publisher: str
    link: str
    published_at: datetime
    category: Literal["asset", "market"]
    thumbnail_url: str | None = None
    summary: str | None = None


class NewsResponse(BaseModel):
    symbol: str
    asset_name: str
    source: str
    fetched_at: datetime
    refresh_interval_seconds: int = Field(default=300, ge=60)
    items: list[NewsArticle]
    warning: str | None = None


class BacktestPeriod(BaseModel):
    start: date | None = None
    end: date | None = None

    @model_validator(mode="after")
    def validate_order(self) -> "BacktestPeriod":
        if self.start and self.end and self.start > self.end:
            raise ValueError("period.start must be on or before period.end")
        return self


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


class AnalysisRequest(BacktestRequest):
    train_fraction: float = Field(default=0.7, ge=0.5, le=0.9)


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
    periods_per_year: int
    period_start: date
    period_end: date
    metrics: BacktestMetrics
    benchmark_metrics: BacktestMetrics
    equity_curve: list[EquityPoint]
    trades: list[TradeEvent]


class RegimeMetric(BaseModel):
    category: Literal["trend", "volatility"]
    regime: str
    observations: int = Field(ge=1)
    active_days: int = Field(ge=0)
    strategy_total_return: float
    benchmark_total_return: float
    strategy_sharpe: float
    strategy_max_drawdown: float
    outperformance: float


class CostSensitivityPoint(BaseModel):
    transaction_cost: float = Field(ge=0)
    total_friction: float = Field(ge=0)
    total_return: float
    sharpe: float
    max_drawdown: float
    cost_drag: float
    trade_count: int = Field(ge=0)


class ParameterSensitivityPoint(BaseModel):
    fast_window: int = Field(ge=2)
    slow_window: int = Field(ge=3)
    total_return: float
    sharpe: float
    max_drawdown: float
    trade_count: int = Field(ge=0)


class ValidationSummary(BaseModel):
    split_date: date
    train_start: date
    train_end: date
    test_start: date
    test_end: date
    train_rows: int = Field(ge=1)
    test_rows: int = Field(ge=1)
    train_metrics: BacktestMetrics
    train_benchmark_metrics: BacktestMetrics
    test_metrics: BacktestMetrics
    test_benchmark_metrics: BacktestMetrics


class TrustScoreComponent(BaseModel):
    name: str
    weight: float = Field(ge=0)
    score: float = Field(ge=0, le=100)
    contribution: float = Field(ge=0)
    rationale: str


class TrustScore(BaseModel):
    score: float = Field(ge=0, le=100)
    verdict: str
    components: list[TrustScoreComponent]
    disclaimer: str


class AnalysisResponse(BaseModel):
    symbol: str
    strategy: str
    parameters: dict[str, int | float]
    periods_per_year: int
    metrics: BacktestMetrics
    benchmark_metrics: BacktestMetrics
    validation: ValidationSummary
    regime_breakdown: list[RegimeMetric]
    cost_sensitivity: list[CostSensitivityPoint]
    parameter_sensitivity: list[ParameterSensitivityPoint]
    trust_score: TrustScore


class ExplanationRequest(BaseModel):
    """A validated deterministic analysis plus an optional user question."""

    analysis: AnalysisResponse
    question: str | None = Field(default=None, max_length=600)


class ExplanationResponse(BaseModel):
    explanation: str = Field(min_length=1)
    source: Literal["featherless", "deterministic_fallback"]
    model: str | None = None
    notice: str | None = None
    disclaimer: str
