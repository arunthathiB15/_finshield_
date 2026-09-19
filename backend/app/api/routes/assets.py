import pandas as pd
from fastapi import APIRouter, HTTPException, Query, Request

from backend.app.core.schemas import AssetSeries, AssetSummary, SeriesPoint
from backend.app.data.loader import ASSET_NAMES
from backend.app.data.store import MarketDataStore
from backend.app.quant.indicators import add_price_indicators

router = APIRouter(prefix="/api/assets", tags=["assets"])


def _store(request: Request) -> MarketDataStore:
    return request.app.state.market_data_store


@router.get("", response_model=list[AssetSummary])
def list_assets(request: Request) -> list[AssetSummary]:
    store = _store(request)
    summaries: list[AssetSummary] = []
    for symbol in store.symbols():
        frame = store.get_frame(symbol)
        close = frame["close"].astype(float)
        returns = close.pct_change().dropna()
        start_date = frame["date"].min()
        end_date = frame["date"].max()
        expected_frequency = "D" if symbol == "BTC-USD" else "B"
        expected = pd.date_range(start_date, end_date, freq=expected_frequency)
        missing_days = int(expected.difference(pd.DatetimeIndex(frame["date"])).size)
        summaries.append(
            AssetSummary(
                symbol=symbol,
                name=ASSET_NAMES.get(symbol, symbol),
                source="Yahoo Finance seed snapshot",
                start_date=start_date,
                end_date=end_date,
                rows=len(frame),
                last_close=float(close.iloc[-1]),
                total_return=float(close.iloc[-1] / close.iloc[0] - 1),
                annualized_volatility=float(returns.std() * (252**0.5)),
                missing_days=missing_days,
                quality_status="warning" if missing_days else "ok",
            )
        )
    return summaries


@router.get("/{symbol}/series", response_model=AssetSeries)
def asset_series(
    symbol: str,
    request: Request,
    start: str | None = Query(default=None),
    end: str | None = Query(default=None),
) -> AssetSeries:
    symbol = symbol.upper()
    frame = _store(request).get_frame(symbol, start=start, end=end)
    if frame.empty:
        raise HTTPException(status_code=404, detail=f"No market data found for {symbol}")
    frame = add_price_indicators(frame)
    points: list[SeriesPoint] = []
    for row in frame.itertuples(index=False):
        points.append(
            SeriesPoint(
                date=row.date,
                open=float(row.open),
                high=float(row.high),
                low=float(row.low),
                close=float(row.close),
                adj_close=float(row.adj_close),
                volume=float(row.volume),
                sma_20=None if pd.isna(row.sma_20) else float(row.sma_20),
                ema_20=None if pd.isna(row.ema_20) else float(row.ema_20),
                rolling_volatility=None
                if pd.isna(row.rolling_volatility)
                else float(row.rolling_volatility),
                drawdown=None if pd.isna(row.drawdown) else float(row.drawdown),
            )
        )
    return AssetSeries(symbol=symbol, name=ASSET_NAMES.get(symbol, symbol), data=points)
