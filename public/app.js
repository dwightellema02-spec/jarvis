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

  // --- Phase 9: Data & Statistics UI Handlers ---
  const dataToggleBtn = document.getElementById('data-toggle-btn');
  const dataModal = document.getElementById('data-modal');
  const closeDataModal = document.getElementById('close-data-modal');

  if (dataToggleBtn && dataModal) {
    dataToggleBtn.addEventListener('click', () => {
      dataModal.classList.remove('hidden');
    });

    if (closeDataModal) {
      closeDataModal.addEventListener('click', () => {
        dataModal.classList.add('hidden');
      });
    }

    dataModal.addEventListener('click', (e) => {
      if (e.target === dataModal) {
        dataModal.classList.add('hidden');
      }
    });

    // Sample data loader
    const dataCsvInput = document.getElementById('data-csv-input');
    const loadSampleBtn = document.getElementById('data-load-sample-btn');
    if (loadSampleBtn && dataCsvInput) {
      loadSampleBtn.addEventListener('click', () => {
        dataCsvInput.value = `study_hours,practice_exams,let_score\n10,2,82\n15,3,86\n20,5,91\n25,6,95\n30,8,98`;
      });
    }

    // Tab Switching
    const dataTabs = dataModal.querySelectorAll('.sb-tab[data-datatab]');
    const dataPanels = {
      clean: document.getElementById('data-panel-clean'),
      stats: document.getElementById('data-panel-stats'),
      relation: document.getElementById('data-panel-relation'),
      ttest: document.getElementById('data-panel-ttest'),
      chart: document.getElementById('data-panel-chart'),
      pipeline: document.getElementById('data-panel-pipeline'),
    };

    dataTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        dataTabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.dataset.datatab;
        Object.keys(dataPanels).forEach((key) => {
          if (dataPanels[key]) {
            if (key === target) dataPanels[key].classList.remove('hidden');
            else dataPanels[key].classList.add('hidden');
          }
        });
      });
    });

    const getCsv = () => {
      return (dataCsvInput && dataCsvInput.value.trim()) || `study_hours,practice_exams,let_score\n10,2,82\n15,3,86\n20,5,91\n25,6,95\n30,8,98`;
    };

    // 1. Run Clean
    const runCleanBtn = document.getElementById('data-run-clean-btn');
    const cleanResult = document.getElementById('data-clean-result');
    if (runCleanBtn && cleanResult) {
      runCleanBtn.addEventListener('click', async () => {
        try {
          cleanResult.innerHTML = '<span style="color: #94a3b8;">Cleaning and profiling data...</span>';
          const res = await fetch('/api/jarvis/data/clean', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ csvContent: getCsv(), cleaningOptions: { deduplicate: true } }),
          });
          const data = await res.json();
          if (!data.success) {
            cleanResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }
          const d = data.data;
          const profRows = Object.values(d.columnProfiles)
            .map(
              (p) => `
            <tr>
              <td style="padding: 0.4rem; font-weight: bold; color: #818cf8;">${p.name}</td>
              <td style="padding: 0.4rem; color: #cbd5e1;">${p.type}</td>
              <td style="padding: 0.4rem; color: #cbd5e1;">${p.totalCount}</td>
              <td style="padding: 0.4rem; color: #cbd5e1;">${p.nullCount}</td>
              <td style="padding: 0.4rem; color: #cbd5e1;">${p.uniqueCount}</td>
            </tr>
          `
            )
            .join('');

          cleanResult.innerHTML = `
            <div style="margin-bottom: 0.5rem; color: #10b981; font-weight: bold;">Cleaning Complete: ${d.cleanedRowCount} records retained (Original: ${d.originalRowCount}, Dropped: ${d.droppedRows})</div>
            <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left;">
              <thead>
                <tr style="border-bottom: 1px solid #334155; color: #94a3b8;">
                  <th>Column</th><th>Type</th><th>Total</th><th>Nulls</th><th>Unique</th>
                </tr>
              </thead>
              <tbody>${profRows}</tbody>
            </table>
          `;
        } catch (err) {
          cleanResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    // 2. Run Descriptive Stats
    const runStatsBtn = document.getElementById('data-run-stats-btn');
    const statsCol = document.getElementById('data-stats-col');
    const statsResult = document.getElementById('data-stats-result');
    if (runStatsBtn && statsResult) {
      runStatsBtn.addEventListener('click', async () => {
        try {
          statsResult.innerHTML = '<span style="color: #94a3b8;">Computing descriptive statistics...</span>';
          const col = (statsCol && statsCol.value.trim()) || 'let_score';
          const res = await fetch('/api/jarvis/data/descriptive', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ csvContent: getCsv(), column: col }),
          });
          const data = await res.json();
          if (!data.success) {
            statsResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }
          const s = data.data;
          statsResult.innerHTML = `
            <div style="font-weight: bold; color: #818cf8; margin-bottom: 0.5rem;">Descriptive Statistics: ${s.column} (N = ${s.count})</div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; font-size: 0.85rem;">
              <div style="background: #1e293b; padding: 0.5rem; border-radius: 6px;">Mean: <strong>${s.mean}</strong></div>
              <div style="background: #1e293b; padding: 0.5rem; border-radius: 6px;">Median: <strong>${s.median}</strong></div>
              <div style="background: #1e293b; padding: 0.5rem; border-radius: 6px;">Modes: <strong>${s.modes.join(', ') || 'None'}</strong></div>
              <div style="background: #1e293b; padding: 0.5rem; border-radius: 6px;">Sample StdDev: <strong>${s.stdDevSample}</strong></div>
              <div style="background: #1e293b; padding: 0.5rem; border-radius: 6px;">Range: <strong>[${s.min}, ${s.max}] (${s.range})</strong></div>
              <div style="background: #1e293b; padding: 0.5rem; border-radius: 6px;">IQR: <strong>${s.iqr}</strong> (Q1: ${s.q1}, Q3: ${s.q3})</div>
              <div style="background: #1e293b; padding: 0.5rem; border-radius: 6px;">Skewness: <strong>${s.skewness}</strong></div>
              <div style="background: #1e293b; padding: 0.5rem; border-radius: 6px;">Kurtosis: <strong>${s.kurtosis}</strong></div>
              <div style="background: #1e293b; padding: 0.5rem; border-radius: 6px;">Sum: <strong>${s.sum}</strong></div>
            </div>
          `;
        } catch (err) {
          statsResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    // 3. Correlation & Regression
    const runRelationBtn = document.getElementById('data-run-relation-btn');
    const xColInput = document.getElementById('data-x-col');
    const yColInput = document.getElementById('data-y-col');
    const relationResult = document.getElementById('data-relation-result');
    if (runRelationBtn && relationResult) {
      runRelationBtn.addEventListener('click', async () => {
        try {
          relationResult.innerHTML = '<span style="color: #94a3b8;">Computing relational models...</span>';
          const xCol = (xColInput && xColInput.value.trim()) || 'study_hours';
          const yCol = (yColInput && yColInput.value.trim()) || 'let_score';
          const [cRes, rRes] = await Promise.all([
            fetch('/api/jarvis/data/correlation', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ csvContent: getCsv(), xColumn: xCol, yColumn: yCol }),
            }),
            fetch('/api/jarvis/data/regression', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ csvContent: getCsv(), xColumn: xCol, yColumn: yCol }),
            }),
          ]);
          const cData = await cRes.json();
          const rData = await rRes.json();
          if (!cData.success || !rData.success) {
            relationResult.innerHTML = `<span style="color: #ef4444;">Error: ${cData.error || rData.error}</span>`;
            return;
          }
          const c = cData.data;
          const r = rData.data;
          relationResult.innerHTML = `
            <div style="margin-bottom: 0.5rem;">
              <span style="font-weight: bold; color: #818cf8;">Correlation:</span>
              <span>Pearson r = <strong>${c.pearsonR}</strong> (R² = ${c.pearsonR2}, Spearman ρ = ${c.spearmanRho})</span>
              <div style="font-size: 0.85rem; color: #10b981; margin-top: 0.25rem;">${c.interpretation}</div>
            </div>
            <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #334155;">
              <span style="font-weight: bold; color: #818cf8;">Fitted Linear Regression:</span>
              <code style="display: block; margin: 0.25rem 0; background: #1e293b; padding: 0.4rem; border-radius: 4px; color: #38bdf8;">${r.equation}</code>
              <div style="font-size: 0.85rem; color: #cbd5e1;">R² = <strong>${r.r2}</strong> | Std Error = <strong>${r.standardError}</strong></div>
            </div>
          `;
        } catch (err) {
          relationResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    // 4. Hypothesis Testing
    const runTtestBtn = document.getElementById('data-run-ttest-btn');
    const ttestCol = document.getElementById('data-ttest-col');
    const ttestMean = document.getElementById('data-ttest-mean');
    const ttestResult = document.getElementById('data-ttest-result');
    if (runTtestBtn && ttestResult) {
      runTtestBtn.addEventListener('click', async () => {
        try {
          ttestResult.innerHTML = '<span style="color: #94a3b8;">Evaluating hypothesis test...</span>';
          const col = (ttestCol && ttestCol.value.trim()) || 'let_score';
          const mu0 = parseFloat((ttestMean && ttestMean.value) || '75.0');
          const res = await fetch('/api/jarvis/data/t-test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ csvContent: getCsv(), type: 'one_sample', column1: col, hypothesizedMean: mu0 }),
          });
          const data = await res.json();
          if (!data.success) {
            ttestResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }
          const t = data.data;
          ttestResult.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span style="font-weight: bold; color: #818cf8;">One-Sample Student's t-Test (vs &mu;₀ = ${mu0})</span>
              <span class="badge" style="background: ${t.isSignificant ? '#065f46' : '#7f1d1d'}; color: #fff;">
                ${t.isSignificant ? 'Statistically Significant (p < 0.05)' : 'Not Significant'}
              </span>
            </div>
            <div style="font-size: 0.85rem; color: #cbd5e1; margin-bottom: 0.5rem;">
              t-Statistic: <strong>${t.testStatistic}</strong> | df: <strong>${t.degreesOfFreedom}</strong> | Estimated p-Value: <strong>${t.pValueEstimated}</strong>
            </div>
            <div style="font-size: 0.85rem; color: #f8fafc; background: #1e293b; padding: 0.5rem; border-radius: 6px;">
              ${t.conclusion}
            </div>
          `;
        } catch (err) {
          ttestResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    // 5. Chart Visualizer
    const runChartBtn = document.getElementById('data-run-chart-btn');
    const chartTypeSelect = document.getElementById('data-chart-type');
    const chartResult = document.getElementById('data-chart-result');
    if (runChartBtn && chartResult) {
      runChartBtn.addEventListener('click', async () => {
        try {
          chartResult.innerHTML = '<span style="color: #94a3b8;">Generating visual chart...</span>';
          const type = (chartTypeSelect && chartTypeSelect.value) || 'bar';
          const res = await fetch('/api/jarvis/data/visualize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              csvContent: getCsv(),
              chartConfig: { type, title: `LET Performance (${type.toUpperCase()})` },
            }),
          });
          const data = await res.json();
          if (!data.success) {
            chartResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }
          chartResult.innerHTML = `
            <div style="overflow-x: auto; margin-bottom: 0.75rem;">${data.data.svg}</div>
            <details style="text-align: left; font-size: 0.8rem; color: #94a3b8;">
              <summary style="cursor: pointer;">View Terminal ASCII Fallback</summary>
              <pre style="background: #1e293b; padding: 0.5rem; border-radius: 4px; overflow-x: auto;">${data.data.ascii}</pre>
            </details>
          `;
        } catch (err) {
          chartResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    // 6. Pipeline & Ingest
    const runPipelineBtn = document.getElementById('data-run-pipeline-btn');
    const ingestBrainBtn = document.getElementById('data-ingest-brain-btn');
    const pipelineResult = document.getElementById('data-pipeline-result');
    let lastPipelineData = null;

    if (runPipelineBtn && pipelineResult) {
      runPipelineBtn.addEventListener('click', async () => {
        try {
          pipelineResult.innerHTML = '<span style="color: #94a3b8;">Running complete data pipeline...</span>';
          const res = await fetch('/api/jarvis/data/pipeline', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              csvContent: getCsv(),
              cleaningOptions: { deduplicate: true },
            }),
          });
          const data = await res.json();
          if (!data.success) {
            pipelineResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }
          lastPipelineData = data.data;
          pipelineResult.innerHTML = `
            <div style="color: #10b981; font-weight: bold; margin-bottom: 0.5rem;">Pipeline Executed Successfully!</div>
            <pre style="background: #1e293b; padding: 0.75rem; border-radius: 6px; font-size: 0.85rem; color: #f8fafc; white-space: pre-wrap;">${data.data.narrativeReport}</pre>
          `;
        } catch (err) {
          pipelineResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    if (ingestBrainBtn && pipelineResult) {
      ingestBrainBtn.addEventListener('click', async () => {
        try {
          if (!lastPipelineData) {
            alert('Please run the pipeline first before ingesting to Second Brain.');
            return;
          }
          const res = await fetch('/api/jarvis/data/to-knowledge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({
              title: 'Empirical Study Analytics Note',
              pipelineResult: lastPipelineData,
            }),
          });
          const data = await res.json();
          if (data.success) {
            alert(`Ingested to Second Brain! Node ID: ${data.data.nodeId}`);
          } else {
            alert(`Failed to ingest: ${data.error}`);
          }
        } catch (err) {
          alert(`Error: ${err.message}`);
        }
      });
    }
  }

  // Phase 10: Coding Agent & AST Engine Modal
  const codingToggleBtn = document.getElementById('coding-toggle-btn');
  const codingModal = document.getElementById('coding-modal');
  const closeCodingModalBtn = document.getElementById('close-coding-modal');

  if (codingToggleBtn && codingModal && closeCodingModalBtn) {
    codingToggleBtn.addEventListener('click', () => {
      codingModal.classList.remove('hidden');
    });
    closeCodingModalBtn.addEventListener('click', () => {
      codingModal.classList.add('hidden');
    });
    codingModal.addEventListener('click', (e) => {
      if (e.target === codingModal) codingModal.classList.add('hidden');
    });

    // Subtabs switching
    const codeTabs = codingModal.querySelectorAll('.sb-tab[data-codetab]');
    const codePanels = {
      inspect: document.getElementById('code-panel-inspect'),
      search: document.getElementById('code-panel-search'),
      analyze: document.getElementById('code-panel-analyze'),
      review: document.getElementById('code-panel-review'),
      patch: document.getElementById('code-panel-patch'),
      debug: document.getElementById('code-panel-debug'),
    };

    codeTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const tabKey = tab.getAttribute('data-codetab');
        codeTabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        Object.keys(codePanels).forEach((k) => {
          if (codePanels[k]) {
            if (k === tabKey) {
              codePanels[k].classList.remove('hidden');
            } else {
              codePanels[k].classList.add('hidden');
            }
          }
        });
      });
    });

    // 1. Inspect Repo
    const runInspectBtn = document.getElementById('code-run-inspect-btn');
    const inspectResult = document.getElementById('code-inspect-result');
    if (runInspectBtn && inspectResult) {
      runInspectBtn.addEventListener('click', async () => {
        try {
          inspectResult.innerHTML = '<span style="color: #06b6d4;">Scanning repository tree...</span>';
          const res = await fetch('/api/jarvis/code/inspect');
          const data = await res.json();
          if (!data.success) {
            inspectResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }
          const t = data.data;
          const langBars = Object.entries(t.languages || {})
            .map(([lang, info]) => `<span style="display: inline-block; margin-right: 0.75rem; font-size: 0.85rem;"><strong>${lang}:</strong> ${info.percentage}% (${info.fileCount} files)</span>`)
            .join('');

          inspectResult.innerHTML = `
            <div style="font-weight: bold; color: #06b6d4; margin-bottom: 0.5rem;">Repository Overview (${t.totalFiles} files, ${t.totalDirectories} directories)</div>
            <div style="margin-bottom: 0.75rem; background: #1e293b; padding: 0.5rem; border-radius: 6px;">${langBars}</div>
            <div style="font-size: 0.85rem; color: #cbd5e1; margin-bottom: 0.5rem;">Entry Points: <code>${t.entryPoints.join(', ') || 'none'}</code></div>
            <details>
              <summary style="cursor: pointer; color: #94a3b8; font-size: 0.85rem;">View File Tree (${t.tree && t.tree.children ? t.tree.children.length : 0} top-level nodes)</summary>
              <pre style="background: #1e293b; padding: 0.5rem; border-radius: 4px; font-size: 0.8rem; overflow-x: auto; max-height: 250px;">${JSON.stringify(t.tree, null, 2)}</pre>
            </details>
          `;
        } catch (err) {
          inspectResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    // 2. Search Code
    const runSearchBtn = document.getElementById('code-run-search-btn');
    const searchQueryInput = document.getElementById('code-search-query');
    const searchResult = document.getElementById('code-search-result');
    if (runSearchBtn && searchResult) {
      runSearchBtn.addEventListener('click', async () => {
        try {
          const pattern = searchQueryInput.value.trim();
          if (!pattern) return;
          searchResult.innerHTML = '<span style="color: #06b6d4;">Searching codebase...</span>';
          const res = await fetch('/api/jarvis/code/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: pattern }),
          });
          const data = await res.json();
          if (!data.success) {
            searchResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }
          const matches = data.data.matches || [];
          if (matches.length === 0) {
            searchResult.innerHTML = `<span style="color: #94a3b8;">No matches found for "${pattern}".</span>`;
            return;
          }
          const matchesHtml = matches.map((m) => `
            <div style="margin-bottom: 0.5rem; background: #1e293b; padding: 0.5rem; border-radius: 4px; font-size: 0.85rem;">
              <div style="color: #06b6d4; font-weight: bold;">${m.filePath}:${m.lineNumber}</div>
              <pre style="margin: 0.25rem 0 0 0; color: #f8fafc; font-family: monospace;">${m.lineContent.trim()}</pre>
            </div>
          `).join('');
          searchResult.innerHTML = `
            <div style="font-weight: bold; color: #10b981; margin-bottom: 0.5rem;">Found ${data.data.matchCount} matches across ${data.data.filesSearched} files:</div>
            ${matchesHtml}
          `;
        } catch (err) {
          searchResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    // 3. AST Analyze
    const runAnalyzeBtn = document.getElementById('code-run-analyze-btn');
    const analyzePathInput = document.getElementById('code-analyze-path');
    const analyzeResult = document.getElementById('code-analyze-result');
    if (runAnalyzeBtn && analyzeResult) {
      runAnalyzeBtn.addEventListener('click', async () => {
        try {
          const relativePath = analyzePathInput.value.trim();
          analyzeResult.innerHTML = '<span style="color: #06b6d4;">Analyzing AST and metrics...</span>';
          const res = await fetch('/api/jarvis/code/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filePath: relativePath }),
          });
          const data = await res.json();
          if (!data.success) {
            analyzeResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }
          const ast = data.data;
          const symbolNames = (ast.symbols || []).map((s) => s.name);
          analyzeResult.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span style="font-weight: bold; color: #06b6d4;">${ast.filePath}</span>
              <span class="badge" style="background: #0e7490; color: #fff;">Maintainability: ${ast.maintainabilityScore}/100</span>
            </div>
            <div style="font-size: 0.85rem; color: #cbd5e1; margin-bottom: 0.5rem;">
              Lines of Code: <strong>${ast.lineCount}</strong> | Cyclomatic Complexity: <strong>${ast.estimatedComplexity}</strong>
            </div>
            <div style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 0.5rem;">
              Symbols (${symbolNames.length}): <code>${symbolNames.slice(0, 10).join(', ')}${symbolNames.length > 10 ? '...' : ''}</code>
            </div>
          `;
        } catch (err) {
          analyzeResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    // 4. Code & Security Review
    const runReviewBtn = document.getElementById('code-run-review-btn');
    const reviewPathInput = document.getElementById('code-review-path');
    const reviewResult = document.getElementById('code-review-result');
    if (runReviewBtn && reviewResult) {
      runReviewBtn.addEventListener('click', async () => {
        try {
          const relativePath = reviewPathInput.value.trim();
          reviewResult.innerHTML = '<span style="color: #06b6d4;">Auditing code & security vulnerabilities...</span>';
          const res = await fetch('/api/jarvis/code/review', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filePath: relativePath }),
          });
          const data = await res.json();
          if (!data.success) {
            reviewResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }
          const rev = data.data;
          const rulesHtml = (rev.rulesEvaluated || []).map((r) => `
            <div style="margin-bottom: 0.5rem; background: #1e293b; padding: 0.5rem; border-radius: 4px; border-left: 3px solid ${r.passed ? '#10b981' : '#ef4444'};">
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                <strong>${r.title}</strong>
                <span class="badge" style="background: ${r.passed ? '#065f46' : '#7f1d1d'}; color: #fff;">${r.passed ? 'PASSED' : r.severity.toUpperCase()}</span>
              </div>
              ${r.findings.length > 0 ? `<div style="font-size: 0.8rem; color: #ef4444; margin-top: 0.25rem;">${r.findings.join('; ')}</div>` : ''}
            </div>
          `).join('');

          reviewResult.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span style="font-weight: bold; color: #06b6d4;">Review: ${rev.filePath}</span>
              <span class="badge" style="background: ${rev.securityChecksPassed ? '#065f46' : '#7f1d1d'}; color: #fff;">
                Score: ${rev.overallScore}/100
              </span>
            </div>
            <div style="margin-bottom: 0.5rem;">${rulesHtml}</div>
            <div style="font-size: 0.85rem; color: #94a3b8; background: #0b1329; padding: 0.5rem; border-radius: 4px;">
              ${rev.summary}
            </div>
          `;
        } catch (err) {
          reviewResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    // 5. Propose & Apply Patch
    const proposeBtn = document.getElementById('code-propose-btn');
    const applyBtn = document.getElementById('code-apply-btn');
    const patchFileInput = document.getElementById('code-patch-file');
    const patchContentInput = document.getElementById('code-patch-content');
    const patchResult = document.getElementById('code-patch-result');
    let lastProposal = null;

    if (proposeBtn && patchResult) {
      proposeBtn.addEventListener('click', async () => {
        try {
          const relativePath = patchFileInput.value.trim();
          const replacementContent = patchContentInput.value;
          if (!relativePath) {
            alert('Please specify a relative file path');
            return;
          }
          patchResult.innerHTML = '<span style="color: #06b6d4;">Generating diff proposal...</span>';
          const res = await fetch('/api/jarvis/code/propose', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filePath: relativePath,
              targetContent: '',
              replacementContent,
              reason: 'UI Patch Proposal',
            }),
          });
          const data = await res.json();
          if (!data.success) {
            patchResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }
          lastProposal = data.data;
          patchResult.innerHTML = `
            <div style="color: #10b981; font-weight: bold; margin-bottom: 0.5rem;">Diff Proposed: +${lastProposal.linesAdded} / -${lastProposal.linesRemoved} lines (Risk: ${lastProposal.riskLevel})</div>
            <pre style="background: #1e293b; padding: 0.5rem; border-radius: 4px; font-size: 0.8rem; overflow-x: auto; color: #f8fafc; max-height: 200px;">${lastProposal.diffPreview || 'No changes.'}</pre>
          `;
        } catch (err) {
          patchResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    if (applyBtn && patchResult) {
      applyBtn.addEventListener('click', async () => {
        try {
          if (!lastProposal) {
            alert('Please propose a patch first.');
            return;
          }
          patchResult.innerHTML = '<span style="color: #06b6d4;">Applying patch atomically with disk backup...</span>';
          const res = await fetch('/api/jarvis/code/apply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({ proposal: lastProposal, confirmed: true }),
          });
          const data = await res.json();
          if (!data.success) {
            patchResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }
          const mod = data.data;
          patchResult.innerHTML = `
            <div style="color: #10b981; font-weight: bold; margin-bottom: 0.5rem;">Patch Applied Successfully!</div>
            <div style="font-size: 0.85rem; color: #cbd5e1;">
              File: <strong>${mod.filePath}</strong><br/>
              Backup Created: <code>${mod.backupPath || 'None'}</code><br/>
              Verified on disk: <strong>${mod.verified ? 'YES' : 'NO'}</strong>
            </div>
          `;
        } catch (err) {
          patchResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    // 6. Error Debugger
    const runDebugBtn = document.getElementById('code-run-debug-btn');
    const debugTraceInput = document.getElementById('code-debug-trace');
    const debugResult = document.getElementById('code-debug-result');
    if (runDebugBtn && debugResult) {
      runDebugBtn.addEventListener('click', async () => {
        try {
          const rawTrace = debugTraceInput.value.trim();
          if (!rawTrace) return;
          debugResult.innerHTML = '<span style="color: #06b6d4;">Diagnosing error stack trace...</span>';
          const res = await fetch('/api/jarvis/code/debug', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rawError: rawTrace }),
          });
          const data = await res.json();
          if (!data.success) {
            debugResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }
          const diag = data.data;
          debugResult.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span style="font-weight: bold; color: #ef4444;">${diag.errorType}: ${diag.errorMessage}</span>
            </div>
            <div style="background: #1e293b; padding: 0.5rem; border-radius: 6px; font-size: 0.85rem; color: #f8fafc; margin-bottom: 0.5rem;">
              <strong>Root Cause:</strong> ${diag.rootCauseAnalysis}
            </div>
            <div style="color: #10b981; font-size: 0.85rem;">
              <strong>Suggested Fix:</strong> ${(diag.suggestedFixes || []).join('; ')}
            </div>
          `;
        } catch (err) {
          debugResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }
  }

  // Phase 11: Development Environment Modal
  const devToggleBtn = document.getElementById('devenv-toggle-btn');
  const devModal = document.getElementById('devenv-modal');
  const closeDevModalBtn = document.getElementById('close-devenv-modal');

  if (devToggleBtn && devModal && closeDevModalBtn) {
    devToggleBtn.addEventListener('click', () => {
      devModal.classList.remove('hidden');
    });
    closeDevModalBtn.addEventListener('click', () => {
      devModal.classList.add('hidden');
    });
    devModal.addEventListener('click', (e) => {
      if (e.target === devModal) devModal.classList.add('hidden');
    });

    // Subtab switching
    const devTabs = devModal.querySelectorAll('.sb-tab[data-devtab]');
    const devPanels = {
      terminal: document.getElementById('dev-panel-terminal'),
      gitstatus: document.getElementById('dev-panel-gitstatus'),
      gitdiff: document.getElementById('dev-panel-gitdiff'),
      deps: document.getElementById('dev-panel-deps'),
      audit: document.getElementById('dev-panel-audit'),
      build: document.getElementById('dev-panel-build'),
    };

    devTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const tabKey = tab.getAttribute('data-devtab');
        devTabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        Object.keys(devPanels).forEach((k) => {
          if (devPanels[k]) {
            if (k === tabKey) {
              devPanels[k].classList.remove('hidden');
            } else {
              devPanels[k].classList.add('hidden');
            }
          }
        });
      });
    });

    // 1. Terminal & Risk
    const devCmdInput = document.getElementById('dev-cmd-input');
    const devCmdAnalyzeBtn = document.getElementById('dev-cmd-analyze-btn');
    const devCmdExecBtn = document.getElementById('dev-cmd-exec-btn');
    const devCmdConfirmCheck = document.getElementById('dev-cmd-confirm-check');
    const devTerminalResult = document.getElementById('dev-terminal-result');

    if (devCmdAnalyzeBtn && devTerminalResult) {
      devCmdAnalyzeBtn.addEventListener('click', async () => {
        try {
          const command = (devCmdInput && devCmdInput.value.trim()) || '';
          if (!command) return;
          devTerminalResult.innerHTML = '<span style="color: #ea580c;">Analyzing command safety...</span>';
          const res = await fetch('/api/jarvis/devenv/terminal/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command }),
          });
          const data = await res.json();
          if (!data.success) {
            devTerminalResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }
          const an = data.data;
          devTerminalResult.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span style="font-weight: bold; color: #ea580c;">Command: <code>${an.command}</code></span>
              <span class="badge" style="background: ${an.risk === 'CRITICAL' ? '#7f1d1d' : an.risk === 'HIGH' ? '#f59e0b' : '#065f46'}; color: #fff;">
                Risk: ${an.risk}
              </span>
            </div>
            <div style="font-size: 0.85rem; color: #cbd5e1;">
              Allowed by Guardian: <strong>${an.isAllowed ? 'YES' : 'NO'}</strong> | Requires Confirmation: <strong>${an.requiresConfirmation ? 'YES' : 'NO'}</strong>
              ${an.blockedReason ? `<div style="color: #ef4444; margin-top: 0.25rem;">Blocked Reason: ${an.blockedReason}</div>` : ''}
            </div>
          `;
        } catch (err) {
          devTerminalResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    if (devCmdExecBtn && devTerminalResult) {
      devCmdExecBtn.addEventListener('click', async () => {
        try {
          const command = (devCmdInput && devCmdInput.value.trim()) || '';
          if (!command) return;
          const confirmed = devCmdConfirmCheck && devCmdConfirmCheck.checked;
          devTerminalResult.innerHTML = '<span style="color: #ea580c;">Executing command...</span>';
          const res = await fetch('/api/jarvis/devenv/terminal/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({ command, confirmed }),
          });
          const data = await res.json();
          const r = data.data || {};
          devTerminalResult.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span style="font-weight: bold; color: ${r.exitCode === 0 && !r.blocked ? '#10b981' : '#ef4444'};">
                ${r.blocked ? 'BLOCKED' : r.exitCode === 0 ? 'SUCCESS (Exit Code 0)' : `FAILED (Exit Code ${r.exitCode})`}
              </span>
              <span style="font-size: 0.8rem; color: #94a3b8;">${r.durationMs || 0}ms</span>
            </div>
            ${r.blockedReason ? `<div style="color: #ef4444; font-size: 0.85rem; margin-bottom: 0.5rem;">${r.blockedReason}</div>` : ''}
            <pre style="background: #1e293b; padding: 0.5rem; border-radius: 4px; font-size: 0.8rem; overflow-x: auto; color: #f8fafc; max-height: 250px;">${(r.stdout || '') + (r.stderr || '') || 'No output.'}</pre>
          `;
        } catch (err) {
          devTerminalResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    // 2. Git Status & Log
    const devGitStatusBtn = document.getElementById('dev-git-status-btn');
    const devGitLogBtn = document.getElementById('dev-git-log-btn');
    const devGitBranchesBtn = document.getElementById('dev-git-branches-btn');
    const devGitStatusResult = document.getElementById('dev-gitstatus-result');

    if (devGitStatusBtn && devGitStatusResult) {
      devGitStatusBtn.addEventListener('click', async () => {
        try {
          devGitStatusResult.innerHTML = '<span style="color: #ea580c;">Querying git status...</span>';
          const res = await fetch('/api/jarvis/devenv/git/status', {
            headers: { 'x-user-id': 'dwight' },
          });
          const data = await res.json();
          if (!data.success) {
            devGitStatusResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }
          const s = data.data;
          const filesHtml = (s.files || []).map((f) => `
            <div style="font-size: 0.85rem; padding: 0.25rem 0; border-bottom: 1px solid #1e293b;">
              <span class="badge" style="background: ${f.staged ? '#065f46' : '#334155'}; font-size: 0.75rem;">${f.staged ? 'STAGED' : 'UNSTAGED'}</span>
              <span style="color: #f8fafc; font-family: monospace; margin-left: 0.5rem;">${f.path}</span>
              <span style="color: #94a3b8; font-size: 0.8rem;">(${f.status})</span>
            </div>
          `).join('') || '<div style="color: #10b981;">Working tree clean, no modified files.</div>';

          devGitStatusResult.innerHTML = `
            <div style="font-weight: bold; color: #ea580c; margin-bottom: 0.5rem;">Branch: <code>${s.currentBranch}</code> ${s.isClean ? '(Clean)' : '(Modified)'}</div>
            <div style="font-size: 0.85rem; color: #cbd5e1; margin-bottom: 0.5rem;">
              Staged: <strong>${s.summary.stagedCount}</strong> | Unstaged: <strong>${s.summary.unstagedCount}</strong> | Untracked: <strong>${s.summary.untrackedCount}</strong>
            </div>
            <div>${filesHtml}</div>
          `;
        } catch (err) {
          devGitStatusResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    if (devGitLogBtn && devGitStatusResult) {
      devGitLogBtn.addEventListener('click', async () => {
        try {
          devGitStatusResult.innerHTML = '<span style="color: #ea580c;">Fetching commit log...</span>';
          const res = await fetch('/api/jarvis/devenv/git/log?limit=8', {
            headers: { 'x-user-id': 'dwight' },
          });
          const data = await res.json();
          if (!data.success) {
            devGitStatusResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }
          const entries = data.data.entries || [];
          const logHtml = entries.map((e) => `
            <div style="margin-bottom: 0.5rem; background: #1e293b; padding: 0.5rem; border-radius: 4px; font-size: 0.85rem;">
              <div style="display: flex; justify-content: space-between;">
                <code style="color: #ea580c;">${e.shortHash}</code>
                <span style="color: #94a3b8; font-size: 0.8rem;">${e.date}</span>
              </div>
              <div style="font-weight: bold; color: #f8fafc; margin: 0.25rem 0;">${e.message}</div>
              <div style="font-size: 0.8rem; color: #94a3b8;">Author: ${e.author}</div>
            </div>
          `).join('') || '<div>No commit log available.</div>';

          devGitStatusResult.innerHTML = `
            <div style="font-weight: bold; color: #ea580c; margin-bottom: 0.5rem;">Recent Git Commits (${entries.length})</div>
            ${logHtml}
          `;
        } catch (err) {
          devGitStatusResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    if (devGitBranchesBtn && devGitStatusResult) {
      devGitBranchesBtn.addEventListener('click', async () => {
        try {
          devGitStatusResult.innerHTML = '<span style="color: #ea580c;">Listing branches...</span>';
          const res = await fetch('/api/jarvis/devenv/git/branches', {
            headers: { 'x-user-id': 'dwight' },
          });
          const data = await res.json();
          if (!data.success) {
            devGitStatusResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }
          const branches = data.data.branches || [];
          const branchHtml = branches.map((b) => `
            <div style="padding: 0.4rem; background: #1e293b; margin-bottom: 0.4rem; border-radius: 4px; font-size: 0.85rem; display: flex; justify-content: space-between;">
              <span>${b.isCurrent ? '<strong style="color: #10b981;">* ' : ''}${b.name}${b.isCurrent ? '</strong>' : ''}</span>
              <code style="color: #94a3b8;">${b.commitHash}</code>
            </div>
          `).join('');
          devGitStatusResult.innerHTML = `
            <div style="font-weight: bold; color: #ea580c; margin-bottom: 0.5rem;">Git Branches (${branches.length})</div>
            ${branchHtml}
          `;
        } catch (err) {
          devGitStatusResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    // 3. Git Diff & Commit
    const devGitDiffBtn = document.getElementById('dev-git-diff-btn');
    const devGitStagedDiffBtn = document.getElementById('dev-git-stageddiff-btn');
    const devGitCommitBtn = document.getElementById('dev-git-commit-btn');
    const devCommitMsg = document.getElementById('dev-commit-msg');
    const devGitDiffResult = document.getElementById('dev-gitdiff-result');

    if (devGitDiffBtn && devGitDiffResult) {
      devGitDiffBtn.addEventListener('click', async () => {
        try {
          devGitDiffResult.innerHTML = '<span style="color: #ea580c;">Fetching diff...</span>';
          const res = await fetch('/api/jarvis/devenv/git/diff', {
            headers: { 'x-user-id': 'dwight' },
          });
          const data = await res.json();
          const diff = (data.data && data.data.diff) || 'No differences.';
          devGitDiffResult.innerHTML = `
            <div style="font-weight: bold; color: #ea580c; margin-bottom: 0.5rem;">Working Tree Diff</div>
            <pre style="background: #1e293b; padding: 0.5rem; border-radius: 4px; font-size: 0.8rem; overflow-x: auto; color: #f8fafc; max-height: 300px;">${diff}</pre>
          `;
        } catch (err) {
          devGitDiffResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    if (devGitStagedDiffBtn && devGitDiffResult) {
      devGitStagedDiffBtn.addEventListener('click', async () => {
        try {
          devGitDiffResult.innerHTML = '<span style="color: #ea580c;">Fetching staged diff...</span>';
          const res = await fetch('/api/jarvis/devenv/git/diff?staged=true', {
            headers: { 'x-user-id': 'dwight' },
          });
          const data = await res.json();
          const diff = (data.data && data.data.diff) || 'No staged differences.';
          devGitDiffResult.innerHTML = `
            <div style="font-weight: bold; color: #ea580c; margin-bottom: 0.5rem;">Staged Diff</div>
            <pre style="background: #1e293b; padding: 0.5rem; border-radius: 4px; font-size: 0.8rem; overflow-x: auto; color: #f8fafc; max-height: 300px;">${diff}</pre>
          `;
        } catch (err) {
          devGitDiffResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    if (devGitCommitBtn && devGitDiffResult) {
      devGitCommitBtn.addEventListener('click', async () => {
        try {
          const message = (devCommitMsg && devCommitMsg.value.trim()) || '';
          if (!message) {
            alert('Please specify a commit message.');
            return;
          }
          devGitDiffResult.innerHTML = '<span style="color: #ea580c;">Creating commit...</span>';
          const res = await fetch('/api/jarvis/devenv/git/commit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({ message, confirmed: true }),
          });
          const data = await res.json();
          if (!data.success) {
            devGitDiffResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error || (data.data && data.data.output)}</span>`;
            return;
          }
          devGitDiffResult.innerHTML = `
            <div style="color: #10b981; font-weight: bold; margin-bottom: 0.5rem;">Committed successfully!</div>
            <pre style="background: #1e293b; padding: 0.5rem; border-radius: 4px; font-size: 0.8rem; overflow-x: auto; color: #f8fafc;">${data.data.output}</pre>
          `;
        } catch (err) {
          devGitDiffResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    // 4. Dependencies & Scripts
    const devLoadDepsBtn = document.getElementById('dev-load-deps-btn');
    const devDepsResult = document.getElementById('dev-deps-result');

    if (devLoadDepsBtn && devDepsResult) {
      devLoadDepsBtn.addEventListener('click', async () => {
        try {
          devDepsResult.innerHTML = '<span style="color: #ea580c;">Reading package.json...</span>';
          const res = await fetch('/api/jarvis/devenv/dependencies', {
            headers: { 'x-user-id': 'dwight' },
          });
          const data = await res.json();
          if (!data.success) {
            devDepsResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }
          const p = data.data;
          const scriptsHtml = Object.entries(p.scripts || {}).map(([k, v]) => `
            <div style="font-size: 0.8rem; margin-bottom: 0.25rem;">
              <code style="color: #ea580c;">${k}</code>: <span style="color: #cbd5e1;">${v}</span>
            </div>
          `).join('');

          const depsHtml = Object.entries(p.dependencies || {}).map(([k, v]) => `
            <span style="display: inline-block; background: #1e293b; padding: 2px 6px; border-radius: 4px; margin: 2px; font-size: 0.8rem;">
              <code>${k}</code>@${v}
            </span>
          `).join('') || '<span style="color: #94a3b8;">None</span>';

          devDepsResult.innerHTML = `
            <div style="font-weight: bold; color: #ea580c; margin-bottom: 0.5rem;">${p.name} v${p.version}</div>
            <div style="margin-bottom: 0.75rem;">
              <h5 style="color: #f8fafc; margin: 0 0 0.5rem 0;">Scripts (${Object.keys(p.scripts || {}).length})</h5>
              <div style="background: #1e293b; padding: 0.5rem; border-radius: 4px;">${scriptsHtml}</div>
            </div>
            <div>
              <h5 style="color: #f8fafc; margin: 0 0 0.5rem 0;">Dependencies (${p.totalDependencies})</h5>
              <div>${depsHtml}</div>
            </div>
          `;
        } catch (err) {
          devDepsResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    // 5. Security Audit
    const devRunAuditBtn = document.getElementById('dev-run-audit-btn');
    const devAuditResult = document.getElementById('dev-audit-result');

    if (devRunAuditBtn && devAuditResult) {
      devRunAuditBtn.addEventListener('click', async () => {
        try {
          devAuditResult.innerHTML = '<span style="color: #ea580c;">Running npm audit (this may take a few seconds)...</span>';
          const res = await fetch('/api/jarvis/devenv/dependencies/audit', {
            headers: { 'x-user-id': 'dwight' },
          });
          const data = await res.json();
          if (!data.success) {
            devAuditResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }
          const a = data.data;
          const sev = a.severityCounts || {};
          devAuditResult.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span style="font-weight: bold; color: #ea580c;">Audit Result</span>
              <span class="badge" style="background: ${a.vulnerabilitiesFound > 0 ? '#f59e0b' : '#065f46'}; color: #fff;">
                ${a.vulnerabilitiesFound} Vulnerabilities
              </span>
            </div>
            <div style="font-size: 0.85rem; color: #cbd5e1; margin-bottom: 0.5rem;">
              Critical: <strong>${sev.critical || 0}</strong> | High: <strong>${sev.high || 0}</strong> | Moderate: <strong>${sev.moderate || 0}</strong> | Low: <strong>${sev.low || 0}</strong>
            </div>
            <div style="background: #1e293b; padding: 0.5rem; border-radius: 4px; font-size: 0.85rem; color: #f8fafc;">
              ${a.advisorySummary}
            </div>
          `;
        } catch (err) {
          devAuditResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    // 6. Build & Test Runner
    const devRunBuildBtn = document.getElementById('dev-run-build-btn');
    const devRunTcBtn = document.getElementById('dev-run-tc-btn');
    const devRunTestsBtn = document.getElementById('dev-run-tests-btn');
    const devBuildResult = document.getElementById('dev-build-result');

    const triggerRunner = async (endpoint, name) => {
      try {
        devBuildResult.innerHTML = `<span style="color: #ea580c;">Running ${name}...</span>`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        });
        const data = await res.json();
        const r = data.data || {};
        devBuildResult.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <span style="font-weight: bold; color: ${data.success ? '#10b981' : '#ef4444'};">
              ${data.success ? `${name.toUpperCase()} PASSED` : `${name.toUpperCase()} FAILED`}
            </span>
            <span style="font-size: 0.8rem; color: #94a3b8;">${((r.durationMs || 0) / 1000).toFixed(2)}s</span>
          </div>
          <div style="font-size: 0.85rem; color: #cbd5e1; margin-bottom: 0.5rem;">${r.summary}</div>
          <pre style="background: #1e293b; padding: 0.5rem; border-radius: 4px; font-size: 0.8rem; overflow-x: auto; color: #f8fafc; max-height: 250px;">${r.outputPreview || 'No output.'}</pre>
        `;
      } catch (err) {
        devBuildResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
      }
    };

    if (devRunBuildBtn && devBuildResult) {
      devRunBuildBtn.addEventListener('click', () => triggerRunner('/api/jarvis/devenv/build', 'npm run build'));
    }
    if (devRunTcBtn && devBuildResult) {
      devRunTcBtn.addEventListener('click', () => triggerRunner('/api/jarvis/devenv/typecheck', 'npm run typecheck'));
    }
    if (devRunTestsBtn && devBuildResult) {
      devRunTestsBtn.addEventListener('click', () => triggerRunner('/api/jarvis/devenv/test', 'npm test'));
    }
  }

  // ==================== PHASE 12: TUKLAS EDTECH CONTROLLER ====================
  const tuklasModal = document.getElementById('tuklas-modal');
  const tuklasToggleBtn = document.getElementById('tuklas-toggle-btn');
  const closeTuklasModal = document.getElementById('close-tuklas-modal');

  if (tuklasModal && tuklasToggleBtn) {
    tuklasToggleBtn.addEventListener('click', () => {
      tuklasModal.classList.remove('hidden');
    });

    if (closeTuklasModal) {
      closeTuklasModal.addEventListener('click', () => {
        tuklasModal.classList.add('hidden');
      });
    }

    tuklasModal.addEventListener('click', (e) => {
      if (e.target === tuklasModal) {
        tuklasModal.classList.add('hidden');
      }
    });

    // Subtab switching
    const tuklasTabs = tuklasModal.querySelectorAll('.sb-tab[data-tuklastab]');
    const tuklasPanels = {
      lessons: document.getElementById('tuklas-panel-lessons'),
      mastery: document.getElementById('tuklas-panel-mastery'),
      practice: document.getElementById('tuklas-panel-practice'),
      assessment: document.getElementById('tuklas-panel-assessment'),
      diagnostics: document.getElementById('tuklas-panel-diagnostics'),
      teacher: document.getElementById('tuklas-panel-teacher'),
    };

    tuklasTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tuklasTabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.dataset.tuklastab;
        Object.keys(tuklasPanels).forEach((key) => {
          if (tuklasPanels[key]) {
            if (key === target) tuklasPanels[key].classList.remove('hidden');
            else tuklasPanels[key].classList.add('hidden');
          }
        });
      });
    });

    // 1. Search Lessons
    const tuklasSearchBtn = document.getElementById('tuklas-search-btn');
    const tuklasSearchQuery = document.getElementById('tuklas-search-query');
    const tuklasSearchSubject = document.getElementById('tuklas-search-subject');
    const tuklasLessonsResult = document.getElementById('tuklas-lessons-result');

    const searchLessons = async () => {
      try {
        tuklasLessonsResult.innerHTML = '<span style="color: #ec4899;">Searching Tuklas curricula...</span>';
        const q = (tuklasSearchQuery && tuklasSearchQuery.value.trim()) || '';
        const sub = (tuklasSearchSubject && tuklasSearchSubject.value.trim()) || '';
        const params = new URLSearchParams();
        if (q) params.set('q', q);
        if (sub) params.set('subject', sub);

        const res = await fetch(`/api/jarvis/tuklas/lessons/search?${params.toString()}`, {
          headers: { 'x-user-id': 'dwight' },
        });
        const data = await res.json();
        if (!data.success) {
          tuklasLessonsResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
          return;
        }

        const lessons = data.data.lessons || [];
        if (lessons.length === 0) {
          tuklasLessonsResult.innerHTML = '<p style="color: #94a3b8;">No matching lessons found.</p>';
          return;
        }

        const html = lessons.map((l) => `
          <div style="margin-bottom: 0.75rem; padding: 0.75rem; background: #1e293b; border-radius: 6px; border-left: 3px solid #ec4899;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
              <span style="font-weight: bold; color: #f8fafc; font-size: 0.95rem;">${l.title}</span>
              <span class="badge" style="background: #334155; color: #ec4899; font-size: 0.75rem;">${l.competencyCode}</span>
            </div>
            <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.4rem;">
              ${l.subject} • ${l.gradeLevel} • ${l.estimatedMinutes} mins • Author: ${l.author}
            </div>
            <p style="font-size: 0.85rem; color: #cbd5e1; margin: 0 0 0.5rem 0;">${l.summary}</p>
            <div style="font-size: 0.75rem; color: #64748b;">
              Tags: ${l.tags.map((t) => `<span style="background: #0f172a; padding: 2px 5px; border-radius: 3px; margin-right: 4px;">#${t}</span>`).join('')}
            </div>
          </div>
        `).join('');

        tuklasLessonsResult.innerHTML = `
          <div style="font-weight: bold; color: #ec4899; margin-bottom: 0.5rem;">Found ${lessons.length} Lesson Modules</div>
          ${html}
        `;
      } catch (err) {
        tuklasLessonsResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
      }
    };

    if (tuklasSearchBtn) {
      tuklasSearchBtn.addEventListener('click', searchLessons);
    }

    // 2. Student Mastery
    const tuklasLoadStudentBtn = document.getElementById('tuklas-load-student-btn');
    const tuklasStudentSelect = document.getElementById('tuklas-student-select');
    const tuklasStudentResult = document.getElementById('tuklas-student-result');

    if (tuklasLoadStudentBtn && tuklasStudentSelect && tuklasStudentResult) {
      tuklasLoadStudentBtn.addEventListener('click', async () => {
        try {
          const studentId = tuklasStudentSelect.value;
          tuklasStudentResult.innerHTML = '<span style="color: #ec4899;">Loading student progress...</span>';
          const res = await fetch(`/api/jarvis/tuklas/students/${studentId}/progress`, {
            headers: { 'x-user-id': 'dwight' },
          });
          const data = await res.json();
          if (!data.success) {
            tuklasStudentResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }

          const s = data.data;
          const compBadges = Object.entries(s.competencyScores || {}).map(([code, score]) => {
            const color = score >= 85 ? '#10b981' : score >= 75 ? '#f59e0b' : '#ef4444';
            return `
              <div style="display: flex; justify-content: space-between; padding: 0.3rem 0.5rem; background: #1e293b; border-radius: 4px; margin-bottom: 0.25rem; font-size: 0.85rem;">
                <span style="font-family: monospace; color: #cbd5e1;">${code}</span>
                <span style="font-weight: bold; color: ${color};">${score}%</span>
              </div>
            `;
          }).join('');

          tuklasStudentResult.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
              <div>
                <h4 style="margin: 0; color: #f8fafc;">${s.studentName}</h4>
                <div style="font-size: 0.8rem; color: #94a3b8;">${s.enrolledGrade} • Active Streak: ${s.streakDays} days 🔥</div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 1.25rem; font-weight: bold; color: #ec4899;">${s.overallMasteryPercent}%</div>
                <div style="font-size: 0.75rem; color: #94a3b8;">Overall Mastery</div>
              </div>
            </div>
            <h5 style="color: #ec4899; margin: 0 0 0.4rem 0;">Competency Mastery Heatmap</h5>
            <div style="margin-bottom: 0.75rem;">${compBadges}</div>
            <div style="font-size: 0.8rem; color: #64748b;">Completed Lessons: ${s.completedLessonIds.length} modules</div>
          `;
        } catch (err) {
          tuklasStudentResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    // 3. Practice Generator
    const tuklasGenPracticeBtn = document.getElementById('tuklas-gen-practice-btn');
    const tuklasPracticeComp = document.getElementById('tuklas-practice-comp');
    const tuklasPracticeDiff = document.getElementById('tuklas-practice-diff');
    const tuklasPracticeResult = document.getElementById('tuklas-practice-result');

    if (tuklasGenPracticeBtn && tuklasPracticeResult) {
      tuklasGenPracticeBtn.addEventListener('click', async () => {
        try {
          tuklasPracticeResult.innerHTML = '<span style="color: #ec4899;">Generating adaptive practice...</span>';
          const competencyCode = (tuklasPracticeComp && tuklasPracticeComp.value.trim()) || 'M8AL-Ia-b-1';
          const difficulty = (tuklasPracticeDiff && tuklasPracticeDiff.value) || 'medium';

          const res = await fetch('/api/jarvis/tuklas/practice/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({ competencyCode, difficulty, count: 2 }),
          });
          const data = await res.json();
          if (!data.success) {
            tuklasPracticeResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }

          const set = data.data;
          const itemsHtml = set.items.map((it, idx) => `
            <div style="margin-bottom: 0.75rem; padding: 0.75rem; background: #1e293b; border-radius: 6px;">
              <div style="font-weight: bold; color: #f8fafc; font-size: 0.9rem; margin-bottom: 0.4rem;">
                Item ${idx + 1}: ${it.question}
              </div>
              <div style="margin-bottom: 0.4rem; font-size: 0.85rem; color: #cbd5e1;">
                ${(it.options || []).map((opt) => `<div>${opt}</div>`).join('')}
              </div>
              <div style="font-size: 0.8rem; background: #0f172a; padding: 0.4rem; border-radius: 4px; color: #f59e0b; margin-bottom: 0.25rem;">
                💡 <strong>Hint:</strong> ${it.hint}
              </div>
              <div style="font-size: 0.8rem; background: #0f172a; padding: 0.4rem; border-radius: 4px; color: #10b981;">
                ✓ <strong>Answer & Explanation:</strong> Option ${it.correctAnswer} — ${it.explanation}
              </div>
            </div>
          `).join('');

          tuklasPracticeResult.innerHTML = `
            <div style="font-weight: bold; color: #ec4899; margin-bottom: 0.5rem;">Adaptive Practice Set (${set.difficulty.toUpperCase()})</div>
            ${itemsHtml}
          `;
        } catch (err) {
          tuklasPracticeResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    // 4. Assessment Grader
    const tuklasEvalAssessBtn = document.getElementById('tuklas-eval-assess-btn');
    const tuklasAssessId = document.getElementById('tuklas-assess-id');
    const tuklasAssessResult = document.getElementById('tuklas-assess-result');

    if (tuklasEvalAssessBtn && tuklasAssessResult) {
      tuklasEvalAssessBtn.addEventListener('click', async () => {
        try {
          tuklasAssessResult.innerHTML = '<span style="color: #ec4899;">Evaluating submitted answers...</span>';
          const assessmentId = (tuklasAssessId && tuklasAssessId.value) || 'assess_math_g8';

          const res = await fetch('/api/jarvis/tuklas/assessments/evaluate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({
              assessmentId,
              studentId: 'student_dwight',
              answers: { item_alg_01: 'C', item_poly_02: 'B', item_poly_03: 'B' },
            }),
          });
          const data = await res.json();
          if (!data.success) {
            tuklasAssessResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }

          const r = data.data;
          tuklasAssessResult.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span style="font-weight: bold; color: ${r.passed ? '#10b981' : '#ef4444'}; font-size: 1.1rem;">
                ${r.passed ? 'PASSED (>=75%)' : 'REMEDIATION REQUIRED'}
              </span>
              <span style="font-weight: bold; color: #ec4899;">${r.score} / ${r.totalItems} (${r.percentage}%)</span>
            </div>
            <div style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 0.5rem;">
              Student: ${r.studentId} • Evaluated at: ${new Date(r.evaluatedAt).toLocaleTimeString()}
            </div>
            ${r.details.map((d, i) => `
              <div style="font-size: 0.8rem; background: #1e293b; padding: 0.4rem; border-radius: 4px; margin-bottom: 0.3rem;">
                <strong>Item ${i + 1}:</strong> Your Answer: <code style="color: ${d.isCorrect ? '#10b981' : '#ef4444'};">${d.studentAnswer}</code> | Correct: <code style="color: #10b981;">${d.correctAnswer}</code>
                <div style="color: #94a3b8; margin-top: 0.2rem;">${d.explanation}</div>
              </div>
            `).join('')}
          `;
        } catch (err) {
          tuklasAssessResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    // 5. Mistake Diagnostics
    const tuklasRunDiagBtn = document.getElementById('tuklas-run-diag-btn');
    const tuklasDiagComp = document.getElementById('tuklas-diag-comp');
    const tuklasDiagWrong = document.getElementById('tuklas-diag-wrong');
    const tuklasDiagCorrect = document.getElementById('tuklas-diag-correct');
    const tuklasDiagResult = document.getElementById('tuklas-diag-result');

    if (tuklasRunDiagBtn && tuklasDiagResult) {
      tuklasRunDiagBtn.addEventListener('click', async () => {
        try {
          tuklasDiagResult.innerHTML = '<span style="color: #ec4899;">Diagnosing student mistake...</span>';
          const competencyCode = (tuklasDiagComp && tuklasDiagComp.value.trim()) || 'M8AL-Ia-b-1';
          const wrongAnswer = (tuklasDiagWrong && tuklasDiagWrong.value.trim()) || '(5x + 8y)^2';
          const correctAnswer = (tuklasDiagCorrect && tuklasDiagCorrect.value.trim()) || '(5x - 8y)(5x + 8y)';

          const res = await fetch('/api/jarvis/tuklas/diagnostics/analyze-mistakes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({ competencyCode, wrongAnswer, correctAnswer }),
          });
          const data = await res.json();
          if (!data.success) {
            tuklasDiagResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }

          const diag = data.data;
          tuklasDiagResult.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span style="font-weight: bold; color: #ec4899;">Diagnostic Classification</span>
              <span class="badge" style="background: #334155; color: #f59e0b; text-transform: uppercase;">
                ${diag.errorType} Error
              </span>
            </div>
            <div style="background: #1e293b; padding: 0.5rem; border-radius: 4px; font-size: 0.85rem; color: #f8fafc; margin-bottom: 0.5rem;">
              <strong>Misconception:</strong> ${diag.misconceptionDescription}
            </div>
            <div style="background: #0f172a; padding: 0.5rem; border-radius: 4px; font-size: 0.85rem; color: #10b981; margin-bottom: 0.5rem;">
              <strong>Pedagogical Remediation:</strong> ${diag.remedialExplanation}
            </div>
            ${diag.recommendedLessonTitle ? `
              <div style="font-size: 0.85rem; color: #38bdf8;">
                📘 <strong>Recommended Lesson:</strong> ${diag.recommendedLessonTitle}
              </div>
            ` : ''}
          `;
        } catch (err) {
          tuklasDiagResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    // 6. Research & Teacher Desk
    const tuklasLoadCohortBtn = document.getElementById('tuklas-load-cohort-btn');
    const tuklasListAsgnsBtn = document.getElementById('tuklas-list-asgns-btn');
    const tuklasCreateAsgnBtn = document.getElementById('tuklas-create-asgn-btn');
    const tuklasTeacherResult = document.getElementById('tuklas-teacher-result');

    if (tuklasLoadCohortBtn && tuklasTeacherResult) {
      tuklasLoadCohortBtn.addEventListener('click', async () => {
        try {
          tuklasTeacherResult.innerHTML = '<span style="color: #ec4899;">Extracting anonymized cohort dataset...</span>';
          const res = await fetch('/api/jarvis/tuklas/research/cohort-data', {
            headers: { 'x-user-id': 'dwight' },
          });
          const data = await res.json();
          if (!data.success) {
            tuklasTeacherResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }

          const c = data.data;
          const recordsHtml = (c.records || []).map((r) => `
            <tr>
              <td style="padding: 0.3rem; font-family: monospace; color: #ec4899;">${r.anonymizedId}</td>
              <td style="padding: 0.3rem; color: #cbd5e1;">${r.gradeLevel}</td>
              <td style="padding: 0.3rem; font-weight: bold; color: ${r.score >= 75 ? '#10b981' : '#ef4444'};">${r.score}%</td>
              <td style="padding: 0.3rem; color: #cbd5e1;">${r.modulesCompleted}</td>
              <td style="padding: 0.3rem; color: #cbd5e1;">${r.timeSpentMinutes}m</td>
            </tr>
          `).join('');

          tuklasTeacherResult.innerHTML = `
            <div style="font-weight: bold; color: #ec4899; margin-bottom: 0.25rem;">${c.cohortName}</div>
            <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.5rem;">
              Enrolled: ${c.studentCount} | Avg Score: ${c.averageScore}% | Passing Rate: ${c.passingRate}% (Anonymized under RA 10173)
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem; text-align: left;">
              <thead>
                <tr style="border-bottom: 1px solid #334155; color: #94a3b8;">
                  <th>Anonymized ID</th><th>Grade</th><th>Score</th><th>Modules</th><th>Time</th>
                </tr>
              </thead>
              <tbody>${recordsHtml}</tbody>
            </table>
          `;
        } catch (err) {
          tuklasTeacherResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    if (tuklasListAsgnsBtn && tuklasTeacherResult) {
      tuklasListAsgnsBtn.addEventListener('click', async () => {
        try {
          tuklasTeacherResult.innerHTML = '<span style="color: #ec4899;">Listing assignments...</span>';
          const res = await fetch('/api/jarvis/tuklas/assignments', {
            headers: { 'x-user-id': 'dwight' },
          });
          const data = await res.json();
          if (!data.success) {
            tuklasTeacherResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }

          const asgns = data.data.assignments || [];
          if (asgns.length === 0) {
            tuklasTeacherResult.innerHTML = '<p style="color: #94a3b8;">No active assignments found.</p>';
            return;
          }

          const html = asgns.map((a) => `
            <div style="margin-bottom: 0.4rem; padding: 0.5rem; background: #1e293b; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="font-weight: bold; color: #f8fafc; font-size: 0.85rem;">${a.title}</span>
                <span style="color: #94a3b8; font-size: 0.8rem;"> (${a.competencyCode})</span>
              </div>
              <span class="badge" style="background: #334155; color: #ec4899; font-size: 0.75rem;">Due: ${new Date(a.dueDate).toLocaleDateString()}</span>
            </div>
          `).join('');

          tuklasTeacherResult.innerHTML = `
            <div style="font-weight: bold; color: #ec4899; margin-bottom: 0.4rem;">Classroom Assignments (${asgns.length})</div>
            ${html}
          `;
        } catch (err) {
          tuklasTeacherResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    if (tuklasCreateAsgnBtn && tuklasTeacherResult) {
      tuklasCreateAsgnBtn.addEventListener('click', async () => {
        try {
          const title = (document.getElementById('tuklas-asgn-title')?.value || '').trim();
          const competencyCode = (document.getElementById('tuklas-asgn-comp')?.value || '').trim();
          if (!title || !competencyCode) {
            alert('Please enter assignment title and competency.');
            return;
          }

          const res = await fetch('/api/jarvis/tuklas/assignments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({
              classId: 'class_section_euler',
              title,
              competencyCode,
              dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
            }),
          });
          const data = await res.json();
          if (data.success) {
            alert(`Assignment "${title}" created successfully!`);
            tuklasListAsgnsBtn?.click();
          } else {
            alert(`Failed: ${data.error}`);
          }
        } catch (err) {
          alert(`Error: ${err.message}`);
        }
      });
    }
  }

  // ==================== PHASE 13: CREATIVE STUDIO CONTROLLER ====================
  const creativeModal = document.getElementById('creative-modal');
  const creativeToggleBtn = document.getElementById('creative-toggle-btn');
  const closeCreativeBtn = document.getElementById('close-creative-btn');

  if (creativeModal && creativeToggleBtn) {
    creativeToggleBtn.addEventListener('click', () => {
      creativeModal.classList.remove('hidden');
    });

    if (closeCreativeBtn) {
      closeCreativeBtn.addEventListener('click', () => {
        creativeModal.classList.add('hidden');
      });
    }

    creativeModal.addEventListener('click', (e) => {
      if (e.target === creativeModal) {
        creativeModal.classList.add('hidden');
      }
    });

    // Subtab switching
    const tabImage = document.getElementById('tab-creative-image');
    const tabGraphic = document.getElementById('tab-creative-graphic');
    const tabDeck = document.getElementById('tab-creative-deck');
    const tabSubtitles = document.getElementById('tab-creative-subtitles');
    const tabSpeech = document.getElementById('tab-creative-speech');
    const tabStoryboard = document.getElementById('tab-creative-storyboard');

    const panelImage = document.getElementById('creative-panel-image');
    const panelGraphic = document.getElementById('creative-panel-graphic');
    const panelDeck = document.getElementById('creative-panel-deck');
    const panelSubtitles = document.getElementById('creative-panel-subtitles');
    const panelSpeech = document.getElementById('creative-panel-speech');
    const panelStoryboard = document.getElementById('creative-panel-storyboard');

    const tabsList = [
      { tab: tabImage, panel: panelImage },
      { tab: tabGraphic, panel: panelGraphic },
      { tab: tabDeck, panel: panelDeck },
      { tab: tabSubtitles, panel: panelSubtitles },
      { tab: tabSpeech, panel: panelSpeech },
      { tab: tabStoryboard, panel: panelStoryboard },
    ];

    tabsList.forEach(({ tab, panel }) => {
      if (!tab || !panel) return;
      tab.addEventListener('click', () => {
        tabsList.forEach(({ tab: t, panel: p }) => {
          if (t) {
            t.classList.remove('active');
            t.style.color = '#94a3b8';
            t.style.borderBottom = 'none';
          }
          if (p) p.classList.add('hidden');
        });
        tab.classList.add('active');
        tab.style.color = '#c084fc';
        tab.style.borderBottom = '2px solid #a855f7';
        panel.classList.remove('hidden');
      });
    });

    // 1. Vector Image Generator
    const genImgBtn = document.getElementById('creative-gen-img-btn');
    const imgPromptInput = document.getElementById('creative-img-prompt');
    const imgStyleSelect = document.getElementById('creative-img-style');
    const imgArSelect = document.getElementById('creative-img-ar');
    const imgResult = document.getElementById('creative-img-result');

    if (genImgBtn && imgResult) {
      genImgBtn.addEventListener('click', async () => {
        try {
          const prompt = (imgPromptInput?.value || '').trim();
          if (!prompt) return;
          const style = imgStyleSelect?.value || 'digital_art';
          const aspectRatio = imgArSelect?.value || '16:9';

          imgResult.innerHTML = '<span style="color: #a855f7;">Synthesizing vector SVG artwork...</span>';
          const res = await fetch('/api/jarvis/creative/image/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({ prompt, style, aspectRatio }),
          });
          const data = await res.json();
          if (!data.success) {
            imgResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }

          const img = data.data;
          imgResult.innerHTML = `
            <div style="margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: bold; color: #c084fc;">Style: ${img.style} • ${img.width}x${img.height}</span>
              <span class="badge" style="background: #334155; color: #a855f7;">SVG Vector Output</span>
            </div>
            <div style="border-radius: 8px; overflow: hidden; border: 1px solid #334155; max-width: 100%; box-shadow: 0 8px 24px rgba(0,0,0,0.5);">
              ${img.contentData}
            </div>
          `;
        } catch (err) {
          imgResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    // 2. Graphic Designer
    const genGfxBtn = document.getElementById('creative-gen-gfx-btn');
    const gfxTitleInput = document.getElementById('creative-gfx-title');
    const gfxSubtitleInput = document.getElementById('creative-gfx-subtitle');
    const gfxLayoutSelect = document.getElementById('creative-gfx-layout');
    const gfxThemeSelect = document.getElementById('creative-gfx-theme');
    const gfxResult = document.getElementById('creative-gfx-result');

    if (genGfxBtn && gfxResult) {
      genGfxBtn.addEventListener('click', async () => {
        try {
          const title = (gfxTitleInput?.value || '').trim();
          const subtitle = (gfxSubtitleInput?.value || '').trim();
          const layout = gfxLayoutSelect?.value || 'banner';
          const theme = gfxThemeSelect?.value || 'dark_neon';
          if (!title) return;

          gfxResult.innerHTML = '<span style="color: #a855f7;">Composing vector graphic layout...</span>';
          const res = await fetch('/api/jarvis/creative/graphic/compose', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({ title, subtitle, layout, theme }),
          });
          const data = await res.json();
          if (!data.success) {
            gfxResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }

          const gfx = data.data;
          gfxResult.innerHTML = `
            <div style="margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: bold; color: #c084fc;">Layout: ${gfx.layout} (${gfx.width}x${gfx.height}) • Theme: ${gfx.theme}</span>
              <span class="badge" style="background: #334155; color: #a855f7;">High-Res SVG</span>
            </div>
            <div style="border-radius: 8px; overflow: hidden; border: 1px solid #334155; max-width: 100%; box-shadow: 0 8px 24px rgba(0,0,0,0.5);">
              ${gfx.svgMarkup}
            </div>
          `;
        } catch (err) {
          gfxResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    // 3. Slide Decks
    const genDeckBtn = document.getElementById('creative-gen-deck-btn');
    const deckTopicInput = document.getElementById('creative-deck-topic');
    const deckAudienceInput = document.getElementById('creative-deck-aud');
    const deckSlidesSelect = document.getElementById('creative-deck-slides');
    const deckResult = document.getElementById('creative-deck-result');

    if (genDeckBtn && deckResult) {
      genDeckBtn.addEventListener('click', async () => {
        try {
          const topic = (deckTopicInput?.value || '').trim();
          const targetAudience = (deckAudienceInput?.value || '').trim();
          const slideCount = parseInt(deckSlidesSelect?.value || '5', 10);
          if (!topic) return;

          deckResult.innerHTML = '<span style="color: #a855f7;">Synthesizing structured presentation deck...</span>';
          const res = await fetch('/api/jarvis/creative/presentation/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({ topic, targetAudience, slideCount }),
          });
          const data = await res.json();
          if (!data.success) {
            deckResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }

          const deck = data.data;
          const slidesHtml = deck.slides.map((s) => `
            <div style="margin-bottom: 0.75rem; padding: 0.75rem; background: #1e293b; border-radius: 6px; border-left: 3px solid #a855f7;">
              <div style="font-weight: bold; color: #f8fafc; font-size: 0.95rem;">Slide ${s.slideNumber}: ${s.title}</div>
              <ul style="margin: 0.4rem 0 0.4rem 1.2rem; font-size: 0.85rem; color: #cbd5e1;">
                ${s.bulletPoints.map((bp) => `<li>${bp}</li>`).join('')}
              </ul>
              ${s.visualCue ? `<div style="font-size: 0.8rem; color: #38bdf8;">Visual Cue: ${s.visualCue}</div>` : ''}
              ${s.speakerNotes ? `<div style="font-size: 0.75rem; color: #94a3b8; font-style: italic; margin-top: 0.25rem;">Notes: ${s.speakerNotes}</div>` : ''}
            </div>
          `).join('');

          deckResult.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
              <div>
                <span style="font-weight: bold; color: #c084fc; font-size: 1rem;">${deck.topic}</span>
                <span style="color: #94a3b8; font-size: 0.8rem;"> (${deck.totalSlides} Slides • ~${deck.estimatedMinutes} mins)</span>
              </div>
              <button id="view-deck-html-btn" class="btn btn-outline" style="border-color: #a855f7; color: #a855f7; font-size: 0.8rem;">Preview Export HTML</button>
            </div>
            ${slidesHtml}
          `;

          const viewHtmlBtn = document.getElementById('view-deck-html-btn');
          if (viewHtmlBtn) {
            viewHtmlBtn.addEventListener('click', () => {
              const win = window.open('', '_blank');
              if (win) {
                win.document.write(deck.htmlExport);
                win.document.close();
              }
            });
          }
        } catch (err) {
          deckResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    // 4. Subtitles
    const genSubBtn = document.getElementById('creative-gen-sub-btn');
    const subTranscriptInput = document.getElementById('creative-sub-transcript');
    const subFormatSelect = document.getElementById('creative-sub-format');
    const subResult = document.getElementById('creative-sub-result');

    if (genSubBtn && subResult) {
      genSubBtn.addEventListener('click', async () => {
        try {
          const transcript = (subTranscriptInput?.value || '').trim();
          const format = subFormatSelect?.value || 'srt';
          if (!transcript) return;

          subResult.innerHTML = '<span style="color: #a855f7;">Generating subtitle cue timing...</span>';
          const res = await fetch('/api/jarvis/creative/subtitles/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({ transcript, format }),
          });
          const data = await res.json();
          if (!data.success) {
            subResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }

          const sub = data.data;
          subResult.innerHTML = `
            <div style="font-weight: bold; color: #c084fc; margin-bottom: 0.5rem; font-family: sans-serif;">
              Format: ${sub.format.toUpperCase()} • Cues: ${sub.entryCount} • Duration: ${sub.durationSeconds}s
            </div>
            <div>${sub.content}</div>
          `;
        } catch (err) {
          subResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    // 5. Speech Spec
    const genSpeechBtn = document.getElementById('creative-gen-speech-btn');
    const speechTextInput = document.getElementById('creative-speech-text');
    const speechGenderSelect = document.getElementById('creative-speech-gender');
    const speechRateInput = document.getElementById('creative-speech-rate');
    const speechResult = document.getElementById('creative-speech-result');

    if (genSpeechBtn && speechResult) {
      genSpeechBtn.addEventListener('click', async () => {
        try {
          const text = (speechTextInput?.value || '').trim();
          const voiceGender = speechGenderSelect?.value || 'male';
          const speakingRate = parseFloat(speechRateInput?.value || '1.0');
          if (!text) return;

          speechResult.innerHTML = '<span style="color: #a855f7;">Synthesizing SSML specification...</span>';
          const res = await fetch('/api/jarvis/creative/speech/spec', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({ text, voiceGender, speakingRate }),
          });
          const data = await res.json();
          if (!data.success) {
            speechResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }

          const sp = data.data;
          speechResult.innerHTML = `
            <div style="font-weight: bold; color: #c084fc; margin-bottom: 0.5rem; font-family: sans-serif;">
              Voice: ${sp.voiceGender} • Rate: ${sp.speakingRate}x • Words: ${sp.wordCount} • Est. Duration: ${sp.estimatedDurationSeconds}s
            </div>
            <div>${escapeHtml(sp.ssml)}</div>
          `;
        } catch (err) {
          speechResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    // 6. Storyboard Planner
    const genSbBtn = document.getElementById('creative-gen-sb-btn');
    const sbTitleInput = document.getElementById('creative-sb-title');
    const sbConceptInput = document.getElementById('creative-sb-concept');
    const sbScenesSelect = document.getElementById('creative-sb-scenes');
    const sbResult = document.getElementById('creative-sb-result');

    if (genSbBtn && sbResult) {
      genSbBtn.addEventListener('click', async () => {
        try {
          const projectTitle = (sbTitleInput?.value || '').trim();
          const concept = (sbConceptInput?.value || '').trim();
          const sceneCount = parseInt(sbScenesSelect?.value || '5', 10);
          if (!projectTitle || !concept) return;

          sbResult.innerHTML = '<span style="color: #a855f7;">Planning cinematic storyboard...</span>';
          const res = await fetch('/api/jarvis/creative/storyboard/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({ projectTitle, concept, sceneCount }),
          });
          const data = await res.json();
          if (!data.success) {
            sbResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }

          const sb = data.data;
          const scenesHtml = sb.scenes.map((s) => `
            <div style="margin-bottom: 0.75rem; padding: 0.75rem; background: #1e293b; border-radius: 6px; border-left: 3px solid #a855f7;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                <span style="font-weight: bold; color: #f8fafc; font-size: 0.95rem;">Scene ${s.sceneNumber}: ${s.title}</span>
                <span class="badge" style="background: #334155; color: #c084fc; font-size: 0.75rem;">Shot: ${s.cameraShot.toUpperCase()} • ${s.durationSeconds}s</span>
              </div>
              <p style="font-size: 0.85rem; color: #cbd5e1; margin: 0 0 0.4rem 0;"><strong>Visual:</strong> ${s.visualDescription}</p>
              <div style="font-size: 0.85rem; color: #38bdf8; margin-bottom: 0.25rem;"><strong>Dialogue:</strong> "${s.audioDialogue}"</div>
              ${s.soundEffects ? `<div style="font-size: 0.8rem; color: #94a3b8;"><strong>SFX:</strong> ${s.soundEffects}</div>` : ''}
            </div>
          `).join('');

          sbResult.innerHTML = `
            <div style="margin-bottom: 0.75rem;">
              <span style="font-weight: bold; color: #c084fc; font-size: 1rem;">${sb.projectTitle}</span>
              <span style="color: #94a3b8; font-size: 0.8rem;"> (${sb.totalScenes} Scenes • Total Duration: ${sb.totalDurationSeconds}s)</span>
            </div>
            ${scenesHtml}
          `;
        } catch (err) {
          sbResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }
  }

  // ==================== PHASE 14: ANIMATION CONTROLLER ====================
  const animModal = document.getElementById('animation-modal');
  const animToggleBtn = document.getElementById('animation-toggle-btn');
  const closeAnimBtn = document.getElementById('close-animation-btn');

  if (animModal && animToggleBtn) {
    animToggleBtn.addEventListener('click', () => {
      animModal.classList.remove('hidden');
    });

    if (closeAnimBtn) {
      closeAnimBtn.addEventListener('click', () => {
        animModal.classList.add('hidden');
      });
    }

    animModal.addEventListener('click', (e) => {
      if (e.target === animModal) {
        animModal.classList.add('hidden');
      }
    });

    // Subtab switching
    const tabCompose = document.getElementById('tab-anim-compose');
    const tabLayers = document.getElementById('tab-anim-layers');
    const tabRig = document.getElementById('tab-anim-rig');
    const tabMotion = document.getElementById('tab-anim-motion');
    const tabTools = document.getElementById('tab-anim-tools');

    const panelCompose = document.getElementById('anim-panel-compose');
    const panelLayers = document.getElementById('anim-panel-layers');
    const panelRig = document.getElementById('anim-panel-rig');
    const panelMotion = document.getElementById('anim-panel-motion');
    const panelTools = document.getElementById('anim-panel-tools');

    const animTabsList = [
      { tab: tabCompose, panel: panelCompose },
      { tab: tabLayers, panel: panelLayers },
      { tab: tabRig, panel: panelRig },
      { tab: tabMotion, panel: panelMotion },
      { tab: tabTools, panel: panelTools },
    ];

    animTabsList.forEach(({ tab, panel }) => {
      if (!tab || !panel) return;
      tab.addEventListener('click', () => {
        animTabsList.forEach(({ tab: t, panel: p }) => {
          if (t) {
            t.classList.remove('active');
            t.style.color = '#94a3b8';
            t.style.borderBottom = 'none';
          }
          if (p) p.classList.add('hidden');
        });
        tab.classList.add('active');
        tab.style.color = '#fb7185';
        tab.style.borderBottom = '2px solid #f43f5e';
        panel.classList.remove('hidden');
      });
    });

    // 1. Scene Composer
    const runComposeBtn = document.getElementById('anim-run-compose-btn');
    const composeTitleInput = document.getElementById('anim-compose-title');
    const composePromptInput = document.getElementById('anim-compose-prompt');
    const composeStyleSelect = document.getElementById('anim-compose-style');
    const composeDurationSelect = document.getElementById('anim-compose-duration');
    const composeResult = document.getElementById('anim-compose-result');

    if (runComposeBtn && composeResult) {
      runComposeBtn.addEventListener('click', async () => {
        try {
          const title = (composeTitleInput?.value || '').trim();
          const conceptPrompt = (composePromptInput?.value || '').trim();
          const style = composeStyleSelect?.value || '2d_vector';
          const durationSeconds = parseInt(composeDurationSelect?.value || '6', 10);
          if (!title || !conceptPrompt) return;

          composeResult.innerHTML = '<span style="color: #f43f5e;">Bringing scene alive across all 7 stages...</span>';
          const res = await fetch('/api/jarvis/animation/compose', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({ title, conceptPrompt, style, durationSeconds }),
          });
          const data = await res.json();
          if (!data.success) {
            composeResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }

          const anim = data.data;
          composeResult.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
              <div>
                <span style="font-weight: bold; color: #fb7185; font-size: 1rem;">${anim.title}</span>
                <span style="color: #94a3b8; font-size: 0.8rem;"> (${anim.fps} FPS • ${anim.durationSeconds}s • ${anim.totalFrames} frames)</span>
              </div>
              <button id="view-anim-player-btn" class="btn btn-outline" style="border-color: #f43f5e; color: #fb7185; font-size: 0.8rem;">Open Full Interactive Player</button>
            </div>
            <div style="border-radius: 8px; overflow: hidden; border: 1px solid #334155; background: #000; box-shadow: 0 8px 24px rgba(0,0,0,0.6); margin-bottom: 0.75rem;">
              ${anim.animatedSvgMarkup}
            </div>
            <div style="display: flex; gap: 0.5rem; justify-content: center; font-size: 0.8rem; color: #94a3b8;">
              <span>Layers: ${anim.layers.length}</span> •
              <span>Motion Tracks: ${anim.motionTracks.length}</span> •
              <span>Audio Tracks: ${anim.audioTracks.length}</span>
            </div>
          `;

          const openPlayerBtn = document.getElementById('view-anim-player-btn');
          if (openPlayerBtn) {
            openPlayerBtn.addEventListener('click', () => {
              const win = window.open('', '_blank');
              if (win) {
                win.document.write(anim.htmlPlayer);
                win.document.close();
              }
            });
          }
        } catch (err) {
          composeResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    // 2. Asset Layers
    const loadLayersBtn = document.getElementById('anim-load-layers-btn');
    const layersResult = document.getElementById('anim-layers-result');

    if (loadLayersBtn && layersResult) {
      loadLayersBtn.addEventListener('click', async () => {
        try {
          layersResult.innerHTML = '<span style="color: #f43f5e;">Decomposing scene layers...</span>';
          const res = await fetch('/api/jarvis/animation/layers/decompose', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({
              sceneTitle: 'Console Terminal',
              conceptPrompt: 'Cybernetic interface chamber',
            }),
          });
          const data = await res.json();
          if (!data.success) {
            layersResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }

          const layers = data.data.layers || [];
          const rows = layers.map((l) => `
            <tr style="border-bottom: 1px solid #334155;">
              <td style="padding: 0.5rem; color: #fb7185; font-family: monospace;">${l.id}</td>
              <td style="padding: 0.5rem; color: #f8fafc; font-weight: bold;">${l.name}</td>
              <td style="padding: 0.5rem; color: #cbd5e1;">${l.type}</td>
              <td style="padding: 0.5rem;"><span class="badge" style="background: #1e293b; color: #38bdf8;">z: ${l.zIndex}</span></td>
              <td style="padding: 0.5rem; color: #94a3b8; font-size: 0.8rem;">Pivot: (${l.pivotX}, ${l.pivotY})</td>
            </tr>
          `).join('');

          layersResult.innerHTML = `
            <div style="font-weight: bold; color: #fb7185; margin-bottom: 0.5rem;">Decomposed Hierarchy (${layers.length} Planes)</div>
            <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left;">
              <thead>
                <tr style="border-bottom: 1px solid #475569; color: #94a3b8;">
                  <th>Layer ID</th><th>Name</th><th>Type</th><th>Z-Index</th><th>Pivot Anchor</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          `;
        } catch (err) {
          layersResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    // 3. Character Rig
    const loadRigBtn = document.getElementById('anim-load-rig-btn');
    const rigNameInput = document.getElementById('anim-rig-name');
    const rigResult = document.getElementById('anim-rig-result');

    if (loadRigBtn && rigResult) {
      loadRigBtn.addEventListener('click', async () => {
        try {
          const characterName = (rigNameInput?.value || '').trim() || 'Hero Avatar';
          rigResult.innerHTML = '<span style="color: #f43f5e;">Constructing skeletal rig and joint tree...</span>';
          const res = await fetch('/api/jarvis/animation/rig', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({ characterName }),
          });
          const data = await res.json();
          if (!data.success) {
            rigResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }

          const rig = data.data;
          const jointsList = rig.joints.map((j) => `
            <span class="badge" style="background: #1e293b; color: #38bdf8; margin: 2px;">
              ${j.name}${j.parent ? ' ➔ ' + j.parent : ' (root)'}
            </span>
          `).join(' ');

          const posesList = Object.keys(rig.availablePoses || {}).map((p) => `
            <div style="padding: 0.35rem 0.6rem; background: #1e293b; border-radius: 4px; font-size: 0.8rem; color: #cbd5e1;">
              <strong>Pose: ${p}</strong> (Mouth: ${rig.availablePoses[p].mouthShape})
            </div>
          `).join('');

          rigResult.innerHTML = `
            <div style="font-weight: bold; color: #fb7185; margin-bottom: 0.5rem;">${rig.characterName} Rig (${rig.joints.length} Joints)</div>
            <div style="margin-bottom: 0.75rem;">${jointsList}</div>
            <div style="font-weight: bold; color: #f8fafc; font-size: 0.85rem; margin-bottom: 0.35rem;">Configured Preset Poses:</div>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.75rem;">${posesList}</div>
            <div style="font-size: 0.8rem; color: #94a3b8;">Supported Viseme Shapes: rest, A, E, O, BMP, L, FV, wide_smile</div>
          `;
        } catch (err) {
          rigResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    // 4. Motion & Lip Sync
    const loadMotionBtn = document.getElementById('anim-load-motion-btn');
    const loadLipsyncBtn = document.getElementById('anim-load-lipsync-btn');
    const motionResult = document.getElementById('anim-motion-result');

    if (loadMotionBtn && motionResult) {
      loadMotionBtn.addEventListener('click', async () => {
        try {
          motionResult.innerHTML = '<span style="color: #f43f5e;">Generating keyframe motion graphs...</span>';
          const res = await fetch('/api/jarvis/animation/keyframes/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({ durationSeconds: 6 }),
          });
          const data = await res.json();
          if (!data.success) {
            motionResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }

          const tracks = data.data.tracks || [];
          const tracksHtml = tracks.map((t) => `
            <div style="margin-bottom: 0.5rem; padding: 0.5rem; background: #1e293b; border-radius: 4px;">
              <div style="font-weight: bold; color: #fb7185; font-size: 0.85rem;">${t.targetLayerId} ➔ ${t.property}</div>
              <div style="font-size: 0.8rem; color: #94a3b8;">
                Keyframes (${t.keyframes.length}): ${t.keyframes.map((k) => `${k.timeSeconds}s: ${k.value}`).join(' | ')}
              </div>
            </div>
          `).join('');

          motionResult.innerHTML = `
            <div style="font-weight: bold; color: #fb7185; margin-bottom: 0.5rem;">Synthesized Motion Graphs (${tracks.length} Tracks)</div>
            ${tracksHtml}
          `;
        } catch (err) {
          motionResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    if (loadLipsyncBtn && motionResult) {
      loadLipsyncBtn.addEventListener('click', async () => {
        try {
          motionResult.innerHTML = '<span style="color: #38bdf8;">Generating phoneme lip sync sequence...</span>';
          const res = await fetch('/api/jarvis/animation/lipsync/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({
              transcript: 'Greetings Dwight. Animation systems are fully operational.',
              durationSeconds: 5,
            }),
          });
          const data = await res.json();
          if (!data.success) {
            motionResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }

          const track = data.data;
          const cuesHtml = (track.cues || []).map((c) => `
            <span class="badge" style="background: #1e293b; color: #fb7185; margin: 2px;">
              ${c.timeSeconds}s: [${c.viseme}] ${c.word ? `(${c.word})` : ''}
            </span>
          `).join(' ');

          motionResult.innerHTML = `
            <div style="font-weight: bold; color: #38bdf8; margin-bottom: 0.5rem;">Lip Sync Viseme Timeline (${track.totalCues} Cues)</div>
            <div style="line-height: 1.8;">${cuesHtml}</div>
          `;
        } catch (err) {
          motionResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    // 5. Rendering Tools Audit
    const auditToolsBtn = document.getElementById('anim-audit-tools-btn');
    const toolsResult = document.getElementById('anim-tools-result');

    if (auditToolsBtn && toolsResult) {
      auditToolsBtn.addEventListener('click', async () => {
        try {
          toolsResult.innerHTML = '<span style="color: #f43f5e;">Auditing system rendering software...</span>';
          const res = await fetch('/api/jarvis/animation/tools', {
            headers: { 'x-user-id': 'dwight' },
          });
          const data = await res.json();
          if (!data.success) {
            toolsResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }

          const t = data.data;
          const notesHtml = (t.notes || []).map((n) => `<li>${n}</li>`).join('');

          toolsResult.innerHTML = `
            <div style="display: flex; gap: 1rem; margin-bottom: 0.75rem;">
              <div style="flex: 1; padding: 0.75rem; background: #1e293b; border-radius: 6px; text-align: center;">
                <div style="font-size: 0.8rem; color: #94a3b8;">FFmpeg CLI</div>
                <div style="font-weight: bold; color: ${t.ffmpegInstalled ? '#10b981' : '#ef4444'}; font-size: 1.1rem;">
                  ${t.ffmpegInstalled ? 'Installed' : 'Not Found'}
                </div>
              </div>
              <div style="flex: 1; padding: 0.75rem; background: #1e293b; border-radius: 6px; text-align: center;">
                <div style="font-size: 0.8rem; color: #94a3b8;">Blender 3D</div>
                <div style="font-weight: bold; color: ${t.blenderInstalled ? '#10b981' : '#ef4444'}; font-size: 1.1rem;">
                  ${t.blenderInstalled ? 'Installed' : 'Not Found'}
                </div>
              </div>
              <div style="flex: 1; padding: 0.75rem; background: #1e293b; border-radius: 6px; text-align: center;">
                <div style="font-size: 0.8rem; color: #94a3b8;">Vector SVG / SMIL</div>
                <div style="font-weight: bold; color: #10b981; font-size: 1.1rem;">Verified Ready</div>
              </div>
            </div>
            <div style="font-weight: bold; color: #fb7185; margin-bottom: 0.35rem; font-size: 0.85rem;">Honest Limitation Notes:</div>
            <ul style="margin: 0; padding-left: 1.2rem; font-size: 0.85rem; color: #cbd5e1; line-height: 1.6;">${notesHtml}</ul>
          `;
        } catch (err) {
          toolsResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }
  }

  // Phase 15: Innovation Studio Modal & Controller
  const innovToggleBtn = document.getElementById('innovation-toggle-btn');
  const innovModal = document.getElementById('innovation-modal');
  const closeInnovModalBtn = document.getElementById('close-innovation-modal');

  if (innovToggleBtn && innovModal) {
    innovToggleBtn.addEventListener('click', () => {
      innovModal.classList.remove('hidden');
    });

    if (closeInnovModalBtn) {
      closeInnovModalBtn.addEventListener('click', () => {
        innovModal.classList.add('hidden');
      });
    }

    // Tab Switching
    const innovTabs = [
      { btn: 'innov-tab-blueprint', panel: 'innov-panel-blueprint' },
      { btn: 'innov-tab-market', panel: 'innov-panel-market' },
      { btn: 'innov-tab-personas', panel: 'innov-panel-personas' },
      { btn: 'innov-tab-features', panel: 'innov-panel-features' },
      { btn: 'innov-tab-ux-tech', panel: 'innov-panel-ux-tech' },
      { btn: 'innov-tab-roadmap', panel: 'innov-panel-roadmap' },
    ];

    innovTabs.forEach((tab) => {
      const b = document.getElementById(tab.btn);
      if (b) {
        b.addEventListener('click', () => {
          innovTabs.forEach((t) => {
            const btnEl = document.getElementById(t.btn);
            const panelEl = document.getElementById(t.panel);
            if (btnEl) {
              btnEl.style.background = '#1e293b';
              btnEl.style.color = '#94a3b8';
            }
            if (panelEl) panelEl.classList.add('hidden');
          });
          b.style.background = '#14b8a6';
          b.style.color = '#fff';
          const targetPanel = document.getElementById(tab.panel);
          if (targetPanel) targetPanel.classList.remove('hidden');
        });
      }
    });

    // 1. Full Blueprint Synthesis
    const genBpBtn = document.getElementById('innov-generate-bp-btn');
    const bpResult = document.getElementById('innov-bp-result');

    if (genBpBtn && bpResult) {
      genBpBtn.addEventListener('click', async () => {
        try {
          const title = (document.getElementById('innov-bp-title')?.value || '').trim() || 'JARVIS Cloud OS';
          const idea = (document.getElementById('innov-bp-idea')?.value || '').trim() || 'Autonomous AI Platform';
          const category = document.getElementById('innov-bp-category')?.value || 'ai_devtools';
          const scaleTier = document.getElementById('innov-bp-tier')?.value || 'starter';

          bpResult.innerHTML = '<span style="color: #14b8a6;">Synthesizing 12-stage venture architecture with deterministic RICE & PMF scoring...</span>';

          const res = await fetch('/api/jarvis/innovation/blueprint', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({ title, idea, category, scaleTier }),
          });
          const data = await res.json();
          if (!data.success) {
            bpResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }

          const bp = data.data;
          const viabilityColor = bp.viability.overallScorePercent >= 80 ? '#10b981' : '#f59e0b';

          bpResult.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 0.75rem; margin-bottom: 0.75rem;">
              <div>
                <h3 style="margin: 0; color: #14b8a6; font-size: 1.25rem;">${bp.productName}</h3>
                <div style="font-size: 0.85rem; color: #94a3b8;">${bp.tagline}</div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 0.8rem; color: #94a3b8;">PMF Viability Score</div>
                <div style="font-size: 1.5rem; font-weight: bold; color: ${viabilityColor};">${bp.viability.overallScorePercent}%</div>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 1rem;">
              <div style="background: #1e293b; padding: 0.75rem; border-radius: 6px;">
                <div style="font-size: 0.75rem; color: #94a3b8;">TAM Sizing</div>
                <div style="font-size: 0.85rem; font-weight: bold; color: #38bdf8;">${bp.marketResearch.tamSamSom.tam.split(' ')[0]}</div>
              </div>
              <div style="background: #1e293b; padding: 0.75rem; border-radius: 6px;">
                <div style="font-size: 0.75rem; color: #94a3b8;">Target ICPs</div>
                <div style="font-size: 0.85rem; font-weight: bold; color: #c084fc;">${bp.targetPersonas.length} Archetypes</div>
              </div>
              <div style="background: #1e293b; padding: 0.75rem; border-radius: 6px;">
                <div style="font-size: 0.75rem; color: #94a3b8;">Agile Timeline</div>
                <div style="font-size: 0.85rem; font-weight: bold; color: #10b981;">${bp.roadmap.totalEstimatedWeeks} Weeks (5 Sprints)</div>
              </div>
            </div>

            <div style="margin-bottom: 0.75rem;">
              <strong style="color: #f8fafc; font-size: 0.85rem;">Top Must-Have Feature (RICE Prioritized):</strong>
              <div style="background: #1e293b; padding: 0.5rem; border-radius: 4px; font-size: 0.85rem; color: #cbd5e1; margin-top: 0.25rem;">
                <span style="color: #14b8a6; font-weight: bold;">[${bp.features[0]?.category.toUpperCase()}]</span> ${bp.features[0]?.name} &mdash; <em>RICE Score: ${bp.features[0]?.rice.score}</em>
              </div>
            </div>

            <div style="font-size: 0.8rem; color: #94a3b8;">
              Blueprint ID: <code>${bp.id}</code> &bull; Tech Stack: <strong>${bp.technicalBlueprint.techStack.frontend.split(' ')[0]} / ${bp.technicalBlueprint.techStack.backend.split(' ')[0]}</strong>
            </div>
          `;
        } catch (err) {
          bpResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    // 2. Market Research Tab
    const runMarketBtn = document.getElementById('innov-run-market-btn');
    const marketResult = document.getElementById('innov-market-result');

    if (runMarketBtn && marketResult) {
      runMarketBtn.addEventListener('click', async () => {
        try {
          const idea = (document.getElementById('innov-bp-idea')?.value || '').trim() || 'Autonomous AI Platform';
          const category = document.getElementById('innov-bp-category')?.value || 'ai_devtools';

          marketResult.innerHTML = '<span style="color: #14b8a6;">Estimating TAM/SAM/SOM and competitor matrix...</span>';

          const res = await fetch('/api/jarvis/innovation/research', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({ idea, category }),
          });
          const data = await res.json();
          if (!data.success) {
            marketResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }

          const m = data.data;
          const compsHtml = m.competitors.map((c) => `
            <div style="background: #1e293b; padding: 0.6rem; border-radius: 6px; margin-bottom: 0.4rem;">
              <strong style="color: #38bdf8;">${c.name}</strong><br/>
              <span style="font-size: 0.8rem; color: #cbd5e1;">Moat: ${c.differentiation}</span>
            </div>
          `).join('');

          marketResult.innerHTML = `
            <div style="margin-bottom: 0.75rem;">
              <div style="font-size: 0.85rem; color: #94a3b8;">TAM: <strong style="color: #10b981;">${m.tamSamSom.tam}</strong></div>
              <div style="font-size: 0.85rem; color: #94a3b8;">SAM: <strong style="color: #38bdf8;">${m.tamSamSom.sam}</strong></div>
              <div style="font-size: 0.85rem; color: #94a3b8;">SOM: <strong style="color: #c084fc;">${m.tamSamSom.som}</strong></div>
            </div>
            <h4 style="margin: 0.5rem 0; color: #14b8a6; font-size: 0.9rem;">Competitor Differentiation Matrix</h4>
            ${compsHtml}
          `;
        } catch (err) {
          marketResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    // 3. User Personas Tab
    const runPersonasBtn = document.getElementById('innov-run-personas-btn');
    const personasResult = document.getElementById('innov-personas-result');

    if (runPersonasBtn && personasResult) {
      runPersonasBtn.addEventListener('click', async () => {
        try {
          const idea = (document.getElementById('innov-bp-idea')?.value || '').trim() || 'Autonomous AI Platform';
          personasResult.innerHTML = '<span style="color: #14b8a6;">Synthesizing ICP archetypes and JTBD...</span>';

          const res = await fetch('/api/jarvis/innovation/personas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({ idea, count: 2 }),
          });
          const data = await res.json();
          if (!data.success) {
            personasResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }

          const personas = data.data;
          const html = personas.map((p) => `
            <div style="background: #1e293b; padding: 0.75rem; border-radius: 6px; margin-bottom: 0.5rem;">
              <div style="display: flex; justify-content: space-between;">
                <strong style="color: #14b8a6;">${p.name}</strong>
                <span class="badge" style="background: #0f172a; color: #38bdf8;">${p.role}</span>
              </div>
              <div style="font-size: 0.8rem; color: #94a3b8; margin: 0.25rem 0;">${p.archetype} &bull; Willingness to Pay: <strong>${p.willingnessToPay.toUpperCase()}</strong></div>
              <div style="font-size: 0.8rem; color: #cbd5e1; font-style: italic; margin-top: 0.25rem;">${p.quote}</div>
            </div>
          `).join('');

          personasResult.innerHTML = html;
        } catch (err) {
          personasResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    // 4. Features Prioritization Tab
    const runFeaturesBtn = document.getElementById('innov-run-features-btn');
    const featuresResult = document.getElementById('innov-features-result');

    if (runFeaturesBtn && featuresResult) {
      runFeaturesBtn.addEventListener('click', async () => {
        try {
          featuresResult.innerHTML = '<span style="color: #14b8a6;">Evaluating RICE scores and MoSCoW buckets...</span>';

          const res = await fetch('/api/jarvis/innovation/features', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({
              features: [
                { name: 'Core Pipeline', description: 'Engine runner', reach: 9, impact: 5, confidence: 0.9, effort: 4 },
                { name: 'Security Guardian', description: 'RBAC and threat gate', reach: 8, impact: 4, confidence: 0.85, effort: 4 },
                { name: 'Web Cockpit', description: 'Telemetry UI', reach: 8, impact: 4, confidence: 0.8, effort: 3 },
                { name: 'API Hooks', description: 'REST webhooks', reach: 7, impact: 3, confidence: 0.8, effort: 3 },
              ],
            }),
          });
          const data = await res.json();
          if (!data.success) {
            featuresResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }

          const features = data.data;
          const rows = features.map((f) => `
            <tr style="border-bottom: 1px solid #334155;">
              <td style="padding: 0.4rem; color: #14b8a6; font-weight: bold;">[${f.category.toUpperCase()}]</td>
              <td style="padding: 0.4rem; color: #f8fafc;">${f.name}</td>
              <td style="padding: 0.4rem; color: #38bdf8;">${f.rice.score}</td>
              <td style="padding: 0.4rem; color: #94a3b8;">${f.complexity}</td>
            </tr>
          `).join('');

          featuresResult.innerHTML = `
            <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
              <thead>
                <tr style="border-bottom: 2px solid #334155; text-align: left; color: #94a3b8;">
                  <th style="padding: 0.4rem;">MoSCoW</th>
                  <th style="padding: 0.4rem;">Feature</th>
                  <th style="padding: 0.4rem;">RICE Score</th>
                  <th style="padding: 0.4rem;">Complexity</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          `;
        } catch (err) {
          featuresResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    // 5. UX & Architecture Tab
    const runJourneyBtn = document.getElementById('innov-run-journey-btn');
    const runTechBtn = document.getElementById('innov-run-tech-btn');
    const uxTechResult = document.getElementById('innov-ux-tech-result');

    if (runJourneyBtn && uxTechResult) {
      runJourneyBtn.addEventListener('click', async () => {
        try {
          const idea = (document.getElementById('innov-bp-idea')?.value || '').trim() || 'Autonomous AI Platform';
          uxTechResult.innerHTML = '<span style="color: #14b8a6;">Mapping 5-stage UX Journey...</span>';

          const res = await fetch('/api/jarvis/innovation/journey', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({ idea }),
          });
          const data = await res.json();
          if (!data.success) {
            uxTechResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }

          const steps = data.data;
          const html = steps.map((s) => `
            <div style="background: #1e293b; padding: 0.6rem; border-radius: 6px; margin-bottom: 0.4rem;">
              <div style="display: flex; justify-content: space-between;">
                <strong style="color: #14b8a6;">Stage ${s.stepNumber}: ${s.stage}</strong>
                <span style="font-size: 0.75rem; color: #38bdf8;">Mood: ${s.emotionalState}</span>
              </div>
              <div style="font-size: 0.8rem; color: #cbd5e1; margin-top: 0.2rem;">Wireframe: <em>${s.wireframeCue}</em></div>
            </div>
          `).join('');

          uxTechResult.innerHTML = html;
        } catch (err) {
          uxTechResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    if (runTechBtn && uxTechResult) {
      runTechBtn.addEventListener('click', async () => {
        try {
          const idea = (document.getElementById('innov-bp-idea')?.value || '').trim() || 'Autonomous AI Platform';
          uxTechResult.innerHTML = '<span style="color: #38bdf8;">Generating technical architecture blueprint...</span>';

          const res = await fetch('/api/jarvis/innovation/technical', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({ idea, scaleTier: 'starter' }),
          });
          const data = await res.json();
          if (!data.success) {
            uxTechResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }

          const t = data.data;
          uxTechResult.innerHTML = `
            <div style="background: #1e293b; padding: 0.75rem; border-radius: 6px; margin-bottom: 0.5rem;">
              <strong style="color: #38bdf8;">Architecture: ${t.architectureType}</strong>
              <div style="font-size: 0.8rem; color: #cbd5e1; margin-top: 0.25rem;">
                Frontend: ${t.techStack.frontend}<br/>
                Backend: ${t.techStack.backend}<br/>
                Database: ${t.techStack.database}
              </div>
            </div>
            <div style="font-size: 0.8rem; color: #94a3b8;">
              REST Endpoints: <strong>${t.apiEndpoints.length}</strong> | Data Schemas: <strong>${t.dataModels.length}</strong>
            </div>
          `;
        } catch (err) {
          uxTechResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    // 6. Roadmap & Viability Tab
    const runRoadmapBtn = document.getElementById('innov-run-roadmap-btn');
    const runViabilityBtn = document.getElementById('innov-run-viability-btn');
    const roadmapResult = document.getElementById('innov-roadmap-result');

    if (runRoadmapBtn && roadmapResult) {
      runRoadmapBtn.addEventListener('click', async () => {
        try {
          const title = (document.getElementById('innov-bp-title')?.value || '').trim() || 'JARVIS Venture';
          roadmapResult.innerHTML = '<span style="color: #14b8a6;">Planning 5-sprint agile roadmap...</span>';

          const res = await fetch('/api/jarvis/innovation/roadmap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({ title }),
          });
          const data = await res.json();
          if (!data.success) {
            roadmapResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }

          const r = data.data;
          const sprintsHtml = r.sprints.map((s) => `
            <div style="background: #1e293b; padding: 0.6rem; border-radius: 6px; margin-bottom: 0.4rem;">
              <div style="display: flex; justify-content: space-between;">
                <strong style="color: #14b8a6;">${s.title}</strong>
                <span class="badge" style="background: #0f172a; color: ${s.riskLevel === 'HIGH' ? '#ef4444' : s.riskLevel === 'MEDIUM' ? '#f59e0b' : '#10b981'};">${s.riskLevel} RISK</span>
              </div>
              <div style="font-size: 0.8rem; color: #cbd5e1; margin-top: 0.2rem;">Goal: ${s.goal}</div>
            </div>
          `).join('');

          roadmapResult.innerHTML = `
            <div style="margin-bottom: 0.5rem; font-size: 0.85rem; color: #94a3b8;">
              Total Estimated Duration: <strong style="color: #10b981;">${r.totalEstimatedWeeks} Weeks</strong> across ${r.sprints.length} Sprints
            </div>
            ${sprintsHtml}
          `;
        } catch (err) {
          roadmapResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    if (runViabilityBtn && roadmapResult) {
      runViabilityBtn.addEventListener('click', async () => {
        try {
          const idea = (document.getElementById('innov-bp-idea')?.value || '').trim() || 'Autonomous AI Platform';
          roadmapResult.innerHTML = '<span style="color: #a855f7;">Calculating PMF viability score...</span>';

          const res = await fetch('/api/jarvis/innovation/viability', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({ idea }),
          });
          const data = await res.json();
          if (!data.success) {
            roadmapResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
            return;
          }

          const v = data.data;
          roadmapResult.innerHTML = `
            <div style="text-align: center; margin-bottom: 0.75rem;">
              <div style="font-size: 0.85rem; color: #94a3b8;">Overall PMF Viability</div>
              <div style="font-size: 2rem; font-weight: bold; color: #10b981;">${v.overallScorePercent}%</div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-bottom: 0.75rem;">
              <div style="background: #1e293b; padding: 0.5rem; border-radius: 4px; text-align: center;">
                <div style="font-size: 0.7rem; color: #94a3b8;">Market</div>
                <div style="font-weight: bold; color: #38bdf8;">${v.marketOpportunityScore}%</div>
              </div>
              <div style="background: #1e293b; padding: 0.5rem; border-radius: 4px; text-align: center;">
                <div style="font-size: 0.7rem; color: #94a3b8;">Feasibility</div>
                <div style="font-weight: bold; color: #10b981;">${v.technicalFeasibilityScore}%</div>
              </div>
              <div style="background: #1e293b; padding: 0.5rem; border-radius: 4px; text-align: center;">
                <div style="font-size: 0.7rem; color: #94a3b8;">Defensibility</div>
                <div style="font-weight: bold; color: #c084fc;">${v.competitiveDefensibilityScore}%</div>
              </div>
            </div>
            <div style="font-size: 0.8rem; color: #cbd5e1;">
              <strong>Strategic Advantage:</strong> ${v.keyStrengths[0] || 'Modularity and built-in security'}
            </div>
          `;
        } catch (err) {
          roadmapResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }
  }

  // Start
  initSession();
});

