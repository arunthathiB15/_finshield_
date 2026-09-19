import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { EquityPoint, ThemeMode } from "../types";

type EquityChartProps = {
  data: EquityPoint[];
  theme?: ThemeMode;
};

function formatDate(value: string): string {
  try {
    return new Date(`${value}T00:00:00Z`).toLocaleDateString("en-IN", {
      month: "short",
      year: "2-digit",
      timeZone: "UTC",
    });
  } catch {
    return value;
  }
}

function formatCurrency(value: number): string {
  return "$" + value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export function EquityChart({ data, theme = "light" }: EquityChartProps) {
  const isDark = theme === "dark";

  return (
    <div className="chart-shell">
      <ResponsiveContainer width="100%" height={380}>
        <LineChart data={data} margin={{ top: 16, right: 20, bottom: 8, left: 12 }}>
          <CartesianGrid
            stroke={isDark ? "#243047" : "#e2e8f0"}
            strokeDasharray="3 3"
          />
          <XAxis
            dataKey="date"
            minTickGap={48}
            stroke={isDark ? "#8c9ab5" : "#64748b"}
            tickFormatter={formatDate}
            tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }}
          />
          <YAxis
            stroke={isDark ? "#8c9ab5" : "#64748b"}
            tickFormatter={formatCurrency}
            domain={["auto", "auto"]}
            tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }}
          />
          <Tooltip
            contentStyle={{
              background: isDark ? "rgba(16, 24, 39, 0.95)" : "rgba(255, 255, 255, 0.96)",
              border: isDark ? "1px solid #2b3a55" : "1px solid rgba(226, 232, 240, 0.9)",
              borderRadius: "12px",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
              color: isDark ? "#eef4ff" : "#0F172A",
              fontFamily: "Inter, sans-serif",
              fontSize: "12px",
            }}
            labelFormatter={(value) => formatDate(String(value))}
            formatter={(value: number, name: string) => [formatCurrency(value), name]}
          />
          <Legend
            wrapperStyle={{
              paddingTop: "8px",
              fontFamily: "Inter, sans-serif",
              fontSize: "12px",
            }}
          />
          <Line
            type="monotone"
            dataKey="strategy_equity"
            name="Strategy Equity"
            stroke={isDark ? "#00f0ff" : "#0066ff"}
            dot={false}
            strokeWidth={2.5}
          />
          <Line
            type="monotone"
            dataKey="benchmark_equity"
            name="Buy & Hold Benchmark"
            stroke="#f59e0b"
            dot={false}
            strokeWidth={2}
            strokeDasharray="4 4"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
