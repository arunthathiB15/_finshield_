from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.routes.assets import router as assets_router
from backend.app.api.routes.analysis import router as analysis_router
from backend.app.api.routes.backtest import router as backtest_router
from backend.app.api.routes.correlation import router as correlation_router
from backend.app.api.routes.explanation import router as explanation_router
from backend.app.api.routes.news import router as news_router
from backend.app.core.config import settings
from backend.app.data.loader import load_seed_data
from backend.app.data.store import MarketDataStore


@asynccontextmanager
async def lifespan(application: FastAPI):
    store = MarketDataStore(settings.database_file)
    load_seed_data(store, settings.seed_directory)
    application.state.market_data_store = store
    yield
    store.close()

app = FastAPI(
    title="Finshield API",
    description="Multi-asset quantitative intelligence and strategy stress-testing API.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(assets_router)
app.include_router(backtest_router)
app.include_router(analysis_router)
app.include_router(correlation_router)
app.include_router(explanation_router)
app.include_router(news_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "Finshield-api"}
