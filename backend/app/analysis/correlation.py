from __future__ import annotations

from itertools import combinations

import numpy as np
import pandas as pd


CORRELATION_METHOD = (
    "Pearson correlation of aligned daily close-to-close returns; "
    "missing dates are not forward-filled"
)


def _close_returns(frame: pd.DataFrame, symbol: str) -> pd.Series:
    required_columns = {"date", "close"}
    missing_columns = required_columns.difference(frame.columns)
    if missing_columns:
        raise ValueError(f"{symbol}: missing columns {sorted(missing_columns)}")

    prepared = frame[["date", "close"]].copy()
    prepared["date"] = pd.to_datetime(prepared["date"], errors="coerce")
    prepared["close"] = pd.to_numeric(prepared["close"], errors="coerce")
    prepared = (
        prepared.dropna(subset=["date", "close"])
        .drop_duplicates(subset=["date"], keep="last")
        .sort_values("date")
    )
    prepared = prepared[prepared["close"] > 0]
    if len(prepared) < 3:
        raise ValueError(f"{symbol}: at least three valid prices are required")

    returns = prepared.set_index("date")["close"].pct_change().dropna()
    return returns.rename(symbol)


def build_correlation_payload(
    frames: dict[str, pd.DataFrame], names: dict[str, str]
) -> dict[str, object]:
    """Build cross-asset correlations from pairwise aligned returns.

    Pairwise alignment is intentional: BTC trades every calendar day while
    Gold and NVIDIA have exchange sessions. We compare only dates observed by
    both assets and never create a synthetic price by forward-filling.
    """

    symbols = list(frames)
    if len(symbols) < 2:
        raise ValueError("At least two assets are required for correlation analysis")

    return_series = {
        symbol: _close_returns(frame, symbol) for symbol, frame in frames.items()
    }
    matrix = {
        left: {right: (1.0 if left == right else 0.0) for right in symbols}
        for left in symbols
    }
    pairs: list[dict[str, object]] = []

    for left, right in combinations(symbols, 2):
        aligned = pd.concat(
            [return_series[left], return_series[right]], axis=1, join="inner"
        ).dropna()
        if len(aligned) < 2:
            raise ValueError(f"Not enough shared return dates for {left} and {right}")

        correlation = float(aligned[left].corr(aligned[right]))
        if not np.isfinite(correlation):
            raise ValueError(f"Correlation is undefined for {left} and {right}")
        correlation = max(-1.0, min(1.0, correlation))
        matrix[left][right] = correlation
        matrix[right][left] = correlation

        pairs.append(
            {
                "left_symbol": left,
                "right_symbol": right,
                "left_name": names.get(left, left),
                "right_name": names.get(right, right),
                "correlation": correlation,
                "observations": int(len(aligned)),
                "start_date": aligned.index.min().date(),
                "end_date": aligned.index.max().date(),
            }
        )

    return {
        "symbols": symbols,
        "names": {symbol: names.get(symbol, symbol) for symbol in symbols},
        "matrix": matrix,
        "pairs": pairs,
        "method": CORRELATION_METHOD,
    }
