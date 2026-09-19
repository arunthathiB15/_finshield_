import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { runAnalysis, runBacktest } from "../api/client";
import type {
  AnalysisRequest,
  AnalysisResponse,
  AssetSummary,
  BacktestRequest,
  BacktestResponse,
} from "../types";
import { AnalysisPanel } from "./AnalysisPanel";
import { EquityChart } from "./EquityChart";
import { ExplanationPanel } from "./ExplanationPanel";

type StrategyLabProps = {
  assets: AssetSummary[];
  symbol: string;
  onSymbolChange: (symbol: string) => void;
};

function percent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function money(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return <article className="result-card"><span>{label}</span><strong>{value}</strong><small>{hint}</small></article>;
}

export function StrategyLab({ assets, symbol, onSymbolChange }: StrategyLabProps) {
  const [capital, setCapital] = useState("100000");
  const [costBps, setCostBps] = useState("10");
  const [slippageBps, setSlippageBps] = useState("5");
  const [fastWindow, setFastWindow] = useState("20");
  const [slowWindow, setSlowWindow] = useState("50");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const mutation = useMutation<BacktestResponse, Error, BacktestRequest>({ mutationFn: runBacktest });
  const analysisMutation = useMutation<AnalysisResponse, Error, AnalysisRequest>({ mutationFn: runAnalysis });

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload: BacktestRequest = {
      symbol,
      strategy: "sma_crossover",
      params: { fast_window: Number(fastWindow), slow_window: Number(slowWindow) },
      capital: Number(capital),
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
    <section className="panel strategy-panel">
      <div className="panel-heading">
        <div>
          <div className="eyebrow">STRATEGY LAB</div>
          <h3>Test one strategy with visible assumptions.</h3>
          <p className="muted">Signals are shifted one bar before returns. Costs and slippage are charged on every position change.</p>
        </div>
        {(mutation.isPending || analysisMutation.isPending) && <span className="loading-label">Running reliability checks…</span>}
      </div>

      <form className="form-grid" onSubmit={submit}>
        <label className="field"><span>Asset</span><select value={symbol} onChange={(event) => onSymbolChange(event.target.value)}>{assets.map((asset) => <option key={asset.symbol} value={asset.symbol}>{asset.symbol} · {asset.name}</option>)}</select></label>
        <label className="field"><span>Strategy</span><select value="sma_crossover" disabled><option value="sma_crossover">SMA crossover</option></select></label>
        <label className="field"><span>Initial capital</span><input type="number" min="1" step="1000" value={capital} onChange={(event) => setCapital(event.target.value)} /></label>
        <label className="field"><span>Transaction cost (bps)</span><input type="number" min="0" step="1" value={costBps} onChange={(event) => setCostBps(event.target.value)} /></label>
        <label className="field"><span>Slippage (bps)</span><input type="number" min="0" step="1" value={slippageBps} onChange={(event) => setSlippageBps(event.target.value)} /></label>
        <label className="field"><span>Fast SMA days</span><input type="number" min="2" value={fastWindow} onChange={(event) => setFastWindow(event.target.value)} /></label>
        <label className="field"><span>Slow SMA days</span><input type="number" min="3" value={slowWindow} onChange={(event) => setSlowWindow(event.target.value)} /></label>
        <label className="field"><span>Start date (optional)</span><input type="date" value={start} onChange={(event) => setStart(event.target.value)} /></label>
        <label className="field"><span>End date (optional)</span><input type="date" value={end} onChange={(event) => setEnd(event.target.value)} /></label>
        <button className="primary-button" type="submit" disabled={mutation.isPending || analysisMutation.isPending}>Run backtest</button>
      </form>

      {mutation.isError && <p className="error">Backtest failed: {mutation.error.message}</p>}
      {analysisMutation.isError && <p className="error">Reliability analysis failed: {analysisMutation.error.message}</p>}

      {result && (
        <div className="backtest-results">
          <div className="metric-grid result-grid">
            <Metric label="Strategy return" value={percent(result.metrics.total_return)} hint={`Buy & hold: ${percent(result.benchmark_metrics.total_return)}`} />
            <Metric label="Sharpe ratio" value={result.metrics.sharpe.toFixed(2)} hint="Return per unit of volatility" />
            <Metric label="Max drawdown" value={percent(result.metrics.max_drawdown)} hint={`Benchmark: ${percent(result.benchmark_metrics.max_drawdown)}`} />
            <Metric label="Cost drag" value={percent(result.metrics.cost_drag)} hint={`${result.metrics.trade_count} position changes`} />
          </div>
          <div className="panel-heading"><div><h3>Equity curve vs buy-and-hold</h3><p className="muted">Showing the latest 365 available sessions from {result.period_start} to {result.period_end}.</p></div></div>
          <EquityChart data={curve} />
          <div className="trade-log"><h3>Trade log</h3><div className="table-scroll"><table><thead><tr><th>Date</th><th>Action</th><th>Price</th><th>Turnover</th><th>Cost</th></tr></thead><tbody>{result.trades.slice(-10).map((trade) => <tr key={`${trade.date}-${trade.action}`}><td>{trade.date}</td><td className={trade.action === "BUY" ? "positive" : "negative"}>{trade.action}</td><td>{money(trade.price)}</td><td>{trade.turnover.toFixed(2)}×</td><td>{money(trade.cost)}</td></tr>)}</tbody></table></div></div>
          {analysisMutation.data && (
            <>
              <AnalysisPanel analysis={analysisMutation.data} />
              <ExplanationPanel analysis={analysisMutation.data} />
            </>
          )}
        </div>
      )}
    </section>
  );
}
