# QuantGuard

**Don't just backtest. Stress-test.**

QuantGuard is a production-shaped MVP for multi-asset quantitative research. It evaluates whether a strategy's historical result remains credible when parameters, transaction costs, testing periods, and market regimes change.

## Scope

- Assets: Gold (`GC=F` / `XAUUSD`), Bitcoin (`BTC-USD`), and NVIDIA (`NVDA`)
- Daily OHLCV data from 2018 to present, with committed offline seed data
- FastAPI backend with DuckDB/parquet market-data storage
- React 18 + Vite + TypeScript frontend
- SMA/EMA, momentum, and mean-reversion strategies
- Backtesting with one-bar signal delay, transaction costs, slippage, and buy-and-hold benchmarks
- Walk-forward validation, regime analysis, EWMA/GARCH volatility, and robustness testing
- Server-side Featherless explanations based only on computed JSON metrics

## Repository layout

```text
quantguard/
├── backend/          # FastAPI service, quant engine, models, and tests
├── frontend/         # React/Vite client
├── data/             # Committed seed CSVs and local warehouse output
├── notebooks/        # Validation notebooks
├── .github/workflows/ci.yml
├── docker-compose.yml
└── README.md
```

## Development principles

Signals are shifted by one bar before returns are applied. Costs and slippage are charged on every position change. Metrics are tested with hand-computed expectations. Parameter selection uses rolling train/test windows so reported out-of-sample performance is separated from in-sample performance.

Financial formulas will be documented in the code and explained in the product UI when first introduced. For example, Sharpe ratio is excess return divided by return volatility; it estimates return earned per unit of variability.

## Local development

Prerequisites: Python 3.11, Node.js 20+, and npm.

```bash
cp .env.example .env
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --reload --port 8000
```

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The API health endpoint will be available at `http://localhost:8000/health`.

## Testing

```bash
pytest -q
```

## Docker

```bash
docker compose up --build
```

## Disclaimer

For research and educational analysis. Historical backtest results do not guarantee future performance.
