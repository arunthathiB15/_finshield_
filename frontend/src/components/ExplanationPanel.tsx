import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { explainAnalysis } from "../api/client";
import type { AnalysisResponse, ExplanationRequest, ExplanationResponse } from "../types";

type ExplanationPanelProps = {
  analysis: AnalysisResponse;
};

const DEFAULT_QUESTION =
  "Summarize the historical result, its main risks, and what the Trust Score verdict means.";

export function ExplanationPanel({ analysis }: ExplanationPanelProps) {
  const [question, setQuestion] = useState(DEFAULT_QUESTION);
  const mutation = useMutation<ExplanationResponse, Error, ExplanationRequest>({
    mutationFn: explainAnalysis,
  });

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate({ analysis, question: question.trim() || undefined });
  }

  const sourceLabel =
    mutation.data?.source === "featherless"
      ? `Featherless${mutation.data.model ? ` · ${mutation.data.model}` : ""}`
      : "Deterministic fallback";

  return (
    <section className="explanation-panel">
      <div className="panel-heading">
        <div>
          <div className="eyebrow">STEP 5 · EXPLANATION</div>
          <h3>Ask for a plain-language reading of the results.</h3>
          <p className="muted">
            The server sends the validated deterministic analysis as context. The language model
            explains it; it does not calculate metrics or predict prices.
          </p>
        </div>
        {mutation.isPending && <span className="loading-label">Generating explanation…</span>}
      </div>

      <form className="explanation-form" onSubmit={submit}>
        <label className="field">
          <span>Question</span>
          <textarea
            rows={3}
            maxLength={600}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
          />
        </label>
        <button className="primary-button" type="submit" disabled={mutation.isPending}>
          Explain results
        </button>
      </form>

      {mutation.isError && <p className="error">Explanation failed: {mutation.error.message}</p>}

      {mutation.data && (
        <div className="explanation-result">
          <div className="explanation-source">{sourceLabel}</div>
          <p>{mutation.data.explanation}</p>
          {mutation.data.notice && <p className="muted small-copy">{mutation.data.notice}</p>}
          <p className="analysis-disclaimer">{mutation.data.disclaimer}</p>
        </div>
      )}
    </section>
  );
}
