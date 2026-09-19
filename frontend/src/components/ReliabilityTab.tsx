import React, { useState } from "react";
import type { AssetTelemetry } from "../data/mockData";
import type { ThemeMode } from "../types";

type ReliabilityTabProps = {
  asset: AssetTelemetry;
  theme: ThemeMode;
};

export const ReliabilityTab: React.FC<ReliabilityTabProps> = ({ asset, theme }) => {
  const [exporting, setExporting] = useState(false);
  const isDark = theme === "dark";

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(
          JSON.stringify(
            {
              protocol: "Reliability Protocol v4.2",
              audit_hash: "#7F02-XQ89-2024",
              asset: asset.symbol,
              trust_score: asset.trust,
              folds: asset.folds,
              macro_regimes: asset.regimes,
              timestamp: new Date().toISOString(),
            },
            null,
            2
          )
        );
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `FinShield_${asset.symbol}_ReliabilityAudit.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }, 1000);
  };

  return (
    <div className="flex flex-col w-full space-y-3.5 max-w-4xl mx-auto">
      {/* Protocol Banner */}
      <div
        className={`flex items-center justify-between rounded-xl px-3.5 py-2 shadow-xs text-xs ${
          isDark
            ? "bg-surface-container-low border border-white/5"
            : "liquid-glass-card"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="material-symbols-outlined text-primary-container text-[18px] shrink-0"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            verified_user
          </span>
          <div className="flex flex-col min-w-0">
            <span
              className={`font-headline-sm text-xs truncate leading-tight font-semibold ${
                isDark ? "text-on-surface" : "text-text-obsidian"
              }`}
            >
              Reliability Protocol v4.2
            </span>
            <span className="font-code-sm opacity-60 text-[10px] truncate">
              AUDIT HASH: #7F02-XQ89-2024
            </span>
          </div>
        </div>
        <div
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-label-caps font-semibold ${
            isDark
              ? "bg-surface-container-high text-primary-fixed"
              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="tracking-wider uppercase">CERTIFIED</span>
        </div>
      </div>

      {/* Trust Score Master Section */}
      <div
        className={`relative overflow-hidden rounded-2xl p-3.5 sm:p-4 shadow-md flex flex-col gap-3 ${
          isDark ? "bg-surface-container-low border border-white/5" : "liquid-glass-card"
        }`}
      >
        <div className="flex items-start justify-between relative z-10">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="font-label-caps text-[9px] opacity-70 uppercase tracking-widest font-semibold">
                QUANT TRUST INDEX
              </span>
              <span className="inline-flex items-center px-1 py-0.5 rounded text-[9px] font-label-caps bg-primary-container/10 text-primary-container font-semibold">
                IS/OOS AUDITED
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-display-lg text-3xl font-bold text-primary-fixed">
                {asset.trust}
              </span>
              <span className="font-headline-md opacity-60 text-sm">/ 100</span>
            </div>
            <div className="inline-flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-primary-container" />
              <span className="font-headline-sm text-xs font-semibold text-primary">
                Institutional High Reliability
              </span>
            </div>
          </div>

          {/* Dial Gauge */}
          <div className="relative w-18 h-18 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 72 72">
              <circle
                className={isDark ? "text-surface-container-highest" : "text-slate-100"}
                cx="36"
                cy="36"
                fill="transparent"
                r="28"
                stroke="currentColor"
                strokeWidth="5"
              />
              <circle
                className="text-primary-container transition-all duration-1000 ease-out"
                cx="36"
                cy="36"
                fill="transparent"
                r="28"
                stroke="currentColor"
                strokeDasharray="175.93"
                strokeDashoffset={175.93 - (175.93 * asset.trust) / 100}
                strokeLinecap="round"
                strokeWidth="5.5"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span
                className="material-symbols-outlined text-[18px] text-primary-container"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                security
              </span>
              <span className="font-label-caps opacity-70 text-[8px]">PBO 0.12</span>
            </div>
          </div>
        </div>

        {/* Subscore Breakdown Grid */}
        <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
          <div
            className={`p-2.5 rounded-xl flex flex-col gap-1 ${
              isDark
                ? "bg-surface-container-high/70"
                : "bg-white/80 border border-slate-200/60 shadow-xs"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-[9px] opacity-70">PBO OVERFIT</span>
              <span className="font-code-sm text-emerald-500 font-semibold text-[10px]">
                Low Risk
              </span>
            </div>
            <span className="font-metric-lg text-base font-bold">0.12</span>
            <div className="w-full bg-slate-500/20 h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary-container h-full rounded-full" style={{ width: "12%" }} />
            </div>
            <span className="font-body-sm opacity-60 text-[10px]">
              Probability deflation threshold
            </span>
          </div>

          <div
            className={`p-2.5 rounded-xl flex flex-col gap-1 ${
              isDark
                ? "bg-surface-container-high/70"
                : "bg-white/80 border border-slate-200/60 shadow-xs"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-[9px] opacity-70">PARAM STABILITY</span>
              <span className="font-code-sm text-primary-container font-semibold text-[10px]">
                92%
              </span>
            </div>
            <span className="font-metric-lg text-base font-bold">92/100</span>
            <div className="w-full bg-slate-500/20 h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary-container h-full rounded-full" style={{ width: "92%" }} />
            </div>
            <span className="font-body-sm opacity-60 text-[10px]">
              Hyperspace plateau test
            </span>
          </div>

          <div
            className={`p-2.5 rounded-xl flex flex-col gap-1 ${
              isDark
                ? "bg-surface-container-high/70"
                : "bg-white/80 border border-slate-200/60 shadow-xs"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-[9px] opacity-70">OOS DECAY</span>
              <span className="font-code-sm text-emerald-500 font-semibold text-[10px]">
                Safe &lt;10%
              </span>
            </div>
            <span className="font-metric-lg text-base font-bold">6.4%</span>
            <div className="w-full bg-slate-500/20 h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary-container h-full rounded-full" style={{ width: "64%" }} />
            </div>
            <span className="font-body-sm opacity-60 text-[10px]">
              Annualized alpha leak
            </span>
          </div>

          <div
            className={`p-2.5 rounded-xl flex flex-col gap-1 ${
              isDark
                ? "bg-surface-container-high/70"
                : "bg-white/80 border border-slate-200/60 shadow-xs"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-[9px] opacity-70">COMPLETENESS</span>
              <span className="font-code-sm opacity-70 text-[10px]">2014-2024</span>
            </div>
            <span className="font-metric-lg text-base font-bold">99.8%</span>
            <div className="w-full bg-slate-500/20 h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary-container h-full rounded-full" style={{ width: "99.8%" }} />
            </div>
            <span className="font-body-sm opacity-60 text-[10px]">
              10Y daily audit coverage
            </span>
          </div>
        </div>
      </div>

      {/* Walk-Forward 5-Fold Validation Grid */}
      <div
        className={`flex flex-col gap-2.5 rounded-2xl p-3.5 sm:p-4 shadow-sm ${
          isDark ? "bg-surface-container-low border border-white/5" : "liquid-glass-card"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-primary-container">
              alt_route
            </span>
            <span
              className={`font-headline-sm font-semibold ${
                isDark ? "text-on-surface" : "text-text-obsidian"
              }`}
            >
              Walk-Forward 5-Fold Validation
            </span>
          </div>
          <span className="font-label-caps text-[9px] opacity-60">ROLLING ANCHOR</span>
        </div>

        {/* Sharpe Comparison Badges */}
        <div
          className={`grid grid-cols-2 gap-2 p-2 rounded-xl ${
            isDark
              ? "bg-surface-container-high/50"
              : "bg-slate-100/80 border border-slate-200/60"
          }`}
        >
          <div className="flex items-center justify-between px-2">
            <div className="flex flex-col">
              <span className="font-label-caps opacity-70 text-[9px]">IN-SAMPLE (IS)</span>
              <span className="font-metric-lg text-sm sm:text-base font-bold">1.84</span>
            </div>
            <span className="material-symbols-outlined opacity-60 text-[18px]">science</span>
          </div>
          <div
            className={`flex items-center justify-between px-2 rounded-lg p-1 ${
              isDark ? "bg-surface-container-highest/60" : "bg-white shadow-xs"
            }`}
          >
            <div className="flex flex-col">
              <span className="font-label-caps text-primary-container font-semibold text-[9px]">
                OUT-OF-SAMPLE (OOS)
              </span>
              <span className="font-metric-lg text-sm sm:text-base font-bold text-primary-container">
                1.62
              </span>
            </div>
            <span
              className="material-symbols-outlined text-primary-container text-[18px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          </div>
        </div>

        {/* 5 Folds Bars */}
        <div className="flex flex-col gap-1.5 pt-1 text-xs">
          <div className="flex items-center justify-between opacity-70 font-label-caps text-[9px]">
            <span>FOLD TEST INTERVAL</span>
            <span>EXCESS RETURN</span>
          </div>
          {asset.folds.map((f) => (
            <div
              key={f.fold}
              className={`flex items-center gap-2 p-1.5 rounded-lg ${
                isDark
                  ? "bg-surface-container-high/40"
                  : "bg-white/80 border border-slate-200/50 shadow-2xs"
              }`}
            >
              <span className="font-code-sm opacity-70 w-12 shrink-0 text-[10px]">
                {f.fold}
              </span>
              <div className="flex-1 bg-slate-500/20 h-2 rounded-full overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all ${
                    f.positive ? "bg-primary-container" : "bg-rose-500 ml-auto"
                  }`}
                  style={{ width: `${f.width}%` }}
                />
              </div>
              <span
                className={`font-metric-sm text-[11px] font-semibold w-10 text-right ${
                  f.positive ? "text-primary-container" : "text-rose-500"
                }`}
              >
                {f.excess}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Friction & Slippage Curve */}
      <div
        className={`flex flex-col gap-2.5 rounded-2xl p-3.5 sm:p-4 shadow-sm ${
          isDark ? "bg-surface-container-low border border-white/5" : "liquid-glass-card"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-primary-container">
              waterfall_chart
            </span>
            <span
              className={`font-headline-sm font-semibold ${
                isDark ? "text-on-surface" : "text-text-obsidian"
              }`}
            >
              Friction &amp; Slippage Curve
            </span>
          </div>
          <span className="font-label-caps text-[9px] opacity-60">BREAKEVEN 50bps</span>
        </div>

        <div
          className={`relative w-full h-32 rounded-xl p-2.5 flex flex-col justify-between overflow-hidden ${
            isDark
              ? "bg-surface-container-high/50"
              : "bg-white/85 border border-slate-200/60 shadow-xs"
          }`}
        >
          <div className="flex justify-between items-center opacity-70 font-label-caps text-[9px] z-10">
            <span>EST. CUMULATIVE RETURN</span>
            <span className="text-primary-container font-code-sm font-bold">ALPHA RESILIENT</span>
          </div>

          <div className="relative w-full h-20">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 320 80">
              <defs>
                <linearGradient id="costGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={isDark ? "#00f0ff" : "#0066ff"} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={isDark ? "#00f0ff" : "#0066ff"} stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <line stroke={isDark ? "#3b494b" : "#e2e8f0"} strokeDasharray="3 3" x1="0" x2="320" y1="20" y2="20" />
              <line stroke={isDark ? "#3b494b" : "#e2e8f0"} strokeDasharray="3 3" x1="0" x2="320" y1="50" y2="50" />
              <line stroke="#e30071" strokeDasharray="2 2" x1="0" x2="320" y1="72" y2="72" />

              <polygon fill="url(#costGrad)" points="0,8 80,14 160,26 240,46 320,72 320,80 0,80" />
              <polyline fill="none" points="0,8 80,14 160,26 240,46 320,72" stroke={isDark ? "#00f0ff" : "#0066ff"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />

              <circle cx="0" cy="8" r="3.5" fill={isDark ? "#00f0ff" : "#0066ff"} />
              <circle cx="80" cy="14" r="3.5" fill={isDark ? "#00f0ff" : "#0066ff"} />
              <circle cx="160" cy="26" r="3.5" fill={isDark ? "#00f0ff" : "#0066ff"} />
              <circle cx="240" cy="46" r="3.5" fill={isDark ? "#00f0ff" : "#0066ff"} />
              <circle cx="320" cy="72" r="4" fill="#e30071" />
            </svg>
          </div>

          <div className="flex justify-between items-center opacity-70 font-label-caps text-[9px] pt-1 z-10">
            <span>0 bps</span>
            <span>5 bps</span>
            <span>15 bps</span>
            <span>25 bps</span>
            <span className="text-rose-500 font-bold">50 bps (BE)</span>
          </div>
        </div>

        {/* Matrix Row */}
        <div className="grid grid-cols-5 gap-1 text-center pt-0.5 text-xs">
          <div
            className={`rounded-lg p-1.5 flex flex-col ${
              isDark ? "bg-surface-container-high/60" : "bg-white border border-slate-200"
            }`}
          >
            <span className="font-label-caps opacity-60 text-[8px]">0 bps</span>
            <span className="font-code-sm text-primary-container font-semibold text-[10px]">
              +175%
            </span>
          </div>
          <div
            className={`rounded-lg p-1.5 flex flex-col ${
              isDark ? "bg-surface-container-high/60" : "bg-white border border-slate-200"
            }`}
          >
            <span className="font-label-caps opacity-60 text-[8px]">5 bps</span>
            <span className="font-code-sm text-primary-container font-semibold text-[10px]">
              +164%
            </span>
          </div>
          <div
            className={`rounded-lg p-1.5 flex flex-col ${
              isDark ? "bg-surface-container-high/60" : "bg-white border border-slate-200"
            }`}
          >
            <span className="font-label-caps opacity-60 text-[8px]">15 bps</span>
            <span className="font-code-sm text-primary-container font-semibold text-[10px]">
              +138%
            </span>
          </div>
          <div
            className={`rounded-lg p-1.5 flex flex-col ${
              isDark ? "bg-surface-container-high/60" : "bg-white border border-slate-200"
            }`}
          >
            <span className="font-label-caps opacity-60 text-[8px]">25 bps</span>
            <span className="font-code-sm font-semibold text-[10px]">+94%</span>
          </div>
          <div
            className={`rounded-lg p-1.5 flex flex-col ${
              isDark ? "bg-secondary-container/20" : "bg-rose-50 border border-rose-200"
            }`}
          >
            <span className="font-label-caps text-rose-500 font-medium text-[8px]">
              50 bps
            </span>
            <span className="font-code-sm text-rose-500 font-bold text-[10px]">+12%</span>
          </div>
        </div>
      </div>

      {/* Macro Regime Stress Testing Table */}
      <div
        className={`flex flex-col gap-2 rounded-2xl p-3.5 sm:p-4 shadow-sm ${
          isDark ? "bg-surface-container-low border border-white/5" : "liquid-glass-card"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-primary-container">
              thermostat
            </span>
            <span
              className={`font-headline-sm font-semibold ${
                isDark ? "text-on-surface" : "text-text-obsidian"
              }`}
            >
              Macro Regime Stress Testing
            </span>
          </div>
          <span className="font-code-sm opacity-60 text-[10px]">4 PHASES</span>
        </div>

        <div className="flex flex-col gap-1.5 text-xs">
          {asset.regimes.map((reg) => (
            <div
              key={reg.title}
              className={`flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                isDark
                  ? "bg-surface-container-high/60 hover:bg-surface-container-high"
                  : "bg-white/80 border border-slate-200/60 hover:bg-white shadow-xs"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-1.5 h-6 rounded-full ${reg.color} shrink-0`} />
                <div className="flex flex-col min-w-0">
                  <span
                    className={`font-headline-sm text-xs font-semibold truncate ${
                      isDark ? "text-on-surface" : "text-text-obsidian"
                    }`}
                  >
                    {reg.title}
                  </span>
                  <span className="font-label-caps opacity-60 text-[9px] truncate">
                    {reg.period}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex flex-col items-end">
                  <span className="font-metric-md font-bold text-primary-container text-xs">
                    {reg.ret}
                  </span>
                  <span className="font-label-caps opacity-60 text-[9px]">
                    Sharpe {reg.sharpe}
                  </span>
                </div>
                <span className="material-symbols-outlined text-[16px] text-primary-container">
                  {reg.icon}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Integrity & Audit Telemetry Ledger */}
      <div
        className={`flex flex-col gap-2 rounded-2xl p-3.5 sm:p-4 shadow-sm ${
          isDark ? "bg-surface-container-low border border-white/5" : "liquid-glass-card"
        }`}
      >
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-primary-container text-[18px]">
            rule
          </span>
          <span
            className={`font-headline-sm font-semibold ${
              isDark ? "text-on-surface" : "text-text-obsidian"
            }`}
          >
            Data Integrity Audit
          </span>
        </div>
        <div
          className={`rounded-xl p-2.5 flex items-start gap-2 text-xs ${
            isDark ? "bg-surface-container-highest/60" : "liquid-glass-subtle"
          }`}
        >
          <span className="material-symbols-outlined opacity-60 text-[18px] shrink-0 mt-0.5">
            info
          </span>
          <div className="flex flex-col gap-0.5">
            <span
              className={`font-body-md font-semibold text-xs ${
                isDark ? "text-on-surface" : "text-text-obsidian"
              }`}
            >
              Forward-fill with Liquidity Filter
            </span>
            <span className="font-body-sm opacity-70 text-[11px] leading-normal">
              Missing data handling applied forward-fill mechanics coupled to high-frequency volume
              filters. Illiquid sessions omitted with verified audit log.
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-label-caps text-[10px] tracking-wider uppercase font-semibold transition-all shadow-xs active:scale-98 ${
            isDark
              ? "bg-surface-container-high hover:bg-surface-container-highest text-on-surface"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <span className="material-symbols-outlined text-[16px] text-primary-container">
            {exporting ? "progress_activity" : "file_download"}
          </span>
          <span>
            {exporting
              ? "GENERATING SHA-256 MANIFEST..."
              : "Export Full Quantitative Audit Log (JSON)"}
          </span>
        </button>
      </div>

      {/* Institutional Disclaimer */}
      <div
        className={`rounded-2xl p-3 flex items-start gap-2 text-xs ${
          isDark ? "bg-surface-container-lowest/80" : "liquid-glass-subtle"
        }`}
      >
        <span className="material-symbols-outlined text-rose-400 text-[18px] shrink-0 mt-0.5">
          warning
        </span>
        <div className="flex flex-col gap-0.5">
          <span className="font-label-caps text-rose-400 uppercase tracking-wider font-semibold text-[9px]">
            Institutional Regulatory Notice
          </span>
          <p className="font-code-sm opacity-70 text-[10px] leading-relaxed">
            ALL METRICS COMPUTED FROM HISTORICAL AUDITED DATA. PAST RELIABILITY DOES NOT GUARANTEE
            LIVE EXECUTION STABILITY. SLIPPAGE AND LATENCY IN REAL-WORLD BROKERAGE GATES MAY CAUSE
            VARIANCES.
          </p>
        </div>
      </div>
    </div>
  );
};
