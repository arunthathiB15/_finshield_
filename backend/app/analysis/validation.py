from __future__ import annotations

from dataclasses import dataclass

import pandas as pd

from backend.app.backtest.engine import BacktestResult, run_backtest
from backend.app.backtest.metrics import calculate_metrics


@dataclass(frozen=True)
class ValidationResult:
    split_date: pd.Timestamp
    train_metrics: dict[str, float | int]
    train_benchmark_metrics: dict[str, float | int]
    test_metrics: dict[str, float | int]
    test_benchmark_metrics: dict[str, float | int]
    train_rows: int
    test_rows: int


def _metrics_for_mask(
    result: BacktestResult,
    mask: pd.Series,
    periods_per_year: int,
    benchmark: bool = False,
) -> dict[str, float | int]:
    if benchmark:
        returns = result.benchmark_returns
        gross_returns = result.benchmark_gross_returns
        turnover = result.benchmark_turnover
    else:
        returns = result.strategy_returns
        gross_returns = result.strategy_gross_returns
        turnover = result.strategy_turnover

    selected_returns = returns.loc[mask].reset_index(drop=True)
    selected_gross_returns = gross_returns.loc[mask].reset_index(drop=True)
    selected_turnover = turnover.loc[mask].reset_index(drop=True)
    equity = (1.0 + selected_returns).cumprod()
    return calculate_metrics(
        selected_returns,
        selected_gross_returns,
        equity,
        selected_turnover,
        periods_per_year,
    )


def run_train_test_validation(
    frame: pd.DataFrame,
    strategy_name: str,
    params: dict[str, int | float],
    capital: float,
    transaction_cost: float,
    slippage: float,
    periods_per_year: int,
    train_fraction: float = 0.7,
) -> ValidationResult:
    """Run a chronological train/test split with a warm-up window for test signals."""

    if not 0.5 <= train_fraction <= 0.9:
        raise ValueError("train_fraction must be between 0.5 and 0.9")

    data = frame.sort_values("date").reset_index(drop=True).copy()
    slow_window = int(params.get("slow_window", 50))
    split_index = int(len(data) * train_fraction)
    minimum_rows = max(slow_window + 2, 20)
    if split_index < minimum_rows or len(data) - split_index < minimum_rows:
        raise ValueError("Not enough rows for a stable train/test split")

    train_frame = data.iloc[:split_index].copy()
    split_date = pd.Timestamp(data.iloc[split_index]["date"])
    warmup_start = max(0, split_index - slow_window - 2)
    test_frame = data.iloc[warmup_start:].reset_index(drop=True).copy()

    train_result = run_backtest(
        train_frame,
        strategy_name,
        params,
        capital,
        transaction_cost,
        slippage,
        periods_per_year,
    )
    test_result = run_backtest(
        test_frame,
        strategy_name,
        params,
        capital,
        transaction_cost,
        slippage,
        periods_per_year,
    )
    test_dates = pd.to_datetime(test_frame["date"]).reset_index(drop=True)
    test_mask = test_dates >= split_date
    test_strategy_metrics = _metrics_for_mask(
        test_result,
        test_mask,
        periods_per_year,
    )
    test_benchmark_metrics = _metrics_for_mask(
        test_result,
        test_mask,
        periods_per_year,
        benchmark=True,
    )

    return ValidationResult(
        split_date=split_date,
        train_metrics=train_result.metrics,
        train_benchmark_metrics=train_result.benchmark_metrics,
        test_metrics=test_strategy_metrics,
        test_benchmark_metrics=test_benchmark_metrics,
        train_rows=len(train_frame),
        test_rows=int(test_mask.sum()),
    )
