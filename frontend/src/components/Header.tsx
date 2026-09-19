import React from "react";
import type { ThemeMode } from "../types";

type HeaderProps = {
  theme: ThemeMode;
  onToggleTheme: () => void;
  activeAsset: string;
  onSelectAsset: (symbol: string) => void;
  availableAssets: { symbol: string; name: string }[];
  currentTabName: string;
  isNominal?: boolean;
  onRefresh?: () => void;
};

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  activeAsset,
  onSelectAsset,
  availableAssets,
  currentTabName,
  isNominal = true,
  onRefresh,
}) => {
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    if (onRefresh) onRefresh();
    setTimeout(() => setRefreshing(false), 750);
  };

  const isDark = theme === "dark";

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 pt-safe transition-all duration-200 ${
        isDark
          ? "bg-[#0a0e18]/90 backdrop-blur-xl border-b border-[#262a35] shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
          : "bg-white/80 backdrop-blur-2xl border-b border-slate-200/80 shadow-[0_4px_24px_rgba(15,23,42,0.05)]"
      }`}
    >
      <div className="h-28 px-3 sm:px-4 flex flex-col justify-between py-1 max-w-7xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-2">
          {/* Brand Logo */}
          <div className="flex items-center gap-2">
            <svg
              className="h-8 w-auto shrink-0"
              viewBox="0 0 160 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="shield-icon">
                <path
                  d="M20 4L7 9V19C7 27.5 12.5 35.3 20 37.5C27.5 35.3 33 27.5 33 19V9L20 4Z"
                  stroke={isDark ? "#00F0FF" : "#0066ff"}
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  fill={isDark ? "rgba(0, 240, 255, 0.08)" : "rgba(0, 102, 255, 0.08)"}
                />
                <path
                  d="M14 20L18.5 24.5L26 15"
                  stroke={isDark ? "#00F0FF" : "#0066ff"}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="20" cy="8" r="1.5" fill="#FF2A85" />
              </g>
              <text
                x="44"
                y="26"
                fill={isDark ? "#FFFFFF" : "#0F172A"}
                fontFamily="Inter, -apple-system, sans-serif"
                fontWeight="700"
                fontSize="20"
                letterSpacing="-0.02em"
              >
                Fin<tspan fill={isDark ? "#00F0FF" : "#0066ff"}>Shield</tspan>
              </text>
              <rect
                x="124"
                y="14"
                width="28"
                height="13"
                rx="3"
                fill={isDark ? "rgba(0, 240, 255, 0.15)" : "rgba(0, 102, 255, 0.12)"}
                stroke={isDark ? "rgba(0, 240, 255, 0.4)" : "rgba(0, 102, 255, 0.35)"}
                strokeWidth="0.75"
              />
              <text
                x="128"
                y="23.5"
                fill={isDark ? "#00F0FF" : "#0066ff"}
                fontFamily="Inter, sans-serif"
                fontSize="8"
                fontWeight="600"
                letterSpacing="0.05em"
              >
                QUANT
              </text>
            </svg>
            <div className="hidden sm:flex flex-col">
              <span
                className={`font-headline-sm text-[13px] tracking-tight leading-tight ${
                  isDark ? "text-on-surface" : "text-text-obsidian"
                }`}
              >
                FinShield
              </span>
              <span
                className={`font-label-caps text-[9px] uppercase tracking-wider ${
                  isDark ? "text-on-surface-variant" : "text-text-muted"
                }`}
              >
                QUANTITATIVE TERMINAL
              </span>
            </div>
          </div>

          {/* Controls: Status, Theme Toggle, Refresh, User */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Nominal Status Pill */}
            <div
              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${
                isDark
                  ? "bg-surface-container-high/80 text-primary-fixed border border-primary-container/20"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isNominal
                    ? isDark
                      ? "bg-primary-container animate-pulse"
                      : "bg-emerald-500 animate-pulse"
                    : "bg-amber-500"
                }`}
              />
              <span className="font-label-caps tracking-wider text-[10px]">
                {isNominal ? "NOMINAL" : "CONNECTING"}
              </span>
            </div>

            {/* Theme Switcher Button */}
            <button
              aria-label="Toggle Dark / Light Liquid Glass Theme"
              type="button"
              onClick={onToggleTheme}
              className={`h-8 px-2.5 flex items-center gap-1 rounded-lg text-xs font-medium transition-all ${
                isDark
                  ? "bg-surface-container text-primary-fixed hover:bg-surface-container-high border border-outline-variant/60"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
              }`}
              title={`Switch to ${isDark ? "Light Liquid Glass" : "Dark Cyber Quant"} mode`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isDark ? "light_mode" : "dark_mode"}
              </span>
              <span className="hidden md:inline font-code-sm text-[10px]">
                {isDark ? "LIQUID GLASS" : "CYBER DARK"}
              </span>
            </button>

            {/* Refresh Button */}
            <button
              aria-label="Refresh Terminal Data"
              type="button"
              onClick={handleRefresh}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                isDark
                  ? "text-on-surface-variant hover:text-primary-container hover:bg-surface-container"
                  : "text-slate-500 hover:text-blue-600 hover:bg-slate-100"
              }`}
              title="Refresh Terminal Data"
            >
              <span
                className={`material-symbols-outlined text-[18px] ${
                  refreshing ? "animate-spin text-primary-container" : ""
                }`}
              >
                refresh
              </span>
            </button>

            {/* Avatar Badge */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                isDark
                  ? "bg-primary-container text-on-primary-container font-bold"
                  : "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-semibold"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
          </div>
        </div>

        {/* Subheader Asset Quick-Bar */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto py-1 scrollbar-none border-t border-dashed border-white/10">
          <div className="flex items-center gap-1.5 shrink-0">
            {availableAssets.map((asset) => {
              const active = asset.symbol === activeAsset;
              return (
                <button
                  key={asset.symbol}
                  type="button"
                  onClick={() => onSelectAsset(asset.symbol)}
                  className={`font-code-sm text-code-sm px-2.5 py-1 rounded transition-all ${
                    active
                      ? isDark
                        ? "bg-surface-container-high text-primary-container font-semibold shadow-xs border border-primary-container/40"
                        : "bg-primary-container text-white font-semibold shadow-sm"
                      : isDark
                      ? "bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                      : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                  }`}
                >
                  {asset.symbol}
                </button>
              );
            })}
          </div>

          <div
            className={`flex items-center gap-2 shrink-0 text-xs ${
              isDark ? "text-on-surface-variant" : "text-slate-500"
            }`}
          >
            <span className="font-label-caps text-[10px]">1Y DLY</span>
            <span
              className={`font-code-sm font-semibold text-[11px] ${
                isDark ? "text-primary-fixed" : "text-blue-600"
              }`}
            >
              {currentTabName}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
