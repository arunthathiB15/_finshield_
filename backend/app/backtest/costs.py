import pandas as pd


def position_turnover(position: pd.Series) -> pd.Series:
    """Measure absolute position change, including the initial entry."""

    return position.diff().abs().fillna(position.abs()).astype(float)


def apply_transaction_costs(
    gross_returns: pd.Series,
    turnover: pd.Series,
    transaction_cost: float,
    slippage: float,
) -> tuple[pd.Series, pd.Series]:
    """Subtract commission plus slippage on every position change.

    Both inputs are rates. For example, 0.001 means 10 basis points. A
    position change of 1.0 therefore costs transaction_cost + slippage of the
    portfolio value at that bar.
    """

    cost_rate = transaction_cost + slippage
    cost_returns = turnover * cost_rate
    return gross_returns - cost_returns, cost_returns
