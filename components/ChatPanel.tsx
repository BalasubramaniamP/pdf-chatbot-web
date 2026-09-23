"use client";

import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import type { ChatMessage, UploadResponse } from "@/lib/types";

interface ChatPanelProps {
  doc: UploadResponse;
  onNewDocument: () => void;
}

const SUGGESTIONS = [
  "Summarize this document in a few sentences",
  "What are the key takeaways?",
  "List anything mentioned about limitations or risks",
];

export default function ChatPanel({ doc, onNewDocument }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function ask(question: string) {
    if (!question.trim() || busy) return;
    setInput("");
    setBusy(true);

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: question };
    const assistantId = crypto.randomUUID();
    const history = messages.map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMsg, { id: assistantId, role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: doc.sessionId, question, history }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: "Something went wrong." }));
        throw new Error(err.error);
      }

      const sourcesHeader = res.headers.get("X-Sources");
      const sources = sourcesHeader ? JSON.parse(decodeURIComponent(sourcesHeader)) : [];

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: full } : m))
        );
      }

      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, content: full, sources } : m))
      );
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: err.message || "I couldn't answer that — please try again." }
            : m
        )
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-surface p-5 sm:flex">
        <p className="mb-6 text-xs font-medium uppercase tracking-[0.14em] text-teal">
          PDF Chatbot
        </p>
        <div className="rounded-card border border-line bg-paper p-4">
          <p className="truncate text-sm font-medium text-ink" title={doc.fileName}>
            {doc.fileName}
          </p>
          <p className="mt-1 text-xs text-muted">
            {doc.pageCount} page{doc.pageCount !== 1 ? "s" : ""} · {doc.chunkCount} indexed chunks
          </p>
        </div>
        <button
          onClick={onNewDocument}
          className="mt-4 rounded-full border border-line px-3.5 py-2 text-xs font-medium text-muted transition-colors hover:border-teal/50 hover:text-teal-dark"
        >
          Upload a different PDF
        </button>
        <div className="mt-auto text-[11px] text-muted">
          Answers are grounded in this document only.
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <div ref={scrollRef} className="scrollbar-thin flex-1 overflow-y-auto px-4 py-8 sm:px-10">
          <div className="mx-auto flex max-w-2xl flex-col gap-5">
            {messages.length === 0 ? (
              <div className="mt-10 flex flex-col items-center text-center">
                <h2 className="font-serif text-2xl text-ink">
                  Ready when you are.
                </h2>
                <p className="mt-2 max-w-sm text-sm text-muted">
                  Try one of these, or ask your own question about{" "}
                  <span className="font-medium text-ink">{doc.fileName}</span>.
                </p>
                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => ask(s)}
                      className="rounded-full border border-line bg-surface px-3.5 py-2 text-xs font-medium text-muted transition-colors hover:border-teal/50 hover:text-teal-dark"
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

        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
          className="border-t border-line bg-paper px-4 py-4 sm:px-10"
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
              className="flex-1 resize-none bg-transparent px-2 py-2 text-[15px] text-ink placeholder:text-muted focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="shrink-0 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-opacity disabled:opacity-30"
            >
              {busy ? "…" : "Ask"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
