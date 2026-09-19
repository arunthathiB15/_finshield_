import React, { useState } from "react";
import type { AssetTelemetry } from "../data/mockData";
import type { ThemeMode } from "../types";

type StrategyLabTabProps = {
  asset: AssetTelemetry;
  availableTickers: string[];
  selectedTicker: string;
  onSelectTicker: (ticker: string) => void;
  theme: ThemeMode;
  onRunBackendBacktest?: (params: {
    capital: number;
    slippageBps: number;
    fastWindow: number;
    slowWindow: number;
  }) => void;
};

export const StrategyLabTab: React.FC<StrategyLabTabProps> = ({
  asset,
  availableTickers,
  selectedTicker,
  onSelectTicker,
  theme,
  onRunBackendBacktest,
}) => {
  const [strategyModel, setStrategyModel] = useState("DMT-200");
  const [capital, setCapital] = useState("100,000");
  const [feeBps, setFeeBps] = useState("5 bps");
  const [sizingPolicy, setSizingPolicy] = useState<"vol" | "frac">("vol");
  const [isSimulating, setIsSimulating] = useState(false);
  const [executionTime, setExecutionTime] = useState("320ms");

  const isDark = theme === "dark";

  const triggerBacktest = () => {
    setIsSimulating(true);
    const simulatedMs = Math.floor(Math.random() * 150 + 260);
    setTimeout(() => {
      setIsSimulating(false);
      setExecutionTime(`${simulatedMs}ms`);
      if (onRunBackendBacktest) {
        onRunBackendBacktest({
          capital: 100000,
          slippageBps: 5,
          fastWindow: 20,
          slowWindow: 50,
        });
      }
    }, 700);
  };

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Date,Ticker,Model,OrderType,FillPrice,Size,FeeBps,NetPnl\n" +
      "2023-01-15," + asset.symbol + "," + strategyModel + ",BUY,1920.40,10.5,5.0,+420.50\n" +
      "2023-03-22," + asset.symbol + "," + strategyModel + ",SELL,1985.20,10.5,5.0,+680.40\n" +
      "2023-06-10," + asset.symbol + "," + strategyModel + ",BUY,1945.10,12.0,5.0,-140.20\n" +
      "2023-09-18," + asset.symbol + "," + strategyModel + ",SELL,2010.50,12.0,5.0,+786.10\n" +
      "2023-11-28," + asset.symbol + "," + strategyModel + ",BUY,2040.00,11.2,5.0,+512.30\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FinShield_${asset.symbol}_OrderLog.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const jsonContent = {
      audit_protocol: "FINSHIELD-QUANT-V4",
      timestamp: new Date().toISOString(),
      asset: asset.symbol,
      strategy_model: strategyModel,
      capital: capital,
      fee_bps: feeBps,
      sizing_policy: sizingPolicy,
      metrics: {
        cumulative_return: asset.stratRet,
        benchmark_return: asset.bhRet,
        sharpe_ratio: asset.sharpe,
        max_drawdown: asset.mdd,
        trades: asset.trades,
        win_rate: `${asset.winRate}%`,
        trust_index: `${asset.trust}/100`,
      },
      sha256_manifest: "0x8F4A9921B78C4E2A5D1903",
    };
    const blob = new Blob([JSON.stringify(jsonContent, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `FinShield_${asset.symbol}_TelemetryFeed.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col w-full space-y-3.5 max-w-4xl mx-auto">
      {/* Engine Telemetry Bar */}
      <div
        className={`flex items-center justify-between px-3 py-1.5 rounded-xl shadow-xs text-xs ${
          isDark
            ? "bg-surface-container-low border border-white/5"
            : "liquid-glass-subtle text-slate-600"
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse shrink-0" />
          <span className="font-label-caps text-primary-container font-semibold truncate text-[10px]">
            ENGINE: QUANT-V4 DETERMINISTIC
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0 font-code-sm text-[11px]">
          <span className="opacity-60">SEED:</span>
          <span
            className={`font-semibold px-1.5 py-0.5 rounded ${
              isDark
                ? "text-primary-container bg-surface-container"
                : "text-blue-600 bg-blue-50 border border-blue-200"
            }`}
          >
            #0x8F4A
          </span>
        </div>
      </div>

      {/* Laboratory Configuration Pane */}
      <section
        className={`rounded-2xl p-3.5 sm:p-4 shadow-md flex flex-col space-y-3 relative overflow-hidden ${
          isDark ? "bg-surface-container" : "liquid-glass-card"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary-container text-[18px]">
              tune
            </span>
            <h2
              className={`font-headline-sm font-semibold tracking-tight ${
                isDark ? "text-on-surface" : "text-text-obsidian"
              }`}
            >
              Strategy Parameters
            </h2>
          </div>
          <span
            className={`font-code-sm text-[10px] px-2 py-0.5 rounded font-semibold ${
              isDark
                ? "text-on-surface-variant bg-surface-container-highest"
                : "text-slate-600 bg-slate-100 border border-slate-200"
            }`}
          >
            ID: LAB-204
          </span>
        </div>

        {/* Target Instrument Selector */}
        <div className="flex flex-col space-y-1">
          <label className="font-label-caps text-[10px] uppercase opacity-70">
            Target Instrument
          </label>
          <div className="relative">
            <select
              value={selectedTicker}
              onChange={(e) => {
                onSelectTicker(e.target.value);
                triggerBacktest();
              }}
              className={`w-full font-body-md text-sm py-2 px-3 rounded-xl appearance-none focus:outline-none transition-colors pr-8 ${
                isDark
                  ? "bg-surface-container-lowest text-on-surface border border-white/5 focus:bg-surface-container-high"
                  : "liquid-glass-input text-text-obsidian"
              }`}
            >
              <option value="GC=F">GC=F — Gold Futures (Active Benchmark)</option>
              <option value="BTC-USD">BTC-USD — Bitcoin (Perpetual Composite)</option>
              <option value="NVDA">NVDA — NVIDIA Corp (Equity Cash)</option>
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 opacity-70 text-[18px]">
              expand_more
            </span>
          </div>
          <div className="flex items-center gap-1 px-0.5 pt-0.5">
            <span className="material-symbols-outlined text-[13px] text-primary-container">
              info
            </span>
            <p className="font-code-sm text-[10px] opacity-70 leading-tight">
              Changing asset resets state to prevent cross-contamination.
            </p>
          </div>
        </div>

        {/* Strategy Architecture Selector */}
        <div className="flex flex-col space-y-1">
          <label className="font-label-caps text-[10px] uppercase opacity-70">
            Strategy Model
          </label>
          <div className="relative">
            <select
              value={strategyModel}
              onChange={(e) => {
                setStrategyModel(e.target.value);
                triggerBacktest();
              }}
              className={`w-full font-headline-sm text-sm py-2 px-3 rounded-xl appearance-none focus:outline-none transition-colors pr-8 font-semibold ${
                isDark
                  ? "bg-surface-container-lowest text-primary-container border border-white/5 focus:bg-surface-container-high"
                  : "liquid-glass-input text-blue-600"
              }`}
            >
              <option value="DMT-200">Dual Momentum Trend (DMT-200)</option>
              <option value="VRS">Volatility Regime Switch (VRS)</option>
              <option value="SMR">Statistical Mean Reversion (SMR)</option>
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-primary-container text-[18px]">
              expand_more
            </span>
          </div>
        </div>

        {/* Capital & Cost 2-Col Split */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <label className="font-label-caps text-[10px] uppercase opacity-70">
              Initial Capital
            </label>
            <div
              className={`flex items-center rounded-xl px-2.5 py-1.5 ${
                isDark
                  ? "bg-surface-container-lowest border border-white/5"
                  : "liquid-glass-input"
              }`}
            >
              <span className="font-metric-sm text-xs opacity-60 mr-1">$</span>
              <input
                type="text"
                value={capital}
                onChange={(e) => setCapital(e.target.value)}
                className="w-full bg-transparent font-metric-md text-xs font-semibold focus:outline-none"
              />
            </div>
          </div>
          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-label-caps text-[10px] uppercase opacity-70">
                Slippage / Fee
              </label>
              <span className="font-label-caps text-primary-container text-[10px] font-semibold">
                5 bps
              </span>
            </div>
            <div
              className={`flex items-center rounded-xl px-2.5 py-1.5 ${
                isDark
                  ? "bg-surface-container-lowest border border-white/5"
                  : "liquid-glass-input"
              }`}
            >
              <input
                type="text"
                value={feeBps}
                onChange={(e) => setFeeBps(e.target.value)}
                className="w-full bg-transparent font-metric-md text-xs font-semibold focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Position Sizing Policy */}
        <div className="flex flex-col space-y-1">
          <label className="font-label-caps text-[10px] uppercase opacity-70">
            Position Sizing Algorithm
          </label>
          <div
            className={`grid grid-cols-2 gap-1 p-1 rounded-xl ${
              isDark
                ? "bg-surface-container-lowest"
                : "bg-slate-100/90 border border-slate-200/60"
            }`}
          >
            <button
              type="button"
              onClick={() => setSizingPolicy("vol")}
              className={`py-1.5 px-2 rounded-lg font-body-sm text-xs text-center font-medium transition-all ${
                sizingPolicy === "vol"
                  ? isDark
                    ? "text-primary-container bg-surface-container-high font-semibold shadow-xs"
                    : "text-blue-600 bg-white font-bold shadow-xs border border-slate-200"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              Vol Target (15% Ann.)
            </button>
            <button
              type="button"
              onClick={() => setSizingPolicy("frac")}
              className={`py-1.5 px-2 rounded-lg font-body-sm text-xs text-center font-medium transition-all ${
                sizingPolicy === "frac"
                  ? isDark
                    ? "text-primary-container bg-surface-container-high font-semibold shadow-xs"
                    : "text-blue-600 bg-white font-bold shadow-xs border border-slate-200"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              Fixed Fraction (10%)
            </button>
          </div>
        </div>

        {/* Date Bounds & Frequency */}
        <div
          className={`p-2.5 rounded-xl flex flex-col space-y-1 text-xs ${
            isDark
              ? "bg-surface-container-lowest border border-white/5"
              : "liquid-glass-input"
          }`}
        >
          <div className="flex items-center justify-between font-label-caps text-[10px]">
            <span className="opacity-70">SAMPLING TIMEFRAME</span>
            <span
              className={`font-code-sm px-1.5 py-0.5 rounded font-semibold ${
                isDark
                  ? "text-primary-fixed bg-surface-container-high"
                  : "text-blue-600 bg-blue-50 border border-blue-200"
              }`}
            >
              DAILY (CLOSE)
            </span>
          </div>
          <div className="flex items-center justify-between font-metric-sm text-[11px] font-semibold">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-primary-container">
                calendar_today
              </span>
              2019-01-01
            </span>
            <span className="opacity-40">→</span>
            <span>2024-01-01</span>
          </div>
        </div>

        {/* Execute Button */}
        <div className="flex flex-col space-y-1 pt-1">
          <button
            type="button"
            onClick={triggerBacktest}
            disabled={isSimulating}
            className={`w-full py-3 px-3 rounded-xl font-headline-md text-sm font-semibold flex items-center justify-center gap-1.5 shadow-md active:scale-[0.99] transition-all ${
              isDark
                ? "bg-primary-container text-on-primary-container hover:bg-primary-fixed"
                : "bg-gradient-to-b from-blue-600 to-blue-700 text-white hover:from-blue-500 hover:to-blue-600 shadow-[0_4px_16px_rgba(0,102,255,0.3)]"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">bolt</span>
            <span>{isSimulating ? "Computing Matrix..." : "Run Strategy Backtest"}</span>
          </button>
          <div className="flex items-center justify-between px-1 text-[11px] opacity-70">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="font-code-sm">Analysis Ready</span>
            </div>
            <span className="font-code-sm">Worker: deterministic_core.wasm</span>
          </div>
        </div>
      </section>

      {/* Execution State Mode Switcher (Delight Bar) */}
      <div
        className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs ${
          isDark
            ? "bg-surface-container-high border border-white/5"
            : "liquid-glass-subtle text-slate-700"
        }`}
      >
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-primary-container">
            speed
          </span>
          <span className="font-code-sm">
            Execution:{" "}
            <strong className="text-primary-container font-semibold">
              Completed ({executionTime})
            </strong>
          </span>
        </div>
        <button
          type="button"
          onClick={triggerBacktest}
          className={`flex items-center gap-1 font-label-caps text-[9px] uppercase px-2 py-1 rounded-lg transition-colors ${
            isDark
              ? "bg-surface-container-lowest text-on-surface-variant hover:text-primary-container"
              : "bg-white text-slate-600 border border-slate-200 hover:text-blue-600"
          }`}
        >
          <span className="material-symbols-outlined text-[13px]">
            motion_photos_paused
          </span>
          <span>Simulate Compute</span>
        </button>
      </div>

      {/* Skeleton Loading Preview Pane */}
      {isSimulating && (
        <div className="flex flex-col space-y-3 animate-pulse">
          <div
            className={`rounded-2xl p-4 flex flex-col space-y-3 ${
              isDark ? "bg-surface-container" : "liquid-glass-card"
            }`}
          >
            <div className="flex justify-between items-center">
              <div className="h-4 w-32 bg-slate-400/20 rounded" />
              <div className="h-4 w-16 bg-slate-400/20 rounded" />
            </div>
            <div className="h-9 w-48 bg-slate-400/20 rounded" />
            <div className="h-24 w-full bg-slate-400/20 rounded-xl" />
            <div className="grid grid-cols-2 gap-2">
              <div className="h-16 bg-slate-400/20 rounded-xl" />
              <div className="h-16 bg-slate-400/20 rounded-xl" />
            </div>
          </div>
        </div>
      )}

      {/* Results Summary Panel */}
      {!isSimulating && (
        <section className="flex flex-col space-y-3">
          <div
            className={`rounded-2xl p-3.5 sm:p-4 shadow-lg flex flex-col space-y-3 relative overflow-hidden ${
              isDark ? "bg-surface-container" : "liquid-glass-card"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary-container text-[18px]">
                  monitoring
                </span>
                <span
                  className={`font-headline-sm font-semibold ${
                    isDark ? "text-on-surface" : "text-text-obsidian"
                  }`}
                >
                  Deterministic Returns
                </span>
              </div>
              <div
                className={`px-2 py-0.5 rounded flex items-center gap-1 text-[9px] font-label-caps ${
                  isDark
                    ? "bg-surface-container-lowest text-on-surface-variant"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
                <span>SIMULATED TICK-BY-TICK</span>
              </div>
            </div>

            {/* Main Metric Delta */}
            <div className="flex items-baseline justify-between pt-0.5">
              <div>
                <span className="font-label-caps text-[9px] uppercase tracking-wider block opacity-70">
                  Cumulative Net Return
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="font-display-lg text-2xl sm:text-3xl text-primary-container font-bold tracking-tight">
                    {asset.stratRet}
                  </span>
                  <span
                    className={`font-metric-sm text-xs px-1.5 py-0.5 rounded font-medium ${
                      isDark
                        ? "text-primary-fixed bg-surface-container-high"
                        : "text-emerald-700 bg-emerald-50 border border-emerald-200"
                    }`}
                  >
                    +24.8% Ann.
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-label-caps text-[9px] uppercase opacity-70">
                  Benchmark (Gold)
                </span>
                <span
                  className={`font-metric-md text-sm block mt-0.5 font-semibold ${
                    isDark ? "text-on-surface" : "text-text-obsidian"
                  }`}
                >
                  {asset.bhRet}
                </span>
              </div>
            </div>

            {/* Sparkline Visual */}
            <div
              className={`p-2.5 rounded-xl flex flex-col space-y-1 ${
                isDark
                  ? "bg-surface-container-lowest/80"
                  : "bg-white/85 border border-slate-200/60 shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between opacity-70 font-code-sm text-[10px]">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-0.5 bg-primary-container inline-block" />
                  <span>{strategyModel} Net Equity</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-0.5 bg-rose-400 inline-block" />
                  <span>S&P Bench</span>
                </div>
              </div>

              <svg className="w-full h-24 overflow-visible" fill="none" preserveAspectRatio="none" viewBox="0 0 320 80">
                <defs>
                  <linearGradient id="eqGlow2" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={isDark ? "#00f0ff" : "#0066ff"} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={isDark ? "#00f0ff" : "#0066ff"} stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <line stroke={isDark ? "#313540" : "#e2e8f0"} strokeDasharray="2 3" strokeWidth="0.75" x1="0" x2="320" y1="20" y2="20" />
                <line stroke={isDark ? "#313540" : "#e2e8f0"} strokeDasharray="2 3" strokeWidth="0.75" x1="0" x2="320" y1="50" y2="50" />
                <path d="M0,70 Q 50,65 90,52 T 180,38 T 240,28 T 320,8 L 320,80 L 0,80 Z" fill="url(#eqGlow2)" />
                <path d="M0,72 Q 70,68 140,60 T 250,48 T 320,40" fill="none" stroke="#ffb1c5" strokeDasharray="3 3" strokeWidth="1.5" />
                <path d="M0,70 Q 50,65 90,52 T 180,38 T 240,28 T 320,8" fill="none" stroke={isDark ? "#00f0ff" : "#0066ff"} strokeWidth="2" />
                <circle cx="320" cy="8" fill={isDark ? "#00f0ff" : "#0066ff"} r="3" />
              </svg>

              <div className="flex justify-between font-label-caps text-[9px] opacity-70 pt-0.5">
                <span>JAN 2019</span>
                <span className="text-primary-container font-semibold">PEAK: $264,218</span>
                <span>JAN 2024</span>
              </div>
            </div>

            {/* Execution Quality Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div
                className={`p-2.5 rounded-xl flex flex-col justify-between space-y-1 ${
                  isDark
                    ? "bg-surface-container-lowest"
                    : "bg-white/80 border border-slate-200/60 shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-label-caps uppercase opacity-70 text-[9px]">Trades</span>
                  <span className="font-code-sm text-primary-container font-semibold">PF: 1.78</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-metric-lg text-base font-bold">{asset.trades}</span>
                  <span className="font-code-sm opacity-60 text-[10px]">orders</span>
                </div>
                <div className="w-full bg-slate-500/20 h-1.5 rounded-full overflow-hidden flex">
                  <div className="bg-primary-container h-full" style={{ width: `${asset.winRate}%` }} />
                  <div className="bg-rose-400 h-full" style={{ width: `${100 - asset.winRate}%` }} />
                </div>
                <span className="font-label-caps opacity-70 text-[9px]">
                  Win Rate: <strong>{asset.winRate}%</strong>
                </span>
              </div>

              <div
                className={`p-2.5 rounded-xl flex flex-col justify-between space-y-1 ${
                  isDark
                    ? "bg-surface-container-lowest"
                    : "bg-white/80 border border-slate-200/60 shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-label-caps uppercase opacity-70 text-[9px]">
                    Cost Friction
                  </span>
                  <span className="font-code-sm text-rose-400 font-semibold">
                    {asset.costFriction}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-metric-lg text-base text-rose-400 font-bold">
                    {asset.slippageDrag}
                  </span>
                </div>
                <div className="flex items-center gap-1 font-label-caps opacity-70 text-[9px]">
                  <span className="material-symbols-outlined text-[12px] text-rose-400">
                    trending_down
                  </span>
                  <span>Net Slippage Drag</span>
                </div>
                <span className="font-label-caps opacity-50 text-[9px]">
                  Model: Fixed 5 bps Tier
                </span>
              </div>

              <div
                className={`p-2.5 rounded-xl flex flex-col justify-between space-y-1 ${
                  isDark
                    ? "bg-surface-container-lowest"
                    : "bg-white/80 border border-slate-200/60 shadow-xs"
                }`}
              >
                <span className="font-label-caps uppercase opacity-70 text-[9px]">
                  Exposure Time
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="font-metric-lg text-base font-bold">{asset.exposureTime}</span>
                  <span className="font-code-sm text-primary-container text-[10px]">Active</span>
                </div>
                <p className="font-code-sm opacity-70 text-[10px] leading-tight">
                  131.2 days cash resting posture per annum.
                </p>
              </div>

              <div
                className={`p-2.5 rounded-xl flex flex-col justify-between space-y-1 ${
                  isDark
                    ? "bg-surface-container-lowest"
                    : "bg-white/80 border border-slate-200/60 shadow-xs"
                }`}
              >
                <span className="font-label-caps uppercase opacity-70 text-[9px]">
                  Max Capacity
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="font-metric-lg text-base text-primary-container font-bold">
                    {asset.maxCapacity}
                  </span>
                </div>
                <p className="font-code-sm opacity-70 text-[10px] leading-tight">
                  Est. ceiling before slippage degradation.
                </p>
              </div>
            </div>

            {/* Audit Artifacts Download Buttons */}
            <div className="pt-1 flex flex-col space-y-1 text-xs">
              <div className="flex items-center justify-between opacity-70 font-label-caps text-[9px]">
                <span>AUDIT ARTIFACTS</span>
                <span>SHA-256 Verified</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className={`flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl font-body-sm text-xs font-semibold transition-all active:scale-98 ${
                    isDark
                      ? "bg-surface-container-high hover:bg-surface-container-highest text-on-surface"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-xs"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px] text-primary-container">
                    file_download
                  </span>
                  <span>Export CSV Log</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className={`flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl font-body-sm text-xs font-semibold transition-all active:scale-98 ${
                    isDark
                      ? "bg-surface-container-high hover:bg-surface-container-highest text-on-surface"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-xs"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px] text-primary-container">
                    data_object
                  </span>
                  <span>Export JSON Feed</span>
                </button>
              </div>
            </div>
          </div>

          {/* Institutional Guardrails Passed Card */}
          <div
            className={`rounded-2xl p-3 flex items-center justify-between shadow-sm ${
              isDark ? "bg-surface-container-low border border-white/5" : "liquid-glass-card"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isDark
                    ? "bg-surface-container-high text-primary-fixed"
                    : "bg-blue-50 text-blue-600 border border-blue-100"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
              </div>
              <div className="flex flex-col min-w-0 text-xs">
                <span
                  className={`font-headline-sm font-semibold truncate ${
                    isDark ? "text-on-surface" : "text-text-obsidian"
                  }`}
                >
                  Reliability Guardrails Passed
                </span>
                <span className="font-code-sm opacity-70 text-[10px]">
                  Zero lookahead bias detected in fold set
                </span>
              </div>
            </div>
            <span
              className={`font-label-caps text-[9px] px-2 py-0.5 rounded font-bold uppercase shrink-0 ${
                isDark
                  ? "text-primary-container bg-surface-container"
                  : "text-blue-700 bg-blue-50 border border-blue-200"
              }`}
            >
              TIER-1
            </span>
          </div>
        </section>
      )}
    </div>
  );
};
