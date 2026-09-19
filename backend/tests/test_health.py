from fastapi.testclient import TestClient

from backend.app.main import app


def test_health_endpoint() -> None:
    response = TestClient(app).get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "quantguard-api"}


def test_assets_and_nvda_series() -> None:
    with TestClient(app) as client:
        assets = client.get("/api/assets")
        assert assets.status_code == 200
        assert {asset["symbol"] for asset in assets.json()} == {"BTC-USD", "GC=F", "NVDA"}

        series = client.get("/api/assets/NVDA/series")
        assert series.status_code == 200
        payload = series.json()
        assert payload["symbol"] == "NVDA"
        assert len(payload["data"]) > 2_000
        assert payload["data"][0]["sma_20"] is None
        assert payload["data"][19]["sma_20"] is not None
