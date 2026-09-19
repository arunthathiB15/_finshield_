import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { AnalysisResponse, BacktestMetrics } from "../types";

type AnalysisPanelProps = { analysis: AnalysisResponse };

function percent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function metricValue(value: number): string {
  return Number.isFinite(value) ? value.toFixed(2) : "—";
}

function regimeName(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter: string) => letter.toUpperCase());
}

function ValidationCard({ label, metrics }: { label: string; metrics: BacktestMetrics }) {
  return (
    <div className="validation-card">
      <strong>{label}</strong>
      <span>Return {percent(metrics.total_return)}</span>
      <span>Sharpe {metricValue(metrics.sharpe)}</span>
      <span>Drawdown {percent(metrics.max_drawdown)}</span>
    </div>
  );
}

export function AnalysisPanel({ analysis }: AnalysisPanelProps) {
  const costData = analysis.cost_sensitivity.map((point) => ({
    cost: `${(point.transaction_cost * 10_000).toFixed(0)} bps`,
    return: point.total_return * 100,
  }));
  const bestParameters = [...analysis.parameter_sensitivity]
    .sort((left, right) => right.sharpe - left.sharpe)
    .slice(0, 6);

  return (
    <section className="analysis-section">
      <div className="analysis-heading">
        <div>
          <div className="eyebrow">STEP 4 RELIABILITY LAB</div>
          <h3>Stress-test the result before trusting it.</h3>
          <p className="muted">
            Regimes, chronological train/test validation, cost sensitivity, and nearby parameters are calculated by the quant engine.
          </p>
        </div>
        <div className="trust-score-card">
          <span>Strategy Trust Score</span>
          <strong>{analysis.trust_score.score.toFixed(0)}<small>/100</small></strong>
          <em>{analysis.trust_score.verdict}</em>
        </div>
      </div>

      <div className="validation-grid">
        <ValidationCard label="Training period" metrics={analysis.validation.train_metrics} />
        <ValidationCard label="Unseen test period" metrics={analysis.validation.test_metrics} />
        <div className="validation-card validation-meta">
          <strong>Chronological split</strong>
          <span>{analysis.validation.train_start} → {analysis.validation.train_end}</span>
          <span>Test: {analysis.validation.test_start} → {analysis.validation.test_end}</span>
          <span>{analysis.validation.train_rows.toLocaleString()} train · {analysis.validation.test_rows.toLocaleString()} test rows</span>
        </div>
      </div>

      <div className="analysis-grid">
        <div className="analysis-card">
          <h4>Market-regime breakdown</h4>
          <div className="table-scroll">
            <table>
              <thead><tr><th>Regime</th><th>Days</th><th>Strategy</th><th>Buy & hold</th><th>Sharpe</th></tr></thead>
              <tbody>
                {analysis.regime_breakdown.map((row) => (
                  <tr key={`${row.category}-${row.regime}`}>
                    <td>{regimeName(row.regime)}</td>
                    <td>{row.observations}</td>
                    <td className={row.strategy_total_return >= 0 ? "positive" : "negative"}>{percent(row.strategy_total_return)}</td>
                    <td>{percent(row.benchmark_total_return)}</td>
                    <td>{metricValue(row.strategy_sharpe)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="analysis-card">
          <h4>Transaction-cost sensitivity</h4>
          <div className="chart-shell compact-chart">
            <ResponsiveContainer width="100%" height={230}>
              <LineChart data={costData} margin={{ top: 10, right: 12, bottom: 8, left: 4 }}>
                <CartesianGrid stroke="#243047" strokeDasharray="3 3" />
                <XAxis dataKey="cost" stroke="#8c9ab5" />
                <YAxis stroke="#8c9ab5" tickFormatter={(value) => `${value}%`} />
                <Tooltip
                  contentStyle={{ background: "#101827", border: "1px solid #2b3a55" }}
                  formatter={(value: number) => [`${value.toFixed(2)}%`, "Return"]}
                />
                <Line type="monotone" dataKey="return" stroke="#fbbf24" dot={{ r: 3 }} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="analysis-grid">
        <div className="analysis-card">
          <h4>Nearby parameter results</h4>
          <p className="muted small-copy">Top nearby combinations ranked by Sharpe ratio.</p>
          <div className="table-scroll">
            <table>
              <thead><tr><th>Fast</th><th>Slow</th><th>Return</th><th>Sharpe</th><th>Drawdown</th></tr></thead>
              <tbody>
                {bestParameters.map((row) => (
                  <tr key={`${row.fast_window}-${row.slow_window}`}>
                    <td>{row.fast_window}</td>
                    <td>{row.slow_window}</td>
                    <td>{percent(row.total_return)}</td>
                    <td>{metricValue(row.sharpe)}</td>
                    <td>{percent(row.max_drawdown)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="analysis-card">
          <h4>Trust Score components</h4>
          <div className="trust-components">
            {analysis.trust_score.components.map((component) => (
              <div className="trust-component" key={component.name}>
                <div><span>{component.name}</span><strong>{component.score.toFixed(0)}</strong></div>
                <div className="trust-bar"><span style={{ width: `${component.score}%` }} /></div>
                <small>{component.rationale}</small>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="analysis-disclaimer">{analysis.trust_score.disclaimer}</p>
    </section>
  );
}
