from __future__ import annotations

import numpy as np
import pandas as pd

from backend.app.backtest.engine import BacktestResult
from backend.app.backtest.metrics import calculate_metrics


TREND_LOOKBACK = 63
TREND_AVERAGE = 50
VOLATILITY_LOOKBACK = 20


def classify_regimes(frame: pd.DataFrame, periods_per_year: int) -> pd.DataFrame:
    """Classify each observation using only information available on that date.

    Trend is based on a trailing 63-session return, with a 50-session moving
    average fallback during the warm-up period. Volatility is compared with the
    median of the observed trailing-volatility series. The labels are descriptive
    buckets for historical attribution, not market forecasts.
    """

    data = frame.sort_values("date").reset_index(drop=True).copy()
    close = data["close"].astype(float)
    returns = close.pct_change()
    trend_return = close.pct_change(TREND_LOOKBACK)
    moving_average = close.rolling(TREND_AVERAGE, min_periods=TREND_AVERAGE).mean()
    trend_signal = trend_return.combine_first(close / moving_average - 1.0).fillna(0.0)

    rolling_volatility = returns.rolling(
        VOLATILITY_LOOKBACK,
        min_periods=VOLATILITY_LOOKBACK,
    ).std() * np.sqrt(periods_per_year)
    volatility_median = float(rolling_volatility.dropna().median())
    if not np.isfinite(volatility_median):
        volatility_median = 0.0
    volatility_signal = rolling_volatility.fillna(volatility_median)

    return pd.DataFrame(
        {
            "date": data["date"],
            "trend_regime": np.where(trend_signal >= 0.0, "bull", "bear"),
            "volatility_regime": np.where(
                volatility_signal >= volatility_median,
                "high_volatility",
                "low_volatility",
            ),
        }
    )


def _subset_metrics(
    returns: pd.Series,
    gross_returns: pd.Series,
    turnover: pd.Series,
    periods_per_year: int,
) -> dict[str, float | int]:
    returns = returns.astype(float).reset_index(drop=True)
    gross_returns = gross_returns.astype(float).reset_index(drop=True)
    turnover = turnover.astype(float).reset_index(drop=True)
    equity = (1.0 + returns).cumprod()
    return calculate_metrics(
        returns,
        gross_returns,
        equity,
        turnover,
        periods_per_year,
    )


def regime_breakdown(
    frame: pd.DataFrame,
    result: BacktestResult,
    periods_per_year: int,
) -> list[dict[str, float | int | str]]:
    """Attribute the same backtest returns to trend and volatility buckets."""

    regimes = classify_regimes(frame, periods_per_year)
    combined = regimes.copy()
    combined["strategy_returns"] = result.strategy_returns.to_numpy()
    combined["strategy_gross_returns"] = result.strategy_gross_returns.to_numpy()
    combined["strategy_turnover"] = result.strategy_turnover.to_numpy()
    combined["benchmark_returns"] = result.benchmark_returns.to_numpy()
    combined["benchmark_gross_returns"] = result.benchmark_gross_returns.to_numpy()
    combined["benchmark_turnover"] = result.benchmark_turnover.to_numpy()
    combined["position"] = result.equity_curve["position"].to_numpy()

    definitions = (
        ("trend", "trend_regime", ("bull", "bear")),
        (
            "volatility",
            "volatility_regime",
            ("high_volatility", "low_volatility"),
        ),
    )
    output: list[dict[str, float | int | str]] = []
    for category, column, labels in definitions:
        for label in labels:
            subset = combined[combined[column] == label]
            if subset.empty:
                continue
            strategy_metrics = _subset_metrics(
                subset["strategy_returns"],
                subset["strategy_gross_returns"],
                subset["strategy_turnover"],
                periods_per_year,
            )
            benchmark_metrics = _subset_metrics(
                subset["benchmark_returns"],
                subset["benchmark_gross_returns"],
                subset["benchmark_turnover"],
                periods_per_year,
            )
            output.append(
                {
                    "category": category,
                    "regime": label,
                    "observations": int(len(subset)),
                    "active_days": int((subset["position"] > 0).sum()),
                    "strategy_total_return": float(strategy_metrics["total_return"]),
                    "benchmark_total_return": float(benchmark_metrics["total_return"]),
                    "strategy_sharpe": float(strategy_metrics["sharpe"]),
                    "strategy_max_drawdown": float(strategy_metrics["max_drawdown"]),
                    "outperformance": float(
                        strategy_metrics["total_return"]
                        - benchmark_metrics["total_return"]
                    ),
                }
            )
    return output
