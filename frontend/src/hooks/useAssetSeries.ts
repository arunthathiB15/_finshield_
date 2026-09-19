import { useQuery } from "@tanstack/react-query";

import { getAssetSeries } from "../api/client";

export function useAssetSeries(symbol: string) {
  return useQuery({
    queryKey: ["asset-series", symbol],
    queryFn: () => getAssetSeries(symbol),
    staleTime: 60_000,
  });
}
