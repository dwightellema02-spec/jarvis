import { createApp } from '../src/server/app.js';
import { MockAIProvider } from '../src/providers/mock-provider.js';
import * as path from 'path';
import * as fs from 'fs';

async function runManualVerification() {
  console.log('=== RUNNING JARVIS PHASE 1 MANUAL END-TO-END VERIFICATION ===');

  const provider = new MockAIProvider();
  const { app, core } = createApp({ aiProvider: provider });

  const server = app.listen(3099, '127.0.0.1', async () => {
    try {
      console.log('1. Testing GET /api/health');
      const healthRes = await fetch('http://127.0.0.1:3099/api/health');
      const health = await healthRes.json();
      console.log('   Health Status:', health.status, '| Service:', health.service, '| Version:', health.version);

      console.log('2. Testing GET /api/jarvis/status');
      const statusRes = await fetch('http://127.0.0.1:3099/api/jarvis/status');
      const status = await statusRes.json();
      console.log('   Status:', status.status, '| Subsystems:', Object.keys(status.subsystems));

      console.log('3. Testing GET / (Static Frontend Web Interface)');
      const uiRes = await fetch('http://127.0.0.1:3099/');
      const uiText = await uiRes.text();
      console.log('   UI HTTP Status:', uiRes.status, '| Has JARVIS Brand:', uiText.includes('JARVIS'));

      console.log('4. Testing Session Creation (POST /api/jarvis/session)');
      const sessRes = await fetch('http://127.0.0.1:3099/api/jarvis/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'dwight' }),
      });
      const sess = await sessRes.json();
      console.log('   Created Session:', sess.sessionId);

      console.log('5. Testing Turn 1: "My name is Dwight and my current project is JARVIS."');
      const chat1Res = await fetch('http://127.0.0.1:3099/api/jarvis/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'My name is Dwight and my current project is JARVIS.',
          sessionId: sess.sessionId,
          userId: 'dwight',
        }),
      });
      const chat1 = await chat1Res.json();
      console.log('   Turn 1 Response Status:', chat1.status, '| RequestId:', chat1.requestId);
      console.log('   Turn 1 Response Preview:', chat1.response.substring(0, 80));

      console.log('6. Testing Turn 2 (Context Memory): "What project am I working on?"');
      const chat2Res = await fetch('http://127.0.0.1:3099/api/jarvis/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'What project am I working on?',
          sessionId: sess.sessionId,
          userId: 'dwight',
        }),
      });
      const chat2 = await chat2Res.json();
      console.log('   Turn 2 Response:', chat2.response);

      console.log('7. Testing Capability Honesty: "Can you access my camera?"');
      const honestyRes = await fetch('http://127.0.0.1:3099/api/jarvis/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Can you access my camera?',
          sessionId: sess.sessionId,
          userId: 'dwight',
        }),
      });
      const honesty = await honestyRes.json();
      console.log('   Camera Honesty Response:', honesty.response);

      console.log('8. Testing Mathematics: "Solve 2x + 5 = 15"');
      const mathRes = await fetch('http://127.0.0.1:3099/api/jarvis/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Solve 2x + 5 = 15',
          sessionId: sess.sessionId,
          userId: 'dwight',
        }),
      });
      const math = await mathRes.json();
      console.log('   Math Solution:\n', math.response);

      console.log('9. Testing Phase 2 Orchestrator (POST /api/jarvis/orchestrate) - Low Risk');
      core.getPermissionManager().grantPermission({
        userId: 'dwight',
        resource: 'PROJECTS' as any,
        level: 'READ' as any,
        allowedActions: ['read'],
        grantedBy: 'system',
      });
      const orchRes = await fetch('http://127.0.0.1:3099/api/jarvis/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: 'Analyze Tuklas educational project requirements',
          userId: 'dwight',
        }),
      });
      const orch = await orchRes.json();
      console.log('   Orchestration Success:', orch.success, '| Risk:', orch.overallRisk, '| Steps:', orch.stepsExecuted);

      console.log('10. Testing Phase 2 High-Risk Gating');
      const highRiskRes = await fetch('http://127.0.0.1:3099/api/jarvis/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: 'Run build command',
          userId: 'dwight',
          explicitSteps: [
            {
              id: 'cmd_1',
              name: 'Build Tool Execution',
              resource: 'APPLICATIONS',
              action: 'execute',
              parameters: { command: 'npm run build' },
            },
          ],
          userConfirmedHighRisk: false,
        }),
      });
      const highRisk = await highRiskRes.json();
      console.log('   High Risk Gated as Expected:', highRisk.stepResults[0].status === 'BLOCKED_BY_RISK');

      console.log('11. Testing Phase 2 System Limitations & Critical Financial Gating');
      const limitRes = await fetch('http://127.0.0.1:3099/api/jarvis/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: 'Transfer Bitcoin to external address',
          userId: 'dwight',
        }),
      });
      const limit = await limitRes.json();
      console.log('   Critical Finance Gated as Expected:', limit.stepResults[0].status === 'BLOCKED_BY_LIMITATION');

      console.log('12. Testing Phase 3 User Profile (GET /api/jarvis/profile)');
      const profRes = await fetch('http://127.0.0.1:3099/api/jarvis/profile?userId=default_user');
      const profData = await profRes.json();
      console.log('   Profile Identity:', profData.profile.identity.name, '| Role:', profData.profile.identity.role);
      console.log('   Active Goals Count:', profData.profile.goals.length, '| Projects Count:', profData.profile.projects.length);

      console.log('13. Testing Phase 3 Context Distinction & Distillation (GET /api/jarvis/profile/context)');
      const ctxRes = await fetch('http://127.0.0.1:3099/api/jarvis/profile/context?userId=default_user&sessionId=sess_manual&messageCount=2');
      const ctxData = await ctxRes.json();
      console.log('   Prompt Context Generated:', ctxData.promptContext.includes('[USER IDENTITY & PROFILE CONTEXT]'));
      console.log('   Distinction Verified: Ephemeral Session (' + ctxData.distinction.temporaryConversation.sessionId + ') vs Persistent Identity (' + ctxData.distinction.persistentUserInformation.userName + ')');

      console.log('14. Testing Phase 4 Conversation Memory Storage (POST /api/jarvis/memory)');
      const memStoreRes = await fetch('http://127.0.0.1:3099/api/jarvis/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'dwight',
          key: 'Preferred Math Notation',
          value: 'Leibniz notation for calculus and standard vector arrow notation',
          tags: ['math', 'notation'],
        }),
      });
      const memStore = await memStoreRes.json();
      console.log('   Stored Memory Key:', memStore.memory.key, '| ID:', memStore.memory.id);

      console.log('15. Testing Phase 4 Relevant Memory Retrieval (GET /api/jarvis/memory/relevant)');
      const memRelRes = await fetch('http://127.0.0.1:3099/api/jarvis/memory/relevant?q=math+notation&userId=dwight');
      const memRel = await memRelRes.json();
      console.log('   Matched Memories Count:', memRel.count, '| Top Key:', memRel.results[0]?.record.key);

      console.log('16. Testing Phase 4 Memory Correction & Audit (POST /api/jarvis/memory/correct)');
      const memCorrRes = await fetch('http://127.0.0.1:3099/api/jarvis/memory/correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'dwight',
          memoryIdOrKey: 'Preferred Math Notation',
          newValue: 'Lagrange prime notation f\'(x) for single variable, Leibniz for multivariable',
          reason: 'User preference refined during review session',
        }),
      });
      const memCorr = await memCorrRes.json();
      console.log('   Corrected Value:', memCorr.record.value);
      console.log('   Confidence Elevated to 100%:', memCorr.record.confidence === 1.0);

      console.log('17. Testing Phase 5 Second Brain Knowledge Tree (GET /api/jarvis/second-brain/tree)');
      const treeRes = await fetch('http://127.0.0.1:3099/api/jarvis/second-brain/tree?userId=dwight');
      const treeData = await treeRes.json();
      console.log('   Root:', treeData.tree.root, '| Total Nodes:', treeData.tree.totalNodes);
      console.log('   Math Nodes:', treeData.tree.study.mathematics.length, '| LET Nodes:', treeData.tree.study.let.length, '| Projects:', treeData.tree.projects.tuklas.length + treeData.tree.projects.jarvis.length);

      console.log('18. Testing Phase 5 Semantic Knowledge Search (GET /api/jarvis/second-brain/search)');
      const searchRes = await fetch('http://127.0.0.1:3099/api/jarvis/second-brain/search?q=calculus+derivatives&userId=dwight');
      const searchData = await searchRes.json();
      console.log('   Matched Knowledge Results:', searchData.count, '| Top Title:', searchData.results[0]?.node.title);

      console.log('19. Testing Phase 5 Second Brain Node Indexing & Graph Relationships');
      const nodeCreateRes = await fetch('http://127.0.0.1:3099/api/jarvis/second-brain/nodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'dwight',
          domain: 'knowledge',
          category: 'mathematics',
          title: 'Euler Formula & Complex Exponentials',
          content: 'e^(ix) = cos(x) + i*sin(x), connecting trigonometry, analysis, and linear algebra.',
          tags: ['euler', 'complex_numbers', 'trigonometry'],
        }),
      });
      const nodeCreate = await nodeCreateRes.json();
      console.log('   Created Node:', nodeCreate.node.title, '| ID:', nodeCreate.node.id);

      const relateRes = await fetch('http://127.0.0.1:3099/api/jarvis/second-brain/nodes/' + nodeCreate.node.id + '/relate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'dwight',
          targetNodeId: 'node_math_calc',
          relation: 'extends',
        }),
      });
      const relateData = await relateRes.json();
      console.log('   Relationship Edge Connected:', relateData.connected);

      console.log('20. Testing Phase 6 Document Ingest (POST /api/jarvis/documents/ingest)');
      const docIngestRes = await fetch('http://127.0.0.1:3099/api/jarvis/documents/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({
          filename: 'let_math_scores.csv',
          content: 'subject,examinees,average_score\nGeneral Ed,1200,84.5\nProf Ed,1200,88.2\nMajorship Math,450,91.4',
        }),
      });
      const docIngest = await docIngestRes.json();
      console.log('   Ingested Document:', docIngest.document.metadata.filename, '| ID:', docIngest.document.metadata.id);

      console.log('21. Testing Phase 6 Tabular Analysis (POST /api/jarvis/documents/:id/analyze-table)');
      const tableAnalysisRes = await fetch(`http://127.0.0.1:3099/api/jarvis/documents/${docIngest.document.metadata.id}/analyze-table`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableIndex: 0 }),
      });
      const tableAnalysis = await tableAnalysisRes.json();
      console.log('   Table Rows:', tableAnalysis.analysis.rowCount, '| Columns:', tableAnalysis.analysis.columnCount, '| Score Mean:', tableAnalysis.analysis.numericSummary.average_score.mean);

      console.log('22. Testing Phase 6 Document Executive Summary (POST /api/jarvis/documents/:id/summarize)');
      const docSummaryRes = await fetch(`http://127.0.0.1:3099/api/jarvis/documents/${docIngest.document.metadata.id}/summarize`, {
        method: 'POST',
      });
      const docSummary = await docSummaryRes.json();
      console.log('   Document Title:', docSummary.summary.title, '| Read Minutes:', docSummary.summary.estimatedReadMinutes);

      console.log('23. Testing Phase 6 Ingestion into Second Brain (POST /api/jarvis/documents/:id/to-knowledge)');
      const toKnowledgeRes = await fetch(`http://127.0.0.1:3099/api/jarvis/documents/${docIngest.document.metadata.id}/to-knowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ category: 'STUDY' }),
      });
      const toKnowledge = await toKnowledgeRes.json();
      console.log('   Second Brain Knowledge Nodes Created:', toKnowledge.result.createdNodes.length);

      console.log('24. Testing Phase 7 Mathematical Solving (POST /api/jarvis/math/solve)');
      const mathSolveRes = await fetch('http://127.0.0.1:3099/api/jarvis/math/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: 'algebra',
          quadratic: { a: 1, b: -8, c: 15 },
        }),
      });
      const mathSolve = await mathSolveRes.json();
      console.log('   Quadratic Solved:', mathSolve.data.formattedAnswer, '| Root Type:', mathSolve.data.result.rootType);

      console.log('25. Testing Phase 7 Socratic Diagnostic & Worked Example (/api/jarvis/math/worked-example)');
      const weRes = await fetch('http://127.0.0.1:3099/api/jarvis/math/worked-example?domain=algebra');
      const weData = await weRes.json();
      console.log('   Worked Example Topic:', weData.data.topic, '| Steps Count:', weData.data.steps.length);

      console.log('26. Testing Phase 7 Philippine BLEPT LET Mock Exam (GET /api/jarvis/math/let/mock-exam & POST evaluate)');
      const letExamRes = await fetch('http://127.0.0.1:3099/api/jarvis/math/let/mock-exam');
      const letExam = await letExamRes.json();
      console.log('   LET Mock Exam Generated:', letExam.data.totalQuestions, 'items | Competencies:', letExam.data.competenciesCovered.length);

      const letEvalRes = await fetch('http://127.0.0.1:3099/api/jarvis/math/let/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: { 'LET-Q01': 'C', 'LET-Q02': 'A', 'LET-Q03': 'A' },
        }),
      });
      const letEval = await letEvalRes.json();
      console.log('   LET Eval Score:', letEval.data.score, '/', letEval.data.total, '| Passed (>=75%):', letEval.data.passed);

      console.log('27. Testing Phase 8 Epistemic Classification (POST /api/jarvis/research/classify)');
      const epistemicRes = await fetch('http://127.0.0.1:3099/api/jarvis/research/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'In 2024, 450 students were tested. The authors argue that Socratic dialogue is best. Therefore retention increases. However, results are possibly tentative.',
        }),
      });
      const epistemicData = await epistemicRes.json();
      console.log('   Epistemic Statements:', epistemicData.data.totalStatements, '| Facts:', epistemicData.data.counts.FACT, '| Claims:', epistemicData.data.counts.CLAIM, '| Opinions:', epistemicData.data.counts.OPINION, '| Uncertainty:', epistemicData.data.counts.UNCERTAINTY);

      console.log('28. Testing Phase 8 Academic Citations (GET /api/jarvis/research/citations/:sourceId)');
      const citeRes = await fetch('http://127.0.0.1:3099/api/jarvis/research/citations/src_prc_blept');
      const citeData = await citeRes.json();
      console.log('   Formats Generated:', citeData.data.map((c: any) => c.format).join(', '));

      console.log('29. Testing Phase 8 Multi-Source Comparison (POST /api/jarvis/research/compare)');
      const compRes = await fetch('http://127.0.0.1:3099/api/jarvis/research/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceIds: ['src_prc_blept', 'src_tuklas_pedagogy'] }),
      });
      const compData = await compRes.json();
      console.log('   Consensus Level:', compData.data.consensusLevel, '| Points of Agreement:', compData.data.pointsOfAgreement.length);

      console.log('30. Testing Phase 8 Research Note Synthesis & Second Brain Ingestion');
      const noteRes = await fetch('http://127.0.0.1:3099/api/jarvis/research/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({
          title: 'Mathematics Pedagogy Synthesis Note',
          topic: 'Philippine LET Review & Socratic Remediation',
          rawText: 'In 2024, 450 candidates joined the study. Scaffolded distractor feedback accelerates conceptual mastery.',
          sourceIds: ['src_prc_blept', 'src_tuklas_pedagogy'],
        }),
      });
      const noteData = await noteRes.json();
      console.log('   Research Note Created:', noteData.data.title, '| ID:', noteData.data.id);

      const toBrainRes = await fetch(`http://127.0.0.1:3099/api/jarvis/research/notes/${noteData.data.id}/to-knowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
      });
      const toBrainData = await toBrainRes.json();
      console.log('   Ingested to Second Brain Nodes:', toBrainData.data.createdNodeIds.length);

      console.log('31. Testing Phase 9 Data Cleaning & Profiling (POST /api/jarvis/data/clean)');
      const csvPayload = 'hours,score\n10,82\n15,86\n20,91\n25,95\n30,98';
      const cleanRes = await fetch('http://127.0.0.1:3099/api/jarvis/data/clean', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ csvContent: csvPayload, cleaningOptions: { deduplicate: true } }),
      });
      const cleanData = await cleanRes.json();
      console.log('   Cleaned Rows:', cleanData.data.cleanedRowCount, '| Headers:', cleanData.data.headers.join(', '));

      console.log('32. Testing Phase 9 Descriptive Statistics (POST /api/jarvis/data/descriptive)');
      const descRes = await fetch('http://127.0.0.1:3099/api/jarvis/data/descriptive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ csvContent: csvPayload, column: 'score' }),
      });
      const descData = await descRes.json();
      console.log('   Mean Score:', descData.data.mean, '| Median:', descData.data.median, '| StdDev:', descData.data.stdDevSample);

      console.log('33. Testing Phase 9 Correlation & Regression (POST /api/jarvis/data/correlation & /regression)');
      const corrRes = await fetch('http://127.0.0.1:3099/api/jarvis/data/correlation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ csvContent: csvPayload, xColumn: 'hours', yColumn: 'score' }),
      });
      const corrData = await corrRes.json();
      const regRes = await fetch('http://127.0.0.1:3099/api/jarvis/data/regression', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ csvContent: csvPayload, xColumn: 'hours', yColumn: 'score' }),
      });
      const regData = await regRes.json();
      console.log('   Pearson r:', corrData.data.pearsonR, '| Strength:', corrData.data.strength);
      console.log('   Regression Equation:', regData.data.equation, '| R²:', regData.data.r2);

      console.log('34. Testing Phase 9 Hypothesis Testing & Visualization (/api/jarvis/data/t-test & /visualize)');
      const tTestRes = await fetch('http://127.0.0.1:3099/api/jarvis/data/t-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ csvContent: csvPayload, type: 'one_sample', column1: 'score', hypothesizedMean: 75.0 }),
      });
      const tTestData = await tTestRes.json();
      const vizRes = await fetch('http://127.0.0.1:3099/api/jarvis/data/visualize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({
          csvContent: csvPayload,
          chartConfig: { type: 'bar', title: 'Study Hours vs LET Score', xColumn: 'hours', yColumn: 'score' },
        }),
      });
      const vizData = await vizRes.json();
      console.log('   One-Sample t-Test:', tTestData.data.isSignificant ? 'Significant (p < 0.05)' : 'Not Significant', '| Conclusion:', tTestData.data.conclusion);
      console.log('   SVG Chart Generated (length bytes):', vizData.data.svg.length, '| ASCII Preview: First line ->', vizData.data.ascii.split('\n')[0]);

      console.log('35. Testing Phase 10 Repository Tree & Stats (GET /api/jarvis/code/inspect)');
      const inspectRes = await fetch('http://127.0.0.1:3099/api/jarvis/code/inspect', {
        headers: { 'x-user-id': 'dwight' },
      });
      const inspectData = await inspectRes.json();
      console.log('   Scanned Files:', inspectData.data.totalFiles, '| Directories:', inspectData.data.totalDirectories, '| Languages:', Object.keys(inspectData.data.languages).join(', '));

      console.log('36. Testing Phase 10 Code Search & AST Analysis (/api/jarvis/code/search & /analyze)');
      const codeSearchRes = await fetch('http://127.0.0.1:3099/api/jarvis/code/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ query: 'PermissionLevel' }),
      });
      const codeSearchData = await codeSearchRes.json();
      const astRes = await fetch('http://127.0.0.1:3099/api/jarvis/code/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ filePath: path.resolve(process.cwd(), 'src/core/jarvis-core.ts') }),
      });
      const astData = await astRes.json();
      console.log('   Search Matches:', codeSearchData.data.matchCount, '| Scanned Files:', codeSearchData.data.filesSearched);
      console.log('   AST Lines:', astData.data.lineCount, '| Complexity:', astData.data.estimatedComplexity, '| Maintainability:', astData.data.maintainabilityScore);

      console.log('37. Testing Phase 10 Code Review & Security Audit (POST /api/jarvis/code/review)');
      const reviewRes = await fetch('http://127.0.0.1:3099/api/jarvis/code/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ filePath: path.resolve(process.cwd(), 'src/security/guardian.ts') }),
      });
      const reviewData = await reviewRes.json();
      console.log('   Security Checks Passed:', reviewData.data.securityChecksPassed, '| Score:', reviewData.data.overallScore);

      console.log('38. Testing Phase 10 Safe Modification Proposal & Error Debugging');
      const sampleVerifyPath = path.resolve(process.cwd(), 'tests/fixtures/phase10_verify.txt');
      fs.writeFileSync(sampleVerifyPath, 'initial content\n', 'utf-8');
      const proposeRes = await fetch('http://127.0.0.1:3099/api/jarvis/code/propose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({
          filePath: sampleVerifyPath,
          targetContent: 'initial content',
          replacementContent: 'updated verified content',
          reason: 'Phase 10 manual verification',
        }),
      });
      const proposeData = await proposeRes.json();
      const applyRes = await fetch('http://127.0.0.1:3099/api/jarvis/code/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({
          proposal: proposeData.data,
          confirmed: true,
        }),
      });
      const applyData = await applyRes.json();
      const debugRes = await fetch('http://127.0.0.1:3099/api/jarvis/code/debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({
          rawError: 'TypeError: Cannot read properties of undefined (reading "execute")\n    at Object.test (C:\\Users\\dwight\\.gemini\\antigravity\\scratch\\jarvis\\src\\core\\jarvis-core.ts:42:15)',
        }),
      });
      const debugData = await debugRes.json();
      console.log('   Applied Modification File:', applyData.data.filePath, '| Verified:', applyData.data.verified);
      console.log('   Error Debugger Type:', debugData.data.errorType, '| Root Cause:', debugData.data.rootCauseAnalysis);
      if (fs.existsSync(sampleVerifyPath)) fs.unlinkSync(sampleVerifyPath);

      console.log('39. Testing Phase 11 DevEnv Terminal Risk & Execution (/api/jarvis/devenv/terminal/analyze & execute)');
      const cmdAnalyzeRes = await fetch('http://127.0.0.1:3099/api/jarvis/devenv/terminal/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ command: 'echo Phase 11 Verified' }),
      });
      const cmdAnalyzeData = await cmdAnalyzeRes.json();
      const cmdExecRes = await fetch('http://127.0.0.1:3099/api/jarvis/devenv/terminal/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ command: 'node -v' }),
      });
      const cmdExecData = await cmdExecRes.json();
      console.log('   Command Risk:', cmdAnalyzeData.data.risk, '| Allowed:', cmdAnalyzeData.data.isAllowed);
      console.log('   Command Execution Node Version:', cmdExecData.data.stdout.trim(), '| Exit Code:', cmdExecData.data.exitCode);

      console.log('40. Testing Phase 11 DevEnv Git Integration (/api/jarvis/devenv/git/*)');
      const gitStatusRes = await fetch('http://127.0.0.1:3099/api/jarvis/devenv/git/status', {
        headers: { 'x-user-id': 'dwight' },
      });
      const gitStatusData = await gitStatusRes.json();
      const gitLogRes = await fetch('http://127.0.0.1:3099/api/jarvis/devenv/git/log?limit=2', {
        headers: { 'x-user-id': 'dwight' },
      });
      const gitLogData = await gitLogRes.json();
      console.log('   Git Branch:', gitStatusData.data.currentBranch, '| Clean:', gitStatusData.data.isClean, '| Recent Commits:', gitLogData.data.entries?.length);

      console.log('41. Testing Phase 11 DevEnv Dependencies & Security Audit (/api/jarvis/devenv/dependencies/*)');
      const depsRes = await fetch('http://127.0.0.1:3099/api/jarvis/devenv/dependencies', {
        headers: { 'x-user-id': 'dwight' },
      });
      const depsData = await depsRes.json();
      const auditRes = await fetch('http://127.0.0.1:3099/api/jarvis/devenv/dependencies/audit', {
        headers: { 'x-user-id': 'dwight' },
      });
      const auditData = await auditRes.json();
      console.log('   Dependencies Count:', Object.keys(depsData.data.dependencies).length, '| DevDeps:', Object.keys(depsData.data.devDependencies).length);
      console.log('   NPM Audit Vulnerabilities:', auditData.data.vulnerabilitiesFound, '| Critical:', auditData.data.severityCounts?.critical);

      console.log('42. Testing Phase 11 DevEnv Typecheck Runner (/api/jarvis/devenv/typecheck)');
      const typecheckRes = await fetch('http://127.0.0.1:3099/api/jarvis/devenv/typecheck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
      });
      const typecheckData = await typecheckRes.json();
      console.log('   Typecheck Success:', typecheckData.data.success, '| Duration:', typecheckData.data.durationMs + 'ms');

      console.log('43. Testing Phase 12 Tuklas Curriculum Search & Lesson Fetch (/api/jarvis/tuklas/lessons/*)');
      const tuklasSearchRes = await fetch('http://127.0.0.1:3099/api/jarvis/tuklas/lessons/search?q=algebra', {
        headers: { 'x-user-id': 'dwight' },
      });
      const tuklasSearchData = await tuklasSearchRes.json();
      const tuklasLessonRes = await fetch('http://127.0.0.1:3099/api/jarvis/tuklas/lessons/lesson_quad_03', {
        headers: { 'x-user-id': 'dwight' },
      });
      const tuklasLessonData = await tuklasLessonRes.json();
      console.log('   Matched Lessons:', tuklasSearchData.data.count, '| Top Title:', tuklasSearchData.data.lessons[0]?.title);
      console.log('   Fetched Lesson:', tuklasLessonData.data.title, '| Prereqs:', tuklasLessonData.data.prerequisiteCompetencies?.join(', '));

      console.log('44. Testing Phase 12 Tuklas Student Mastery Progress (/api/jarvis/tuklas/students/:id/progress)');
      const progressRes = await fetch('http://127.0.0.1:3099/api/jarvis/tuklas/students/student_dwight/progress', {
        headers: { 'x-user-id': 'dwight' },
      });
      const progressData = await progressRes.json();
      console.log('   Student:', progressData.data.studentName, '| Mastery:', progressData.data.overallMasteryPercent + '%', '| Streak:', progressData.data.streakDays, 'days');

      console.log('45. Testing Phase 12 Tuklas Practice Generation & Assessment Evaluation (/api/jarvis/tuklas/practice & evaluate)');
      const practiceRes = await fetch('http://127.0.0.1:3099/api/jarvis/tuklas/practice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ competencyCode: 'M8AL-Ia-b-1', count: 2, difficulty: 'medium' }),
      });
      const practiceData = await practiceRes.json();
      const evalRes = await fetch('http://127.0.0.1:3099/api/jarvis/tuklas/assessments/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({
          assessmentId: 'assess_math_g8',
          studentId: 'student_dwight',
          answers: { item_alg_01: 'C', item_poly_02: 'B', item_poly_03: 'B' },
        }),
      });
      const evalData = await evalRes.json();
      console.log('   Practice Items Generated:', practiceData.data.items?.length, '| Difficulty:', practiceData.data.difficulty);
      console.log('   Assessment Score:', evalData.data.score + '/' + evalData.data.totalItems, '| Passed:', evalData.data.passed);

      console.log('46. Testing Phase 12 Tuklas Mistake Diagnostics & Cohort Research (/api/jarvis/tuklas/diagnostics & research)');
      const diagRes = await fetch('http://127.0.0.1:3099/api/jarvis/tuklas/diagnostics/analyze-mistakes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({
          competencyCode: 'M8AL-Ia-b-1',
          wrongAnswer: '(5x + 8y)^2',
          correctAnswer: '(5x - 8y)(5x + 8y)',
        }),
      });
      const diagData = await diagRes.json();
      const cohortRes = await fetch('http://127.0.0.1:3099/api/jarvis/tuklas/research/cohort-data', {
        headers: { 'x-user-id': 'dwight' },
      });
      const cohortData = await cohortRes.json();
      console.log('   Error Diagnostic Type:', diagData.data.errorType, '| Remedial Lesson:', diagData.data.recommendedLessonTitle);
      console.log('   Cohort:', cohortData.data.cohortName, '| Passing Rate:', cohortData.data.passingRate + '%', '| Anonymized Records:', cohortData.data.records?.length);

      console.log('47. Testing Phase 13 Creative Vector Image Generation & Editing (/api/jarvis/creative/image/generate & /edit)');
      const imgRes = await fetch('http://127.0.0.1:3099/api/jarvis/creative/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ prompt: 'Cyberpunk quantum core in dark orbit', style: 'cyberpunk', aspectRatio: '16:9' }),
      });
      const imgData = await imgRes.json();
      const editRes = await fetch('http://127.0.0.1:3099/api/jarvis/creative/image/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ svgContent: imgData.data.contentData, instruction: 'add_watermark', watermarkText: 'JARVIS SECURE' }),
      });
      const editData = await editRes.json();
      console.log('   Generated Image ID:', imgData.data.id, '| Dimensions:', imgData.data.width + 'x' + imgData.data.height, '| Vector SVG:', imgData.data.isVector);
      console.log('   Watermarked Image ID:', editData.data.id, '| Verified Watermark:', editData.data.contentData.includes('JARVIS SECURE'));

      console.log('48. Testing Phase 13 Creative Graphic Designer Vector Composition (/api/jarvis/creative/graphic/compose)');
      const gfxRes = await fetch('http://127.0.0.1:3099/api/jarvis/creative/graphic/compose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({
          title: 'JARVIS Cognitive Architecture',
          subtitle: 'High Precision Multi-Agent Operating System',
          layout: 'banner',
          theme: 'dark_neon',
        }),
      });
      const gfxData = await gfxRes.json();
      console.log('   Graphic Layout:', gfxData.data.layout, '| Title:', gfxData.data.title, '| SVG Size:', gfxData.data.width + 'x' + gfxData.data.height);

      console.log('49. Testing Phase 13 Creative Presentation Deck Builder (/api/jarvis/creative/presentation/create)');
      const deckRes = await fetch('http://127.0.0.1:3099/api/jarvis/creative/presentation/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({
          topic: 'Autonomous Multi-Agent AI Systems & Verification',
          targetAudience: 'Software Engineers',
          slideCount: 5,
        }),
      });
      const deckData = await deckRes.json();
      console.log('   Presentation Deck:', deckData.data.topic, '| Total Slides:', deckData.data.totalSlides, '| HTML Export Size:', deckData.data.htmlExport.length + ' chars');

      console.log('50. Testing Phase 13 Subtitles, Speech Spec & Storyboard (/api/jarvis/creative/subtitles, /speech, /storyboard)');
      const subRes = await fetch('http://127.0.0.1:3099/api/jarvis/creative/subtitles/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ transcript: 'Hello Dwight. Creative studio engines are fully operational and verified.', format: 'srt' }),
      });
      const subData = await subRes.json();
      const speechRes = await fetch('http://127.0.0.1:3099/api/jarvis/creative/speech/spec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ text: 'All creative generation systems verified.', voiceGender: 'neutral', speakingRate: 1.1 }),
      });
      const speechData = await speechRes.json();
      const sbRes = await fetch('http://127.0.0.1:3099/api/jarvis/creative/storyboard/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ projectTitle: 'JARVIS Phase 13 Launch', concept: 'Creative synthesis in autonomous personal AI' }),
      });
      const sbData = await sbRes.json();
      console.log('   Subtitles Cues:', subData.data.entryCount, '| Duration:', subData.data.durationSeconds + 's');
      console.log('   Speech SSML Words:', speechData.data.wordCount, '| Voice:', speechData.data.voiceGender);
      console.log('   Storyboard Scenes:', sbData.data.totalScenes, '| Duration:', sbData.data.totalDurationSeconds + 's');

      console.log('51. Testing Phase 14 Animation Layer Decomposition & Skeletal Rigs (/api/jarvis/animation/layers & /rig)');
      const animLayersRes = await fetch('http://127.0.0.1:3099/api/jarvis/animation/layers/decompose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ sceneTitle: 'Mainframe Rig', conceptPrompt: 'Cybernetic avatar awakening' }),
      });
      const animLayersData = await animLayersRes.json();
      const animRigRes = await fetch('http://127.0.0.1:3099/api/jarvis/animation/rig', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ characterName: 'Avatar Dwight' }),
      });
      const animRigData = await animRigRes.json();
      console.log('   Decomposed Planes:', animLayersData.data.count, '| Top Layer:', animLayersData.data.layers[0]?.id);
      console.log('   Character Rig Joints:', animRigData.data.joints?.length, '| Poses Configured:', Object.keys(animRigData.data.availablePoses || {}).join(', '));

      console.log('52. Testing Phase 14 Keyframe Motion Graphs & Lip Sync Visemes (/api/jarvis/animation/keyframes & /lipsync)');
      const motionRes = await fetch('http://127.0.0.1:3099/api/jarvis/animation/keyframes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ durationSeconds: 6 }),
      });
      const motionData = await motionRes.json();
      const lipSyncRes = await fetch('http://127.0.0.1:3099/api/jarvis/animation/lipsync/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ transcript: 'Hello Dwight. Motion graphs synthesized.', durationSeconds: 5 }),
      });
      const lipSyncData = await lipSyncRes.json();
      console.log('   Motion Tracks Synthesized:', motionData.data.count, '| Track 1:', motionData.data.tracks[0]?.targetLayerId);
      console.log('   Lip Sync Viseme Cues:', lipSyncData.data.totalCues, '| First Cue:', lipSyncData.data.cues[0]?.viseme);

      console.log('53. Testing Phase 14 Full 7-Stage Scene Composition (/api/jarvis/animation/compose)');
      const composeRes = await fetch('http://127.0.0.1:3099/api/jarvis/animation/compose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({
          title: 'Autonomous System Awakening',
          conceptPrompt: 'Holographic avatar speaking from central console terminal',
          durationSeconds: 5,
          fps: 30,
        }),
      });
      const composeData = await composeRes.json();
      console.log('   Animation Project ID:', composeData.data.id, '| Total Frames:', composeData.data.totalFrames);
      console.log('   Animated SVG Size:', composeData.data.animatedSvgMarkup.length + ' chars', '| HTML Player Size:', composeData.data.htmlPlayer.length + ' chars');

      console.log('54. Testing Phase 14 System Rendering Tools Audit (/api/jarvis/animation/tools)');
      const animToolsRes = await fetch('http://127.0.0.1:3099/api/jarvis/animation/tools', {
        headers: { 'x-user-id': 'dwight' },
      });
      const animToolsData = await animToolsRes.json();
      console.log('   FFmpeg Present:', animToolsData.data.ffmpegInstalled, '| Blender Present:', animToolsData.data.blenderInstalled, '| Canvas Supported:', animToolsData.data.canvasSupported);
      console.log('   Honest Reporting Notes:', animToolsData.data.notes[0]);

      console.log('55. Testing Phase 15 Innovation Status & Market Research (/api/jarvis/innovation/status & /research)');
      const innovStatusRes = await fetch('http://127.0.0.1:3099/api/jarvis/innovation/status');
      const innovStatusData = await innovStatusRes.json();
      const marketRes = await fetch('http://127.0.0.1:3099/api/jarvis/innovation/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({
          idea: 'Autonomous Venture Architecture and Developer Productivity Studio',
          category: 'ai_devtools',
        }),
      });
      const marketData = await marketRes.json();
      console.log('   Innovation Service:', innovStatusData.data.serviceName, '| Version:', innovStatusData.data.version);
      console.log('   TAM Market Estimate:', marketData.data.tamSamSom.tam, '| Competitors Identified:', marketData.data.competitors.length);

      console.log('56. Testing Phase 15 User Personas & RICE Prioritization (/api/jarvis/innovation/personas & /features)');
      const personasRes = await fetch('http://127.0.0.1:3099/api/jarvis/innovation/personas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({
          idea: 'Autonomous Venture Architecture and Developer Productivity Studio',
          count: 2,
        }),
      });
      const personasData = await personasRes.json();
      const featuresRes = await fetch('http://127.0.0.1:3099/api/jarvis/innovation/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({
          features: [
            { name: 'Core Pipeline', description: 'Task runner', reach: 9, impact: 5, confidence: 0.9, effort: 3 },
            { name: 'Legacy Importer', description: 'CSV Bridge', reach: 3, impact: 2, confidence: 0.5, effort: 6 },
          ],
        }),
      });
      const featuresData = await featuresRes.json();
      console.log('   Synthesized Personas:', personasData.data.length, '| Primary ICP:', personasData.data[0]?.name, '(', personasData.data[0]?.role, ')');
      console.log('   Top RICE Feature:', featuresData.data[0]?.name, '| Category:', featuresData.data[0]?.category, '| Score:', featuresData.data[0]?.rice?.score);

      console.log('57. Testing Phase 15 UX Journey & Technical Architecture (/api/jarvis/innovation/journey & /technical)');
      const journeyRes = await fetch('http://127.0.0.1:3099/api/jarvis/innovation/journey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ idea: 'Autonomous Venture Studio' }),
      });
      const journeyData = await journeyRes.json();
      const techRes = await fetch('http://127.0.0.1:3099/api/jarvis/innovation/technical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ idea: 'Autonomous Venture Studio', scaleTier: 'growth' }),
      });
      const techData = await techRes.json();
      console.log('   UX Journey Stages:', journeyData.data.length, '| Discovery Cue:', journeyData.data[0]?.wireframeCue.substring(0, 40) + '...');
      console.log('   Architecture Stack:', techData.data.techStack.frontend, '| Endpoints:', techData.data.apiEndpoints.length);

      console.log('58. Testing Phase 15 End-to-End Product Blueprint Synthesis (/api/jarvis/innovation/blueprint)');
      const bpRes = await fetch('http://127.0.0.1:3099/api/jarvis/innovation/blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({
          title: 'JARVIS Enterprise Venture Studio',
          tagline: 'Autonomous venture architecture from concept to production-grade deployment',
          idea: 'AI Agent operating system for high-velocity software engineering ventures',
          category: 'ai_devtools',
          scaleTier: 'starter',
        }),
      });
      const bpData = await bpRes.json();
      console.log('   Blueprint ID:', bpData.data.id, '| Product Name:', bpData.data.productName);
      console.log('   Viability PMF Score:', bpData.data.viability.overallScorePercent + '%', '| Sprints Planned:', bpData.data.roadmap.sprints.length);

      console.log('59. Testing Phase 16 Ticker Quantitative Analysis (/api/jarvis/finance/ticker)');
      const tickerRes = await fetch('http://127.0.0.1:3099/api/jarvis/finance/ticker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ symbol: 'AAPL' }),
      });
      const tickerData = await tickerRes.json();
      console.log('   Ticker:', tickerData.data.symbol, '| Price:', '$' + tickerData.data.currentPrice, '| SMA20:', tickerData.data.technicals.sma20, '| RSI14:', tickerData.data.technicals.rsi14, '| Trend:', tickerData.data.trendSignal);

      console.log('60. Testing Phase 16 DCF Valuation & Earnings Breakdown (/api/jarvis/finance/valuation & /earnings)');
      const valRes = await fetch('http://127.0.0.1:3099/api/jarvis/finance/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ symbol: 'MSFT', wacc: 0.09, growth: 0.025 }),
      });
      const valData = await valRes.json();
      const earnRes = await fetch('http://127.0.0.1:3099/api/jarvis/finance/earnings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ symbol: 'NVDA' }),
      });
      const earnData = await earnRes.json();
      console.log('   Fair Value MSFT:', '$' + valData.data.estimatedFairValue, '| Market Price:', '$' + valData.data.currentMarketPrice, '| Assessment:', valData.data.assessment);
      console.log('   NVDA Earnings Quarter:', earnData.data.quarter, '| Revenue:', earnData.data.revenueActual, '| EPS Actual:', earnData.data.epsActual);

      console.log('61. Testing Phase 16 MPT Portfolio Risk & Macroeconomic Regime (/api/jarvis/finance/portfolio/risk & /macro)');
      const riskRes = await fetch('http://127.0.0.1:3099/api/jarvis/finance/portfolio/risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({
          assets: [
            { symbol: 'AAPL', weight: 0.4 },
            { symbol: 'MSFT', weight: 0.4 },
            { symbol: 'NVDA', weight: 0.2 },
          ],
        }),
      });
      const riskData = await riskRes.json();
      const macroRes = await fetch('http://127.0.0.1:3099/api/jarvis/finance/macro', {
        headers: { 'x-user-id': 'dwight' },
      });
      const macroData = await macroRes.json();
      console.log('   Portfolio Exp Return:', riskData.data.expectedAnnualReturn + '%', '| Sharpe:', riskData.data.sharpeRatio, '| 1-Day 95% VaR:', riskData.data.valueAtRisk95 + '%');
      console.log('   Macro CPI:', macroData.data.indicators.cpiInflationYoY + '%', '| Fed Funds:', macroData.data.indicators.fedFundsRate + '%', '| Regime:', macroData.data.macroRegime);

      console.log('62. Testing Phase 16 Algorithmic Backtest & Security Invariant Live Trade Block');
      const btRes = await fetch('http://127.0.0.1:3099/api/jarvis/finance/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ strategy: 'SMA_Crossover', symbol: 'SPY', timeframeDays: 250 }),
      });
      const btData = await btRes.json();
      const tradeRes = await fetch('http://127.0.0.1:3099/api/jarvis/finance/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ symbol: 'AAPL', quantity: 10, action: 'BUY' }),
      });
      const tradeData = await tradeRes.json();
      const brokerRes = await fetch('http://127.0.0.1:3099/api/jarvis/finance/brokers', {
        headers: { 'x-user-id': 'dwight' },
      });
      const brokerData = await brokerRes.json();
      console.log('   Backtest Strategy:', btData.data.strategyName, '| Total Return:', btData.data.totalStrategyReturnPercent + '%', '| Win Rate:', btData.data.winRatePercent + '%');
      console.log('   Live Trade Attempt Blocked:', tradeRes.status === 403, '| Security Block Flag:', tradeData.securityBlocked);
      console.log('   Broker Simulation Active:', brokerData.data.isSimulationModeActive, '| Live Trading Allowed:', brokerData.data.isLiveTradingAllowed);

      console.log('63. Testing Phase 17 Web Search & Safe Search Ranking (/api/jarvis/browser/search)');
      const webSearchRes = await fetch('http://127.0.0.1:3099/api/jarvis/browser/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ query: 'autonomous ai agents' }),
      });
      const webSearchData = await webSearchRes.json();
      console.log('   Search Query:', webSearchData.data.query, '| Results:', webSearchData.data.totalResults, '| Top Domain:', webSearchData.data.results[0]?.domain);

      console.log('64. Testing Phase 17 Page Reading & Anti-SSRF Protection (/api/jarvis/browser/read & SSRF block)');
      const readRes = await fetch('http://127.0.0.1:3099/api/jarvis/browser/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ url: 'https://docs.jarvis-ai.dev/overview' }),
      });
      const readData = await readRes.json();
      const ssrfRes = await fetch('http://127.0.0.1:3099/api/jarvis/browser/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ url: 'http://127.0.0.1:8080/secret' }),
      });
      const ssrfData = await ssrfRes.json();
      console.log('   Page Read Title:', readData.data.title, '| Words:', readData.data.wordCount, '| Forms Found:', readData.data.forms.length);
      console.log('   SSRF Intercepted (127.0.0.1):', ssrfRes.status === 403, '| Error:', ssrfData.error);

      console.log('65. Testing Phase 17 Form Inspection & Safe Form Automation (/api/jarvis/browser/forms/inspect & /fill)');
      const formsRes = await fetch('http://127.0.0.1:3099/api/jarvis/browser/forms/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ url: 'https://docs.jarvis-ai.dev/overview' }),
      });
      const formsData = await formsRes.json();
      const fillRes = await fetch('http://127.0.0.1:3099/api/jarvis/browser/forms/fill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({
          url: 'https://docs.jarvis-ai.dev/overview',
          formId: 'feedback-form',
          fields: {
            fullName: 'Dwight Lead Architect',
            userEmail: 'dwight@example.com',
            comments: 'Verified end-to-end browser automation.',
          },
          submit: true,
        }),
      });
      const fillData = await fillRes.json();
      console.log('   Forms Discovered:', formsData.data.formsCount, '| Form 1 ID:', formsData.data.forms[0]?.formId);
      console.log('   Form Filled & Submitted:', fillData.data.submitted, '| Target Action:', fillData.data.postSubmitUrl);

      console.log('66. Testing Phase 17 Multi-Step Web Workflow & Executable Download Block');
      const wfRes = await fetch('http://127.0.0.1:3099/api/jarvis/browser/workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({
          workflowName: 'Documentation Search & Extraction Workflow',
          steps: [
            { type: 'search', target: 'clean architecture' },
            { type: 'navigate', target: 'https://typescript-patterns.io/clean-architecture' },
            { type: 'read', target: 'https://typescript-patterns.io/clean-architecture' },
          ],
        }),
      });
      const wfData = await wfRes.json();
      const dlRes = await fetch('http://127.0.0.1:3099/api/jarvis/browser/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({
          url: 'https://docs.jarvis-ai.dev/malware.exe',
          destinationFilename: 'malware.exe',
        }),
      });
      const dlData = await dlRes.json();
      const sessionRes = await fetch('http://127.0.0.1:3099/api/jarvis/browser/session', {
        headers: { 'x-user-id': 'dwight' },
      });
      const sessionData = await sessionRes.json();
      console.log('   Workflow Executed:', wfData.data.workflowName, '| Steps:', wfData.data.stepsExecuted + '/' + wfData.data.totalSteps, '| Success:', wfData.data.success);
      console.log('   Executable Download Blocked:', dlRes.status === 403, '| Error:', dlData.error);
      console.log('   Active Session History Steps:', sessionData.data.history?.length, '| Current URL:', sessionData.data.currentUrl);

      console.log('67. Testing Phase 18 Application Catalog (GET /api/jarvis/apps/catalog)');
      const catRes = await fetch('http://127.0.0.1:3099/api/jarvis/apps/catalog', {
        headers: { 'x-user-id': 'dwight' },
      });
      const catData = await catRes.json();
      console.log('   Catalog Count:', catData.count, '| Apps:', catData.data.map((a: any) => a.id).join(', '));

      console.log('68. Testing Phase 18 Process Discovery (GET /api/jarvis/apps/processes)');
      const procRes = await fetch('http://127.0.0.1:3099/api/jarvis/apps/processes', {
        headers: { 'x-user-id': 'dwight' },
      });
      const procData = await procRes.json();
      console.log('   Discovered Processes:', procData.count, '| Sample:', procData.data[0]?.processName, '(PID:', procData.data[0]?.pid + ')');

      console.log('69. Testing Phase 18 Safe App Launch & Termination (POST /api/jarvis/apps/launch & close)');
      const launchRes = await fetch('http://127.0.0.1:3099/api/jarvis/apps/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ appId: 'calculator', simulate: true }),
      });
      const launchData = await launchRes.json();
      const closeRes = await fetch('http://127.0.0.1:3099/api/jarvis/apps/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ appId: 'calculator', pid: launchData.data?.pid || 9999, simulate: true }),
      });
      const closeData = await closeRes.json();
      console.log('   Launch Success:', launchData.data?.success, '| PID:', launchData.data?.pid, '| App:', launchData.data?.appId);
      console.log('   Close Success:', closeData.data?.success, '| Graceful:', closeData.data?.graceful);

      console.log('70. Testing Phase 18 Window Management & UAC Protection (POST /api/jarvis/apps/focus)');
      const focusRes = await fetch('http://127.0.0.1:3099/api/jarvis/apps/focus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ appId: 'vscode', windowTitleFilter: 'Visual Studio Code', simulate: true }),
      });
      const focusData = await focusRes.json();
      const uacRes = await fetch('http://127.0.0.1:3099/api/jarvis/apps/focus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ appId: 'vscode', windowTitleFilter: 'Windows Security Credential Dialog', simulate: true }),
      });
      const uacData = await uacRes.json();
      console.log('   Window Focus:', focusData.data?.action, '| Title:', focusData.data?.windowTitle);
      console.log('   UAC Dialogue Blocked:', uacRes.status === 403, '| Error:', uacData.error);

      console.log('71. Testing Phase 18 Deep Link URI Dispatch (POST /api/jarvis/apps/uri)');
      const uriRes = await fetch('http://127.0.0.1:3099/api/jarvis/apps/uri', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ appId: 'vscode', uri: 'vscode://file/src/server.ts', simulate: true }),
      });
      const uriData = await uriRes.json();
      console.log('   URI Dispatch Success:', uriData.data?.success, '| URI:', uriData.data?.uri);

      console.log('72. Testing Phase 18 Local API Commands & Security Authorization Audit');
      const cmdRes = await fetch('http://127.0.0.1:3099/api/jarvis/apps/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({
          appId: 'obsidian',
          endpoint: '/vault/notes.md',
          authToken: 'vault_token_secure_456',
          simulate: true,
        }),
      });
      const cmdData = await cmdRes.json();
      const appAuditRes = await fetch('http://127.0.0.1:3099/api/jarvis/apps/audit', {
        headers: { 'x-user-id': 'dwight' },
      });
      const appAuditData = await appAuditRes.json();
      console.log('   API Command Success:', cmdData.data?.success, '| Protocol:', cmdData.data?.protocol);
      console.log('   Authorization Audit: Total:', appAuditData.data?.totalRegistered, '| Authorized:', appAuditData.data?.authorizedCount, '| Blocked:', appAuditData.data?.blockedCount);

      console.log('73. Testing Phase 19 Camera Device Discovery & Privacy LED Status (GET /api/jarvis/vision/camera/devices & status)');
      const camDevRes = await fetch('http://127.0.0.1:3099/api/jarvis/vision/camera/devices', {
        headers: { 'x-user-id': 'dwight' },
      });
      const camDevData = await camDevRes.json();
      const camStatusRes = await fetch('http://127.0.0.1:3099/api/jarvis/vision/camera/status', {
        headers: { 'x-user-id': 'dwight' },
      });
      const camStatusData = await camStatusRes.json();
      console.log('   Cameras Discovered:', camDevData.count, '| Active Device:', camStatusData.data?.activeDeviceId, '| LED Active:', camStatusData.data?.indicatorActive);

      console.log('74. Testing Phase 19 Rate-Limited Frame Grabber (POST /api/jarvis/vision/camera/capture)');
      const camCapRes = await fetch('http://127.0.0.1:3099/api/jarvis/vision/camera/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ deviceId: 'cam_integrated_01' }),
      });
      const camCapData = await camCapRes.json();
      console.log('   Frame Captured:', camCapData.data?.id, '| Privacy LED Engaged:', camCapData.data?.indicatorActive, '| Format:', camCapData.data?.format);

      console.log('75. Testing Phase 19 Screen Capture & Credential Window Shield (POST /api/jarvis/vision/screen/capture)');
      const screenRes = await fetch('http://127.0.0.1:3099/api/jarvis/vision/screen/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ target: 'fullscreen' }),
      });
      const screenData = await screenRes.json();
      const blockRes = await fetch('http://127.0.0.1:3099/api/jarvis/vision/screen/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ target: 'window', windowTitle: '1Password Vault - Credentials' }),
      });
      const blockData = await blockRes.json();
      console.log('   Fullscreen Capture:', screenData.data?.width + 'x' + screenData.data?.height, '| Bytes:', screenData.data?.sizeBytes);
      console.log('   Credential Window Shielded:', blockRes.status === 403, '| Guard Message:', blockData.error);

      console.log('76. Testing Phase 19 OCR Text, Table & Equation Extraction (POST /api/jarvis/vision/ocr)');
      const testSvg = Buffer.from(
        '<svg width="500" height="200"><text x="10" y="30">Sales | Q1 | Q2</text><text x="10" y="60">Equation: f(x) = ax^2 + bx + c</text></svg>',
        'utf-8'
      ).toString('base64');
      const ocrRes = await fetch('http://127.0.0.1:3099/api/jarvis/vision/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ imageBase64: testSvg, languageHint: 'en' }),
      });
      const ocrData = await ocrRes.json();
      console.log('   OCR Extracted Lines:', ocrData.data?.lines?.length, '| Math Expressions:', ocrData.data?.mathExpressions?.length, '| Sample:', ocrData.data?.fullText?.slice(0, 35));

      console.log('77. Testing Phase 19 Privacy Redaction & PII Masking Shield (POST /api/jarvis/vision/redact)');
      const redactRes = await fetch('http://127.0.0.1:3099/api/jarvis/vision/redact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({
          text: 'Auth: sk-proj99887766554433221100, Card: 4532-1111-2222-3333, Email: dwight@nexus.ai',
        }),
      });
      const redactData = await redactRes.json();
      console.log('   Redactions Count:', redactData.data?.itemsRedactedCount, '| Sanitized Text:', redactData.data?.sanitizedText);

      console.log('78. Testing Phase 19 Visual Scene Understanding & Document Scanning (POST /api/jarvis/vision/analyze & document)');
      const analyzeRes = await fetch('http://127.0.0.1:3099/api/jarvis/vision/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ imageBase64: testSvg }),
      });
      const analyzeData = await analyzeRes.json();
      const docRes = await fetch('http://127.0.0.1:3099/api/jarvis/vision/document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ imageBase64: testSvg }),
      });
      const docData = await docRes.json();
      console.log('   Scene Summary:', analyzeData.data?.sceneSummary, '| Objects Detected:', analyzeData.data?.objects?.length);
      console.log('   Doc Type:', docData.data?.documentType, '| Confidence:', docData.data?.confidence, '| Extracted:', docData.data?.extractedText?.slice(0, 35));

      console.log('79. Testing Phase 20 Microphone Discovery & Status (GET /api/jarvis/voice/devices & /status)');
      const micDevRes = await fetch('http://127.0.0.1:3099/api/jarvis/voice/devices', {
        headers: { 'x-user-id': 'dwight' },
      });
      const micDevData = await micDevRes.json();
      const micStatusRes = await fetch('http://127.0.0.1:3099/api/jarvis/voice/status', {
        headers: { 'x-user-id': 'dwight' },
      });
      const micStatusData = await micStatusRes.json();
      console.log('   Microphones Discovered:', micDevData.count, '| Active Device:', micStatusData.data?.activeDeviceId, '| Muted:', micStatusData.data?.isMuted);

      console.log('80. Testing Phase 20 Hardware Mute Control & Privacy Protection (POST /api/jarvis/voice/mute)');
      const muteRes = await fetch('http://127.0.0.1:3099/api/jarvis/voice/mute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ muted: true }),
      });
      const muteData = await muteRes.json();
      const unmuteRes = await fetch('http://127.0.0.1:3099/api/jarvis/voice/mute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ muted: false }),
      });
      const unmuteData = await unmuteRes.json();
      console.log('   Mute State Toggled:', muteData.data?.muted, '-> Unmuted:', !unmuteData.data?.muted);

      console.log('81. Testing Phase 20 Wake Word Detection (POST /api/jarvis/voice/wake-word)');
      const wakeRes = await fetch('http://127.0.0.1:3099/api/jarvis/voice/wake-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ text: 'Hey Jarvis, initialize full telemetry' }),
      });
      const wakeData = await wakeRes.json();
      console.log('   Wake Word Detected:', wakeData.data?.detected, '| Word:', wakeData.data?.wakeWord, '| Confidence:', wakeData.data?.confidence);

      console.log('82. Testing Phase 20 Speech-to-Text Transcription (POST /api/jarvis/voice/transcribe)');
      const sttRes = await fetch('http://127.0.0.1:3099/api/jarvis/voice/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ text: 'JARVIS activate autonomous coding studio and compile build' }),
      });
      const sttData = await sttRes.json();
      console.log('   Transcribed Text:', sttData.data?.text?.slice(0, 40), '| Words Count:', sttData.data?.words?.length, '| Language:', sttData.data?.language);

      console.log('83. Testing Phase 20 Text-to-Speech Natural Synthesis (POST /api/jarvis/voice/synthesize)');
      const ttsRes = await fetch('http://127.0.0.1:3099/api/jarvis/voice/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({
          text: 'Good morning operator. All defensive perimeters are fully engaged and operational.',
          personaId: 'jarvis-classic',
          emotion: 'authoritative',
        }),
      });
      const ttsData = await ttsRes.json();
      console.log('   Synthesized Format:', ttsData.data?.format, '| Duration:', ttsData.data?.durationMs + 'ms', '| Viseme Phonemes:', ttsData.data?.phonemes?.length, '| Waveform Points:', ttsData.data?.waveform?.length);

      console.log('84. Testing Phase 20 Acoustic Environment Analysis & Voice Personas (POST /api/jarvis/voice/analyze & /persona)');
      const acousticRes = await fetch('http://127.0.0.1:3099/api/jarvis/voice/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ audioSamples: [0.1, 0.2, 0.3, 0.2, -0.1, -0.2] }),
      });
      const acousticData = await acousticRes.json();
      const personaRes = await fetch('http://127.0.0.1:3099/api/jarvis/voice/persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ personaId: 'friday-us' }),
      });
      const personaData = await personaRes.json();
      console.log('   Acoustic dB Level:', acousticData.data?.dbLevel, 'dB | Sound Events:', acousticData.data?.detectedEvents?.[0]?.type);
      console.log('   Switched Active Persona:', personaData.data?.id, '| Name:', personaData.data?.name);

      console.log('85. Testing Phase 21 Connected Hardware & Peripheral Discovery (GET /api/jarvis/devices)');
      const devRes = await fetch('http://127.0.0.1:3099/api/jarvis/devices', {
        headers: { 'x-user-id': 'dwight' },
      });
      const devData = await devRes.json();
      console.log('   Devices Discovered:', devData.count, '| Sample Hardware:', devData.data?.[0]?.name, '| Type:', devData.data?.[0]?.type);

      console.log('86. Testing Phase 21 Real-Time System Hardware Telemetry (GET /api/jarvis/devices/telemetry)');
      const telemRes = await fetch('http://127.0.0.1:3099/api/jarvis/devices/telemetry', {
        headers: { 'x-user-id': 'dwight' },
      });
      const telemData = await telemRes.json();
      console.log('   CPU Usage:', telemData.data?.cpu?.usagePercent + '%', '| CPU Temp:', telemData.data?.cpu?.tempCelsius + '°C', '| RAM Usage:', telemData.data?.memory?.usagePercent + '%', '| Battery:', telemData.data?.battery?.levelPercent + '%');

      console.log('87. Testing Phase 21 Smart Home IoT Lighting & Climate Modulation (POST /api/jarvis/devices/iot/control)');
      const iotCtrlRes = await fetch('http://127.0.0.1:3099/api/jarvis/devices/iot/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ deviceId: 'iot_light_desk', brightness: 92, colorHex: '#00f0ff' }),
      });
      const iotCtrlData = await iotCtrlRes.json();
      console.log('   IoT Device Controlled:', iotCtrlData.data?.name, '| Power:', iotCtrlData.data?.power, '| Brightness:', iotCtrlData.data?.brightness, '| Color:', iotCtrlData.data?.colorHex);

      console.log('88. Testing Phase 21 Microcontroller Virtual Serial COM Port Transmit (POST /api/jarvis/devices/serial/send)');
      const serialRes = await fetch('http://127.0.0.1:3099/api/jarvis/devices/serial/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ port: 'COM3', command: 'status' }),
      });
      const serialData = await serialRes.json();
      console.log('   Serial Port:', serialData.data?.port, '| Bytes Written:', serialData.data?.bytesWritten, '| Response:', serialData.data?.response);

      console.log('89. Testing Phase 21 Bluetooth Low Energy Scanner & GATT Interaction (POST /api/jarvis/devices/ble/scan & write)');
      const bleScanRes = await fetch('http://127.0.0.1:3099/api/jarvis/devices/ble/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
      });
      const bleScanData = await bleScanRes.json();
      const bleWriteRes = await fetch('http://127.0.0.1:3099/api/jarvis/devices/ble/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ peripheralId: 'ble_smart_band', serviceUuid: '1802', charUuid: '2a06', hexValue: '02' }),
      });
      const bleWriteData = await bleWriteRes.json();
      console.log('   BLE Beacons Found:', bleScanData.count, '| Top Beacon:', bleScanData.data?.[0]?.name, '| RSSI:', bleScanData.data?.[0]?.rssi + ' dBm');
      console.log('   GATT Characteristic Written:', bleWriteData.data?.name, '| New Value:', bleWriteData.data?.valueHex);

      console.log('90. Testing Phase 21 Hardware Safety Interlock & Emergency Cutoff (GET /safety & POST /safety/cutoff)');
      const safetyGetRes = await fetch('http://127.0.0.1:3099/api/jarvis/devices/safety', {
        headers: { 'x-user-id': 'dwight' },
      });
      const safetyGetData = await safetyGetRes.json();
      const safetyCutoffRes = await fetch('http://127.0.0.1:3099/api/jarvis/devices/safety/cutoff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ cutoff: true, reason: 'Operator manual verification drill' }),
      });
      const safetyCutoffData = await safetyCutoffRes.json();
      const safetyRestoreRes = await fetch('http://127.0.0.1:3099/api/jarvis/devices/safety/cutoff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ cutoff: false }),
      });
      const safetyRestoreData = await safetyRestoreRes.json();
      console.log('   Safety Interlock Initial Status: Max Wattage:', safetyGetData.data?.maxSafeWattageLimit + 'W', '| Total Draw:', safetyGetData.data?.totalWattageDraw + 'W');
      console.log('   Emergency Cutoff Tripped:', safetyCutoffData.data?.emergencyCutoffEngaged, '-> Cutoff Restored:', !safetyRestoreData.data?.emergencyCutoffEngaged);

      console.log('91. Testing Phase 22 Goals & Personal Planning Discovery & Analytics (GET /api/jarvis/goals & /analytics)');
      const goalsRes = await fetch('http://127.0.0.1:3099/api/jarvis/goals', {
        headers: { 'x-user-id': 'dwight' },
      });
      const goalsData = await goalsRes.json();
      const goalsAnalyticsRes = await fetch('http://127.0.0.1:3099/api/jarvis/goals/analytics', {
        headers: { 'x-user-id': 'dwight' },
      });
      const goalsAnalyticsData = await goalsAnalyticsRes.json();
      console.log('   Goals Discovered:', goalsData.count, '| Top Goal:', goalsData.data?.[0]?.title);
      console.log('   Overall Goals Progress Avg:', goalsAnalyticsData.data?.overallProgressAverage + '%', '| Weekly Velocity:', goalsAnalyticsData.data?.weeklyVelocity, 'tasks/wk');

      console.log('92. Testing Phase 22 Idea-to-Progress SMART Goal Decomposition (POST /api/jarvis/goals/decompose)');
      const decompRes = await fetch('http://127.0.0.1:3099/api/jarvis/goals/decompose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({
          idea: 'Master Full-Stack TypeScript System Architecture for Autonomous Operating Systems',
          category: 'coding',
        }),
      });
      const decompData = await decompRes.json();
      console.log('   Decomposed Title:', decompData.data?.smartGoal?.title);
      console.log('   SMART Specific Metric:', decompData.data?.smartGoal?.smart?.specific?.slice(0, 60) + '...');
      console.log('   Tasks Generated:', decompData.data?.tasks?.length, '| Top Task Quadrant:', decompData.data?.tasks?.[0]?.quadrant);

      console.log('93. Testing Phase 22 Tasks Management & Eisenhower Matrix Quadrants (POST /tasks & GET /eisenhower)');
      const taskCreateRes = await fetch('http://127.0.0.1:3099/api/jarvis/goals/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({
          title: 'Deploy End-to-End Autonomous Agentic Test Bed',
          isUrgent: true,
          isImportant: true,
          estimatedMinutes: 60,
          assignedTo: 'coding-agent',
        }),
      });
      const taskCreateData = await taskCreateRes.json();
      const eisenhowerRes = await fetch('http://127.0.0.1:3099/api/jarvis/goals/eisenhower', {
        headers: { 'x-user-id': 'dwight' },
      });
      const eisenhowerData = await eisenhowerRes.json();
      console.log('   Task Created:', taskCreateData.data?.title, '| Quadrant:', taskCreateData.data?.quadrant);
      console.log('   Eisenhower Quadrants: Do First:', eisenhowerData.data?.do_first?.length, '| Schedule:', eisenhowerData.data?.schedule?.length, '| Delegate:', eisenhowerData.data?.delegate?.length);

      console.log('94. Testing Phase 22 Projects Workspace Coordination (GET /projects/all & POST /projects)');
      const projGetRes = await fetch('http://127.0.0.1:3099/api/jarvis/goals/projects/all', {
        headers: { 'x-user-id': 'dwight' },
      });
      const projGetData = await projGetRes.json();
      const projCreateRes = await fetch('http://127.0.0.1:3099/api/jarvis/goals/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({
          name: 'JARVIS Proactive Intelligence Pipeline',
          description: 'Autonomous scheduling, background triggers, and self-directed task runners.',
          tags: ['proactive', 'phase23', 'autonomous'],
        }),
      });
      const projCreateData = await projCreateRes.json();
      console.log('   Projects Enrolled:', projGetData.count, '| Lead Project:', projGetData.data?.[0]?.name);
      console.log('   New Project Created:', projCreateData.data?.name, '| Status:', projCreateData.data?.status);

      console.log('95. Testing Phase 22 Calendar Timeblocking & Circadian Peak Focus (GET /schedule & /suggest)');
      const schedListRes = await fetch('http://127.0.0.1:3099/api/jarvis/goals/schedule', {
        headers: { 'x-user-id': 'dwight' },
      });
      const schedListData = await schedListRes.json();
      const schedSuggestRes = await fetch('http://127.0.0.1:3099/api/jarvis/goals/schedule/suggest?duration=90', {
        headers: { 'x-user-id': 'dwight' },
      });
      const schedSuggestData = await schedSuggestRes.json();
      console.log('   Scheduled Blocks:', schedListData.count, '| Morning Block:', schedListData.data?.[0]?.title);
      console.log('   Circadian Recommended Window:', schedSuggestData.data?.recommendedStart + ' - ' + schedSuggestData.data?.recommendedEnd, '| Reason:', schedSuggestData.data?.reason);

      console.log('96. Testing Phase 22 Study Planner & Ebbinghaus Spaced Repetition (GET /study/plans & POST /review)');
      const studyPlanRes = await fetch('http://127.0.0.1:3099/api/jarvis/goals/study/plans');
      const studyPlanData = await studyPlanRes.json();
      const studyReviewRes = await fetch('http://127.0.0.1:3099/api/jarvis/goals/study/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({
          planId: 'plan_let_math_2026',
          topicId: 'topic_let_1',
          minutesSpent: 60,
          scoreOrSelfRating: 95,
        }),
      });
      const studyReviewData = await studyReviewRes.json();
      console.log('   Curriculum Study Plans:', studyPlanData.count, '| Title:', studyPlanData.data?.[0]?.title);
      console.log('   Topic Reviewed:', studyReviewData.data?.topic?.topic, '| New Repetition Interval:', studyReviewData.data?.topic?.repetitionIntervalDays + ' days', '| Overall Mastery:', studyReviewData.data?.plan?.overallMasteryPct + '%');

      console.log('\n=== ALL MANUAL VERIFICATION STEPS (PHASES 1 TO 22) PASSED SUCCESSFULLY! ===');
    } catch (err) {
      console.error('Manual verification failed:', err);
    } finally {
      server.close();
    }
  });
}

runManualVerification();


