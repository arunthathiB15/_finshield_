import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { getAssets } from "./api/client";
import { PriceChart } from "./components/PriceChart";
import { useAssetSeries } from "./hooks/useAssetSeries";

function percent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function money(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export default function App() {
  const assetsQuery = useQuery({
    queryKey: ["assets"],
    queryFn: getAssets,
    staleTime: 60_000,
  });
  const [symbol, setSymbol] = useState("NVDA");
  const seriesQuery = useAssetSeries(symbol);
  const selectedAsset = assetsQuery.data?.find((asset) => asset.symbol === symbol);
  const chartData = useMemo(() => seriesQuery.data?.data.slice(-365) ?? [], [seriesQuery.data]);

  if (assetsQuery.isLoading) {
    return <main className="page-state">Loading market universe…</main>;
  }

  if (assetsQuery.isError) {
    return <main className="page-state error">API unavailable. Start FastAPI on port 8000.</main>;
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <div className="eyebrow">QUANTITATIVE INTELLIGENCE PLATFORM</div>
          <h1>QuantGuard</h1>
          <p>Don&apos;t just backtest. Stress-test.</p>
        </div>
        <div className="api-status"><span /> API connected</div>
      </header>

      <section className="hero-panel">
        <div>
          <div className="eyebrow">ASSET INTELLIGENCE</div>
          <h2>Understand the market before testing the strategy.</h2>
          <p className="muted">
            Seed data is loaded locally into DuckDB, so this screen remains usable without a live network call.
          </p>
        </div>
        <label className="asset-picker">
          <span>Asset</span>
          <select value={symbol} onChange={(event) => setSymbol(event.target.value)}>
            {assetsQuery.data?.map((asset) => (
              <option key={asset.symbol} value={asset.symbol}>{asset.symbol} · {asset.name}</option>
            ))}
          </select>
        </label>
      </section>

      {selectedAsset && (
        <section className="metric-grid">
          <article className="metric-card"><span>Last close</span><strong>{money(selectedAsset.last_close)}</strong><small>{selectedAsset.end_date}</small></article>
          <article className="metric-card"><span>Full-period return</span><strong className={selectedAsset.total_return >= 0 ? "positive" : "negative"}>{percent(selectedAsset.total_return)}</strong><small>Close-to-close</small></article>
          <article className="metric-card"><span>Annualized volatility</span><strong>{percent(selectedAsset.annualized_volatility)}</strong><small>Daily returns × √252</small></article>
          <article className="metric-card"><span>Data quality</span><strong>{selectedAsset.quality_status.toUpperCase()}</strong><small>{selectedAsset.rows.toLocaleString()} rows · {selectedAsset.missing_days} expected sessions missing</small></article>
        </section>
      )}

      <section className="panel chart-panel">
        <div className="panel-heading">
          <div><h3>{symbol} price and trend</h3><p className="muted">Last 365 available sessions · SMA and EMA use only information available at each date.</p></div>
          {seriesQuery.isFetching && <span className="loading-label">Refreshing…</span>}
        </div>
        {seriesQuery.isError && <p className="error">Could not load the selected asset series.</p>}
        {chartData.length > 0 && <PriceChart data={chartData} />}
      </section>

      <footer>For research and educational analysis. Historical backtest results do not guarantee future performance.</footer>
    </main>
  );
}
