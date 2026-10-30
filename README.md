# IntellMeet — Enterprise AI Meeting & Collaboration Platform

> An intelligent, production-ready virtual meeting platform built using **React**, **TypeScript**, **Tailwind CSS**, **Node.js**, **Express**, **MongoDB**, **Socket.io**, and **WebRTC**. IntellMeet delivers low-latency HD video conferencing, real-time speech-to-text subtitles, and autonomous AI-generated meeting minutes with action items extraction.

---

## 🚀 Key Highlights & Architecture

- **HD Video Conferencing & Screen Sharing:** Direct hardware streaming via WebRTC (`getUserMedia`, `getDisplayMedia`) with STUN signaling mesh.
- **Real-Time Collaboration Mesh:** Bi-directional Socket.io room orchestration for instant chat messaging, presence detection, and participant tracking.
- **Client-Side Live Voice Transcription:** Zero-latency speech-to-text using the HTML5 Web Speech API (`SpeechRecognition`) with real-time subtitle broadcasting.
- **Autonomous AI Meeting Intelligence:** Executive summary generation, key decisions extraction, and interactive action items checklist (via OpenAI GPT-4o-mini / built-in intelligent contextual NLP engine).
- **Enterprise Database Layer:** 12 comprehensive Mongoose schemas with indexes, relationships, and validation, backed by an automated in-memory fallback store for uninterrupted developer experience.
- **Enterprise Dark Theme UI:** Modern dashboard built with React 18, Tailwind CSS, Lucide icons, TanStack Query, and Zustand state management.

---

## 📁 Repository Structure

```
intellmeet/
  ├── client/                     # Frontend Application (React + Vite + TypeScript)
  │   ├── src/
  │   │   ├── assets/             # Brand logos and iconography
  │   │   ├── components/         # Reusable UI primitives and layout components
  │   │   ├── contexts/           # Socket.io real-time provider
  │   │   ├── features/           # Modular meeting, chat, and AI features
  │   │   ├── hooks/              # Custom hooks (useWebRTC, useSpeechRecognition, useSocket)
  │   │   ├── layouts/            # MainLayout shell and meeting room layout
  │   │   ├── pages/              # HomePage, MeetingPage, HistoryPage, NotFoundPage
  │   │   ├── routes/             # Client-side React Router tree
  │   │   ├── services/           # Typed REST API clients
  │   │   ├── stores/             # Zustand stores (meetingStore, authStore)
  │   │   ├── styles/             # Tailwind CSS & glassmorphic styling
  │   │   ├── types/              # Frontend TypeScript definitions
  │   │   └── utils/              # Helper utilities, constants, class merger
  │   ├── index.html
  │   ├── package.json
  │   ├── tailwind.config.js
  │   ├── tsconfig.json
  │   └── vite.config.ts
  │
  ├── server/                     # Backend API & WebSocket Server (Node + Express + TS)
  │   ├── src/
  │   │   ├── config/             # Zod environment validation, MongoDB connection, CORS
  │   │   ├── controllers/        # Health, Meeting, and AI controllers
  │   │   ├── middleware/         # Centralized error handler, request logger, validator
  │   │   ├── models/             # 12 Mongoose Schemas (User, Meeting, Workspace, etc.)
  │   │   ├── routes/             # Modular API routes (/api/v1/health, /meetings, /ai)
  │   │   ├── services/           # Meeting persistence & AI summarization business logic
  │   │   ├── sockets/            # Socket.io handlers (signaling, room, chat, transcription)
  │   │   ├── utils/              # Structured logger, AppError, ApiResponse, asyncHandler
  │   │   ├── validators/         # Zod request payload validation schemas
  │   │   ├── workers/            # Asynchronous background job worker skeleton
  │   │   └── index.ts            # Server entry point with graceful shutdown
  │   ├── package.json
  │   └── tsconfig.json
  │
  ├── shared/                     # Shared Contracts & Constants (NPM Workspace)
  │   ├── src/
  │   │   ├── constants/          # Socket events, user/workspace/meeting roles
  │   │   ├── types/              # Cross-stack DTOs and API response interfaces
  │   │   └── index.ts
  │   ├── package.json
  │   └── tsconfig.json
  │
  ├── docs/                       # Architecture & Database Schema Documentation
  │   ├── ARCHITECTURE.md
  │   └── DATABASE_SCHEMA.md
  │
  ├── tests/                      # Automated Verification & Health Test Suite
  │   └── foundation.test.ts
  │
  ├── package.json                # Monorepo Workspace Root
  ├── DEVELOPMENT_PROGRESS.md     # Phase-by-phase implementation tracker
  └── .env.example                # Unified environment configuration template
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, React Router, TanStack Query, Zustand, Lucide React |
| **Backend** | Node.js (v20+), Express.js, TypeScript, Mongoose ODM, Socket.io, Zod, Helmet, Morgan |
| **Database** | MongoDB with 12 structured collections + Resilient In-Memory Fallback Buffer |
| **Media & AI** | WebRTC (`getUserMedia`, `getDisplayMedia`), HTML5 Web Speech API, OpenAI API / Built-in NLP |
| **Tooling** | npm Workspaces, ESLint, Prettier, tsx |

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB** (optional): Runs with direct MongoDB connection or automatic resilient in-memory fallback.

### 2. Installation
Install all monorepo workspace dependencies:
```bash
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `server/.env`:
```bash
cp server/.env.example server/.env
```

### 4. Running the Development Servers
Run both Backend and Frontend concurrently from the project root:
```bash
npm run dev
```
- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Health Check**: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)

---

## 📋 Available Scripts

- `npm run dev`: Concurrently starts both server and client in live-reload watch mode.
- `npm run dev:server`: Starts Express + Socket.io server using `tsx watch`.
- `npm run dev:client`: Starts Vite frontend development server.
- `npm run build`: Typechecks and builds `shared`, `server`, and `client`.
- `npm run typecheck`: Runs strict TypeScript type-checking (`tsc --noEmit`) across all packages.
- `npm run test`: Executes the verification test suite.

---

## 🔐 API Reference

### Health & System Status
- `GET /api/v1/health`: Returns server status, uptime, database connection state, active socket clients, and memory usage.

### Meetings Management
- `GET /api/v1/meetings`: Retrieve recent meeting sessions and minutes.
- `GET /api/v1/meetings/:roomId`: Fetch a specific meeting by room identifier.
- `POST /api/v1/meetings`: Save a completed meeting report with executive summary and action items.

### AI Meeting Intelligence
- `POST /api/v1/ai/summarize`: Analyzes transcript dialogue and chat messages, producing executive summary, key decisions, and checkable action items with assignees.

---

## 📄 License
MIT License © 2026 IntellMeet Team.
