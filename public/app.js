// JARVIS Web Frontend Client — Phase 1 Core Intelligence
document.addEventListener('DOMContentLoaded', () => {
  const messagesContainer = document.getElementById('messages-container');
  const chatForm = document.getElementById('chat-form');
  const messageInput = document.getElementById('message-input');
  const sendBtn = document.getElementById('send-btn');
  const sessionIdDisplay = document.getElementById('session-id-display');
  const newSessionBtn = document.getElementById('new-session-btn');
  const errorBanner = document.getElementById('error-banner');
  const errorText = document.getElementById('error-text');
  const closeErrorBtn = document.getElementById('close-error');
  const suggestions = document.getElementById('suggestions');

  // Phase 3 Profile Elements
  const profileToggleBtn = document.getElementById('profile-toggle-btn');
  const profileModal = document.getElementById('profile-modal');
  const closeProfileModalBtn = document.getElementById('close-profile-modal');
  const headerUserName = document.getElementById('header-user-name');
  const profGoalsList = document.getElementById('prof-goals-list');
  const profProjectsList = document.getElementById('prof-projects-list');
  const profStudyList = document.getElementById('prof-study-list');
  const profIdentityDesc = document.getElementById('prof-identity-desc');
  const profTimezone = document.getElementById('prof-timezone');

  let currentSessionId = localStorage.getItem('jarvis_session_id');

  // Fetch and display user profile
  async function loadUserProfile() {
    try {
      const res = await fetch('/api/jarvis/profile?userId=default_user');
      const data = await res.json();
      if (data && data.profile) {
        const p = data.profile;
        if (headerUserName) headerUserName.textContent = p.identity.preferredName || p.identity.name;
        if (profIdentityDesc) profIdentityDesc.textContent = `${p.identity.name} • ${p.identity.role}`;
        if (profTimezone) profTimezone.textContent = `Timezone: ${p.identity.timezone} | Locale: ${p.identity.locale}`;

        if (profGoalsList) {
          profGoalsList.innerHTML = p.goals
            .map((g) => `<li><strong>[${g.priority.toUpperCase()}] ${g.title}</strong> — ${g.description}</li>`)
            .join('');
        }
        if (profProjectsList) {
          profProjectsList.innerHTML = p.projects
            .map((pr) => `<li><strong>${pr.name}</strong> (${pr.role}) — ${pr.description}</li>`)
            .join('');
        }
        if (profStudyList) {
          profStudyList.innerHTML = p.studyAreas
            .map((s) => `<li><strong>${s.title}</strong>: Focus on ${s.currentTopic} [${s.masteryLevel}]</li>`)
            .join('');
        }
      }
    } catch (err) {
      console.warn('Could not load user profile:', err);
    }
  }

  if (profileToggleBtn && profileModal) {
    profileToggleBtn.addEventListener('click', () => {
      profileModal.classList.remove('hidden');
    });
  }
  if (closeProfileModalBtn && profileModal) {
    closeProfileModalBtn.addEventListener('click', () => {
      profileModal.classList.add('hidden');
    });
  }
  if (profileModal) {
    profileModal.addEventListener('click', (e) => {
      if (e.target === profileModal) profileModal.classList.add('hidden');
    });
  }

  // Phase 5 Second Brain Elements
  const secondBrainToggleBtn = document.getElementById('second-brain-toggle-btn');
  const secondBrainModal = document.getElementById('second-brain-modal');
  const closeSecondBrainModalBtn = document.getElementById('close-second-brain-modal');
  const sbMathList = document.getElementById('sb-math-list');
  const sbLetList = document.getElementById('sb-let-list');
  const sbProjectsList = document.getElementById('sb-projects-list');
  const sbKnowledgeList = document.getElementById('sb-knowledge-list');

  async function loadSecondBrainTree() {
    try {
      const res = await fetch('/api/jarvis/second-brain/tree?userId=default_user');
      const data = await res.json();
      if (data && data.tree) {
        const t = data.tree;
        if (sbMathList) {
          sbMathList.innerHTML = t.study.mathematics.map((n) => `<li><strong>${n.title}</strong> (${n.relationshipCount} links)</li>`).join('') || '<li>None</li>';
        }
        if (sbLetList) {
          const letItems = [...t.study.let, ...t.study.thesis];
          sbLetList.innerHTML = letItems.map((n) => `<li><strong>${n.title}</strong> [${n.category}]</li>`).join('') || '<li>None</li>';
        }
        if (sbProjectsList) {
          const projItems = [...t.projects.tuklas, ...t.projects.jarvis];
          sbProjectsList.innerHTML = projItems.map((n) => `<li><strong>${n.title}</strong> [${n.category}]</li>`).join('') || '<li>None</li>';
        }
        if (sbKnowledgeList) {
          sbKnowledgeList.innerHTML = t.knowledge.map((n) => `<li><strong>${n.title}</strong>: ${n.tags.join(', ')}</li>`).join('') || '<li>None</li>';
        }
      }
    } catch (err) {
      console.warn('Could not load second brain tree:', err);
    }
  }

  if (secondBrainToggleBtn && secondBrainModal) {
    secondBrainToggleBtn.addEventListener('click', async () => {
      secondBrainModal.classList.remove('hidden');
      await loadSecondBrainTree();
    });
  }
  if (closeSecondBrainModalBtn && secondBrainModal) {
    closeSecondBrainModalBtn.addEventListener('click', () => {
      secondBrainModal.classList.add('hidden');
    });
  }
  if (secondBrainModal) {
    secondBrainModal.addEventListener('click', (e) => {
      if (e.target === secondBrainModal) secondBrainModal.classList.add('hidden');
    });
  }

  // Phase 6 Document Intelligence Elements
  const documentsToggleBtn = document.getElementById('documents-toggle-btn');
  const documentsModal = document.getElementById('documents-modal');
  const closeDocumentsModalBtn = document.getElementById('close-documents-modal');
  const documentsList = document.getElementById('documents-list');
  const docQuickName = document.getElementById('doc-quick-name');
  const docQuickContent = document.getElementById('doc-quick-content');
  const docQuickIngestBtn = document.getElementById('doc-quick-ingest-btn');
  const documentDetailPanel = document.getElementById('document-detail-panel');
  const docDetailTitle = document.getElementById('doc-detail-title');
  const docDetailContent = document.getElementById('doc-detail-content');

  async function loadDocumentsList() {
    if (!documentsList) return;
    try {
      const res = await fetch('/api/jarvis/documents');
      const data = await res.json();
      if (data && data.documents && data.documents.length > 0) {
        documentsList.innerHTML = data.documents.map((d) => `
          <li style="margin-bottom: 0.75rem; padding-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <div><strong>${d.filename}</strong> <span class="tag" style="background: rgba(59,130,246,0.2); color: #60a5fa;">${d.fileType.toUpperCase()}</span> (${d.sizeBytes} B)</div>
            <div style="margin-top: 0.25rem; display: flex; gap: 0.5rem;">
              <button class="btn btn-outline" style="font-size: 0.75rem; padding: 2px 8px;" onclick="window.jarvisSummarizeDoc('${d.id}')">Summarize</button>
              <button class="btn btn-outline" style="font-size: 0.75rem; padding: 2px 8px; border-color: rgba(16,185,129,0.3); color: #10b981;" onclick="window.jarvisToSecondBrain('${d.id}')">To 2nd Brain</button>
            </div>
          </li>
        `).join('');
      } else {
        documentsList.innerHTML = '<li>No documents ingested yet. Paste notes or CSV above to begin.</li>';
      }
    } catch (err) {
      console.warn('Could not load documents list:', err);
    }
  }

  window.jarvisSummarizeDoc = async (id) => {
    try {
      const res = await fetch(`/api/jarvis/documents/${id}/summarize`, { method: 'POST' });
      const data = await res.json();
      if (data && data.summary && documentDetailPanel && docDetailTitle && docDetailContent) {
        docDetailTitle.textContent = `Summary: ${data.summary.title}`;
        docDetailContent.innerHTML = `
          <p><strong>Overview:</strong> ${data.summary.overview}</p>
          <p><strong>Key Points:</strong></p>
          <ul>${data.summary.keyPoints.map((k) => `<li>${k}</li>`).join('')}</ul>
          <p style="font-size: 0.8rem; color: #94a3b8;">Words: ${data.summary.wordCount} | Read Time: ${data.summary.estimatedReadMinutes} min</p>
        `;
        documentDetailPanel.classList.remove('hidden');
      }
    } catch (err) {
      console.error('Failed to summarize document:', err);
    }
  };

  window.jarvisToSecondBrain = async (id) => {
    try {
      const res = await fetch(`/api/jarvis/documents/${id}/to-knowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'dwight' }),
      });
      const data = await res.json();
      if (data && data.result) {
        alert(data.result.summary);
      }
    } catch (err) {
      console.error('Failed to export document to second brain:', err);
    }
  };

  if (docQuickIngestBtn && docQuickName && docQuickContent) {
    docQuickIngestBtn.addEventListener('click', async () => {
      const filename = docQuickName.value.trim();
      const content = docQuickContent.value.trim();
      if (!filename || !content) {
        alert('Please provide both filename and content.');
        return;
      }
      try {
        const res = await fetch('/api/jarvis/documents/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename, content, userId: 'dwight' }),
        });
        const data = await res.json();
        if (res.ok) {
          docQuickName.value = '';
          docQuickContent.value = '';
          await loadDocumentsList();
        } else {
          alert(`Error: ${data.error || 'Ingest failed'}`);
        }
      } catch (err) {
        alert(`Failed to ingest document: ${err}`);
      }
    });
  }

  if (documentsToggleBtn && documentsModal) {
    documentsToggleBtn.addEventListener('click', async () => {
      documentsModal.classList.remove('hidden');
      await loadDocumentsList();
    });
  }
  if (closeDocumentsModalBtn && documentsModal) {
    closeDocumentsModalBtn.addEventListener('click', () => {
      documentsModal.classList.add('hidden');
    });
  }
  if (documentsModal) {
    documentsModal.addEventListener('click', (e) => {
      if (e.target === documentsModal) documentsModal.classList.add('hidden');
    });
  }

  // Initialize or restore session
  async function initSession() {
    await loadUserProfile();
    if (!currentSessionId) {
      await createNewSession();
    } else {
      sessionIdDisplay.textContent = currentSessionId;
    }
  }

  async function createNewSession() {
    try {
      const res = await fetch('/api/jarvis/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'dwight' }),
      });
      const data = await res.json();
      currentSessionId = data.sessionId;
      localStorage.setItem('jarvis_session_id', currentSessionId);
      sessionIdDisplay.textContent = currentSessionId;
    } catch (err) {
      console.error('Failed to create session:', err);
      currentSessionId = `sess_local_${Date.now()}`;
      sessionIdDisplay.textContent = currentSessionId;
    }
  }

  function showError(msg) {
    errorText.textContent = msg;
    errorBanner.classList.remove('hidden');
  }

  function hideError() {
    errorBanner.classList.add('hidden');
  }

  closeErrorBtn.addEventListener('click', hideError);

  newSessionBtn.addEventListener('click', async () => {
    await createNewSession();
    // Clear chat display, keep welcome bubble
    messagesContainer.innerHTML = `
      <div class="message-wrapper assistant-wrapper">
        <div class="avatar assistant-avatar">J</div>
        <div class="message-content">
          <div class="sender-name">JARVIS <span class="tag">AI</span></div>
          <div class="bubble assistant-bubble">
            <p>New session initialized. How can I assist you in this conversation?</p>
          </div>
          <div class="timestamp">Just now</div>
        </div>
      </div>
    `;
    hideError();
  });

  function appendMessage(role, text) {
    const wrapper = document.createElement('div');
    wrapper.className = `message-wrapper ${role}-wrapper`;

    const avatar = document.createElement('div');
    avatar.className = `avatar ${role}-avatar`;
    avatar.textContent = role === 'user' ? 'U' : 'J';

    const content = document.createElement('div');
    content.className = 'message-content';

    const sender = document.createElement('div');
    sender.className = 'sender-name';
    sender.innerHTML = role === 'user' ? 'You' : 'JARVIS <span class="tag">AI</span>';

    const bubble = document.createElement('div');
    bubble.className = `bubble ${role}-bubble`;
    bubble.textContent = text;

    const time = document.createElement('div');
    time.className = 'timestamp';
    time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    content.appendChild(sender);
    content.appendChild(bubble);
    content.appendChild(time);

    wrapper.appendChild(avatar);
    wrapper.appendChild(content);

    messagesContainer.appendChild(wrapper);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'typing-indicator-wrapper';
    indicator.className = 'message-wrapper assistant-wrapper';
    indicator.innerHTML = `
      <div class="avatar assistant-avatar">J</div>
      <div class="message-content">
        <div class="sender-name">JARVIS <span class="tag">AI</span></div>
        <div class="bubble assistant-bubble typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    `;
    messagesContainer.appendChild(indicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator-wrapper');
    if (indicator) {
      indicator.remove();
    }
  }

  async function sendMessage(text) {
    const message = text.trim();
    if (!message) return;

    hideError();
    appendMessage('user', message);
    messageInput.value = '';
    messageInput.style.height = 'auto';

    sendBtn.disabled = true;
    showTypingIndicator();

    try {
      const res = await fetch('/api/jarvis/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          sessionId: currentSessionId,
          userId: 'dwight',
        }),
      });

      const data = await res.json();
      removeTypingIndicator();

      if (!res.ok) {
        showError(data.message || `Error ${res.status}: Failed to get response`);
        appendMessage('assistant', `Error: ${data.message || 'Unable to generate response'}`);
      } else {
        appendMessage('assistant', data.response);
      }
    } catch (err) {
      removeTypingIndicator();
      console.error('Chat error:', err);
      showError('Network error: Unable to communicate with JARVIS Core server.');
      appendMessage('assistant', 'Network failure: Could not contact JARVIS Core.');
    } finally {
      sendBtn.disabled = false;
      messageInput.focus();
    }
  }

  // Handle Form Submit
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage(messageInput.value);
  });

  // Handle Enter (submit) and Shift+Enter (newline)
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(messageInput.value);
    }
  });

  // Auto-resize textarea
  messageInput.addEventListener('input', () => {
    messageInput.style.height = 'auto';
    messageInput.style.height = `${Math.min(messageInput.scrollHeight, 140)}px`;
  });

  // Prompt suggestions chips
  if (suggestions) {
    suggestions.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (chip && chip.dataset.prompt) {
        sendMessage(chip.dataset.prompt);
      }
    });
  }

  // --- Phase 7: Mathematics & LET Review UI Handlers ---
  const mathToggleBtn = document.getElementById('math-toggle-btn');
  const mathModal = document.getElementById('math-modal');
  const closeMathModal = document.getElementById('close-math-modal');
  const mathTabSolver = document.getElementById('math-tab-solver');
  const mathTabLearning = document.getElementById('math-tab-learning');
  const mathTabLet = document.getElementById('math-tab-let');
  const mathPanelSolver = document.getElementById('math-panel-solver');
  const mathPanelLearning = document.getElementById('math-panel-learning');
  const mathPanelLet = document.getElementById('math-panel-let');

  if (mathToggleBtn && mathModal && closeMathModal) {
    mathToggleBtn.addEventListener('click', () => {
      mathModal.classList.remove('hidden');
    });

    closeMathModal.addEventListener('click', () => {
      mathModal.classList.add('hidden');
    });

    mathModal.addEventListener('click', (e) => {
      if (e.target === mathModal) mathModal.classList.add('hidden');
    });

    // Tab Switching
    function setMathTab(active) {
      [mathTabSolver, mathTabLearning, mathTabLet].forEach((btn) => {
        btn.style.borderColor = 'rgba(255, 255, 255, 0.15)';
        btn.style.color = '#cbd5e1';
      });
      [mathPanelSolver, mathPanelLearning, mathPanelLet].forEach((p) => p.classList.add('hidden'));

      if (active === 'solver') {
        mathTabSolver.style.borderColor = '#f59e0b';
        mathTabSolver.style.color = '#f59e0b';
        mathPanelSolver.classList.remove('hidden');
      } else if (active === 'learning') {
        mathTabLearning.style.borderColor = '#f59e0b';
        mathTabLearning.style.color = '#f59e0b';
        mathPanelLearning.classList.remove('hidden');
      } else if (active === 'let') {
        mathTabLet.style.borderColor = '#f59e0b';
        mathTabLet.style.color = '#f59e0b';
        mathPanelLet.classList.remove('hidden');
      }
    }

    mathTabSolver.addEventListener('click', () => setMathTab('solver'));
    mathTabLearning.addEventListener('click', () => setMathTab('learning'));
    mathTabLet.addEventListener('click', () => setMathTab('let'));

    // Solver logic
    const mathSolveBtn = document.getElementById('math-solve-btn');
    const mathSolverInput = document.getElementById('math-solver-input');
    const mathSolverDomain = document.getElementById('math-solver-domain');
    const mathSolverResult = document.getElementById('math-solver-result');

    if (mathSolveBtn) {
      mathSolveBtn.addEventListener('click', async () => {
        const expression = mathSolverInput.value.trim();
        const domain = mathSolverDomain.value;
        if (!expression) return;

        try {
          mathSolverResult.classList.remove('hidden');
          mathSolverResult.innerHTML = '<span style="color: #94a3b8;">Computing verified solution...</span>';
          const res = await fetch('/api/jarvis/math/solve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ domain, expression }),
          });
          const data = await res.json();
          if (!data.success) {
            mathSolverResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
          } else {
            const stepsHtml = (data.data.steps || [])
              .map(
                (s) =>
                  `<li style="margin-bottom: 0.5rem;"><strong>Step ${s.stepNumber} - ${s.title}:</strong> <code style="background: #1e293b; padding: 2px 4px; border-radius: 4px;">${s.expression}</code><div style="font-size: 0.85rem; color: #94a3b8;">${s.explanation}</div></li>`
              )
              .join('');

            mathSolverResult.innerHTML = `
              <div style="font-size: 1.1rem; color: #f59e0b; font-weight: bold; margin-bottom: 0.5rem;">Result: ${data.data.formattedAnswer}</div>
              <ol style="margin: 0; padding-left: 1.25rem; font-size: 0.9rem; color: #f8fafc;">${stepsHtml}</ol>
            `;
          }
        } catch (err) {
          mathSolverResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    // Socratic Learning Logic
    const mathStartDiagnosticBtn = document.getElementById('math-start-diagnostic-btn');
    const mathLoadWorkedExampleBtn = document.getElementById('math-load-worked-example-btn');
    const mathLearnDomain = document.getElementById('math-learn-domain');
    const mathLearningWorkspace = document.getElementById('math-learning-workspace');

    if (mathStartDiagnosticBtn) {
      mathStartDiagnosticBtn.addEventListener('click', async () => {
        const domain = mathLearnDomain.value;
        try {
          mathLearningWorkspace.innerHTML = '<span style="color: #94a3b8;">Generating diagnostic assessment...</span>';
          const res = await fetch('/api/jarvis/math/assess', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ domain }),
          });
          const data = await res.json();
          if (!data.success || !data.data.problems?.length) {
            mathLearningWorkspace.innerHTML = `<span style="color: #ef4444;">No diagnostic items available for ${domain}.</span>`;
            return;
          }

          const problemsHtml = data.data.problems
            .map(
              (p, idx) => `
              <div style="margin-bottom: 1rem; padding: 0.75rem; background: #1e293b; border-radius: 6px;">
                <div style="font-weight: bold; color: #f8fafc;">#${idx + 1} (${p.topic}): ${p.question}</div>
                <div style="font-size: 0.85rem; color: #94a3b8; margin-top: 0.25rem;">Prerequisites: ${p.prerequisites.join(', ')}</div>
              </div>
            `
            )
            .join('');

          mathLearningWorkspace.innerHTML = `
            <h4 style="color: #f59e0b; margin-top: 0;">Diagnostic Assessment: ${domain.toUpperCase()}</h4>
            ${problemsHtml}
          `;
        } catch (err) {
          mathLearningWorkspace.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    if (mathLoadWorkedExampleBtn) {
      mathLoadWorkedExampleBtn.addEventListener('click', async () => {
        const domain = mathLearnDomain.value;
        try {
          mathLearningWorkspace.innerHTML = '<span style="color: #94a3b8;">Loading worked example...</span>';
          const res = await fetch(`/api/jarvis/math/worked-example?domain=${domain}`);
          const data = await res.json();
          if (!data.success) {
            mathLearningWorkspace.innerHTML = `<span style="color: #ef4444;">Error loading worked example.</span>`;
            return;
          }
          const we = data.data;
          const stepsHtml = (we.steps || [])
            .map(
              (s) =>
                `<li style="margin-bottom: 0.4rem;"><strong>${s.title}:</strong> <code>${s.expression}</code> - <span style="color: #94a3b8;">${s.explanation}</span></li>`
            )
            .join('');

          mathLearningWorkspace.innerHTML = `
            <h4 style="color: #f59e0b; margin-top: 0;">Worked Example: ${we.topic}</h4>
            <div style="margin-bottom: 0.5rem; color: #e2e8f0;"><strong>Problem:</strong> ${we.problem}</div>
            <div style="margin-bottom: 0.5rem; font-size: 0.9rem; color: #94a3b8;"><em>Concept:</em> ${we.conceptSummary}</div>
            <ol style="margin: 0; padding-left: 1.25rem; font-size: 0.85rem;">${stepsHtml}</ol>
            <div style="margin-top: 0.5rem; color: #10b981; font-weight: bold;">Final Answer: ${we.finalAnswer}</div>
          `;
        } catch (err) {
          mathLearningWorkspace.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    // LET Board Exam Logic
    const letStartMockBtn = document.getElementById('let-start-mock-btn');
    const letViewCompetenciesBtn = document.getElementById('let-view-competencies-btn');
    const letWorkspace = document.getElementById('let-workspace');

    if (letStartMockBtn) {
      letStartMockBtn.addEventListener('click', async () => {
        try {
          letWorkspace.innerHTML = '<span style="color: #94a3b8;">Generating 20-item LET Mock Examination...</span>';
          const res = await fetch('/api/jarvis/math/let/mock-exam');
          const data = await res.json();
          if (!data.success) {
            letWorkspace.innerHTML = `<span style="color: #ef4444;">Error generating mock exam.</span>`;
            return;
          }

          const questions = data.data.questions;
          let currentAnswers = {};

          const qHtml = questions
            .map(
              (q, idx) => `
              <div style="margin-bottom: 1.25rem; padding: 0.75rem; background: #1e293b; border-radius: 6px;">
                <div style="font-weight: bold; color: #f8fafc; margin-bottom: 0.5rem;">${idx + 1}. ${q.question}</div>
                <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                  ${(q.options || [])
                    .map(
                      (opt) => `
                    <label style="font-size: 0.85rem; color: #cbd5e1; cursor: pointer;">
                      <input type="radio" name="let-q-${q.id}" value="${opt.key}" data-qid="${q.id}" class="let-option-radio" />
                      <strong>(${opt.key})</strong> ${opt.text}
                    </label>
                  `
                    )
                    .join('')}
                </div>
              </div>
            `
            )
            .join('');

          letWorkspace.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <h4 style="color: #f59e0b; margin: 0;">Philippine BLEPT Mathematics Majorship Mock Exam (Passing: 75%)</h4>
              <button id="let-submit-exam-btn" class="btn btn-primary" style="background: #10b981; border-color: #10b981; color: #000; font-weight: bold;">Submit & Evaluate</button>
            </div>
            <form id="let-exam-form">${qHtml}</form>
          `;

          const radios = letWorkspace.querySelectorAll('.let-option-radio');
          radios.forEach((r) => {
            r.addEventListener('change', (e) => {
              currentAnswers[e.target.dataset.qid] = e.target.value;
            });
          });

          const submitBtn = document.getElementById('let-submit-exam-btn');
          if (submitBtn) {
            submitBtn.addEventListener('click', async () => {
              const evalRes = await fetch('/api/jarvis/math/let/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers: currentAnswers }),
              });
              const evalData = await evalRes.json();
              if (evalData.success) {
                const res = evalData.data;
                letWorkspace.innerHTML = `
                  <div style="padding: 1rem; background: ${res.passed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; border: 1px solid ${res.passed ? '#10b981' : '#ef4444'}; border-radius: 8px; margin-bottom: 1rem;">
                    <h3 style="color: ${res.passed ? '#10b981' : '#ef4444'}; margin-top: 0;">Exam Result: ${res.passed ? 'PASSED (LPT)' : 'DID NOT PASS (Review Needed)'}</h3>
                    <div style="font-size: 1.1rem; color: #f8fafc;">Score: <strong>${res.score} / ${res.total}</strong> (${res.percentage}%)</div>
                    <div style="font-size: 0.85rem; color: #94a3b8; margin-top: 0.25rem;">Standard Philippine PRC Passing Threshold: 75.0%</div>
                  </div>
                  <h4 style="color: #f59e0b;">Question Explanations & Distractor Rationales:</h4>
                  ${res.questionEvaluations
                    .map(
                      (qe, idx) => `
                    <div style="margin-bottom: 0.75rem; padding: 0.5rem 0.75rem; background: #1e293b; border-left: 3px solid ${qe.isCorrect ? '#10b981' : '#ef4444'}; border-radius: 4px;">
                      <div><strong>#${idx + 1}:</strong> ${qe.question}</div>
                      <div style="font-size: 0.85rem; color: ${qe.isCorrect ? '#10b981' : '#ef4444'}; margin-top: 0.25rem;">
                        Your Answer: <strong>${qe.selectedKey || 'Unanswered'}</strong> | Correct: <strong>${qe.correctKey}</strong>
                      </div>
                      <div style="font-size: 0.85rem; color: #cbd5e1; margin-top: 0.25rem;">${qe.explanation}</div>
                      ${qe.selectedDistractorRationale ? `<div style="font-size: 0.8rem; color: #fbbf24; margin-top: 0.25rem;"><em>Why selected:</em> ${qe.selectedDistractorRationale}</div>` : ''}
                    </div>
                  `
                    )
                    .join('')}
                `;
              }
            });
          }
        } catch (err) {
          letWorkspace.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    if (letViewCompetenciesBtn) {
      letViewCompetenciesBtn.addEventListener('click', async () => {
        try {
          letWorkspace.innerHTML = '<span style="color: #94a3b8;">Loading Table of Specifications...</span>';
          const res = await fetch('/api/jarvis/math/let/competencies');
          const data = await res.json();
          if (data.success) {
            const comps = data.data
              .map(
                (c) => `
              <li style="margin-bottom: 0.75rem; background: #1e293b; padding: 0.5rem 0.75rem; border-radius: 6px;">
                <div style="color: #f59e0b; font-weight: bold;">${c.code}: ${c.title} (${c.weightPercent}%)</div>
                <div style="font-size: 0.85rem; color: #94a3b8; margin-top: 0.25rem;">${c.description}</div>
              </li>
            `
              )
              .join('');
            letWorkspace.innerHTML = `
              <h4 style="color: #f59e0b; margin-top: 0;">Philippine BLEPT Mathematics Majorship Table of Specifications</h4>
              <ul style="list-style: none; padding: 0; margin: 0;">${comps}</ul>
            `;
          }
        } catch (err) {
          letWorkspace.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }
  }

  // --- Phase 8: Research Engine UI Handlers ---
  const researchToggleBtn = document.getElementById('research-toggle-btn');
  const researchModal = document.getElementById('research-modal');
  const closeResearchModal = document.getElementById('close-research-modal');
  const resTabEpistemic = document.getElementById('res-tab-epistemic');
  const resTabCitations = document.getElementById('res-tab-citations');
  const resTabQuestions = document.getElementById('res-tab-questions');
  const resTabCompare = document.getElementById('res-tab-compare');
  const resPanelEpistemic = document.getElementById('res-panel-epistemic');
  const resPanelCitations = document.getElementById('res-panel-citations');
  const resPanelQuestions = document.getElementById('res-panel-questions');
  const resPanelCompare = document.getElementById('res-panel-compare');

  if (researchToggleBtn && researchModal && closeResearchModal) {
    researchToggleBtn.addEventListener('click', async () => {
      researchModal.classList.remove('hidden');
      await loadResearchSourcesList();
    });

    closeResearchModal.addEventListener('click', () => {
      researchModal.classList.add('hidden');
    });

    researchModal.addEventListener('click', (e) => {
      if (e.target === researchModal) researchModal.classList.add('hidden');
    });

    function setResTab(active) {
      [resTabEpistemic, resTabCitations, resTabQuestions, resTabCompare].forEach((btn) => {
        btn.style.borderColor = 'rgba(255, 255, 255, 0.15)';
        btn.style.color = '#cbd5e1';
      });
      [resPanelEpistemic, resPanelCitations, resPanelQuestions, resPanelCompare].forEach((p) =>
        p.classList.add('hidden')
      );

      if (active === 'epistemic') {
        resTabEpistemic.style.borderColor = '#a855f7';
        resTabEpistemic.style.color = '#a855f7';
        resPanelEpistemic.classList.remove('hidden');
      } else if (active === 'citations') {
        resTabCitations.style.borderColor = '#a855f7';
        resTabCitations.style.color = '#a855f7';
        resPanelCitations.classList.remove('hidden');
      } else if (active === 'questions') {
        resTabQuestions.style.borderColor = '#a855f7';
        resTabQuestions.style.color = '#a855f7';
        resPanelQuestions.classList.remove('hidden');
      } else if (active === 'compare') {
        resTabCompare.style.borderColor = '#a855f7';
        resTabCompare.style.color = '#a855f7';
        resPanelCompare.classList.remove('hidden');
      }
    }

    resTabEpistemic.addEventListener('click', () => setResTab('epistemic'));
    resTabCitations.addEventListener('click', () => setResTab('citations'));
    resTabQuestions.addEventListener('click', () => setResTab('questions'));
    resTabCompare.addEventListener('click', () => setResTab('compare'));

    // 1. Epistemic Classifier
    const resClassifyBtn = document.getElementById('res-classify-btn');
    const resInputText = document.getElementById('res-input-text');
    const resEpistemicResults = document.getElementById('res-epistemic-results');

    if (resClassifyBtn) {
      resClassifyBtn.addEventListener('click', async () => {
        const text = resInputText.value.trim();
        if (!text) return;
        try {
          resEpistemicResults.classList.remove('hidden');
          resEpistemicResults.innerHTML = '<span style="color: #94a3b8;">Classifying epistemic statements...</span>';
          const res = await fetch('/api/jarvis/research/classify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
          });
          const data = await res.json();
          if (!data.success) {
            resEpistemicResults.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }

          const badgeColor = {
            FACT: '#10b981',
            CLAIM: '#3b82f6',
            OPINION: '#ec4899',
            INFERENCE: '#f59e0b',
            UNCERTAINTY: '#eab308',
          };

          const stmtsHtml = (data.data.statements || [])
            .map(
              (s) => `
              <div style="margin-bottom: 0.75rem; padding: 0.5rem 0.75rem; background: #1e293b; border-left: 4px solid ${badgeColor[s.category] || '#94a3b8'}; border-radius: 4px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                  <span style="background: ${badgeColor[s.category] || '#94a3b8'}; color: #000; font-size: 0.75rem; font-weight: bold; padding: 1px 6px; border-radius: 4px;">${s.category}</span>
                  <span style="font-size: 0.75rem; color: #94a3b8;">Confidence: ${(s.confidence * 100).toFixed(0)}%</span>
                </div>
                <div style="font-size: 0.9rem; color: #f8fafc;">"${s.text}"</div>
                <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 0.25rem;">${s.rationale}</div>
              </div>
            `
            )
            .join('');

          resEpistemicResults.innerHTML = `
            <div style="display: flex; gap: 1rem; margin-bottom: 1rem; font-size: 0.85rem; color: #cbd5e1;">
              <span>Total: <strong>${data.data.totalStatements}</strong></span>
              <span style="color: #10b981;">Facts: <strong>${data.data.counts.FACT}</strong></span>
              <span style="color: #3b82f6;">Claims: <strong>${data.data.counts.CLAIM}</strong></span>
              <span style="color: #ec4899;">Opinions: <strong>${data.data.counts.OPINION}</strong></span>
              <span style="color: #f59e0b;">Inferences: <strong>${data.data.counts.INFERENCE}</strong></span>
              <span style="color: #eab308;">Uncertainty: <strong>${data.data.counts.UNCERTAINTY}</strong></span>
            </div>
            ${stmtsHtml}
          `;
        } catch (err) {
          resEpistemicResults.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    // 2. Sources & Citations
    const resSourceSelect = document.getElementById('res-source-select');
    const resGetCitationsBtn = document.getElementById('res-get-citations-btn');
    const resCitationsDisplay = document.getElementById('res-citations-display');

    async function loadResearchSourcesList() {
      try {
        const res = await fetch('/api/jarvis/research/sources');
        const data = await res.json();
        if (data.success && resSourceSelect) {
          resSourceSelect.innerHTML = data.data
            .map((s) => `<option value="${s.id}">${s.title} (${s.publishedYear || 'n.d.'})</option>`)
            .join('');
        }
      } catch (err) {
        console.error('Failed to load sources list:', err);
      }
    }

    if (resGetCitationsBtn) {
      resGetCitationsBtn.addEventListener('click', async () => {
        const sourceId = resSourceSelect.value;
        if (!sourceId) return;
        try {
          resCitationsDisplay.innerHTML = '<span style="color: #94a3b8;">Formatting citations...</span>';
          const res = await fetch(`/api/jarvis/research/citations/${sourceId}`);
          const data = await res.json();
          if (!data.success) {
            resCitationsDisplay.innerHTML = `<span style="color: #ef4444;">Error generating citations.</span>`;
            return;
          }

          const citesHtml = data.data
            .map(
              (c) => `
              <div style="margin-bottom: 0.75rem; background: #1e293b; padding: 0.5rem 0.75rem; border-radius: 6px;">
                <div style="color: #a855f7; font-weight: bold; font-size: 0.8rem; margin-bottom: 0.25rem;">${c.format}</div>
                <div style="font-family: monospace; font-size: 0.85rem; color: #f8fafc; white-space: pre-wrap;">${c.citationString}</div>
              </div>
            `
            )
            .join('');

          resCitationsDisplay.innerHTML = `
            <h4 style="color: #a855f7; margin-top: 0;">Academic & Scientific Citations</h4>
            ${citesHtml}
          `;
        } catch (err) {
          resCitationsDisplay.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    // 3. Question Builder
    const resGenerateQBtn = document.getElementById('res-generate-q-btn');
    const resQTopic = document.getElementById('res-q-topic');
    const resQPop = document.getElementById('res-q-pop');
    const resQInt = document.getElementById('res-q-int');
    const resQOut = document.getElementById('res-q-out');
    const resQuestionResult = document.getElementById('res-question-result');

    if (resGenerateQBtn) {
      resGenerateQBtn.addEventListener('click', async () => {
        const topic = resQTopic.value.trim();
        const population = resQPop.value.trim();
        const intervention = resQInt.value.trim();
        const outcome = resQOut.value.trim();
        if (!topic) return;

        try {
          resQuestionResult.classList.remove('hidden');
          resQuestionResult.innerHTML = '<span style="color: #94a3b8;">Formulating research question...</span>';
          const res = await fetch('/api/jarvis/research/questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic, population, intervention, outcome, framework: 'PICO' }),
          });
          const data = await res.json();
          if (!data.success) {
            resQuestionResult.innerHTML = `<span style="color: #ef4444;">Error formulating question.</span>`;
            return;
          }
          const q = data.data;

          resQuestionResult.innerHTML = `
            <div style="margin-bottom: 0.5rem; font-size: 1rem; color: #a855f7; font-weight: bold;">Primary Inquiry:</div>
            <div style="font-size: 1.05rem; color: #f8fafc; margin-bottom: 0.75rem;">"${q.primaryQuestion}"</div>
            <div style="font-size: 0.85rem; color: #cbd5e1; margin-bottom: 0.5rem;"><strong>Hypotheses:</strong></div>
            <ul style="margin: 0; padding-left: 1.25rem; font-size: 0.85rem; color: #94a3b8;">
              <li>${q.hypotheses.nullHypothesis}</li>
              <li>${q.hypotheses.alternativeHypothesis}</li>
            </ul>
            <div style="margin-top: 0.75rem; font-size: 0.85rem; color: #10b981;">✓ ${q.finerAssessment.notes}</div>
          `;
        } catch (err) {
          resQuestionResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    // 4. Compare Sources
    const resRunCompareBtn = document.getElementById('res-run-compare-btn');
    const resCompareResult = document.getElementById('res-compare-result');

    if (resRunCompareBtn) {
      resRunCompareBtn.addEventListener('click', async () => {
        try {
          resCompareResult.innerHTML = '<span style="color: #94a3b8;">Running multi-source synthesis...</span>';
          const res = await fetch('/api/jarvis/research/compare', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sourceIds: ['src_prc_blept', 'src_tuklas_pedagogy'] }),
          });
          const data = await res.json();
          if (!data.success) {
            resCompareResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }
          const comp = data.data;
          resCompareResult.innerHTML = `
            <div style="margin-bottom: 0.5rem; font-size: 0.95rem; color: #a855f7; font-weight: bold;">Consensus Level: ${comp.consensusLevel.replace('_', ' ')}</div>
            <div style="font-size: 0.9rem; color: #f8fafc; margin-bottom: 0.75rem;">${comp.summary}</div>
            <div style="font-size: 0.85rem; color: #10b981; font-weight: bold; margin-bottom: 0.25rem;">Points of Agreement:</div>
            <ul style="margin: 0; padding-left: 1.25rem; font-size: 0.85rem; color: #cbd5e1; margin-bottom: 0.75rem;">
              ${comp.pointsOfAgreement.map((p) => `<li>${p}</li>`).join('')}
            </ul>
            <div style="font-size: 0.85rem; color: #f59e0b; font-weight: bold; margin-bottom: 0.25rem;">Points of Divergence / Focus:</div>
            <ul style="margin: 0; padding-left: 1.25rem; font-size: 0.85rem; color: #cbd5e1;">
              ${comp.pointsOfContradiction.length ? comp.pointsOfContradiction.map((p) => `<li>${p}</li>`).join('') : '<li>No overt methodological contradictions identified.</li>'}
            </ul>
          `;
        } catch (err) {
          resCompareResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }
  }

  // Start
  initSession();
});

