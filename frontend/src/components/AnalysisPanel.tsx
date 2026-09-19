import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { AnalysisResponse, BacktestMetrics, ThemeMode } from "../types";

type AnalysisPanelProps = {
  analysis: AnalysisResponse;
  theme?: ThemeMode;
};

function percent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function metricValue(value: number): string {
  return Number.isFinite(value) ? value.toFixed(2) : "—";
}

function regimeName(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter: string) => letter.toUpperCase());
}

function ValidationCard({
  label,
  metrics,
  isDark,
}: {
  label: string;
  metrics: BacktestMetrics;
  isDark: boolean;
}) {
  return (
    <div className="dynamic-subcard p-3.5 flex flex-col gap-1 text-xs">
      <strong className={`font-headline-sm text-sm ${isDark ? "text-on-surface" : "text-text-obsidian"}`}>
        {label}
      </strong>
      <span className="opacity-80">Return {percent(metrics.total_return)}</span>
      <span className="opacity-80">Sharpe {metricValue(metrics.sharpe)}</span>
      <span className="opacity-80">Drawdown {percent(metrics.max_drawdown)}</span>
    </div>
  );
}

export function AnalysisPanel({ analysis, theme = "light" }: AnalysisPanelProps) {
  const isDark = theme === "dark";

  const costData = analysis.cost_sensitivity.map((point) => ({
    cost: `${(point.transaction_cost * 10_000).toFixed(0)} bps`,
    return: point.total_return * 100,
  }));

  const bestParameters = [...analysis.parameter_sensitivity]
    .sort((left, right) => right.sharpe - left.sharpe)
    .slice(0, 6);

  return (
    <section className="dynamic-glass-card p-4 sm:p-6 mt-6 flex flex-col gap-5">
      {/* Heading */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="text-[11px] font-extrabold tracking-widest uppercase text-blue-600 dark:text-primary-container">
            STEP 4 · RELIABILITY LAB
          </div>
          <h3 className={`text-xl sm:text-2xl font-bold tracking-tight mt-1 ${isDark ? "text-on-surface" : "text-text-obsidian"}`}>
            Stress-test the result before trusting it.
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-on-surface-variant max-w-2xl mt-1">
            Regimes, chronological train/test validation, cost sensitivity, and nearby parameters are calculated by the quant engine.
          </p>
        </div>

        {/* Trust Score Card */}
        <div
          className={`dynamic-subcard p-4 min-w-[220px] shrink-0 flex flex-col gap-1 border ${
            isDark
              ? "bg-[#102034] border-primary-container/30 text-on-surface"
              : "bg-blue-50/90 border-blue-200 text-text-obsidian"
          }`}
        >
          <span className="font-label-caps text-[10px] uppercase opacity-70">
            Strategy Trust Score
          </span>
          <div className="flex items-baseline gap-1">
            <strong className="text-3xl font-bold text-blue-600 dark:text-primary-container">
              {analysis.trust_score.score.toFixed(0)}
            </strong>
            <small className="opacity-60 text-sm font-semibold">/100</small>
          </div>
          <em className="text-xs font-semibold text-emerald-600 dark:text-primary-fixed not-italic">
            {analysis.trust_score.verdict}
          </em>
        </div>
      </div>

      {/* Validation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ValidationCard label="Training period" metrics={analysis.validation.train_metrics} isDark={isDark} />
        <ValidationCard label="Unseen test period" metrics={analysis.validation.test_metrics} isDark={isDark} />
        <div className="dynamic-subcard p-3.5 flex flex-col gap-1 text-xs justify-center">
          <strong className={`font-headline-sm text-sm ${isDark ? "text-on-surface" : "text-text-obsidian"}`}>
            Chronological split
          </strong>
          <span className="opacity-80">
            {analysis.validation.train_start} → {analysis.validation.train_end}
          </span>
          <span className="opacity-80">
            Test: {analysis.validation.test_start} → {analysis.validation.test_end}
          </span>
          <span className="opacity-60 text-[11px]">
            {analysis.validation.train_rows.toLocaleString()} train · {analysis.validation.test_rows.toLocaleString()} test rows
          </span>
        </div>
      </div>

      {/* Regimes & Cost Sensitivity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Regime Breakdown */}
        <div className="dynamic-subcard p-4 flex flex-col gap-2">
          <h4 className={`text-sm sm:text-base font-bold ${isDark ? "text-on-surface" : "text-text-obsidian"}`}>
            Market-regime breakdown
          </h4>
          <div className="overflow-x-auto scrollbar-none">
            <table className="w-full text-xs text-left border-collapse liquid-table">
              <thead>
                <tr className="border-b border-slate-200/60 dark:border-white/10 opacity-70 text-[10px] uppercase font-label-caps">
                  <th className="py-2 px-2">Regime</th>
                  <th className="py-2 px-2">Days</th>
                  <th className="py-2 px-2">Strategy</th>
                  <th className="py-2 px-2">Buy &amp; Hold</th>
                  <th className="py-2 px-2">Sharpe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-code-sm text-[11px]">
                {analysis.regime_breakdown.map((row) => (
                  <tr key={`${row.category}-${row.regime}`}>
                    <td className="py-2 px-2 font-medium">{regimeName(row.regime)}</td>
                    <td className="py-2 px-2 opacity-70">{row.observations}</td>
                    <td
                      className={`py-2 px-2 font-semibold ${
                        row.strategy_total_return >= 0 ? "text-emerald-600 dark:text-primary-container" : "text-rose-500"
                      }`}
                    >
                      {percent(row.strategy_total_return)}
                    </td>
                    <td className="py-2 px-2 opacity-80">{percent(row.benchmark_total_return)}</td>
                    <td className="py-2 px-2 font-semibold">{metricValue(row.strategy_sharpe)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cost Sensitivity Graph */}
        <div className="dynamic-subcard p-4 flex flex-col gap-2">
          <h4 className={`text-sm sm:text-base font-bold ${isDark ? "text-on-surface" : "text-text-obsidian"}`}>
            Transaction-cost sensitivity
          </h4>
          <div className="chart-shell h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={costData} margin={{ top: 10, right: 12, bottom: 8, left: 4 }}>
                <CartesianGrid stroke={isDark ? "#243047" : "#e2e8f0"} strokeDasharray="3 3" />
                <XAxis
                  dataKey="cost"
                  stroke={isDark ? "#8c9ab5" : "#64748b"}
                  tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }}
                />
                <YAxis
                  stroke={isDark ? "#8c9ab5" : "#64748b"}
                  tickFormatter={(val) => `${val}%`}
                  tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }}
                />
                <Tooltip
                  contentStyle={{
                    background: isDark ? "rgba(16, 24, 39, 0.95)" : "rgba(255, 255, 255, 0.95)",
                    border: isDark ? "1px solid #2b3a55" : "1px solid rgba(226, 232, 240, 0.9)",
                    borderRadius: "10px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                    color: isDark ? "#eef4ff" : "#0F172A",
                    fontSize: "11px",
                  }}
                  formatter={(val: number) => [`${val.toFixed(2)}%`, "Return"]}
                />
                <Line
                  type="monotone"
                  dataKey="return"
                  stroke={isDark ? "#00f0ff" : "#0066ff"}
                  dot={{ r: 3.5, fill: isDark ? "#00f0ff" : "#0066ff" }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Parameter Stability & Trust Components Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Nearby Parameters */}
        <div className="dynamic-subcard p-4 flex flex-col gap-2">
          <div>
            <h4 className={`text-sm sm:text-base font-bold ${isDark ? "text-on-surface" : "text-text-obsidian"}`}>
              Nearby parameter results
            </h4>
            <p className="text-xs text-slate-500 dark:text-on-surface-variant">
              Top nearby combinations ranked by Sharpe ratio.
            </p>
          </div>
          <div className="overflow-x-auto scrollbar-none">
            <table className="w-full text-xs text-left border-collapse liquid-table">
              <thead>
                <tr className="border-b border-slate-200/60 dark:border-white/10 opacity-70 text-[10px] uppercase font-label-caps">
                  <th className="py-2 px-2">Fast</th>
                  <th className="py-2 px-2">Slow</th>
                  <th className="py-2 px-2">Return</th>
                  <th className="py-2 px-2">Sharpe</th>
                  <th className="py-2 px-2">Drawdown</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-code-sm text-[11px]">
                {bestParameters.map((row) => (
                  <tr key={`${row.fast_window}-${row.slow_window}`}>
                    <td className="py-2 px-2 font-medium">{row.fast_window}d</td>
                    <td className="py-2 px-2 opacity-70">{row.slow_window}d</td>
                    <td
                      className={`py-2 px-2 font-semibold ${
                        row.total_return >= 0 ? "text-emerald-600 dark:text-primary-container" : "text-rose-500"
                      }`}
                    >
                      {percent(row.total_return)}
                    </td>
                    <td className="py-2 px-2 font-semibold">{metricValue(row.sharpe)}</td>
                    <td className="py-2 px-2 text-rose-500">{percent(row.max_drawdown)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trust Score Components */}
        <div className="dynamic-subcard p-4 flex flex-col gap-3">
          <h4 className={`text-sm sm:text-base font-bold ${isDark ? "text-on-surface" : "text-text-obsidian"}`}>
            Trust Score components
          </h4>
          <div className="flex flex-col gap-3">
            {analysis.trust_score.components.map((component) => (
              <div key={component.name} className="flex flex-col gap-1 text-xs">
                <div className="flex justify-between items-center font-medium">
                  <span className="opacity-90">{component.name}</span>
                  <strong className="text-blue-600 dark:text-primary-container font-bold">
                    {component.score.toFixed(0)}/100
                  </strong>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 dark:from-primary-container dark:to-primary-fixed transition-all duration-500"
                    style={{ width: `${component.score}%` }}
                  />
                </div>
                <small className="opacity-60 text-[11px] leading-tight">
                  {component.rationale}
                </small>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs opacity-50 italic">
        {analysis.trust_score.disclaimer}
      </p>
    </section>
  );
}
