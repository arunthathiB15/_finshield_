from fastapi.testclient import TestClient

from backend.app.main import app


def _payload(symbol: str = "NVDA") -> dict:
    return {
        "symbol": symbol,
        "strategy": "sma_crossover",
        "params": {"fast_window": 20, "slow_window": 50},
        "capital": 100_000,
        "cost": 0.001,
        "slippage": 0.0005,
        "period": {"start": "2018-01-01", "end": "2026-09-18"},
        "train_fraction": 0.7,
    }


def test_step4_analysis_exposes_all_reliability_layers() -> None:
    with TestClient(app) as client:
        response = client.post("/api/analysis", json=_payload())

    assert response.status_code == 200
    payload = response.json()
    assert payload["symbol"] == "NVDA"
    assert payload["periods_per_year"] == 252
    assert len(payload["regime_breakdown"]) == 4
    assert len(payload["cost_sensitivity"]) == 6
    assert len(payload["parameter_sensitivity"]) == 9
    assert payload["validation"]["train_end"] < payload["validation"]["test_start"]
    assert 0 <= payload["trust_score"]["score"] <= 100
    assert len(payload["trust_score"]["components"]) == 7


def test_bitcoin_uses_calendar_appropriate_annualisation() -> None:
    with TestClient(app) as client:
        response = client.post("/api/analysis", json=_payload("BTC-USD"))

    assert response.status_code == 200
    assert response.json()["periods_per_year"] == 365
