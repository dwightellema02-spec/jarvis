# JARVIS — Personal AI Assistant & Second Brain

> **Current Status**: **Phase 29 — Security, Privacy & Permissions Hardening Active**

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
- Laptop, phone, or Bluetooth peripheral control (Phase 21)
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
| `GET` | `/api/jarvis/code/inspect` | Phase 10 Inspect repository structure, languages, tree, and entry points |
| `POST` | `/api/jarvis/code/search` | Phase 10 Search codebase with regex or substring and context lines |
| `POST` | `/api/jarvis/code/analyze` | Phase 10 Analyze AST symbols, cyclomatic complexity, and maintainability |
| `POST` | `/api/jarvis/code/review` | Phase 10 Automated code review and security vulnerability audit |
| `POST` | `/api/jarvis/code/propose` | Phase 10 Propose safe diff modification with line counts and risk evaluation |
| `POST` | `/api/jarvis/code/apply` | Phase 10 Atomically apply patch with verified disk check and backup |
| `POST` | `/api/jarvis/code/rollback` | Phase 10 Roll back modified file to previous timestamped backup |
| `POST` | `/api/jarvis/code/debug` | Phase 10 Parse error stack trace and generate root cause fix proposals |
| `POST` | `/api/jarvis/devenv/terminal/analyze` | Phase 11 Safety risk classification of shell commands (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) |
| `POST` | `/api/jarvis/devenv/terminal/execute` | Phase 11 Execute sandboxed shell command with confirmation gating and buffer protection |
| `GET` | `/api/jarvis/devenv/git/status` | Phase 11 Real porcelain git status parsing, branch tracking, and clean state |
| `GET` | `/api/jarvis/devenv/git/diff` | Phase 11 Working tree and staged git diff generator |
| `GET` | `/api/jarvis/devenv/git/log` | Phase 11 Structured commit history with hashes, author, timestamp, and message |
| `GET` | `/api/jarvis/devenv/git/branches` | Phase 11 Git branch enumeration with tracking and commit tips |
| `POST` | `/api/jarvis/devenv/git/commit` | Phase 11 High-risk git commit creation with explicit confirmation requirement |
| `GET` | `/api/jarvis/devenv/dependencies` | Phase 11 Package.json script overview and dependency manifest |
| `GET` | `/api/jarvis/devenv/dependencies/audit` | Phase 11 Real `npm audit --json` security vulnerability scanner and breakdown |
| `POST` | `/api/jarvis/devenv/build` | Phase 11 Real project build executor (`npm run build`) with duration profiling |
| `POST` | `/api/jarvis/devenv/typecheck` | Phase 11 Real TypeScript compilation checker (`npm run typecheck`) |
| `POST` | `/api/jarvis/devenv/test` | Phase 11 Real test runner execution (`npm test`) with filter support |
| `GET` | `/api/jarvis/tuklas/status` | Phase 12 Tuklas EdTech service status (local/remote mode, counts) |
| `GET` | `/api/jarvis/tuklas/lessons/search` | Phase 12 Search Tuklas curriculum lessons by subject, grade, and competency |
| `GET` | `/api/jarvis/tuklas/lessons/:id` | Phase 12 Retrieve detailed lesson markdown, objectives, and prerequisites |
| `POST` | `/api/jarvis/tuklas/lessons` | Phase 12 Authorized teacher function to publish curriculum lesson modules |
| `GET` | `/api/jarvis/tuklas/students/:id/progress` | Phase 12 Inspect student mastery heatmaps, streaks, and competency scores |
| `POST` | `/api/jarvis/tuklas/practice/generate` | Phase 12 Generate adaptive practice items with Socratic hints and steps |
| `POST` | `/api/jarvis/tuklas/assessments/evaluate` | Phase 12 Grade assessment submissions against passing threshold (75%) |
| `POST` | `/api/jarvis/tuklas/diagnostics/analyze-mistakes` | Phase 12 Misconception diagnostics with recommended remedial lesson links |
| `GET` | `/api/jarvis/tuklas/research/cohort-data` | Phase 12 Export anonymized cohort learning metrics (RA 10173 compliant) |
| `POST` | `/api/jarvis/tuklas/assignments` | Phase 12 Authorized teacher function to create student task assignments |
| `GET` | `/api/jarvis/tuklas/assignments` | Phase 12 List active classroom assignments by class section |
| `GET` | `/api/jarvis/skills` | Phase 24 Query catalog of custom skills with status filters |
| `GET` | `/api/jarvis/skills/:id` | Phase 24 Retrieve detailed draft skill specification and test cases |
| `POST` | `/api/jarvis/skills/draft` | Phase 24 Synthesize new custom skill draft from specification |
| `POST` | `/api/jarvis/skills/:id/test` | Phase 24 Run isolated sandbox execution suite with AST security screening |
| `POST` | `/api/jarvis/skills/:id/approve` | Phase 24 Human-in-the-loop operator governance review and approval |
| `POST` | `/api/jarvis/skills/:id/install` | Phase 24 Hot-register approved skill into active ToolRegistry |
| `POST` | `/api/jarvis/skills/:id/uninstall` | Phase 24 Safely unregister custom tool from ToolRegistry |
| `DELETE` | `/api/jarvis/skills/:id` | Phase 24 Delete custom draft skill record |
| `POST` | `/api/tools/:id/execute` | Phase 24 Direct live execution endpoint for registered tools |
| `GET` | `/api/jarvis/collaboration/templates` | Phase 25 List predefined multi-agent collaboration templates |
| `GET` | `/api/jarvis/collaboration/missions` | Phase 25 Enumerate multi-agent missions with status filters |
| `GET` | `/api/jarvis/collaboration/missions/:id` | Phase 25 Retrieve detailed mission plan, steps, blackboard, messages, and reviews |
| `POST` | `/api/jarvis/collaboration/missions` | Phase 25 Create a multi-agent mission plan with topology (pipeline, parallel, hierarchical, consensus) |
| `POST` | `/api/jarvis/collaboration/missions/:id/run` | Phase 25 Run a multi-agent mission end-to-end across cooperating agents |
| `GET` | `/api/jarvis/collaboration/missions/:id/blackboard` | Phase 25 Inspect shared mission blackboard entries or query key |
| `POST` | `/api/jarvis/collaboration/missions/:id/blackboard` | Phase 25 Write or update an artifact on the shared mission blackboard |
| `POST` | `/api/jarvis/collaboration/missions/:id/message` | Phase 25 Transmit direct inter-agent communication, query, or handoff on mission bus |
| `POST` | `/api/jarvis/collaboration/missions/:id/review` | Phase 25 Conduct cross-agent peer review critique and verification before consensus |
| `POST` | `/api/jarvis/verification/verify` | Phase 26 Run multi-checker verification plan with cryptographic SHA-256 fingerprinting |
| `POST` | `/api/jarvis/verification/evidence` | Phase 26 Collect single empirical evidence item across filesystem, processes, schemas, and math |
| `POST` | `/api/jarvis/verification/hallucination-audit` | Phase 26 Audit assertion grounding against source facts with risk index scoring |
| `POST` | `/api/jarvis/verification/diagnose` | Phase 26 Synthesize failure diagnosis, root-cause classification, and remedy |
| `POST` | `/api/jarvis/verification/retry-loop` | Phase 26 Execute self-healing auto-retry loop until verification passes or retries exhausted |
| `GET` | `/api/jarvis/verification/attestations` | Phase 26 List historical verification attestations with pass/fail and action filters |
| `GET` | `/api/jarvis/verification/attestations/:id` | Phase 26 Retrieve specific attestation with evidence fingerprint |
| `GET` | `/api/jarvis/verification/report` | Phase 26 Retrieve executive verification compliance and policy status report |
| `GET` | `/api/jarvis/learning/incidents` | Phase 27 List failure incidents with action and resolution status filters |
| `POST` | `/api/jarvis/learning/incidents` | Phase 27 Ingest runtime or verification failure and synthesize actionable heuristic |
| `GET` | `/api/jarvis/learning/incidents/:id` | Phase 27 Retrieve specific failure incident record |
| `GET` | `/api/jarvis/learning/rules` | Phase 27 List learned heuristic rules with category, status, and target filters |
| `GET` | `/api/jarvis/learning/rules/:id` | Phase 27 Retrieve learned heuristic rule by ID |
| `POST` | `/api/jarvis/learning/guardrails` | Phase 27 Match pre-execution guardrails and clamp parameters before execution |
| `POST` | `/api/jarvis/learning/correction-plan` | Phase 27 Synthesize adapted parameters correction plan from incident history |
| `POST` | `/api/jarvis/learning/rules/:id/feedback` | Phase 27 Record heuristic feedback (success/failure) to dynamically tune confidence |
| `GET` | `/api/jarvis/learning/report` | Phase 27 Retrieve learning evolution telemetry and recurrence rate report |
| `GET` | `/api/jarvis/context/snapshot` | Phase 28 Retrieve unified multi-engine context snapshot and state fingerprint |
| `POST` | `/api/jarvis/context/focus` | Phase 28 Activate or update focus session with mode, goal, and target duration |
| `POST` | `/api/jarvis/context/focus/end` | Phase 28 End active focus session and record completion metrics |
| `POST` | `/api/jarvis/context/query` | Phase 28 Blended multi-engine query matching profile, goals, memory, and knowledge |
| `GET` | `/api/jarvis/context/activities` | Phase 28 List unified activity stream with category and limit filters |
| `POST` | `/api/jarvis/context/activities` | Phase 28 Ingest new activity item into cross-subsystem timeline stream |
| `GET` | `/api/jarvis/context/cognitive-load` | Phase 28 Assess real-time cognitive workload level, score, factors, and guidance |
| `GET` | `/api/jarvis/context/overview` | Phase 28 Retrieve unified master dashboard overview with 30-engine operational grid |
| `GET` | `/api/jarvis/context/insights` | Phase 28 Generate proactive cross-system insights and health/productivity advisories |

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

## 🧮 Phase 7 Architecture: Mathematics & Learning Engine

JARVIS features a full mathematical intelligence stack combining real symbolic/numerical solvers, an 8-stage Socratic learning cycle, and an authentic Philippine BLEPT Board Licensure Examination for Teachers (LET) review engine:

### 1. Mathematical Solvers & Domains
* **Arithmetic & Number Systems**:
  * PEMDAS/BODMAS order of operations with step-by-step operand extraction.
  * Prime factorization and Fundamental Theorem of Arithmetic ($2^2 \cdot 3 \cdot 5$).
  * Greatest Common Divisor (GCD) using the Euclidean algorithm and Least Common Multiple (LCM).
  * Positional number base conversions across Binary (base 2), Octal (base 8), Decimal (base 10), and Hexadecimal (base 16).
* **Algebra & Systems**:
  * Linear equations ($ax + b = c$) with isolate-variable steps.
  * Quadratic equations ($ax^2 + bx + c = 0$) with discriminant ($\Delta = b^2 - 4ac$) evaluation, nature of roots (two distinct real, one repeated, or complex conjugate pair $a \pm bi$), and parabola vertex coordinates.
  * $2 \times 2$ systems of linear equations using Cramer's Rule ($D, D_x, D_y$).
* **Differential & Integral Calculus**:
  * Polynomial differentiation using the sum and power rules ($\frac{d}{dx}[x^n] = n x^{n-1}$) with tangent line slope evaluation at $x_0$.
  * Indefinite integration with reverse power rule and integration constant ($+ C$).
  * Definite integrals evaluated via the Fundamental Theorem of Calculus (FTC): $\int_a^b f(x) dx = F(b) - F(a)$.
  * First-order separable ordinary differential equations ($\frac{dy}{dt} = ky$) with Initial Value Problem (IVP) resolution.
* **Geometry & Trigonometry**:
  * 2D Right triangles (Pythagorean theorem solving for any unknown side), general triangles using Heron's formula, circles and circular sectors.
  * Law of Cosines for SAS oblique triangles ($c^2 = a^2 + b^2 - 2ab\cos C$).
  * 3D Solid geometry: Sphere surface area and volume, Cylinder surface area and volume, Cone slant height and volume.
* **Statistics & Combinatorics**:
  * Descriptive statistics: mean, median, modes, range, sample/population variance and standard deviation with Bessel's correction, quartiles, and IQR.
  * Combinatorics: factorials ($n!$), permutations ($P(n, r) = \frac{n!}{(n-r)!}$), and combinations ($C(n, r) = \frac{n!}{r!(n-r)!}$).
  * Probability: Bayes' Theorem posterior probability calculations ($P(A|B) = \frac{P(B|A)P(A)}{P(B)}$).
* **Sets & Propositional Logic**:
  * Set operations: Union ($A \cup B$), Intersection ($A \cap B$), and Difference ($A \setminus B$).
  * Truth table generation, Tautology/Contradiction classification, and conditional implication contrapositive analysis ($p \to q \equiv \neg q \to \neg p$).

