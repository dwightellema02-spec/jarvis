# JARVIS — Personal AI Assistant & Second Brain

> **Current Status**: **Phase 2 — The Orchestrator (Intent → Plan → Risk Gating → Permission Check → Execute → Verify)**

JARVIS is a real, modular personal AI system engineered around the core security principles:
1. **CAPABILITY DOES NOT EQUAL PERMISSION.**
2. **VERIFY BEFORE DECLARING DONE (NO FAKE COMPLETIONS).**
3. **RISK-AWARE GATING (LOW → MEDIUM → HIGH → CRITICAL).**

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
                   ORCHESTRATOR
         ┌───────────────┼───────────────┐
         ↓               ↓               ↓
   TASK PLANNER    AGENT ROUTER     TOOL ROUTER
         │               │               │
         └───────────────┼───────────────┘
                         ↓
               RISK EVALUATION ENGINE
         (LOW → MEDIUM → HIGH → CRITICAL)
                         ↓
           ┌─────────────┴─────────────┐
           ↓                           ↓
   SECURITY GUARDIAN           PERMISSION MANAGER
   (Threat Analysis &          (Default Deny,
    Unauthorized Blocking)      Permission Hierarchy)
                         ↓
                 EXECUTION MANAGER
                         ↓
                VERIFICATION ENGINE
         (Filesystem, Exit Codes, Schema, Math)
                         ↓
                 OBSERVABILITY & AUDIT
                         ↓
                  STANDARDIZED RESPONSE
