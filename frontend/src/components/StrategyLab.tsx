import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { runAnalysis, runBacktest } from "../api/client";
import type {
  AnalysisRequest,
  AnalysisResponse,
  AssetSummary,
  BacktestRequest,
  BacktestResponse,
  ThemeMode,
} from "../types";
import { AnalysisPanel } from "./AnalysisPanel";
import { AssetSelector } from "./AssetSelector";
import { EquityChart } from "./EquityChart";
import { ExplanationPanel } from "./ExplanationPanel";

type StrategyLabProps = {
  assets: AssetSummary[];
  symbol: string;
  onSymbolChange: (symbol: string) => void;
  theme?: ThemeMode;
};

function percent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function money(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function Metric({
  label,
  value,
  hint,
  isDark,
  isPositive,
}: {
  label: string;
  value: string;
  hint: string;
  isDark: boolean;
  isPositive?: boolean;
}) {
  return (
    <article className="dynamic-subcard p-4 flex flex-col justify-between min-h-[105px]">
      <div className="flex items-center justify-between">
        <span className="font-label-caps text-[10px] uppercase opacity-70 font-semibold">
          {label}
        </span>
      </div>
      <div className="my-0.5">
        <strong
          className={`font-metric-lg text-xl sm:text-2xl font-bold ${
            isPositive !== undefined
              ? isPositive
                ? "text-emerald-600 dark:text-primary-container"
                : "text-rose-500"
              : isDark
              ? "text-on-surface"
              : "text-text-obsidian"
          }`}
        >
          {value}
        </strong>
      </div>
      <small className="opacity-60 text-[11px] font-medium">{hint}</small>
    </article>
  );
}

export function StrategyLab({
  assets,
  symbol,
  onSymbolChange,
  theme = "light",
}: StrategyLabProps) {
  const [capital, setCapital] = useState("100000");
  const [costBps, setCostBps] = useState("10");
  const [slippageBps, setSlippageBps] = useState("5");
  const [fastWindow, setFastWindow] = useState("20");
  const [slowWindow, setSlowWindow] = useState("50");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [formError, setFormError] = useState("");

  const isDark = theme === "dark";
  const selectedAsset = assets.find((asset) => asset.symbol === symbol);

  const mutation = useMutation<BacktestResponse, Error, BacktestRequest>({
    mutationFn: runBacktest,
  });
  const analysisMutation = useMutation<AnalysisResponse, Error, AnalysisRequest>({
    mutationFn: runAnalysis,
  });
  const previousSymbol = useRef(symbol);

  useEffect(() => {
    if (previousSymbol.current === symbol) return;
    previousSymbol.current = symbol;
    mutation.reset();
    analysisMutation.reset();
    setStart("");
    setEnd("");
    setFormError("");
  }, [symbol]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!symbol) return;

    const capitalValue = Number(capital);
    const fastValue = Number(fastWindow);
    const slowValue = Number(slowWindow);

    if (!Number.isFinite(capitalValue) || capitalValue <= 0) {
      setFormError("Initial capital must be a positive number.");
      return;
    }
    if (!Number.isInteger(fastValue) || fastValue < 2) {
      setFormError("Fast SMA days must be a whole number of at least 2.");
      return;
    }
    if (!Number.isInteger(slowValue) || slowValue <= fastValue) {
      setFormError("Slow SMA days must be a whole number greater than Fast SMA days.");
      return;
    }
    if (start && end && start > end) {
      setFormError("Start date must be on or before the end date.");
      return;
    }
    if (
      selectedAsset &&
      ((start &&
        (start < selectedAsset.start_date || start > selectedAsset.end_date)) ||
        (end &&
          (end < selectedAsset.start_date || end > selectedAsset.end_date)))
    ) {
      setFormError(
        `Choose dates between ${selectedAsset.start_date} and ${selectedAsset.end_date} for ${selectedAsset.symbol}.`,
      );
      return;
    }

    setFormError("");
    const payload: BacktestRequest = {
      symbol,
      strategy: "sma_crossover",
      params: { fast_window: fastValue, slow_window: slowValue },
      capital: capitalValue,
      cost: Number(costBps) / 10_000,
      slippage: Number(slippageBps) / 10_000,
      period: { start: start || null, end: end || null },
    };
    analysisMutation.reset();
    mutation.mutate(payload, {
      onSuccess: () => analysisMutation.mutate({ ...payload, train_fraction: 0.7 }),
    });
  }

  const result = mutation.data;
  const curve = result?.equity_curve.slice(-365) ?? [];

  return (
    <section className="dynamic-glass-card p-4 sm:p-6 mt-6 flex flex-col gap-5">
      {/* Heading */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="text-[11px] font-extrabold tracking-widest uppercase text-blue-600 dark:text-primary-container">
            STEP 3 · STRATEGY LAB
          </div>
          <h3 className={`text-xl sm:text-2xl font-bold tracking-tight mt-1 ${isDark ? "text-on-surface" : "text-text-obsidian"}`}>
            Test one strategy with visible assumptions.
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-on-surface-variant max-w-2xl mt-1">
            Signals are shifted one bar before returns. Costs and slippage are charged on every position change.
          </p>
        </div>
        {(mutation.isPending || analysisMutation.isPending) && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-primary-container/10 text-blue-600 dark:text-primary-container border border-blue-200 dark:border-primary-container/20">
            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-primary-container animate-pulse" />
            Running reliability checks…
          </span>
        )}
      </div>

      {/* Assumptions Form */}
      <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 items-end" onSubmit={submit}>
        <AssetSelector
          assets={assets}
          value={symbol}
          onChange={onSymbolChange}
          id="strategy-asset-selector"
          theme={theme}
        />

        <div className="flex flex-col gap-1.5">
          <label className="font-label-caps text-[10px] uppercase opacity-70 font-semibold">
            Strategy Architecture
          </label>
          <select
            value="sma_crossover"
            disabled
            className={`w-full font-body-md text-sm py-2.5 px-3.5 rounded-xl font-semibold opacity-85 cursor-not-allowed ${
              isDark
                ? "bg-background text-on-surface border border-outline-variant"
                : "bg-white/90 text-text-obsidian border border-slate-200"
            }`}
          >
            <option value="sma_crossover">SMA Crossover (Fast / Slow)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-label-caps text-[10px] uppercase opacity-70 font-semibold">
            Initial Capital ($)
          </label>
          <input
            type="number"
            min="1"
            step="any"
            inputMode="decimal"
            value={capital}
            onChange={(event) => {
              setCapital(event.target.value);
              setFormError("");
            }}
            className={`w-full p-2.5 rounded-xl text-sm font-semibold liquid-input ${
              isDark
                ? "bg-background text-on-surface border border-outline-variant"
                : "bg-white/90 text-text-obsidian border border-slate-200"
            }`}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-label-caps text-[10px] uppercase opacity-70 font-semibold">
            Transaction Cost (bps)
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={costBps}
            onChange={(event) => setCostBps(event.target.value)}
            className={`w-full p-2.5 rounded-xl text-sm font-semibold liquid-input ${
              isDark
                ? "bg-background text-on-surface border border-outline-variant"
                : "bg-white/90 text-text-obsidian border border-slate-200"
            }`}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-label-caps text-[10px] uppercase opacity-70 font-semibold">
            Slippage (bps)
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={slippageBps}
            onChange={(event) => setSlippageBps(event.target.value)}
            className={`w-full p-2.5 rounded-xl text-sm font-semibold liquid-input ${
              isDark
                ? "bg-background text-on-surface border border-outline-variant"
                : "bg-white/90 text-text-obsidian border border-slate-200"
            }`}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-label-caps text-[10px] uppercase opacity-70 font-semibold">
            Fast SMA Days
          </label>
          <input
            type="number"
            min="2"
            value={fastWindow}
            onChange={(event) => setFastWindow(event.target.value)}
            className={`w-full p-2.5 rounded-xl text-sm font-semibold liquid-input ${
              isDark
                ? "bg-background text-on-surface border border-outline-variant"
                : "bg-white/90 text-text-obsidian border border-slate-200"
            }`}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-label-caps text-[10px] uppercase opacity-70 font-semibold">
            Slow SMA Days
          </label>
          <input
            type="number"
            min="3"
            value={slowWindow}
            onChange={(event) => setSlowWindow(event.target.value)}
            className={`w-full p-2.5 rounded-xl text-sm font-semibold liquid-input ${
              isDark
                ? "bg-background text-on-surface border border-outline-variant"
                : "bg-white/90 text-text-obsidian border border-slate-200"
            }`}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-label-caps text-[10px] uppercase opacity-70 font-semibold">
            Start Date (Optional)
          </label>
          <input
            type="date"
            value={start}
            min={selectedAsset?.start_date}
            max={end || selectedAsset?.end_date}
            onChange={(event) => {
              setStart(event.target.value);
              setFormError("");
            }}
            className={`w-full p-2.5 rounded-xl text-sm font-semibold liquid-input ${
              isDark
                ? "bg-background text-on-surface border border-outline-variant"
                : "bg-white/90 text-text-obsidian border border-slate-200"
            }`}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-label-caps text-[10px] uppercase opacity-70 font-semibold">
            End Date (Optional)
          </label>
          <input
            type="date"
            value={end}
            min={start || selectedAsset?.start_date}
            max={selectedAsset?.end_date}
            onChange={(event) => {
              setEnd(event.target.value);
              setFormError("");
            }}
            className={`w-full p-2.5 rounded-xl text-sm font-semibold liquid-input ${
              isDark
                ? "bg-background text-on-surface border border-outline-variant"
                : "bg-white/90 text-text-obsidian border border-slate-200"
            }`}
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap items-center justify-between gap-2 text-[11px] opacity-70">
          <span>
            {selectedAsset
              ? `Available data: ${selectedAsset.start_date} to ${selectedAsset.end_date}. Leave both dates empty to use the full period.`
              : "Select an asset to see its available date range."}
          </span>
          {(start || end) && (
            <button
              className="text-xs font-semibold underline underline-offset-2 cursor-pointer"
              type="button"
              onClick={() => {
                setStart("");
                setEnd("");
                setFormError("");
              }}
            >
              Clear dates
            </button>
          )}
        </div>

        {formError && (
          <div className="sm:col-span-2 lg:col-span-3 error-panel" role="alert">
            {formError}
          </div>
        )}

        <div className="sm:col-span-2 lg:col-span-3 flex justify-end pt-2">
          <button
            className="liquid-button px-6 py-3 rounded-xl font-headline-sm text-sm font-bold bg-primary-container text-on-primary-container cursor-pointer disabled:opacity-50 flex items-center gap-2"
            type="submit"
            disabled={!symbol || mutation.isPending || analysisMutation.isPending}
          >
            <span className="material-symbols-outlined text-[18px]">bolt</span>
            <span>{mutation.isPending ? "Executing Backtest..." : "Run backtest"}</span>
          </button>
        </div>
      </form>

      {mutation.isError && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 text-xs">
          Backtest failed: {mutation.error.message}
        </div>
      )}
      {analysisMutation.isError && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 text-xs">
          Reliability analysis failed: {analysisMutation.error.message}
        </div>
      )}

      {/* Backtest Results */}
      {result && (
        <div className="flex flex-col gap-6 pt-4 border-t border-slate-200/60 dark:border-white/10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Metric
              label="Strategy Return"
              value={percent(result.metrics.total_return)}
              hint={`Buy & hold: ${percent(result.benchmark_metrics.total_return)}`}
              isDark={isDark}
              isPositive={result.metrics.total_return >= 0}
            />
            <Metric
              label="Sharpe Ratio"
              value={result.metrics.sharpe.toFixed(2)}
              hint="Return per unit volatility"
              isDark={isDark}
            />
            <Metric
              label="Max Drawdown"
              value={percent(result.metrics.max_drawdown)}
              hint={`Benchmark: ${percent(result.benchmark_metrics.max_drawdown)}`}
              isDark={isDark}
              isPositive={false}
            />
            <Metric
              label="Cost Drag"
              value={percent(result.metrics.cost_drag)}
              hint={`${result.metrics.trade_count} position changes`}
              isDark={isDark}
            />
          </div>

          {/* Equity Chart vs Buy-and-Hold */}
          <div className="dynamic-subcard p-4 sm:p-5 flex flex-col gap-2">
            <div>
              <h4 className={`text-base sm:text-lg font-bold ${isDark ? "text-on-surface" : "text-text-obsidian"}`}>
                Equity curve vs buy-and-hold
              </h4>
              <p className="text-xs text-slate-500 dark:text-on-surface-variant">
                Showing latest 365 available sessions from {result.period_start} to {result.period_end}.
              </p>
            </div>
            <EquityChart data={curve} theme={theme} />
          </div>

          {/* Trade Log Table */}
          <div className="dynamic-subcard p-4 sm:p-5 flex flex-col gap-2">
            <h4 className={`text-base sm:text-lg font-bold ${isDark ? "text-on-surface" : "text-text-obsidian"}`}>
              Trade log (Latest 10 executions)
            </h4>
            <div className="overflow-x-auto scrollbar-none">
              <table className="w-full text-xs text-left border-collapse liquid-table">
                <thead>
                  <tr className="border-b border-slate-200/60 dark:border-white/10 opacity-70 text-[10px] uppercase font-label-caps">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">Price</th>
                    <th className="py-2.5 px-3">Turnover</th>
                    <th className="py-2.5 px-3">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-code-sm text-[11px]">
                  {result.trades.slice(-10).map((trade) => (
                    <tr key={`${trade.date}-${trade.action}`}>
                      <td className="py-2.5 px-3 font-medium">{trade.date}</td>
                      <td
                        className={`py-2.5 px-3 font-bold ${
                          trade.action === "BUY"
                            ? "text-emerald-600 dark:text-primary-container"
                            : "text-rose-500"
                        }`}
                      >
                        {trade.action}
                      </td>
                      <td className="py-2.5 px-3 font-medium">${money(trade.price)}</td>
                      <td className="py-2.5 px-3 opacity-80">{trade.turnover.toFixed(2)}×</td>
                      <td className="py-2.5 px-3 opacity-80">${money(trade.cost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Analysis & Explanation Panels */}
          {analysisMutation.data && (
            <>
              <AnalysisPanel analysis={analysisMutation.data} theme={theme} />
              <ExplanationPanel analysis={analysisMutation.data} theme={theme} />
            </>
          )}
        </div>
      )}
    </section>
  );
}
