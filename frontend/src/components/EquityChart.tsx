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
  return (
    <div className="chart-shell">
      <ResponsiveContainer width="100%" height={380}>
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
            stroke="#B7C0BF"
            tickFormatter={formatCurrency}
            domain={["auto", "auto"]}
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
            stroke="#647D88"
            dot={false}
            strokeWidth={2.5}
          />
          <Line
            type="monotone"
            dataKey="benchmark_equity"
            name="Buy & Hold Benchmark"
            stroke="#9D8750"
            dot={false}
            strokeWidth={2}
            strokeDasharray="4 4"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