### 2. Socratic Learning Cycle
Engineered around the pedagogical cycle:
$$\text{Assess} \longrightarrow \text{Identify Weaknesses} \longrightarrow \text{Teach Prerequisite} \longrightarrow \text{Worked Example} \longrightarrow \text{Practice} \longrightarrow \text{Check} \longrightarrow \text{Explain Mistake} \longrightarrow \text{Mastery}$$
* **Diagnostic Assessment**: Generates targeted multi-item diagnostics in any mathematical domain.
* **Weakness Detection & Remediation Plan**: Pinpoints failed prerequisite concepts and generates prescriptive action plans.
* **Prerequisite Instruction**: Explains conceptual theory and axioms before attempting problem solving.
* **Structured Worked Examples**: Step-by-step problem breakdowns with concept summaries and key takeaways.
* **Answer Evaluation & Mistake Rationalization**: Compares student responses, analyzes the specific error, and triggers remedial worked examples.
* **Mastery Progress**: Tracks consecutive correct attempts until 80%+ topic mastery is achieved.

### 3. Philippine BLEPT LET Mathematics Majorship Review Engine
* **Table of Specifications (TOS)**: Directly aligned with the Philippine Professional Regulation Commission (PRC) Board Licensure Examination for Professional Teachers (BLEPT) Mathematics Specialization specifications:
  * `LET-MATH-01`: Arithmetic, Number Theory & Real Number Systems (15%)
  * `LET-MATH-02`: College Algebra, Advanced Algebra & Linear Systems (20%)
  * `LET-MATH-03`: Plane & Solid Geometry and Trigonometry (20%)
  * `LET-MATH-04`: Calculus & Differential Equations (20%)
  * `LET-MATH-05`: Probability and Statistics (15%)
  * `LET-MATH-06`: Modern Mathematics, Logic, and Set Theory (10%)
* **Curated Question Bank**: 20 authentic board-exam-style questions with 4 options (A, B, C, D) and detailed distractor rationalizations (explaining why common misconceptions lead to specific wrong choices).
* **Mock Exam Simulator**: Interactive 20-item examination with instant scoring evaluated against the official 75.0% passing threshold, competency breakdown, and distractor feedback.

---

## 🔬 Phase 8 Architecture: Research Intelligence Engine

JARVIS features an academic research engine designed to uphold scholarly rigor and prevent citation hallucinations:

### 1. Epistemic Classification Engine
Classifies every passage or sentence into 5 epistemic categories:
* **FACT**: Verified historical, empirical, experimental, or demographic statements supported by quantitative metrics (`"In 2024, 450 participants completed the trial"`).
* **CLAIM**: Formal assertions or theoretical positions advanced by authors (`"Smith et al. argue that Socratic dialogue improves retention"`).
* **OPINION**: Subjective value judgments, personal assessments, or beliefs (`"This is the most remarkable approach"`).
* **INFERENCE**: Deductive or inductive logical conclusions drawn from premises (`"Therefore, retention rates increase"`).
* **UNCERTAINTY**: Hedged or tentative assertions requiring further corroboration (`"Results may possibly suggest tentative correlation"`).

### 2. Multi-Format Academic Citation Engine
Generates authentic citations without hallucinatory formatting across 5 academic citation standards:
* **APA 7th Edition**: `Author(s) (Year). Title. Journal/Source, Volume(Issue), Pages. DOI/URL`
* **IEEE Standard**: `[#] Authors, "Title," Source, vol. X, no. Y, pp. Z, Month Year. [Online]. Available: URL`
* **Chicago 17th Edition**: `Author(s). "Title." Source volume, no. issue (Year): pages.`
* **Harvard Style**: `Author(s) (Year) 'Title', Source, Volume(Issue), pp. Pages.`
* **BibTeX Format**: Clean, valid `@article` / `@book` entries for direct LaTeX integration.

### 3. PICO & FINER Research Question Generator
* **PICO Framework**: Formulates structured questions identifying Population (P), Intervention (I), Comparison (C), and Outcome (O).
* **FINER Criteria**: Evaluates Feasibility, Interest, Novelty, Ethics, and Relevance.
* **Hypothesis Formulation**: Automatically derives testable Null ($H_0$) and Alternative ($H_1$) hypotheses.

### 4. Multi-Source Evidence Comparator
* Synthesizes multiple empirical papers side-by-side.
* Computes consensus level: `STRONG_CONSENSUS`, `MODERATE_CONSENSUS`, `CONTESTED`, or `NO_CONSENSUS`.
* Highlights exact points of agreement and explicit contradictions.

### 5. Research Synthesis & Second Brain Ingestion
* Generates structured markdown research notes with executive summaries and epistemic breakdowns.
* Ingests verified facts directly into persistent Second Brain knowledge nodes (`domain: 'study'`), connecting evidence nodes to root topics via directed `supports` relationship edges.
* Built-in **anti-SSRF security** prevents ingestion of private/loopback IP ranges (`127.0.0.1`, `localhost`, `10.0.0.0/8`, `192.168.0.0/16`, `169.254.169.254`) and non-HTTP protocols.

---

## 📊 Phase 9 Architecture: Data & Statistics Engine

JARVIS features a full tabular data analytics and statistical modeling suite:

### 1. Data Cleaning & Integrity Engine
* **Format Support**: CSV (RFC 4180 quotes/commas/nulls) and raw JSON record arrays.
* **Type Profiling**: Automatic inference for numeric, categorical, boolean, and datetime columns.
* **Missing Value Handling**: Configurable strategies: `drop` incomplete rows, `impute-mean`, `impute-median`, `impute-mode`, or `constant`.
* **Deduplication**: Deep value-hash identification and removal of redundant records.
* **Outlier Detection**: Interquartile range ($1.5 \times \text{IQR}$) or Z-Score ($|Z| > 3.0$) trimming.

### 2. Descriptive Statistics Engine
Evaluates numerical vectors across:
* **Central Tendency**: Arithmetic Mean ($\bar{x}$), Median (interpolated $P_{50}$), and unimodal/multimodal Modes.
* **Dispersion**: Min, Max, Range, Sum, Sample Variance ($s^2$), Population Variance ($\sigma^2$), Sample Standard Deviation ($s$), Population Standard Deviation ($\sigma$).
* **Quartiles**: First Quartile ($Q_1$), Median ($Q_2$), Third Quartile ($Q_3$), Interquartile Range ($\text{IQR} = Q_3 - Q_1$).
* **Shape & Distribution**: Fisher-Pearson Skewness ($g_1$) and Sample Excess Kurtosis ($g_2$).

### 3. Relational & Predictive Modeling
* **Pearson Correlation**: Product-moment coefficient ($r$), coefficient of determination ($R^2$), direction, and qualitative strength classification (`very_weak` to `very_strong`).
* **Spearman Rank Correlation**: Monotonic correlation ($\rho$) evaluated via ranked transformations.
* **Linear Regression**: Ordinary least squares line of best fit ($y = mx + b$), $R^2$, standard error of estimate, and per-observation residual analysis.

### 4. Inferential Hypothesis Testing
* **One-Sample Student's $t$-Test**: Tests sample mean against theoretical or benchmark values ($\mu_0$, e.g. official 75.0% passing mark) with $df = n - 1$ and estimated two-tailed $p$-value.
* **Two-Sample Independent $t$-Test**: Welch-Satterthwaite $t$-test accommodating unequal group variances.

### 5. Multi-Format Visualization Engine
Generates standalone SVG visualizations with terminal ASCII fallbacks:
* `Bar Chart`: Vertical bars with value and category labels.
* `Line Graph`: Connected SVG path with data points and gridlines.
* `Histogram`: Automated frequency bins with counts and ranges.
* `Scatter Plot`: Point coordinates with optional regression trendline.
* `Pie Chart`: Trigonometric arc slices with percent labels and legend.
* `Box Plot`: Five-number summary ($Min, Q_1, \text{Med}, Q_3, Max$) with whiskers.

### 6. Pipeline Workflow & Second Brain Synthesis
* Complete automated pipeline: $\text{DATA} \to \text{CLEAN} \to \text{ANALYZE} \to \text{STATISTICS} \to \text{VISUALIZE} \to \text{EXPLAIN}$.
* Ingests statistical findings into Second Brain knowledge nodes (`domain: 'study'`, `category: 'STATISTICS'`) gated by `ResourceType.DATABASES`.

---

## 💻 Phase 10 Architecture: Coding Agent & AST Engine

JARVIS features a full-featured Coding Intelligence engine operating under strict security and permission rules:

### 1. Repository Inspector & Language Profiler
* **Tree Traversal**: Safely traverses directory trees while strictly ignoring `.git`, `node_modules`, `dist`, `.env`, and build artifacts.
* **Language Breakdown**: Measures file counts and byte sizes by file extension to compute accurate language percentages (TypeScript, JavaScript, JSON, Markdown, HTML, CSS, etc.).
* **Entry Point Detection**: Automatically identifies application entry points (`index.ts`, `app.ts`, `server.ts`, `main.py`, `index.js`).

### 2. Code Search (Grep Engine)
* Fast regex or literal substring search across codebase files.
* Extracts match line numbers, line contents, and surrounding context lines (default 2 before and 2 after).

### 3. AST & Structural Code Analysis
* **Symbol Extraction**: Detects classes, interfaces, functions, methods, imports, and exports with line numbers and signatures.
* **Cyclomatic Complexity Estimation**: Measures branch decision points (`if`, `for`, `while`, `case`, `catch`, `&&`, `||`, ternary `?`).
* **Maintainability Index**: Combines cyclomatic complexity, lines of code, and symbol density to compute a maintainability score ($0-100$).
* **Code Smells**: Flags overly complex functions, dead imports, and large files exceeding maintainability thresholds.

### 4. Automated Code & Security Review
* **Security Audit**: Scans for dangerous `eval()`, hardcoded credentials/tokens (`API_KEY`, `secret`, `password`), path traversal, prototype pollution (`__proto__`), and unhandled promises.
* **Best Practices**: Evaluates error handling, input validation, and typing consistency.
* Returns an overall review score ($0-100$), detailed pass/fail rule evaluation, and actionable recommendations.