```

---

## 🛡️ Risk Hierarchy & Gating (Phase 2)

| Risk Level | Characteristics & Scope | Authorization & Gating Requirements |
|---|---|---|
| **`LOW`** | Read-only informational queries, math problem solving, study planning, conversational advice. | Allowed if user has valid authenticated session. |
| **`MEDIUM`** | Reversible workspace writes, draft generation, local cache updates. | Requires explicit `WRITE` permission grant. |
| **`HIGH`** | Terminal shell execution, build/test commands, file deletions, audiovisual hardware streams. | Requires explicit `EXECUTE`/`ADMIN` permission grant **AND** explicit human confirmation. |
| **`CRITICAL`** | Financial asset transfers, credential access, OS-level modifications, auth bypasses. | **Prohibited by default**. Blocked from automated execution without human administrative elevation. |

---

## 🌟 Capabilities in Phase 2

### Genuinely Implemented & Working:
- **The Orchestrator**: Coordinates user goals through structured pipelines (`Understand → Plan → Select Agent/Tool → Risk Evaluation → Permission Check → Execute → Verify → Respond`).
- **Dynamic Risk Evaluation**: Automated risk classification on every step from `LOW` to `CRITICAL`.
- **Dedicated Verification Engine**: Verifies actual filesystem changes, command exit codes, schema compliance, and numerical calculations before declaring success. No step is marked complete without evidence.
- **Honest System Limitations**: Directly flags un-implemented capabilities (Camera, Laptop Control, Financial Trading) with exact target phase and alternative workarounds.
- **Real AI Conversation Engine**: Connects to actual generative AI models (Google Gemini API, OpenAI-compatible APIs) via the `AIProvider` abstraction.
- **Session-Based Conversation Memory**: Multi-turn context preservation within isolated sessions.
- **Security Guardian & Default-Deny**: Blocks malicious injections, phishing links, and unauthorized privilege escalations.
- **Audit Trail & Secret Redaction**: All request events, decisions, and system logs redact API keys and passwords.

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
| `POST` | `/api/jarvis/orchestrate` | Phase 2 Orchestrator executing verified plans with risk gating |
| `GET` | `/api/jarvis/profile` | Phase 3 Retrieve user identity, goals, projects, and study tracks |
| `PUT` | `/api/jarvis/profile` | Phase 3 Update user profile preferences and identity |
| `POST` | `/api/jarvis/profile/goals` | Phase 3 Add/manage user goals with milestones and priorities |
| `POST` | `/api/jarvis/profile/projects` | Phase 3 Add/manage user projects |
| `POST` | `/api/jarvis/profile/study-areas` | Phase 3 Add/manage learning tracks (LET, Math, AI) |
| `GET` | `/api/jarvis/profile/context` | Phase 3 Prompt context distillation & ephemeral vs persistent analysis |
| `GET` | `/api/jarvis/memory` | Phase 4 Query conversation memories with filters |
| `POST` | `/api/jarvis/memory` | Phase 4 Store episodic or semantic memory |
| `GET` | `/api/jarvis/memory/relevant` | Phase 4 Query relevant memories with prompt context generation |
| `POST` | `/api/jarvis/memory/correct` | Phase 4 Correct past memories with audit trail |
| `GET` | `/api/jarvis/memory/corrections` | Phase 4 Query history of memory corrections |
| `DELETE` | `/api/jarvis/memory/:id` | Phase 4 Delete memory record with permission checks |
| `GET` | `/api/jarvis/second-brain/tree` | Phase 5 Query full Second Brain hierarchical tree structure |
| `GET` | `/api/jarvis/second-brain/nodes` | Phase 5 List knowledge nodes with category & tag filters |
| `GET` | `/api/jarvis/second-brain/nodes/:id` | Phase 5 Get specific knowledge node by ID |
| `POST` | `/api/jarvis/second-brain/nodes` | Phase 5 Create knowledge node (gated by WRITE DATABASES) |
| `PUT` | `/api/jarvis/second-brain/nodes/:id` | Phase 5 Update knowledge node |
| `DELETE` | `/api/jarvis/second-brain/nodes/:id` | Phase 5 Delete knowledge node with relationship cascades |
| `POST` | `/api/jarvis/second-brain/nodes/:id/relate` | Phase 5 Create knowledge graph edge between nodes |
| `GET` | `/api/jarvis/second-brain/search` | Phase 5 Hybrid semantic & keyword knowledge search |
| `GET` | `/api/jarvis/second-brain/context` | Phase 5 Context distillation for prompt injection |
| `GET` | `/api/jarvis/documents` | Phase 6 List ingested documents in catalog |
| `POST` | `/api/jarvis/documents/ingest` | Phase 6 Ingest and parse PDF, DOCX, XLSX, CSV, notes, or paper |
| `GET` | `/api/jarvis/documents/:id` | Phase 6 Retrieve document sections, tables, and entities |
| `DELETE` | `/api/jarvis/documents/:id` | Phase 6 Delete document record (gated by ADMIN on FILES) |
| `GET` | `/api/jarvis/documents/:id/search` | Phase 6 Search in-document passages with relevance scoring |
| `POST` | `/api/jarvis/documents/:id/summarize` | Phase 6 Generate structured executive summary & metrics |
| `POST` | `/api/jarvis/documents/:id/qa` | Phase 6 Answer questions grounded in document text with citations |
| `POST` | `/api/jarvis/documents/compare` | Phase 6 Compare two documents side-by-side |
| `POST` | `/api/jarvis/documents/:id/analyze-table` | Phase 6 Tabular analytics, statistics, filters, and insights |
| `POST` | `/api/jarvis/documents/:id/to-knowledge` | Phase 6 Synthesize document takeaways into Second Brain graph |

---

## 👤 Phase 3 Architecture: Personal Identity & User Profile

JARVIS establishes an explicit contract distinguishing:
* **Temporary Conversation Information**: Ephemeral session messages, active in-flight reasoning, and scratchpad notes that vanish when the session closes.
* **Persistent User Information**: Long-term profile stored permanently in the user profile store:
  * **Identity**: User name, preferred address style, role, timezone, and locale.
  * **Preferences**: Communication tone, proactivity level, Socratic vs first-principles learning style, mathematical pedagogy (proof-driven vs formula-driven).
  * **Active Goals**: Milestones, priority levels (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), target completion dates (e.g. Philippine LET Licensure Examination).
  * **Active Projects**: Workspace paths, associated goals, and statuses (e.g. JARVIS, Tuklas).
  * **Study & Review Tracks**: Topic progression, mastery levels, and curriculum alignment.
  * **Permission & Risk Presets**: Policy modes, whitelisted domains, and confirmation requirements.

---

## 🧠 Phase 4 Architecture: Conversation Memory

JARVIS provides persistent conversational memory with strict anti-hallucination discipline:
* **Short-Term & Multi-Session History**: Conversation messages indexed per session and retrievable across sessions.
* **Relevance Engine**: Matches incoming queries by token overlap, keyword match, tag weights, confidence factor, and 30-day recency decay.
* **Memory Corrections**: When the user corrects previous facts, the system archives the old value, elevates confidence to 100%, and records an immutable audit log entry.
* **Default-Deny Memory Permissions**: Access to memory is gated through `ResourceType.DATABASES`. Unauthorized users are categorically blocked.
* **Honesty Directive**: When query matching yields no records, JARVIS's prompt is injected with an explicit directive: `"No relevant past memories found. Do not invent past memories."`

---

## 🌐 Phase 5 Architecture: Second Brain & Knowledge Graph

JARVIS organizes persistent knowledge into a structured Second Brain knowledge graph:
* **Root Hierarchy**: Centered on `YOU`, branching into five core pillars:
  * `Study & Learning`: Curriculum tracks (Calculus, Linear Algebra, ODEs, LET Licensure Review).
  * `Projects`: Workspaces and architectures (JARVIS, Tuklas EdTech Platform).
  * `Goals`: Milestones, target dates, and priority classifications.
  * `Schedule & Commitments`: Review blocks, deadlines, and milestone schedules.
  * `Knowledge & Notes`: Pedagogical concepts, research notes, and architectural security standards.
* **Graph Engine**: Semantic similarity scoring, token overlap, bidirectional relationship edges, and hierarchical tree visualization.
* **Context Distillation**: Semantic search injects top-ranking knowledge nodes directly into the core AI chat prompt, grounding responses in verified facts.
* **Permission Control**: Knowledge modification requires authorized `WRITE` permissions on `ResourceType.DATABASES`.

---

## 📄 Phase 6 Architecture: Document Intelligence

JARVIS provides real multi-format document processing, extraction, synthesis, and tabular analytics:
* **Supported Formats**:
  * `PDF`: Pure Node.js text stream extractor with `/FlateDecode` zlib decompression, font decoding, and page segmenting. Honestly identifies scanned raster image PDFs without digital text streams.
  * `DOCX`: OpenXML PKZIP extractor reading `word/document.xml`, paragraphs, headings, and embedded tables.
  * `XLSX & CSV`: RFC 4180 CSV parser and OpenXML spreadsheet reader supporting custom delimiters, quotes, multiline values, and numeric/date type inference.
  * `TXT, Notes & Markdown`: Structured section segmenter, heading detector, embedded markdown pipe-table parser, and entity extractor (dates, numbers, emails, URLs, key terms).
  * `Research Papers`: Academic IMRaD segmenter (Abstract, Introduction, Related Work, Methodology, Results, Discussion, Conclusion, References) and citation extractor (`[1]`, `[2, 3]`, `(Author, Year)`).
  * `Images`: Binary header format and dimension extractor (PNG IHDR, JPEG SOF0, GIF, WebP).
* **Core Capabilities**:
  * `Search`: Passage-level search with token stemming, matched term tracking, and relevance scoring.
  * `Summarize`: Executive overview, extracted key bullet points, reading time estimation, and main topic tags.
  * `Grounded Q&A`: Answers questions referencing specific document sections and source snippets.
  * `Comparison Engine`: Side-by-side comparison of two documents reporting similarity score (0.0 to 1.0), shared themes, exclusive points, and contradictions.
  * `Table Analyzer`: Numeric column statistics (mean, median, sum, min, max, stdDev), categorical distributions, row filtering (`eq`, `gt`, `gte`, `lt`, `lte`, `contains`), and automated data insights.
  * `Second Brain Ingestion`: Directly synthesizes document findings into persistent knowledge nodes (`domain: 'study'` or `'knowledge'`), linking back to projects (e.g. `JARVIS`, `Tuklas`) via graph edges.
* **Security & Permission Control**:
  * Gated by `ResourceType.FILES` (`READ` for parsing/querying, `ADMIN` for deletion).
  * Ingestion into Second Brain requires authorized `WRITE` on `ResourceType.DATABASES`.
  * `DocumentSanitizer` enforces size limits (50 MB) and strictly prevents path traversal attacks (`../`, system directories, `.env`, credentials).

---

## 🧪 Testing & Validation

Run the full Vitest suite (141 automated tests across 23 test files covering unit, integration, security, orchestration, profile, memory, Second Brain, and Document Intelligence specifications):
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
