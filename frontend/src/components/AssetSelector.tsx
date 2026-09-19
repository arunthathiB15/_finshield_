import React from "react";
import type { AssetSummary, ThemeMode } from "../types";

type AssetSelectorProps = {
  assets: AssetSummary[];
  value: string;
  onChange: (symbol: string) => void;
  id: string;
  disabled?: boolean;
  theme?: ThemeMode;
};

const DISPLAY_ORDER = ["GC=F", "BTC-USD", "NVDA"];

function orderedAssets(assets: AssetSummary[]): AssetSummary[] {
  return [...assets].sort((left, right) => {
    const leftIndex = DISPLAY_ORDER.indexOf(left.symbol);
    const rightIndex = DISPLAY_ORDER.indexOf(right.symbol);
    const leftRank = leftIndex === -1 ? DISPLAY_ORDER.length : leftIndex;
    const rightRank = rightIndex === -1 ? DISPLAY_ORDER.length : rightIndex;
    return leftRank - rightRank || left.symbol.localeCompare(right.symbol);
  });
}

export function AssetSelector({
  assets,
  value,
  onChange,
  id,
  disabled = false,
  theme = "light",
}: AssetSelectorProps) {
  const isDark = theme === "dark";
  const options = orderedAssets(assets);
  const selectedValue = options.some((asset) => asset.symbol === value) ? value : "";

  return (
    <div className="flex flex-col gap-1.5 min-w-[240px]">
      <label
        htmlFor={id}
        className={`font-label-caps text-[10px] uppercase font-semibold ${
          isDark ? "text-on-surface-variant" : "text-slate-500"
        }`}
      >
        Target Asset
      </label>
      <div className="relative">
        <select
          id={id}
          data-testid="asset-selector"
          aria-label="Asset"
          value={selectedValue}
          disabled={disabled || options.length === 0}
          onChange={(event) => {
            const nextSymbol = event.target.value;
            if (options.some((asset) => asset.symbol === nextSymbol)) {
              onChange(nextSymbol);
            }
          }}
          className={`w-full font-body-md text-sm py-2.5 px-3.5 rounded-xl appearance-none pr-9 font-semibold transition-all cursor-pointer ${
            isDark
              ? "bg-[#0a0e18] text-on-surface border border-white/10 hover:border-primary-container/50 focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
              : "bg-white/90 text-text-obsidian border border-slate-200/90 hover:border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-xs"
          }`}
        >
          {options.length === 0 ? (
            <option value="">No assets available</option>
          ) : (
            options.map((asset) => (
              <option key={asset.symbol} value={asset.symbol}>
                {asset.name} · ({asset.symbol})
              </option>
            ))
          )}
        </select>
        <span
          className={`material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[18px] opacity-60 ${
            isDark ? "text-on-surface" : "text-slate-600"
          }`}
        >
          expand_more
        </span>
      </div>
    </div>
  );
}
