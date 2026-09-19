from __future__ import annotations

from io import StringIO

import pandas as pd
import requests
import yfinance as yf


YAHOO_SYMBOLS = {"GC=F": "GC=F", "BTC-USD": "BTC-USD", "NVDA": "NVDA"}
STOOQ_SYMBOLS = {"GC=F": "gc.f", "BTC-USD": "btcusd", "NVDA": "nvda.us"}


def _flatten_yahoo_columns(frame: pd.DataFrame) -> pd.DataFrame:
    if isinstance(frame.columns, pd.MultiIndex):
        frame.columns = [column[0] for column in frame.columns]
    frame = frame.reset_index()
    return frame.rename(columns={"Date": "date", "Adj Close": "adj_close"})


def fetch_yfinance(symbol: str, start: str = "2018-01-01") -> pd.DataFrame:
    """Fetch daily data from Yahoo Finance for an online refresh."""

    if symbol not in YAHOO_SYMBOLS:
        raise ValueError(f"Unsupported Yahoo symbol: {symbol}")
    frame = yf.download(
        YAHOO_SYMBOLS[symbol],
        start=start,
        auto_adjust=False,
        progress=False,
        threads=False,
    )
    if frame.empty:
        raise ValueError(f"Yahoo Finance returned no rows for {symbol}")
    return _flatten_yahoo_columns(frame)


def fetch_stooq(symbol: str, start: str = "2018-01-01") -> pd.DataFrame:
    """Fallback CSV fetcher; callers should still run validate_ohlcv afterward."""

    if symbol not in STOOQ_SYMBOLS:
        raise ValueError(f"Unsupported Stooq symbol: {symbol}")
    response = requests.get(
        "https://stooq.com/q/d/l/",
        params={"s": STOOQ_SYMBOLS[symbol], "i": "d", "d1": start.replace("-", "")},
        timeout=20,
    )
    response.raise_for_status()
    return pd.read_csv(StringIO(response.text))


def fetch_with_fallback(symbol: str, start: str = "2018-01-01") -> tuple[pd.DataFrame, str]:
    try:
        return fetch_yfinance(symbol, start), "yfinance"
    except Exception as yahoo_error:
        try:
            return fetch_stooq(symbol, start), "stooq"
        except Exception as stooq_error:
            raise RuntimeError(
                f"Unable to fetch {symbol} from yfinance or Stooq: "
                f"yfinance={yahoo_error}; stooq={stooq_error}"
            ) from stooq_error
