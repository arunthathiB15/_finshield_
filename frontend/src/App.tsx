import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getAssets, runBacktest, runAnalysis, explainAnalysis } from "./api/client";
import { Header } from "./components/Header";
import { Navigation } from "./components/Navigation";
import { OverviewTab } from "./components/OverviewTab";
import { StrategyLabTab } from "./components/StrategyLabTab";
import { ReliabilityTab } from "./components/ReliabilityTab";
import { ReasoningTab } from "./components/ReasoningTab";
import { CostSensitivityTab } from "./components/CostSensitivityTab";
import { DEFAULT_ASSETS, type AssetTelemetry } from "./data/mockData";
import type { TabType, ThemeMode, BacktestRequest, AnalysisRequest, ExplanationRequest } from "./types";

const TAB_TITLES: Record<TabType, string> = {
  "overview": "Overview",
  "strategy-lab": "Strategy Lab",
  "reliability-analysis": "Reliability Analysis",
  "risk-and-regimes": "Regimes & Reasoning",
  "cost-sensitivity": "Cost Sensitivity",
};

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [symbol, setSymbol] = useState<string>("GC=F");

  // Sync html class for dark / light liquid glass theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [theme]);

  // Query assets from backend (with graceful offline fallback)
  const assetsQuery = useQuery({
    queryKey: ["assets"],
    queryFn: getAssets,
    staleTime: 60_000,
    retry: 1,
  });

  const availableTickers = Object.keys(DEFAULT_ASSETS);
  const activeAssetData: AssetTelemetry = DEFAULT_ASSETS[symbol] || DEFAULT_ASSETS["GC=F"];

  // Backend mutations for live calculations
  const backtestMutation = useMutation({
    mutationFn: runBacktest,
  });

  const analysisMutation = useMutation({
    mutationFn: runAnalysis,
  });

  const explanationMutation = useMutation({
    mutationFn: explainAnalysis,
  });

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleRunBackendBacktest = (params: {
    capital: number;
    slippageBps: number;
    fastWindow: number;
    slowWindow: number;
  }) => {
    const payload: BacktestRequest = {
      symbol,
      strategy: "sma_crossover",
      params: { fast_window: params.fastWindow, slow_window: params.slowWindow },
      capital: params.capital,
      cost: 0.0005,
      slippage: params.slippageBps / 10_000,
      period: { start: null, end: null },
    };
    backtestMutation.mutate(payload, {
      onSuccess: () => {
        const analysisPayload: AnalysisRequest = { ...payload, train_fraction: 0.7 };
        analysisMutation.mutate(analysisPayload);
      },
    });
  };

  const handleExplainBackend = (question: string) => {
    if (analysisMutation.data) {
      const expPayload: ExplanationRequest = {
        analysis: analysisMutation.data,
        question: question.trim() || undefined,
      };
      explanationMutation.mutate(expPayload);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        theme === "dark" ? "bg-[#0f131d] text-[#dfe2f1]" : "bg-[#FFFFFF] text-[#0F172A]"
      }`}
    >
      {/* Institutional Header */}
      <Header
        theme={theme}
        onToggleTheme={handleToggleTheme}
        activeAsset={symbol}
        onSelectAsset={setSymbol}
        availableAssets={availableTickers.map((t) => ({
          symbol: t,
          name: DEFAULT_ASSETS[t]?.name || t,
        }))}
        currentTabName={TAB_TITLES[activeTab]}
        isNominal={!assetsQuery.isError}
        onRefresh={() => assetsQuery.refetch()}
      />

      {/* Main Terminal View Space */}
      <main className="flex-1 w-full pt-28 pb-24 px-3 sm:px-4 flex flex-col justify-start">
        {activeTab === "overview" && (
          <OverviewTab
            asset={activeAssetData}
            availableTickers={availableTickers}
            selectedTicker={symbol}
            onSelectTicker={setSymbol}
            theme={theme}
          />
        )}

        {activeTab === "strategy-lab" && (
          <StrategyLabTab
            asset={activeAssetData}
            availableTickers={availableTickers}
            selectedTicker={symbol}
            onSelectTicker={setSymbol}
            theme={theme}
            onRunBackendBacktest={handleRunBackendBacktest}
          />
        )}

        {activeTab === "reliability-analysis" && (
          <ReliabilityTab asset={activeAssetData} theme={theme} />
        )}

        {activeTab === "risk-and-regimes" && (
          <ReasoningTab
            asset={activeAssetData}
            theme={theme}
            onExplainBackend={handleExplainBackend}
          />
        )}

        {activeTab === "cost-sensitivity" && (
          <CostSensitivityTab
            asset={activeAssetData}
            theme={theme}
            onNavigateTab={setActiveTab}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation */}
      <Navigation activeTab={activeTab} onSelectTab={setActiveTab} theme={theme} />
    </div>
  );
}
