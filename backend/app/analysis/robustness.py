from __future__ import annotations

from dataclasses import dataclass

import pandas as pd

from backend.app.backtest.engine import run_backtest


DEFAULT_COST_LEVELS = (0.0, 0.0005, 0.001, 0.0025, 0.005, 0.01)


@dataclass(frozen=True)
class RobustnessResult:
    cost_sensitivity: list[dict[str, float | int]]
    parameter_sensitivity: list[dict[str, float | int]]


def _window_grid(value: int, minimum: int = 2) -> list[int]:
    return sorted({max(minimum, value - 10), value, value + 10})


def run_robustness_analysis(
    frame: pd.DataFrame,
    strategy_name: str,
    params: dict[str, int | float],
    capital: float,
    transaction_cost: float,
    slippage: float,
    periods_per_year: int,
) -> RobustnessResult:
    """Measure how results move under costs and nearby SMA parameters."""

    cost_sensitivity: list[dict[str, float | int]] = []
    for cost in DEFAULT_COST_LEVELS:
        result = run_backtest(
            frame,
            strategy_name,
            params,
            capital,
            cost,
            slippage,
            periods_per_year,
        )
        cost_sensitivity.append(
            {
                "transaction_cost": cost,
                "total_friction": cost + slippage,
                "total_return": float(result.metrics["total_return"]),
                "sharpe": float(result.metrics["sharpe"]),
                "max_drawdown": float(result.metrics["max_drawdown"]),
                "cost_drag": float(result.metrics["cost_drag"]),
                "trade_count": int(result.metrics["trade_count"]),
            }
        )

    fast_window = int(params.get("fast_window", 20))
    slow_window = int(params.get("slow_window", 50))
    parameter_sensitivity: list[dict[str, float | int]] = []
    for fast in _window_grid(fast_window):
        for slow in _window_grid(slow_window, fast + 1):
            if fast >= slow:
                continue
            candidate = {"fast_window": fast, "slow_window": slow}
            result = run_backtest(
                frame,
                strategy_name,
                candidate,
                capital,
                transaction_cost,
                slippage,
                periods_per_year,
            )
            parameter_sensitivity.append(
                {
                    "fast_window": fast,
                    "slow_window": slow,
                    "total_return": float(result.metrics["total_return"]),
                    "sharpe": float(result.metrics["sharpe"]),
                    "max_drawdown": float(result.metrics["max_drawdown"]),
                    "trade_count": int(result.metrics["trade_count"]),
                }
            )

    return RobustnessResult(
        cost_sensitivity=cost_sensitivity,
        parameter_sensitivity=parameter_sensitivity,
    )
