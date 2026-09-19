import logging
from dataclasses import dataclass
from pathlib import Path

import numpy as np
import pandas as pd

from backend.app.data.store import MarketDataStore

logger = logging.getLogger(__name__)

REQUIRED_COLUMNS = {"date", "open", "high", "low", "close", "volume"}
ASSET_NAMES = {
    "GC=F": "Gold Futures",
    "BTC-USD": "Bitcoin",
    "NVDA": "NVIDIA",
}


@dataclass(frozen=True)
class DataQualityReport:
    symbol: str
    rows: int
    start_date: str
    end_date: str
    missing_days: int
    outlier_rows: int
    duplicate_rows: int
    status: str

    def as_dict(self) -> dict[str, int | str]:
        return {
            "symbol": self.symbol,
            "rows": self.rows,
            "start_date": self.start_date,
            "end_date": self.end_date,
            "missing_days": self.missing_days,
            "outlier_rows": self.outlier_rows,
            "duplicate_rows": self.duplicate_rows,
            "status": self.status,
        }


def _normalise_columns(frame: pd.DataFrame) -> pd.DataFrame:
    frame = frame.copy()
    frame.columns = [str(column).strip().lower().replace(" ", "_") for column in frame.columns]
    aliases = {"adjclose": "adj_close", "adjusted_close": "adj_close"}
    return frame.rename(columns=aliases)


def validate_ohlcv(frame: pd.DataFrame, symbol: str) -> tuple[pd.DataFrame, DataQualityReport]:
    """Validate one asset without forward-filling prices.

    Forward-filling an OHLC price would invent a traded price. Missing calendar
    sessions are therefore reported and left untouched; calendar alignment is a
    separate operation used only when a calculation explicitly needs it.
    """

    frame = _normalise_columns(frame)
    missing = REQUIRED_COLUMNS.difference(frame.columns)
    if missing:
        raise ValueError(f"{symbol}: missing required columns: {sorted(missing)}")

    if "adj_close" not in frame.columns:
        frame["adj_close"] = frame["close"]

    frame = frame[["date", "open", "high", "low", "close", "adj_close", "volume"]].copy()
    frame["date"] = pd.to_datetime(frame["date"], errors="coerce", utc=True).dt.tz_localize(None)
    numeric_columns = ["open", "high", "low", "close", "adj_close", "volume"]
    for column in numeric_columns:
        frame[column] = pd.to_numeric(frame[column], errors="coerce")

    duplicate_rows = int(frame["date"].duplicated().sum())
    frame = frame.dropna(subset=["date", "open", "high", "low", "close", "volume"])
    frame = frame.drop_duplicates(subset=["date"], keep="last").sort_values("date")
    frame = frame[(frame["close"] > 0) & (frame["high"] >= frame["low"])]
    if frame.empty:
        raise ValueError(f"{symbol}: no valid OHLCV rows remain after validation")

    returns = frame["close"].pct_change()
    outlier_rows = int((returns.abs() > 0.25).sum())
    expected_frequency = "D" if symbol == "BTC-USD" else "B"
    expected = pd.date_range(frame["date"].min(), frame["date"].max(), freq=expected_frequency)
    observed = pd.DatetimeIndex(frame["date"])
    missing_days = int(expected.difference(observed).size)
    status = "warning" if missing_days or outlier_rows else "ok"
    report = DataQualityReport(
        symbol=symbol,
        rows=len(frame),
        start_date=frame["date"].min().date().isoformat(),
        end_date=frame["date"].max().date().isoformat(),
        missing_days=missing_days,
        outlier_rows=outlier_rows,
        duplicate_rows=duplicate_rows,
        status=status,
    )
    return frame.reset_index(drop=True), report


def load_seed_data(store: MarketDataStore, seed_directory: Path) -> list[DataQualityReport]:
    """Load committed CSV snapshots into DuckDB and log their quality reports."""

    reports: list[DataQualityReport] = []
    for path in sorted(seed_directory.glob("*.csv")):
        symbol = path.stem
        if symbol not in ASSET_NAMES:
            continue
        frame, report = validate_ohlcv(pd.read_csv(path), symbol)
        store.replace_asset(symbol, frame)
        reports.append(report)
        logger.info("market_data_quality=%s", report.as_dict())
    if not reports:
        raise FileNotFoundError(f"No supported seed CSV files found in {seed_directory}")
    return reports
