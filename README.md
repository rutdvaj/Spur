Spur – AI Live Chat Agent (Take-Home Assignment)

This project implements a minimal but production-minded AI-powered customer support chat widget, built as part of the Spur founding full-stack engineer take-home assignment.

The application simulates a real customer support experience where users can chat with an AI agent that:

Maintains conversation context

Answers FAQ-style questions reliably

Persists conversations to a database

Handles errors and failures gracefully

🧠 High-Level Overview

Backend: Node.js + TypeScript + Express

Frontend: Next.js (App Router) + React + shadcn/ui

Database: SQLite (via Prisma ORM)

LLM Provider: Google Gemini

Session Management: Lightweight, session-based (no auth)

📂 Project Structure
spur/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── db/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── styles/
│   ├── .env.local
│   └── package.json
│
└── README.md

🚀 How to Run Locally (Step-by-Step)
1️⃣ Prerequisites

Node.js v20+

npm

Git

2️⃣ Clone the Repository
git clone https://github.com/rutdvaj/Spur
cd spur

🧩 Backend Setup
3️⃣ Install Backend Dependencies
cd backend
npm install

4️⃣ Environment Variables (Backend)

Create a file:

📄 backend/.env

PORT=3001
DATABASE_URL="file:./dev.db"
GEMINI_API_KEY=your_gemini_api_key_here


⚠️ Do not commit .env files. They are git-ignored.

5️⃣ Database Setup (Prisma + SQLite)

Run migrations to create the database and tables:

npx prisma migrate dev --name init


This will:

Create dev.db

Create Conversation and Message tables

Generate Prisma Client

Optional (to inspect DB visually):

npx prisma studio

6️⃣ Start Backend Server
npm run dev


Backend will be available at:

http://localhost:3001


Health check:

GET http://localhost:3001/health

🎨 Frontend Setup
7️⃣ Install Frontend Dependencies
cd ../frontend
npm install

8️⃣ Environment Variables (Frontend)

Create:

📄 frontend/.env.local

NEXT_PUBLIC_API_URL=http://localhost:3001

9️⃣ Start Frontend
npm run dev


Frontend will be available at:

http://localhost:3000

🗄️ Database Schema (Summary)
Conversation

id

createdAt

Message

id

conversationId

sender (user | ai)

text

createdAt

Each browser session maps to one conversation via a sessionId.

🧱 Architecture Overview
Backend Architecture

The backend follows a layered structure:

Routes: HTTP endpoints (/chat/message)

Controllers: Input validation, request handling

Services: LLM interaction (llm.service.ts)

DB Layer: Prisma ORM for persistence

This separation makes it easy to:

Swap LLM providers

Add new channels (WhatsApp, IG, etc.)

Extend business logic without touching routing

Frontend Architecture

Single-page chat interface (Next.js App Router)

Stateless UI

Session ID persisted in localStorage

shadcn/ui for clean, accessible components

Optimistic UI updates with typing indicator and error states

No authentication or global state library is used (intentionally).

🤖 LLM Notes
Provider Used

Google Gemini (via @google/generative-ai)

Prompting Strategy

A system-style prompt seeds the AI with store knowledge:

Shipping policy

Return policy

Support hours

Recent conversation history is included for context

The AI is instructed to answer clearly, concisely, and politely

Example (simplified):

You are a helpful support agent for a small e-commerce store.
Store policies:
- Shipping: Worldwide, 2–3 business days
- Returns: 30-day window for unused items
- Support hours: Mon–Fri, 9am–6pm IST

Error Handling & Guardrails

LLM/API failures are caught

The backend never crashes on bad input

On failure, the system returns a deterministic, helpful fallback response

No secrets are hard-coded

This ensures the chat experience remains functional even if the LLM is unavailable.

🛡️ Robustness & Idiot-Proofing

The system is designed to handle:

Sustaining messages on reloads and the ability to create a new chat.

Empty messages (rejected)

Very long messages (warned/rejected)

Invalid or missing session IDs

LLM downtime

Page reloads mid-conversation

Graceful failure is preferred over silent failure or crashes.

🔄 Trade-offs & Future Improvements
Trade-offs Made

FAQ knowledge is hardcoded in the prompt (simple, explicit)

Chat history is not reloaded on page refresh (backend persists it, UI does not fetch it)

No streaming responses (simpler UX, fewer edge cases)

If I Had More Time


Add LLM response streaming

Improve prompt grounding with structured policy objects

Add basic analytics (message count, latency)

Deploy with environment-specific configs

✅ Final Notes

This project focuses on:

Correctness over cleverness

Clear architecture over overengineering

Robustness over flashy features

It reflects how a real customer support AI widget might be built in a production SaaS environment.
