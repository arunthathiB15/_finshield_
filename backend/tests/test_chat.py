from types import SimpleNamespace

from fastapi.testclient import TestClient

from backend.app.ai import chatbot
from backend.app.core.schemas import ChatRequest
from backend.app.main import app


def test_chat_returns_safe_fallback_without_provider_credentials(monkeypatch) -> None:
    monkeypatch.setattr(chatbot.settings, "featherless_api_key", None)
    monkeypatch.setattr(chatbot.settings, "featherless_model", None)

    with TestClient(app) as client:
        response = client.post(
            "/api/chat",
            json={"question": "How is Sharpe ratio calculated?"},
        )

    assert response.status_code == 200
    body = response.json()
    assert body["source"] == "deterministic_fallback"
    assert "Featherless" in body["answer"]
    assert "does not predict future prices" in body["disclaimer"]


def test_chat_sends_project_context_to_featherless(monkeypatch) -> None:
    captured: dict = {}

    class FakeResponse:
        def raise_for_status(self) -> None:
            return None

        def json(self) -> dict:
            return {"choices": [{"message": {"content": "Grounded project answer."}}]}

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
    monkeypatch.setattr(chatbot.httpx, "Client", lambda timeout: FakeClient())

    result = chatbot.generate_chat_response(
        ChatRequest(
            question="What does the current backtest show?",
            context={"selected_asset": {"symbol": "NVDA"}},
        ),
        runtime_settings,
    )

    assert result.source == "featherless"
    assert result.answer == "Grounded project answer."
    assert captured["headers"]["Authorization"] == "Bearer test-key"
    assert "Project reference" in captured["json"]["messages"][0]["content"]
    assert '"symbol":"NVDA"' in captured["json"]["messages"][-1]["content"]
