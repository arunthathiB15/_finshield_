import numpy as np
import pandas as pd


def add_price_indicators(frame: pd.DataFrame) -> pd.DataFrame:
    """Add transparent, causal indicators used by the first asset chart.

    SMA is the arithmetic mean of the last 20 closing prices. EMA gives newer
    prices more weight. Rolling volatility is standard deviation of daily
    returns annualised by sqrt(252), the approximate number of trading days.
    Drawdown is current close divided by the running peak minus one.
    """

    result = frame.copy()
    close = result["close"].astype(float)
    daily_returns = close.pct_change()
    result["sma_20"] = close.rolling(20, min_periods=20).mean()
    result["ema_20"] = close.ewm(span=20, adjust=False, min_periods=20).mean()
    result["rolling_volatility"] = daily_returns.rolling(20, min_periods=20).std() * np.sqrt(252)
    result["drawdown"] = close / close.cummax() - 1.0
    return result
