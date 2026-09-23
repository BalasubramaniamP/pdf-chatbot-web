"use client";

import { useState } from "react";
import clsx from "clsx";
import type { UIMessage } from "@/lib/types";

export default function MessageBubble({ message }: { message: UIMessage }) {
  const [expandedSource, setExpandedSource] = useState<number | null>(null);
  const isUser = message.role === "user";

  return (
    <div className={clsx("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div className={clsx("max-w-[85%] sm:max-w-[70%]", isUser && "flex flex-col items-end")}>
        <div
          className={clsx(
            "rounded-card px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap",
            isUser
              ? "bg-ink text-paper"
              : "border border-line bg-surface text-ink shadow-paper"
          )}
        >
          {message.content || (
            <span className="flex items-center gap-1.5">
              <span className="dot inline-block h-1.5 w-1.5 rounded-full bg-muted animate-pulse" />
              <span className="dot inline-block h-1.5 w-1.5 rounded-full bg-muted animate-pulse delay-75" />
              <span className="dot inline-block h-1.5 w-1.5 rounded-full bg-muted animate-pulse delay-150" />
            </span>
          )}
        </div>

        {message.sources && message.sources.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {message.sources.map((source, i) => (
              <div key={i} className="relative">
                <button
                  onClick={() => setExpandedSource(expandedSource === i ? null : i)}
                  className={clsx(
                    "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                    expandedSource === i
                      ? "border-teal bg-teal text-paper"
                      : "border-line bg-teal-soft text-teal-dark hover:border-teal/50"
                  )}
                >
                  Source {i + 1}
                </button>
                {expandedSource === i && (
                  <div className="absolute left-0 top-full z-10 mt-2 w-64 rounded-card border border-line bg-surface p-3 text-xs leading-relaxed text-muted shadow-paper">
                    "{source.slice(0, 200)}{source.length > 200 ? "..." : ""}"
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
