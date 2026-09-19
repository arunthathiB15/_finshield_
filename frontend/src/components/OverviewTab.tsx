import React from "react";
import type { AssetTelemetry } from "../data/mockData";
import type { ThemeMode } from "../types";

type OverviewTabProps = {
  asset: AssetTelemetry;
  availableTickers: string[];
  selectedTicker: string;
  onSelectTicker: (ticker: string) => void;
  theme: ThemeMode;
};

export const OverviewTab: React.FC<OverviewTabProps> = ({
  asset,
  availableTickers,
  selectedTicker,
  onSelectTicker,
  theme,
}) => {
  const isDark = theme === "dark";

  return (
    <div className="flex flex-col w-full space-y-3.5 max-w-4xl mx-auto">
      {/* Asset Ribbon & Engine Telemetry */}
      <section
        className={`rounded-2xl p-3.5 shadow-md flex flex-col gap-2 transition-all ${
          isDark
            ? "bg-surface-container-low/90 backdrop-blur-md border border-white/5"
            : "liquid-glass-card"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-1 overflow-x-auto scrollbar-none py-0.5">
            {availableTickers.map((ticker) => {
              const active = ticker === selectedTicker;
              return (
                <button
                  key={ticker}
                  type="button"
                  onClick={() => onSelectTicker(ticker)}
                  className={`px-3 py-1 rounded-lg font-code-sm text-code-sm font-semibold transition-all ${
                    active
                      ? isDark
                        ? "bg-primary-container text-on-primary-container shadow-xs"
                        : "bg-blue-600 text-white shadow-sm"
                      : isDark
                      ? "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                      : "bg-white/70 text-slate-600 border border-slate-200/70 hover:bg-white"
                  }`}
                >
                  {ticker}
                </button>
              );
            })}
          </div>
          <span
            className={`font-label-caps text-[10px] px-2 py-0.5 rounded font-semibold tracking-wider uppercase shrink-0 ${
              isDark
                ? "bg-surface-container text-secondary-fixed"
                : "bg-amber-50 text-amber-700 border border-amber-200/70"
            }`}
          >
            Research Only
          </span>
        </div>

        <div className="flex items-center justify-between text-code-sm font-code-sm pt-1">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isDark ? "bg-primary-container" : "bg-blue-600"
              }`}
            />
            <span
              className={`font-semibold ${
                isDark ? "text-on-surface" : "text-text-obsidian"
              }`}
            >
              {asset.name}
            </span>
          </div>
          <span
            className={`font-metric-sm font-bold ${
              isDark ? "text-primary-fixed" : "text-blue-600"
            }`}
          >
            {asset.spot}
          </span>
        </div>

        <div
          className={`rounded-xl p-2.5 flex flex-col gap-1 text-xs ${
            isDark
              ? "bg-surface-container-lowest/80 text-on-surface-variant"
              : "liquid-glass-subtle text-slate-500"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-primary-container">
                dns
              </span>
              <span className={isDark ? "text-on-surface" : "text-slate-700 font-medium"}>
                Engine: Backtest-v4.2
              </span>
            </div>
            <div
              className={`flex items-center gap-1 font-semibold ${
                isDark ? "text-primary-fixed" : "text-blue-600"
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">speed</span>
              <span className="font-metric-sm">42ms latency</span>
            </div>
          </div>
          <div className="flex items-center justify-between font-code-sm text-[11px]">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">calendar_today</span>
              2018-01-01 → 2024-01-01
            </span>
            <span className="uppercase tracking-wider font-label-caps text-[9px] font-semibold">
              6.0Y DLY IN-SAMPLE
            </span>
          </div>
        </div>
      </section>

      {/* KPI Grid (2-Column Dense Tabular Stack) */}
      <section className="grid grid-cols-2 gap-2 sm:gap-2.5">
        {/* Card 1: Strategy Return */}
        <div
          className={`rounded-2xl p-3 shadow-sm flex flex-col justify-between ${
            isDark ? "bg-surface-container-low/95" : "liquid-glass-card"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`font-label-caps text-[10px] uppercase font-semibold ${
                isDark ? "text-on-surface-variant" : "text-slate-500"
              }`}
            >
              Strategy Return
            </span>
            <span
              className={`material-symbols-outlined text-[16px] ${
                isDark ? "text-primary-container" : "text-emerald-600"
              }`}
            >
              trending_up
            </span>
          </div>
          <div className="my-1">
            <div
              className={`font-metric-lg text-lg sm:text-xl font-bold ${
                isDark ? "text-primary-container" : "text-emerald-600"
              }`}
            >
              {asset.stratRet}
            </div>
          </div>
          <div
            className={`rounded px-2 py-1 flex items-center justify-between text-xs ${
              isDark
                ? "bg-surface-container/70 text-on-surface-variant"
                : "bg-emerald-50/80 border border-emerald-100 text-emerald-800"
            }`}
          >
            <span className="font-code-sm">Alpha</span>
            <span className="font-metric-sm font-semibold">{asset.alpha}</span>
          </div>
        </div>

        {/* Card 2: Buy & Hold Return */}
        <div
          className={`rounded-2xl p-3 shadow-sm flex flex-col justify-between ${
            isDark ? "bg-surface-container-low/95" : "liquid-glass-card"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`font-label-caps text-[10px] uppercase font-semibold ${
                isDark ? "text-on-surface-variant" : "text-slate-500"
              }`}
            >
              Buy & Hold
            </span>
            <span className="material-symbols-outlined text-[16px] opacity-70">
              show_chart
            </span>
          </div>
          <div className="my-1">
            <div
              className={`font-metric-lg text-lg sm:text-xl font-bold ${
                isDark ? "text-on-surface" : "text-text-obsidian"
              }`}
            >
              {asset.bhRet}
            </div>
          </div>
          <div
            className={`rounded px-2 py-1 flex items-center justify-between text-xs ${
              isDark
                ? "bg-surface-container/70 text-on-surface-variant"
                : "liquid-glass-subtle text-slate-600"
            }`}
          >
            <span className="font-code-sm">Benchmark</span>
            <span className="font-metric-sm font-semibold">100% Exp.</span>
          </div>
        </div>

        {/* Card 3: Sharpe & IR */}
        <div
          className={`rounded-2xl p-3 shadow-sm flex flex-col justify-between ${
            isDark ? "bg-surface-container-low/95" : "liquid-glass-card"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`font-label-caps text-[10px] uppercase font-semibold ${
                isDark ? "text-on-surface-variant" : "text-slate-500"
              }`}
            >
              Sharpe Ratio
            </span>
            <span
              className={`material-symbols-outlined text-[16px] ${
                isDark ? "text-primary-fixed" : "text-blue-600"
              }`}
            >
              balance
            </span>
          </div>
          <div className="my-1">
            <div
              className={`font-metric-lg text-lg sm:text-xl font-bold ${
                isDark ? "text-primary-fixed" : "text-blue-600"
              }`}
            >
              {asset.sharpe}
            </div>
          </div>
          <div
            className={`rounded px-2 py-1 flex items-center justify-between text-xs ${
              isDark
                ? "bg-surface-container/70 text-on-surface-variant"
                : "liquid-glass-subtle text-slate-600"
            }`}
          >
            <span className="font-code-sm">Info Ratio</span>
            <span className="font-metric-sm font-semibold text-primary-container">
              {asset.ir}
            </span>
          </div>
        </div>

        {/* Card 4: Maximum Drawdown */}
        <div
          className={`rounded-2xl p-3 shadow-sm flex flex-col justify-between ${
            isDark ? "bg-surface-container-low/95" : "liquid-glass-card"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`font-label-caps text-[10px] uppercase font-semibold ${
                isDark ? "text-on-surface-variant" : "text-slate-500"
              }`}
            >
              Max Drawdown
            </span>
            <span className="material-symbols-outlined text-rose-500 text-[16px]">
              south_east
            </span>
          </div>
          <div className="my-1">
            <div className="font-metric-lg text-lg sm:text-xl font-bold text-rose-500">
              {asset.mdd}
            </div>
          </div>
          <div
            className={`rounded px-2 py-1 flex items-center justify-between text-xs ${
              isDark
                ? "bg-surface-container/70 text-on-surface-variant"
                : "bg-rose-50/80 border border-rose-100 text-rose-700"
            }`}
          >
            <span className="font-code-sm">Recovery</span>
            <span className="font-metric-sm font-semibold">{asset.rec}</span>
          </div>
        </div>
      </section>

      {/* Trust Score Highlight Card */}
      <section
        className={`rounded-2xl p-3.5 shadow-lg flex flex-col gap-3 relative overflow-hidden ${
          isDark ? "bg-surface-container-low/95" : "liquid-glass-card"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className="material-symbols-outlined text-[20px] text-primary-container"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
            <span
              className={`font-headline-sm font-bold tracking-tight ${
                isDark ? "text-on-surface" : "text-text-obsidian"
              }`}
            >
              System Trust Score
            </span>
          </div>
          <span
            className={`font-label-caps text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
              isDark
                ? "bg-surface-container-high text-primary-fixed"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}
          >
            Institutional Tier
          </span>
        </div>

        <div
          className={`flex items-center gap-3 rounded-xl p-3 border ${
            isDark
              ? "bg-surface-container-lowest/80 border-white/5"
              : "bg-white/80 border-slate-200/60 shadow-sm"
          }`}
        >
          {/* Radial Circular Metric Ring */}
          <div className="relative w-18 h-18 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className={isDark ? "text-surface-container-highest" : "text-slate-100"}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="text-primary-container"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeDasharray={`${asset.trust}, 100`}
                strokeLinecap="round"
                strokeWidth="3"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span
                className={`font-metric-lg text-lg font-bold leading-none ${
                  isDark ? "text-on-surface" : "text-text-obsidian"
                }`}
              >
                {asset.trust}
              </span>
              <span className="font-code-sm text-[10px] opacity-70">/100</span>
            </div>
          </div>

          <div className="flex flex-col justify-center min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
              <span className="font-label-caps text-primary-container uppercase font-bold tracking-wider text-[10px]">
                HIGH ROBUSTNESS
              </span>
            </div>
            <h2
              className={`font-headline-sm text-[13px] sm:text-sm font-bold tracking-tight mt-1 ${
                isDark ? "text-on-surface" : "text-text-obsidian"
              }`}
            >
              PASSED MULTI-REGIME STRESS TEST
            </h2>
            <p
              className={`font-body-sm text-[11px] leading-relaxed mt-1 ${
                isDark ? "text-on-surface-variant" : "text-slate-600"
              }`}
            >
              Low overfitting risk. Out-of-sample decay under 8%. Minimal cost sensitivity across
              high-slippage intervals.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <div
            className={`rounded-xl p-2 text-center ${
              isDark
                ? "bg-surface-container-high/60"
                : "bg-white/70 border border-slate-200/60 shadow-xs"
            }`}
          >
            <span className="font-label-caps text-[9px] opacity-70 block uppercase font-semibold">
              PBO Risk
            </span>
            <span className="font-metric-sm text-[11px] text-emerald-500 font-bold">
              {asset.pboRisk}
            </span>
          </div>
          <div
            className={`rounded-xl p-2 text-center ${
              isDark
                ? "bg-surface-container-high/60"
                : "bg-white/70 border border-slate-200/60 shadow-xs"
            }`}
          >
            <span className="font-label-caps text-[9px] opacity-70 block uppercase font-semibold">
              Deflated SR
            </span>
            <span
              className={`font-metric-sm text-[11px] font-bold ${
                isDark ? "text-on-surface" : "text-text-obsidian"
              }`}
            >
              {asset.deflatedSr}
            </span>
          </div>
          <div
            className={`rounded-xl p-2 text-center ${
              isDark
                ? "bg-surface-container-high/60"
                : "bg-white/70 border border-slate-200/60 shadow-xs"
            }`}
          >
            <span className="font-label-caps text-[9px] opacity-70 block uppercase font-semibold">
              Param Shift
            </span>
            <span className="font-metric-sm text-[11px] text-primary-container font-bold">
              {asset.paramShift}
            </span>
          </div>
        </div>
      </section>

      {/* Main Cumulative Return Chart */}
      <section
        className={`rounded-2xl p-3.5 shadow-md flex flex-col gap-2 ${
          isDark ? "bg-surface-container-low/95" : "liquid-glass-card"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary-container text-[18px]">
              area_chart
            </span>
            <span
              className={`font-headline-sm font-semibold ${
                isDark ? "text-on-surface" : "text-text-obsidian"
              }`}
            >
              Equity Curve Trajectory
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-1 rounded-sm bg-primary-container inline-block" />
              <span className="font-label-caps text-[9px]">Strategy</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-1 rounded-sm bg-rose-300 inline-block" />
              <span className="font-label-caps text-[9px] opacity-70">B&H</span>
            </div>
          </div>
        </div>

        {/* Dual Line SVG Chart */}
        <div
          className={`w-full rounded-xl p-2.5 ${
            isDark
              ? "bg-surface-container-lowest/90"
              : "bg-white/85 border border-slate-200/60 shadow-xs"
          }`}
        >
          <div className="flex justify-between items-center px-1 pb-1 font-code-sm text-[11px]">
            <span className="text-primary-container font-metric-sm font-bold">
              {asset.stratRet}
            </span>
            <span className="opacity-60">Rebased (100.0)</span>
          </div>

          <svg className="w-full h-36" preserveAspectRatio="none" viewBox="0 0 340 140">
            <defs>
              <linearGradient id="cyanGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={isDark ? "#00f0ff" : "#0066ff"} stopOpacity="0.25" />
                <stop offset="100%" stopColor={isDark ? "#00f0ff" : "#0066ff"} stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="purpleGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#c0c1ff" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#c0c1ff" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid */}
            <line stroke={isDark ? "#313540" : "#e2e8f0"} strokeDasharray="2 3" strokeWidth="0.75" x1="0" x2="340" y1="20" y2="20" />
            <line stroke={isDark ? "#313540" : "#e2e8f0"} strokeDasharray="2 3" strokeWidth="0.75" x1="0" x2="340" y1="55" y2="55" />
            <line stroke={isDark ? "#313540" : "#e2e8f0"} strokeDasharray="2 3" strokeWidth="0.75" x1="0" x2="340" y1="90" y2="90" />
            <line stroke={isDark ? "#313540" : "#cbd5e1"} strokeWidth="0.75" x1="0" x2="340" y1="125" y2="125" />

            {/* Benchmark */}
            <polygon fill="url(#purpleGradient)" points="0,125 0,118 45,110 90,98 135,102 180,80 225,74 270,62 315,55 340,48 340,125" />
            <polyline fill="none" points="0,118 45,110 90,98 135,102 180,80 225,74 270,62 315,55 340,48" stroke="#ffb1c5" strokeDasharray="3 3" strokeWidth="1.25" />

            {/* Strategy Area & Line */}
            <polygon fill="url(#cyanGradient)" points="0,125 0,120 40,105 85,86 130,78 175,64 220,52 265,34 305,24 340,14 340,125" />
            <polyline fill="none" points="0,120 40,105 85,86 130,78 175,64 220,52 265,34 305,24 340,14" stroke={isDark ? "#00f0ff" : "#0066ff"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.25" />

            <circle cx="340" cy="14" fill={isDark ? "#00f0ff" : "#0066ff"} r="3.5" stroke="#ffffff" strokeWidth="1.5" />
          </svg>

          <div className="flex justify-between items-center pt-1 font-code-sm text-[11px] opacity-70 px-1">
            <span>2018</span>
            <span>2020</span>
            <span>2022</span>
            <span className="text-primary-container font-semibold">2024</span>
          </div>
        </div>
      </section>

      {/* Historical Underwater Drawdown */}
      <section
        className={`rounded-2xl p-3.5 shadow-md flex flex-col gap-2 ${
          isDark ? "bg-surface-container-low/95" : "liquid-glass-card"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-rose-500 text-[18px]">
              waterfall_chart
            </span>
            <span
              className={`font-headline-sm font-semibold ${
                isDark ? "text-on-surface" : "text-text-obsidian"
              }`}
            >
              Historical Underwater Drawdown
            </span>
          </div>
          <span className="font-metric-sm text-rose-500 font-bold">
            Peak: {asset.mdd}
          </span>
        </div>

        <div
          className={`w-full rounded-xl p-2.5 ${
            isDark
              ? "bg-surface-container-lowest/90"
              : "bg-white/85 border border-slate-200/60 shadow-xs"
          }`}
        >
          <svg className="w-full h-24" preserveAspectRatio="none" viewBox="0 0 340 90">
            <defs>
              <linearGradient id="drawdownFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#ffb1c5" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#e30071" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            <line stroke={isDark ? "#849495" : "#94a3b8"} strokeWidth="0.75" x1="0" x2="340" y1="6" y2="6" />
            <line stroke={isDark ? "#313540" : "#e2e8f0"} strokeDasharray="2 3" strokeWidth="0.5" x1="0" x2="340" y1="45" y2="45" />
            <line stroke="#e30071" strokeDasharray="1 2" strokeWidth="0.75" x1="0" x2="340" y1="84" y2="84" />

            <polygon fill="url(#drawdownFill)" points="0,6 25,6 45,30 65,12 85,6 115,22 135,48 160,82 175,70 190,32 210,6 240,18 265,42 290,14 315,6 340,6 340,6 0,6" />
            <polyline fill="none" points="0,6 25,6 45,30 65,12 85,6 115,22 135,48 160,82 175,70 190,32 210,6 240,18 265,42 290,14 315,6 340,6" stroke="#ffb1c5" strokeLinejoin="round" strokeWidth="1.5" />

            <circle cx="160" cy="82" fill="#ffb1c5" r="3.5" stroke="#ffffff" strokeWidth="1.5" />
            <text fill="#ffb1c5" fontFamily="JetBrains Mono" fontSize="8.5" fontWeight="600" x="168" y="80">
              Max {asset.mdd}
            </text>
          </svg>

          <div className="flex justify-between items-center text-code-sm text-[11px] opacity-70 pt-1 px-1">
            <span>0.0% Level</span>
            <span className="text-rose-500 font-semibold">Worst Valley: Q1 2020</span>
            <span>-20.0% Floor</span>
          </div>
        </div>
      </section>

      {/* Risk Summary Card */}
      <section
        className={`rounded-2xl p-3.5 shadow-md flex flex-col gap-2 ${
          isDark ? "bg-surface-container-low/95" : "liquid-glass-card"
        }`}
      >
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary-container text-[18px]">
              security
            </span>
            <span
              className={`font-headline-sm font-semibold ${
                isDark ? "text-on-surface" : "text-text-obsidian"
              }`}
            >
              Institutional Risk Analytics
            </span>
          </div>
          <span
            className={`font-label-caps text-[9px] px-2 py-0.5 rounded-full uppercase font-semibold ${
              isDark
                ? "bg-surface-container-high text-primary-fixed"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}
          >
            Daily Rebalance
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
          <div
            className={`rounded-xl p-2.5 flex flex-col justify-between ${
              isDark
                ? "bg-surface-container-lowest/80"
                : "bg-white/80 border border-slate-200/60 shadow-xs"
            }`}
          >
            <div className="flex items-center justify-between opacity-70 text-xs">
              <span className="font-code-sm">Volatility (Ann.)</span>
              <span className="material-symbols-outlined text-[13px]">cyclone</span>
            </div>
            <div
              className={`font-metric-lg text-lg font-bold mt-1 ${
                isDark ? "text-on-surface" : "text-text-obsidian"
              }`}
            >
              {asset.vol}
            </div>
            <span className="font-label-caps text-[9px] text-primary-container mt-1 font-semibold">
              Benchmark: 15.8%
            </span>
          </div>

          <div
            className={`rounded-xl p-2.5 flex flex-col justify-between ${
              isDark
                ? "bg-surface-container-lowest/80"
                : "bg-white/80 border border-slate-200/60 shadow-xs"
            }`}
          >
            <div className="flex items-center justify-between opacity-70 text-xs">
              <span className="font-code-sm">VaR (95% Daily)</span>
              <span className="material-symbols-outlined text-[13px] text-rose-500">
                crisis_alert
              </span>
            </div>
            <div className="font-metric-lg text-lg font-bold mt-1 text-rose-500">
              {asset.var95}
            </div>
            <span className="font-label-caps text-[9px] opacity-70 mt-1">
              Expected Shortfall: -2.1%
            </span>
          </div>

          <div
            className={`rounded-xl p-2.5 flex flex-col justify-between ${
              isDark
                ? "bg-surface-container-lowest/80"
                : "bg-white/80 border border-slate-200/60 shadow-xs"
            }`}
          >
            <div className="flex items-center justify-between opacity-70 text-xs">
              <span className="font-code-sm">Sortino Ratio</span>
              <span className="material-symbols-outlined text-[13px] text-primary-container">
                vertical_align_top
              </span>
            </div>
            <div className="font-metric-lg text-lg font-bold mt-1 text-emerald-500">
              {asset.sortino}
            </div>
            <span className="font-label-caps text-[9px] text-primary-container mt-1 font-semibold">
              Target: &gt; 1.80
            </span>
          </div>

          <div
            className={`rounded-xl p-2.5 flex flex-col justify-between ${
              isDark
                ? "bg-surface-container-lowest/80"
                : "bg-white/80 border border-slate-200/60 shadow-xs"
            }`}
          >
            <div className="flex items-center justify-between opacity-70 text-xs">
              <span className="font-code-sm">Calmar Ratio</span>
              <span className="material-symbols-outlined text-[13px] text-blue-500">
                stacked_line_chart
              </span>
            </div>
            <div
              className={`font-metric-lg text-lg font-bold mt-1 ${
                isDark ? "text-on-surface" : "text-text-obsidian"
              }`}
            >
              {asset.calmar}
            </div>
            <span className="font-label-caps text-[9px] opacity-70 mt-1">
              MAR Adjusted
            </span>
          </div>
        </div>
      </section>

      {/* Quantitative Notice / Institutional Disclaimer */}
      <section
        className={`rounded-2xl p-3.5 shadow-sm ${
          isDark ? "bg-surface-container-lowest/90" : "liquid-glass-card"
        }`}
      >
        <div className="flex items-start gap-2.5">
          <span className="material-symbols-outlined opacity-60 text-[20px] shrink-0 mt-0.5">
            policy
          </span>
          <div className="flex flex-col gap-1 text-xs">
            <span className="font-label-caps uppercase tracking-wider font-bold opacity-80">
              Institutional Governance Compliance
            </span>
            <p className="font-code-sm text-[11px] leading-relaxed opacity-70">
              FINSHIELD RESEARCH NOTICE: Strictly historical quantitative research analytics. FinShield
              does not provide trade execution, automated orders, or price predictions. Historical
              backtested performance does not guarantee future results.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
