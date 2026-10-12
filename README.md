# JARVIS — Personal AI Assistant & Second Brain

> **Current Status**: **Phase 7 — Mathematics & Learning Engine (Real Solvers, Socratic Learning Cycle, BLEPT LET Review)**

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

## 🧪 Testing & Validation

Run the full Vitest suite (297 automated tests across 42 test files covering unit, integration, security, orchestration, profile, memory, Second Brain, Document Intelligence, Mathematics Solvers, Socratic Learning, BLEPT LET Review, Epistemic Classification, Citations, Research Intelligence, Data Cleaning, Descriptive Statistics, Correlation, Regression, Hypothesis Testing, Visualizations, Repository Inspection, AST Parsing, Code Search, Code Review, Security Auditing, Atomic Patching, Stack Trace Debugging, Terminal Risk Analysis, Safe Command Execution, Git Porcelain Status/Diff/Log, Dependency Auditing, Build/Typecheck Runners, Tuklas Curriculum Search, Student Mastery Heatmaps, Practice Generation, Assessment Evaluation, Mistake Diagnostics, and RA 10173 Privacy Compliance):
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
