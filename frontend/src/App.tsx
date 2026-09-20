import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

import { getAssets, getCorrelationAnalysis, getMarketNews } from "./api/client";
import { Header } from "./components/Header";
import { PriceChart } from "./components/PriceChart";
import { StrategyLab } from "./components/StrategyLab";
import { AssetSelector } from "./components/AssetSelector";
import { CorrelationPanel } from "./components/CorrelationPanel";
import { HelpDeskChatbot } from "./components/HelpDeskChatbot";
import { MarketNewsPanel } from "./components/MarketNewsPanel";
import { useAssetSeries } from "./hooks/useAssetSeries";
import type { AssetSummary, ChatContext, SeriesPoint, ThemeMode } from "./types";

function percent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function money(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function downloadMetadata(asset: AssetSummary, latestPoint?: SeriesPoint): void {
  const metadata = {
    metadata_version: "1.0",
    exported_at: new Date().toISOString(),
    asset,
    latest_observation: latestPoint ?? null,
  };

  const blob = new Blob([JSON.stringify(metadata, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const safeSymbol = asset.symbol.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  anchor.href = url;
  anchor.download = `${safeSymbol || "finshield"}-metadata.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function App() {
  // FinShield uses one restrained terminal palette. Keeping a single theme
  // prevents the dashboard from switching to a second, unrelated visual system.
  const theme: ThemeMode = "dark";
  const isDark = theme === "dark";
  const [symbol, setSymbol] = useState("NVDA");
  const [newsRefreshNonce, setNewsRefreshNonce] = useState(0);
  const [strategyChatContext, setStrategyChatContext] = useState<
    Pick<ChatContext, "backtest" | "analysis">
  >({ backtest: null, analysis: null });

  const handleStrategyContextChange = useCallback(
    (context: Pick<ChatContext, "backtest" | "analysis">) => {
      setStrategyChatContext(context);
    },
    [],
  );

  // Keep the document theme class in sync with the fixed FinShield palette.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark");
    root.classList.remove("light");
  }, [theme]);

  // Dynamic Cursor Tracking on Liquid Glass Boxes
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cards = document.querySelectorAll<HTMLElement>(".dynamic-glass-card, .dynamic-subcard");
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (x >= -40 && x <= rect.width + 40 && y >= -40 && y <= rect.height + 40) {
          card.style.setProperty("--mouse-x", `${x}px`);
          card.style.setProperty("--mouse-y", `${y}px`);
        }
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Fetch the universe from FastAPI. Never replace failed responses with
  // hard-coded or generated market values.
  const assetsQuery = useQuery({
    queryKey: ["assets"],
    queryFn: getAssets,
    staleTime: 60_000,
    retry: 1,
  });
  const correlationQuery = useQuery({
    queryKey: ["correlation-analysis"],
    queryFn: getCorrelationAnalysis,
    staleTime: 60_000,
    retry: 1,
  });
  const newsQuery = useQuery({
    queryKey: ["market-news", symbol, newsRefreshNonce],
    queryFn: () => getMarketNews(symbol, 12, newsRefreshNonce > 0),
    enabled: Boolean(symbol),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const availableAssets = assetsQuery.data ?? [];

  useEffect(() => {
    if (!availableAssets.length) return;
    setSymbol((currentSymbol) =>
      availableAssets.some((asset) => asset.symbol === currentSymbol)
        ? currentSymbol
        : availableAssets[0].symbol
    );
  }, [availableAssets]);

  const seriesQuery = useAssetSeries(symbol);
  const selectedAsset = availableAssets.find((asset) => asset.symbol === symbol);

  const chartData = useMemo(() => {
    return seriesQuery.data?.data.slice(-365) ?? [];
  }, [seriesQuery.data, symbol]);

  const latestPoint = seriesQuery.data?.data[seriesQuery.data.data.length - 1];
  const firstPoint = seriesQuery.data?.data[0];
  const displayClose = latestPoint?.close ?? selectedAsset?.last_close;
  const displayDate = latestPoint?.date ?? selectedAsset?.end_date;
  const displayReturn =
    firstPoint && latestPoint
      ? latestPoint.close / firstPoint.close - 1
      : selectedAsset?.total_return;

  if (assetsQuery.isLoading) {
    return <main className="page-state">Loading validated market data…</main>;
  }

  if (assetsQuery.isError) {
    return (
      <main className="page-state error">
        <div className="page-state-card">
          <p>FastAPI is unavailable, so no market values are shown.</p>
          <p className="muted">Start the backend on port 8000, then retry.</p>
          <button className="primary-button" type="button" onClick={() => assetsQuery.refetch()}>
            Retry connection
          </button>
        </div>
      </main>
    );
  }

  if (!availableAssets.length) {
    return (
      <main className="page-state error">
        <div className="page-state-card">
          <p>No validated assets were returned by FastAPI.</p>
          <button className="primary-button" type="button" onClick={() => assetsQuery.refetch()}>
            Retry asset loading
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="finshield-root min-h-screen flex flex-col">
      {/* Institutional Specular Header */}
      <Header
        theme={theme}
        isApiConnected={!assetsQuery.isError}
        onRefresh={() => {
          assetsQuery.refetch();
          seriesQuery.refetch();
        }}
      />

      {/* Main Single-Page Sequential Intelligence Workflow */}
      <main className="app-shell flex-1">
        {/* Step 1: Asset Intelligence Hero Panel */}
        <section className="dynamic-glass-card p-5 sm:p-7 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-col gap-1.5 max-w-2xl">
            <div className="text-[11px] font-extrabold tracking-widest uppercase text-blue-600 dark:text-primary-container">
              STEP 1 · ASSET INTELLIGENCE
            </div>
            <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight ${isDark ? "text-on-surface" : "text-text-obsidian"}`}>
              Understand the market before testing the strategy.
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-on-surface-variant leading-relaxed">
              Seed data is loaded locally into DuckDB, so this screen remains usable without a live network call.
            </p>
          </div>

          <div className="shrink-0 w-full md:w-auto flex flex-col gap-3">
            <AssetSelector
              assets={availableAssets}
              value={symbol}
              onChange={setSymbol}
              id="overview-asset-selector"
              disabled={assetsQuery.isFetching}
              theme={theme}
            />
            <button
              className="secondary-button"
              type="button"
              disabled={!selectedAsset || seriesQuery.isFetching}
              onClick={() => {
                if (selectedAsset) downloadMetadata(selectedAsset, latestPoint);
              }}
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                download
              </span>
              Download metadata
            </button>
          </div>
        </section>

        {/* Selected Asset Metric Grid */}
        {selectedAsset && (
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <article className="dynamic-glass-card p-4 sm:p-5 flex flex-col justify-between min-h-[110px]">
              <span className="font-label-caps text-[10px] uppercase opacity-70 font-semibold">
                Last close
              </span>
              <strong className={`font-metric-lg text-xl sm:text-2xl font-bold my-1 ${isDark ? "text-on-surface" : "text-text-obsidian"}`}>
                {displayClose === undefined ? "—" : `$${money(displayClose)}`}
              </strong>
              <small className="opacity-60 text-[11px] font-medium">{displayDate}</small>
            </article>

            <article className="dynamic-glass-card p-4 sm:p-5 flex flex-col justify-between min-h-[110px]">
              <span className="font-label-caps text-[10px] uppercase opacity-70 font-semibold">
                Full-period return
              </span>
              <strong
                className={`font-metric-lg text-xl sm:text-2xl font-bold my-1 ${
                  (displayReturn ?? selectedAsset.total_return) >= 0
                    ? "text-emerald-600 dark:text-primary-container"
                    : "text-rose-500"
                }`}
              >
                {percent(displayReturn ?? selectedAsset.total_return)}
              </strong>
              <small className="opacity-60 text-[11px] font-medium">Close-to-close</small>
            </article>

            <article className="dynamic-glass-card p-4 sm:p-5 flex flex-col justify-between min-h-[110px]">
              <span className="font-label-caps text-[10px] uppercase opacity-70 font-semibold">
                Annualized volatility
              </span>
              <strong className={`font-metric-lg text-xl sm:text-2xl font-bold my-1 ${isDark ? "text-on-surface" : "text-text-obsidian"}`}>
                {percent(selectedAsset.annualized_volatility)}
              </strong>
              <small className="opacity-60 text-[11px] font-medium">
                Daily returns × √{selectedAsset.periods_per_year}
              </small>
            </article>

            <article className="dynamic-glass-card p-4 sm:p-5 flex flex-col justify-between min-h-[110px]">
              <span className="font-label-caps text-[10px] uppercase opacity-70 font-semibold">
                Data quality
              </span>
              <strong className="font-metric-lg text-xl sm:text-2xl font-bold my-1 text-emerald-600 dark:text-primary-container uppercase">
                {selectedAsset.quality_status === "ok" ? "OPTIMAL" : selectedAsset.quality_status.toUpperCase()}
              </strong>
              <small className="opacity-60 text-[11px] font-medium">
                {selectedAsset.rows.toLocaleString()} rows · {selectedAsset.missing_days} expected sessions missing
              </small>
            </article>
          </section>
        )}

        {/* Step 2: Price and Trend Chart Panel */}
        <section className="dynamic-glass-card p-5 sm:p-7 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <div className="text-[11px] font-extrabold tracking-widest uppercase text-blue-600 dark:text-primary-container">
                STEP 2 · MARKET OVERVIEW
              </div>
              <h3 className={`text-xl sm:text-2xl font-bold tracking-tight mt-1 ${isDark ? "text-on-surface" : "text-text-obsidian"}`}>
                {symbol} price and trend
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-on-surface-variant">
                Last 365 available sessions · SMA and EMA use only information available at each date.
              </p>
            </div>
            {seriesQuery.isFetching && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-primary-container/10 text-blue-600 dark:text-primary-container border border-blue-200 dark:border-primary-container/20">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-primary-container animate-pulse" />
                Refreshing…
              </span>
            )}
          </div>

          {seriesQuery.isError && <p className="error-panel">Could not load the selected asset series from FastAPI.</p>}
          {!seriesQuery.isError && chartData.length > 0 && <PriceChart data={chartData} theme={theme} />}
          {!seriesQuery.isError && !seriesQuery.isFetching && chartData.length === 0 && (
            <p className="empty-panel">No validated price observations were returned for {symbol}.</p>
          )}
        </section>

        <CorrelationPanel
          data={correlationQuery.data}
          isLoading={correlationQuery.isLoading}
          isError={correlationQuery.isError}
          theme={theme}
        />

        <MarketNewsPanel
          data={newsQuery.data}
          isLoading={newsQuery.isLoading}
          isFetching={newsQuery.isFetching}
          isError={newsQuery.isError}
          onRefresh={() => setNewsRefreshNonce((value) => value + 1)}
          theme={theme}
        />

        {/* Steps 3, 4 & 5: Strategy Lab, Results, Reliability Lab, and Plain-Language Explanation */}
        <StrategyLab
          assets={availableAssets}
          symbol={symbol}
          onSymbolChange={setSymbol}
          onContextChange={handleStrategyContextChange}
          theme={theme}
        />

        {/* Footer */}
        <footer className="text-center text-xs opacity-50 py-8">
          For research and educational quantitative analysis. Historical backtest results do not guarantee future performance.
        </footer>
      </main>

      <HelpDeskChatbot
        context={{
          selected_asset: selectedAsset ?? null,
          latest_observation: latestPoint ?? null,
          correlation: correlationQuery.data ?? null,
          news: newsQuery.data ?? null,
          ...strategyChatContext,
        }}
      />
    </div>
  );
}
