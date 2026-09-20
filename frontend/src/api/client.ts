import type {
  AnalysisRequest,
  AnalysisResponse,
  AssetSeries,
  AssetSummary,
  BacktestRequest,
  BacktestResponse,
  ChatRequest,
  ChatResponse,
  CorrelationAnalysis,
  ExplanationRequest,
  ExplanationResponse,
  NewsResponse,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

async function responseError(response: Response, fallback: string): Promise<Error> {
  const body = await response.text();
  if (body) {
    try {
      const parsed = JSON.parse(body) as { detail?: unknown };
      if (typeof parsed.detail === "string") {
        return new Error(parsed.detail);
      }
    } catch {
      // Use the raw response below when the server did not return JSON.
    }
    return new Error(body);
  }
  return new Error(fallback);
}

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Finshield API returned ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function getAssets(): Promise<AssetSummary[]> {
  return request<AssetSummary[]>("/api/assets");
}

export function getAssetSeries(symbol: string): Promise<AssetSeries> {
  return request<AssetSeries>(`/api/assets/${encodeURIComponent(symbol)}/series`);
}

export function getCorrelationAnalysis(): Promise<CorrelationAnalysis> {
  return request<CorrelationAnalysis>("/api/analysis/correlation");
}

export function getMarketNews(
  symbol: string,
  limit = 12,
  forceRefresh = false,
): Promise<NewsResponse> {
  return request<NewsResponse>(
    `/api/news?symbol=${encodeURIComponent(symbol)}&limit=${limit}&refresh=${forceRefresh}`,
  );
}

export async function runBacktest(payload: BacktestRequest): Promise<BacktestResponse> {
  const response = await fetch(`${API_BASE_URL}/api/backtest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw await responseError(response, `Finshield API returned ${response.status}`);
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
    throw await responseError(response, `Finshield API returned ${response.status}`);
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
    throw await responseError(response, `Finshield API returned ${response.status}`);
  }
  return response.json() as Promise<ExplanationResponse>;
}


export async function askChat(payload: ChatRequest): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw await responseError(response, `Finshield API returned ${response.status}`);
  }
  return response.json() as Promise<ChatResponse>;
}
