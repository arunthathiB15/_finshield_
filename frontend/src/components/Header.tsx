import React from "react";
import type { ThemeMode } from "../types";

type HeaderProps = {
  theme: ThemeMode;
  isApiConnected: boolean;
  onRefresh?: () => void;
};

export const Header: React.FC<HeaderProps> = ({
  theme,
  isApiConnected,
  onRefresh,
}) => {
  const [refreshing, setRefreshing] = React.useState(false);
  const isDark = theme === "dark";

  const handleRefresh = () => {
    setRefreshing(true);
    if (onRefresh) onRefresh();
    setTimeout(() => setRefreshing(false), 750);
  };

  return (
    <header
      className={`finshield-header fixed top-0 inset-x-0 z-50 pt-safe transition-all duration-200 ${
        isDark
          ? "bg-background border-b border-outline-variant"
          : "bg-background border-b border-outline-variant"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 py-2.5 flex items-center justify-between gap-4">
        {/* Brand Left */}
        <div className="flex items-center gap-3">
          <svg
            className="h-8 w-auto shrink-0"
            viewBox="0 0 160 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g id="shield-icon">
              <path
                d="M20 4L7 9V19C7 27.5 12.5 35.3 20 37.5C27.5 35.3 33 27.5 33 19V9L20 4Z"
                stroke="#647D88"
                strokeWidth="2.5"
                strokeLinejoin="round"
                fill="rgba(100, 125, 136, 0.12)"
              />
              <path
                d="M14 20L18.5 24.5L26 15"
                stroke="#647D88"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="20" cy="8" r="1.5" fill="#9D8750" />
            </g>
            <text
              x="44"
              y="26"
              fill="#E6E9E8"
              fontFamily="Inter, -apple-system, sans-serif"
              fontWeight="700"
              fontSize="20"
              letterSpacing="-0.02em"
            >
              Fin<tspan fill="#647D88">Shield</tspan>
            </text>
            <rect
              x="124"
              y="14"
              width="28"
              height="13"
              rx="3"
              fill="rgba(100, 125, 136, 0.18)"
              stroke="rgba(100, 125, 136, 0.55)"
              strokeWidth="0.75"
            />
            <text
              x="128"
              y="23.5"
              fill="#647D88"
              fontFamily="Inter, sans-serif"
              fontSize="8"
              fontWeight="600"
              letterSpacing="0.05em"
            >
              QUANT
            </text>
          </svg>

          <div className="hidden sm:flex flex-col">
            <span className="text-[10px] font-extrabold tracking-widest uppercase text-blue-600 dark:text-primary-container">
              QUANTITATIVE INTELLIGENCE PLATFORM
            </span>
            <span className={`text-xs ${isDark ? "text-on-surface-variant" : "text-slate-500"}`}>
              Don&apos;t just backtest. Stress-test.
            </span>
          </div>
        </div>

        {/* Status & Controls Right */}
        <div className="flex items-center gap-2.5">
          {/* API Status */}
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
              isApiConnected
                ? isDark
                  ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/30"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : isDark
                ? "bg-amber-950/40 text-amber-400 border border-amber-500/30"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isApiConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              }`}
            />
            <span className="font-label-caps text-[10px] uppercase tracking-wider">
              {isApiConnected ? "API Connected" : "Local Data Ready"}
            </span>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors ${
              isDark
                ? "text-on-surface-variant hover:text-primary-container hover:bg-white/5"
                : "text-slate-500 hover:text-blue-600 hover:bg-slate-100"
            }`}
            title="Refresh Terminal Data"
          >
            <span className={`material-symbols-outlined text-[18px] ${refreshing ? "animate-spin" : ""}`}>
              refresh
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
