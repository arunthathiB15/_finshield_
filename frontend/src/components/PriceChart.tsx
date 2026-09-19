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

import type { SeriesPoint } from "../types";

type PriceChartProps = {
  data: SeriesPoint[];
};

function formatDate(value: string): string {
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("en-IN", {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  });
}

function formatPrice(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export function PriceChart({ data }: PriceChartProps) {
  return (
    <div className="chart-shell">
      <ResponsiveContainer width="100%" height={420}>
        <LineChart data={data} margin={{ top: 16, right: 20, bottom: 8, left: 12 }}>
          <CartesianGrid stroke="#243047" strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            minTickGap={48}
            stroke="#8c9ab5"
            tickFormatter={formatDate}
          />
          <YAxis
            yAxisId="price"
            domain={["auto", "auto"]}
            stroke="#8c9ab5"
            tickFormatter={formatPrice}
          />
          <Tooltip
            contentStyle={{ background: "#101827", border: "1px solid #2b3a55" }}
            labelFormatter={(value) => formatDate(String(value))}
            formatter={(value: number, name: string) => [formatPrice(value), name]}
          />
          <Legend />
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="close"
            name="Close"
            stroke="#5eead4"
            dot={false}
            strokeWidth={2}
          />
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="sma_20"
            name="SMA 20"
            stroke="#fbbf24"
            dot={false}
            connectNulls
          />
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="ema_20"
            name="EMA 20"
            stroke="#a78bfa"
            dot={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
