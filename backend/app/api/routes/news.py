from fastapi import APIRouter, HTTPException, Query

from backend.app.core.schemas import NewsResponse
from backend.app.data.loader import ASSET_NAMES
from backend.app.news.service import fetch_market_news

router = APIRouter(prefix="/api/news", tags=["news"])


@router.get("", response_model=NewsResponse)
def get_market_news(
    symbol: str = Query(min_length=1, max_length=20),
    limit: int = Query(default=12, ge=1, le=20),
    refresh: bool = Query(default=False),
) -> NewsResponse:
    symbol = symbol.upper()
    if symbol not in ASSET_NAMES:
        raise HTTPException(status_code=404, detail=f"News is not configured for {symbol}")
    return fetch_market_news(symbol, limit, force_refresh=refresh)
