import type { CorrelationAnalysis, CorrelationPair, ThemeMode } from "../types";

type CorrelationPanelProps = {
  data?: CorrelationAnalysis;
  isLoading: boolean;
  isError: boolean;
  theme?: ThemeMode;
};

const PAIR_ORDER: Array<[string, string]> = [
  ["GC=F", "NVDA"],
  ["NVDA", "BTC-USD"],
  ["GC=F", "BTC-USD"],
];

function pairKey(left: string, right: string): string {
  return [left, right].sort().join("|");
}

function findPair(data: CorrelationAnalysis, left: string, right: string): CorrelationPair | undefined {
  return data.pairs.find(
    (pair) => pairKey(pair.left_symbol, pair.right_symbol) === pairKey(left, right),
  );
}

function correlationLabel(value: number): string {
  const magnitude = Math.abs(value);
  if (magnitude >= 0.7) return value >= 0 ? "Strong positive" : "Strong negative";
  if (magnitude >= 0.3) return value >= 0 ? "Moderate positive" : "Moderate negative";
  return "Weak linear relationship";
}

function correlationTone(value: number): string {
  if (value >= 0.3) return "correlation-positive";
  if (value <= -0.3) return "correlation-negative";
  return "correlation-neutral";
}

function displayName(symbol: string, data: CorrelationAnalysis): string {
  return data.names[symbol] ?? symbol;
}

export function CorrelationPanel({
  data,
  isLoading,
  isError,
  theme = "dark",
}: CorrelationPanelProps) {
  const isDark = theme === "dark";

  return (
    <section className="dynamic-glass-card correlation-panel p-5 sm:p-7 flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <div className="text-[11px] font-extrabold tracking-widest uppercase text-blue-600 dark:text-primary-container">
          STEP 2.5 · CROSS-ASSET INTELLIGENCE
        </div>
        <h3 className={`text-xl sm:text-2xl font-bold tracking-tight mt-1 ${isDark ? "text-on-surface" : "text-text-obsidian"}`}>
          Do the assets move together?
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-on-surface-variant max-w-3xl">
          Correlation is calculated from same-day close-to-close returns, with each pair aligned on its shared dates. Prices are never forward-filled.
        </p>
      </div>

      {isLoading && <p className="empty-panel">Calculating aligned-return correlations…</p>}
      {isError && (
        <p className="error-panel">
          Correlation analysis could not be loaded from FastAPI. Start the backend and refresh the dashboard.
        </p>
      )}

      {data && !isLoading && !isError && (
        <>
          <div className="correlation-pair-grid">
            {PAIR_ORDER.map(([left, right]) => {
              const pair = findPair(data, left, right);
              if (!pair) return null;
              return (
                <article className="correlation-pair-card" key={`${left}-${right}`}>
                  <div className="correlation-pair-heading">
                    <span>{displayName(left, data)}</span>
                    <span className="correlation-arrow">↔</span>
                    <span>{displayName(right, data)}</span>
                  </div>
                  <strong className={`correlation-value ${correlationTone(pair.correlation)}`}>
                    {pair.correlation.toFixed(2)}
                  </strong>
                  <span className={`correlation-label ${correlationTone(pair.correlation)}`}>
                    {correlationLabel(pair.correlation)}
                  </span>
                  <small>
                    {pair.observations.toLocaleString()} shared sessions · {pair.start_date} to {pair.end_date}
                  </small>
                </article>
              );
            })}
          </div>

          <div className="correlation-matrix-wrap">
            <div>
              <h4 className={`text-base sm:text-lg font-bold ${isDark ? "text-on-surface" : "text-text-obsidian"}`}>
                Correlation matrix
              </h4>
              <p className="text-xs text-slate-500 dark:text-on-surface-variant">
                1.00 means the returns moved together in the sample; −1.00 means they moved in opposite directions.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="correlation-matrix">
                <thead>
                  <tr>
                    <th scope="col">Asset</th>
                    {data.symbols.map((symbol) => (
                      <th scope="col" key={symbol}>{symbol}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.symbols.map((rowSymbol) => (
                    <tr key={rowSymbol}>
                      <th scope="row">{rowSymbol}</th>
                      {data.symbols.map((columnSymbol) => {
                        const value = data.matrix[rowSymbol]?.[columnSymbol] ?? 0;
                        return (
                          <td className={correlationTone(value)} key={`${rowSymbol}-${columnSymbol}`}>
                            {value.toFixed(2)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="correlation-method">Method: {data.method}.</p>
          </div>
        </>
      )}
    </section>
  );
}
