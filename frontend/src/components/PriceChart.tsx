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

import type { SeriesPoint, ThemeMode } from "../types";

type PriceChartProps = {
  data: SeriesPoint[];
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

function formatPrice(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export function PriceChart({ data, theme = "light" }: PriceChartProps) {
  const isDark = theme === "dark";

  return (
    <div className="chart-shell">
      <ResponsiveContainer width="100%" height={400}>
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
            yAxisId="price"
            domain={["auto", "auto"]}
            stroke={isDark ? "#8c9ab5" : "#64748b"}
            tickFormatter={formatPrice}
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
            formatter={(value: number, name: string) => [formatPrice(value), name]}
          />
          <Legend
            wrapperStyle={{
              paddingTop: "8px",
              fontFamily: "Inter, sans-serif",
              fontSize: "12px",
            }}
          />
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="close"
            name="Close Price"
            stroke={isDark ? "#00f0ff" : "#0066ff"}
            dot={false}
            strokeWidth={2.25}
          />
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="sma_20"
            name="SMA 20"
            stroke="#f59e0b"
            dot={false}
            strokeWidth={1.5}
            connectNulls
          />
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="ema_20"
            name="EMA 20"
            stroke="#8b5cf6"
            dot={false}
            strokeWidth={1.5}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
