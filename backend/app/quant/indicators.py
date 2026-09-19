import numpy as np
import pandas as pd


def add_price_indicators(frame: pd.DataFrame, periods_per_year: int = 252) -> pd.DataFrame:
    """Add transparent, causal indicators used by the first asset chart.

    SMA is the arithmetic mean of the last 20 closing prices. EMA gives newer
    prices more weight. Rolling volatility is standard deviation of daily
    returns annualised by the supplied trading-calendar convention.
    Drawdown is current close divided by the running peak minus one.
    """

    result = frame.copy()
    close = result["close"].astype(float)
    daily_returns = close.pct_change()
    result["sma_20"] = close.rolling(20, min_periods=20).mean()
    result["ema_20"] = close.ewm(span=20, adjust=False, min_periods=20).mean()
    result["rolling_volatility"] = daily_returns.rolling(20, min_periods=20).std() * np.sqrt(periods_per_year)
    result["drawdown"] = close / close.cummax() - 1.0
    return result
