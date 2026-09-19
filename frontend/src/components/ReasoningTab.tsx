import React, { useState } from "react";
import type { AssetTelemetry } from "../data/mockData";
import type { ThemeMode } from "../types";

type ReasoningTabProps = {
  asset: AssetTelemetry;
  theme: ThemeMode;
  onExplainBackend?: (question: string) => void;
};

export const ReasoningTab: React.FC<ReasoningTabProps> = ({
  asset,
  theme,
  onExplainBackend,
}) => {
  const [query, setQuery] = useState(
    `Explain why the Strategy Sharpe Ratio fell during Q3 2022 for ${asset.symbol} and whether transaction cost slippage was the primary driver.`
  );
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationDone, setEvaluationDone] = useState(false);

  const isDark = theme === "dark";
  const charCount = query.length;

  const handleExplain = () => {
    setIsEvaluating(true);
    if (onExplainBackend) {
      onExplainBackend(query);
    }
    setTimeout(() => {
      setIsEvaluating(false);
      setEvaluationDone(true);
      setTimeout(() => setEvaluationDone(false), 2000);
    }, 850);
  };

  const handleClear = () => {
    setQuery("");
  };

  return (
    <div className="flex flex-col w-full space-y-3.5 max-w-4xl mx-auto">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-primary-fixed-dim text-[16px]">
            psychology_alt
          </span>
          <span className="font-label-caps uppercase tracking-wider opacity-70 text-[10px]">
            Quant Reasoning Terminal
          </span>
        </div>
        <div
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-label-caps font-semibold ${
            isDark
              ? "bg-surface-container-high text-primary-fixed"
              : "bg-blue-50 text-blue-700 border border-blue-200"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" />
          <span>LATENCY: 42ms</span>
        </div>
      </div>

      {/* Question Input Console */}
      <div
        className={`flex flex-col rounded-2xl p-3.5 sm:p-4 shadow-md space-y-2.5 relative overflow-hidden ${
          isDark ? "bg-surface-container-low border border-white/5" : "liquid-glass-card"
        }`}
      >
        <div className="flex items-center justify-between text-xs">
          <label
            htmlFor="quantQueryInput"
            className="font-label-caps uppercase opacity-70 flex items-center gap-1 text-[10px]"
          >
            <span className="material-symbols-outlined text-[13px] text-primary-container">
              terminal
            </span>
            Query Model Telemetry
          </label>
          <button
            type="button"
            onClick={handleClear}
            className={`flex items-center gap-1 font-label-caps text-[9px] px-2 py-0.5 rounded transition-colors ${
              isDark
                ? "bg-surface-container text-on-surface-variant hover:text-primary-container"
                : "bg-slate-100 text-slate-600 hover:text-blue-600"
            }`}
          >
            <span className="material-symbols-outlined text-[12px]">backspace</span>
            CLEAR
          </button>
        </div>

        <div className="relative w-full">
          <textarea
            id="quantQueryInput"
            rows={3}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter inquiry regarding model telemetry, volatility drift, or execution slippage..."
            className={`w-full font-body-md text-xs sm:text-sm rounded-xl p-3 focus:outline-none transition-all resize-none ${
              isDark
                ? "bg-surface-container-lowest text-on-surface border border-white/5 focus:bg-surface-container-high"
                : "liquid-glass-input text-text-obsidian"
            }`}
          />
        </div>

        {/* Character Counter & Sanitization Info */}
        <div className="flex items-center justify-between text-[11px] opacity-70">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px] text-primary-container">
              shield_lock
            </span>
            <span>Sanitized context tokens • Zero client leakage</span>
          </div>
          <span
            className={`font-metric-sm font-semibold ${
              charCount > 280 ? "text-rose-400" : "text-primary-container"
            }`}
          >
            {charCount}/300
          </span>
        </div>

        {/* Provenance Banner */}
        <div className="flex flex-col gap-1.5 pt-1 text-xs">
          <div
            className={`flex flex-wrap items-center justify-between gap-1 p-2 rounded-xl ${
              isDark ? "bg-surface-container" : "bg-slate-100/90 border border-slate-200/60"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary-container text-[16px]">
                neurology
              </span>
              <span className="font-label-caps text-[9px] font-semibold">
                SOURCE: Featherless Quantitative LLM (v3.1-quant)
              </span>
            </div>
            <div
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-label-caps ${
                isDark ? "bg-surface-container-highest" : "bg-white text-slate-700 shadow-2xs"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Zero-Data Retention</span>
            </div>
          </div>

          <div
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl ${
              isDark
                ? "bg-surface-container-highest/60"
                : "bg-white/80 border border-slate-200/60 shadow-xs"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-primary-container">
                tune
              </span>
              <span className="font-code-sm text-[10px]">Deterministic Fallback Engine</span>
            </div>
            <span
              className={`font-label-caps text-[8px] px-1.5 py-0.5 rounded font-semibold ${
                isDark ? "bg-surface-container-low text-primary-fixed" : "bg-blue-50 text-blue-700"
              }`}
            >
              READY
            </span>
          </div>
        </div>

        {/* Primary Action CTA */}
        <button
          type="button"
          onClick={handleExplain}
          disabled={isEvaluating}
          className={`w-full flex items-center justify-center gap-1.5 py-2.5 sm:py-3 rounded-xl font-headline-sm text-xs sm:text-sm font-semibold shadow-md active:scale-99 transition-all ${
            isDark
              ? "bg-primary-container text-on-primary-container hover:bg-primary-fixed"
              : "bg-blue-600 text-white hover:bg-blue-700 shadow-[0_4px_16px_rgba(0,102,255,0.25)]"
          }`}
        >
          <span
            className={`material-symbols-outlined text-[18px] ${
              isEvaluating ? "animate-spin" : ""
            }`}
          >
            {isEvaluating ? "sync" : evaluationDone ? "check_circle" : "auto_awesome"}
          </span>
          <span>
            {isEvaluating
              ? "Evaluating Vector Context..."
              : evaluationDone
              ? "Analysis Synchronized"
              : "Explain Results"}
          </span>
        </button>
      </div>

      {/* Structured Telemetry Verdict */}
      <section
        className={`flex flex-col rounded-2xl p-3.5 sm:p-4 space-y-3 shadow-md ${
          isDark ? "bg-surface-container-low border border-white/5" : "liquid-glass-card"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary-container" />
            <h2
              className={`font-headline-md text-xs sm:text-sm font-semibold ${
                isDark ? "text-on-surface" : "text-text-obsidian"
              }`}
            >
              Structured Telemetry Verdict
            </h2>
          </div>
          <span
            className={`font-label-caps text-[9px] px-2 py-0.5 rounded font-semibold ${
              isDark
                ? "text-on-surface-variant bg-surface-container-highest"
                : "text-slate-600 bg-slate-100 border border-slate-200"
            }`}
          >
            ID: AUD-9921-Q3
          </span>
        </div>

        {/* Point 1: Macro Regime */}
        <div
          className={`p-3 rounded-xl space-y-1 text-xs ${
            isDark ? "bg-surface-container" : "bg-white/80 border border-slate-200/60 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-primary-container/20 text-primary-container flex items-center justify-center font-metric-sm text-[10px] font-bold">
                1
              </span>
              <span
                className={`font-headline-sm text-xs font-semibold ${
                  isDark ? "text-on-surface" : "text-text-obsidian"
                }`}
              >
                Regime Context &amp; Volatility Surge
              </span>
            </div>
            <span className="font-metric-sm text-[10px] text-rose-500 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded">
              {asset.verdict.regimeVol}
            </span>
          </div>
          <p className="font-body-md opacity-80 text-[11px] leading-relaxed">
            {asset.verdict.regimeContext}
          </p>
        </div>

        {/* Point 2: Slippage Attribution vs Alpha */}
        <div
          className={`p-3 rounded-xl space-y-2 text-xs ${
            isDark ? "bg-surface-container" : "bg-white/80 border border-slate-200/60 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-primary-container/20 text-primary-container flex items-center justify-center font-metric-sm text-[10px] font-bold">
                2
              </span>
              <span
                className={`font-headline-sm text-xs font-semibold ${
                  isDark ? "text-on-surface" : "text-text-obsidian"
                }`}
              >
                Slippage vs Alpha Decomposition
              </span>
            </div>
            <span className="font-metric-sm text-[10px] text-primary-container font-bold bg-primary-container/10 px-1.5 py-0.5 rounded">
              {asset.verdict.slippageCost}
            </span>
          </div>
          <p className="font-body-md opacity-80 text-[11px] leading-relaxed">
            {asset.verdict.slippageText}
          </p>

          {/* Inline Visual Comparison Spark/Bar */}
          <div
            className={`p-2 rounded-lg space-y-1.5 ${
              isDark
                ? "bg-surface-container-lowest"
                : "bg-slate-100/80 border border-slate-200/60"
            }`}
          >
            <div className="flex justify-between font-label-caps text-[8px] opacity-70">
              <span>DECAY ATTRIBUTION (Q3 2022)</span>
              <span>TOTAL: -218 bps</span>
            </div>
            <div className="w-full h-2 rounded bg-slate-500/20 flex overflow-hidden">
              <div
                className="h-full bg-rose-500"
                style={{ width: `${asset.verdict.signalDrift}%` }}
                title="False Breakout Regime"
              />
              <div
                className="h-full bg-primary-container"
                style={{ width: `${asset.verdict.durationDrag}%` }}
                title="Yield Drag"
              />
              <div
                className="h-full bg-blue-400"
                style={{ width: `${asset.verdict.slippagePct}%` }}
                title="Execution Slippage"
              />
            </div>
            <div className="flex items-center justify-between font-code-sm text-[9px]">
              <span className="text-rose-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                {asset.verdict.signalDrift}% Signal Drift
              </span>
              <span className="text-primary-container flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
                {asset.verdict.durationDrag}% Duration
              </span>
              <span className="opacity-70 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                {asset.verdict.slippagePct}% Slippage ({asset.verdict.slippageCost.replace("COST: ", "")})
              </span>
            </div>
          </div>
        </div>

        {/* Point 3: Robustness & Safety Envelope */}
        <div
          className={`p-3 rounded-xl space-y-1 text-xs ${
            isDark ? "bg-surface-container" : "bg-white/80 border border-slate-200/60 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-primary-container/20 text-primary-container flex items-center justify-center font-metric-sm text-[10px] font-bold">
                3
              </span>
              <span
                className={`font-headline-sm text-xs font-semibold ${
                  isDark ? "text-on-surface" : "text-text-obsidian"
                }`}
              >
                Robustness &amp; Risk Envelope Verdict
              </span>
            </div>
            <span className="font-label-caps text-[9px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded font-semibold">
              COMPLIANT
            </span>
          </div>
          <p className="font-body-md opacity-80 text-[11px] leading-relaxed">
            {asset.verdict.robustnessVerdict}
          </p>
        </div>

        {/* Compliance Notice */}
        <div
          className={`p-2.5 rounded-xl flex items-start gap-2 text-xs ${
            isDark ? "bg-surface-container-highest/40" : "liquid-glass-subtle"
          }`}
        >
          <span className="material-symbols-outlined opacity-60 text-[18px] shrink-0 mt-0.5">
            gavel
          </span>
          <div className="flex flex-col space-y-0.5">
            <span className="font-label-caps uppercase tracking-wider font-semibold text-[9px]">
              Institutional Compliance Notice
            </span>
            <p className="font-body-sm opacity-70 text-[10px] leading-snug">
              NOT FINANCIAL ADVICE: Explanations are deterministic summaries of model metrics.
              FinShield does not predict future prices or provide investment recommendations.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
