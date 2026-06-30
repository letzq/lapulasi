# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Enterprise Workspace AI 知识中心 — a full-stack RAG (Retrieval-Augmented Generation) chat application with knowledge base management, document processing, and analytics dashboards. Chinese-language UI.

## Tech Stack

- **Frontend**: Vue 3 + Composition API + TypeScript, Vite, Element Plus, ECharts, Pinia, Vue Router 4, Axios
- **Backend**: Node.js + Express + TypeScript (ESM modules), LangChain.js, ChromaDB (vector DB), MySQL 8.4
- **LLM**: 小米模型 via OpenAI-compatible API (configured in `backend/.env`)

## Common Commands

```bash
# Install all dependencies (frontend + backend)
npm run install:all

# Start both frontend and backend concurrently
npm run dev

# Start individually
npm run dev:frontend   # → http://localhost:3000
npm run dev:backend    # → http://localhost:8000

# Backend only
cd backend
npm run dev            # tsx watch (hot reload)
npm run build          # tsc compile
npm run init-db        # Initialize MySQL database schema

# Frontend only
cd frontend
npm run dev            # Vite dev server
npm run build          # vue-tsc + vite build
```

## Architecture

### Backend (`backend/src/`)

Express server with layered architecture:

- **Routes** (`routes/`) — REST endpoints: `auth`, `sessions`, `messages`, `knowledge`, `assets`, `rag`, `analytics`
- **Services** (`services/`) — Business logic layer:
  - `chatService` — Orchestrates message send (calls ragChain, saves messages, updates session stats)
  - `ragChain` — RAG pipeline: vector search → context assembly → LLM call (streaming via SSE)
  - `vectorStore` — ChromaDB wrapper (add/search/delete document chunks)
  - `documentProcessor` — Parses PDF/Word/Excel/text, splits into chunks (1000 chars, 200 overlap)
  - `memoryService` — Conversation history for context window
  - `embeddingService`, `messageService`, `sessionService`, `statsService`
- **Config** (`config/`) — `database.ts` (MySQL pool), `ai.ts` (LLM + ChromaDB clients)
- **Middleware** (`middleware/auth.ts`) — JWT authentication

### Frontend (`frontend/src/`)

Vue 3 SPA with Element Plus (飞书风格):

- **Views**: `Home` (dashboard), `Agents` (chat interface with SSE streaming), `Assets`, `Knowledge`, `Analytics`, `Settings`, `Login`
- **Layout** (`Layout.vue`) — Sidebar navigation + header + router-view
- **API layer** (`api/`) — Axios-based service calls: `sessions`, `messages`, `rag`, `knowledge`, `analytics`, `auth`
- **Stores** (`stores/`) — Pinia stores (`auth`, `chat`)
- **Charts** (`components/charts/`) — ECharts wrappers: LineChart, BarChart, PieChart, GaugeChart
- **Mock** (`mock/`) — In-memory mock API for frontend development without backend

### RAG Flow (key data path)

1. User sends message → `POST /api/rag/chat` (SSE streaming)
2. `chatService.streamMessage()` saves user message, calls `ragChain.streamAnswer()`
3. `ragChain` queries ChromaDB for similar chunks → assembles context + history → calls LLM with streaming
4. SSE events (`chunk`, `done`, `error`) stream back to frontend
5. Frontend (`Agents.vue`) uses `streamRagChat()` to consume SSE and render tokens in real-time

### Database

MySQL (`backend/src/config/database.ts`) — connection pool with `mysql2/promise`. Schema in `doc/init.sql`. Tables: `users`, `sessions`, `messages`, `knowledge_bases`, `documents`, `document_chunks`, `assets`, `agents`, `analytics`, `api_keys`.

## Key Design Decisions

- **ESM throughout**: Backend uses `"type": "module"` with `.js` extensions in imports
- **ChromaDB remote**: Configured at `111.170.35.211:8000`, collection name `documents`
- **VectorStore embedding**: Currently uses random vectors for testing (see `vectorStore.ts` `getCollection()`)
- **RAG fallback**: If LLM is unavailable, `ragChain` returns a simulated response with character-by-character streaming
- **JWT auth**: Token stored in `localStorage`, sent via `Authorization: Bearer` header; 401 triggers redirect to `/`
- **API proxy**: Vite dev server proxies `/api` to `http://localhost:8000`

## Environment Variables

**Frontend** (`frontend/.env.development`): `VITE_API_BASE_URL=http://localhost:8000/api`

**Backend** (`backend/.env`): `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `LLM_API_KEY`, `LLM_BASE_URL`, `LLM_MODEL`, `CHROMA_DB_URL`, `JWT_SECRET`, `CORS_ORIGIN`

## API Conventions

- Success: `{ success: true, data: ... }`
- Paginated: `{ items: [...], pagination: { page, pageSize, total, totalPages } }`
- Error: `{ success: false, error: "message" }`
- Full API docs: `doc/API.md`

## Design System

See `原型图/DESIGN.md` for the complete design token spec. Key colors: primary `#3370ff`, sidebar bg `#2b2f36`, page bg `#f7f8fa`. Typography: Inter (UI) + JetBrains Mono (code/data).