### 5. Safe Atomic Modification & Rollback Engine
* **Path Boundary Protection**: Enforces workspace boundary containment, categorically rejecting path traversal attacks (`..`, `/`, `\`).
* **Diff Proposals**: Generates unified diff previews, lines added/removed, and dynamic risk level (`LOW`, `MEDIUM`, `HIGH`).
* **Automated Disk Backups**: Prior to modifying any file, generates a timestamped `.bak` backup in `.jarvis_backups/`.
* **Atomic Writes**: Writes modifications and verifies file integrity directly on disk with SHA256 checksums.
* **Instant Rollback**: Restores original file content from the latest backup upon user command.

### 6. Error Stack Trace Debugger
* **V8 Stack Trace Parser**: Parses Node.js and TypeScript runtime stack traces into structured frames (`file`, `line`, `column`, `functionName`, `isProjectCode`).
* **Error Classification**: Identifies error families (`TypeError`, `ReferenceError`, `SyntaxError`, `RangeError`, `AssertionError`).
* **Root Cause Diagnostics**: Analyzes project line context to formulate an evidence-based root cause hypothesis and step-by-step fix recommendations.

---

## 🛠️ Phase 11 Architecture: Development Environment Integration

JARVIS features a secure, real development environment interface operating under strict risk gating and default-deny permission controls:

### 1. Terminal Execution & Safety Risk Classification
* **Multi-Tier Risk Analyzer**: Evaluates every shell command across four safety tiers:
  * `CRITICAL`: Prohibits destructive operations (`rm -rf /`, `format`, `dd`, fork bombs, curl-pipe-to-shell, raw credential exfiltration). Categorically blocked by `SecurityGuardian`.
  * `HIGH`: Operations that modify system dependencies, publish code, or perform irreversible branch resets (`npm install`, `npm publish`, `git push`, `git reset --hard`, `git checkout -f`). Requires explicit user confirmation.
  * `MEDIUM`: Development build, test, and typecheck commands (`npm run build`, `npm test`, `npm run typecheck`).
  * `LOW`: Read-only queries, status inspections, and version checks (`node -v`, `git status`, `git log`, `npm -v`, `dir`).
* **Buffer & Timeout Safety**: Limits stdout/stderr buffers to 10MB to prevent memory exhaustion and terminates hung processes after a configurable timeout (default 30s).
* **Workspace Traversal Containment**: Rejects attempts to execute commands outside authorized directory boundaries.

### 2. Real Git Porcelain Integration
* **Porcelain Status Parser**: Parses `git status --porcelain -b` with zero guesswork, reporting branch name, upstream tracking branch, ahead/behind commit counts, clean working tree state, and per-file staged/unstaged/untracked statuses.
* **Diff Generator**: Generates clean working tree diffs or staged diffs (`git diff` / `git diff --staged`).
* **Structured Commit History**: Parses `git log` into structured commit records with full hash, abbreviated hash, author name, ISO timestamp, and subject message.
* **Branch Management**: Lists local and remote tracking branches with commit tips and active checkout markers.
* **Safe Commit Engine**: Creates git commits with commit message validation, gated by `HIGH` risk and explicit user confirmation.

### 3. Dependency Management & NPM Security Auditing
* **Manifest Inspector**: Parses `package.json` dependencies, devDependencies, and npm run scripts with version ranges.
* **Vulnerability Auditor**: Executes real `npm audit --json` and breaks down vulnerabilities by severity (`critical`, `high`, `moderate`, `low`, `info`) with advisory summaries and affected packages.

### 4. Build, Typecheck & Test Runners
* **TypeScript Compilation**: Executes `npm run typecheck` (`tsc --noEmit`), parses error count and diagnostic lines, and profiles duration.
* **Build Runner**: Executes `npm run build` (`tsc`), capturing compiler output and artifact generation status.
* **Test Runner**: Executes `npm test` (`vitest run`), supports targeted test filtering, and measures pass/fail outcomes.

### 5. Gating & Permission Architecture
* Gated by `ResourceType.SYSTEM` with `PermissionLevel.EXECUTE`.
* Integrated with `DevEnvAgent` (`id: 'devenv-agent'`) and 8 registered tools: `devenv.run_command`, `devenv.git_status`, `devenv.git_diff`, `devenv.git_log`, `devenv.git_commit`, `devenv.audit_dependencies`, `devenv.run_build`, `devenv.run_tests`.

---

## 🎓 Phase 12 Architecture: Tuklas EdTech Integration

JARVIS features a secure bridge to the Tuklas Educational Technology Platform, adhering to Philippine Department of Education (DepEd) K-12 competencies, Professional Regulation Commission (PRC) BLEPT Licensure standards, and the Philippine Data Privacy Act of 2012 (RA 10173):

### 1. Curriculum & Lesson Intelligence
* **Curriculum Alignment**: Built-in lesson modules aligned with official DepEd competencies (`M7AL-IIa-1` Algebraic Expressions, `M8AL-Ia-b-1` Factoring Polynomials, `M9AL-Ia-b-1` Quadratic Equations, `M10SP-IVa-1` Measures of Position, `S8FE-Ia-15` Newton's Laws of Motion) and PRC BLEPT standards (`LET-MATH-02` College Algebra).
* **Search Engine**: Full-text and metadata filtering by keyword, subject, grade level, and competency codes.
* **Instructional Structure**: Modules provide explicit learning objectives, prerequisite competencies, estimated duration, content markdown, and concept tags.
* **Teacher Publishing Workflow**: Authorized instructors can create and publish new curriculum lessons, strictly gated by `PermissionLevel.WRITE` on `ResourceType.TUKLAS`.

### 2. Student Mastery & Learning Analytics
* **Progress Tracking**: Monitors student overall mastery percentages ($0-100\%$), consecutive daily learning streaks, and completed lesson counts.
* **Competency Mastery Heatmap**: Breaks down mastery scores per curriculum competency, instantly revealing specific learning gaps.

### 3. Adaptive Practice & Assessment Grader
* **Practice Generator**: Creates targeted multi-item practice sets across easy, medium, and hard difficulty tiers with Socratic hints and step-by-step rationalizations.
* **Automated Assessment Evaluation**: Grades student submissions against answer keys, evaluating pass/fail status relative to the official 75.0% threshold.

### 4. Mistake Diagnostics & Remedial Linking
* **Deep Pedagogical Diagnostics**: Classifies student errors across four error categories:
  * `Conceptual`: Misunderstanding underlying mathematical definitions or theorems (e.g. sign error confusing difference of two squares with perfect square trinomials).
  * `Procedural`: Order of operations or skipped factoring sequence.
  * `Computational`: Arithmetic or radical calculation slip.
  * `Misreading`: Misinterpreting prompt conditions or unit mismatches.
* **Prescriptive Remediation**: Automatically links the diagnosed misconception directly to the recommended Tuklas curriculum lesson.

### 5. Cohort Research & Data Privacy (RA 10173)
* **Psychometric Metrics**: Calculates cohort mastery rates, item difficulty indices ($0.0-1.0$), and item discrimination indices ($-1.0$ to $+1.0$).
* **Privacy Compliance**: Automatically anonymizes all student records (e.g. `anon_st_8a1f`) to uphold the Philippine Data Privacy Act of 2012 (RA 10173) and prevent PII exfiltration.

### 6. Agent, Tools & Security Gating
* Gated by `ResourceType.TUKLAS` with default-deny permissions (`READ` for student access, `WRITE` for teacher functions).
* Integrated with `TuklasAgent` (`id: 'tuklas-agent'`) and 8 registered tools: `tuklas.search_lessons`, `tuklas.get_lesson`, `tuklas.check_student_progress`, `tuklas.create_practice`, `tuklas.evaluate_assessment`, `tuklas.analyze_mistakes`, `tuklas.get_research_data`, `tuklas.manage_teacher_tasks`.

---

## 🎨 Phase 13 — Creative Studio & Autonomous Content Generation

JARVIS features an integrated Creative Studio for scale-independent vector artwork, layout composition, presentation decks, subtitle synchronization, SSML speech specification, and cinematic video storyboarding:

### 1. Vector Image Generator & Post-Processing
* **Resolution-Independent SVG Engine**: Synthesizes pure vector SVG artwork across 5 distinct styles (`cyberpunk`, `digital_art`, `vector`, `minimalist`, `photorealistic`) and 4 aspect ratios (`16:9`, `1:1`, `4:3`, `9:16`).
* **Ambient Lighting & Geometry**: Generates multi-stop linear gradients, ambient light orbs, radial filters, background grids, glowing central geometries, orbiting nodes, and prompt metadata stamps.
* **Non-Destructive Post-Processing**: Filters existing SVG graphics with matrix grayscale conversion, RGB inversion, cyberpunk dual-channel color matrices, proportional coordinate scaling, and watermark stamping.

### 2. Graphic Designer & Vector Layout Engine
* **Automated Layout Presets**: Composes social open-graph banners ($1200\times630$), vertical posters ($800\times1200$), round emblem badges ($400\times400$), and tall infographics ($900\times1600$).
* **Theme Palettes**: Applies curated color systems (`dark_neon`, `academic_clean`, `modern_gradient`) with automated contrast calculation.
* **Component Layering**: Supports custom user-defined rectangles, circular accents, text layers, and embedded verification badges.

### 3. Presentation Slide Deck Builder & Exporter
* **Structured Multi-Slide Synthesis**: Generates cohesive 3-to-12 slide decks with automated narrative arc: Title & Objectives, Landscape & Challenge, Architecture & Methodology, Operational Execution, Impact Metrics, and Action Items.
* **Speaker Notes & Visual Cues**: Synthesizes detailed speaking notes and visual staging cues for each slide.
* **Standalone HTML Presentation Export**: Exports responsive HTML presentation decks with card navigation, slide indicators, and custom CSS styling.

### 4. Subtitle Timing & W3C SSML Audio Specifier
* **Precision Subtitles (SRT & WebVTT)**: Converts raw transcript texts into timed subtitle blocks with millisecond-precision timestamps (`00:00:01,200` for SRT and `00:00:01.200` for VTT) and customizable words-per-cue limits.
* **W3C-Compliant SSML Generation**: Synthesizes structured `<speak>` specifications with configurable voice gender (`male`, `female`, `neutral`), prosody speaking rate ($0.5\times$ to $2.0\times$), pitch shift ($-20\%$ to $+20\%$), inter-sentence breaks, and duration telemetry based on word count.

### 5. Cinematic Storyboard Planner & Render Manifest
* **Scene-by-Scene Cinematic Directing**: Generates multi-scene visual shot progressions with camera shot angles (`wide`, `medium`, `close_up`, `pan`, `overhead`), shot durations, voiceover dialogue, atmospheric sound effects, and transitions (`cut`, `fade`, `dissolve`).
* **Executable Render Manifest**: Produces a standardized JSON render manifest (`fps: 30`, `width: 1920`, `height: 1080`, scene indices) ready for external video rendering pipelines or 3D engines.

### 6. Creative Agent & Security Gating
* Gated by `ResourceType.CREATIVE` with default-deny permissions (`WRITE` required for generation and transformation).
* Integrated with `CreativeAgent` (`id: 'creative-agent'`) and 8 registered tools: `creative.generate_image`, `creative.edit_image`, `creative.compose_graphic`, `creative.create_presentation`, `creative.export_document_layout`, `creative.generate_subtitles`, `creative.synthesize_speech_spec`, `creative.create_storyboard`.

---

## 🎬 Phase 14 — Animation Pipeline & "Bring It Alive" Engine

JARVIS coordinates creative tools to bring static concepts, drawings, and characters to life through a verified 7-stage animation pipeline:

```text
IDEA ➔ DRAWING ➔ ASSETS ➔ LAYERS ➔ ANIMATION ➔ VOICE ➔ SOUND ➔ VIDEO
```

### 1. Hierarchical Asset & Layer Decomposition
* **Multi-Plane Scene Slicing**: Decomposes drawings and visual concepts into 7 distinct z-index planes (`layer_bg`, `layer_mid`, `layer_char_body`, `layer_char_head`, `layer_char_mouth`, `layer_char_arms`, `layer_fg`).
* **Anchor & Pivot Definitions**: Establishes transform-origin centers for all animatable groups, allowing rotation, translation, and scale without distortion.

### 2. 2D Skeletal Character Rigging
* **Joint Tree Hierarchy**: Defines bone structures and parental relationships: root hip anchor (`root_hip`), spine, chest, neck, head, shoulder joints, gesturing limbs, and leg stabilizers.
* **Pose Library**: Configures standard character key poses: `idle` (natural balance), `talk` (attentive gesture), `walk` (alternating leg swing), and `alert` (raised focal attention).
* **Viseme Phoneme Mouth Shapes**: Generates vector curves for standard mouth positions: neutral rest line (`rest`), open vowels (`A`, `E`, `O`), labial closures (`BMP`, `FV`), lingual stops (`L`), and expressive smiles (`wide_smile`).

### 3. Keyframe Motion Graphs & Easing Curves
* **Multi-Property Motion Tracks**: Computes timed property keyframes for translation, rotation, scale, and opacity.
* **Mathematical Easing Curves**: Supports `linear`, `ease_in`, `ease_out`, `ease_in_out`, `bounce`, and `elastic` interpolation.
* **Dual Rendering Outputs**:
  * Pure CSS `@keyframes` rules for high-performance browser rendering.
  * Native SVG SMIL tags (`<animateTransform>` and `<animate>`) for standalone vector files that play autonomously without external scripts.

### 4. Lip Sync & Phoneme-to-Viseme Alignment
* **Transcript Parsing**: Decomposes spoken dialogue into phonetic units, syllables, and pauses.
* **Millisecond-Accurate Viseme Timeline**: Maps audio transcript timings to mouth shape transitions, synchronizing facial expressions with voiceover tracks.

### 5. Multi-Track Foley & Audio Mixing
* **Composite Audio Tracks**: Organizes voiceover dialogue, atmospheric background scores, and discrete foley sound effects with start offsets, durations, and volume gains ($0.0-1.0$).

### 6. Interactive HTML5 Player & Render Manifest
* **Interactive HTML5 Player**: Generates self-contained player HTML with timeline scrubber input, play/pause toggles, elapsed time counters, and embedded SVG viewport.
* **Standardized Render Manifest**: Exports JSON manifests containing resolution, target FPS, layer z-orders, audio mixes, and executable FFmpeg CLI compilation commands (`ffmpeg -framerate 30 -i frame_%04d.png ...`).
* **Honest Tool Auditing**: Audits host system PATH for external rendering tools (`ffmpeg`, `blender`, `remotion`) without faking uninstalled packages.

### 7. Agent & Security Gating
* Gated by `ResourceType.ANIMATION` with default-deny permissions (`WRITE` required for scene composition and keyframing).
* Integrated with `AnimationAgent` (`id: 'animation-agent'`) and 8 registered tools: `animation.decompose_layers`, `animation.rig_character`, `animation.generate_keyframes`, `animation.sync_lips`, `animation.compose_scene`, `animation.export_player`, `animation.generate_render_manifest`, `animation.check_rendering_tools`.

---

## 🚀 Phase 15: Product Innovation & Venture Architecture Agent

JARVIS executes the complete **12-Stage Innovation & Venture Pipeline**:

```text
IDEA ➔ RESEARCH ➔ PROBLEM ➔ USERS ➔ COMPETITORS ➔ PRODUCT ➔ FEATURES ➔ UX/UI ➔ ARCHITECTURE ➔ BUILD ➔ TEST ➔ IMPROVE
```

### 1. Market Research & TAM/SAM/SOM Modeling
* **Deterministic Market Sizing**: Generates category-calibrated figures for Total Addressable Market (TAM), Serviceable Addressable Market (SAM), and Serviceable Obtainable Market (SOM) across AI DevTools, FinTech, Productivity SaaS, and vertical domains.
* **Competitor Moat & Defensibility Matrix**: Identifies key incumbents (e.g. GitHub Copilot, Cursor, Devin, Bloomberg, Notion) with empirical strengths, weaknesses, and architectural differentiation.
* **Customer Pain Points & Timing Catalysts**: Maps unaddressed operational bottlenecks and "Why Now" macroeconomic/technological tailwinds.

### 2. Product Specification & User Persona Synthesis
* **Ideal Customer Profiles (ICP)**: Synthesizes rich buyer and practitioner personas with demographics, strategic goals, Jobs-to-be-Done (JTBD), operational pain points, willingness to pay, and resonant user quotes.
* **RICE Feature Prioritization**: Deterministically scores product features via the formula:
  $$\text{RICE Score} = \frac{\text{Reach} \times \text{Impact} \times \text{Confidence}}{\text{Effort}}$$
* **MoSCoW Requirements Classification**: Maps features into `Must-Have`, `Should-Have`, `Could-Have`, and `Won't-Have` implementation buckets with complexity grading.

### 3. UX Journey & Technical Architecture Design
* **5-Stage Emotional UX Journey**: Maps customer touchpoints (`Discovery` $\rightarrow$ `Onboarding` $\rightarrow$ `Core Task` $\rightarrow$ `Value Realization` $\rightarrow$ `Retention`) paired with user emotional states and actionable UI wireframe cues.
* **Production-Grade Technical Blueprint**: Specifies frontend, backend, database (PostgreSQL 16 with pgvector), messaging/cache (Redis 7 + BullMQ), container orchestration, domain entity schemas (UUID PKs, foreign keys, timestamps), RESTful API routes with authentication tags, and strict enterprise security requirements (RBAC, AES-256 at rest, TLS 1.3 in transit, and immutable audit logs).

### 4. Sprint Roadmap & PMF Viability Scoring
* **5-Sprint Agile Roadmap**: Decomposes venture builds into structured 2-week milestones (Architecture Foundation, Core Execution Loop, Web Cockpit UX, Security Guardian Hardening, and Public Beta Launch) with deliverables and dynamic risk grading (`LOW`, `MEDIUM`, `HIGH`).
* **Deterministic Product-Market Fit Viability Score**: Evaluates venture viability (0–100%) synthesized from weighted Market Opportunity (40%), Technical Feasibility (35%), and Competitive Defensibility (25%), alongside strategic advantages and risk mitigations.

### 5. Security Gating, Agent & Tools
* Gated by `ResourceType.INNOVATION` with default-deny permissions (`WRITE` required for blueprint creation and feature prioritization).
* Coordinated by `InnovationManager` and autonomous `InnovationAgent` (`id: 'innovation-agent'`).
* 8 Registered Tools:
  1. `innovation.research_market`
  2. `innovation.define_user_persona`
  3. `innovation.prioritize_features`
  4. `innovation.design_ux_journey`
  5. `innovation.generate_tech_blueprint`
  6. `innovation.plan_sprint_roadmap`
  7. `innovation.create_product_blueprint`
  8. `innovation.evaluate_viability`

---

## 📈 Phase 16: Financial Research & Quantitative Intelligence Agent

JARVIS incorporates a institutional-grade quantitative finance and research intelligence subsystem designed for rigorous educational and mathematical modeling with strict security guardrails:

### 1. Market Ticker Analysis & Technical Indicators
* **Moving Averages**: Evaluates Simple Moving Averages (SMA 20, SMA 50, SMA 200) and Exponential Moving Averages (EMA 12, EMA 26).
* **Momentum Indicators**: Computes 14-period Relative Strength Index (RSI 14) and Moving Average Convergence Divergence (MACD value, signal line, histogram).
* **Volatility Modeling**: Calculates Bollinger Bands (Upper, Middle, Lower bands, bandwidth) and annualized percentage volatility ($\sigma \times \sqrt{252}$).
* **Support & Resistance**: Identifies key structural price levels and trend momentum classifications (`strong_bullish`, `bullish`, `neutral`, `bearish`, `strong_bearish`).

### 2. Fundamental Valuation & DCF Modeling
* **5-Year Discounted Cash Flow (DCF)**: Projects multi-year Free Cash Flows discounted at Weighted Average Cost of Capital (WACC), computing Gordon perpetual growth terminal value:
  $$\text{Terminal Value} = \frac{\text{FCF}_5 \times (1 + g)}{\text{WACC} - g}$$
* **Enterprise Fair Value & Margin of Safety**: Derives estimated intrinsic share price and percentage margin of safety relative to current market quote.
* **Valuation Multiples**: Evaluates Price-to-Earnings (P/E), Price-to-Sales (P/S), Enterprise Value to EBITDA (EV/EBITDA), and Free Cash Flow Yield.
* **Earnings Breakdown**: Tracks quarterly revenue, GAAP/Non-GAAP EPS actuals vs consensus estimates, earnings surprise %, YoY growth rates, gross/operating margins, and management forward guidance summaries.

### 3. Modern Portfolio Theory (MPT) & Risk Analytics
* **Markowitz Efficient Mean-Variance Modeling**: Computes portfolio expected annual return ($\mathbf{w}^T \mathbf{R}$) and true portfolio variance using the full pairwise asset covariance matrix:
  $$\sigma_p^2 = \sum_{i} \sum_{j} w_i w_j \sigma_i \sigma_j \rho_{ij}$$
* **Risk-Adjusted Return Ratios**: Calculates Sharpe Ratio and Sortino Ratio (downside deviation adjusted) against official risk-free Treasury benchmarks.
* **Parametric Value at Risk (VaR)**: Derives 1-day 95% VaR ($1.645 \times \frac{\sigma_p}{\sqrt{252}}$) and 99% VaR ($2.326 \times \frac{\sigma_p}{\sqrt{252}}$).
* **Asset Correlation Matrix**: Generates cross-asset Pearson correlation matrices for multi-asset portfolios (Equities, ETFs, Crypto, Fixed Income, Commodities) and computes 0–100 diversification scores.

### 4. Macroeconomic Regime & Economic Signals
* **Core Economic Indicators**: Monitors CPI Inflation YoY, Federal Funds Rate, 10Y-2Y Treasury Yield Curve Spread, Real GDP growth, and Unemployment rates.
* **Yield Curve Status & Recession Probability**: Evaluates inverted, flat, or normal yield curve dynamics and models recession risk levels (`low`, `moderate`, `elevated`, `high`).
* **Macroeconomic Regime Categorization**: Classifies the current economy into `disinflationary_boom`, `expansion`, `stagflation`, or `contraction`, outputting systematic asset class allocation cues across equities, fixed income, and cash equivalents.

### 5. Algorithmic Strategy Backtesting
* **Golden Cross / SMA Crossover**: Simulates moving average trend-following rules over configurable historical trading candle timeframes.
* **RSI Mean-Reversion**: Simulates counter-trend exhaustion strategies (e.g. 30 oversold / 70 overbought triggers).
* **Performance Metrics**: Computes total strategy return %, benchmark buy-and-hold return %, trade count, win rate %, profit factor, maximum percentage drawdown, and detailed trade execution log samples.

### 6. Security Invariants & Default-Deny Safety Gating
* **Mandatory Legal Disclaimer**: Every financial output includes: *"JARVIS Financial Research provides quantitative analysis and educational mathematical modeling, not licensed fiduciary financial advice or investment recommendations. Live capital execution is strictly prohibited by default-deny security policy."*
* **Prohibited Real-Money Trading (Hard Invariant)**: In `SecurityGuardian`, `ResourceType.FINANCIAL_SERVICES` triggers `ThreatCategory.UNAUTHORIZED_FINANCIAL_ACTION` with `CRITICAL` severity for any write/execute attempt. Live orders and fund transfers are strictly intercepted and blocked with HTTP 403 Forbidden.
* **Honest Broker Auditing**: Inspects sandbox API credentials and verifies simulation mode status, ensuring no live capital or unverified brokerage credentials are ever exposed.
* **8 Registered Tools**:
  1. `finance.analyze_ticker`
  2. `finance.valuation_model`
  3. `finance.portfolio_risk`
  4. `finance.macro_economic_overview`
  5. `finance.correlation_matrix`
  6. `finance.earnings_breakdown`
  7. `finance.backtest_strategy`
  8. `finance.check_broker_credentials`

---

## 🌐 Phase 17: Autonomous Web & Browser Agent

JARVIS incorporates an autonomous Web & Browser subsystem engineered for comprehensive research, data extraction, and web workflows with strict security boundaries:

### 1. Web Search & Safe Search Ranking
* **Algorithmic Search Provider**: Simulates query matching across structured knowledge indices with domain filtering and relevance scoring (0.0 to 1.0).
* **Safe Search & Domain Exclusion**: Automatically detects and excludes suspicious, adult, or low-reputation domains, prioritizing authoritative technical and scientific sources.

### 2. Page Reader & Sanitizing HTML Parser
* **Anti-SSRF Protection (Hard Invariant)**: In `PageReader.assertUrlSafe`, hostnames and resolved IPs are strictly validated against:
  * Loopback addresses (`127.0.0.1`, `localhost`, `0.0.0.0`)
  * Cloud metadata IP (`169.254.169.254`)
  * Private RFC 1918 blocks (`10.0.0.0/8`, `192.168.0.0/16`, `172.16.0.0/12`)
  * Prohibited non-HTTP protocols (`file:`, `gopher:`, `ftp:`)
  Any attempt to probe private network services is immediately rejected with HTTP 403 Forbidden.
* **XSS Sanitization & Stripping**: Strips executable tags (`<script>`, `<iframe>`, `<object>`, `<embed>`) and inline event handlers (`onload`, `onclick`, `onerror`) to sanitize untrusted web content before conversion.
* **Structured Markdown & Metadata Extraction**: Converts HTML into clean, semantic markdown while extracting headings, links, forms, and word counts.

### 3. Form Automation & Credential Safeguard
* **Schema & Field Inspection**: Discovers all `<form>` instances, parsing input fields, labels, types, and required validations.
* **Credential Field Warning**: Automatically flags password, token, or SSN fields, notifying the user before any interaction.
* **Automated Form Fill & Submission**: Validates payload schemas against form definitions, generates submit payloads, and simulates HTTP POST responses with comprehensive audit logging.

### 4. Controlled Sandbox File Downloads
* **Malware & Executable Download Shield**: `DownloadController` strictly blocks executable or script file extensions (`.exe`, `.scr`, `.bat`, `.cmd`, `.vbs`, `.ps1`, `.msi`, `.dll`, `.com`).
* **Sandbox Confinement & Size Caps**: Downloads are quarantined exclusively inside the designated `downloads/` sandbox directory with configurable size caps (default 50MB) and SHA256 checksum generation.

### 5. Multi-Step Browser Workflows & Stateful Session
* **Pipeline Runner**: Executes orchestrated multi-step browser tasks (`search` $\rightarrow$ `navigate` $\rightarrow$ `read` $\rightarrow$ `fill` $\rightarrow$ `download`) with per-step execution timing and failure resilience.
* **Stateful Browser Session**: Tracks navigation history, back/forward navigation, cookie jars, and cumulative session metrics across requests.

### 6. Security Gating, Agent & Tools
* Gated by `ResourceType.WEBSITES` with default-deny permissions (`READ` for search/reading, `WRITE` for form submission/download, `EXECUTE` for multi-step workflows).
* Coordinated by `BrowserManager` and autonomous `BrowserAgent` (`id: 'browser-agent'`).
* 8 Registered Tools:
  1. `browser.search`
  2. `browser.open_url`
  3. `browser.read_page`
  4. `browser.inspect_forms`
  5. `browser.fill_form`
  6. `browser.download_file`
  7. `browser.execute_workflow`
  8. `browser.session_status`

---

## 🖥️ Phase 18 Architecture: Application Control & Local Integration Agent

JARVIS features a controlled, security-gated interface with authorized host applications, process monitoring, deep-link scheme dispatching, and local desktop APIs:

### 1. Application Catalog & Authorization Statuses
* **Pre-Configured Applications**: VS Code, Text Editor (Notepad), Calculator, System Terminal, Obsidian Knowledge Base, Spotify Music Player, Slack Communication, Google Chrome, and Microsoft Edge.
* **Capability Does Not Equal Permission**: Automated application execution requires explicit authorization. Statuses: `authorized`, `pending`, `blocked`.
* **Blacklisted Destructive Utilities**: High-risk binaries (`format`, `regedit`, `rundll32`, `vssadmin`, `certutil`, `bcdedit`, `diskpart`, `shutdown`) are permanently prohibited from registration or execution.

### 2. Platform Process & Window Detector
* **Cross-Platform Discovery**: Queries active host processes and window titles via PowerShell (`Get-Process`) on Windows and POSIX `ps` on Unix, with deterministic test fallbacks.
* **Process Discovery Metrics**: Reports process ID (PID), executable name, window title, working set memory (MB), and responsiveness status.

### 3. Safe CLI Launcher & Command Chaining Shield
* **Argument Sanitization**: `CliAdapter` strictly scans command arguments, blocking shell injection and metacharacters (`;`, `&`, `|`, `` ` ``, `$`, quotes, newlines).
* **Process Termination**: Supports graceful process closing and forceful process termination by PID with audit logging.

### 4. Deep-Link URI Scheme Dispatcher
* **Prefix Verification**: Validates URI prefixes against registered application protocols (`vscode://`, `obsidian://`, `spotify://`, `slack://`).
* **Metacharacter Filter**: Neutralizes command injection attempts disguised inside URI query strings.

### 5. Local Application API Connector (REST / IPC)
* **Localhost Confinement**: Restricts outbound integration traffic strictly to local application APIs (e.g. Obsidian Local REST API on port `27123`).
* **Mandatory Authentication**: Enforces valid authentication tokens before dispatching commands when `apiAuthRequired` is enabled.

### 6. Window Management & UI Automation Safeguard
* **Safe Window Focus**: Brings authorized application windows to foreground.
* **Elevated Security Shield**: UI Automation and synthetic input are strictly forbidden on sensitive dialogues matching `/credential/`, `/password/`, `/user account control/`, or `/windows security/`.

### 7. Security Gating, Agent & Tools
* Gated by `ResourceType.APPLICATIONS` (`READ` for catalog/processes/audit, `WRITE` for URI/API commands, `EXECUTE` for launching/window control, `ADMIN` for modifying authorization statuses).
* Coordinated by `ApplicationManager` and autonomous `ApplicationControlAgent` (`id: 'app-control-agent'`).
* 8 Registered Tools:
  1. `apps.list_installed`
  2. `apps.get_running_processes`
  3. `apps.launch_application`
  4. `apps.close_application`
  5. `apps.focus_window`
  6. `apps.dispatch_uri`
  7. `apps.send_api_command`
  8. `apps.audit_authorization`

---

## 👁️ Phase 19 Architecture: Vision & Camera Intelligence

JARVIS incorporates real visual sensory capabilities, camera device ingestion, desktop screen capture, OCR recognition with mathematical formula extraction, document scanning, and privacy redaction shielding:

### 1. Camera Device Discovery & LED Indicator Invariant
* **Hardware Ingestion**: Discovers available hardware webcam devices (`cam_integrated_01`, `cam_external_4k`) and inspects resolutions and FPS ceilings.
* **Privacy LED Invariant**: Camera access is NEVER stealthy or background-only. Visual sensors explicitly activate physical/simulated hardware recording LEDs (`indicatorActive: true`) and signal telemetry whenever frames are acquired.
* **Rate-Limit Throttling**: Throttles rapid bursts exceeding `maxFps` (10 FPS limit) to prevent covert visual surveillance.

### 2. Desktop Screen Capture & Sensitive Window Shield
* **Desktop Grabber**: Supports fullscreen (1920x1080), specified window title, and coordinate bounding-box captures (`x, y, width, height`).
* **Sensitive Window Shield**: Strictly blocks screen capture on windows matching sensitive password managers and system credential dialogs (`1Password`, `Bitwarden`, `KeePass`, `Credential Manager`, `Windows Security`), throwing an immediate Security Guardian block.

### 3. Privacy Redaction & PII Masking Shield
* **Pre-Transmission Sanitization**: Automatically scans cleartext strings and visual text before transmission or external AI ingestion.
* **Redaction Patterns**:
  * Credit card numbers (Luhn compliant with formatting preserve: `••••-••••-••••-9012`).
  * API keys and secrets (`sk-`, `ghp_`, `AIzaSy`).
  * Cleartext passwords (`••••••••`).
  * Email addresses (`u•••@example.com`) and phone numbers (`•••-•••-4567`).
  * Coordinates blackout overlays for SVG images (`<rect fill="#000000">`).

### 4. Optical Character Recognition (OCR) Engine
* **Multimodal Text Extraction**: Parses visual document layouts into lines, words, confidences, and bounding boxes.
* **Structured Table Extractor**: Detects delimited cell patterns, parses column headers, and constructs structured row arrays.
* **Mathematical Formula Detection**: Detects mathematical expressions and equations ($f(x) = ax^2 + bx + c$, $D = b^2 - 4ac$) for KaTeX rendering.

### 5. Document & Whiteboard Scanning
* **Classification Pipeline**: Identifies document types (`receipt`, `id_card`, `whiteboard`, `document_page`, `diagram`) with confidence scoring.
* **Key-Value Extraction**: Extracts structured fields from invoices and forms (Total, Tax, Merchant, Date, Architecture components).

### 6. Security Gating, Agent & Tools
* Gated by `ResourceType.CAMERA` (`READ` for frame grabber, OCR, analysis, document scans; `WRITE` for redactions; `EXECUTE` for stream captures; `ADMIN` for hardware device administration).
* Coordinated by `VisionManager` and autonomous `VisionAgent` (`id: 'vision-agent'`).
* 8 Registered Tools:
  1. `vision.camera_status`
  2. `vision.capture_frame`
  3. `vision.capture_screen`
  4. `vision.analyze_image`
  5. `vision.ocr_extract`
  6. `vision.detect_objects`
  7. `vision.redact_sensitive`
  8. `vision.scan_document`

---

## 🎙️ Phase 20: Voice & Audio Intelligence Studio

Phase 20 equips JARVIS with full audio intelligence, real-time voice processing, speech synthesis, and acoustic awareness, strictly governed by physical privacy invariants.

### 1. Hardware Microphone Ingestion & Non-Stealth Privacy Guarantee
* **Hardware Device Discovery**: Enumerates connected audio hardware (`mic_integrated_array`, `mic_studio_cardioid`), querying channel count, sample rates (48,000 Hz 16-bit PCM), and capabilities.
* **Non-Stealth Invariant**: All audio acquisition explicitly verifies that `indicatorActive: true`. Capturing audio with recording indicators disabled is strictly blocked.
* **Hardware Mute Switch**: Real hardware mute toggle. When muted, all audio acquisition throws `Microphone is hardware-muted`, and wake-word listeners return `detected: false`.
* **Voice Activity Detection (VAD)**: Energy thresholding audio stream detector classifying continuous frames into speech segments, background noise, and silence boundaries.

### 2. Wake Word Detection Engine
* **Keyword Matching**: Scans continuous acoustic buffers and text streams for wake triggers (`"hey jarvis"`, `"jarvis"`).
* **Confidence & Utterance Extraction**: Strips the wake trigger keyword and computes detection confidence (0.95–0.98), returning the remaining user command utterance for immediate downstream orchestration.

### 3. Speech-to-Text (STT) Transcription Engine
* **Multi-Lingual Transcription**: Supports English (`en`), Filipino/Tagalog (`fil`), and Spanish (`es`).
* **Timestamped Word Breakdown**: Generates word-level timestamps (`startTimeMs`, `endTimeMs`) and per-word confidence ratings.
* **Flexible Payload Ingestion**: Supports both base64-encoded audio chunks and live streaming acoustic representations.

### 4. Natural Speech Synthesis (TTS) Engine
* **Four Voice Personas**:
  * `jarvis-classic`: Paul Bettany cadence, measured British English timbre.
  * `friday-us`: Irish/tactical military assistant persona.
  * `nexus-neutral`: Balanced, crisp technical AI assistant.
  * `let-mentor`: Filipino educator and instructional coach persona.
* **Prosody & Cadence Modulation**: Emotion tags (`neutral`, `confident`, `calm`, `urgent`, `enthusiastic`), pitch scaling ($0.5\times$ to $2.0\times$), and speech rate controls.
* **Phoneme Timing Map**: Generates viseme phonemes and timing cues for frontend lip-sync and visualizer alignment.
* **64-Point Waveform Envelope**: Normalized audio amplitude envelope for oscilloscope rendering.
* **Native 16-bit PCM RIFF WAV Binary Generator**: Assembles valid 44-byte RIFF/WAV headers and binary PCM sample data formatted as Base64, enabling immediate in-browser playback via HTML5 `<audio>` elements.

### 5. Environmental Acoustic Analyzer & Sound Event Detection (SED)
* **Spectral Analysis**: Computes ambient sound pressure level in decibels SPL ($20 \log_{10}(\text{RMS}) + 94$), signal-to-noise ratio (SNR), and dominant frequency peak in Hertz.
* **Acoustic Hazard Alerting**: Automatically triggers alerts when sound pressure exceeds 85 dB SPL (`hazardWarning: true`).
* **Sound Event Classifier**: Classifies environmental sounds into discrete event categories (`speech`, `keyboard_typing`, `alert_alarm`, `ambient_silence`) with confidence ratings.

### 6. Security Gating, Agent & Tools
* Gated by `ResourceType.MICROPHONE` (`READ` for microphone streams, STT, wake word, acoustic analysis; `WRITE` for mute control, persona configuration; `EXECUTE` for speech synthesis; `ADMIN` for hardware device administration).
* Coordinated by `VoiceManager` and autonomous `VoiceAgent` (`id: 'voice-agent'`).
* 8 Registered Tools:
  1. `voice.wake_word_listen`
  2. `voice.transcribe_audio`
  3. `voice.synthesize_speech`
  4. `voice.analyze_acoustics`
  5. `voice.set_voice_persona`
  6. `voice.detect_sound_events`
  7. `voice.mute_microphone`
  8. `voice.audio_stream_status`

---

## 🔌 Phase 21: Hardware, Device & IoT Integration Studio

Phase 21 establishes JARVIS as a physical and hardware computing orchestrator, interfacing with real host sensors, USB/Serial peripherals, Bluetooth Low Energy (BLE) beacons, and Smart Home IoT systems, strictly regulated by physical safety interlocks.

### 1. Host Hardware Sensor Telemetry
* **Real System Profiling**: Real-time sampling of CPU aggregate & per-core utilization, clock frequencies (MHz), physical/logical core counts, and thermal sensor outputs.
* **GPU & Memory Telemetry**: VRAM allocation, GPU core thermals, and host RAM utilization percentages.
* **Thermal Throttling Protection**: Evaluates die temperatures against critical thermal trip points (88°C), surfacing `throttlingDetected: true` and automated cooling load alerts.
* **Storage & Battery Metrics**: System drive capacity monitoring and AC/battery charging state tracking.

### 2. USB Peripheral Discovery & Microcontroller Serial Drivers
* **USB Topology Scanner**: Identifies connected HID input devices, serial bridge microcontrollers, and audio DAC interfaces.
* **COM Port Communications**: Configures bidirectional baud rate serial channels (`9600` to `115200` baud) with configurable data/stop/parity framing.
* **Command Sanitization Engine**: Intercepts and blocks dangerous MCU firmware erasure sequences (`FLASH ERASE`, `BOOTLOADER UNLOCK`, raw EEPROM overwrite), preventing accidental bricking.
* **MCU Protocol Framing**: Standardized packet wrapping with CRC checksum validation and bidirectional request/acknowledgement logging.

### 3. Bluetooth Low Energy (BLE) Manager
* **Proximity Beacon Radar**: Continuous BLE scanning returning discovered peripherals, dynamically jittered RSSI signal strengths (-100 to -30 dBm), and proximity categorizations (`immediate`, `near`, `far`).
* **GATT Service & Characteristic Exploration**: Explores Standard Bluetooth SIG services including Heart Rate (`0x180D`), Battery Service (`0x180F`), Environmental Sensing (`0x181A`), and Immediate Alert (`0x1802`).
* **Secure Read/Write Operations**: Enforces characteristic read/write permission guards, preventing unauthorized writes to read-only GATT descriptors.

### 4. Smart Home IoT Hub & Wattage Balancer
* **Lighting Systems**: RGB hex color modulation, Kelvin color temperature tuning (2700K warm to 6500K daylight), and dimming levels.
* **Climate Controls**: HVAC target temperature regulation across heating, cooling, and eco modes.
* **Real-Time Energy Metering**: Active wattage draw monitoring and cumulative energy consumption tracking (kWh).

### 5. Physical Safety Interlock & Emergency Killswitch
* **Wattage Ceiling Invariant**: Computes projected aggregate wattage before applying power commands. If projected power exceeds 2,400 Watts, the command is categorically rejected with `Wattage limit exceeded`.
* **Emergency Cutoff Killswitch**: Instant physical disconnect that shuts down all high-draw appliances and isolates connected systems during anomalies.
* **Trip Lockout & Recovery**: When tripped, all device power requests remain locked until an administrative reset (`POST /api/jarvis/devices/safety/cutoff` with `restore: true`) is executed.

### 6. Security Gating, Agent & Tools
* Gated by `ResourceType.DEVICES` (`READ` for telemetry, peripheral discovery, BLE scanning, safety status; `WRITE` for IoT state manipulation, serial transmissions, BLE writes; `EXECUTE` for calibration routines; `ADMIN` for emergency cutoffs and safety resets).
* Coordinated by `DeviceManager` and autonomous `DeviceAgent` (`id: 'device-agent'`).
* 8 Registered Tools:
  1. `device.list_devices`
  2. `device.get_telemetry`
  3. `device.control_iot`
  4. `device.serial_communicate`
  5. `device.ble_scan`
  6. `device.ble_connect`
  7. `device.safety_interlock`
  8. `device.hardware_status`

---

## 🎯 Phase 22: Goals, Personal Planning & Study Studio

Phase 22 implements JARVIS's personal executive operating system, transforming freeform human ambitions and long-term visions into structured, quantifiable, and automated execution plans:

$$\text{IDEA} \longrightarrow \text{GOAL} \longrightarrow \text{PLAN} \longrightarrow \text{TASKS} \longrightarrow \text{ACTION} \longrightarrow \text{PROGRESS}$$

### 1. Autonomous Idea-to-Progress Decomposer
* **SMART Criteria Formalization**: Decomposes natural language prompts into SMART goals ($Specific$, $Measurable$, $Achievable$, $Relevant$, $TimeBound$).
* **Milestone Sequences**: Constructs directed acyclic milestone graphs with target metrics, due dates, and quantifiable deliverables.
* **Auto-Enrollment**: Automatically commits decomposed deliverables into active project repositories and task backlogs upon operator approval.

### 2. Hierarchical Tasks & Eisenhower Priority Matrix
* **4-Quadrant Eisenhower Categorization**:
  * $\text{Quadrant 1 (Do First)}$: High Urgency & High Importance (immediate focus blockers).
  * $\text{Quadrant 2 (Schedule)}$: Low Urgency & High Importance (deep work, curriculum mastery, architectural synthesis).
  * $\text{Quadrant 3 (Delegate)}$: High Urgency & Low Importance (administrative chores, routine maintenance).
  * $\text{Quadrant 4 (Eliminate)}$: Low Urgency & Low Importance (distractions, low-yield context switching).
* **Execution Profiling**: Tracks estimated vs actual minutes spent, dependency chains, and agent assignment delegations (`dwight`, `coding-agent`, `research-agent`, `study-agent`).

### 3. Circadian Calendar Timeblocking & Conflict Detection
* **Cognitive Peak Window Alignment**: Allocates deep work sessions during circadian morning cognitive peaks (08:30–11:30) and reflective synthesis in late afternoon/evening.
* **Overlapping Conflict Diagnostics**: Evaluates candidate schedule intervals against active calendar commitments, identifying conflict duration in minutes.
* **Dynamic Focus Window Recommender**: Queries available timeblocks and suggests clear, uninterrupted slots tailored to desired work duration.

### 4. Curriculum Study Planner & Spaced Repetition (Ebbinghaus Curve)
* **Exponential Retention Modeling**: Implements the Ebbinghaus forgetting curve with advancing review intervals ($1\text{d} \longrightarrow 3\text{d} \longrightarrow 7\text{d} \longrightarrow 14\text{d} \longrightarrow 30\text{d}$).
* **Retention Feedback Loops**: Scoring $\ge 75\%$ advances the topic to the next interval; low recall scores ($< 75\%$) immediately reset the topic to a 1-day interval.
* **DepEd & BLEPT Alignment**: Built-in curriculum study plans for the PRC Board Licensure Examination for Professional Teachers (LET) - Mathematics Specialization.

### 5. Multi-Project Workspaces & Velocity Analytics
* **Integrated Workspaces**: Manages active deliverables across `JARVIS Master Autonomous OS`, `Tuklas EdTech Platform`, and `Academic Research Synthesis`.
* **Productivity Velocity Engine**: Calculates average goal completion rates, weekly task completion velocity ($14\text{ tasks/wk}$), and cumulative focus time.

### 6. Security Gating, Agents & Tools
* Gated by `ResourceType.PROJECTS` (`READ` for goals/task inspection, schedule queries, study plans; `WRITE` for creation, decomposition, updates; `ADMIN` for deletions and project reconfigurations).
* Coordinated by `GoalsManager`, `GoalAgent` (`id: 'goal-agent'`), and `ProjectAgent` (`id: 'project-agent'`).
* 8 Registered Tools:
  1. `goals.create_goal`
  2. `goals.decompose_idea`
  3. `goals.manage_tasks`
  4. `goals.track_progress`
  5. `goals.create_study_plan`
  6. `goals.schedule_timeblock`
  7. `goals.manage_project`
  8. `goals.eisenhower_matrix`

---

## ⏰ Phase 23 Architecture: Proactive JARVIS Intelligence Studio

JARVIS operates as a true autonomous assistant with background deadline monitoring, priority task unblocking, executive daily briefings, and strict operator monitoring boundaries:

### 1. The Proactive Invariant ("Proactive Does NOT Mean Unrestricted")
* **Explicit Project Whitelisting**: JARVIS is strictly restricted to inspecting projects authorized by the operator in `preferences.monitoredProjectIds` (seeded with `['proj_jarvis', 'proj_tuklas']`). Unapproved projects are never scanned.
* **Quiet Hours Suppression**: Non-critical notifications are automatically silenced during configured quiet hours (default: `22:30` to `07:00`). Critical milestone and overdue alerts safely bypass quiet hours.
* **Anti-Fatigue Rate Limiting**: Notifications are strictly capped per hour (default: `10/hr`) to prevent operator alert overload.

### 2. Proactive Daemon & Inspection Engine
* **Deadline Radar**: Inspects goals and milestones across approved projects, calculating hours remaining and generating imminent deliverable warnings.
* **Task Stall & Blocker Detection**: Identifies pending tasks waiting on unfinished prerequisites or exceeding estimated minutes, suggesting decomposition and sub-task unblocking.
* **Ebbinghaus Spaced Repetition Due Queue**: Inspects curriculum study plans from Phase 22, generating retention drill reminders when topics reach their spaced interval.
* **Continuous Next Action Scoring**: Continuously scores pending tasks using Eisenhower quadrant weights, dependency status, in-progress momentum, and circadian focus alignment ($0\text{ to }100$ impact score).
* **Executive Daily Briefings**: Synthesizes structured morning briefings (greeting, primary strategic objective, top mission tasks, upcoming milestones, system health telemetry, and inspirational note) and evening mission syntheses.

### 3. Security Gating, Agent & 8 Proactive Tools
* Gated by `ResourceType.PROJECTS` (`READ` for notification feed, suggestions, briefings, preferences; `WRITE` for read/dismiss/snooze actions, boundary updates; `EXECUTE` for background inspection cycle trigger).
* Powered by `ProactiveManager`, `PreferencesManager`, `NotificationManager`, `ProactiveDaemon`, and `ProactiveAgent` (`id: 'proactive-agent'`, `version: '0.23.0-phase23'`).
* 8 Registered Tools:
  1. `proactive.run_cycle` — Triggers a comprehensive background inspection cycle across approved projects.
  2. `proactive.list_notifications` — Retrieves active notifications filtered by status, severity, or type.
  3. `proactive.dismiss_notification` — Dismisses or snoozes notifications by ID.
  4. `proactive.suggest_next_action` — Returns scored and ranked actionable next steps.
  5. `proactive.scan_deadlines` — Inspects imminent milestones and due dates.
  6. `proactive.generate_briefing` — Synthesizes morning or evening executive briefings.
  7. `proactive.get_preferences` — Retrieves operator monitoring boundaries and rate limit settings.
  8. `proactive.update_preferences` — Modifies monitored projects, quiet hours, and notification channels.

### 4. Interactive HUD Proactive Studio
* **Notifications Feed Tab**: Real-time alert list with unread counter, severity color pills, snooze options, and instant dismiss controls.
* **Action Recommendations Tab**: Scored action cards with estimated time, delegate, action type pill, and impact score progress bars.
* **Executive Daily Briefing Tab**: Morning and evening briefing viewer with strategic focus goal, priority tasks, deadlines radar, and host telemetry.
* **Monitoring Boundaries Tab**: Interactive project authorization tag manager, quiet hours scheduler, rate limiting slider, and dispatch channel toggles.

---

## 🛠️ Phase 24 Architecture: Skill & Tool Builder Studio

JARVIS provides autonomous skill synthesis, safe sandboxed execution, strict governance oversight, and hot-reloadable tool installation:

### 1. The Governance Invariant ("No Automatic Unrestricted Self-Modification")
* **Strict Human-in-the-Loop Gate**: JARVIS will NEVER automatically inject or execute dynamically generated tools in production without passing sandboxed validation and receiving explicit operator review (`reviewAndApprove`).
* **State Machine Lifecyle**:
  $$\text{DRAFT} \longrightarrow \text{GENERATED} \longrightarrow \text{TESTING} \longrightarrow \text{TESTED} \longrightarrow \text{AWAITING\_APPROVAL} \longrightarrow \text{INSTALLED} \longleftrightarrow \text{DISABLED}$$
* **Audit Trail**: Every draft creation, test execution, approval decision, hot-install, and unregister operation is permanently logged through `AuditLogger` with user identity and rationale.

### 2. Sandbox Runner & Security Threat Screening
* **Static AST Threat Detection**: Analyzes source code prior to compilation, blocking dangerous primitives (`child_process`, `execSync`, `spawn`, `process.exit`, `process.kill`, `eval`, `Function(`, `__proto__`, hardcoded plaintext API keys).
* **Safe Compilation**: Wraps tool code in a strict execution harness declaring `execute(params, context)` with isolated parameter bindings.
* **Timeout & Boundary Protection**: Test cases run under 5,000ms timeout constraints with comprehensive output substring matching and negative error case validation.

### 3. Dynamic Skill Generator & Scaffolding
* **Scaffolding for 5 Specialized Tool Types**:
  * `custom_solver`: Pure mathematical and algorithmic solvers with input boundaries and formula evaluation.
  * `data_transformer`: JSON data cleaners, key sorters, minifiers, and pipeline converters.
  * `automation_script`: Local task automation, batch file processing, and safe text/crypto hashing.
  * `api_adapter`: REST protocol adapters with query parameter encoders and header mappings.
  * `workflow`: Multi-stage task sequences with state propagation.

### 4. Hot-Loading Tool Registry & Live Execution Bench
* **Dynamic Tool Wrapper**: Synthesizes full `ITool` instances dynamically implementing `id`, `name`, `description`, `parametersSchema`, and `execute(params, context)`.
* **Zero-Downtime Injection**: Injects approved tools directly into the active `ToolRegistry` via `registerImplementation()`. Orchestrator and agents immediately gain access.
* **Safe Deregistration**: `unregister(id)` cleanly drops the dynamic tool without restarting the server.
* **Live Test Bench**: The `/api/tools/:id/execute` endpoint provides instant testing of any installed tool from the HUD interface.

### 5. Security Gating, Agent & 8 Skill Builder Tools
* Gated by `ResourceType.SYSTEM` (`READ` for catalog and draft inspection; `WRITE` for drafting and running test harness; `ADMIN` for review approval, hot-installation, uninstall, and deletion).
* Coordinated by `SkillBuilderManager`, `SandboxRunner`, `SkillGenerator`, and `SkillBuilderAgent` (`id: 'skill-builder-agent'`, `version: '0.24.0-phase24'`).
* 8 Registered Tools:
  1. `skill_builder.draft_skill` — Generates a new custom tool draft from specification.
  2. `skill_builder.generate_implementation` — Scaffolds safe JavaScript implementation code by skill type.
  3. `skill_builder.test_skill` — Executes the test harness within the isolated security sandbox.
  4. `skill_builder.review_and_approve` — Records operator approval or rejection with audited reviewer notes.
  5. `skill_builder.install_skill` — Hot-loads an approved custom tool into the active ToolRegistry.
  6. `skill_builder.uninstall_skill` — Deregisters or disables a custom tool from ToolRegistry.
  7. `skill_builder.list_skills` — Queries custom skills catalog with status filters.
  8. `skill_builder.get_skill_details` — Retrieves complete metadata, code, test cases, and validation reports.

### 6. Interactive HUD Skill Builder Studio
* **Skills Catalog Tab**: Displays all seeded and custom skills with interactive status badges, metadata pills, sandbox test buttons, hot-install toggles, and deletion controls.
* **Skill Foundry & Generator Tab**: Interactive drafting form with preset templates (Fibonacci Solver, JSON Key Sorter, Markdown Table Formatter, Batch Text Hasher) and real-time schema validation.
* **Sandboxed Test Harness Tab**: Target selector with AST screening clearance indicators, overall suite status, pass/fail breakdowns, and microsecond latency metrics.
* **Governance & Hot-Loader Tab**: Operator review panel for approving/rejecting drafts with audit notes, plus a live interactive test bench to invoke installed custom tools with JSON parameters.


---

## 🤝 Phase 25 Architecture: Multi-Agent Collaboration

JARVIS implements an autonomous, resilient multi-agent orchestration architecture that coordinates specialized agents to execute complex objectives requiring cross-domain intelligence:

### 1. Collaboration Topologies
* **Pipeline Topology**: Sequential step execution where output of step $N$ flows into step $N+1$ via blackboard handoffs.
* **Parallel Topology**: Independent task steps execute concurrently using `Promise.all()`, merging results back to the blackboard.
* **Hierarchical Topology**: Lead orchestrator agent decomposes objectives, delegates tasks to specialized workers, and synthesizes final deliverables.
* **Consensus Topology**: Multi-agent deliberative execution requiring cross-agent peer reviews and majority approval before accepting final outputs.

### 2. Shared Blackboard Working Memory
* Scoped, version-controlled shared memory store (`SharedBlackboard`) accessible by all participating agents.
* Each entry tracks value, authoring agent ID, ISO timestamp, and sequential version number.
* Supports key lookups, prefix filtering, and state rollbacks.

### 3. Inter-Agent Communication Bus
* Structured message passing between collaborating agents (`task`, `result`, `critique`, `query`, `clarification`, `handoff`).
* Enables transparent audit trails of inter-agent reasoning, requests, and milestone deliverables.

### 4. Cross-Agent Peer Review & Anti-Hallucination Consensus
* Specialized peer review mechanism where cooperating agents critique and verify peer deliverables (e.g., Mathematics Agent auditing Coding Agent implementation bounds).
* Records critique comments, quantitative alignment score (0–100), actionable recommendations, and approval flags.

### 5. Predefined Collaboration Mission Templates
1. **STEM Science & Mathematics Discovery Pipeline** (`pipeline`): Research survey $\rightarrow$ Mathematical derivation $\rightarrow$ Simulation code synthesis.
2. **Competitive Product & Tech Landscape Analysis** (`parallel`): Concurrent research extraction, financial valuation, and product market fit analysis.
3. **Full-Stack Feature Engineering** (`hierarchical`): Lead assistant coordinates data modeling, backend coding, and UI animation styling.
4. **Mission-Critical System Security Consensus** (`consensus`): Dev environment auditing, AST code review, and cross-agent peer verification before signoff.

### 6. Security Gating, Collaboration Agent & 8 Tools
* Gated by `ResourceType.SYSTEM` (`READ` for templates, status, and blackboard queries; `WRITE` for mission creation, messaging, blackboard writes, and peer reviews; `EXECUTE` for end-to-end execution).
* Coordinated by `MultiAgentManager`, `SharedBlackboard`, and `CollaborationAgent` (`id: 'collaboration-agent'`, `version: '0.25.0-phase25'`).
* 8 Registered Tools:
  1. `collaboration.create_mission` — Creates a multi-agent mission plan with defined topology.
  2. `collaboration.run_mission` — Executes a multi-agent mission end-to-end.
  3. `collaboration.get_mission_status` — Retrieves live execution status, step outcomes, and blackboard state.
  4. `collaboration.list_missions` — Enumerates multi-agent missions with status filters.
  5. `collaboration.send_agent_message` — Transmits direct communication or handoffs on the bus.
  6. `collaboration.read_blackboard` — Reads shared working memory from the mission blackboard.
  7. `collaboration.write_blackboard` — Writes or updates findings on the mission blackboard.
  8. `collaboration.peer_review` — Conducts cross-agent critique and verification before consensus.

### 7. Interactive HUD Multi-Agent Studio
* **Active Missions Tab**: Live mission list with status pills, topology badges, step progress counters, and execution trigger buttons.
* **Dispatcher Tab**: Mission planner form prefilled from 4 templates or custom goals, with topology selection and agent checklist.
* **Shared Blackboard Tab**: Live viewer for blackboard key-value entries with version histories and interactive entry authoring.
* **Inter-Agent Bus Tab**: Real-time communication feed displaying agent-to-agent messages with sender/recipient badges, message type tags, and cross-agent peer review trigger.

---

## 🛡️ Phase 26 Architecture: Verification Engine

JARVIS enforces a foundational anti-hallucination and truth-asserting invariant:
$$\text{CAPABILITY} \neq \text{PERMISSION} \qquad \text{and} \qquad \text{ASSERTION} \neq \text{EVIDENCE}$$

No task, tool, or action is accepted as "Done" merely because a model returns a successful prompt completion. The Verification Engine independently inspects the real environment, collects empirical evidence, detects hallucinations, and drives automated self-healing loops:

$$\text{ACTION} \longrightarrow \text{RAW RESULT} \longrightarrow \text{VERIFICATION ENGINE} \longrightarrow \begin{cases} \text{PASS} & \longrightarrow \text{SIGNED ATTESTATION} \\ \text{FAIL} & \longrightarrow \text{DIAGNOSIS} \longrightarrow \text{SELF-HEALING RETRY} \end{cases}$$

### 1. Multi-Modal Evidence Collector
* **Filesystem Invariants**: Inspects actual disk files (`file_exists`, `file_size`, `file_content` token patterns, `file_hash` SHA-256 integrity).
* **Process & Execution Invariants**: Verifies process termination code (`exit_code_zero`), inspects standard output for required markers (`stdout_match`), and scans stderr for forbidden crash signatures (`stderr_clean`).
* **Schema & Type Integrity**: Validates structured object definitions (`schema_valid`), enforces runtime primitive and collection types (`type_integrity`), and checks numeric bounds (`range_bounds`).
* **Mathematical & Computational Proofs**: Evaluates algebraic and numerical outputs within specified floating-point tolerances (`computation_verified`, `tolerance_diff`).
* **Code Syntax & AST Safety**: Parses synthesized code artifacts to guarantee syntactic correctness (`code_syntax_valid`).
* **Cryptographic Evidence Fingerprints**: Hashes entire evidence bundles with SHA-256 to produce tamper-evident proof of verification.

### 2. Anti-Hallucination Grounding Gate
* Compares model claims and responses against verified ground-truth sources (Second Brain knowledge nodes, research literature, official manuals).
* Decomposes responses into atomic claims, measures token-level source overlap, and computes an objective **Hallucination Risk Index** ($0.0$ to $1.0$).
* Rejects outputs exceeding strictness tolerance thresholds (e.g. $> 0.30$ in standard mode, $> 0.15$ in strict mode) and isolates unsupported claims.

### 3. Failure Diagnosis & Self-Healing Auto-Retry Loop
* Automatically analyzes failed verification checks to identify root cause categories:
  * `missing_artifact`, `syntax_error`, `tolerance_exceeded`, `hallucination_detected`, `schema_mismatch`, `execution_fault`.
* Synthesizes actionable remediation directives, classifies severity, and assesses retryability.
* Coordinates automated retry loops (`executeAutoRetryLoop()`), adapting parameters across attempts until verification succeeds or max retries are safely exhausted.

### 4. Verification Attestation Ledger & Governance Reporting
* Persists signed `VerificationAttestation` records detailing passed/failed checks, raw evidence items, diagnostic summaries, and SHA-256 fingerprints.
* Exposes compliance analytics (`/api/jarvis/verification/report`) calculating system-wide pass rate percentages, failure breakdowns, and policy adherence.

### 5. Security Gating, Verification Agent & 8 Tools
* Gated by `ResourceType.SYSTEM` (`READ` for evidence collection, hallucination audits, diagnosis, and reports; `WRITE` / `EXECUTE` for action verification and self-healing retry loops).
* Coordinated by `VerificationSuiteManager`, `EvidenceCollector`, `AntiHallucinationAuditor`, and `VerificationAgent` (`id: 'verification-agent'`, `version: '0.26.0-phase26'`).
* 8 Registered Tools:
  1. `verification.verify_action` — Executes multi-checker verification plan with cryptographic fingerprinting.
  2. `verification.collect_evidence` — Gathers empirical evidence across filesystem, processes, schemas, and computations.
  3. `verification.audit_hallucination` — Compares assertions against ground-truth sources to score hallucination risk.
  4. `verification.diagnose_failure` — Synthesizes root-cause diagnosis, classification, and remedy from failed checks.
  5. `verification.execute_recovery_loop` — Executes automated retry loop with diagnostic adjustments until verified.
  6. `verification.get_attestation` — Retrieves a cryptographic evidence attestation by ID.
  7. `verification.list_attestations` — Enumerates verification attestations with pass/fail and action filters.
  8. `verification.generate_audit_report` — Synthesizes executive compliance and policy report.

### 6. Interactive HUD Truth & Verification Center
* **Attestations Ledger Tab**: Real-time table of verified actions with pass/fail pills, check counters, SHA-256 fingerprint snippets, and executive compliance metrics.
* **Multi-Modal Inspector Tab**: Interactive test bench to run verification presets (Process & Schema, Math Tolerance, Code Syntax, File Integrity) against live JSON payloads.
* **Anti-Hallucination Gate Tab**: Ground-truth claim evaluator with source reference inputs, strictness controls, risk dial, citation matches, and hallucination warnings.
* **Diagnostic & Auto-Retry Loop Tab**: Self-healing loop simulator streaming attempt progression, failure diagnosis, and verified convergence.

---

## 🔁 Phase 27 Architecture: Self-Correction & Learning Loop Engine

Phase 27 equips JARVIS with an autonomous, offline-first evolutionary learning loop. Whenever a tool, subagent, verification check, or external call experiences a fault, the failure is systematically ingested, classified, and transformed into an active heuristic rule. Subsequent actions are filtered through pre-execution guardrails, which clamp unbounded parameters, inject preventative preconditions, and guarantee that learned mistakes never recur:

$$\text{FAULT INCIDENT} \longrightarrow \text{EXPERIENCE STORE} \longrightarrow \text{HEURISTIC SYNTHESIS} \longrightarrow \begin{cases} \text{ACTIVE GUARDRAIL} & \longrightarrow \text{PRE-EXECUTION CLAMPING} \\ \text{CORRECTION PLAN} & \longrightarrow \text{ADAPTED EXECUTION} \\ \text{FEEDBACK TUNING} & \longrightarrow \text{CONFIDENCE EVOLUTION} \end{cases}$$

### 1. ExperienceStore (Incident & Heuristics Ledger)
* **Incident Ledger**: Persists rich `FailureIncident` records capturing `actionName`, error messages, call stack traces, runtime payload snapshots, and classification categories (`tolerance_exceeded`, `schema_mismatch`, `missing_artifact`, `hallucination_detected`, `syntax_error`, `execution_fault`).
* **Heuristics Ledger**: Maintains persistent `LearnedRule` definitions with status transitions (`probation` $\rightarrow$ `active` upon consecutive verified successes, or $\rightarrow$ `deprecated` upon low confidence), target actions, regex trigger patterns, and parameter constraint bounds.
* **Pre-Seeded Knowledge**: Bootstrapped with verified rules covering IEEE 754 floating-point explosions in polynomial solvers, semicolon-delimited European CSV detection, and statutory PRC Philippine LET rating verification.

### 2. HeuristicSynthesizer (Autonomous Rule Extraction & Guardrails)
* Analyzes root cause categories and error signatures to dynamically derive new preventative rules and parameter clamping bounds without human intervention.
* **Pre-Execution Guardrail Interceptor**: Inspects incoming action calls against all active heuristics before execution, clamping out-of-bounds parameters (e.g. quantum numbers $> 50 \rightarrow 50$), adjusting delimiters, and injecting critical precondition warnings.
* **Correction Plan Generator**: Formulates end-to-end multi-step adaptation plans for previously failed incidents, providing the reasoning, prevented faults, and corrected parameter payloads.

### 3. SelfCorrectionManager & Confidence Feedback Tuning
* Coordinates the full learning lifecycle with strict `ResourceType.SYSTEM` permission gating.
* **Adaptive Rule Feedback**: When a heuristic is successfully applied in production, its confidence score increases asymptotically toward $1.0$; when a rule fails, its confidence drops, demoting it to `probation` or `deprecated` status.
* **Evolution Telemetry Report**: Computes real-time telemetry including total incidents recorded, active directives, learning velocity score, top failing categories, and the core **Zero Recurrence Rate Invariant** ($0.0\%$).

### 4. Self-Correction Agent & 8 Registered Tools
* `SelfCorrectionAgent` (`id: 'self-correction-agent'`, `version: '0.27.0-phase27'`) orchestrates failure analysis, heuristic synthesis, and guardrail interception.
* 8 Registered Tools:
  1. `learning.record_incident` — Ingests a runtime failure or verification fault and automatically synthesizes an actionable LearnedRule.
  2. `learning.extract_heuristic` — Extracts or refines a learned rule from an existing historical failure incident.
  3. `learning.get_guardrails` — Evaluates proposed action parameters against active heuristics and returns clamped parameters.
  4. `learning.create_correction_plan` — Formulates an adapted execution strategy with corrected parameters based on incident history.
  5. `learning.record_rule_feedback` — Tunes heuristic confidence score based on empirical application success or failure.
  6. `learning.list_rules` — Enumerates learned rules with category, status, and target action filters.
  7. `learning.list_incidents` — Lists failure incidents with resolved status and action filters.
  8. `learning.generate_evolution_report` — Generates comprehensive learning evolution telemetry and recurrence rate report.

### 5. Interactive HUD Self-Correction & Learning Studio
* **Learning Evolution Radar Tab**: Real-time HUD telemetry displaying total incidents ingested, active directives, zero recurrence metric ($0.0\%$), learning velocity, and categorized root-cause breakdowns.
* **Incident Ledger Tab**: Historical log of failure incidents with severity badges, status tags, and an interactive failure ingestion workbench to trigger autonomous heuristic synthesis on demand.
* **Heuristics Foundry Tab**: Visual catalog of learned heuristics displaying confidence bars, application counts, status pills, and interactive $\blacktriangle$ Valid / $\blacktriangledown$ Invalidate feedback buttons.
* **Guardrails & Simulator Tab**: Pre-execution sandbox testing proposed action parameters against the guardrail engine, visualizing live parameter clamping and synthesizing structured correction plans.

---

## 🧭 Phase 28 Architecture: Personal Context Engine & Unified Dashboard

Phase 28 delivers the centralized context synthesizer and unified master operational dashboard for JARVIS. It connects all 30 underlying engines into a cohesive situational awareness network, continuously modeling user cognitive load, maintaining focus modes, tracking an omnichannel activity stream, and presenting real-time operational telemetry through the Unified Dashboard HUD Studio:

$$\begin{pmatrix} \text{User Profile} \\ \text{Goals \& Plans} \\ \text{Second Brain} \\ \text{Memory Store} \\ \text{Hardware / IoT} \\ \text{Verification} \\ \text{Self-Correction} \end{pmatrix} \xrightarrow{\text{Context Aggregator}} \begin{Bmatrix} \text{Cognitive Load} \in [0.0, 1.0] \\ \text{Focus Session State} \\ \text{SHA-256 State Fingerprint} \\ \text{Blended Context Query} \end{Bmatrix} \xrightarrow{\text{Dashboard}} \begin{cases} \text{30-Engine Grid} \\ \text{Proactive Insights} \\ \text{Activity Stream} \\ \text{Live Telemetry} \end{cases}$$

### 1. ContextAggregator (Multi-Engine Synthesis & State Metrics)
* **Unified Context Assembly**: Synthesizes data across `UserProfileManager`, `GoalsManager`, `SecondBrainManager`, `ConversationMemoryManager`, `DeviceManager`, `VerificationSuiteManager`, and `SelfCorrectionManager`.
* **Cognitive Load Model**: Computes real-time workload score ($0.0$ to $1.0$) and categorizes levels (`low`, `optimal`, `high`, `overload`) based on active goals, focus mode duration, activity frequency in the rolling hour, and battery/environmental constraints.
* **Cryptographic State Fingerprinting**: Computes a deterministic SHA-256 digest over the current snapshot state to track context transitions and state drift.
* **Blended Context Query**: Synthesizes relevant profile directives, active goals, memory recalls, and second brain nodes into an integrated prompt string for downstream reasoning.

### 2. PersonalContextManager (Focus Sessions, Activities & Insights)
* **Focus Session Lifecycle**: Coordinates activation, tracking, and completion of user focus sessions across 6 operational modes (`deep_work`, `coding`, `study_review`, `creative_design`, `research`, `idle`).
* **Omnichannel Activity Stream**: Thread-safe in-memory activity ledger capturing events across 8 categories (`chat`, `code`, `math`, `research`, `goal`, `system`, `verification`, `learning`) with category filtering and pagination.
* **Proactive Cross-Engine Insights**: Synthesizes real-time actionable advisories covering goal velocity, cognitive rest recommendations, and system invariant assertions.
* **Master System Health Matrix**: Monitors the operational status of all 30 architectural subsystems, verifying 100% online availability and zero recurrence invariant integrity.

### 3. Context Agent & 8 Registered Tools
* `ContextAgent` (`id: 'context-agent'`, `version: '0.28.0-phase28'`) orchestrates context queries, focus session management, cognitive load balancing, and unified dashboard inspection.
* 8 Registered Tools:
  1. `context.get_snapshot` — Assembles and returns the full personal context snapshot with state fingerprint.
  2. `context.set_focus_session` — Activates or updates an active focus session with designated mode and target duration.
  3. `context.query_relevant_context` — Queries multi-engine context blend matching a specific action or goal.
  4. `context.log_activity` — Ingests a new activity item into the personal activity timeline stream.
  5. `context.list_activities` — Retrieves chronological activity items with category and limit filters.
  6. `context.assess_cognitive_load` — Computes cognitive load score, level, contributing factors, and pacing recommendations.
  7. `context.get_dashboard_overview` — Returns the master executive dashboard overview with 30-engine status matrix.
  8. `context.generate_insights` — Generates proactive cross-system insights, warnings, and productivity recommendations.

### 4. Interactive HUD Personal Context & Master Dashboard Studio
* **Master System Matrix Tab**: Real-time HUD cards displaying 30/30 engines online, cognitive load index, active focus mode, zero recurrence status, and an interactive 30-subsystem status grid.
* **Focus & Cognitive Load Tab**: Focus session launcher with mode dropdown and objective inputs, paired with an interactive workload gauge, contributing factors breakdown, and proactive pace advisory.
* **Activity Stream Tab**: Live multi-engine activity timeline filterable by category (`code`, `chat`, `math`, `research`, `system`, etc.) with quick manual activity ingestion.
* **Context Query & Insights Tab**: Proactive cross-system advisories with priority color accents and an interactive blended query console rendering composite multi-engine context strings.

---

## 🔒 Phase 29 Architecture: Security, Privacy & Permissions Hardening

Phase 29 fortifies JARVIS into an enterprise-grade sovereign AI fortress ("Citadel"). It implements cryptographically verified envelope encryption, statutory personal data protection under the Republic Act 10173 (Philippine Data Privacy Act of 2012), zero-trust ephemeral permission delegations, and multi-vector runtime attack surface screening:

$$\begin{pmatrix} \text{Payload / Ingress} \\ \text{Statutory PII} \\ \text{Master Keys} \\ \text{Subagent Permissions} \end{pmatrix} \xrightarrow{\text{Security Hardening Engine}} \begin{Bmatrix} \text{AES-256-GCM Envelope Encryption} \\ \text{RA 10173 Luhn / PCN Sanitizer} \\ \text{Cryptographic Token Vault} \\ \text{Signed Ephemeral Delegations} \\ \text{AST Prototype Pollution Interceptor} \end{Bmatrix} \xrightarrow{\text{Citadel Radar}} \begin{cases} \text{Grade A Posture (98\%+)} \\ \text{Immutable Audit Trail} \\ \text{Zero Leakage Invariant} \end{cases}$$

### 1. CryptoVault (AES-256-GCM Envelope Cryptography & Key Epochs)
* **Authenticated Envelope Encryption**: Encrypts data using NIST SP 800-38D standard AES-256-GCM with 96-bit cryptographically secure pseudorandom IVs, 128-bit authentication tags, and secondary HMAC-SHA256 integrity layers.
* **Key Derivation & Rotation**: Uses PBKDF2 with 100,000 SHA-256 iterations and random cryptographic salt for master key derivation. Supports hot cryptographic key rotation, retaining historical key versions for backward-compatible decryption while generating new active epoch keys.
* **Timing-Safe Verification**: Enforces `crypto.timingSafeEqual` across all tag and signature comparisons to neutralize timing-side-channel attacks.

### 2. PrivacyVault (RA 10173 Philippine Statutory Protection & Tokenization)
* **Philippine Statutory Identifier Protection**: Native regex sanitization and checksum algorithms for Republic Act 10173 statutory identifiers:
  * PhilSys National ID (PCN): `\d{4}-\d{4}-\d{4}-\d{4}` $\rightarrow$ `[REDACTED_PHILSYS_PCN]`
  * Social Security System (SSS): `\d{2}-\d{7}-\d{1}` $\rightarrow$ `[REDACTED_SSS_ID]`
  * Tax Identification Number (TIN): `\d{3}-\d{3}-\d{3}(-\d{3})?` $\rightarrow$ `[REDACTED_TIN]`
  * Unified Multi-Purpose ID (UMID): `\d{4}-\d{7}-\d{1}` $\rightarrow$ `[REDACTED_UMID]`
* **Global Credential & PII Sanitizer**: Luhn-validated credit cards (`\b(?:\d[ -]*?){13,19}\b`), bearer tokens, API keys (`(sk|ghp|xoxb)_[a-zA-Z0-9]{20,}`), and emails.
* **Reversible Pseudonymization Vault**: Generates cryptographically secure token handles (`tok_<classification>_<hash>`) mapped to in-memory encrypted originals, enabling authorized reversal without exposing raw data to LLM context streams.

### 3. DelegationManager (Zero-Trust Ephemeral Permission Delegations)
* **Time-Bound Delegations**: Enables primary users to issue scoped, ephemeral delegation tokens (`jarvis_del_*`) to subagents or specific tasks with strict time-to-live (TTL) expiration.
* **Resource & Action Scoping**: Delegations specify exact resources (`SYSTEM`, `PROJECTS`, `RESEARCH`, etc.) and allowed actions (`read`, `write`, `execute`).
* **Immediate Revocation**: Any delegation can be immediately invalidated and purged from the active delegation registry.

### 4. SecurityScanner (Ingress Vulnerability & Injection Detection)
* **AST & Runtime Prototype Pollution Defense**: Detects prototype pollution in serialized JSON strings as well as live in-memory objects via prototype identity checks (`__proto__`, `constructor.prototype`).
* **Multi-Vector Threat Heuristics**: Inspects ingress payloads against prompt injection jailbreaks, path traversal null-byte bypasses (`../../` / `%2e%2e` / `\0`), shell command chaining (`rm -rf`, `;`, `&&`), and ReDoS patterns.
* **Composite Risk Scoring**: Computes composite risk scores ($0$ to $100$) and recommends automated disposition (`ALLOW`, `BLOCK`, `QUARANTINE`).

### 5. Security Agent & 8 Registered Tools
* `SecurityAgent` (`id: 'security-agent'`, `version: '0.29.0-phase29'`) coordinates envelope cryptography, privacy scrubbing, delegation lifecycle, and real-time posture defense.
* 8 Registered Tools:
  1. `security.encrypt_envelope` — Encrypts data payload into an AES-256-GCM envelope with HMAC integrity.
  2. `security.decrypt_envelope` — Decrypts an authenticated envelope using the appropriate key epoch.
  3. `security.redact_pii` — Scans and redacts sensitive PII under RA 10173 and global compliance rules.
  4. `security.tokenize_sensitive` — Pseudonymizes sensitive values into reversible cryptographic tokens.
  5. `security.create_delegation` — Issues a time-bound granular permission delegation for subagents.
  6. `security.revoke_delegation` — Immediately revokes an active permission delegation token.
  7. `security.audit_payload` — Scans arbitrary payloads for prototype pollution, injections, and traversal.
  8. `security.get_security_posture` — Returns the real-time Citadel security posture overview and defense metrics.

### 6. Interactive HUD Security & Privacy Citadel Studio
* **Executive Posture & Defenses Tab**: Displays Citadel Grade (`GRADE_A_CITADEL - 98/100`), encryption status (`AES-256-GCM`), active key version, active delegations, and live subsystem defense states.
* **Envelope Crypto & Key Rotation Tab**: Interactive workbench to encrypt plaintext payloads into sealed envelopes, verify authentication tags, and trigger master key rotations with cryptographic history logs.
* **RA 10173 Privacy & Token Vault Tab**: Interactive sanitization testbed for Philippine statutory IDs and global credentials, paired with reversible pseudonymization token lookup.
* **Vulnerability Scanner & Delegations Tab**: Real-time ingress payload scanner with threat findings and severity badges, paired with the ephemeral delegation manager.

---

## 🧪 Testing & Validation

Run the full Vitest suite (810 automated tests across 80 test files covering all phases, plus 138 end-to-end manual verification steps):
```bash
# Run all automated tests
npm test

# Run manual end-to-end verification across Phases 1 to 29
npx tsx tests/manual-verify.ts

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

