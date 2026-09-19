from types import SimpleNamespace

from fastapi.testclient import TestClient

from backend.app.ai import explainer
from backend.app.core.schemas import AnalysisResponse
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


def _analysis() -> AnalysisResponse:
    with TestClient(app) as client:
        response = client.post("/api/analysis", json=_payload())
    assert response.status_code == 200
    return AnalysisResponse.model_validate(response.json())


def test_explanation_uses_deterministic_fallback_without_provider_credentials(monkeypatch) -> None:
    monkeypatch.setattr(explainer.settings, "featherless_api_key", None)
    monkeypatch.setattr(explainer.settings, "featherless_model", None)
    analysis = _analysis()

    with TestClient(app) as client:
        response = client.post(
            "/api/explanation",
            json={
                "analysis": analysis.model_dump(mode="json"),
                "question": "Summarize the historical result.",
            },
        )

    assert response.status_code == 200
    body = response.json()
    assert body["source"] == "deterministic_fallback"
    assert body["model"] is None
    assert "NVDA" in body["explanation"]
    assert "Trust Score" in body["explanation"]
    assert "does not predict future prices" in body["disclaimer"]


def test_explanation_requires_a_complete_validated_analysis_context() -> None:
    with TestClient(app) as client:
        response = client.post(
            "/api/explanation",
            json={"analysis": {"symbol": "NVDA"}},
        )

    assert response.status_code == 422


def test_featherless_receives_context_and_only_supplies_language(monkeypatch) -> None:
    analysis = _analysis()
    captured: dict = {}

    class FakeResponse:
        def raise_for_status(self) -> None:
            return None

        def json(self) -> dict:
            return {"choices": [{"message": {"content": "A grounded explanation."}}]}

    class FakeClient:
        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc_value, traceback) -> None:
            return None

        def post(self, url: str, *, headers: dict, json: dict) -> FakeResponse:
            captured["url"] = url
            captured["headers"] = headers
            captured["json"] = json
            return FakeResponse()

    runtime_settings = SimpleNamespace(
        featherless_api_key="test-key",
        featherless_model="test-model",
        featherless_api_url="https://example.test/v1/chat/completions",
        featherless_timeout_seconds=5.0,
    )
    monkeypatch.setattr(explainer.httpx, "Client", lambda timeout: FakeClient())

    result = explainer.generate_explanation(
        analysis,
        "What does the historical result show?",
        runtime_settings,
    )

    assert result.source == "featherless"
    assert result.explanation == "A grounded explanation."
    assert captured["url"] == runtime_settings.featherless_api_url
    assert captured["headers"]["Authorization"] == "Bearer test-key"
    assert captured["json"]["model"] == "test-model"
    assert "Do not predict prices" in captured["json"]["messages"][0]["content"]
    assert '"symbol":"NVDA"' in captured["json"]["messages"][1]["content"]
