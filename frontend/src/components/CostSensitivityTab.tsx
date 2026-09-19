import React, { useState } from "react";
import type { AssetTelemetry } from "../data/mockData";
import type { TabType, ThemeMode } from "../types";

type CostSensitivityTabProps = {
  asset: AssetTelemetry;
  theme: ThemeMode;
  onNavigateTab: (tab: TabType) => void;
};

type ResilienceState = "offline" | "fallback" | "empty" | "missing";

export const CostSensitivityTab: React.FC<CostSensitivityTabProps> = ({
  asset,
  theme,
  onNavigateTab,
}) => {
  const [resilienceState, setResilienceState] = useState<ResilienceState>("offline");
  const [pinging, setPinging] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const isDark = theme === "dark";

  const triggerPing = () => {
    setPinging(true);
    setTimeout(() => setPinging(false), 1200);
  };

  const triggerRetry = () => {
    setRetrying(true);
    setTimeout(() => setRetrying(false), 1400);
  };

  const triggerSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 1400);
  };

  return (
    <div className="flex flex-col w-full space-y-3.5 max-w-4xl mx-auto">
      {/* Transaction Cost Matrix & Capacity Ceiling */}
      <section
        className={`rounded-2xl p-3.5 sm:p-4 shadow-md flex flex-col space-y-3 ${
          isDark ? "bg-surface-container border border-white/5" : "liquid-glass-card"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary-container text-[18px]">
              waterfall_chart
            </span>
            <h2
              className={`font-headline-sm font-semibold tracking-tight ${
                isDark ? "text-on-surface" : "text-text-obsidian"
              }`}
            >
              Cost &amp; Slippage Sensitivity
            </h2>
          </div>
          <span
            className={`font-code-sm text-[10px] px-2 py-0.5 rounded font-semibold ${
              isDark
                ? "text-primary-container bg-surface-container-highest"
                : "text-blue-700 bg-blue-50 border border-blue-200"
            }`}
          >
            FEE MATRIX
          </span>
        </div>

        <p className="font-body-sm text-xs opacity-70 leading-relaxed">
          Comprehensive sensitivity matrix modeling alpha decay against execution slippage tiers and
          brokerage gate commissions for <strong>{asset.name}</strong>.
        </p>

        {/* Cost Table */}
        <div className="overflow-x-auto scrollbar-none pt-1">
          <table className="w-full text-left font-code-sm text-xs border-collapse">
            <thead>
              <tr
                className={`border-b text-[10px] uppercase font-label-caps opacity-60 ${
                  isDark ? "border-white/10" : "border-slate-200"
                }`}
              >
                <th className="py-2 px-2">Slippage Tier</th>
                <th className="py-2 px-2">Net Return</th>
                <th className="py-2 px-2">Sharpe</th>
                <th className="py-2 px-2">Drag</th>
                <th className="py-2 px-2">Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[11px]">
              <tr>
                <td className="py-2 px-2 font-semibold">0 bps (Zero Cost)</td>
                <td className="py-2 px-2 text-primary-container font-bold">+175.4%</td>
                <td className="py-2 px-2">2.04</td>
                <td className="py-2 px-2 opacity-60">0.0%</td>
                <td className="py-2 px-2 text-emerald-500 font-semibold">Idealized</td>
              </tr>
              <tr
                className={
                  isDark ? "bg-surface-container-high/40" : "bg-blue-50/60 font-semibold"
                }
              >
                <td className="py-2 px-2 font-semibold text-primary-container">
                  5 bps (Active Model)
                </td>
                <td className="py-2 px-2 text-primary-container font-bold">+164.2%</td>
                <td className="py-2 px-2">1.84</td>
                <td className="py-2 px-2 text-rose-400">-2.1%</td>
                <td className="py-2 px-2 text-primary-container font-semibold">Production</td>
              </tr>
              <tr>
                <td className="py-2 px-2">15 bps (Stress Tier)</td>
                <td className="py-2 px-2">+138.6%</td>
                <td className="py-2 px-2">1.52</td>
                <td className="py-2 px-2 text-rose-400">-5.8%</td>
                <td className="py-2 px-2 text-emerald-500 font-semibold">Robust</td>
              </tr>
              <tr>
                <td className="py-2 px-2">25 bps (Illiquid)</td>
                <td className="py-2 px-2">+94.2%</td>
                <td className="py-2 px-2">1.18</td>
                <td className="py-2 px-2 text-rose-400">-12.4%</td>
                <td className="py-2 px-2 text-amber-500 font-semibold">Viable</td>
              </tr>
              <tr>
                <td className="py-2 px-2 text-rose-400 font-semibold">50 bps (Breakeven)</td>
                <td className="py-2 px-2 text-rose-400 font-bold">+12.0%</td>
                <td className="py-2 px-2">0.24</td>
                <td className="py-2 px-2 text-rose-400">-34.2%</td>
                <td className="py-2 px-2 text-rose-400 font-semibold">Floor</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Terminal Resilience & States Panel */}
      <section
        className={`flex flex-col rounded-2xl p-3.5 sm:p-4 space-y-3 shadow-md ${
          isDark ? "bg-surface-container-low border border-white/5" : "liquid-glass-card"
        }`}
      >
        <div className="flex flex-col space-y-0.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary-container text-[18px]">
                build_circle
              </span>
              <h2
                className={`font-headline-md text-xs sm:text-sm font-semibold ${
                  isDark ? "text-on-surface" : "text-text-obsidian"
                }`}
              >
                Terminal Resilience &amp; States
              </h2>
            </div>
            <span className="font-label-caps opacity-60 text-[9px]">4 SCENARIOS</span>
          </div>
          <p className="font-body-sm opacity-70 text-[11px]">
            Toggle edge states below to preview automated system failover mechanisms.
          </p>
        </div>

        {/* Diagnostic State Switcher Pills */}
        <div
          className={`grid grid-cols-2 gap-1 p-1 rounded-xl text-xs ${
            isDark
              ? "bg-surface-container-lowest"
              : "bg-slate-100/80 border border-slate-200/60"
          }`}
        >
          <button
            type="button"
            onClick={() => setResilienceState("offline")}
            className={`py-1.5 px-2 rounded-lg font-label-caps text-[9px] font-semibold flex items-center justify-center gap-1 transition-all ${
              resilienceState === "offline"
                ? isDark
                  ? "bg-surface-container-high text-primary-container shadow-xs"
                  : "bg-white text-blue-600 shadow-xs border border-slate-200"
                : "opacity-70 hover:opacity-100"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>1. Backend Offline</span>
          </button>
          <button
            type="button"
            onClick={() => setResilienceState("fallback")}
            className={`py-1.5 px-2 rounded-lg font-label-caps text-[9px] font-semibold flex items-center justify-center gap-1 transition-all ${
              resilienceState === "fallback"
                ? isDark
                  ? "bg-surface-container-high text-primary-container shadow-xs"
                  : "bg-white text-blue-600 shadow-xs border border-slate-200"
                : "opacity-70 hover:opacity-100"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
            <span>2. LLM Fallback</span>
          </button>
          <button
            type="button"
            onClick={() => setResilienceState("empty")}
            className={`py-1.5 px-2 rounded-lg font-label-caps text-[9px] font-semibold flex items-center justify-center gap-1 transition-all ${
              resilienceState === "empty"
                ? isDark
                  ? "bg-surface-container-high text-primary-container shadow-xs"
                  : "bg-white text-blue-600 shadow-xs border border-slate-200"
                : "opacity-70 hover:opacity-100"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>3. Empty Lab</span>
          </button>
          <button
            type="button"
            onClick={() => setResilienceState("missing")}
            className={`py-1.5 px-2 rounded-lg font-label-caps text-[9px] font-semibold flex items-center justify-center gap-1 transition-all ${
              resilienceState === "missing"
                ? isDark
                  ? "bg-surface-container-high text-primary-container shadow-xs"
                  : "bg-white text-blue-600 shadow-xs border border-slate-200"
                : "opacity-70 hover:opacity-100"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            <span>4. Data Missing</span>
          </button>
        </div>

        {/* State View Container */}
        <div
          className={`min-h-[160px] rounded-xl p-4 flex flex-col items-center justify-center text-center ${
            isDark
              ? "bg-surface-container"
              : "bg-white/90 border border-slate-200/60 shadow-xs"
          }`}
        >
          {/* State 1: Offline */}
          {resilienceState === "offline" && (
            <div className="flex flex-col items-center space-y-2 max-w-xs animate-fadeIn">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">wifi_off</span>
              </div>
              <div className="flex flex-col space-y-0.5">
                <span
                  className={`font-headline-sm text-xs font-semibold ${
                    isDark ? "text-on-surface" : "text-text-obsidian"
                  }`}
                >
                  Remote Host Unreachable
                </span>
                <p className="font-body-sm opacity-70 text-[11px]">
                  Telemetry socket connection dropped (503 Gateway Timeout). Network handshake halted.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-1 text-xs">
                <button
                  type="button"
                  onClick={triggerPing}
                  className={`px-3 py-1.5 font-label-caps text-[9px] rounded-lg flex items-center gap-1 transition-all active:scale-95 ${
                    isDark
                      ? "bg-surface-container-highest text-on-surface hover:bg-surface-bright"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                  }`}
                >
                  <span className={`material-symbols-outlined text-[14px] ${pinging ? "animate-spin" : ""}`}>
                    sensors
                  </span>
                  <span>{pinging ? "0.38ms OK" : "PING HOST"}</span>
                </button>
                <button
                  type="button"
                  onClick={triggerRetry}
                  className={`px-3 py-1.5 font-label-caps text-[9px] rounded-lg flex items-center gap-1 shadow-sm transition-all active:scale-95 ${
                    isDark
                      ? "bg-primary-container text-on-primary-container"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  <span className={`material-symbols-outlined text-[14px] ${retrying ? "animate-spin" : ""}`}>
                    refresh
                  </span>
                  <span>{retrying ? "ONLINE" : "RETRY CONNECTION"}</span>
                </button>
              </div>
            </div>
          )}

          {/* State 2: LLM Fallback */}
          {resilienceState === "fallback" && (
            <div className="flex flex-col items-center space-y-2 max-w-xs animate-fadeIn">
              <div className="w-10 h-10 rounded-full bg-primary-container/20 text-primary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">swap_calls</span>
              </div>
              <div className="flex flex-col space-y-0.5">
                <span
                  className={`font-headline-sm text-xs font-semibold ${
                    isDark ? "text-on-surface" : "text-text-obsidian"
                  }`}
                >
                  Switched to Deterministic Fallback
                </span>
                <p className="font-body-sm opacity-70 text-[11px]">
                  Featherless cluster offline. Quantitative risk matrices generated using local
                  deterministic algebra pipeline.
                </p>
              </div>
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-primary-container font-code-sm text-[10px] font-semibold ${
                  isDark ? "bg-surface-container-lowest" : "bg-blue-50 border border-blue-200"
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">verified</span>
                <span>Core quantitative metrics verified</span>
              </div>
            </div>
          )}

          {/* State 3: Empty Lab */}
          {resilienceState === "empty" && (
            <div className="flex flex-col items-center space-y-2 max-w-xs animate-fadeIn">
              <div className="w-10 h-10 rounded-full bg-slate-500/20 opacity-70 flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">science</span>
              </div>
              <div className="flex flex-col space-y-0.5">
                <span
                  className={`font-headline-sm text-xs font-semibold ${
                    isDark ? "text-on-surface" : "text-text-obsidian"
                  }`}
                >
                  No Backtest Telemetry Run Yet
                </span>
                <p className="font-body-sm opacity-70 text-[11px]">
                  Configure parameters in Strategy Lab to generate reliability data and initiate Sharpe
                  audit.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab("strategy-lab")}
                className={`px-3 py-1.5 font-label-caps text-[9px] rounded-lg flex items-center gap-1 transition-colors ${
                  isDark
                    ? "bg-surface-container-high text-primary-fixed hover:bg-surface-bright"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">tune</span>
                <span>LAUNCH STRATEGY LAB</span>
              </button>
            </div>
          )}

          {/* State 4: Missing Data */}
          {resilienceState === "missing" && (
            <div className="flex flex-col items-center space-y-2 max-w-xs animate-fadeIn">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">dataset_linked</span>
              </div>
              <div className="flex flex-col space-y-0.5">
                <span
                  className={`font-headline-sm text-xs font-semibold ${
                    isDark ? "text-on-surface" : "text-text-obsidian"
                  }`}
                >
                  Historical Data Gap Detected
                </span>
                <p className="font-body-sm opacity-70 text-[11px]">
                  Tick timestamps in {asset.symbol} from 2022-08-14 to 2022-08-28 are incomplete in
                  cache storage.
                </p>
              </div>
              <button
                type="button"
                onClick={triggerSync}
                className="px-3 py-1.5 bg-rose-500 text-white font-label-caps text-[9px] rounded-lg flex items-center gap-1 shadow-sm transition-all active:scale-95"
              >
                <span className={`material-symbols-outlined text-[14px] ${syncing ? "animate-spin" : ""}`}>
                  cloud_sync
                </span>
                <span>{syncing ? "CACHED" : "RE-INGEST HISTORICAL TICKS"}</span>
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
