import type { AssetSummary } from "../types";

type AssetSelectorProps = {
  assets: AssetSummary[];
  value: string;
  onChange: (symbol: string) => void;
  id: string;
  disabled?: boolean;
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
}: AssetSelectorProps) {
  const options = orderedAssets(assets);
  const selectedValue = options.some((asset) => asset.symbol === value) ? value : "";

  return (
    <label className="asset-picker" htmlFor={id}>
      <span>Asset</span>
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
      >
        {options.length === 0 ? (
          <option value="">No assets available</option>
        ) : (
          <>
            <option value="" disabled>Select an asset</option>
            {options.map((asset) => (
              <option key={asset.symbol} value={asset.symbol}>
                {asset.name} · {asset.symbol}
              </option>
            ))}
          </>
        )}
      </select>
    </label>
  );
}
