import pandas as pd
import pytest

from backend.app.backtest.metrics import (
    annualized_volatility,
    maximum_drawdown,
    total_return,
    trade_count,
    turnover_total,
)


def test_total_return_is_compounded() -> None:
    returns = pd.Series([0.10, -0.05])
    assert total_return(returns) == pytest.approx(0.045)


def test_maximum_drawdown_uses_peak_to_trough_loss() -> None:
    equity = pd.Series([100.0, 110.0, 99.0, 120.0])
    assert maximum_drawdown(equity) == pytest.approx(-0.10)


def test_annualized_volatility_uses_sample_standard_deviation() -> None:
    returns = pd.Series([0.01, 0.03])
    expected = ((0.01**2 + 0.01**2) / 1) ** 0.5 * (252**0.5)
    assert annualized_volatility(returns) == pytest.approx(expected)


def test_turnover_and_trade_count_are_position_changes() -> None:
    turnover = pd.Series([0.0, 1.0, 0.0, 1.0])
    assert turnover_total(turnover) == pytest.approx(2.0)
    assert trade_count(turnover) == 2
