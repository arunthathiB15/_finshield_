from fastapi.testclient import TestClient

from backend.app.main import app


def test_correlation_uses_aligned_returns_for_all_seed_assets() -> None:
    with TestClient(app) as client:
        response = client.get("/api/analysis/correlation")

    assert response.status_code == 200
    payload = response.json()
    assert payload["symbols"] == ["GC=F", "BTC-USD", "NVDA"]
    assert len(payload["pairs"]) == 3
    assert payload["matrix"]["GC=F"]["GC=F"] == 1.0
    assert payload["matrix"]["GC=F"]["NVDA"] == payload["matrix"]["NVDA"]["GC=F"]
    assert payload["matrix"]["NVDA"]["BTC-USD"] == payload["matrix"]["BTC-USD"]["NVDA"]
    assert all(-1 <= pair["correlation"] <= 1 for pair in payload["pairs"])
    assert all(pair["observations"] > 1 for pair in payload["pairs"])
