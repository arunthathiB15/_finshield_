import pandas as pd
from fastapi import APIRouter, HTTPException, Request

from backend.app.analysis.service import run_step4_analysis
from backend.app.core.schemas import (
    AnalysisRequest,
    AnalysisResponse,
    BacktestMetrics,
    CostSensitivityPoint,
    ParameterSensitivityPoint,
    RegimeMetric,
    TrustScore,
    ValidationSummary,
)
from backend.app.data.store import MarketDataStore
from backend.app.quant.calendar import periods_per_year_for_symbol

router = APIRouter(prefix="/api/analysis", tags=["analysis"])


def _store(request: Request) -> MarketDataStore:
    return request.app.state.market_data_store


@router.post("", response_model=AnalysisResponse)
def create_analysis(payload: AnalysisRequest, request: Request) -> AnalysisResponse:
    symbol = payload.symbol.upper()
    frame = _store(request).get_frame(
        symbol,
        start=payload.period.start.isoformat() if payload.period.start else None,
        end=payload.period.end.isoformat() if payload.period.end else None,
    )
    if frame.empty:
        raise HTTPException(status_code=404, detail=f"No market data found for {symbol}")

    periods_per_year = periods_per_year_for_symbol(symbol)
    try:
        result = run_step4_analysis(
            frame=frame,
            strategy_name=payload.strategy,
            params=payload.params,
            capital=payload.capital,
            transaction_cost=payload.cost,
            slippage=payload.slippage,
            periods_per_year=periods_per_year,
            train_fraction=payload.train_fraction,
        )
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error

    data = frame.sort_values("date").reset_index(drop=True)
    train_rows = result.validation.train_rows
    validation = result.validation
    validation_payload = ValidationSummary(
        split_date=validation.split_date.date(),
        train_start=pd.Timestamp(data.iloc[0]["date"]).date(),
        train_end=pd.Timestamp(data.iloc[train_rows - 1]["date"]).date(),
        test_start=validation.split_date.date(),
        test_end=pd.Timestamp(data.iloc[-1]["date"]).date(),
        train_rows=validation.train_rows,
        test_rows=validation.test_rows,
        train_metrics=BacktestMetrics(**validation.train_metrics),
        train_benchmark_metrics=BacktestMetrics(**validation.train_benchmark_metrics),
        test_metrics=BacktestMetrics(**validation.test_metrics),
        test_benchmark_metrics=BacktestMetrics(**validation.test_benchmark_metrics),
    )
    return AnalysisResponse(
        symbol=symbol,
        strategy=payload.strategy,
        parameters=result.base_result.parameters,
        periods_per_year=periods_per_year,
        metrics=BacktestMetrics(**result.base_result.metrics),
        benchmark_metrics=BacktestMetrics(**result.base_result.benchmark_metrics),
        validation=validation_payload,
        regime_breakdown=[RegimeMetric(**item) for item in result.regime_breakdown],
        cost_sensitivity=[
            CostSensitivityPoint(**item)
            for item in result.robustness.cost_sensitivity
        ],
        parameter_sensitivity=[
            ParameterSensitivityPoint(**item)
            for item in result.robustness.parameter_sensitivity
        ],
        trust_score=TrustScore(**result.trust_score),
    )
