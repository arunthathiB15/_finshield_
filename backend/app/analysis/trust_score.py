from __future__ import annotations

from typing import Any


def _clamp(value: float, lower: float = 0.0, upper: float = 100.0) -> float:
    return max(lower, min(upper, float(value)))


def _component(
    name: str,
    weight: float,
    score: float,
    rationale: str,
) -> dict[str, float | str]:
    score = _clamp(score)
    return {
        "name": name,
        "weight": weight,
        "score": round(score, 2),
        "contribution": round(weight * score / 100.0, 2),
        "rationale": rationale,
    }


def calculate_trust_score(
    base_metrics: dict[str, Any],
    benchmark_metrics: dict[str, Any],
    train_metrics: dict[str, Any],
    test_metrics: dict[str, Any],
    regime_breakdown: list[dict[str, Any]],
    cost_sensitivity: list[dict[str, Any]],
    parameter_sensitivity: list[dict[str, Any]],
) -> dict[str, Any]:
    """Calculate a transparent, descriptive 0-100 historical robustness score."""

    sharpe_score = _clamp(50.0 + 25.0 * float(base_metrics["sharpe"]))
    drawdown_score = _clamp(100.0 * (1.0 + float(base_metrics["max_drawdown"])))

    train_return = float(train_metrics["total_return"])
    test_return = float(test_metrics["total_return"])
    if abs(train_return) < 1e-9:
        oos_score = 75.0 if test_return >= 0 else 25.0
    else:
        oos_score = _clamp(50.0 + 50.0 * (test_return / train_return))

    profitable_regimes = sum(
        float(row["strategy_total_return"]) >= 0 for row in regime_breakdown
    )
    regime_score = (
        100.0 * profitable_regimes / len(regime_breakdown)
        if regime_breakdown
        else 50.0
    )

    if cost_sensitivity:
        baseline_return = float(cost_sensitivity[0]["total_return"])
        stressed_return = float(cost_sensitivity[-1]["total_return"])
        cost_score = _clamp(
            50.0 + 50.0 * (stressed_return / max(abs(baseline_return), 1e-9))
        )
    else:
        cost_score = 50.0

    positive_parameter_results = sum(
        float(row["total_return"]) >= 0 for row in parameter_sensitivity
    )
    parameter_score = (
        100.0 * positive_parameter_results / len(parameter_sensitivity)
        if parameter_sensitivity
        else 50.0
    )

    benchmark_difference = float(base_metrics["total_return"]) - float(
        benchmark_metrics["total_return"]
    )
    benchmark_score = _clamp(50.0 + 50.0 * benchmark_difference)

    components = [
        _component(
            "Risk-adjusted performance",
            15.0,
            sharpe_score,
            "Based on the cost-aware Sharpe ratio.",
        ),
        _component(
            "Drawdown control",
            10.0,
            drawdown_score,
            "Higher scores reflect smaller historical peak-to-trough losses.",
        ),
        _component(
            "Out-of-sample consistency",
            20.0,
            oos_score,
            "Compares chronological test performance with the training period.",
        ),
        _component(
            "Regime stability",
            15.0,
            regime_score,
            "Counts positive results across trend and volatility buckets.",
        ),
        _component(
            "Transaction-cost resilience",
            15.0,
            cost_score,
            "Measures how much performance survives the highest tested cost.",
        ),
        _component(
            "Parameter stability",
            15.0,
            parameter_score,
            "Measures the share of nearby parameter combinations with non-negative returns.",
        ),
        _component(
            "Benchmark discipline",
            10.0,
            benchmark_score,
            "Compares the strategy's total return with cost-aware buy-and-hold.",
        ),
    ]
    score = round(sum(float(item["contribution"]) for item in components), 2)
    if score >= 75:
        verdict = "Robust across tested assumptions"
    elif score >= 55:
        verdict = "Promising but needs validation"
    else:
        verdict = "Fragile under tested assumptions"

    return {
        "score": score,
        "verdict": verdict,
        "components": components,
        "disclaimer": "Historical robustness is not a prediction or a guarantee of future returns.",
    }
