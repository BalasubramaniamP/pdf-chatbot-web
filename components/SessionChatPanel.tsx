"use client";

import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import type { UIMessage, ChatSession, Document } from "@/lib/types";
import { askQuestion } from "@/lib/api-client";

interface SessionChatPanelProps {
  session: ChatSession;
  document: Document;
  initialMessages: UIMessage[];
}

const SUGGESTIONS = [
  "Summarize this document in a few sentences",
  "What are the key takeaways?",
  "List any important conclusions or findings",
];

export default function SessionChatPanel({
  session,
  document,
  initialMessages,
}: SessionChatPanelProps) {
  const [messages, setMessages] = useState<UIMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset messages when session changes
    setMessages(initialMessages);
  }, [session.id, initialMessages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function ask(question: string) {
    if (!question.trim() || busy) return;
    setInput("");
    setBusy(true);

    const userTempId = crypto.randomUUID();
    const assistantTempId = crypto.randomUUID();

    const userMsg: UIMessage = {
      id: userTempId,
      role: "user",
      content: question,
    };

    setMessages((prev) => [...prev, userMsg, { id: assistantTempId, role: "assistant", content: "" }]);

    try {
      const response = await askQuestion(session.id, question);

      // Replace BOTH temp messages with the actual database versions
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === userTempId) {
            return {
              id: response.user_message.id,
              role: "user",
              content: response.user_message.message,
            };
          }
          if (m.id === assistantTempId) {
            return {
              id: response.ai_message.id,
              role: "assistant",
              content: response.ai_message.message,
              sources: response.sources,
            };
          }
          return m;
        })
      );
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantTempId
            ? {
                ...m,
                content: err.message || "I couldn't answer that — please try again.",
              }
            : m
        )
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Chat Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-8 sm:px-10">
        <div className="mx-auto flex max-w-2xl flex-col gap-5">
          {messages.length === 0 ? (
            <div className="mt-10 flex flex-col items-center text-center">
              <h2 className="font-serif text-2xl text-ink">Ready when you are.</h2>
              <p className="mt-2 max-w-sm text-sm text-muted">
                Ask a question about{" "}
                <span className="font-medium text-ink">{document.file_name}</span>, or try one of
                these:
              </p>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => ask(s)}
                    disabled={busy}
                    className="rounded-full border border-line bg-surface px-3.5 py-2 text-xs font-medium text-muted transition-colors hover:border-teal/50 hover:text-teal-dark disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => <MessageBubble key={m.id} message={m} />)
          )}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="shrink-0 border-t border-line bg-paper px-4 py-4 sm:px-10"
      >
        <div className="mx-auto flex max-w-2xl items-end gap-2 rounded-card border border-line bg-surface p-2 shadow-paper">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                ask(input);
              }
            }}
            rows={1}
            placeholder="Ask a question about this document…"
            disabled={busy || document.status !== "COMPLETED"}
            className="flex-1 resize-none bg-transparent px-2 py-2 text-[15px] text-ink placeholder:text-muted focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={busy || !input.trim() || document.status !== "COMPLETED"}
            className="shrink-0 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-opacity disabled:opacity-30"
          >
            {busy ? "…" : "Ask"}
          </button>
        </div>
        {document.status === "PROCESSING" && (
          <p className="mx-auto mt-2 max-w-2xl text-center text-xs text-muted">
            Document is still processing. Please wait...
          </p>
        )}
      </form>
    </div>
  );
}
