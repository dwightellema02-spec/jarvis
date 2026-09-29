# JARVIS Architecture & Engineering Reference

## 1. System Layers

JARVIS operates across decoupled architectural layers:

1. **Input Layer**:
   - Web Chat Interface (`public/index.html`, `public/app.js`)
   - REST API Endpoints (`/api/jarvis/chat`, `/api/jarvis/process`)
   - Headless / programmatic callers

2. **Security & Guardian Layer**:
   - `SecurityGuardian`: Analyzes commands and targets against threat categories (`UNAUTHORIZED_ACCESS`, `PRIVILEGE_ESCALATION`, `PHISHING`, `SCAM_WEBSITE`, `UNAUTHORIZED_FINANCIAL_ACTION`).
   - `PermissionManager`: Evaluates `RESOURCE + ACTION + REQUIRED_LEVEL + USER_GRANT`.
   - Default-Deny: If no explicit permission grant exists for sensitive resources (`FILES`, `APPLICATIONS`, `FINANCIAL_SERVICES`, `CAMERA`, `DEVICES`), execution is blocked immediately.

3. **Session & Context Layer**:
   - `SessionManager`: Manages active conversation sessions, ensuring strict isolation between user sessions.
   - `RequestContext`: Attaches unique `requestId`, `timestamp`, `userId`, `source`, and security context to each operation.

4. **Intelligence & AI Layer**:
   - `IAIProvider`: Clean vendor-neutral abstraction (`generate`, `stream`, `analyze`, `healthCheck`).
   - `GoogleGeminiProvider`: Native REST / SSE integration with Google Gemini models.
   - `OpenAIProvider`: OpenAI-compatible completions.
   - `MockAIProvider`: Zero-network test fixture for reproducible unit and error testing.
   - `JARVIS_SYSTEM_INSTRUCTION`: Centralized personality definition enforcing capability honesty, math support, coding assistance, and respectful tone.

5. **Agent & Tool Foundation**:
   - `AgentRegistry`: Catalogs all 21 modular agents (`registered`, `implemented`, `enabled`, `disabled`).
   - `ToolRegistry`: Enforces mandatory permission declarations on all tools.

6. **Audit & Observability Layer**:
   - `AuditLogger`: Records structured logs answering:
     1. What did JARVIS do?
     2. Why did JARVIS do it?
     3. What permission allowed it?
     4. What was the result?
   - `sanitizeData`: Recursive secret redaction preventing API keys, bearer tokens, or passwords from appearing in logs or responses.

---

## 2. Security Principle: Capability != Permission

Having the technical ability to perform an operation (e.g. read files or execute a command) does **not** grant authorization.

Every sensitive operation must check:
```typescript
const result = permissionManager.checkPermission({
  userId,
  resource,
  action,
  requiredLevel,
});
```

Permission hierarchy:
$$\text{READ (1)} < \text{SUGGEST (2)} < \text{WRITE (3)} < \text{EXECUTE (4)} < \text{ADMIN (5)}$$

---

## 3. Road to Phase 2: The Orchestrator

In Phase 1, JARVIS has achieved real generative conversational intelligence, session context memory, and foundational safety checks.

In Phase 2, the **Orchestrator** will be built to parse complex intents, plan multi-step tasks, route between agents, select authorized tools, and verify outputs through the dedicated Verification Engine before returning results.
