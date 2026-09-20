from fastapi import APIRouter, HTTPException, Request

from backend.app.analysis.correlation import build_correlation_payload
from backend.app.core.schemas import CorrelationResponse
from backend.app.data.loader import ASSET_NAMES
from backend.app.data.store import MarketDataStore

router = APIRouter(prefix="/api/analysis", tags=["analysis"])


def _store(request: Request) -> MarketDataStore:
    return request.app.state.market_data_store


@router.get("/correlation", response_model=CorrelationResponse)
def get_correlation(request: Request) -> CorrelationResponse:
    store = _store(request)
    symbols = store.symbols()
    frames = {symbol: store.get_frame(symbol) for symbol in symbols}

    try:
        payload = build_correlation_payload(frames, ASSET_NAMES)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    return CorrelationResponse(**payload)
