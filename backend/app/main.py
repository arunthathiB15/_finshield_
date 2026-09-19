from fastapi import FastAPI

app = FastAPI(
    title="QuantGuard API",
    description="Multi-asset quantitative intelligence and strategy stress-testing API.",
    version="0.1.0",
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "quantguard-api"}
