// API Client for FastAPI Backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Document {
  id: string;
  file_name: string;
  status: "PROCESSING" | "COMPLETED" | "FAILED";
  total_chunks?: number;
  created_at: string;
}

export interface ChatSession {
  id: string;
  document_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  sender_type: "USER" | "AI";
  receiver_type: "USER" | "AI";
  message: string;
  created_at: string;
}

export interface AskQuestionResponse {
  user_message: ChatMessage;
  ai_message: ChatMessage;
  sources: string[];
}

// Documents API
export async function uploadDocument(file: File): Promise<Document> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/v1/documents`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(error.detail || "Failed to upload document");
  }

  return response.json();
}

export async function getDocument(documentId: string): Promise<Document> {
  const response = await fetch(`${API_BASE_URL}/api/v1/documents/${documentId}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to get document" }));
    throw new Error(error.detail || "Failed to get document");
  }

  return response.json();
}

// Chat Sessions API
export async function createSession(
  documentId: string,
  title?: string
): Promise<ChatSession> {
  const response = await fetch(`${API_BASE_URL}/api/v1/chat/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      document_id: documentId,
      title: title || null,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to create session" }));
    throw new Error(error.detail || "Failed to create session");
  }

  return response.json();
}

export async function listSessions(): Promise<ChatSession[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/chat/sessions`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to list sessions" }));
    throw new Error(error.detail || "Failed to list sessions");
  }

  return response.json();
}

export async function getSession(sessionId: string): Promise<ChatSession> {
  const response = await fetch(`${API_BASE_URL}/api/v1/chat/sessions/${sessionId}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to get session" }));
    throw new Error(error.detail || "Failed to get session");
  }

  return response.json();
}

export async function listDocumentSessions(documentId: string): Promise<ChatSession[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/chat/documents/${documentId}/sessions`
  );

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Failed to list document sessions" }));
    throw new Error(error.detail || "Failed to list document sessions");
  }

  return response.json();
}

export async function updateSessionTitle(
  sessionId: string,
  title: string
): Promise<ChatSession> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/chat/sessions/${sessionId}/title`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    }
  );

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Failed to update session title" }));
    throw new Error(error.detail || "Failed to update session title");
  }

  return response.json();
}

// Chat Messages API
export async function getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/chat/sessions/${sessionId}/messages`
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to get messages" }));
    throw new Error(error.detail || "Failed to get messages");
  }

  return response.json();
}

export async function askQuestion(
  sessionId: string,
  question: string
): Promise<AskQuestionResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/chat/sessions/${sessionId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to ask question" }));
    throw new Error(error.detail || "Failed to ask question");
  }

  return response.json();
}
