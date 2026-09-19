export interface AssetTelemetry {
  symbol: string;
  name: string;
  spot: string;
  stratRet: string;
  alpha: string;
  bhRet: string;
  sharpe: string;
  ir: string;
  mdd: string;
  rec: string;
  trust: number;
  pboRisk: string;
  deflatedSr: string;
  paramShift: string;
  vol: string;
  var95: string;
  sortino: string;
  calmar: string;
  trades: number;
  winRate: number;
  costFriction: string;
  slippageDrag: string;
  exposureTime: string;
  maxCapacity: string;
  equityPoints: { label: string; strat: number; bench: number }[];
  drawdownPoints: { label: string; dd: number }[];
  folds: { fold: string; excess: string; width: number; positive: boolean }[];
  regimes: {
    title: string;
    period: string;
    ret: string;
    sharpe: string;
    color: string;
    icon: string;
  }[];
  verdict: {
    regimeContext: string;
    regimeVol: string;
    slippageCost: string;
    slippageText: string;
    robustnessVerdict: string;
    signalDrift: number;
    durationDrag: number;
    slippagePct: number;
  };
}

export const DEFAULT_ASSETS: Record<string, AssetTelemetry> = {
  "GC=F": {
    symbol: "GC=F",
    name: "Gold Continuous Futures",
    spot: "$2,063.40 / oz",
    stratRet: "+142.8%",
    alpha: "+18.4%",
    bhRet: "+124.4%",
    sharpe: "1.84",
    ir: "0.92",
    mdd: "-14.2%",
    rec: "64 Days",
    trust: 88,
    pboRisk: "4.1% (Low)",
    deflatedSr: "1.62",
    paramShift: "±12% Tol",
    vol: "12.6%",
    var95: "-1.4%",
    sortino: "2.31",
    calmar: "2.15",
    trades: 342,
    winRate: 58.4,
    costFriction: "-2.1%",
    slippageDrag: "-$3,420",
    exposureTime: "64.2%",
    maxCapacity: "$25.0M",
    equityPoints: [
      { label: "2019", strat: 100, bench: 100 },
      { label: "2020", strat: 124, bench: 112 },
      { label: "2021", strat: 168, bench: 128 },
      { label: "2022", strat: 195, bench: 136 },
      { label: "2023", strat: 228, bench: 172 },
      { label: "2024", strat: 264, bench: 224 },
    ],
    drawdownPoints: [
      { label: "2019", dd: 0 },
      { label: "Q1 2020", dd: -14.2 },
      { label: "Q3 2020", dd: -4.1 },
      { label: "2021", dd: -6.8 },
      { label: "2022", dd: -11.4 },
      { label: "2023", dd: -3.2 },
      { label: "2024", dd: 0 },
    ],
    folds: [
      { fold: "Fold 1", excess: "+18%", width: 72, positive: true },
      { fold: "Fold 2", excess: "+12%", width: 48, positive: true },
      { fold: "Fold 3", excess: "+22%", width: 88, positive: true },
      { fold: "Fold 4", excess: "-3%", width: 14, positive: false },
      { fold: "Fold 5", excess: "+15%", width: 60, positive: true },
    ],
    regimes: [
      {
        title: "Bull Expansion",
        period: "2020-2021 Liquidity Wave",
        ret: "+38.2%",
        sharpe: "2.10",
        color: "bg-primary-container",
        icon: "trending_up",
      },
      {
        title: "High Volatility / Bear",
        period: "2022 Drawdown Crisis",
        ret: "+14.6%",
        sharpe: "1.34",
        color: "bg-secondary-container",
        icon: "shield",
      },
      {
        title: "Sideways / Rangebound",
        period: "2023 Compression Mode",
        ret: "+8.2%",
        sharpe: "0.95",
        color: "bg-outline",
        icon: "horizontal_rule",
      },
      {
        title: "Rate Hike Regime",
        period: "2022-2024 Tightening Cycle",
        ret: "+19.4%",
        sharpe: "1.58",
        color: "bg-tertiary-container",
        icon: "stacked_line_chart",
      },
    ],
    verdict: {
      regimeContext:
        "Q3 2022 saw rapid real yield expansion and sudden volatility spikes in Gold Futures (GC=F). Fast-moving yield adjustments compressed the duration signal effectiveness.",
      regimeVol: "+41.2% VOL",
      slippageCost: "COST: 14 bps",
      slippageText:
        "Transaction costs contributed only 14 bps of total decay. Rather than execution drag, 82% of drawdown was caused by false breakout whipsaws during the macro transition regime.",
      robustnessVerdict:
        "The strategy maintained defensive positioning through dynamic contract de-leveraging, keeping total peak-to-trough drawdown at 8.4%, well within the mandated 15% institutional risk budget.",
      signalDrift: 82,
      durationDrag: 12,
      slippagePct: 6,
    },
  },
  "BTC-USD": {
    symbol: "BTC-USD",
    name: "Bitcoin / USD Spot Index",
    spot: "$44,120.00",
    stratRet: "+384.2%",
    alpha: "+62.8%",
    bhRet: "+321.4%",
    sharpe: "2.12",
    ir: "1.24",
    mdd: "-28.6%",
    rec: "92 Days",
    trust: 84,
    pboRisk: "6.2% (Low)",
    deflatedSr: "1.85",
    paramShift: "±15% Tol",
    vol: "44.8%",
    var95: "-4.6%",
    sortino: "2.84",
    calmar: "2.68",
    trades: 486,
    winRate: 61.2,
    costFriction: "-3.4%",
    slippageDrag: "-$8,120",
    exposureTime: "58.6%",
    maxCapacity: "$12.5M",
    equityPoints: [
      { label: "2019", strat: 100, bench: 100 },
      { label: "2020", strat: 180, bench: 140 },
      { label: "2021", strat: 340, bench: 280 },
      { label: "2022", strat: 280, bench: 190 },
      { label: "2023", strat: 390, bench: 310 },
      { label: "2024", strat: 484, bench: 421 },
    ],
    drawdownPoints: [
      { label: "2019", dd: 0 },
      { label: "Q1 2020", dd: -28.6 },
      { label: "Q3 2020", dd: -8.4 },
      { label: "2021", dd: -14.2 },
      { label: "2022", dd: -22.8 },
      { label: "2023", dd: -9.5 },
      { label: "2024", dd: 0 },
    ],
    folds: [
      { fold: "Fold 1", excess: "+34%", width: 85, positive: true },
      { fold: "Fold 2", excess: "+24%", width: 62, positive: true },
      { fold: "Fold 3", excess: "+41%", width: 95, positive: true },
      { fold: "Fold 4", excess: "-8%", width: 22, positive: false },
      { fold: "Fold 5", excess: "+28%", width: 70, positive: true },
    ],
    regimes: [
      {
        title: "Bull Expansion",
        period: "2020-2021 Halving & ETF Wave",
        ret: "+84.6%",
        sharpe: "2.45",
        color: "bg-primary-container",
        icon: "trending_up",
      },
      {
        title: "High Volatility / Bear",
        period: "2022 Deleveraging Contagion",
        ret: "+28.2%",
        sharpe: "1.48",
        color: "bg-secondary-container",
        icon: "shield",
      },
      {
        title: "Sideways / Rangebound",
        period: "2023 Accumulation Band",
        ret: "+18.4%",
        sharpe: "1.12",
        color: "bg-outline",
        icon: "horizontal_rule",
      },
      {
        title: "Rate Hike Regime",
        period: "2022-2024 Macro Headwinds",
        ret: "+32.1%",
        sharpe: "1.74",
        color: "bg-tertiary-container",
        icon: "stacked_line_chart",
      },
    ],
    verdict: {
      regimeContext:
        "High systemic beta and weekend liquidity drops in Bitcoin (BTC-USD). Momentum indicators effectively filtered out the massive Q2 2022 cascade liquidations.",
      regimeVol: "+68.4% VOL",
      slippageCost: "COST: 24 bps",
      slippageText:
        "High crypto venue fees contributed 24 bps drag, but trailing stop rules protected 74% of cumulative gains during steep deleveraging shocks.",
      robustnessVerdict:
        "Dynamic volatility target capped downside leverage at 0.45x during 2022 crypto contagion, keeping drawdown within acceptable institutional bounds.",
      signalDrift: 74,
      durationDrag: 16,
      slippagePct: 10,
    },
  },
  "NVDA": {
    symbol: "NVDA",
    name: "NVIDIA Corp Equity",
    spot: "$495.22",
    stratRet: "+512.6%",
    alpha: "+41.2%",
    bhRet: "+471.4%",
    sharpe: "1.96",
    ir: "0.88",
    mdd: "-31.4%",
    rec: "110 Days",
    trust: 81,
    pboRisk: "7.8% (Moderate)",
    deflatedSr: "1.71",
    paramShift: "±10% Tol",
    vol: "38.2%",
    var95: "-3.8%",
    sortino: "2.45",
    calmar: "2.04",
    trades: 294,
    winRate: 56.8,
    costFriction: "-1.8%",
    slippageDrag: "-$2,940",
    exposureTime: "71.4%",
    maxCapacity: "$50.0M",
    equityPoints: [
      { label: "2019", strat: 100, bench: 100 },
      { label: "2020", strat: 210, bench: 190 },
      { label: "2021", strat: 380, bench: 320 },
      { label: "2022", strat: 290, bench: 210 },
      { label: "2023", strat: 460, bench: 420 },
      { label: "2024", strat: 612, bench: 571 },
    ],
    drawdownPoints: [
      { label: "2019", dd: 0 },
      { label: "Q1 2020", dd: -18.2 },
      { label: "2021", dd: -12.4 },
      { label: "Q3 2022", dd: -31.4 },
      { label: "2023", dd: -8.2 },
      { label: "2024", dd: 0 },
    ],
    folds: [
      { fold: "Fold 1", excess: "+22%", width: 75, positive: true },
      { fold: "Fold 2", excess: "+16%", width: 55, positive: true },
      { fold: "Fold 3", excess: "+29%", width: 90, positive: true },
      { fold: "Fold 4", excess: "-5%", width: 18, positive: false },
      { fold: "Fold 5", excess: "+19%", width: 65, positive: true },
    ],
    regimes: [
      {
        title: "Bull Expansion",
        period: "2023-2024 GenAI Acceleration",
        ret: "+92.4%",
        sharpe: "2.68",
        color: "bg-primary-container",
        icon: "trending_up",
      },
      {
        title: "High Volatility / Bear",
        period: "2022 Tech Valuation Reset",
        ret: "+16.8%",
        sharpe: "1.28",
        color: "bg-secondary-container",
        icon: "shield",
      },
      {
        title: "Sideways / Rangebound",
        period: "2021 Crypto Mining Lull",
        ret: "+11.2%",
        sharpe: "1.04",
        color: "bg-outline",
        icon: "horizontal_rule",
      },
      {
        title: "Rate Hike Regime",
        period: "2022 Federal Reserve Tightening",
        ret: "+21.5%",
        sharpe: "1.62",
        color: "bg-tertiary-container",
        icon: "stacked_line_chart",
      },
    ],
    verdict: {
      regimeContext:
        "High equity beta with strong enterprise momentum in NVIDIA Corp (NVDA). Explosive data center demand generated sustained trend runs offset by sharp Fed multiple compressions.",
      regimeVol: "+52.1% VOL",
      slippageCost: "COST: 8 bps",
      slippageText:
        "Ultra-deep cash equity liquidity provided negligible slippage (8 bps). Drawdown was primarily driven by valuation multiple re-rating rather than trading inefficiency.",
      robustnessVerdict:
        "Volatility targeting reduced position sizing prior to earnings gaps, limiting single-day exposure risk.",
      signalDrift: 79,
      durationDrag: 15,
      slippagePct: 6,
    },
  },
};
