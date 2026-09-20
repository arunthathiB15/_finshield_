import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { askChat } from "../api/client";
import type { ChatContext, ChatResponse, ChatTurn } from "../types";

type HelpDeskChatbotProps = {
  context?: ChatContext;
};

type DisplayMessage = ChatTurn & {
  source?: ChatResponse["source"];
  model?: string | null;
};

const WELCOME_MESSAGE: DisplayMessage = {
  role: "assistant",
  content:
    "I’m the FinShield project assistant. Ask me about the datasets, formulas, SMA strategy, backtest results, risk metrics, dates, correlation, news, or Featherless integration.",
};

export function HelpDeskChatbot({ context = {} }: HelpDeskChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<DisplayMessage[]>([WELCOME_MESSAGE]);
  const mutation = useMutation<ChatResponse, Error, { question: string; history: ChatTurn[]; context: Record<string, unknown> }>({
    mutationFn: askChat,
  });

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || mutation.isPending) return;

    const history = messages.slice(-8).map(({ role, content }) => ({ role, content }));
    setMessages((current) => [...current, { role: "user", content: trimmed }]);
    setQuestion("");
    mutation.mutate({ question: trimmed, history, context });
  }

  return (
    <aside className={`helpdesk ${isOpen ? "is-open" : ""}`} aria-label="FinShield help desk">
      {isOpen && (
        <section className="helpdesk-panel" aria-label="FinShield AI help desk">
          <header className="helpdesk-panel-header">
            <div>
              <span className="helpdesk-kicker">FINSHIELD HELP DESK</span>
              <h2>Ask about the project</h2>
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
            <div className="helpdesk-thread" aria-live="polite">
              {messages.map((message, index) => (
                <div
                  className={`helpdesk-message ${
                    message.role === "user" ? "helpdesk-message-user" : "helpdesk-message-bot"
                  }`}
                  key={`${message.role}-${index}`}
                >
                  {message.content}
                  {message.source && (
                    <small className="helpdesk-message-meta">
                      {message.source === "featherless"
                        ? `Featherless${message.model ? ` · ${message.model}` : ""}`
                        : "Fallback response"}
                    </small>
                  )}
                </div>
              ))}
              {mutation.isPending && (
                <div className="helpdesk-message helpdesk-message-bot helpdesk-typing">
                  Thinking from the project context…
                </div>
              )}
            </div>

            {mutation.isError && (
              <p className="helpdesk-error" role="alert">
                Chat request failed: {mutation.error.message}
              </p>
            )}

            <form className="helpdesk-composer" onSubmit={submit}>
              <textarea
                rows={3}
                maxLength={1000}
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask anything about FinShield…"
                aria-label="Ask the FinShield project assistant"
              />
              <div className="helpdesk-composer-footer">
                <span className="helpdesk-note">
                  Server-side AI uses validated project context. API keys stay in FastAPI.
                </span>
                <button className="helpdesk-send" type="submit" disabled={!question.trim() || mutation.isPending}>
                  <span className="material-symbols-outlined" aria-hidden="true">send</span>
                  Ask
                </button>
              </div>
            </form>
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
