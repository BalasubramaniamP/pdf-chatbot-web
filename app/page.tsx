"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import UploadZone from "@/components/UploadZone";
import SessionSidebar from "@/components/SessionSidebar";
import SessionChatPanel from "@/components/SessionChatPanel";
import type { Document, ChatSession, UIMessage, ChatMessage } from "@/lib/types";
import {
  uploadDocument,
  createSession,
  listSessions,
  getSessionMessages,
  getDocument,
} from "@/lib/api-client";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [documentsMap, setDocumentsMap] = useState<Map<string, Document>>(new Map());
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all sessions on mount and check URL for session
  useEffect(() => {
    loadAllSessions();
  }, []);

  // Handle URL session parameter
  useEffect(() => {
    const sessionId = searchParams.get("session");
    if (sessionId && sessions.length > 0) {
      const session = sessions.find((s) => s.id === sessionId);
      if (session && session.id !== currentSession?.id) {
        handleSessionSelect(session);
      }
    }
  }, [searchParams, sessions]);

  async function loadAllSessions() {
    try {
      setIsLoadingSessions(true);
      const allSessions = await listSessions();
      setSessions(allSessions);

      // Load document info for each unique document
      const uniqueDocIds = Array.from(new Set(allSessions.map((s) => s.document_id)));
      const docsMap = new Map<string, Document>();
      
      await Promise.all(
        uniqueDocIds.map(async (docId) => {
          try {
            const doc = await getDocument(docId);
            docsMap.set(docId, doc);
          } catch (err) {
            console.error(`Failed to load document ${docId}:`, err);
          }
        })
      );
      
      setDocumentsMap(docsMap);
    } catch (err: any) {
      console.error("Failed to load sessions:", err);
    } finally {
      setIsLoadingSessions(false);
    }
  }

  async function handleFileUpload(file: File) {
    setError(null);
    setIsUploading(true);

    try {
      // Upload document to backend
      const uploadedDoc = await uploadDocument(file);
      setCurrentDocument(uploadedDoc);

      // Add to documents map
      setDocumentsMap((prev) => new Map(prev).set(uploadedDoc.id, uploadedDoc));

      // Create first session for this document
      const newSession = await createSession(uploadedDoc.id, "New conversation");
      setCurrentSession(newSession);
      setMessages([]);

      // Update URL
      router.push(`?session=${newSession.id}`);

      // Refresh sessions list
      await loadAllSessions();
    } catch (err: any) {
      setError(err.message || "Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSessionSelect(session: ChatSession) {
    try {
      setCurrentSession(session);

      // Update URL with session ID
      router.push(`?session=${session.id}`);

      // Load document for this session
      const doc = documentsMap.get(session.document_id);
      if (doc) {
        setCurrentDocument(doc);
      } else {
        // Load document if not in map
        const loadedDoc = await getDocument(session.document_id);
        setCurrentDocument(loadedDoc);
        setDocumentsMap((prev) => new Map(prev).set(loadedDoc.id, loadedDoc));
      }

      // Load messages for this session
      const sessionMessages = await getSessionMessages(session.id);

      // Convert backend messages to UI messages
      const uiMessages: UIMessage[] = sessionMessages.map((msg: ChatMessage) => ({
        id: msg.id,
        role: msg.sender_type === "USER" ? "user" : "assistant",
        content: msg.message,
      }));

      setMessages(uiMessages);
    } catch (err: any) {
      setError(err.message || "Failed to load session");
    }
  }

  async function handleNewSession() {
    // Show upload screen when clicking "New Conversation"
    setCurrentDocument(null);
    setCurrentSession(null);
    setMessages([]);
    router.push("/");
  }

  function handleNewDocument() {
    // Clear current session but keep showing sidebar with upload option
    setCurrentDocument(null);
    setCurrentSession(null);
    setMessages([]);
    setError(null);
    router.push("/");
  }

  // Always show sidebar + main content area
  return (
    <div className="flex h-screen overflow-hidden">
      <SessionSidebar
        sessions={sessions}
        documentsMap={documentsMap}
        currentSession={currentSession}
        currentDocument={currentDocument}
        onSessionSelect={handleSessionSelect}
        onNewSession={handleNewSession}
        onNewDocument={handleNewDocument}
        isLoading={isLoadingSessions}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        {!currentSession ? (
          // Show upload zone when no session is selected
          <div className="flex flex-1 items-center justify-center overflow-y-auto">
            <div className="w-full max-w-2xl px-6">
              <UploadZone
                onFileSelected={handleFileUpload}
                isUploading={isUploading}
                error={error}
              />
            </div>
          </div>
        ) : currentDocument ? (
          // Show chat panel when session is selected
          <SessionChatPanel
            session={currentSession}
            document={currentDocument}
            initialMessages={messages}
          />
        ) : (
          // Loading state
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-muted">Loading session...</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="fixed bottom-4 right-4 max-w-md rounded-card border border-rust bg-surface px-4 py-3 text-sm text-rust shadow-paper">
          {error}
          <button onClick={() => setError(null)} className="ml-2 font-medium underline">
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
