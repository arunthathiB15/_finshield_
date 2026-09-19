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
