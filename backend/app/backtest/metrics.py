from collections.abc import Iterable

import numpy as np
import pandas as pd

TRADING_DAYS = 252


def total_return(returns: pd.Series) -> float:
    """Total compounded return: product(1 + daily return) - 1."""

    return float((1.0 + returns.astype(float)).prod() - 1.0)


def cagr(returns: pd.Series, periods_per_year: int = TRADING_DAYS) -> float:
    """Compound annual growth rate, annualising the observed return path."""

    if returns.empty:
        return 0.0
    compounded = 1.0 + total_return(returns)
    if compounded <= 0:
        return -1.0
    return float(compounded ** (periods_per_year / len(returns)) - 1.0)


def annualized_volatility(returns: pd.Series, periods_per_year: int = TRADING_DAYS) -> float:
    """Sample standard deviation of returns scaled by the square root of 252."""

    if len(returns) < 2:
        return 0.0
    return float(returns.astype(float).std(ddof=1) * np.sqrt(periods_per_year))


def sharpe_ratio(returns: pd.Series, periods_per_year: int = TRADING_DAYS) -> float:
    """Average excess daily return divided by daily volatility, annualised."""

    volatility = annualized_volatility(returns, periods_per_year)
    if volatility == 0:
        return 0.0
    return float(returns.astype(float).mean() / returns.astype(float).std(ddof=1) * np.sqrt(periods_per_year))


def sortino_ratio(returns: pd.Series, periods_per_year: int = TRADING_DAYS) -> float:
    """Return per unit of downside deviation; positive days do not penalise it."""

    if returns.empty:
        return 0.0
    negative = returns.astype(float).where(returns < 0, 0.0)
    downside_deviation = float(np.sqrt((negative**2).mean()))
    if downside_deviation == 0:
        return 0.0
    return float(returns.astype(float).mean() / downside_deviation * np.sqrt(periods_per_year))


def maximum_drawdown(equity: pd.Series) -> float:
    """Largest peak-to-trough fall in an equity curve."""

    if equity.empty:
        return 0.0
    running_peak = equity.astype(float).cummax()
    return float((equity.astype(float) / running_peak - 1.0).min())


def calmar_ratio(
    returns: pd.Series,
    equity: pd.Series,
    periods_per_year: int = TRADING_DAYS,
) -> float:
    drawdown = maximum_drawdown(equity)
    return float(cagr(returns, periods_per_year) / abs(drawdown)) if drawdown < 0 else 0.0


def win_rate(returns: pd.Series) -> float:
    """Fraction of non-zero return periods that were profitable."""

    active = returns.astype(float)[returns.astype(float) != 0]
    return float((active > 0).mean()) if not active.empty else 0.0


def trade_count(turnover: pd.Series) -> int:
    return int((turnover.astype(float) > 0).sum())


def turnover_total(turnover: pd.Series) -> float:
    return float(turnover.astype(float).sum())


def cost_drag(gross_returns: pd.Series, net_returns: pd.Series) -> float:
    """Compounded performance lost to commission and slippage."""

    return total_return(gross_returns) - total_return(net_returns)


def calculate_metrics(
    net_returns: pd.Series,
    gross_returns: pd.Series,
    equity: pd.Series,
    turnover: pd.Series,
    periods_per_year: int = TRADING_DAYS,
) -> dict[str, float | int]:
    return {
        "cagr": cagr(net_returns, periods_per_year),
        "total_return": total_return(net_returns),
        "annualized_volatility": annualized_volatility(net_returns, periods_per_year),
        "sharpe": sharpe_ratio(net_returns, periods_per_year),
        "sortino": sortino_ratio(net_returns, periods_per_year),
        "max_drawdown": maximum_drawdown(equity),
        "calmar": calmar_ratio(net_returns, equity, periods_per_year),
        "win_rate": win_rate(net_returns),
        "trade_count": trade_count(turnover),
        "turnover": turnover_total(turnover),
        "cost_drag": cost_drag(gross_returns, net_returns),
    }


def trade_return_sequence(returns: Iterable[float]) -> pd.Series:
    """Small helper for tests and future trade-level reporting."""

    return pd.Series(list(returns), dtype=float)
