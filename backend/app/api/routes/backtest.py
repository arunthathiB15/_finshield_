import pandas as pd
from fastapi import APIRouter, HTTPException, Request

from backend.app.backtest.engine import run_backtest
from backend.app.core.schemas import (
    BacktestMetrics,
    BacktestRequest,
    BacktestResponse,
    EquityPoint,
    TradeEvent,
)
from backend.app.data.store import MarketDataStore

router = APIRouter(prefix="/api/backtest", tags=["backtest"])


def _store(request: Request) -> MarketDataStore:
    return request.app.state.market_data_store


@router.post("", response_model=BacktestResponse)
def create_backtest(payload: BacktestRequest, request: Request) -> BacktestResponse:
    symbol = payload.symbol.upper()
    frame = _store(request).get_frame(
        symbol,
        start=payload.period.start.isoformat() if payload.period.start else None,
        end=payload.period.end.isoformat() if payload.period.end else None,
    )
    if frame.empty:
        raise HTTPException(status_code=404, detail=f"No market data found for {symbol}")
    try:
        result = run_backtest(
            frame=frame,
            strategy_name=payload.strategy,
            params=payload.params,
            capital=payload.capital,
            transaction_cost=payload.cost,
            slippage=payload.slippage,
        )
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error

    curve = [
        EquityPoint(
            date=pd.Timestamp(row.date).date(),
            strategy_equity=float(row.strategy_equity),
            benchmark_equity=float(row.benchmark_equity),
            strategy_drawdown=float(row.strategy_drawdown),
            benchmark_drawdown=float(row.benchmark_drawdown),
            position=float(row.position),
        )
        for row in result.equity_curve.itertuples(index=False)
    ]
    trades = [
        TradeEvent(
            date=pd.Timestamp(row.date).date(),
            action=row.action,
            price=float(row.price),
            position=float(row.position),
            turnover=float(row.turnover),
            cost=float(row.cost),
        )
        for row in result.trades.itertuples(index=False)
    ]
    return BacktestResponse(
        symbol=symbol,
        strategy=payload.strategy,
        parameters=result.parameters,
        capital=payload.capital,
        transaction_cost=payload.cost,
        slippage=payload.slippage,
        period_start=curve[0].date,
        period_end=curve[-1].date,
        metrics=BacktestMetrics(**result.metrics),
        benchmark_metrics=BacktestMetrics(**result.benchmark_metrics),
        equity_curve=curve,
        trades=trades,
    )
