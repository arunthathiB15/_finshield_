export type AssetSummary = {
  symbol: string;
  name: string;
  source: string;
  start_date: string;
  end_date: string;
  rows: number;
  last_close: number;
  total_return: number;
  annualized_volatility: number;
  missing_days: number;
  quality_status: string;
};

export type SeriesPoint = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  adj_close: number;
  volume: number;
  sma_20: number | null;
  ema_20: number | null;
  rolling_volatility: number | null;
  drawdown: number | null;
};

export type AssetSeries = {
  symbol: string;
  name: string;
  data: SeriesPoint[];
};

export type BacktestRequest = {
  symbol: string;
  strategy: "sma_crossover";
  params: { fast_window: number; slow_window: number };
  capital: number;
  cost: number;
  slippage: number;
  period: { start: string | null; end: string | null };
};

export type BacktestMetrics = {
  cagr: number;
  total_return: number;
  annualized_volatility: number;
  sharpe: number;
  sortino: number;
  max_drawdown: number;
  calmar: number;
  win_rate: number;
  trade_count: number;
  turnover: number;
  cost_drag: number;
};

export type EquityPoint = {
  date: string;
  strategy_equity: number;
  benchmark_equity: number;
  strategy_drawdown: number;
  benchmark_drawdown: number;
  position: number;
};

export type TradeEvent = {
  date: string;
  action: "BUY" | "SELL";
  price: number;
  position: number;
  turnover: number;
  cost: number;
};

export type BacktestResponse = {
  symbol: string;
  strategy: string;
  parameters: { fast_window: number; slow_window: number };
  capital: number;
  transaction_cost: number;
  slippage: number;
  period_start: string;
  period_end: string;
  metrics: BacktestMetrics;
  benchmark_metrics: BacktestMetrics;
  equity_curve: EquityPoint[];
  trades: TradeEvent[];
};
