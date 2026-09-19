from collections.abc import Mapping
from typing import Protocol

import pandas as pd


class Strategy(Protocol):
    name: str

    def signal(self, close: pd.Series, params: Mapping[str, int | float]) -> pd.Series:
        """Return a signal known at the close of each date."""


def require_integer_param(params: Mapping[str, int | float], name: str, minimum: int) -> int:
    value = params.get(name)
    if value is None or int(value) != value or int(value) < minimum:
        raise ValueError(f"{name} must be an integer >= {minimum}")
    return int(value)
