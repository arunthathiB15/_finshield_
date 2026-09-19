import type { AssetSeries, AssetSummary } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`QuantGuard API returned ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function getAssets(): Promise<AssetSummary[]> {
  return request<AssetSummary[]>("/api/assets");
}

export function getAssetSeries(symbol: string): Promise<AssetSeries> {
  return request<AssetSeries>(`/api/assets/${encodeURIComponent(symbol)}/series`);
}
