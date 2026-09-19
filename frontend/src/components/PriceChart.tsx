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
  return (
    <div className="chart-shell">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 16, right: 20, bottom: 8, left: 12 }}>
          <CartesianGrid
            stroke="#556168"
            strokeDasharray="3 3"
          />
          <XAxis
            dataKey="date"
            minTickGap={48}
            stroke="#B7C0BF"
            tickFormatter={formatDate}
            tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }}
          />
          <YAxis
            yAxisId="price"
            domain={["auto", "auto"]}
            stroke="#B7C0BF"
            tickFormatter={formatPrice}
            tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }}
          />
          <Tooltip
            contentStyle={{
              background: "#354149",
              border: "1px solid #556168",
              borderRadius: "12px",
              boxShadow: "none",
              color: "#E6E9E8",
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
            stroke="#647D88"
            dot={false}
            strokeWidth={2.25}
          />
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="sma_20"
            name="SMA 20"
            stroke="#9D8750"
            dot={false}
            strokeWidth={1.5}
            connectNulls
          />
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="ema_20"
            name="EMA 20"
            stroke="#6E8A7A"
            dot={false}
            strokeWidth={1.5}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
