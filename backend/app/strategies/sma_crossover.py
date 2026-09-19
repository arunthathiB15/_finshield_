from collections.abc import Mapping

import pandas as pd

from backend.app.strategies.base import require_integer_param


class SMACrossover:
    name = "sma_crossover"

    def signal(self, close: pd.Series, params: Mapping[str, int | float]) -> pd.Series:
        """Return a long/flat signal from fast and slow moving-average crossover.

        The signal is deliberately not shifted here. The backtest engine shifts
        it by one bar before applying returns, making the no-look-ahead rule
        explicit in one central place.
        """

        fast_window = require_integer_param(params, "fast_window", 2)
        slow_window = require_integer_param(params, "slow_window", fast_window + 1)
        fast = close.rolling(fast_window, min_periods=fast_window).mean()
        slow = close.rolling(slow_window, min_periods=slow_window).mean()
        signal = (fast > slow).astype(float)
        return signal.where(fast.notna() & slow.notna(), 0.0)
