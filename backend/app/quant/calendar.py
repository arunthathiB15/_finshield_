def periods_per_year_for_symbol(symbol: str) -> int:
    """Return the annualisation convention for an asset's trading calendar."""

    return 365 if symbol.upper() == "BTC-USD" else 252
