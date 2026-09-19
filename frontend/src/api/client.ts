import type {
  AnalysisRequest,
  AnalysisResponse,
  AssetSeries,
  AssetSummary,
  BacktestRequest,
  BacktestResponse,
  ExplanationRequest,
  ExplanationResponse,
} from "../types";

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

export async function runBacktest(payload: BacktestRequest): Promise<BacktestResponse> {
  const response = await fetch(`${API_BASE_URL}/api/backtest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `QuantGuard API returned ${response.status}`);
  }
  return response.json() as Promise<BacktestResponse>;
}

export async function runAnalysis(payload: AnalysisRequest): Promise<AnalysisResponse> {
  const response = await fetch(`${API_BASE_URL}/api/analysis`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `QuantGuard API returned ${response.status}`);
  }
  return response.json() as Promise<AnalysisResponse>;
}

export async function explainAnalysis(payload: ExplanationRequest): Promise<ExplanationResponse> {
  const response = await fetch(`${API_BASE_URL}/api/explanation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `QuantGuard API returned ${response.status}`);
  }
  return response.json() as Promise<ExplanationResponse>;
}
