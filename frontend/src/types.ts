export type TabType =
  | "overview"
  | "strategy-lab"
  | "reliability-analysis"
  | "risk-and-regimes"
  | "cost-sensitivity";

export type ThemeMode = "dark" | "light";

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
  periods_per_year: number;
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

export type CorrelationPair = {
  left_symbol: string;
  right_symbol: string;
  left_name: string;
  right_name: string;
  correlation: number;
  observations: number;
  start_date: string;
  end_date: string;
};

export type CorrelationAnalysis = {
  symbols: string[];
  names: Record<string, string>;
  matrix: Record<string, Record<string, number>>;
  pairs: CorrelationPair[];
  method: string;
};

export type BacktestRequest = {
  symbol: string;
  strategy: string;
  params: { fast_window: number; slow_window: number; [key: string]: unknown };
  capital: number;
  cost: number;
  slippage: number;
  period: { start: string | null; end: string | null };
};

export type AnalysisRequest = BacktestRequest & {
  train_fraction: number;
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
  parameters: { fast_window: number; slow_window: number; [key: string]: unknown };
  capital: number;
  transaction_cost: number;
  slippage: number;
  periods_per_year: number;
  period_start: string;
  period_end: string;
  metrics: BacktestMetrics;
  benchmark_metrics: BacktestMetrics;
  equity_curve: EquityPoint[];
  trades: TradeEvent[];
};

export type RegimeMetric = {
  category: "trend" | "volatility";
  regime: string;
  observations: number;
  active_days: number;
  strategy_total_return: number;
  benchmark_total_return: number;
  strategy_sharpe: number;
  strategy_max_drawdown: number;
  outperformance: number;
};

export type CostSensitivityPoint = {
  transaction_cost: number;
  total_friction: number;
  total_return: number;
  sharpe: number;
  max_drawdown: number;
  cost_drag: number;
  trade_count: number;
};

export type ParameterSensitivityPoint = {
  fast_window: number;
  slow_window: number;
  total_return: number;
  sharpe: number;
  max_drawdown: number;
  trade_count: number;
};

export type ValidationSummary = {
  split_date: string;
  train_start: string;
  train_end: string;
  test_start: string;
  test_end: string;
  train_rows: number;
  test_rows: number;
  train_metrics: BacktestMetrics;
  train_benchmark_metrics: BacktestMetrics;
  test_metrics: BacktestMetrics;
  test_benchmark_metrics: BacktestMetrics;
};

export type TrustScoreComponent = {
  name: string;
  weight: number;
  score: number;
  contribution: number;
  rationale: string;
};

export type TrustScore = {
  score: number;
  verdict: string;
  components: TrustScoreComponent[];
  disclaimer: string;
};

export type AnalysisResponse = {
  symbol: string;
  strategy: string;
  parameters: { fast_window: number; slow_window: number; [key: string]: unknown };
  periods_per_year: number;
  metrics: BacktestMetrics;
  benchmark_metrics: BacktestMetrics;
  validation: ValidationSummary;
  regime_breakdown: RegimeMetric[];
  cost_sensitivity: CostSensitivityPoint[];
  parameter_sensitivity: ParameterSensitivityPoint[];
  trust_score: TrustScore;
};

export type ExplanationRequest = {
  analysis: AnalysisResponse;
  question?: string | null;
};

export type ExplanationResponse = {
  explanation: string;
  source: "featherless" | "deterministic_fallback";
  model: string | null;
  notice: string | null;
  disclaimer: string;
};
