# Marginalia — Session-Based PDF Chatbot

A production-ready PDF chatbot with session-based conversations, powered by **Next.js 14**, **FastAPI**, **PostgreSQL**, **ChromaDB**, and **Google Gemini AI**.

## Features

- 📄 **PDF Upload & Processing** — Extract text, chunk, and embed documents
- 💬 **Session-Based Chat** — Multiple conversations per document with persistent history
- 🔍 **Semantic Search** — ChromaDB vector store with Gemini Embedding 2
- 🤖 **AI Responses** — Powered by Gemini 3.6 Flash
- 🎨 **Modern UI** — Clean, responsive design with conversation management
- 💾 **Database Persistence** — PostgreSQL for documents, sessions, and messages

## Architecture

```
Next.js Frontend
    ↓
FastAPI Backend
    ↓
PostgreSQL (documents, sessions, messages)
    +
ChromaDB (document embeddings)
    +
Google Gemini AI (embeddings + generation)
```

## How It Works

1. **Upload** — PDF is uploaded to FastAPI, processed, chunked, and embedded using Gemini Embedding 2
2. **Store** — Document metadata saved to PostgreSQL, embeddings stored in ChromaDB
3. **Session** — Create chat sessions for each document (multiple sessions per document supported)
4. **Chat** — Questions are embedded, relevant chunks retrieved from ChromaDB, and Gemini generates answers
5. **History** — All messages saved to PostgreSQL and persist across sessions

## Setup

### Prerequisites

- Node.js 18+
- Python 3.10+
- PostgreSQL 15+
- Google Gemini API key

### Backend Setup

1. Navigate to backend directory:
```bash
cd ../backend
```

2. Create virtual environment and install dependencies:
```bash
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

pip install -r requirements.txt
```

3. Set up PostgreSQL database:
```bash
# Create database
psql -U postgres
CREATE DATABASE pdf_chatbot;
\q

# Run schema
psql -U postgres -d pdf_chatbot -f database/init.sql
```

4. Configure environment:
```bash
# Edit .env file
GROQ_API_KEY=your_gemini_api_key_here
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pdf_chatbot
```

5. Start FastAPI server:
```bash
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
# Create .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. Start development server:
```bash
npm run dev
```

4. Open http://localhost:3000

## Usage

### 1. Upload a PDF
- Drag and drop or click to upload a PDF document
- Wait for processing to complete

### 2. Create a Session
- A default session is created automatically
- Or click "New Conversation" to start another session

### 3. Ask Questions
- Type questions about the document
- Receive AI-generated answers with source citations

### 4. Manage Sessions
- View all conversations in the sidebar
- Switch between sessions
- Each session maintains its own chat history

### 5. Multiple Documents
- Upload different PDFs
- Each document can have multiple sessions
- All history is preserved

## API Endpoints

See `backend/API_DOCUMENTATION.md` for complete API reference.

**Key endpoints:**
- `POST /api/v1/documents` — Upload and process PDF
- `POST /api/v1/chat/sessions` — Create new session
- `GET /api/v1/chat/sessions` — List all sessions
- `GET /api/v1/chat/sessions/{id}/messages` — Get session history
- `POST /api/v1/chat/sessions/{id}/messages` — Ask question

## Tech Stack

### Frontend
- **Next.js 14** — React framework with App Router
- **TypeScript** — Type safety
- **Tailwind CSS** — Styling
- **React Hooks** — State management

### Backend
- **FastAPI** — Python web framework
- **PostgreSQL** — Relational database
- **psycopg3** — PostgreSQL adapter
- **ChromaDB** — Vector database
- **Google Gemini AI** — Embeddings + LLM
- **PyPDF** — PDF text extraction

## Database Schema

```sql
documents (id, file_name, status, created_at, ...)
    ↓
chat_sessions (id, document_id, title, created_at, updated_at)
    ↓
chat_messages (id, session_id, sender_type, message, created_at)
```

## Production Considerations

- [ ] Add user authentication
- [ ] Implement rate limiting
- [ ] Add file size validation
- [ ] Optimize embedding batch processing
- [ ] Add document deletion
- [ ] Add session search/filter
- [ ] Implement error tracking (Sentry)
- [ ] Add monitoring (Prometheus/Grafana)
- [ ] Set up CI/CD pipeline
- [ ] Deploy backend to cloud (AWS/GCP)
- [ ] Deploy frontend to Vercel
- [ ] Use managed PostgreSQL (RDS/Cloud SQL)
- [ ] Add Redis for caching

## Development

```bash
# Frontend
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # Run linter

# Backend
uvicorn app.main:app --reload  # Start with hot reload
python -m pytest                # Run tests (when added)
```

## License

MIT
