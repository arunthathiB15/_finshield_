import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { getAssets } from "./api/client";
import { Header } from "./components/Header";
import { PriceChart } from "./components/PriceChart";
import { StrategyLab } from "./components/StrategyLab";
import { AssetSelector } from "./components/AssetSelector";
import { useAssetSeries } from "./hooks/useAssetSeries";
import { DEFAULT_ASSET_SUMMARIES, generateMockSeries } from "./data/mockData";
import type { ThemeMode } from "./types";

function percent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function money(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [symbol, setSymbol] = useState("NVDA");

  // Sync html class for dark / light liquid glass theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
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

  // Fetch universe assets (with seamless fallback to cached local summaries)
  const assetsQuery = useQuery({
    queryKey: ["assets"],
    queryFn: getAssets,
    staleTime: 60_000,
    retry: 1,
  });

  const availableAssets = useMemo(() => {
    if (assetsQuery.data && assetsQuery.data.length > 0) {
      return assetsQuery.data;
    }
    return DEFAULT_ASSET_SUMMARIES;
  }, [assetsQuery.data]);

  useEffect(() => {
    if (!availableAssets.length) return;
    setSymbol((currentSymbol) =>
      availableAssets.some((asset) => asset.symbol === currentSymbol)
        ? currentSymbol
        : availableAssets[0].symbol
    );
  }, [availableAssets]);

  const seriesQuery = useAssetSeries(symbol);
  const selectedAsset = availableAssets.find((asset) => asset.symbol === symbol) || availableAssets[0];

  const chartData = useMemo(() => {
    if (seriesQuery.data?.data && seriesQuery.data.data.length > 0) {
      return seriesQuery.data.data.slice(-365);
    }
    return generateMockSeries(symbol);
  }, [seriesQuery.data, symbol]);

  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        isDark ? "bg-[#0a0e18] text-[#dfe2f1]" : "bg-[#FFFFFF] text-[#0F172A]"
      }`}
    >
      {/* Institutional Specular Header */}
      <Header
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
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

          <div className="shrink-0 w-full md:w-auto">
            <AssetSelector
              assets={availableAssets}
              value={symbol}
              onChange={setSymbol}
              id="overview-asset-selector"
              disabled={assetsQuery.isFetching}
              theme={theme}
            />
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
                ${money(selectedAsset.last_close)}
              </strong>
              <small className="opacity-60 text-[11px] font-medium">{selectedAsset.end_date}</small>
            </article>

            <article className="dynamic-glass-card p-4 sm:p-5 flex flex-col justify-between min-h-[110px]">
              <span className="font-label-caps text-[10px] uppercase opacity-70 font-semibold">
                Full-period return
              </span>
              <strong
                className={`font-metric-lg text-xl sm:text-2xl font-bold my-1 ${
                  selectedAsset.total_return >= 0
                    ? "text-emerald-600 dark:text-primary-container"
                    : "text-rose-500"
                }`}
              >
                {percent(selectedAsset.total_return)}
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
                {selectedAsset.quality_status}
              </strong>
              <small className="opacity-60 text-[11px] font-medium">
                {selectedAsset.rows.toLocaleString()} rows · {selectedAsset.missing_days} missing sessions
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

          {chartData.length > 0 && <PriceChart data={chartData} theme={theme} />}
        </section>

        {/* Steps 3, 4 & 5: Strategy Lab, Results, Reliability Lab, and Plain-Language Explanation */}
        <StrategyLab
          assets={availableAssets}
          symbol={symbol}
          onSymbolChange={setSymbol}
          theme={theme}
        />

        {/* Footer */}
        <footer className="text-center text-xs opacity-50 py-8">
          For research and educational quantitative analysis. Historical backtest results do not guarantee future performance.
        </footer>
      </main>
    </div>
  );
}
