import pandas as pd
from fastapi.testclient import TestClient

from backend.app.backtest.engine import run_backtest
from backend.app.main import app


def test_engine_shifts_signal_before_return_application() -> None:
    frame = pd.DataFrame(
        {
            "date": pd.date_range("2024-01-01", periods=8, freq="D"),
            "close": [100.0, 100.0, 100.0, 100.0, 110.0, 120.0, 130.0, 140.0],
        }
    )
    result = run_backtest(
        frame,
        "sma_crossover",
        {"fast_window": 2, "slow_window": 3},
        capital=100_000,
        transaction_cost=0.0,
        slippage=0.0,
    )
    assert result.equity_curve.iloc[0].position == 0.0
    assert result.equity_curve.iloc[4].position == 0.0


def test_backtest_api_returns_equity_metrics_and_trades() -> None:
    with TestClient(app) as client:
        response = client.post(
            "/api/backtest",
            json={
                "symbol": "NVDA",
                "strategy": "sma_crossover",
                "params": {"fast_window": 20, "slow_window": 50},
                "capital": 100000,
                "cost": 0.001,
                "slippage": 0.0005,
                "period": {"start": "2018-01-01", "end": "2026-09-18"},
            },
        )
        assert response.status_code == 200
        payload = response.json()
        assert payload["symbol"] == "NVDA"
        assert payload["metrics"]["trade_count"] >= 1
        assert len(payload["equity_curve"]) > 2_000
        assert "benchmark_metrics" in payload
