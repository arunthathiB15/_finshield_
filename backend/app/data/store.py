from pathlib import Path

import duckdb
import pandas as pd


class MarketDataStore:
    """Small DuckDB warehouse for validated daily OHLCV data."""

    def __init__(self, database_path: Path) -> None:
        database_path.parent.mkdir(parents=True, exist_ok=True)
        self.connection = duckdb.connect(str(database_path))
        self.connection.execute(
            """
            CREATE TABLE IF NOT EXISTS ohlcv (
                symbol VARCHAR NOT NULL,
                date DATE NOT NULL,
                open DOUBLE NOT NULL,
                high DOUBLE NOT NULL,
                low DOUBLE NOT NULL,
                close DOUBLE NOT NULL,
                adj_close DOUBLE NOT NULL,
                volume DOUBLE NOT NULL,
                PRIMARY KEY (symbol, date)
            )
            """
        )

    def replace_asset(self, symbol: str, frame: pd.DataFrame) -> None:
        prepared = frame.copy()
        prepared.insert(0, "symbol", symbol)
        prepared["date"] = pd.to_datetime(prepared["date"]).dt.date
        self.connection.execute("DELETE FROM ohlcv WHERE symbol = ?", [symbol])
        self.connection.register("validated_frame", prepared)
        try:
            self.connection.execute(
                """
                INSERT INTO ohlcv
                SELECT symbol, date, open, high, low, close, adj_close, volume
                FROM validated_frame
                """
            )
        finally:
            self.connection.unregister("validated_frame")

    def symbols(self) -> list[str]:
        rows = self.connection.execute("SELECT DISTINCT symbol FROM ohlcv ORDER BY symbol").fetchall()
        return [row[0] for row in rows]

    def get_frame(self, symbol: str, start: str | None = None, end: str | None = None) -> pd.DataFrame:
        query = "SELECT * FROM ohlcv WHERE symbol = ?"
        parameters: list[str] = [symbol]
        if start:
            query += " AND date >= CAST(? AS DATE)"
            parameters.append(start)
        if end:
            query += " AND date <= CAST(? AS DATE)"
            parameters.append(end)
        query += " ORDER BY date"
        return self.connection.execute(query, parameters).fetchdf()

    def close(self) -> None:
        self.connection.close()
