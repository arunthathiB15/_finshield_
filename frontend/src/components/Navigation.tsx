import React from "react";
import type { TabType, ThemeMode } from "../types";

type NavigationProps = {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  theme: ThemeMode;
};

interface NavItem {
  id: TabType;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Overview", icon: "query_stats" },
  { id: "strategy-lab", label: "Strategy", icon: "science" },
  { id: "reliability-analysis", label: "Reliability", icon: "verified" },
  { id: "risk-and-regimes", label: "Regimes", icon: "analytics" },
  { id: "cost-sensitivity", label: "Cost Sens", icon: "tune" },
];

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  theme,
}) => {
  const isDark = theme === "dark";

  return (
    <nav
      className={`fixed bottom-0 inset-x-0 z-50 pb-safe transition-colors duration-200 ${
        isDark
          ? "bg-[#0a0e18]/90 backdrop-blur-xl border-t border-[#262a35] shadow-[0_-4px_24px_rgba(0,0,0,0.6)]"
          : "bg-white/85 backdrop-blur-2xl border-t border-slate-200/80 shadow-[0_-4px_24px_rgba(15,23,42,0.06)]"
      }`}
    >
      <div className="flex justify-between items-center h-16 px-2 max-w-4xl mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-12 rounded-xl transition-all ${
                isActive
                  ? isDark
                    ? "text-primary-container bg-surface-container-high/90 shadow-sm border border-primary-container/30"
                    : "text-blue-600 bg-blue-50/90 font-semibold border border-blue-200/60 shadow-xs"
                  : isDark
                  ? "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="font-label-caps text-label-caps tracking-tighter">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
