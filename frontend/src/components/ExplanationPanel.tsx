import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { explainAnalysis } from "../api/client";
import type { AnalysisResponse, ExplanationRequest, ExplanationResponse, ThemeMode } from "../types";

type ExplanationPanelProps = {
  analysis: AnalysisResponse;
  theme?: ThemeMode;
};

const DEFAULT_QUESTION =
  "Summarize the historical result, its main risks, and what the Trust Score verdict means.";

export function ExplanationPanel({ analysis, theme = "light" }: ExplanationPanelProps) {
  const [question, setQuestion] = useState(DEFAULT_QUESTION);
  const mutation = useMutation<ExplanationResponse, Error, ExplanationRequest>({
    mutationFn: explainAnalysis,
  });

  const isDark = theme === "dark";

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate({ analysis, question: question.trim() || undefined });
  }

  const sourceLabel =
    mutation.data?.source === "featherless"
      ? `Featherless${mutation.data.model ? ` · ${mutation.data.model}` : ""}`
      : "Deterministic fallback engine";

  return (
    <section className="dynamic-glass-card p-4 sm:p-6 mt-6 flex flex-col gap-4">
      {/* Heading */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="text-[11px] font-extrabold tracking-widest uppercase text-blue-600 dark:text-primary-container">
            STEP 5 · PLAIN-LANGUAGE EXPLANATION
          </div>
          <h3 className={`text-xl sm:text-2xl font-bold tracking-tight mt-1 ${isDark ? "text-on-surface" : "text-text-obsidian"}`}>
            Ask for a plain-language reading of the results.
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-on-surface-variant max-w-2xl mt-1">
            The server sends the validated deterministic analysis as context. The language model
            explains it; it does not calculate metrics or predict prices.
          </p>
        </div>
        {mutation.isPending && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Generating explanation…
          </span>
        )}
      </div>

      <form className="flex flex-col gap-3" onSubmit={submit}>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-label-caps uppercase opacity-70 font-semibold">Inquiry Prompt</span>
            <button
              type="button"
              onClick={() => setQuestion("")}
              className="text-[11px] opacity-60 hover:opacity-100 hover:text-blue-600 dark:hover:text-primary-container transition-colors"
            >
              Clear
            </button>
          </div>
          <textarea
            rows={3}
            maxLength={600}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask a question about drawdowns, slippage impact, regime breakdown, or the trust score..."
            className={`w-full p-3 rounded-xl text-xs sm:text-sm font-body-md transition-all resize-none ${
              isDark
                ? "bg-background text-on-surface border border-outline-variant focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
                : "bg-white/90 text-text-obsidian border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-xs"
            }`}
          />
        </div>

        <div className="flex justify-end">
          <button
            className="liquid-button px-5 py-2.5 rounded-xl font-headline-sm text-xs sm:text-sm font-bold bg-primary-container text-on-primary-container cursor-pointer disabled:opacity-50"
            type="submit"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Evaluating context..." : "Explain results"}
          </button>
        </div>
      </form>

      {mutation.isError && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 text-xs">
          Explanation failed: {mutation.error.message}
        </div>
      )}

      {mutation.data && (
        <div
          className={`dynamic-subcard p-4 sm:p-5 flex flex-col gap-2.5 ${
            isDark
              ? "bg-surface-container border border-primary-container/30"
              : "bg-blue-50/80 border border-blue-200 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-label-caps uppercase font-bold tracking-wider text-blue-600 dark:text-primary-container">
              {sourceLabel}
            </span>
            <span className="text-[11px] opacity-60 font-code-sm">Sanitized &amp; Verified</span>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-body-md">
            {mutation.data.explanation}
          </p>
          {mutation.data.notice && (
            <p className="text-xs opacity-70 italic">{mutation.data.notice}</p>
          )}
          <p className="text-[11px] opacity-50 pt-1 border-t border-slate-200/60 dark:border-white/10">
            {mutation.data.disclaimer}
          </p>
        </div>
      )}
    </section>
  );
}
