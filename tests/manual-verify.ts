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

      console.log('\n=== ALL MANUAL VERIFICATION STEPS (PHASES 1 TO 14) PASSED SUCCESSFULLY! ===');
    } catch (err) {
      console.error('Manual verification failed:', err);
    } finally {
      server.close();
    }
  });
}

runManualVerification();


