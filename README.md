# JARVIS — Personal AI Assistant & Second Brain

> **Current Status**: **Phase 1 — Core Intelligence & Conversational System**

JARVIS is a real, modular personal AI system engineered around the core security principle:
**CAPABILITY DOES NOT EQUAL PERMISSION.**

The web interface is only one possible interface to the underlying JARVIS Core engine.

---

## 🏛️ Architecture Overview

```text
                        USER
                         │
                 ┌───────┴───────┐
                 │  INPUT LAYER  │
                 │  (Text, UI)   │
                 └───────┬───────┘
                         ↓
                    JARVIS CORE
                         ↓
           ┌─────────────┴─────────────┐
           ↓                           ↓
   SECURITY GUARDIAN           PERMISSION MANAGER
   (Threat Analysis &          (Default Deny,
    Unauthorized Blocking)      Permission Hierarchy)
           │                           │
           └─────────────┬─────────────┘
                         ↓
                 SESSION CONTEXT
                         ↓
                 JARVIS PERSONALITY
                         ↓
                AI PROVIDER ADAPTER
           (Google Gemini / OpenAI / Mock)
                         ↓
                    REAL AI MODEL
                         ↓
                 OBSERVABILITY & AUDIT
                         ↓
                  STANDARDIZED RESPONSE
```

---

## 🌟 Capabilities in Phase 1

### Genuinely Implemented & Working:
- **Real AI Conversation Engine**: Connects to actual generative AI models (Google Gemini API, OpenAI-compatible APIs) via the `AIProvider` abstraction.
- **Session-Based Conversation Memory**: Multi-turn context preservation within isolated sessions (`sessionId`).
- **Original JARVIS Personality**: Calm, articulate, practical, respectful, confident without pretending, and honest about system boundaries.
- **Step-by-Step Mathematics**: Answers and breaks down algebra, calculus, arithmetic, and problem solving.
- **Software & Conceptual Coding Support**: Explains code, reviews algorithms, and discusses architectures without falsely claiming repository file modifications.
- **Security Guardian & Default-Deny**: Evaluates inputs for unauthorized actions (credential dumping, authentication bypasses, privilege escalation, unverified downloads).
- **Audit Trail & Secret Redaction**: All request events, decisions, and system logs redact API keys and passwords.
- **Web Interface**: Clean, accessible, responsive dark UI served at `http://127.0.0.1:3000` with session tracking and prompt chips.

### 🚫 Strictly Not Implemented Yet (Honest System Boundaries):
- Permanent Second Brain knowledge graph across sessions (Phase 4/5/27)
- Physical camera or microphone recording (Phase 19/20)
- Laptop, phone, or Bluetooth peripheral control (Phase 21)
- Live autonomous web browsing via tools (Phase 17)
- Autonomous file modification without user permission (Phase 10)
- OS-level antivirus / kernel-level malware scanning (Phase 29)
- Tuklas direct integration (Phase 12)
- Automated financial trading or transactions (Phase 16)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v20+ or v24+ (Tested on Node.js v24.21.0)
- **npm**: v10+ (Tested on npm 11.19.0)

### Installation
```bash
# Clone or navigate to the repository
cd jarvis

# Install dependencies
npm install
```

### Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure your environment variables:
```ini
# Application Port & Host
PORT=3000
HOST=127.0.0.1
NODE_ENV=development

# AI Provider (google, openai, or mock)
AI_PROVIDER=google
AI_MODEL=gemini-2.5-flash

# API Keys (Stored server-side only; never exposed to frontend)
GOOGLE_API_KEY=your-gemini-api-key-here
# or OPENAI_API_KEY=your-openai-api-key-here

# Security & Guardian
ENABLE_AUDIT_LOGS=true
STRICT_DEFAULT_DENY=true
```

### Running JARVIS
```bash
# Build the TypeScript project
npm run build

# Start the production server
npm start

# Or run in development mode with live reload
npm run dev
```

Open your browser to:
```
http://127.0.0.1:3000
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check endpoint returning uptime and service status |
| `GET` | `/api/jarvis/status` | Architecture overview and active subsystem metrics |
| `POST` | `/api/jarvis/chat` | Send a chat message with session context |
| `POST` | `/api/jarvis/session` | Create a new isolated conversation session |
| `GET` | `/api/jarvis/session/:id/messages` | Retrieve session message history |
| `GET` | `/api/agents` | Query registered modular agents and their readiness status |
| `GET` | `/api/tools` | Query registered tools and their declared required permissions |
| `POST` | `/api/permissions/check` | Check permission grants against resource and action |
| `GET` | `/api/audit/logs` | Query sanitized audit records |

---

## 🧪 Testing & Validation

Run the full Vitest suite (44 automated tests covering unit, integration, and security specifications):
```bash
# Run all tests
npm test

# Run TypeScript compiler check
npm run typecheck

# Build the project
npm run build
```

---

## 📜 Development Discipline

Every phase adheres to:
$$\text{INSPECT} \longrightarrow \text{PLAN} \longrightarrow \text{IMPLEMENT} \longrightarrow \text{TEST} \longrightarrow \text{VERIFY} \longrightarrow \text{DOCUMENT} \longrightarrow \text{COMMIT}$$

> **Core Rule**: A capability is never called "working" until it actually executes in the real environment and passes verification.
