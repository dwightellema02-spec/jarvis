# JARVIS — Personal AI Assistant & Second Brain

> **Current Status**: **Phase 17 — Web & Browser Agent Active**

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

## 🧪 Testing & Validation

Run the full Vitest suite (482 automated tests across 60 test files covering all phases, plus 78 end-to-end manual verification steps):
```bash
# Run all automated tests
npm test

# Run manual end-to-end verification across Phases 1 to 19
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
