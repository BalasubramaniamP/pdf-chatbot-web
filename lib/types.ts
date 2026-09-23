// Backend API types
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

// UI types
export type ChatRole = "user" | "assistant";

export interface UIMessage {
  id: string;
  role: ChatRole;
  content: string;
  sources?: string[];
}

// Legacy types (for backward compatibility during migration)
export interface SourceChunk {
  page: number;
  snippet: string;
}

export interface UploadResponse {
  sessionId: string;
  fileName: string;
  pageCount: number;
  chunkCount: number;
}
