import { useState } from "react";

type HelpDeskQuestion = {
  question: string;
  answer: string;
};

const PRELOADED_QUESTIONS: HelpDeskQuestion[] = [
  {
    question: "What is FinShield?",
    answer:
      "FinShield is a trust-first research dashboard. It loads validated historical market data, runs deterministic backtests, and presents the risk and reliability evidence before you interpret a strategy.",
  },
  {
    question: "Does FinShield predict prices?",
    answer:
      "No. The quant engine calculates historical metrics deterministically. The explanation layer only turns those computed results into plain language; it does not predict prices or invent numbers.",
  },
  {
    question: "What does the Trust Score mean?",
    answer:
      "The Trust Score is a validation summary. It combines evidence such as out-of-sample behavior, risk, costs, and stability. It is not a guarantee of future returns.",
  },
  {
    question: "What is in the metadata download?",
    answer:
      "The JSON file includes the selected asset summary, data range, row and quality counts, calculated overview values, the export timestamp, and the latest validated observation.",
  },
  {
    question: "How does Featherless AI fit in?",
    answer:
      "Featherless runs server-side through FastAPI only for natural-language explanations of computed analysis. If it is unavailable or the model is gated, FinShield uses its deterministic fallback explanation.",
  },
  {
    question: "Is this financial advice?",
    answer:
      "No. This dashboard is for research and educational analysis. Historical results do not guarantee future performance, and you should not treat the output as financial advice.",
  },
  {
    question: "Can the MVP be completed in 30 minutes?",
    answer:
      "Yes, the metadata download and this preloaded help desk fit within a focused 30-minute MVP. A production chatbot with authentication, ticket creation, storage, and human support would need additional time.",
  },
];

export function HelpDeskChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<HelpDeskQuestion | null>(null);

  return (
    <aside className={`helpdesk ${isOpen ? "is-open" : ""}`} aria-label="FinShield help desk">
      {isOpen && (
        <section className="helpdesk-panel" aria-label="Preloaded FinShield questions">
          <header className="helpdesk-panel-header">
            <div>
              <span className="helpdesk-kicker">FINSHIELD HELP DESK</span>
              <h2>How can we help?</h2>
            </div>
            <button
              className="helpdesk-close"
              type="button"
              aria-label="Close help desk"
              onClick={() => setIsOpen(false)}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                close
              </span>
            </button>
          </header>

          <div className="helpdesk-content">
            <div className="helpdesk-message helpdesk-message-bot">
              Choose a question below and I’ll explain how this build works.
            </div>

            {selectedQuestion && (
              <>
                <div className="helpdesk-message helpdesk-message-user">
                  {selectedQuestion.question}
                </div>
                <div className="helpdesk-message helpdesk-message-bot">
                  {selectedQuestion.answer}
                </div>
              </>
            )}

            <div className="helpdesk-question-list">
              {PRELOADED_QUESTIONS.map((item) => (
                <button
                  className="helpdesk-question"
                  type="button"
                  key={item.question}
                  onClick={() => setSelectedQuestion(item)}
                >
                  {item.question}
                  <span className="material-symbols-outlined" aria-hidden="true">
                    arrow_forward
                  </span>
                </button>
              ))}
            </div>

            <p className="helpdesk-note">
              Preloaded answers only. No market values or API keys are sent from this widget.
            </p>
          </div>
        </section>
      )}

      <button
        className="helpdesk-toggle"
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="material-symbols-outlined" aria-hidden="true">
          {isOpen ? "close" : "support_agent"}
        </span>
        {isOpen ? "Close help" : "Help desk"}
      </button>
    </aside>
  );
}
