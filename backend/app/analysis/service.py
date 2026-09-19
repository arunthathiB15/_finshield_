from __future__ import annotations

from dataclasses import dataclass

import pandas as pd

from backend.app.analysis.regimes import regime_breakdown
from backend.app.analysis.robustness import RobustnessResult, run_robustness_analysis
from backend.app.analysis.trust_score import calculate_trust_score
from backend.app.analysis.validation import ValidationResult, run_train_test_validation
from backend.app.backtest.engine import BacktestResult, run_backtest


@dataclass(frozen=True)
class Step4AnalysisResult:
    base_result: BacktestResult
    validation: ValidationResult
    regime_breakdown: list[dict[str, float | int | str]]
    robustness: RobustnessResult
    trust_score: dict[str, object]


def run_step4_analysis(
    frame: pd.DataFrame,
    strategy_name: str,
    params: dict[str, int | float],
    capital: float,
    transaction_cost: float,
    slippage: float,
    periods_per_year: int,
    train_fraction: float = 0.7,
) -> Step4AnalysisResult:
    base_result = run_backtest(
        frame,
        strategy_name,
        params,
        capital,
        transaction_cost,
        slippage,
        periods_per_year,
    )
    validation = run_train_test_validation(
        frame,
        strategy_name,
        params,
        capital,
        transaction_cost,
        slippage,
        periods_per_year,
        train_fraction,
    )
    regimes = regime_breakdown(frame, base_result, periods_per_year)
    robustness = run_robustness_analysis(
        frame,
        strategy_name,
        params,
        capital,
        transaction_cost,
        slippage,
        periods_per_year,
    )
    trust_score = calculate_trust_score(
        base_result.metrics,
        base_result.benchmark_metrics,
        validation.train_metrics,
        validation.test_metrics,
        regimes,
        robustness.cost_sensitivity,
        robustness.parameter_sensitivity,
    )
    return Step4AnalysisResult(
        base_result=base_result,
        validation=validation,
        regime_breakdown=regimes,
        robustness=robustness,
        trust_score=trust_score,
    )
