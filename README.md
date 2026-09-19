# QuantGuard

**Don't just backtest. Stress-test.**

QuantGuard is a production-shaped MVP for multi-asset quantitative research. It evaluates whether a strategy's historical result remains credible when parameters, transaction costs, testing periods, and market regimes change.

## Scope

- Assets: Gold (`GC=F` / `XAUUSD`), Bitcoin (`BTC-USD`), and NVIDIA (`NVDA`)
- Daily OHLCV data from 2018 to present, with committed offline seed data
- FastAPI backend with DuckDB/parquet market-data storage
- React 18 + Vite + TypeScript frontend
- Causal SMA/EMA indicators and a long/flat SMA crossover strategy
- Backtesting with one-bar signal delay, transaction costs, slippage, and buy-and-hold benchmarks
- Chronological train/test validation, trend and volatility regime attribution, cost sensitivity, parameter sensitivity, and a transparent Strategy Trust Score
- Featherless configuration placeholders only; the server-side AI explanation is planned for Step 5 and is not yet called

## Current API slice

The current MVP slice loads the committed Yahoo Finance snapshots for all three
assets into `data/quantguard.duckdb` during API startup. It exposes:

```text
GET /health
GET /api/assets
GET /api/assets/{symbol}/series?start=YYYY-MM-DD&end=YYYY-MM-DD
POST /api/backtest
POST /api/analysis
```

The series endpoint returns OHLCV plus causal 20-day SMA, EMA, annualized
rolling volatility, and drawdown. The frontend currently uses that endpoint to
render the Asset Intelligence chart. A missing exchange session is reported as
a data-quality gap; prices are not forward-filled because that would invent a
trade. The current demo uses committed Yahoo Finance seed snapshots; live
provider refresh and a secondary-provider fallback remain future data-layer
work, while the local CSVs keep the demo reproducible.

The Strategy Lab currently supports a long/flat SMA crossover. It accepts
initial capital, fast/slow windows, transaction cost, slippage, and an optional
date range. The backtest compares the strategy with buy-and-hold on the same
asset and same cost assumptions. A signal observed on date `t` is applied to
returns on date `t+1`; this one-bar shift is the core protection against
look-ahead bias.

Step 4 adds the reliability layer through `POST /api/analysis`. It returns a
chronological 70/30 train/test split, bull/bear and high/low-volatility regime
breakdowns, transaction-cost sensitivity, nearby SMA parameter sensitivity, and
a transparent 0-100 Strategy Trust Score. The score is a historical robustness
summary, not a prediction or a guarantee of future returns.

The first metrics are deliberately transparent: total return compounds daily
returns; CAGR annualises that compounded result; Sharpe is average return per
unit of volatility; Sortino replaces total volatility with downside deviation;
maximum drawdown is the largest peak-to-trough equity fall; and cost drag is
the compounded gross result minus the compounded result after costs.

## Step status

- Steps 1-2: committed seed-data warehouse, asset API, causal indicators, and asset dashboard.
- Step 3: committed SMA crossover backtest lab with costs, slippage, benchmark, equity curve, trade log, metrics, tests, and CI.
- Step 4: deterministic reliability analysis described above.
- Step 5: planned server-side Featherless explanation endpoint. Featherless will receive computed JSON only; it will never calculate metrics or predict prices.
- Step 6: planned AI analyst UI, final documentation, demo rehearsal, and submission verification.

## Repository layout

```text
quantguard/
├── backend/          # FastAPI service, quant engine, analysis modules, and tests
├── frontend/         # React/Vite client
├── data/             # Committed seed CSVs and local warehouse output
├── notebooks/        # Validation notebooks
├── .github/workflows/ci.yml
├── docker-compose.yml
└── README.md
```

## Development principles

Signals are shifted by one bar before returns are applied. Costs and slippage are charged on every position change. Metrics are tested with hand-computed expectations. The current Step 4 validation uses a chronological train/test split with a warm-up window for causal indicators. The Trust Score combines risk-adjusted performance, drawdown, out-of-sample consistency, regime stability, cost resilience, nearby-parameter stability, and benchmark comparison.

Annualisation follows the trading calendar: 252 periods for Gold and NVIDIA, and 365 periods for Bitcoin. Financial calculations happen in the quant engine before any future AI explanation layer.

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
