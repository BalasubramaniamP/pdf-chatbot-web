"use client";

import { useState } from "react";
import clsx from "clsx";
import type { ChatSession, Document } from "@/lib/types";

interface SessionSidebarProps {
  sessions: ChatSession[];
  documentsMap: Map<string, Document>;
  currentSession: ChatSession | null;
  currentDocument: Document | null;
  onSessionSelect: (session: ChatSession) => void;
  onNewSession: () => void;
  onNewDocument: () => void;
  isLoading?: boolean;
}

export default function SessionSidebar({
  sessions,
  documentsMap,
  currentSession,
  currentDocument,
  onSessionSelect,
  onNewSession,
  onNewDocument,
  isLoading,
}: SessionSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const truncateId = (id: string) => {
    return id.slice(0, 8);
  };

  if (isCollapsed) {
    return (
      <div className="flex h-screen w-16 shrink-0 flex-col items-center border-r border-line bg-surface py-5">
        <button
          onClick={() => setIsCollapsed(false)}
          className="mb-4 rounded-lg p-2 text-muted hover:bg-paper hover:text-ink transition-colors"
          title="Expand sidebar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 18l6-6-6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex-1" />
        <button
          onClick={onNewSession}
          className="rounded-lg p-2 text-muted hover:bg-paper hover:text-ink transition-colors"
          title="New conversation"
          disabled={!currentDocument || currentDocument.status !== "COMPLETED"}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <aside className="flex h-screen w-80 shrink-0 flex-col border-r border-line bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line px-5 py-4 shrink-0">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-teal">PDF Chatbot</p>
        <button
          onClick={() => setIsCollapsed(true)}
          className="rounded-lg p-1.5 text-muted hover:bg-paper hover:text-ink transition-colors"
          title="Collapse sidebar"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              d="M15 18l-6-6 6-6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Current Document */}
      {currentDocument && (
        <div className="border-b border-line p-4 shrink-0">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-muted">Current Document</p>
            {currentDocument.status === "PROCESSING" && (
              <span className="flex items-center gap-1 text-[10px] text-teal">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal animate-pulse" />
                Processing
              </span>
            )}
          </div>
          <div className="rounded-card border border-line bg-paper p-3">
            <p className="truncate text-sm font-medium text-ink" title={currentDocument.file_name}>
              {currentDocument.file_name}
            </p>
            {currentDocument.total_chunks && (
              <p className="mt-1 text-xs text-muted">
                {currentDocument.total_chunks} chunks indexed
              </p>
            )}
          </div>
        </div>
      )}

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <p className="mb-3 text-xs font-medium text-muted">
            {isLoading
              ? "Loading..."
              : sessions.length === 0
              ? "No Conversations"
              : `${sessions.length} Conversation${sessions.length !== 1 ? "s" : ""}`}
          </p>
          <div className="space-y-2">
            {sessions.map((session) => {
              const doc = documentsMap.get(session.document_id);
              return (
                <button
                  key={session.id}
                  onClick={() => onSessionSelect(session)}
                  className={clsx(
                    "w-full rounded-card border p-3 text-left transition-all",
                    currentSession?.id === session.id
                      ? "border-teal bg-teal-soft shadow-sm"
                      : "border-line bg-paper hover:border-teal/30 hover:shadow-sm"
                  )}
                >
                  {/* Session Title */}
                  <p
                    className={clsx(
                      "truncate text-sm font-medium",
                      currentSession?.id === session.id ? "text-teal-dark" : "text-ink"
                    )}
                    title={session.title || "Untitled conversation"}
                  >
                    {session.title || "Untitled conversation"}
                  </p>

                  {/* Document Name */}
                  {doc && (
                    <p
                      className="mt-1 truncate text-xs text-muted"
                      title={`Document: ${doc.file_name}`}
                    >
                      📄 {doc.file_name}
                    </p>
                  )}

                  {/* Session ID and Time */}
                  <div className="mt-2 flex items-center justify-between">
                    <code
                      className={clsx(
                        "rounded px-1.5 py-0.5 text-[10px] font-mono",
                        currentSession?.id === session.id
                          ? "bg-teal/20 text-teal-dark"
                          : "bg-line/50 text-muted"
                      )}
                      title={`Session ID: ${session.id}`}
                    >
                      {truncateId(session.id)}
                    </code>
                    <span className="text-xs text-muted">{formatDate(session.updated_at)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer - New Conversation Button */}
      <div className="border-t border-line p-4 shrink-0">
        <button
          onClick={onNewSession}
          className="w-full rounded-full border border-line px-3.5 py-2 text-xs font-medium text-muted transition-colors hover:border-teal/50 hover:text-teal-dark"
        >
          💬 New Conversation
        </button>
        <div className="mt-3 text-center text-[11px] text-muted">
          Session-based conversations
        </div>
      </div>
    </aside>
  );
}
