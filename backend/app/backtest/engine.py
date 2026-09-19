from dataclasses import dataclass

import pandas as pd

from backend.app.backtest.costs import apply_transaction_costs, position_turnover
from backend.app.backtest.metrics import calculate_metrics
from backend.app.strategies.sma_crossover import SMACrossover


@dataclass(frozen=True)
class BacktestResult:
    parameters: dict[str, int | float]
    metrics: dict[str, float | int]
    benchmark_metrics: dict[str, float | int]
    equity_curve: pd.DataFrame
    trades: pd.DataFrame


def run_backtest(
    frame: pd.DataFrame,
    strategy_name: str,
    params: dict[str, int | float],
    capital: float,
    transaction_cost: float,
    slippage: float,
) -> BacktestResult:
    """Run a deterministic long/flat daily backtest with next-bar execution."""

    if strategy_name != "sma_crossover":
        raise ValueError(f"Unsupported strategy: {strategy_name}")
    if capital <= 0:
        raise ValueError("capital must be greater than zero")
    if transaction_cost < 0 or slippage < 0:
        raise ValueError("transaction cost and slippage cannot be negative")

    data = frame.sort_values("date").reset_index(drop=True).copy()
    if len(data) < 3:
        raise ValueError("At least three market-data rows are required")
    close = data["close"].astype(float)
    raw_signal = SMACrossover().signal(close, params)
    position = raw_signal.shift(1).fillna(0.0)
    daily_returns = close.pct_change().fillna(0.0)

    turnover = position_turnover(position)
    gross_returns = position * daily_returns
    net_returns, cost_returns = apply_transaction_costs(
        gross_returns, turnover, transaction_cost, slippage
    )
    equity = capital * (1.0 + net_returns).cumprod()

    benchmark_position = pd.Series(1.0, index=data.index)
    benchmark_turnover = position_turnover(benchmark_position)
    benchmark_gross_returns = benchmark_position * daily_returns
    benchmark_net_returns, benchmark_cost_returns = apply_transaction_costs(
        benchmark_gross_returns,
        benchmark_turnover,
        transaction_cost,
        slippage,
    )
    benchmark_equity = capital * (1.0 + benchmark_net_returns).cumprod()

    equity_curve = pd.DataFrame(
        {
            "date": data["date"],
            "strategy_equity": equity,
            "benchmark_equity": benchmark_equity,
            "strategy_drawdown": equity / equity.cummax() - 1.0,
            "benchmark_drawdown": benchmark_equity / benchmark_equity.cummax() - 1.0,
            "position": position,
        }
    )

    previous_position = position.shift(1).fillna(0.0)
    changed = turnover > 0
    equity_before = equity.shift(1).fillna(capital)
    trades = pd.DataFrame(
        {
            "date": data.loc[changed, "date"].reset_index(drop=True),
            "action": [
                "BUY" if current > previous else "SELL"
                for current, previous in zip(position[changed], previous_position[changed])
            ],
            "price": close[changed].reset_index(drop=True),
            "position": position[changed].reset_index(drop=True),
            "turnover": turnover[changed].reset_index(drop=True),
            "cost": (equity_before[changed] * cost_returns[changed]).reset_index(drop=True),
        }
    )

    return BacktestResult(
        parameters=params,
        metrics=calculate_metrics(net_returns, gross_returns, equity, turnover),
        benchmark_metrics=calculate_metrics(
            benchmark_net_returns,
            benchmark_gross_returns,
            benchmark_equity,
            benchmark_turnover,
        ),
        equity_curve=equity_curve,
        trades=trades,
    )
