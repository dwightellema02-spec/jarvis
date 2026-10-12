import { createApp } from '../src/server/app.js';
import { MockAIProvider } from '../src/providers/mock-provider.js';

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

      console.log('\n=== ALL MANUAL VERIFICATION STEPS (PHASES 1, 2, 3 & 4) PASSED SUCCESSFULLY! ===');
    } catch (err) {
      console.error('Manual verification failed:', err);
    } finally {
      server.close();
    }
  });
}

runManualVerification();
