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

import type { EquityPoint } from "../types";

type EquityChartProps = { data: EquityPoint[] };

function formatDate(value: string): string {
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("en-IN", {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  });
}

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export function EquityChart({ data }: EquityChartProps) {
  return (
    <div className="chart-shell">
      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={data} margin={{ top: 16, right: 20, bottom: 8, left: 12 }}>
          <CartesianGrid stroke="#243047" strokeDasharray="3 3" />
          <XAxis dataKey="date" minTickGap={48} stroke="#8c9ab5" tickFormatter={formatDate} />
          <YAxis stroke="#8c9ab5" tickFormatter={formatCurrency} domain={["auto", "auto"]} />
          <Tooltip
            contentStyle={{ background: "#101827", border: "1px solid #2b3a55" }}
            labelFormatter={(value) => formatDate(String(value))}
            formatter={(value: number, name: string) => [formatCurrency(value), name]}
          />
          <Legend />
          <Line type="monotone" dataKey="strategy_equity" name="Strategy" stroke="#5eead4" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="benchmark_equity" name="Buy & hold" stroke="#fbbf24" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
