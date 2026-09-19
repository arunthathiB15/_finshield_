# Finshield

**Don't just backtest. Stress-test.**

Finshield is a production-shaped MVP for multi-asset quantitative research. It evaluates whether a strategy's historical result remains credible when parameters, transaction costs, testing periods, and market regimes change.

## Scope

- Assets: Gold (`GC=F` / `XAUUSD`), Bitcoin (`BTC-USD`), and NVIDIA (`NVDA`)
- Daily OHLCV data from 2018 to present, with committed offline seed data
- FastAPI backend with DuckDB/parquet market-data storage
- React 18 + Vite + TypeScript frontend
- Causal SMA/EMA indicators and a long/flat SMA crossover strategy
- Backtesting with one-bar signal delay, transaction costs, slippage, and buy-and-hold benchmarks
- Chronological train/test validation, trend and volatility regime attribution, cost sensitivity, parameter sensitivity, and a transparent Strategy Trust Score
- Server-side Featherless explanation layer that receives computed JSON context only; it never calculates metrics or predicts prices

## Current API slice

The current MVP slice loads the committed Yahoo Finance snapshots for all three
assets into `data/Finshield.duckdb` during API startup. It exposes:

```text
GET /health
GET /api/assets
GET /api/assets/{symbol}/series?start=YYYY-MM-DD&end=YYYY-MM-DD
POST /api/backtest
POST /api/analysis
POST /api/explanation
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

Step 5 adds `POST /api/explanation`. The endpoint accepts a validated
`AnalysisResponse` from the deterministic quant engine and, when
`FEATHERLESS_API_KEY` and `FEATHERLESS_MODEL` are configured, sends that JSON to
Featherless as an OpenAI-compatible chat-completions request. Featherless is used
only to turn the supplied metrics into plain language: it is explicitly instructed
not to calculate, invent numbers, predict prices, or recommend trades. When the
provider is not configured or is unavailable, the API returns a transparent
deterministic fallback explanation so the local demo still works. The provider
key remains server-side and must never be committed.

The first metrics are deliberately transparent: total return compounds daily
returns; CAGR annualises that compounded result; Sharpe is average return per
unit of volatility; Sortino replaces total volatility with downside deviation;
maximum drawdown is the largest peak-to-trough equity fall; and cost drag is
the compounded gross result minus the compounded result after costs.

## Step status

- Steps 1-2: committed seed-data warehouse, asset API, causal indicators, and asset dashboard.
- Step 3: committed SMA crossover backtest lab with costs, slippage, benchmark, equity curve, trade log, metrics, tests, and CI.
- Step 4: deterministic reliability analysis described above.
- Step 5: server-side Featherless explanation endpoint, safe deterministic fallback, and frontend explanation panel.
- Step 6: stable asset selection, final documentation, demo rehearsal, and submission verification.

## Repository layout

```text
Finshield/
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

Prerequisites: Python 3.11+, Node.js 20+, and npm.

```bash
cp .env.example .env
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```

On Windows PowerShell, use the equivalent commands:

```powershell
Copy-Item .env.example .env
py -3.13 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r backend\requirements.txt
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```

To enable the Featherless language layer, set these values in the uncommitted
`.env` file using a model available in your Featherless account:

```text
FEATHERLESS_API_KEY=your-server-side-key
FEATHERLESS_MODEL=your-featherless-model
```

The default provider URL is the Featherless OpenAI-compatible chat-completions
endpoint. See the [Featherless completions documentation](https://featherless.ai/docs/completions)
for the current provider contract. Leaving these values blank uses the local
deterministic fallback.

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Install dependencies only after cloning or changing dependency files. Start one
FastAPI process at a time; a second process can lock the local DuckDB file. The
backend resolves the committed `data` directory from the repository root, so
launching it from another current folder does not silently produce an empty
asset list.

The API health endpoint will be available at `http://localhost:8000/health`.

## Step 6 demo checklist

1. Start FastAPI once and wait for `Application startup complete`.
2. Start Vite in a second terminal and open `http://localhost:5173`.
3. Confirm the Asset selector contains Gold Futures (`GC=F`), Bitcoin
   (`BTC-USD`), and NVIDIA (`NVDA`).
4. Change the asset in either selector and confirm the price chart and summary
   cards update to the same asset.
5. Run a backtest, change the asset, and confirm the previous result clears
   before running the new asset.
6. Run the explanation panel and confirm it reports either Featherless or the
   deterministic fallback source.

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
