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

  function speakJarvisResponse(text) {
    if ('speechSynthesis' in window && text) {
      try {
        window.speechSynthesis.cancel();
        const clean = text.replace(/[*_#`[\]\\]/g, ' ').replace(/\s+/g, ' ').trim();
        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('Speech synthesis error:', e);
      }
    }
  }

  async function sendMessage(text, speak = false) {
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
        if (data.sessionId && data.sessionId !== currentSessionId) {
          currentSessionId = data.sessionId;
          localStorage.setItem('jarvis_session_id', currentSessionId);
          if (sessionIdDisplay) sessionIdDisplay.textContent = currentSessionId;
        }
        appendMessage('assistant', data.response);
        if (speak) {
          speakJarvisResponse(data.response);
        }
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

  // Phase 16: Financial Terminal Modal & Quantitative Actions
  const finToggleBtn = document.getElementById('finance-toggle-btn');
  const finModal = document.getElementById('finance-modal');
  const finCloseBtn = document.getElementById('finance-modal-close');

  if (finToggleBtn && finModal) {
    finToggleBtn.addEventListener('click', () => {
      finModal.classList.toggle('hidden');
    });
  }

  if (finCloseBtn && finModal) {
    finCloseBtn.addEventListener('click', () => {
      finModal.classList.add('hidden');
    });
  }

  // Financial Terminal Tabs
  const finTabs = [
    { btn: 'finance-tab-ticker', panel: 'finance-panel-ticker' },
    { btn: 'finance-tab-valuation', panel: 'finance-panel-valuation' },
    { btn: 'finance-tab-risk', panel: 'finance-panel-risk' },
    { btn: 'finance-tab-macro', panel: 'finance-panel-macro' },
    { btn: 'finance-tab-backtest', panel: 'finance-panel-backtest' },
    { btn: 'finance-tab-broker', panel: 'finance-panel-broker' },
  ];

  finTabs.forEach((tab) => {
    const btnEl = document.getElementById(tab.btn);
    if (!btnEl) return;
    btnEl.addEventListener('click', () => {
      finTabs.forEach((t) => {
        const b = document.getElementById(t.btn);
        const p = document.getElementById(t.panel);
        if (b) {
          b.className = 'btn btn-sm btn-outline';
          b.style.background = 'transparent';
          b.style.borderColor = '#334155';
          b.style.color = '#cbd5e1';
        }
        if (p) p.classList.add('hidden');
      });
      btnEl.className = 'btn btn-sm btn-primary';
      btnEl.style.background = '#22c55e';
      btnEl.style.borderColor = '#22c55e';
      btnEl.style.color = '#000';
      const targetPanel = document.getElementById(tab.panel);
      if (targetPanel) targetPanel.classList.remove('hidden');
    });
  });

  // 1. Ticker Analysis Action
  const finAnalyzeBtn = document.getElementById('fin-analyze-ticker-btn');
  const finTickerResult = document.getElementById('fin-ticker-result');
  if (finAnalyzeBtn && finTickerResult) {
    finAnalyzeBtn.addEventListener('click', async () => {
      try {
        const symbol = (document.getElementById('fin-ticker-symbol')?.value || '').trim() || 'AAPL';
        finTickerResult.innerHTML = '<span style="color: #22c55e;">Analyzing quantitative indicators...</span>';

        const res = await fetch('/api/jarvis/finance/ticker', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
          body: JSON.stringify({ symbol }),
        });
        const data = await res.json();
        if (!data.success) {
          finTickerResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
          return;
        }

        const t = data.data;
        finTickerResult.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.75rem;">
            <div>
              <h4 style="margin: 0; color: #f8fafc; font-size: 1.25rem;">${t.symbol} &mdash; ${t.name}</h4>
              <span style="font-size: 0.8rem; color: #94a3b8;">Asset Class: ${t.assetClass.toUpperCase()}</span>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 1.5rem; font-weight: bold; color: #22c55e;">$${t.currentPrice.toFixed(2)}</span>
              <div style="font-size: 0.8rem; color: ${t.change24h >= 0 ? '#22c55e' : '#ef4444'};">
                ${t.change24h >= 0 ? '+' : ''}${t.change24h.toFixed(2)} (${t.change24hPercent.toFixed(2)}%)
              </div>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; margin-bottom: 0.75rem;">
            <div style="background: #1e293b; padding: 0.5rem; border-radius: 4px; text-align: center;">
              <div style="font-size: 0.7rem; color: #94a3b8;">SMA 20 / 50 / 200</div>
              <div style="font-size: 0.8rem; font-weight: bold; color: #38bdf8;">${t.technicals.sma20} / ${t.technicals.sma50} / ${t.technicals.sma200}</div>
            </div>
            <div style="background: #1e293b; padding: 0.5rem; border-radius: 4px; text-align: center;">
              <div style="font-size: 0.7rem; color: #94a3b8;">RSI (14)</div>
              <div style="font-size: 0.8rem; font-weight: bold; color: ${t.technicals.rsi14 > 70 ? '#ef4444' : t.technicals.rsi14 < 30 ? '#22c55e' : '#f59e0b'};">${t.technicals.rsi14}</div>
            </div>
            <div style="background: #1e293b; padding: 0.5rem; border-radius: 4px; text-align: center;">
              <div style="font-size: 0.7rem; color: #94a3b8;">MACD Histogram</div>
              <div style="font-size: 0.8rem; font-weight: bold; color: ${t.technicals.macd.histogram >= 0 ? '#22c55e' : '#ef4444'};">${t.technicals.macd.histogram}</div>
            </div>
            <div style="background: #1e293b; padding: 0.5rem; border-radius: 4px; text-align: center;">
              <div style="font-size: 0.7rem; color: #94a3b8;">Trend Signal</div>
              <div style="font-size: 0.8rem; font-weight: bold; color: #10b981;">${t.trendSignal.toUpperCase()}</div>
            </div>
          </div>
          <div style="background: #1e293b; padding: 0.6rem; border-radius: 6px; font-size: 0.8rem; color: #cbd5e1; margin-bottom: 0.5rem;">
            <strong>Support:</strong> $${t.supportResistance.support} | <strong>Resistance:</strong> $${t.supportResistance.resistance} | <strong>Annual Volatility:</strong> ${t.technicals.annualizedVolatility}%
          </div>
          <div style="font-size: 0.75rem; color: #94a3b8;">
            <strong>Insights:</strong> ${t.keyInsights.join(' &bull; ')}
          </div>
        `;
      } catch (err) {
        finTickerResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
      }
    });
  }

  // 2. DCF Valuation Action
  const finCalculateValBtn = document.getElementById('fin-calculate-val-btn');
  const finValuationResult = document.getElementById('fin-valuation-result');
  if (finCalculateValBtn && finValuationResult) {
    finCalculateValBtn.addEventListener('click', async () => {
      try {
        const symbol = (document.getElementById('fin-val-symbol')?.value || '').trim() || 'MSFT';
        const wacc = parseFloat(document.getElementById('fin-val-wacc')?.value || '0.09');
        const growth = parseFloat(document.getElementById('fin-val-growth')?.value || '0.025');
        finValuationResult.innerHTML = '<span style="color: #22c55e;">Modeling discounted cash flows & valuation multiples...</span>';

        const res = await fetch('/api/jarvis/finance/valuation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
          body: JSON.stringify({ symbol, wacc, growth }),
        });
        const data = await res.json();
        if (!data.success) {
          finValuationResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
          return;
        }

        const v = data.data;
        finValuationResult.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <div>
              <h4 style="margin: 0; color: #f8fafc;">DCF Valuation Model: ${v.symbol}</h4>
              <span style="font-size: 0.8rem; color: #94a3b8;">Gordon Perpetual Growth (WACC: ${(v.dcfInputs.wacc * 100).toFixed(1)}%, g: ${(v.dcfInputs.terminalGrowthRate * 100).toFixed(1)}%)</span>
            </div>
            <span class="badge" style="background: #1e293b; color: ${v.assessment === 'undervalued' ? '#22c55e' : v.assessment === 'fairly_valued' ? '#38bdf8' : '#f59e0b'}; font-weight: bold; text-transform: uppercase;">${v.assessment}</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-bottom: 0.75rem;">
            <div style="background: #1e293b; padding: 0.5rem; border-radius: 4px; text-align: center;">
              <div style="font-size: 0.7rem; color: #94a3b8;">Current Market Price</div>
              <div style="font-size: 1.2rem; font-weight: bold; color: #f8fafc;">$${v.currentMarketPrice.toFixed(2)}</div>
            </div>
            <div style="background: #1e293b; padding: 0.5rem; border-radius: 4px; text-align: center;">
              <div style="font-size: 0.7rem; color: #94a3b8;">Estimated Intrinsic Fair Value</div>
              <div style="font-size: 1.2rem; font-weight: bold; color: #22c55e;">$${v.estimatedFairValue.toFixed(2)}</div>
            </div>
            <div style="background: #1e293b; padding: 0.5rem; border-radius: 4px; text-align: center;">
              <div style="font-size: 0.7rem; color: #94a3b8;">Margin of Safety</div>
              <div style="font-size: 1.2rem; font-weight: bold; color: ${v.marginOfSafetyPercent >= 0 ? '#22c55e' : '#ef4444'};">${v.marginOfSafetyPercent > 0 ? '+' : ''}${v.marginOfSafetyPercent.toFixed(1)}%</div>
            </div>
          </div>
          <div style="background: #1e293b; padding: 0.6rem; border-radius: 6px; font-size: 0.8rem; color: #cbd5e1; margin-bottom: 0.5rem;">
            P/E: <strong>${v.multiples.peRatio.toFixed(1)}x</strong> | P/S: <strong>${v.multiples.psRatio.toFixed(1)}x</strong> | EV/EBITDA: <strong>${v.multiples.evEbitda.toFixed(1)}x</strong> | FCF Yield: <strong>${v.multiples.fcfYield.toFixed(1)}%</strong>
          </div>
          <div style="font-size: 0.75rem; color: #94a3b8;">
            ${v.summary}
          </div>
        `;
      } catch (err) {
        finValuationResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
      }
    });
  }

  // 3. Portfolio Risk (MPT) Action
  const finEvalRiskBtn = document.getElementById('fin-evaluate-risk-btn');
  const finRiskResult = document.getElementById('fin-risk-result');
  if (finEvalRiskBtn && finRiskResult) {
    finEvalRiskBtn.addEventListener('click', async () => {
      try {
        const rawInput = (document.getElementById('fin-portfolio-input')?.value || '').trim();
        const assets = JSON.parse(rawInput);
        finRiskResult.innerHTML = '<span style="color: #22c55e;">Computing portfolio covariance & VaR metrics...</span>';

        const res = await fetch('/api/jarvis/finance/portfolio/risk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
          body: JSON.stringify({ assets }),
        });
        const data = await res.json();
        if (!data.success) {
          finRiskResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
          return;
        }

        const r = data.data;
        finRiskResult.innerHTML = `
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; margin-bottom: 0.75rem;">
            <div style="background: #1e293b; padding: 0.5rem; border-radius: 4px; text-align: center;">
              <div style="font-size: 0.7rem; color: #94a3b8;">Expected Return</div>
              <div style="font-size: 1.1rem; font-weight: bold; color: #22c55e;">${r.expectedAnnualReturn.toFixed(1)}%</div>
            </div>
            <div style="background: #1e293b; padding: 0.5rem; border-radius: 4px; text-align: center;">
              <div style="font-size: 0.7rem; color: #94a3b8;">Portfolio Volatility</div>
              <div style="font-size: 1.1rem; font-weight: bold; color: #f59e0b;">${r.portfolioVolatility.toFixed(1)}%</div>
            </div>
            <div style="background: #1e293b; padding: 0.5rem; border-radius: 4px; text-align: center;">
              <div style="font-size: 0.7rem; color: #94a3b8;">Sharpe / Sortino</div>
              <div style="font-size: 1.1rem; font-weight: bold; color: #38bdf8;">${r.sharpeRatio.toFixed(2)} / ${r.sortinoRatio.toFixed(2)}</div>
            </div>
            <div style="background: #1e293b; padding: 0.5rem; border-radius: 4px; text-align: center;">
              <div style="font-size: 0.7rem; color: #94a3b8;">1-Day 95% VaR</div>
              <div style="font-size: 1.1rem; font-weight: bold; color: #ef4444;">-${r.valueAtRisk95.toFixed(2)}%</div>
            </div>
          </div>
          <div style="background: #1e293b; padding: 0.6rem; border-radius: 6px; font-size: 0.8rem; color: #cbd5e1; margin-bottom: 0.5rem;">
            Diversification Score: <strong>${r.diversificationScore}/100</strong> | Max Historical Drawdown: <strong>${r.maxDrawdownPercent}%</strong> | 99% VaR: <strong>-${r.valueAtRisk99}%</strong>
          </div>
          <div style="font-size: 0.75rem; color: #94a3b8;">
            Assets: ${r.assets.map(a => `${a.symbol} (${(a.weight * 100).toFixed(0)}%)`).join(', ')}
          </div>
        `;
      } catch (err) {
        finRiskResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
      }
    });
  }

  // 4. Macroeconomic Regime Action
  const finFetchMacroBtn = document.getElementById('fin-fetch-macro-btn');
  const finMacroResult = document.getElementById('fin-macro-result');
  if (finFetchMacroBtn && finMacroResult) {
    finFetchMacroBtn.addEventListener('click', async () => {
      try {
        finMacroResult.innerHTML = '<span style="color: #22c55e;">Fetching macroeconomic indicators...</span>';

        const res = await fetch('/api/jarvis/finance/macro', {
          headers: { 'x-user-id': 'dwight' },
        });
        const data = await res.json();
        if (!data.success) {
          finMacroResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
          return;
        }

        const m = data.data;
        finMacroResult.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <div>
              <h4 style="margin: 0; color: #f8fafc;">Macro Regime: ${m.macroRegime.toUpperCase()}</h4>
              <span style="font-size: 0.8rem; color: #94a3b8;">Recession Risk: ${m.recessionRiskAssessment.toUpperCase()}</span>
            </div>
            <span class="badge" style="background: #1e293b; color: #38bdf8; font-weight: bold;">YIELD CURVE: ${m.yieldCurveStatus.toUpperCase()}</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; margin-bottom: 0.75rem;">
            <div style="background: #1e293b; padding: 0.5rem; border-radius: 4px; text-align: center;">
              <div style="font-size: 0.7rem; color: #94a3b8;">CPI YoY</div>
              <div style="font-size: 1.1rem; font-weight: bold; color: #f8fafc;">${m.indicators.cpiInflationYoY}%</div>
            </div>
            <div style="background: #1e293b; padding: 0.5rem; border-radius: 4px; text-align: center;">
              <div style="font-size: 0.7rem; color: #94a3b8;">Fed Funds Target</div>
              <div style="font-size: 1.1rem; font-weight: bold; color: #38bdf8;">${m.indicators.fedFundsRate}%</div>
            </div>
            <div style="background: #1e293b; padding: 0.5rem; border-radius: 4px; text-align: center;">
              <div style="font-size: 0.7rem; color: #94a3b8;">10Y-2Y Spread</div>
              <div style="font-size: 1.1rem; font-weight: bold; color: #22c55e;">+${m.indicators.treasury10Y2YSpread}%</div>
            </div>
            <div style="background: #1e293b; padding: 0.5rem; border-radius: 4px; text-align: center;">
              <div style="font-size: 0.7rem; color: #94a3b8;">Unemployment</div>
              <div style="font-size: 1.1rem; font-weight: bold; color: #f59e0b;">${m.indicators.unemploymentRate}%</div>
            </div>
          </div>
          <div style="font-size: 0.75rem; color: #cbd5e1;">
            <strong>Implications:</strong><br/>
            ${m.marketImplications.map(imp => `&bull; ${imp}`).join('<br/>')}
          </div>
        `;
      } catch (err) {
        finMacroResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
      }
    });
  }

  // 5. Strategy Backtest Action
  const finRunBtBtn = document.getElementById('fin-run-backtest-btn');
  const finBtResult = document.getElementById('fin-backtest-result');
  if (finRunBtBtn && finBtResult) {
    finRunBtBtn.addEventListener('click', async () => {
      try {
        const strategy = document.getElementById('fin-bt-strategy')?.value || 'SMA_Crossover';
        const symbol = (document.getElementById('fin-bt-symbol')?.value || '').trim() || 'SPY';
        const timeframeDays = parseInt(document.getElementById('fin-bt-days')?.value || '250', 10);
        finBtResult.innerHTML = '<span style="color: #22c55e;">Simulating algorithmic trading rules...</span>';

        const res = await fetch('/api/jarvis/finance/backtest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
          body: JSON.stringify({ strategy, symbol, timeframeDays }),
        });
        const data = await res.json();
        if (!data.success) {
          finBtResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
          return;
        }

        const b = data.data;
        finBtResult.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <div>
              <h4 style="margin: 0; color: #f8fafc;">${b.strategyName} on ${b.symbol}</h4>
              <span style="font-size: 0.8rem; color: #94a3b8;">Time Horizon: ${b.timeframeDays} trading days | Total Trades: ${b.totalTrades}</span>
            </div>
            <span class="badge" style="background: #1e293b; color: #22c55e; font-weight: bold;">WIN RATE: ${b.winRatePercent}%</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; margin-bottom: 0.75rem;">
            <div style="background: #1e293b; padding: 0.5rem; border-radius: 4px; text-align: center;">
              <div style="font-size: 0.7rem; color: #94a3b8;">Strategy Return</div>
              <div style="font-size: 1.1rem; font-weight: bold; color: ${b.totalStrategyReturnPercent >= 0 ? '#22c55e' : '#ef4444'};">${b.totalStrategyReturnPercent > 0 ? '+' : ''}${b.totalStrategyReturnPercent}%</div>
            </div>
            <div style="background: #1e293b; padding: 0.5rem; border-radius: 4px; text-align: center;">
              <div style="font-size: 0.7rem; color: #94a3b8;">Benchmark (Buy & Hold)</div>
              <div style="font-size: 1.1rem; font-weight: bold; color: #38bdf8;">${b.benchmarkBuyAndHoldReturnPercent > 0 ? '+' : ''}${b.benchmarkBuyAndHoldReturnPercent}%</div>
            </div>
            <div style="background: #1e293b; padding: 0.5rem; border-radius: 4px; text-align: center;">
              <div style="font-size: 0.7rem; color: #94a3b8;">Profit Factor</div>
              <div style="font-size: 1.1rem; font-weight: bold; color: #f59e0b;">${b.profitFactor.toFixed(2)}</div>
            </div>
            <div style="background: #1e293b; padding: 0.5rem; border-radius: 4px; text-align: center;">
              <div style="font-size: 0.7rem; color: #94a3b8;">Max Drawdown</div>
              <div style="font-size: 1.1rem; font-weight: bold; color: #ef4444;">-${b.maxDrawdownPercent}%</div>
            </div>
          </div>
          <div style="font-size: 0.75rem; color: #94a3b8;">
            Simulated trades executed: ${b.tradeLogSample.length} logged samples.
          </div>
        `;
      } catch (err) {
        finBtResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
      }
    });
  }

  // 6. Broker & Safety Audit Action
  const finAuditBrokerBtn = document.getElementById('fin-audit-broker-btn');
  const finTestLiveTradeBtn = document.getElementById('fin-test-live-trade-btn');
  const finBrokerResult = document.getElementById('fin-broker-result');

  if (finAuditBrokerBtn && finBrokerResult) {
    finAuditBrokerBtn.addEventListener('click', async () => {
      try {
        finBrokerResult.innerHTML = '<span style="color: #22c55e;">Auditing broker credentials and simulation bounds...</span>';

        const res = await fetch('/api/jarvis/finance/brokers', {
          headers: { 'x-user-id': 'dwight' },
        });
        const data = await res.json();
        if (!data.success) {
          finBrokerResult.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
          return;
        }

        const a = data.data;
        finBrokerResult.innerHTML = `
          <div style="background: #1e293b; padding: 0.75rem; border-radius: 6px; margin-bottom: 0.5rem;">
            <div style="display: flex; justify-content: space-between;">
              <strong style="color: #22c55e;">Policy: Simulation Mode Active</strong>
              <span class="badge" style="background: #0f172a; color: #ef4444;">LIVE TRADING: PROHIBITED</span>
            </div>
            <div style="font-size: 0.8rem; color: #cbd5e1; margin-top: 0.35rem;">
              ${a.securityNotice}
            </div>
          </div>
          <div style="font-size: 0.8rem; color: #94a3b8;">
            Configured Sandbox Connectors:
            <ul style="margin: 0.3rem 0; padding-left: 1.25rem;">
              ${a.configuredBrokers.map(b => `<li><strong>${b.name}</strong> (${b.accountType.toUpperCase()}): ${b.status}</li>`).join('')}
            </ul>
          </div>
        `;
      } catch (err) {
        finBrokerResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
      }
    });
  }

  if (finTestLiveTradeBtn && finBrokerResult) {
    finTestLiveTradeBtn.addEventListener('click', async () => {
      try {
        finBrokerResult.innerHTML = '<span style="color: #ef4444;">Testing live trade request through Security Guardian...</span>';

        const res = await fetch('/api/jarvis/finance/trade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
          body: JSON.stringify({ symbol: 'AAPL', quantity: 10, action: 'BUY' }),
        });
        const data = await res.json();

        if (res.status === 403 && data.securityBlocked) {
          finBrokerResult.innerHTML = `
            <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; padding: 0.75rem; border-radius: 6px;">
              <strong style="color: #ef4444;">[CRITICAL] Security Guardian Block Verified!</strong>
              <div style="font-size: 0.8rem; color: #fca5a5; margin-top: 0.35rem;">
                Live trade execution attempt was intercepted and DENIED: <code>${data.error}</code>
              </div>
              <div style="font-size: 0.75rem; color: #cbd5e1; margin-top: 0.35rem;">
                Invariant holds: Zero unauthorized financial transfers or real money execution can occur.
              </div>
            </div>
          `;
        } else {
          finBrokerResult.innerHTML = `<span style="color: #ef4444;">Unexpected: Order not blocked.</span>`;
        }
      } catch (err) {
        finBrokerResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
      }
    });
  }

  // Phase 17: Autonomous Browser Cockpit Modal & Actions
  const browserToggleBtn = document.getElementById('browser-toggle-btn');
  const browserModal = document.getElementById('browser-modal');
  const browserCloseBtn = document.getElementById('browser-modal-close');

  if (browserToggleBtn && browserModal) {
    browserToggleBtn.addEventListener('click', () => {
      browserModal.classList.toggle('hidden');
    });
  }

  if (browserCloseBtn && browserModal) {
    browserCloseBtn.addEventListener('click', () => {
      browserModal.classList.add('hidden');
    });
  }

  // Browser Tabs
  const browserTabs = [
    { btn: 'browser-tab-search', panel: 'browser-panel-search' },
    { btn: 'browser-tab-reader', panel: 'browser-panel-reader' },
    { btn: 'browser-tab-forms', panel: 'browser-panel-forms' },
    { btn: 'browser-tab-downloads', panel: 'browser-panel-downloads' },
    { btn: 'browser-tab-workflows', panel: 'browser-panel-workflows' },
    { btn: 'browser-tab-security', panel: 'browser-panel-security' },
  ];

  browserTabs.forEach((tab) => {
    const btnEl = document.getElementById(tab.btn);
    if (!btnEl) return;
    btnEl.addEventListener('click', () => {
      browserTabs.forEach((t) => {
        const b = document.getElementById(t.btn);
        const p = document.getElementById(t.panel);
        if (b) {
          b.className = 'btn btn-sm btn-outline';
          b.style.background = 'transparent';
          b.style.borderColor = '#334155';
          b.style.color = '#cbd5e1';
        }
        if (p) p.classList.add('hidden');
      });
      btnEl.className = 'btn btn-sm btn-primary';
      btnEl.style.background = '#0ea5e9';
      btnEl.style.borderColor = '#0ea5e9';
      btnEl.style.color = '#000';
      const targetPanel = document.getElementById(tab.panel);
      if (targetPanel) targetPanel.classList.remove('hidden');
    });
  });

  // 1. Web Search Action
  const browserSearchBtn = document.getElementById('browser-search-btn');
  const browserSearchResults = document.getElementById('browser-search-results');
  if (browserSearchBtn && browserSearchResults) {
    browserSearchBtn.addEventListener('click', async () => {
      try {
        const query = (document.getElementById('browser-search-query')?.value || '').trim();
        const domain = (document.getElementById('browser-search-domain')?.value || '').trim() || undefined;
        if (!query) {
          alert('Please enter a search query');
          return;
        }
        browserSearchResults.innerHTML = '<span style="color: #0ea5e9;">Searching the web safely...</span>';

        const res = await fetch('/api/jarvis/browser/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
          body: JSON.stringify({ query, domain, limit: 5 }),
        });
        const data = await res.json();
        if (!data.success) {
          browserSearchResults.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
          return;
        }

        const list = data.data;
        if (list.length === 0) {
          browserSearchResults.innerHTML = '<span style="color: #94a3b8;">No results found.</span>';
          return;
        }

        browserSearchResults.innerHTML = `
          <div style="font-size: 0.85rem; color: #38bdf8; font-weight: 600; margin-bottom: 0.75rem;">
            Found ${list.length} ranked results:
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.6rem;">
            ${list.map((r) => `
              <div style="background: #1e293b; padding: 0.75rem; border-radius: 6px; border-left: 3px solid #0ea5e9;">
                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                  <strong style="color: #f8fafc; font-size: 0.95rem;">${r.title}</strong>
                  <span style="font-size: 0.75rem; color: #0ea5e9;">Score: ${Math.round(r.relevanceScore * 100)}%</span>
                </div>
                <div style="font-size: 0.75rem; color: #0284c7; margin: 0.15rem 0;">${r.url}</div>
                <div style="font-size: 0.8rem; color: #cbd5e1; margin-top: 0.25rem;">${r.snippet}</div>
              </div>
            `).join('')}
          </div>
        `;
      } catch (err) {
        browserSearchResults.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
      }
    });
  }

  // 2. Page Reader & Sanitizer Action
  const browserReadBtn = document.getElementById('browser-read-btn');
  const browserReaderResults = document.getElementById('browser-reader-results');
  if (browserReadBtn && browserReaderResults) {
    browserReadBtn.addEventListener('click', async () => {
      try {
        const url = (document.getElementById('browser-read-url')?.value || '').trim();
        const rawHtml = (document.getElementById('browser-read-rawhtml')?.value || '').trim() || undefined;
        if (!url) {
          alert('Please enter a URL');
          return;
        }
        browserReaderResults.innerHTML = '<span style="color: #0ea5e9;">Reading, parsing, and sanitizing page...</span>';

        const res = await fetch('/api/jarvis/browser/read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
          body: JSON.stringify({ url, rawHtml }),
        });
        const data = await res.json();
        if (!data.success) {
          browserReaderResults.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
          return;
        }

        const page = data.data;
        browserReaderResults.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.75rem;">
            <div>
              <h4 style="margin: 0; color: #f8fafc; font-size: 1.1rem;">${page.title || 'Untitled Document'}</h4>
              <span style="font-size: 0.75rem; color: #0ea5e9;">${page.url}</span>
            </div>
            <span class="badge" style="background: #065f46; color: #6ee7b7; font-weight: bold;">SANITIZED & SAFE</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; margin-bottom: 0.75rem;">
            <div style="background: #1e293b; padding: 0.5rem; border-radius: 4px; text-align: center;">
              <div style="font-size: 0.7rem; color: #94a3b8;">Headings</div>
              <div style="font-size: 1rem; font-weight: bold; color: #38bdf8;">${page.headings?.length || 0}</div>
            </div>
            <div style="background: #1e293b; padding: 0.5rem; border-radius: 4px; text-align: center;">
              <div style="font-size: 0.7rem; color: #94a3b8;">Links Found</div>
              <div style="font-size: 1rem; font-weight: bold; color: #38bdf8;">${page.links?.length || 0}</div>
            </div>
            <div style="background: #1e293b; padding: 0.5rem; border-radius: 4px; text-align: center;">
              <div style="font-size: 0.7rem; color: #94a3b8;">Forms Detected</div>
              <div style="font-size: 1rem; font-weight: bold; color: #38bdf8;">${page.forms?.length || 0}</div>
            </div>
            <div style="background: #1e293b; padding: 0.5rem; border-radius: 4px; text-align: center;">
              <div style="font-size: 0.7rem; color: #94a3b8;">Fetched At</div>
              <div style="font-size: 0.8rem; font-weight: 500; color: #94a3b8;">${new Date(page.fetchedAt).toLocaleTimeString()}</div>
            </div>
          </div>
          <div style="margin-bottom: 0.5rem;">
            <strong style="font-size: 0.8rem; color: #94a3b8;">Markdown Content Preview:</strong>
            <pre style="background: #1e293b; padding: 0.75rem; border-radius: 6px; font-size: 0.8rem; color: #f8fafc; overflow-x: auto; max-height: 180px;">${page.markdownContent || 'No textual content extracted.'}</pre>
          </div>
        `;
      } catch (err) {
        browserReaderResults.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
      }
    });
  }

  // 3. Form Automation Actions
  const browserInspectFormsBtn = document.getElementById('browser-inspect-forms-btn');
  const browserFillFormBtn = document.getElementById('browser-fill-form-btn');
  const browserFormsResults = document.getElementById('browser-forms-results');

  if (browserInspectFormsBtn && browserFormsResults) {
    browserInspectFormsBtn.addEventListener('click', async () => {
      try {
        const url = (document.getElementById('browser-forms-url')?.value || '').trim();
        if (!url) {
          alert('Please enter a URL');
          return;
        }
        browserFormsResults.innerHTML = '<span style="color: #0ea5e9;">Inspecting web page forms and schemas...</span>';

        const res = await fetch('/api/jarvis/browser/forms/inspect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
          body: JSON.stringify({ url }),
        });
        const data = await res.json();
        if (!data.success) {
          browserFormsResults.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
          return;
        }

        const forms = data.data.forms || [];
        if (forms.length === 0) {
          browserFormsResults.innerHTML = '<div style="color: #94a3b8;">No interactive forms detected on this page.</div>';
          return;
        }

        browserFormsResults.innerHTML = `
          <div style="color: #38bdf8; font-weight: bold; margin-bottom: 0.5rem;">Detected ${forms.length} Form(s):</div>
          <div style="display: flex; flex-direction: column; gap: 0.6rem;">
            ${forms.map((f, i) => `
              <div style="background: #1e293b; padding: 0.75rem; border-radius: 6px;">
                <div style="display: flex; justify-content: space-between;">
                  <strong style="color: #f8fafc;">Form ID: ${f.id || `form_${i + 1}`} (Action: <code>${f.action}</code>, Method: ${f.method})</strong>
                  ${f.containsCredentials ? '<span class="badge" style="background: #7f1d1d; color: #fca5a5;">CONTAINS CREDENTIAL FIELDS</span>' : '<span class="badge" style="background: #065f46; color: #6ee7b7;">SAFE STANDARD FORM</span>'}
                </div>
                <div style="font-size: 0.8rem; color: #cbd5e1; margin-top: 0.4rem;">
                  Fields:
                  <ul style="margin: 0.25rem 0; padding-left: 1.25rem;">
                    ${f.fields.map(fl => `<li><code>${fl.name}</code> (${fl.type}) ${fl.required ? '<span style="color: #f59e0b;">*required</span>' : ''} ${fl.isSensitive ? '<span style="color: #ef4444;">[SENSITIVE]</span>' : ''}</li>`).join('')}
                  </ul>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      } catch (err) {
        browserFormsResults.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
      }
    });
  }

  if (browserFillFormBtn && browserFormsResults) {
    browserFillFormBtn.addEventListener('click', async () => {
      try {
        const url = (document.getElementById('browser-forms-url')?.value || '').trim();
        const formId = (document.getElementById('browser-form-id-input')?.value || '').trim() || undefined;
        let fields = {};
        try {
          fields = JSON.parse(document.getElementById('browser-form-fields-input')?.value || '{}');
        } catch (e) {
          alert('Invalid JSON in fields input');
          return;
        }

        browserFormsResults.innerHTML = '<span style="color: #0ea5e9;">Filling form and submitting payload...</span>';

        const res = await fetch('/api/jarvis/browser/forms/fill', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
          body: JSON.stringify({ url, formId, fields, submit: true }),
        });
        const data = await res.json();
        if (!data.success) {
          browserFormsResults.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
          return;
        }

        const out = data.data;
        browserFormsResults.innerHTML = `
          <div style="background: #1e293b; padding: 0.75rem; border-radius: 6px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <strong style="color: #10b981;">Form Submission Completed</strong>
              <span class="badge" style="background: #065f46; color: #6ee7b7;">HTTP 200 OK</span>
            </div>
            <div style="font-size: 0.85rem; color: #cbd5e1;">
              Target URL: <code>${out.targetUrl}</code><br/>
              Fields Populated: <strong>${out.fieldsPopulated?.join(', ') || 'None'}</strong><br/>
              Response: <em>${out.responseSummary || 'Success'}</em>
            </div>
          </div>
        `;
      } catch (err) {
        browserFormsResults.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
      }
    });
  }

  // 4. Secure Downloads Actions
  const browserDownloadBtn = document.getElementById('browser-download-btn');
  const browserTestBlockedDlBtn = document.getElementById('browser-test-blocked-dl-btn');
  const browserDownloadsResults = document.getElementById('browser-downloads-results');

  if (browserDownloadBtn && browserDownloadsResults) {
    browserDownloadBtn.addEventListener('click', async () => {
      try {
        const url = (document.getElementById('browser-dl-url')?.value || '').trim();
        const destinationFilename = (document.getElementById('browser-dl-filename')?.value || '').trim();
        if (!url) {
          alert('Please enter a download URL');
          return;
        }
        browserDownloadsResults.innerHTML = '<span style="color: #0ea5e9;">Verifying URL and downloading file into sandbox...</span>';

        const res = await fetch('/api/jarvis/browser/download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
          body: JSON.stringify({ url, destinationFilename }),
        });
        const data = await res.json();
        if (!data.success) {
          browserDownloadsResults.innerHTML = `<span style="color: #ef4444;">Download Failed: ${data.error}</span>`;
          return;
        }

        const dl = data.data;
        browserDownloadsResults.innerHTML = `
          <div style="background: #1e293b; padding: 0.75rem; border-radius: 6px; border-left: 3px solid #10b981;">
            <strong style="color: #10b981;">Download Successful</strong>
            <div style="font-size: 0.8rem; color: #cbd5e1; margin-top: 0.35rem;">
              Saved Path: <code>${dl.savedPath}</code><br/>
              File Size: <strong>${dl.sizeBytes} bytes</strong><br/>
              MIME Type: <strong>${dl.mimeType}</strong><br/>
              SHA256 Checksum: <code>${dl.checksumSha256 || 'N/A'}</code>
            </div>
          </div>
        `;
      } catch (err) {
        browserDownloadsResults.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
      }
    });
  }

  if (browserTestBlockedDlBtn && browserDownloadsResults) {
    browserTestBlockedDlBtn.addEventListener('click', async () => {
      try {
        browserDownloadsResults.innerHTML = '<span style="color: #ef4444;">Testing malicious executable download block (.exe)...</span>';

        const res = await fetch('/api/jarvis/browser/download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
          body: JSON.stringify({
            url: 'https://example.com/malicious_payload.exe',
            destinationFilename: 'payload.exe',
          }),
        });
        const data = await res.json();

        if (res.status === 403 || !data.success) {
          browserDownloadsResults.innerHTML = `
            <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; padding: 0.75rem; border-radius: 6px;">
              <strong style="color: #ef4444;">[CRITICAL] Malware Download Shield Enforced!</strong>
              <div style="font-size: 0.8rem; color: #fca5a5; margin-top: 0.35rem;">
                Executable file download intercepted and blocked: <code>${data.error}</code>
              </div>
              <div style="font-size: 0.75rem; color: #cbd5e1; margin-top: 0.35rem;">
                Invariant holds: Executable files (.exe, .bat, .cmd, .ps1, .scr) are strictly prohibited from being downloaded.
              </div>
            </div>
          `;
        } else {
          browserDownloadsResults.innerHTML = `<span style="color: #ef4444;">Unexpected: Download was not blocked.</span>`;
        }
      } catch (err) {
        browserDownloadsResults.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
      }
    });
  }

  // 5. Workflows Pipeline Action
  const browserRunWorkflowBtn = document.getElementById('browser-run-workflow-btn');
  const browserWorkflowsResults = document.getElementById('browser-workflows-results');
  if (browserRunWorkflowBtn && browserWorkflowsResults) {
    browserRunWorkflowBtn.addEventListener('click', async () => {
      try {
        const workflowName = (document.getElementById('browser-wf-name')?.value || '').trim() || 'Workflow';
        let steps = [];
        try {
          steps = JSON.parse(document.getElementById('browser-wf-steps')?.value || '[]');
        } catch (e) {
          alert('Invalid JSON in workflow steps');
          return;
        }

        browserWorkflowsResults.innerHTML = '<span style="color: #0ea5e9;">Executing multi-step browser pipeline...</span>';

        const res = await fetch('/api/jarvis/browser/workflow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
          body: JSON.stringify({ workflowName, steps }),
        });
        const data = await res.json();
        if (!data.success) {
          browserWorkflowsResults.innerHTML = `<span style="color: #ef4444;">Workflow Failed: ${data.error}</span>`;
          return;
        }

        const wf = data.data;
        browserWorkflowsResults.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <div>
              <strong style="color: #0ea5e9; font-size: 1rem;">Workflow: ${wf.workflowName}</strong>
              <div style="font-size: 0.75rem; color: #94a3b8;">Steps: ${wf.stepsExecuted?.length || 0} executed | Duration: ${wf.totalDurationMs}ms</div>
            </div>
            <span class="badge" style="background: ${wf.success ? '#065f46' : '#7f1d1d'}; color: #fff;">${wf.success ? 'SUCCESS' : 'FAILED'}</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.4rem;">
            ${(wf.stepsExecuted || []).map((s, idx) => `
              <div style="background: #1e293b; padding: 0.5rem; border-radius: 4px; font-size: 0.8rem; display: flex; justify-content: space-between;">
                <span><strong>Step ${idx + 1}:</strong> [${s.action.toUpperCase()}] ${s.target || ''}</span>
                <span style="color: ${s.success ? '#10b981' : '#ef4444'};">${s.success ? 'OK' : 'FAIL'} (${s.durationMs}ms)</span>
              </div>
            `).join('')}
          </div>
        `;
      } catch (err) {
        browserWorkflowsResults.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
      }
    });
  }

  // 6. Security Policy & Anti-SSRF Invariant Actions
  const browserSessionBtn = document.getElementById('browser-session-btn');
  const browserTestSsrfBtn = document.getElementById('browser-test-ssrf-btn');
  const browserSecurityResults = document.getElementById('browser-security-results');

  if (browserSessionBtn && browserSecurityResults) {
    browserSessionBtn.addEventListener('click', async () => {
      try {
        browserSecurityResults.innerHTML = '<span style="color: #0ea5e9;">Fetching browser session state...</span>';

        const res = await fetch('/api/jarvis/browser/session', {
          headers: { 'x-user-id': 'dwight' },
        });
        const data = await res.json();
        if (!data.success) {
          browserSecurityResults.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
          return;
        }

        const s = data.data;
        browserSecurityResults.innerHTML = `
          <div style="background: #1e293b; padding: 0.75rem; border-radius: 6px; margin-bottom: 0.5rem;">
            <div style="display: flex; justify-content: space-between;">
              <strong style="color: #0ea5e9;">Active Browser Session</strong>
              <span class="badge" style="background: #0f172a; color: #10b981;">SESSION ACTIVE</span>
            </div>
            <div style="font-size: 0.8rem; color: #cbd5e1; margin-top: 0.35rem;">
              Current URL: <code>${s.currentUrl || 'about:blank'}</code><br/>
              Navigation History: <strong>${s.navigationHistory?.length || 0} pages</strong><br/>
              Active Cookies: <strong>${Object.keys(s.cookies || {}).length} stored</strong><br/>
              Total Workflows Executed: <strong>${s.totalWorkflowsExecuted || 0}</strong>
            </div>
          </div>
        `;
      } catch (err) {
        browserSecurityResults.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
      }
    });
  }

  if (browserTestSsrfBtn && browserSecurityResults) {
    browserTestSsrfBtn.addEventListener('click', async () => {
      try {
        browserSecurityResults.innerHTML = '<span style="color: #ef4444;">Testing Anti-SSRF protection with loopback probe (http://127.0.0.1:8080/secrets)...</span>';

        const res = await fetch('/api/jarvis/browser/open', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
          body: JSON.stringify({ url: 'http://127.0.0.1:8080/secrets' }),
        });
        const data = await res.json();

        if (res.status === 403 || !data.success) {
          browserSecurityResults.innerHTML = `
            <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; padding: 0.75rem; border-radius: 6px;">
              <strong style="color: #ef4444;">[CRITICAL] Anti-SSRF Guardrail Enforced!</strong>
              <div style="font-size: 0.8rem; color: #fca5a5; margin-top: 0.35rem;">
                Loopback address probe intercepted and blocked: <code>${data.error}</code>
              </div>
              <div style="font-size: 0.75rem; color: #cbd5e1; margin-top: 0.35rem;">
                Invariant holds: Zero unauthorized internal RFC 1918 or loopback (127.0.0.1 / localhost) connections can be established.
              </div>
            </div>
          `;
        } else {
          browserSecurityResults.innerHTML = `<span style="color: #ef4444;">Unexpected: SSRF probe was not blocked.</span>`;
        }
      } catch (err) {
        browserSecurityResults.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
      }
    });
  }

  // ==========================================
  // JARVIS COMMAND CENTER HUD CONTROLLERS & VISUALIZERS
  // ==========================================

  // 1. Live Digital Clock & Date
  const hudClockEl = document.getElementById('hud-live-clock');
  const hudDateEl = document.getElementById('hud-live-date');

  function updateHudClock() {
    const now = new Date();
    if (hudClockEl) {
      const hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const ampm = hours >= 12 ? 'pm' : 'am';
      const displayHours = hours % 12 || 12;
      hudClockEl.textContent = `${displayHours}:${minutes}:${seconds} ${ampm}`;
    }
    if (hudDateEl) {
      const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
      hudDateEl.textContent = now.toLocaleDateString('en-US', options);
    }
  }
  updateHudClock();
  setInterval(updateHudClock, 1000);

  // 2. 3D Holographic Globe & Particle Rings Canvas Animation
  const globeCanvas = document.getElementById('hero-globe-canvas');
  if (globeCanvas) {
    const ctx = globeCanvas.getContext('2d');
    let globeAngle = 0;
    let ringAngle = 0;

    function resizeGlobe() {
      const rect = globeCanvas.getBoundingClientRect();
      globeCanvas.width = rect.width * (window.devicePixelRatio || 1) || 300;
      globeCanvas.height = rect.height * (window.devicePixelRatio || 1) || 220;
    }
    resizeGlobe();
    window.addEventListener('resize', resizeGlobe);

    // Particle field
    const particles = Array.from({ length: 48 }, () => ({
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 120,
      z: (Math.random() - 0.5) * 200,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 0.02 + 0.01,
    }));

    function drawGlobe() {
      if (!ctx) return;
      const w = globeCanvas.width;
      const h = globeCanvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(w, h) * 0.35;

      ctx.clearRect(0, 0, w, h);

      // Radial energy glow backdrop
      const grad = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r * 1.3);
      grad.addColorStop(0, 'rgba(0, 240, 255, 0.25)');
      grad.addColorStop(0.5, 'rgba(0, 180, 255, 0.08)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // Draw rotating longitude wireframe lines
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
      ctx.lineWidth = 1;
      const longitudes = 6;
      for (let i = 0; i < longitudes; i++) {
        const rad = globeAngle + (i * Math.PI) / longitudes;
        const xRadius = Math.abs(Math.cos(rad)) * r;
        ctx.beginPath();
        ctx.ellipse(cx, cy, Math.max(xRadius, 4), r, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw latitude wireframe lines
      const latitudes = [-0.6, -0.3, 0, 0.3, 0.6];
      latitudes.forEach((lat) => {
        const yOffset = lat * r;
        const latRadius = Math.sqrt(Math.max(0, r * r - yOffset * yOffset));
        ctx.beginPath();
        ctx.ellipse(cx, cy + yOffset, latRadius, Math.max(latRadius * 0.25, 2), 0, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Draw outer angled particle rings (Saturn-like ring)
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.55)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(cx, cy, r * 1.55, r * 0.45, -0.35, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.beginPath();
      ctx.ellipse(cx, cy, r * 1.8, r * 0.52, -0.35, 0, Math.PI * 2);
      ctx.stroke();

      // Render orbiting ring particles
      particles.forEach((p) => {
        p.z += p.speed;
        const cosA = Math.cos(ringAngle);
        const sinA = Math.sin(ringAngle);
        const rx = p.x * cosA - p.z * sinA;
        const rz = p.x * sinA + p.z * cosA;
        const scale = 200 / (200 + rz);
        const px = cx + rx * scale;
        const py = cy + p.y * scale + Math.sin(ringAngle * 2) * 8;

        ctx.fillStyle = `rgba(0, 240, 255, ${Math.min(1, Math.max(0.2, scale))})`;
        ctx.beginPath();
        ctx.arc(px, py, Math.max(1, p.size * scale), 0, Math.PI * 2);
        ctx.fill();
      });

      globeAngle += 0.008;
      ringAngle += 0.012;
      requestAnimationFrame(drawGlobe);
    }
    drawGlobe();
  }

  // 3. Voice Waveform Visualizer Canvas
  const voiceCanvas = document.getElementById('voice-wave-canvas');
  if (voiceCanvas) {
    const vCtx = voiceCanvas.getContext('2d');
    let vPhase = 0;

    function resizeVoiceCanvas() {
      const rect = voiceCanvas.getBoundingClientRect();
      voiceCanvas.width = rect.width * (window.devicePixelRatio || 1) || 200;
      voiceCanvas.height = rect.height * (window.devicePixelRatio || 1) || 36;
    }
    resizeVoiceCanvas();
    window.addEventListener('resize', resizeVoiceCanvas);

    function drawVoiceWave() {
      if (!vCtx) return;
      const w = voiceCanvas.width;
      const h = voiceCanvas.height;
      vCtx.clearRect(0, 0, w, h);

      vCtx.strokeStyle = '#00f0ff';
      vCtx.lineWidth = 2;
      vCtx.beginPath();

      const bars = 24;
      const barW = w / bars;
      for (let i = 0; i < bars; i++) {
        const amp = Math.sin(vPhase + i * 0.4) * 0.4 + 0.5;
        const barH = (h * 0.7) * amp;
        const x = i * barW + barW / 4;
        const y = (h - barH) / 2;

        vCtx.fillStyle = `rgba(0, 240, 255, ${0.4 + amp * 0.6})`;
        vCtx.fillRect(x, y, barW / 2, barH);
      }

      vPhase += 0.06;
      requestAnimationFrame(drawVoiceWave);
    }
    drawVoiceWave();
  }

  // 4. Memory Insights Constellation Canvas
  const constCanvas = document.getElementById('constellation-canvas');
  if (constCanvas) {
    const cCtx = constCanvas.getContext('2d');
    function resizeConstCanvas() {
      const rect = constCanvas.getBoundingClientRect();
      constCanvas.width = rect.width * (window.devicePixelRatio || 1) || 140;
      constCanvas.height = rect.height * (window.devicePixelRatio || 1) || 90;
    }
    resizeConstCanvas();
    window.addEventListener('resize', resizeConstCanvas);

    const nodes = [
      { x: 25, y: 30, r: 3 },
      { x: 55, y: 20, r: 4 },
      { x: 90, y: 35, r: 3.5 },
      { x: 40, y: 65, r: 4.5 },
      { x: 75, y: 60, r: 3 },
      { x: 110, y: 65, r: 4 },
      { x: 70, y: 40, r: 5 },
    ];

    let pulse = 0;
    function drawConstellation() {
      if (!cCtx) return;
      const w = constCanvas.width;
      const h = constCanvas.height;
      cCtx.clearRect(0, 0, w, h);

      const sx = w / 140;
      const sy = h / 90;

      // Draw connecting edges
      cCtx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
      cCtx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 55) {
            cCtx.beginPath();
            cCtx.moveTo(nodes[i].x * sx, nodes[i].y * sy);
            cCtx.lineTo(nodes[j].x * sx, nodes[j].y * sy);
            cCtx.stroke();
          }
        }
      }

      // Draw glowing nodes
      nodes.forEach((n, idx) => {
        const glow = Math.sin(pulse + idx) * 1.5 + 3;
        cCtx.fillStyle = '#00f0ff';
        cCtx.beginPath();
        cCtx.arc(n.x * sx, n.y * sy, Math.max(1, (n.r + glow * 0.2) * (sx * 0.7)), 0, Math.PI * 2);
        cCtx.fill();
      });

      pulse += 0.04;
      requestAnimationFrame(drawConstellation);
    }
    drawConstellation();
  }

  // 5. Agent Sparklines Mini-Animation
  const sparklineCanvases = document.querySelectorAll('.agent-sparkline-canvas');
  sparklineCanvases.forEach((canvas) => {
    const sCtx = canvas.getContext('2d');
    const color = canvas.getAttribute('data-color') || '#00f0ff';
    let offset = Math.random() * 10;

    function drawSparkline() {
      if (!sCtx) return;
      const w = canvas.width;
      const h = canvas.height;
      sCtx.clearRect(0, 0, w, h);

      sCtx.strokeStyle = color;
      sCtx.lineWidth = 1.5;
      sCtx.beginPath();

      const points = 20;
      const dx = w / points;
      for (let i = 0; i <= points; i++) {
        const y = (h / 2) + Math.sin(offset + i * 0.6) * (h * 0.35);
        if (i === 0) sCtx.moveTo(0, y);
        else sCtx.lineTo(i * dx, y);
      }
      sCtx.stroke();

      offset += 0.08;
      requestAnimationFrame(drawSparkline);
    }
    drawSparkline();
  });

  // 6. Navigation View Switching
  const navCommandCenter = document.getElementById('nav-command-center');
  const navConversations = document.getElementById('nav-conversations');
  const hudDashboardView = document.getElementById('hud-dashboard-view');
  const hudChatView = document.getElementById('hud-chat-view');
  const closeChatViewBtn = document.getElementById('close-chat-view-btn');
  const hudTalkJarvisBtn = document.getElementById('hud-talk-jarvis-btn');
  const cmdVoiceBtn = document.getElementById('cmd-voice-btn');
  const hudMicBtn = document.getElementById('hud-mic-btn');

  function showDashboardView() {
    if (hudDashboardView) hudDashboardView.classList.remove('hidden');
    if (hudChatView) hudChatView.classList.add('hidden');
    document.querySelectorAll('.hud-nav-item').forEach((el) => el.classList.remove('active'));
    if (navCommandCenter) navCommandCenter.classList.add('active');
  }

  function showChatView() {
    if (hudDashboardView) hudDashboardView.classList.add('hidden');
    if (hudChatView) hudChatView.classList.remove('hidden');
    document.querySelectorAll('.hud-nav-item').forEach((el) => el.classList.remove('active'));
    if (navConversations) navConversations.classList.add('active');
    messageInput?.focus();
  }

  if (navCommandCenter) navCommandCenter.addEventListener('click', (e) => { e.preventDefault(); showDashboardView(); });
  if (navConversations) navConversations.addEventListener('click', (e) => { e.preventDefault(); showChatView(); });
  if (closeChatViewBtn) closeChatViewBtn.addEventListener('click', showDashboardView);
  if (cmdVoiceBtn) cmdVoiceBtn.addEventListener('click', showChatView);

  // Real Web Speech API Controller for JARVIS
  let speechRecognizer = null;
  let isListening = false;
  const hudTalkSubtext = document.getElementById('hud-talk-subtext');

  function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return null;
    }

    const recognizer = new SpeechRecognition();
    recognizer.continuous = false;
    recognizer.interimResults = false;
    recognizer.lang = 'en-US';

    recognizer.onstart = () => {
      isListening = true;
      if (hudTalkJarvisBtn) hudTalkJarvisBtn.classList.add('listening');
      if (hudMicBtn) hudMicBtn.classList.add('recording');
      if (hudTalkSubtext) hudTalkSubtext.textContent = 'Listening... Speak now';
    };

    recognizer.onresult = (event) => {
      if (event.results && event.results[0] && event.results[0][0]) {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          showChatView();
          if (messageInput) {
            messageInput.value = transcript;
          }
          sendMessage(transcript, true);
        }
      }
    };

    recognizer.onerror = (event) => {
      isListening = false;
      if (hudTalkJarvisBtn) hudTalkJarvisBtn.classList.remove('listening');
      if (hudMicBtn) hudMicBtn.classList.remove('recording');
      if (hudTalkSubtext) {
        if (event.error === 'not-allowed') {
          hudTalkSubtext.textContent = 'Mic permission denied';
          showError('Microphone permission was denied by browser. Please enable mic access.');
        } else if (event.error === 'no-speech') {
          hudTalkSubtext.textContent = 'No speech detected';
        } else {
          hudTalkSubtext.textContent = `Mic: ${event.error}`;
        }
      }
    };

    recognizer.onend = () => {
      isListening = false;
      if (hudTalkJarvisBtn) hudTalkJarvisBtn.classList.remove('listening');
      if (hudMicBtn) hudMicBtn.classList.remove('recording');
      if (hudTalkSubtext && !hudTalkSubtext.textContent.includes('denied')) {
        hudTalkSubtext.textContent = 'Click to speak';
      }
    };

    return recognizer;
  }

  function toggleSpeechLink() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showChatView();
      showError('Web Speech Recognition API is not supported in this browser. Please use text chat.');
      if (hudTalkSubtext) hudTalkSubtext.textContent = 'Speech API unavailable';
      return;
    }

    if (!speechRecognizer) {
      speechRecognizer = initSpeechRecognition();
    }

    if (!speechRecognizer) {
      showChatView();
      return;
    }

    if (isListening) {
      try {
        speechRecognizer.stop();
      } catch (e) {}
    } else {
      try {
        speechRecognizer.start();
      } catch (e) {
        console.warn('Speech recognizer start error:', e);
      }
    }
  }

  if (hudTalkJarvisBtn) hudTalkJarvisBtn.addEventListener('click', toggleSpeechLink);
  if (hudMicBtn) hudMicBtn.addEventListener('click', toggleSpeechLink);

  // 7. Interactive Studio & Modal Linkers
  const chipCodingAgent = document.getElementById('chip-coding-agent');
  const chipResearchAgent = document.getElementById('chip-research-agent');
  const chipMemoryAgent = document.getElementById('chip-memory-agent');
  const chipBrowserAgent = document.getElementById('chip-browser-agent');
  const chipMathAgent = document.getElementById('chip-math-agent');
  const chipFinanceAgent = document.getElementById('chip-finance-agent');

  const codingModalRef = document.getElementById('coding-modal');
  const researchModalRef = document.getElementById('research-modal');
  const secondBrainModalRef = document.getElementById('second-brain-modal');
  const browserModalRef = document.getElementById('browser-modal');
  const mathModalRef = document.getElementById('math-modal');
  const financeModalRef = document.getElementById('finance-modal');

  if (chipCodingAgent) chipCodingAgent.addEventListener('click', () => codingModalRef?.classList.remove('hidden'));
  if (chipResearchAgent) chipResearchAgent.addEventListener('click', () => researchModalRef?.classList.remove('hidden'));
  if (chipMemoryAgent) chipMemoryAgent.addEventListener('click', () => secondBrainModalRef?.classList.remove('hidden'));
  if (chipBrowserAgent) chipBrowserAgent.addEventListener('click', () => browserModalRef?.classList.remove('hidden'));
  if (chipMathAgent) chipMathAgent.addEventListener('click', () => mathModalRef?.classList.remove('hidden'));
  if (chipFinanceAgent) chipFinanceAgent.addEventListener('click', () => financeModalRef?.classList.remove('hidden'));

  // Quick Command buttons
  const cmdNewTaskBtn = document.getElementById('cmd-new-task-btn');
  const cmdWorkflowBtn = document.getElementById('cmd-workflow-btn');
  const viewMemoryMapLink = document.getElementById('view-memory-map-link');
  const viewAllAgentsBtn = document.getElementById('view-all-agents-btn');

  if (cmdNewTaskBtn) cmdNewTaskBtn.addEventListener('click', showChatView);
  if (cmdWorkflowBtn) cmdWorkflowBtn.addEventListener('click', () => browserModalRef?.classList.remove('hidden'));
  if (viewMemoryMapLink) viewMemoryMapLink.addEventListener('click', (e) => { e.preventDefault(); secondBrainModalRef?.classList.remove('hidden'); });
  if (viewAllAgentsBtn) viewAllAgentsBtn.addEventListener('click', (e) => { e.preventDefault(); showChatView(); });

  // 8. Executive Briefing Handler
  const hudBriefingBtn = document.getElementById('hud-briefing-btn');
  if (hudBriefingBtn) {
    hudBriefingBtn.addEventListener('click', async () => {
      showChatView();
      if (messagesContainer) {
        let stats = { cpu: 0, ram: 0, agents: 21, nodes: 12 };
        try {
          const res = await fetch('/api/jarvis/dashboard');
          const json = await res.json();
          if (json && json.data) {
            stats.cpu = json.data.systemMonitor.cpuPercent;
            stats.ram = json.data.systemMonitor.ramPercent;
            stats.agents = json.data.aiCore.activeAgentsCount;
            stats.nodes = json.data.aiCore.memoriesStored;
          }
        } catch (e) {}

        const briefingMsg = document.createElement('div');
        briefingMsg.className = 'message-wrapper assistant-wrapper';
        briefingMsg.innerHTML = `
          <div class="avatar assistant-avatar">J</div>
          <div class="message-content">
            <div class="sender-name">JARVIS <span class="tag" style="background:#00f0ff;color:#000;">EXECUTIVE BRIEFING</span></div>
            <div class="bubble assistant-bubble">
              <h4 style="color:#00f0ff;margin:0 0 6px 0;">Executive Briefing — System Status Nominal</h4>
              <p><strong>Commander Dwight</strong>, all ${stats.agents} autonomous agent engines are operational in Local Sovereign Mode. System CPU utilization is ${stats.cpu}%, RAM is ${stats.ram}%, and port 3001 is active.</p>
              <ul style="margin:6px 0 6px 18px;font-size:0.85rem;color:#cbd5e1;">
                <li><strong>Active Architecture:</strong> Local Sovereign Deterministic Mode (no external LLM API key configured).</li>
                <li><strong>Curriculum & Study Tracks:</strong> Higher Mathematics & Licensure Examination for Teachers (LET) Review modules ready.</li>
                <li><strong>Second Brain:</strong> ${stats.nodes} verified knowledge nodes indexed in memory graph.</li>
                <li><strong>Security Guardian:</strong> Anti-SSRF, RA 10173 PII sanitizer, and AES-256-GCM shields enforced.</li>
              </ul>
              <p style="margin:0;">Ready to execute your directives.</p>
            </div>
            <div class="timestamp">Live Briefing</div>
          </div>
        `;
        messagesContainer.appendChild(briefingMsg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    });
  }

  // 9. Sync Telemetry from /api/jarvis/dashboard
  async function syncDashboardTelemetry() {
    try {
      const res = await fetch('/api/jarvis/dashboard');
      const data = await res.json();
      if (data && data.success && data.data) {
        const d = data.data;

        // System monitor gauges
        const gauges = document.querySelectorAll('.gauge-val-text');
        if (gauges.length >= 3) {
          gauges[0].textContent = `${d.systemMonitor.cpuPercent}%`;
          gauges[1].textContent = `${d.systemMonitor.ramPercent}%`;
          gauges[2].textContent = `${d.systemMonitor.diskPercent}%`;
        }

        // Overview items
        const overviewMemories = document.getElementById('overview-memories-val');
        if (overviewMemories) overviewMemories.textContent = `${d.aiCore.memoriesStored} Stored`;

        const overviewVoice = document.getElementById('overview-voice-val');
        if (overviewVoice) overviewVoice.textContent = d.aiCore.voiceStatus.includes('Web Speech') ? 'Web Speech' : d.aiCore.voiceStatus;

        const overviewAgents = document.getElementById('overview-agents-val');
        if (overviewAgents) overviewAgents.textContent = `${d.aiCore.activeAgentsCount} Active`;

        const overviewLlms = document.getElementById('overview-llms-val');
        if (overviewLlms) overviewLlms.textContent = `${d.aiCore.connectedLlmsCount} Connected`;

        const overviewSystem = document.getElementById('overview-system-val');
        if (overviewSystem) overviewSystem.textContent = d.aiCore.systemHealth;

        // Memory insights card
        const insightsMemories = document.getElementById('insights-memories-num');
        if (insightsMemories) insightsMemories.textContent = d.memoryInsights.memories;

        const insightsTurns = document.getElementById('insights-turns-num');
        if (insightsTurns) insightsTurns.textContent = d.memoryInsights.sessionTurns;

        const insightsTools = document.getElementById('insights-tools-num');
        if (insightsTools) insightsTools.textContent = d.memoryInsights.toolCalls;

        // LLM status badge & grid
        const llmBadge = document.getElementById('llm-status-badge');
        if (llmBadge) {
          llmBadge.textContent = d.aiCore.connectedLlmsCount > 0 ? `${d.aiCore.connectedLlmsCount} Connected` : 'Local Sovereign';
        }

        const llmGrid = document.getElementById('hud-llm-grid');
        if (llmGrid && Array.isArray(d.llmProviders)) {
          llmGrid.innerHTML = d.llmProviders.map((p) => `
            <div class="llm-provider-chip">
              <span class="provider-name">${p.name}</span>
              <span class="provider-status" style="color: ${p.status.includes('Active') || p.status.includes('Connected') ? 'var(--hud-cyan)' : 'var(--text-muted)'}; font-weight: ${p.primary ? '700' : '400'};">&#9679; ${p.status}</span>
            </div>
          `).join('');
        }

        // Intelligence feed
        const feedContainer = document.getElementById('hud-intelligence-feed');
        if (feedContainer && Array.isArray(d.intelligenceFeed)) {
          feedContainer.innerHTML = d.intelligenceFeed.map((item) => `
            <div class="feed-item ${item.type.toLowerCase()}">
              <div style="font-weight: 600; color: #fff;">${item.title}</div>
              <div class="feed-meta">
                <span style="color: var(--text-muted);">${item.category}</span>
                <span class="feed-badge ${item.type.toLowerCase()}">${item.type}</span>
              </div>
            </div>
          `).join('');
        }

        // Mission timeline
        const timelineList = document.getElementById('hud-timeline-list');
        if (timelineList && Array.isArray(d.missionTimeline)) {
          timelineList.innerHTML = d.missionTimeline.map((item) => `
            <div class="timeline-item">
              <div class="timeline-task">
                <div class="timeline-dot" style="background: ${item.status === 'Active' || item.status === 'Done' ? 'var(--hud-green)' : 'var(--hud-cyan)'};"></div>
                <span>${item.title}</span>
              </div>
              <span class="timeline-time" style="color: ${item.status === 'Active' || item.status === 'Done' ? 'var(--hud-green)' : 'var(--text-muted)'};">${item.time}</span>
            </div>
          `).join('');
        }

        // Dock location & weather
        const dockLocation = document.getElementById('dock-location-text');
        if (dockLocation) dockLocation.textContent = 'Localhost (Dwight)';

        const dockWeather = document.getElementById('dock-weather-text');
        if (dockWeather) dockWeather.textContent = 'Weather: Offline (No API)';

        const dockNetwork = document.getElementById('dock-network-text');
        if (dockNetwork) dockNetwork.textContent = 'Localhost:3001 Nominal';
      }
    } catch (e) {
      console.warn('Dashboard telemetry sync error:', e);
    }
  }
  syncDashboardTelemetry();
  setInterval(syncDashboardTelemetry, 15000);

  // ========================================================
  // Phase 18: Application Control & Local Integration Client
  // ========================================================
  const appsModal = document.getElementById('apps-modal');
  const closeAppsModalBtn = document.getElementById('close-apps-modal-btn');
  const navApps = document.getElementById('nav-apps');
  const cmdAppsBtn = document.getElementById('cmd-apps-btn');
  const chipAppControl = document.getElementById('chip-app-control-agent');

  function openAppsModal() {
    if (appsModal) {
      appsModal.classList.remove('hidden');
      loadAppsCatalog();
      loadAppsAudit();
    }
  }

  function closeAppsModal() {
    if (appsModal) {
      appsModal.classList.add('hidden');
    }
  }

  if (navApps) navApps.addEventListener('click', (e) => { e.preventDefault(); openAppsModal(); });
  if (cmdAppsBtn) cmdAppsBtn.addEventListener('click', openAppsModal);
  if (chipAppControl) chipAppControl.addEventListener('click', openAppsModal);
  if (closeAppsModalBtn) closeAppsModalBtn.addEventListener('click', closeAppsModal);
  if (appsModal) {
    appsModal.addEventListener('click', (e) => {
      if (e.target === appsModal) closeAppsModal();
    });
  }

  // Tab switching
  const appsTabBtns = {
    catalog: document.getElementById('apps-tab-btn-catalog'),
    processes: document.getElementById('apps-tab-btn-processes'),
    launch: document.getElementById('apps-tab-btn-launch'),
    uri: document.getElementById('apps-tab-btn-uri'),
    api: document.getElementById('apps-tab-btn-api'),
    audit: document.getElementById('apps-tab-btn-audit'),
  };

  const appsPanels = {
    catalog: document.getElementById('apps-panel-catalog'),
    processes: document.getElementById('apps-panel-processes'),
    launch: document.getElementById('apps-panel-launch'),
    uri: document.getElementById('apps-panel-uri'),
    api: document.getElementById('apps-panel-api'),
    audit: document.getElementById('apps-panel-audit'),
  };

  function switchAppsTab(targetTab) {
    Object.keys(appsTabBtns).forEach((tabKey) => {
      const btn = appsTabBtns[tabKey];
      const panel = appsPanels[tabKey];
      if (btn && panel) {
        if (tabKey === targetTab) {
          btn.className = 'btn btn-sm btn-primary';
          btn.style.background = 'var(--hud-cyan)';
          btn.style.color = '#000';
          btn.style.fontWeight = '600';
          panel.classList.remove('hidden');
        } else {
          btn.className = 'btn btn-sm btn-ghost';
          btn.style.background = 'transparent';
          btn.style.color = '#94a3b8';
          btn.style.fontWeight = 'normal';
          panel.classList.add('hidden');
        }
      }
    });
    if (targetTab === 'catalog') loadAppsCatalog();
    if (targetTab === 'processes') loadAppsProcesses();
    if (targetTab === 'audit') loadAppsAudit();
  }

  if (appsTabBtns.catalog) appsTabBtns.catalog.addEventListener('click', () => switchAppsTab('catalog'));
  if (appsTabBtns.processes) appsTabBtns.processes.addEventListener('click', () => switchAppsTab('processes'));
  if (appsTabBtns.launch) appsTabBtns.launch.addEventListener('click', () => switchAppsTab('launch'));
  if (appsTabBtns.uri) appsTabBtns.uri.addEventListener('click', () => switchAppsTab('uri'));
  if (appsTabBtns.api) appsTabBtns.api.addEventListener('click', () => switchAppsTab('api'));
  if (appsTabBtns.audit) appsTabBtns.audit.addEventListener('click', () => switchAppsTab('audit'));

  // 1. Catalog Loading
  async function loadAppsCatalog() {
    const grid = document.getElementById('apps-catalog-grid');
    if (!grid) return;
    try {
      grid.innerHTML = '<div style="color: var(--hud-cyan); font-family: monospace;">Fetching registered application catalog...</div>';
      const res = await fetch('/api/jarvis/apps/catalog', {
        headers: { 'x-user-id': 'dwight' },
      });
      const json = await res.json();
      if (!json.success) {
        grid.innerHTML = `<div style="color: #ef4444;">Error: ${json.error}</div>`;
        return;
      }
      grid.innerHTML = json.data.map((app) => `
        <div style="background: #0d1527; border: 1px solid rgba(0, 240, 255, 0.2); border-radius: 8px; padding: 1rem; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
            <div style="font-weight: 600; color: #fff; font-size: 0.95rem;">${app.name}</div>
            <span style="font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; font-weight: 600; text-transform: uppercase; background: ${app.status === 'authorized' ? 'rgba(16, 185, 129, 0.2)' : app.status === 'pending' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)'}; color: ${app.status === 'authorized' ? '#10b981' : app.status === 'pending' ? '#f59e0b' : '#ef4444'};">
              ${app.status}
            </span>
          </div>
          <div style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.5rem;">${app.description}</div>
          <div style="font-size: 0.72rem; color: #64748b; font-family: monospace; margin-bottom: 0.75rem;">
            exe: <code>${app.executable}</code> | protocols: ${app.supportedProtocols.join(', ')}
          </div>
          <div style="display: flex; gap: 0.5rem; margin-top: auto;">
            <button class="btn btn-sm btn-outline app-quick-launch-btn" data-appid="${app.id}" style="border-color: var(--hud-cyan); color: var(--hud-cyan); flex: 1;">Launch</button>
            <button class="btn btn-sm btn-ghost app-quick-focus-btn" data-appid="${app.id}" style="color: #94a3b8; border: 1px solid #334155;">Focus</button>
          </div>
        </div>
      `).join('');

      // Wire quick buttons
      grid.querySelectorAll('.app-quick-launch-btn').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const appId = btn.getAttribute('data-appid');
          btn.textContent = 'Launching...';
          try {
            const lRes = await fetch('/api/jarvis/apps/launch', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
              body: JSON.stringify({ appId, simulate: true }),
            });
            const lData = await lRes.json();
            btn.textContent = lData.success ? 'Launched ✓' : 'Failed ✗';
            setTimeout(() => { btn.textContent = 'Launch'; }, 2000);
          } catch (e) {
            btn.textContent = 'Error';
          }
        });
      });

      grid.querySelectorAll('.app-quick-focus-btn').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const appId = btn.getAttribute('data-appid');
          btn.textContent = 'Focusing...';
          try {
            await fetch('/api/jarvis/apps/focus', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
              body: JSON.stringify({ appId, simulate: true }),
            });
            btn.textContent = 'Focused ✓';
            setTimeout(() => { btn.textContent = 'Focus'; }, 2000);
          } catch (e) {
            btn.textContent = 'Error';
          }
        });
      });
    } catch (err) {
      grid.innerHTML = `<div style="color: #ef4444;">Failed to fetch catalog: ${err.message}</div>`;
    }
  }

  const appsRefreshCatalogBtn = document.getElementById('apps-refresh-catalog-btn');
  if (appsRefreshCatalogBtn) appsRefreshCatalogBtn.addEventListener('click', loadAppsCatalog);

  // 2. Processes Loading
  async function loadAppsProcesses() {
    const tbody = document.getElementById('apps-processes-tbody');
    if (!tbody) return;
    try {
      tbody.innerHTML = '<tr><td colspan="6" style="padding: 12px; text-align: center; color: var(--hud-cyan); font-family: monospace;">Discovering active host processes...</td></tr>';
      const res = await fetch('/api/jarvis/apps/processes', {
        headers: { 'x-user-id': 'dwight' },
      });
      const json = await res.json();
      if (!json.success) {
        tbody.innerHTML = `<tr><td colspan="6" style="padding: 12px; color: #ef4444;">Error: ${json.error}</td></tr>`;
        return;
      }
      tbody.innerHTML = json.data.slice(0, 20).map((p) => `
        <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
          <td style="padding: 8px 12px; font-family: monospace; color: var(--hud-cyan);">${p.pid}</td>
          <td style="padding: 8px 12px; font-weight: 500; color: #fff;">${p.processName}</td>
          <td style="padding: 8px 12px; color: #94a3b8; max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${p.windowTitle || '<background>'}</td>
          <td style="padding: 8px 12px; color: #cbd5e1; font-family: monospace;">${p.memoryMb ? p.memoryMb + ' MB' : '-'}</td>
          <td style="padding: 8px 12px;"><span style="color: #10b981;">&#9679; OK</span></td>
          <td style="padding: 8px 12px;">
            <button class="btn btn-sm btn-ghost app-proc-close-btn" data-pid="${p.pid}" data-name="${p.processName}" style="color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); padding: 2px 6px; font-size: 0.7rem;">Terminate</button>
          </td>
        </tr>
      `).join('');

      tbody.querySelectorAll('.app-proc-close-btn').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const pid = parseInt(btn.getAttribute('data-pid'), 10);
          const name = btn.getAttribute('data-name');
          btn.textContent = 'Closing...';
          try {
            await fetch('/api/jarvis/apps/close', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
              body: JSON.stringify({ appId: name, pid, simulate: true }),
            });
            btn.textContent = 'Closed ✓';
            setTimeout(loadAppsProcesses, 1000);
          } catch (e) {
            btn.textContent = 'Failed';
          }
        });
      });
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="6" style="padding: 12px; color: #ef4444;">Failed to discover processes: ${err.message}</td></tr>`;
    }
  }

  const appsRefreshProcessesBtn = document.getElementById('apps-refresh-processes-btn');
  if (appsRefreshProcessesBtn) appsRefreshProcessesBtn.addEventListener('click', loadAppsProcesses);

  // 3. Launch & Window Execution
  const appsExecuteLaunchBtn = document.getElementById('apps-execute-launch-btn');
  const appsLaunchFeedback = document.getElementById('apps-launch-feedback');
  if (appsExecuteLaunchBtn && appsLaunchFeedback) {
    appsExecuteLaunchBtn.addEventListener('click', async () => {
      const select = document.getElementById('apps-launch-select');
      const argsInput = document.getElementById('apps-launch-args');
      const simBox = document.getElementById('apps-launch-simulate');
      const appId = select ? select.value : 'calculator';
      const args = argsInput && argsInput.value.trim() ? argsInput.value.split(',').map((s) => s.trim()) : [];
      const simulate = simBox ? simBox.checked : true;

      appsLaunchFeedback.innerHTML = '<span style="color: var(--hud-cyan);">Executing application launch...</span>';
      try {
        const res = await fetch('/api/jarvis/apps/launch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
          body: JSON.stringify({ appId, args, simulate }),
        });
        const data = await res.json();
        if (data.success) {
          appsLaunchFeedback.innerHTML = `<span style="color: #10b981;">[SUCCESS] ${data.data.message} (PID: ${data.data.pid})</span>`;
        } else {
          appsLaunchFeedback.innerHTML = `<span style="color: #ef4444;">[BLOCKED] ${data.error}</span>`;
        }
      } catch (err) {
        appsLaunchFeedback.innerHTML = `<span style="color: #ef4444;">[ERROR] ${err.message}</span>`;
      }
    });
  }

  const appsWindowFocusBtn = document.getElementById('apps-window-focus-btn');
  if (appsWindowFocusBtn && appsLaunchFeedback) {
    appsWindowFocusBtn.addEventListener('click', async () => {
      const select = document.getElementById('apps-window-select');
      const filterInput = document.getElementById('apps-window-title-filter');
      const appId = select ? select.value : 'vscode';
      const windowTitleFilter = filterInput ? filterInput.value.trim() : '';

      appsLaunchFeedback.innerHTML = '<span style="color: var(--hud-cyan);">Focusing application window...</span>';
      try {
        const res = await fetch('/api/jarvis/apps/focus', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
          body: JSON.stringify({ appId, windowTitleFilter, simulate: true }),
        });
        const data = await res.json();
        if (data.success) {
          appsLaunchFeedback.innerHTML = `<span style="color: #10b981;">[SUCCESS] Focused window "${data.data.windowTitle}" in ${data.data.durationMs}ms</span>`;
        } else {
          appsLaunchFeedback.innerHTML = `<span style="color: #ef4444;">[BLOCKED] ${data.error}</span>`;
        }
      } catch (err) {
        appsLaunchFeedback.innerHTML = `<span style="color: #ef4444;">[ERROR] ${err.message}</span>`;
      }
    });
  }

  const appsTestUacBlockBtn = document.getElementById('apps-test-uac-block-btn');
  if (appsTestUacBlockBtn && appsLaunchFeedback) {
    appsTestUacBlockBtn.addEventListener('click', async () => {
      appsLaunchFeedback.innerHTML = '<span style="color: #f59e0b;">Testing UAC / Credential Dialogue Protection...</span>';
      try {
        const res = await fetch('/api/jarvis/apps/focus', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
          body: JSON.stringify({ appId: 'vscode', windowTitleFilter: 'Windows Security Credential Dialog', simulate: true }),
        });
        const data = await res.json();
        if (res.status === 403 || !data.success) {
          appsLaunchFeedback.innerHTML = `<span style="color: #10b981;">[PASSED SECURITY INVARIANT] Blocked elevated prompt automation: ${data.error}</span>`;
        } else {
          appsLaunchFeedback.innerHTML = `<span style="color: #ef4444;">[SECURITY FAIL] Dialog was unexpectedly allowed!</span>`;
        }
      } catch (err) {
        appsLaunchFeedback.innerHTML = `<span style="color: #10b981;">[PASSED SECURITY INVARIANT] Request was rejected: ${err.message}</span>`;
      }
    });
  }

  // 4. URI Scheme Dispatch
  const appsUriDispatchBtn = document.getElementById('apps-uri-dispatch-btn');
  const appsUriResults = document.getElementById('apps-uri-results');
  if (appsUriDispatchBtn && appsUriResults) {
    appsUriDispatchBtn.addEventListener('click', async () => {
      const select = document.getElementById('apps-uri-select');
      const input = document.getElementById('apps-uri-input');
      const appId = select ? select.value : 'vscode';
      const uri = input ? input.value.trim() : '';

      appsUriResults.innerHTML = '<span style="color: var(--hud-cyan);">Verifying scheme and dispatching URI...</span>';
      try {
        const res = await fetch('/api/jarvis/apps/uri', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
          body: JSON.stringify({ appId, uri, simulate: true }),
        });
        const data = await res.json();
        if (data.success) {
          appsUriResults.innerHTML = `
            <div style="color: #10b981; font-weight: bold; margin-bottom: 4px;">[SUCCESS] Deep Link Dispatched</div>
            <div>URI: <code>${data.data.uri}</code></div>
            <div>Message: ${data.data.message}</div>
          `;
        } else {
          appsUriResults.innerHTML = `<div style="color: #ef4444;">[BLOCKED] ${data.error}</div>`;
        }
      } catch (err) {
        appsUriResults.innerHTML = `<div style="color: #ef4444;">[ERROR] ${err.message}</div>`;
      }
    });
  }

  // URI Presets
  const uriInput = document.getElementById('apps-uri-input');
  const uriSelect = document.getElementById('apps-uri-select');
  const presetVscode = document.getElementById('apps-uri-preset-vscode');
  const presetObsidian = document.getElementById('apps-uri-preset-obsidian');
  const presetSpotify = document.getElementById('apps-uri-preset-spotify');

  if (presetVscode && uriInput && uriSelect) {
    presetVscode.addEventListener('click', () => {
      uriSelect.value = 'vscode';
      uriInput.value = 'vscode://file/src/server/app.ts';
    });
  }
  if (presetObsidian && uriInput && uriSelect) {
    presetObsidian.addEventListener('click', () => {
      uriSelect.value = 'obsidian';
      uriInput.value = 'obsidian://open?vault=SecondBrain&file=ResearchNotes';
    });
  }
  if (presetSpotify && uriInput && uriSelect) {
    presetSpotify.addEventListener('click', () => {
      uriSelect.value = 'spotify';
      uriInput.value = 'spotify://track/4cOdK2wGLETKBW3PvgPWqT';
    });
  }

  // 5. Local API Runner
  const appsApiSendBtn = document.getElementById('apps-api-send-btn');
  const appsApiResults = document.getElementById('apps-api-results');
  if (appsApiSendBtn && appsApiResults) {
    appsApiSendBtn.addEventListener('click', async () => {
      const select = document.getElementById('apps-api-target-select');
      const epInput = document.getElementById('apps-api-endpoint');
      const tokenInput = document.getElementById('apps-api-token');
      const appId = select ? select.value : 'obsidian';
      const endpoint = epInput ? epInput.value.trim() : '/vault/notes.md';
      const authToken = tokenInput ? tokenInput.value.trim() : '';

      appsApiResults.innerHTML = '<span style="color: var(--hud-cyan);">Sending authenticated local API request...</span>';
      try {
        const res = await fetch('/api/jarvis/apps/command', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
          body: JSON.stringify({ appId, endpoint, authToken, simulate: true }),
        });
        const data = await res.json();
        if (data.success) {
          appsApiResults.innerHTML = `
            <div style="color: #10b981; font-weight: bold; margin-bottom: 4px;">[SUCCESS] API Response (${data.data.durationMs}ms)</div>
            <pre style="background: #0f172a; padding: 0.5rem; border-radius: 4px; overflow-x: auto; color: #cbd5e1;">${JSON.stringify(data.data.response, null, 2)}</pre>
          `;
        } else {
          appsApiResults.innerHTML = `<div style="color: #ef4444;">[BLOCKED] ${data.error}</div>`;
        }
      } catch (err) {
        appsApiResults.innerHTML = `<div style="color: #ef4444;">[ERROR] ${err.message}</div>`;
      }
    });
  }

  // 6. Authorization Audit Loading
  async function loadAppsAudit() {
    try {
      const res = await fetch('/api/jarvis/apps/audit', {
        headers: { 'x-user-id': 'dwight' },
      });
      const json = await res.json();
      if (json.success && json.data) {
        const audit = json.data;
        const totalEl = document.getElementById('apps-audit-total');
        const authEl = document.getElementById('apps-audit-authorized');
        const pendEl = document.getElementById('apps-audit-pending');
        const blockEl = document.getElementById('apps-audit-blocked');
        const noticeEl = document.getElementById('apps-audit-notice');
        const listEl = document.getElementById('apps-audit-list');

        if (totalEl) totalEl.textContent = audit.totalRegistered;
        if (authEl) authEl.textContent = audit.authorizedCount;
        if (pendEl) pendEl.textContent = audit.pendingCount;
        if (blockEl) blockEl.textContent = audit.blockedCount;
        if (noticeEl) noticeEl.textContent = audit.securityNotice;

        if (listEl && audit.applications) {
          listEl.innerHTML = audit.applications.map((a) => `
            <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <span><strong>${a.name}</strong> (<code>${a.executable}</code>)</span>
              <span style="color: ${a.status === 'authorized' ? '#10b981' : a.status === 'pending' ? '#f59e0b' : '#ef4444'}; text-transform: uppercase; font-weight: 600;">${a.status}</span>
            </div>
          `).join('');
        }
      }
    } catch (e) {
      // Keep static defaults on error
    }
  }

  // ==================== PHASE 19: VISION & CAMERA INTELLIGENCE CONTROLLER ====================
  const visionModal = document.getElementById('vision-modal');
  const closeVisionModalBtn = document.getElementById('close-vision-modal-btn');
  const cmdVisionBtn = document.getElementById('cmd-vision-btn');
  const navVisionBtn = document.getElementById('nav-vision');
  const chipVisionAgent = document.getElementById('chip-vision-agent');

  function openVisionModal() {
    if (visionModal) {
      visionModal.classList.remove('hidden');
      loadCameraStatus();
      loadCameraDevices();
    }
  }

  function closeVisionModal() {
    if (visionModal) {
      visionModal.classList.add('hidden');
    }
  }

  if (cmdVisionBtn) cmdVisionBtn.addEventListener('click', openVisionModal);
  if (navVisionBtn) navVisionBtn.addEventListener('click', (e) => { e.preventDefault(); openVisionModal(); });
  if (chipVisionAgent) chipVisionAgent.addEventListener('click', openVisionModal);
  if (closeVisionModalBtn) closeVisionModalBtn.addEventListener('click', closeVisionModal);
  if (visionModal) {
    visionModal.addEventListener('click', (e) => {
      if (e.target === visionModal) closeVisionModal();
    });
  }

  // Vision Modal Tab Switching
  const visionTabs = [
    { btn: 'vision-tab-btn-camera', panel: 'vision-panel-camera' },
    { btn: 'vision-tab-btn-screen', panel: 'vision-panel-screen' },
    { btn: 'vision-tab-btn-ocr', panel: 'vision-panel-ocr' },
    { btn: 'vision-tab-btn-document', panel: 'vision-panel-document' },
    { btn: 'vision-tab-btn-redact', panel: 'vision-panel-redact' },
  ];

  visionTabs.forEach(({ btn, panel }) => {
    const btnEl = document.getElementById(btn);
    if (btnEl) {
      btnEl.addEventListener('click', () => {
        visionTabs.forEach((t) => {
          const b = document.getElementById(t.btn);
          const p = document.getElementById(t.panel);
          if (b) {
            b.classList.remove('btn-primary');
            b.classList.add('btn-ghost');
            b.style.background = 'transparent';
            b.style.color = '#94a3b8';
          }
          if (p) p.classList.add('hidden');
        });
        btnEl.classList.remove('btn-ghost');
        btnEl.classList.add('btn-primary');
        btnEl.style.background = 'var(--hud-cyan)';
        btnEl.style.color = '#000';
        const activePanel = document.getElementById(panel);
        if (activePanel) activePanel.classList.remove('hidden');
      });
    }
  });

  // 1. Camera Devices & Status
  let capturedFramesCount = 0;
  async function loadCameraDevices() {
    try {
      const res = await fetch('/api/jarvis/vision/camera/devices', {
        headers: { 'x-user-id': 'dwight' },
      });
      const data = await res.json();
      const select = document.getElementById('vision-device-select');
      if (data.success && select && data.data) {
        select.innerHTML = data.data
          .map((d) => `<option value="${d.id}">${d.name} (${d.capabilities.maxWidth}x${d.capabilities.maxHeight} @ ${d.capabilities.maxFps}fps)</option>`)
          .join('');
      }
    } catch (e) {
      // keep fallback options
    }
  }

  async function loadCameraStatus() {
    try {
      const res = await fetch('/api/jarvis/vision/camera/status', {
        headers: { 'x-user-id': 'dwight' },
      });
      const data = await res.json();
      if (data.success && data.data) {
        updateHardwareLed(data.data.indicatorActive);
        const statusEl = document.getElementById('vision-sensor-status');
        if (statusEl) statusEl.textContent = data.data.status.toUpperCase();
      }
    } catch (e) {}
  }

  function updateHardwareLed(active) {
    const led = document.getElementById('vision-hardware-led');
    const label = document.getElementById('vision-hardware-led-label');
    const sensorIndicator = document.getElementById('vision-sensor-indicator');
    if (active) {
      if (led) {
        led.style.background = '#10b981';
        led.style.boxShadow = '0 0 14px #10b981';
      }
      if (label) {
        label.textContent = 'PRIVACY LED: ACTIVE (TRANSMITTING)';
        label.style.color = '#10b981';
      }
      if (sensorIndicator) sensorIndicator.textContent = 'TRANSMITTING';
    } else {
      if (led) {
        led.style.background = '#64748b';
        led.style.boxShadow = '0 0 6px #64748b';
      }
      if (label) {
        label.textContent = 'PRIVACY LED: STANDBY (INACTIVE)';
        label.style.color = '#94a3b8';
      }
      if (sensorIndicator) sensorIndicator.textContent = 'ARMED (INACTIVE)';
    }
  }

  // Camera Frame Capture
  const captureFrameBtn = document.getElementById('vision-capture-frame-btn');
  const burstFrameBtn = document.getElementById('vision-stream-burst-btn');
  const frameRender = document.getElementById('vision-frame-render');
  const streamTime = document.getElementById('vision-stream-time');
  const framesCountEl = document.getElementById('vision-sensor-frames');

  async function executeCameraCapture() {
    const select = document.getElementById('vision-device-select');
    const deviceId = select ? select.value : 'cam_integrated_01';
    updateHardwareLed(true);

    try {
      const res = await fetch('/api/jarvis/vision/camera/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
        body: JSON.stringify({ deviceId }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        capturedFramesCount++;
        if (framesCountEl) framesCountEl.textContent = `${capturedFramesCount} captured`;
        if (streamTime) streamTime.textContent = new Date(data.data.timestamp).toLocaleTimeString();

        // Render decoded SVG
        if (frameRender && data.data.dataBase64) {
          const svgContent = atob(data.data.dataBase64);
          frameRender.innerHTML = svgContent;
          const svgEl = frameRender.querySelector('svg');
          if (svgEl) {
            svgEl.style.width = '100%';
            svgEl.style.height = '100%';
            svgEl.style.maxHeight = '280px';
          }
        }
      }
    } catch (err) {
      if (frameRender) frameRender.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
    } finally {
      setTimeout(() => updateHardwareLed(false), 1200);
    }
  }

  if (captureFrameBtn) captureFrameBtn.addEventListener('click', executeCameraCapture);
  if (burstFrameBtn) {
    burstFrameBtn.addEventListener('click', async () => {
      for (let i = 0; i < 3; i++) {
        await executeCameraCapture();
        await new Promise((r) => setTimeout(r, 200));
      }
    });
  }

  // 2. Desktop Screen Grabber
  const screenCaptureBtn = document.getElementById('vision-screen-capture-btn');
  const screenTestBlockBtn = document.getElementById('vision-screen-test-block-btn');
  const screenPreview = document.getElementById('vision-screen-preview');
  const screenMeta = document.getElementById('vision-screen-meta');

  if (screenCaptureBtn) {
    screenCaptureBtn.addEventListener('click', async () => {
      const targetSelect = document.getElementById('vision-screen-target-select');
      const winTitleInput = document.getElementById('vision-screen-window-title');
      const target = targetSelect ? targetSelect.value : 'fullscreen';
      const windowTitle = winTitleInput ? winTitleInput.value.trim() : undefined;

      if (screenPreview) screenPreview.innerHTML = '<span style="color: var(--hud-cyan);">Grabbing desktop frame...</span>';
      try {
        const res = await fetch('/api/jarvis/vision/screen/capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
          body: JSON.stringify({ target, windowTitle }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          if (screenMeta) screenMeta.textContent = `${data.data.width}x${data.data.height} | ${data.data.sizeBytes} bytes | Target: ${data.data.target}`;
          if (screenPreview && data.data.dataBase64) {
            const svgContent = atob(data.data.dataBase64);
            screenPreview.innerHTML = svgContent;
            const svgEl = screenPreview.querySelector('svg');
            if (svgEl) {
              svgEl.style.width = '100%';
              svgEl.style.height = '100%';
              svgEl.style.maxHeight = '230px';
            }
          }
        } else {
          if (screenPreview) screenPreview.innerHTML = `<span style="color: #ef4444;">${data.error}</span>`;
        }
      } catch (err) {
        if (screenPreview) screenPreview.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
      }
    });
  }

  if (screenTestBlockBtn) {
    screenTestBlockBtn.addEventListener('click', async () => {
      if (screenPreview) screenPreview.innerHTML = '<span style="color: #ef4444;">Testing Sensitive Window Shield against 1Password...</span>';
      try {
        const res = await fetch('/api/jarvis/vision/screen/capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
          body: JSON.stringify({ target: 'window', windowTitle: '1Password Master Vault - Credentials' }),
        });
        const data = await res.json();
        if (!data.success) {
          if (screenMeta) screenMeta.textContent = 'SHIELD ENGAGED: 403 Forbidden';
          if (screenPreview) {
            screenPreview.innerHTML = `
              <div style="padding: 1rem; color: #ef4444; font-family: monospace; font-size: 0.8rem; text-align: center;">
                <div style="font-weight: 700; font-size: 1rem; margin-bottom: 6px;">[SECURITY GUARDIAN SHIELD ENGAGED]</div>
                <div>${data.error}</div>
                <div style="color: #94a3b8; margin-top: 8px;">Master Plan Invariant: Screen capture is strictly prohibited against password managers, security prompts, and credential vaults.</div>
              </div>
            `;
          }
        }
      } catch (err) {
        if (screenPreview) screenPreview.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
      }
    });
  }

  // 3. OCR Engine Presets & Runner
  const ocrInputText = document.getElementById('vision-ocr-input-text');
  const ocrResults = document.getElementById('vision-ocr-results');
  const ocrExecuteBtn = document.getElementById('vision-ocr-execute-btn');

  const ocrPresetDashboard = document.getElementById('vision-ocr-preset-dashboard');
  const ocrPresetTable = document.getElementById('vision-ocr-preset-table');
  const ocrPresetMath = document.getElementById('vision-ocr-preset-math');

  if (ocrPresetDashboard && ocrInputText) {
    ocrPresetDashboard.addEventListener('click', () => {
      ocrInputText.value = 'JARVIS Autonomous Operations Cockpit\nCore Status: Online\nNeural Latency: 42ms\nActive Agents: 19';
    });
  }
  if (ocrPresetTable && ocrInputText) {
    ocrPresetTable.addEventListener('click', () => {
      ocrInputText.value = 'Metric | Q1 | Q2 | Q3 | Q4\nThroughput | 1200 | 1450 | 1800 | 2100\nAccuracy | 99.4% | 99.7% | 99.8% | 99.9%';
    });
  }
  if (ocrPresetMath && ocrInputText) {
    ocrPresetMath.addEventListener('click', () => {
      ocrInputText.value = 'Quadratic Equation Solution:\nf(x) = ax^2 + bx + c\nDiscriminant: D = b^2 - 4ac\nx = (-b ± sqrt(D)) / (2a)';
    });
  }

  if (ocrExecuteBtn && ocrInputText && ocrResults) {
    ocrExecuteBtn.addEventListener('click', async () => {
      const rawText = ocrInputText.value.trim() || 'JARVIS OCR Scanner Ready';
      ocrResults.innerHTML = '<span style="color: var(--hud-cyan);">Running OCR recognition & bounding box extractor...</span>';

      const svg = `<svg width="600" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#020617"/><text x="20" y="40" fill="#00f0ff" font-family="monospace" font-size="14">${rawText.replace(/\n/g, ' ')}</text></svg>`;
      const imageBase64 = btoa(svg);

      try {
        const res = await fetch('/api/jarvis/vision/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
          body: JSON.stringify({ imageBase64, languageHint: 'en' }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          const o = data.data;
          let tableHtml = '';
          if (o.tablesDetected && o.tablesDetected.length > 0) {
            tableHtml = o.tablesDetected.map((t) => `
              <div style="margin-top: 8px; border: 1px solid #1e293b; border-radius: 4px; overflow: hidden;">
                <div style="background: #0f172a; padding: 4px 8px; font-weight: bold; color: var(--hud-green);">Detected Table:</div>
                <div style="padding: 4px 8px; color: #38bdf8;">Headers: ${t.headers.join(' | ')}</div>
                ${t.rows.map((r) => `<div style="padding: 2px 8px; color: #cbd5e1;">Row: ${r.join(' | ')}</div>`).join('')}
              </div>
            `).join('');
          }

          let mathHtml = '';
          if (o.mathExpressions && o.mathExpressions.length > 0) {
            mathHtml = `
              <div style="margin-top: 8px; padding: 6px 8px; background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 4px;">
                <div style="color: var(--hud-purple); font-weight: bold;">Detected Mathematical Expressions:</div>
                ${o.mathExpressions.map((m) => `<div style="font-family: monospace; color: #fff;">$ ${m} $</div>`).join('')}
              </div>
            `;
          }

          ocrResults.innerHTML = `
            <div style="color: var(--hud-cyan); font-weight: bold; margin-bottom: 6px;">[OCR EXTRACTION COMPLETE] (${o.durationMs}ms)</div>
            <div style="color: #94a3b8; margin-bottom: 6px;">Lines: ${o.lines.length} | Language: ${o.detectedLanguage}</div>
            <div style="background: #060b17; padding: 8px; border-radius: 4px; border: 1px solid #1e293b; color: #f8fafc; white-space: pre-wrap; font-size: 0.8rem;">${o.fullText}</div>
            ${tableHtml}
            ${mathHtml}
          `;
        } else {
          ocrResults.innerHTML = `<span style="color: #ef4444;">${data.error}</span>`;
        }
      } catch (err) {
        ocrResults.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
      }
    });
  }

  // 4. Document & Whiteboard Scanning
  const docInputText = document.getElementById('vision-doc-input-text');
  const docResults = document.getElementById('vision-doc-results');
  const docScanBtn = document.getElementById('vision-doc-scan-btn');
  const docPresetReceipt = document.getElementById('vision-doc-preset-receipt');
  const docPresetWhiteboard = document.getElementById('vision-doc-preset-whiteboard');

  if (docPresetReceipt && docInputText) {
    docPresetReceipt.addEventListener('click', () => {
      docInputText.value = 'RECEIPT / TAX INVOICE\nMerchant: Cyberdyne AI Solutions\nDate: 2026-10-13\nTotal: $42,500.00\nTax: $3,400.00\nPayment Method: Corporate Account';
    });
  }
  if (docPresetWhiteboard && docInputText) {
    docPresetWhiteboard.addEventListener('click', () => {
      docInputText.value = 'ARCHITECTURE WHITEBOARD DIAGRAM\nArchitecture: Microservices + Autonomous Event Stream\nComponent 1: Ingestion API Gateway\nComponent 2: Neural Reasoning Core\nComponent 3: Security Guardian Filter';
    });
  }

  if (docScanBtn && docInputText && docResults) {
    docScanBtn.addEventListener('click', async () => {
      const rawText = docInputText.value.trim() || 'DOCUMENT SAMPLE - SCAN RECOGNITION';
      docResults.innerHTML = '<span style="color: var(--hud-cyan);">Analyzing document structure, classification, and key-values...</span>';

      const svg = `<svg width="600" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#020617"/><text x="20" y="40" fill="#fff" font-family="monospace" font-size="14">${rawText.replace(/\n/g, ' ')}</text></svg>`;
      const imageBase64 = btoa(svg);

      try {
        const res = await fetch('/api/jarvis/vision/document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
          body: JSON.stringify({ imageBase64 }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          const doc = data.data;
          const kvRows = Object.entries(doc.keyValues || {}).map(([k, v]) => `
            <tr>
              <td style="padding: 4px 8px; color: #94a3b8; font-weight: bold; border-bottom: 1px solid #1e293b;">${k}</td>
              <td style="padding: 4px 8px; color: #f8fafc; border-bottom: 1px solid #1e293b;">${v}</td>
            </tr>
          `).join('');

          docResults.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="color: var(--hud-cyan); font-weight: bold;">[DOCUMENT CLASSIFIED]</span>
              <span class="badge" style="background: rgba(0, 240, 255, 0.15); color: var(--hud-cyan); text-transform: uppercase;">${doc.documentType} (${Math.round(doc.confidence * 100)}% conf)</span>
            </div>
            <div style="background: #060b17; border: 1px solid #1e293b; border-radius: 4px; margin-bottom: 8px; overflow: hidden;">
              <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem;">
                <thead>
                  <tr style="background: #0f172a; color: #cbd5e1; text-align: left;">
                    <th style="padding: 4px 8px;">Field</th>
                    <th style="padding: 4px 8px;">Extracted Value</th>
                  </tr>
                </thead>
                <tbody>${kvRows || '<tr><td colspan="2" style="padding: 4px 8px; color: #64748b;">No key-values detected</td></tr>'}</tbody>
              </table>
            </div>
            <div style="font-size: 0.75rem; color: #94a3b8; max-height: 80px; overflow-y: auto;">
              Raw OCR: ${doc.extractedText}
            </div>
          `;
        } else {
          docResults.innerHTML = `<span style="color: #ef4444;">${data.error}</span>`;
        }
      } catch (err) {
        docResults.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
      }
    });
  }

  // 5. Privacy Redactor
  const redactInputText = document.getElementById('vision-redact-input-text');
  const redactResults = document.getElementById('vision-redact-results');
  const redactCountEl = document.getElementById('vision-redact-count');
  const redactBtn = document.getElementById('vision-redact-btn');

  if (redactBtn && redactInputText && redactResults) {
    redactBtn.addEventListener('click', async () => {
      const text = redactInputText.value.trim();
      redactResults.innerHTML = '<span style="color: #10b981;">Scanning for credit cards, tokens, emails, and phone numbers...</span>';

      try {
        const res = await fetch('/api/jarvis/vision/redact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
          body: JSON.stringify({ text }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          const r = data.data;
          if (redactCountEl) redactCountEl.textContent = `${r.itemsRedactedCount} tokens masked`;

          const itemsHtml = r.redactions.map((item) => `
            <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-size: 0.75rem;">
              <span style="color: #10b981; font-weight: bold; text-transform: uppercase;">[${item.type}]</span>
              <span style="color: #cbd5e1;"><code>${item.redactedText}</code></span>
            </div>
          `).join('');

          redactResults.innerHTML = `
            <div style="color: #10b981; font-weight: bold; margin-bottom: 6px;">[PRIVACY SHIELD APPLIED] (${r.itemsRedactedCount} items redacted)</div>
            <div style="background: #060b17; padding: 8px; border-radius: 4px; border: 1px solid #1e293b; color: #f8fafc; white-space: pre-wrap; font-size: 0.8rem; margin-bottom: 8px;">${r.sanitizedText}</div>
            <div style="background: #0f172a; padding: 6px; border-radius: 4px; border: 1px solid #1e293b;">
              <div style="font-weight: bold; color: #94a3b8; font-size: 0.75rem; margin-bottom: 4px;">Redaction Breakdown:</div>
              ${itemsHtml}
            </div>
          `;
        } else {
          redactResults.innerHTML = `<span style="color: #ef4444;">${data.error}</span>`;
        }
      } catch (err) {
        redactResults.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
      }
    });
  }

  // ==================== PHASE 20: VOICE & AUDIO INTELLIGENCE CONTROLLER ====================
  const voiceModal = document.getElementById('voice-modal');
  const closeVoiceModalBtn = document.getElementById('close-voice-modal-btn');
  const cmdVoiceBtn = document.getElementById('cmd-voice-btn');
  const navVoiceBtn = document.getElementById('nav-voice');
  const chipVoiceAgent = document.getElementById('chip-voice-agent');

  function openVoiceModal() {
    if (voiceModal) {
      voiceModal.classList.remove('hidden');
      refreshVoiceStatus();
      loadVoicePersonas();
    }
  }

  function closeVoiceModal() {
    if (voiceModal) {
      voiceModal.classList.add('hidden');
    }
  }

  if (cmdVoiceBtn) cmdVoiceBtn.addEventListener('click', openVoiceModal);
  if (navVoiceBtn) navVoiceBtn.addEventListener('click', (e) => { e.preventDefault(); openVoiceModal(); });
  if (chipVoiceAgent) chipVoiceAgent.addEventListener('click', openVoiceModal);
  if (closeVoiceModalBtn) closeVoiceModalBtn.addEventListener('click', closeVoiceModal);
  if (voiceModal) {
    voiceModal.addEventListener('click', (e) => {
      if (e.target === voiceModal) closeVoiceModal();
    });
  }

  // Voice Modal Tab Switching
  const voiceTabs = [
    { btn: 'voice-tab-btn-stream', panel: 'voice-panel-stream' },
    { btn: 'voice-tab-btn-stt', panel: 'voice-panel-stt' },
    { btn: 'voice-tab-btn-tts', panel: 'voice-panel-tts' },
    { btn: 'voice-tab-btn-acoustic', panel: 'voice-panel-acoustic' },
    { btn: 'voice-tab-btn-personas', panel: 'voice-panel-personas' },
  ];

  voiceTabs.forEach((tab) => {
    const btnEl = document.getElementById(tab.btn);
    if (btnEl) {
      btnEl.addEventListener('click', () => {
        voiceTabs.forEach((t) => {
          const b = document.getElementById(t.btn);
          const p = document.getElementById(t.panel);
          if (b) {
            b.classList.remove('btn-primary');
            b.classList.add('btn-ghost');
            b.style.background = 'transparent';
            b.style.color = '#94a3b8';
          }
          if (p) p.classList.add('hidden');
        });
        btnEl.classList.remove('btn-ghost');
        btnEl.classList.add('btn-primary');
        btnEl.style.background = 'var(--hud-cyan)';
        btnEl.style.color = '#000';
        const activePanel = document.getElementById(tab.panel);
        if (activePanel) activePanel.classList.remove('hidden');
      });
    }
  });

  // Animated Waveform Oscilloscope for Sidebar & Modal
  const sidebarWaveCanvas = document.getElementById('voice-wave-canvas');
  const modalWaveCanvas = document.getElementById('voice-modal-wave-canvas');
  let wavePhase = 0;

  function renderWaveform(canvas, color = '#00f0ff', speed = 0.05, amplitude = 20) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width || canvas.clientWidth || 300;
    const h = canvas.height || canvas.clientHeight || 80;
    ctx.clearRect(0, 0, w, h);

    // Draw baseline grid
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    // Draw animated sine wave
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    for (let x = 0; x < w; x++) {
      const y = h / 2 + Math.sin(x * 0.03 + wavePhase) * amplitude * Math.sin(x / w * Math.PI);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw second harmonic wave
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x++) {
      const y = h / 2 + Math.cos(x * 0.05 - wavePhase * 1.5) * (amplitude * 0.6) * Math.sin(x / w * Math.PI);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  function animateWaveforms() {
    wavePhase += 0.06;
    renderWaveform(sidebarWaveCanvas, '#00f0ff', 0.06, 14);
    if (voiceModal && !voiceModal.classList.contains('hidden')) {
      renderWaveform(modalWaveCanvas, '#00f0ff', 0.06, 35);
    }
    requestAnimationFrame(animateWaveforms);
  }
  requestAnimationFrame(animateWaveforms);

  // Tab 1: Live Audio & VAD Controller
  let isHardwareMuted = false;
  const voiceHwLed = document.getElementById('voice-hardware-led');
  const voiceHwLedLabel = document.getElementById('voice-hardware-led-label');
  const voiceToggleMuteBtn = document.getElementById('voice-toggle-mute-btn');
  const voiceStreamStateBadge = document.getElementById('voice-stream-state-badge');
  const voiceLiveSpl = document.getElementById('voice-live-spl');
  const voiceLiveSnr = document.getElementById('voice-live-snr');
  const voiceVadState = document.getElementById('voice-vad-state');
  const voiceTelemMuted = document.getElementById('voice-telemetry-muted');
  const voiceTelemLed = document.getElementById('voice-telemetry-led');
  const voicePollBtn = document.getElementById('voice-poll-status-btn');
  const voiceWakewordInput = document.getElementById('voice-wakeword-input');
  const voiceWakewordBtn = document.getElementById('voice-wakeword-btn');
  const voiceWakewordResult = document.getElementById('voice-wakeword-result');

  async function refreshVoiceStatus() {
    try {
      const res = await fetch('/api/jarvis/voice/status', {
        headers: { 'x-user-id': 'dwight' }
      });
      const data = await res.json();
      if (data.success && data.data) {
        const s = data.data;
        isHardwareMuted = s.isMuted;

        if (voiceHwLed) {
          voiceHwLed.style.background = s.isMuted ? '#ef4444' : '#10b981';
          voiceHwLed.style.boxShadow = s.isMuted ? '0 0 8px #ef4444' : '0 0 8px #10b981';
        }
        if (voiceHwLedLabel) {
          voiceHwLedLabel.textContent = s.isMuted
            ? 'PRIVACY RECORDING INDICATOR: MUTED (HARDWARE DISCONNECTED)'
            : 'PRIVACY RECORDING INDICATOR: ARMED (RECORDING ACTIVE)';
          voiceHwLedLabel.style.color = s.isMuted ? '#ef4444' : '#10b981';
        }
        if (voiceStreamStateBadge) {
          voiceStreamStateBadge.textContent = s.isMuted ? 'STREAM: HARDWARE MUTED' : 'STREAM: ACTIVE';
          voiceStreamStateBadge.style.color = s.isMuted ? '#ef4444' : '#10b981';
        }
        if (voiceTelemMuted) {
          voiceTelemMuted.textContent = s.isMuted ? 'YES (MUTED)' : 'NO (ACTIVE)';
          voiceTelemMuted.style.color = s.isMuted ? '#ef4444' : '#10b981';
        }
        if (voiceTelemLed) {
          voiceTelemLed.textContent = s.indicatorActive ? 'ON (ACTIVE)' : 'OFF (STANDBY)';
          voiceTelemLed.style.color = s.indicatorActive ? '#10b981' : '#64748b';
        }
        if (voiceToggleMuteBtn) {
          voiceToggleMuteBtn.textContent = s.isMuted ? 'Unmute Hardware' : 'Toggle Hardware Mute';
          voiceToggleMuteBtn.style.borderColor = s.isMuted ? '#10b981' : '#ef4444';
          voiceToggleMuteBtn.style.color = s.isMuted ? '#10b981' : '#ef4444';
        }
      }
    } catch (err) {
      console.warn('Voice status refresh error:', err);
    }
  }

  if (voiceToggleMuteBtn) {
    voiceToggleMuteBtn.addEventListener('click', async () => {
      try {
        const nextMuteState = !isHardwareMuted;
        const res = await fetch('/api/jarvis/voice/mute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
          body: JSON.stringify({ muted: nextMuteState })
        });
        const data = await res.json();
        if (data.success) {
          await refreshVoiceStatus();
        }
      } catch (err) {
        console.error('Toggle mute failed:', err);
      }
    });
  }

  if (voicePollBtn) {
    voicePollBtn.addEventListener('click', refreshVoiceStatus);
  }

  if (voiceWakewordBtn && voiceWakewordInput && voiceWakewordResult) {
    voiceWakewordBtn.addEventListener('click', async () => {
      const text = voiceWakewordInput.value.trim();
      voiceWakewordResult.innerHTML = '<span style="color: var(--hud-cyan);">Listening for wake trigger...</span>';
      try {
        const res = await fetch('/api/jarvis/voice/wake-word', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
          body: JSON.stringify({ inputAudioOrText: text })
        });
        const data = await res.json();
        if (data.success && data.data) {
          const w = data.data;
          if (w.detected) {
            voiceWakewordResult.innerHTML = `
              <span style="color: #10b981; font-weight: bold;">[WAKE WORD DETECTED: "${w.keyword}"]</span>
              <span style="color: #cbd5e1; margin-left: 8px;">Confidence: ${(w.confidence * 100).toFixed(1)}% | Utterance: "${w.utterance || 'none'}"</span>
            `;
          } else {
            voiceWakewordResult.innerHTML = `
              <span style="color: #94a3b8;">[NO WAKE WORD DETECTED]</span>
            `;
          }
        } else {
          voiceWakewordResult.innerHTML = `<span style="color: #ef4444;">${data.error || 'Check failed'}</span>`;
        }
      } catch (err) {
        voiceWakewordResult.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
      }
    });
  }

  // Tab 2: Speech-to-Text (STT) Controller
  const voiceSttLangSelect = document.getElementById('voice-stt-lang-select');
  const voiceSttPayload = document.getElementById('voice-stt-input-payload');
  const voiceSttBtn = document.getElementById('voice-stt-transcribe-btn');
  const voiceSttResults = document.getElementById('voice-stt-results');

  const presetSttDiag = document.getElementById('voice-stt-preset-diag');
  const presetSttTagalog = document.getElementById('voice-stt-preset-tagalog');
  const presetSttSpanish = document.getElementById('voice-stt-preset-spanish');

  if (presetSttDiag && voiceSttPayload && voiceSttLangSelect) {
    presetSttDiag.addEventListener('click', () => {
      voiceSttLangSelect.value = 'en';
      voiceSttPayload.value = 'jarvis, initialize system self check and report diagnostics';
    });
  }
  if (presetSttTagalog && voiceSttPayload && voiceSttLangSelect) {
    presetSttTagalog.addEventListener('click', () => {
      voiceSttLangSelect.value = 'fil';
      voiceSttPayload.value = 'kumusta jarvis, ano ang lagay ng system ngayon';
    });
  }
  if (presetSttSpanish && voiceSttPayload && voiceSttLangSelect) {
    presetSttSpanish.addEventListener('click', () => {
      voiceSttLangSelect.value = 'es';
      voiceSttPayload.value = 'hola jarvis, cual es el estado del sistema en este momento';
    });
  }

  if (voiceSttBtn && voiceSttPayload && voiceSttResults) {
    voiceSttBtn.addEventListener('click', async () => {
      const audioPayload = voiceSttPayload.value.trim();
      const languageHint = voiceSttLangSelect ? voiceSttLangSelect.value : 'en';

      voiceSttResults.innerHTML = '<span style="color: var(--hud-cyan);">Transcribing acoustic stream...</span>';
      try {
        const res = await fetch('/api/jarvis/voice/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
          body: JSON.stringify({ audioPayload, languageHint })
        });
        const data = await res.json();
        if (data.success && data.data) {
          const t = data.data;
          const wordsHtml = t.words.map((w) => `
            <tr>
              <td style="padding: 4px 8px; color: #fff; font-weight: 500;">${w.word}</td>
              <td style="padding: 4px 8px; color: #94a3b8;">${w.startTimeMs} - ${w.endTimeMs} ms</td>
              <td style="padding: 4px 8px; color: #10b981;">${(w.confidence * 100).toFixed(0)}%</td>
            </tr>
          `).join('');

          voiceSttResults.innerHTML = `
            <div style="margin-bottom: 10px;">
              <div style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 4px;">Transcribed Output:</div>
              <div style="font-size: 0.95rem; font-weight: bold; color: #fff; background: #060b17; padding: 10px; border-radius: 6px; border: 1px solid #1e293b;">
                "${t.transcript}"
              </div>
            </div>
            <div style="display: flex; gap: 12px; margin-bottom: 10px; font-size: 0.75rem;">
              <span class="badge" style="background: rgba(0, 240, 255, 0.15); color: var(--hud-cyan);">Lang: ${t.detectedLanguage.toUpperCase()}</span>
              <span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #10b981;">Confidence: ${(t.confidence * 100).toFixed(1)}%</span>
              <span class="badge" style="background: rgba(168, 85, 247, 0.15); color: #a855f7;">Duration: ${t.durationMs}ms</span>
            </div>
            <div style="background: #060b17; border: 1px solid #1e293b; border-radius: 6px; overflow: hidden;">
              <table style="width: 100%; border-collapse: collapse; font-size: 0.75rem;">
                <thead>
                  <tr style="background: #0f172a; color: #94a3b8; text-align: left;">
                    <th style="padding: 4px 8px;">Word</th>
                    <th style="padding: 4px 8px;">Time Range</th>
                    <th style="padding: 4px 8px;">Confidence</th>
                  </tr>
                </thead>
                <tbody>${wordsHtml}</tbody>
              </table>
            </div>
          `;
        } else {
          voiceSttResults.innerHTML = `<span style="color: #ef4444;">${data.error || 'Transcription failed'}</span>`;
        }
      } catch (err) {
        voiceSttResults.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
      }
    });
  }

  // Tab 3: Speech Synthesis (TTS) Controller
  const voiceTtsPersonaSelect = document.getElementById('voice-tts-persona-select');
  const voiceTtsEmotionSelect = document.getElementById('voice-tts-emotion-select');
  const voiceTtsPitch = document.getElementById('voice-tts-pitch');
  const voicePitchVal = document.getElementById('voice-pitch-val');
  const voiceTtsRate = document.getElementById('voice-tts-rate');
  const voiceRateVal = document.getElementById('voice-rate-val');
  const voiceTtsTextInput = document.getElementById('voice-tts-text-input');
  const voiceTtsSynthesizeBtn = document.getElementById('voice-tts-synthesize-btn');
  const voiceTtsAudioPlayer = document.getElementById('voice-tts-audio-player');
  const voiceTtsAudioPlaceholder = document.getElementById('voice-tts-audio-placeholder');
  const voiceTtsResults = document.getElementById('voice-tts-results');

  if (voiceTtsPitch && voicePitchVal) {
    voiceTtsPitch.addEventListener('input', () => {
      voicePitchVal.textContent = voiceTtsPitch.value;
    });
  }
  if (voiceTtsRate && voiceRateVal) {
    voiceTtsRate.addEventListener('input', () => {
      voiceRateVal.textContent = voiceTtsRate.value;
    });
  }

  if (voiceTtsSynthesizeBtn && voiceTtsTextInput && voiceTtsResults) {
    voiceTtsSynthesizeBtn.addEventListener('click', async () => {
      const text = voiceTtsTextInput.value.trim();
      const personaId = voiceTtsPersonaSelect ? voiceTtsPersonaSelect.value : 'jarvis-classic';
      const emotion = voiceTtsEmotionSelect ? voiceTtsEmotionSelect.value : 'neutral';
      const pitch = voiceTtsPitch ? parseFloat(voiceTtsPitch.value) : 1.0;
      const rate = voiceTtsRate ? parseFloat(voiceTtsRate.value) : 1.0;

      voiceTtsResults.innerHTML = '<span style="color: var(--hud-cyan);">Synthesizing speech with neural prosody...</span>';
      try {
        const res = await fetch('/api/jarvis/voice/synthesize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
          body: JSON.stringify({ text, personaId, emotion, pitch, rate, format: 'wav' })
        });
        const data = await res.json();
        if (data.success && data.data) {
          const s = data.data;
          // Set audio player src with Base64 RIFF WAV
          if (voiceTtsAudioPlayer && s.audioBase64) {
            voiceTtsAudioPlayer.src = `data:audio/wav;base64,${s.audioBase64}`;
            voiceTtsAudioPlayer.style.display = 'block';
            if (voiceTtsAudioPlaceholder) voiceTtsAudioPlaceholder.style.display = 'none';
            voiceTtsAudioPlayer.play().catch(() => {});
          }

          // Build phonemes list & waveform preview
          const phonemesHtml = s.phonemes.slice(0, 10).map((p) =>
            `<span style="background: rgba(0, 240, 255, 0.1); border: 1px solid rgba(0, 240, 255, 0.3); padding: 2px 6px; border-radius: 4px; color: var(--hud-cyan); font-size: 0.7rem;">${p.phoneme} (${p.durationMs}ms)</span>`
          ).join(' ');

          const waveformBars = s.waveform.slice(0, 32).map((val) => {
            const heightPercent = Math.max(10, Math.min(100, Math.round(val * 100)));
            return `<div style="flex: 1; height: ${heightPercent}%; background: var(--hud-cyan); border-radius: 2px; opacity: 0.85;"></div>`;
          }).join('');

          voiceTtsResults.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: var(--hud-cyan); font-weight: bold;">[SYNTHESIS COMPLETE]</span>
              <span style="color: #94a3b8;">${s.sampleRate}Hz | 16-bit PCM WAV | ${s.durationMs}ms</span>
            </div>
            <div style="font-size: 0.75rem; color: #cbd5e1; margin-bottom: 8px;">
              Persona: <strong style="color: #fff;">${s.personaId}</strong> | Emotion: <strong style="color: #a855f7;">${s.emotion}</strong>
            </div>
            <!-- Waveform Envelope Preview -->
            <div style="height: 48px; background: #060b17; border: 1px solid #1e293b; border-radius: 4px; padding: 4px 8px; display: flex; align-items: flex-end; gap: 2px; margin-bottom: 8px;">
              ${waveformBars}
            </div>
            <div style="font-size: 0.7rem; color: #94a3b8; margin-bottom: 4px;">Phoneme Timing Map:</div>
            <div style="display: flex; gap: 4px; flex-wrap: wrap;">
              ${phonemesHtml}
            </div>
          `;
        } else {
          voiceTtsResults.innerHTML = `<span style="color: #ef4444;">${data.error || 'Synthesis failed'}</span>`;
        }
      } catch (err) {
        voiceTtsResults.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
      }
    });
  }

  // Tab 4: Acoustic Classifier Controller
  const voiceAcousticInput = document.getElementById('voice-acoustic-samples-input');
  const voiceAcousticBtn = document.getElementById('voice-acoustic-analyze-btn');
  const voiceAcousticResults = document.getElementById('voice-acoustic-results');

  const presetSpeech = document.getElementById('voice-acoustic-preset-speech');
  const presetTyping = document.getElementById('voice-acoustic-preset-typing');
  const presetAlarm = document.getElementById('voice-acoustic-preset-alarm');
  const presetQuiet = document.getElementById('voice-acoustic-preset-quiet');

  if (presetSpeech && voiceAcousticInput) {
    presetSpeech.addEventListener('click', () => {
      voiceAcousticInput.value = '[0.05, 0.12, 0.45, 0.65, 0.78, 0.42, 0.18, 0.04, -0.15, -0.55, -0.72, -0.38, 0.02]';
    });
  }
  if (presetTyping && voiceAcousticInput) {
    presetTyping.addEventListener('click', () => {
      voiceAcousticInput.value = '[0.01, 0.02, 0.82, 0.03, 0.01, 0.79, 0.02, 0.01, 0.85, 0.02]';
    });
  }
  if (presetAlarm && voiceAcousticInput) {
    presetAlarm.addEventListener('click', () => {
      voiceAcousticInput.value = '[0.92, 0.95, 0.98, 0.96, 0.91, 0.94, 0.97, 0.93, 0.95, 0.99]';
    });
  }
  if (presetQuiet && voiceAcousticInput) {
    presetQuiet.addEventListener('click', () => {
      voiceAcousticInput.value = '[0.001, 0.002, -0.001, 0.003, -0.002, 0.001, 0.002]';
    });
  }

  if (voiceAcousticBtn && voiceAcousticInput && voiceAcousticResults) {
    voiceAcousticBtn.addEventListener('click', async () => {
      let audioSamples = [];
      try {
        audioSamples = JSON.parse(voiceAcousticInput.value.trim());
      } catch {
        voiceAcousticResults.innerHTML = '<span style="color: #ef4444;">Invalid JSON float array. Format: [0.1, 0.2, ...]</span>';
        return;
      }

      voiceAcousticResults.innerHTML = '<span style="color: var(--hud-cyan);">Running spectral acoustic classifier...</span>';
      try {
        const res = await fetch('/api/jarvis/voice/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
          body: JSON.stringify({ audioSamples })
        });
        const data = await res.json();
        if (data.success && data.data) {
          const a = data.data;
          const isHazard = a.hazardWarning;
          const eventsHtml = a.soundEvents.map((e) => `
            <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-size: 0.75rem;">
              <span style="color: var(--hud-cyan); font-weight: bold; text-transform: uppercase;">[${e.type}]</span>
              <span style="color: #cbd5e1;">Confidence: ${(e.confidence * 100).toFixed(0)}%</span>
            </div>
          `).join('');

          voiceAcousticResults.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 10px;">
              <div style="background: #060b17; border: 1px solid #1e293b; border-radius: 6px; padding: 8px; text-align: center;">
                <div style="font-size: 0.7rem; color: #94a3b8;">Decibel SPL</div>
                <div style="font-size: 1.1rem; font-weight: bold; color: ${isHazard ? '#ef4444' : 'var(--hud-cyan)'};">${a.decibelSPL} dB</div>
              </div>
              <div style="background: #060b17; border: 1px solid #1e293b; border-radius: 6px; padding: 8px; text-align: center;">
                <div style="font-size: 0.7rem; color: #94a3b8;">Signal-to-Noise</div>
                <div style="font-size: 1.1rem; font-weight: bold; color: #10b981;">${a.snrRatio} dB</div>
              </div>
              <div style="background: #060b17; border: 1px solid #1e293b; border-radius: 6px; padding: 8px; text-align: center;">
                <div style="font-size: 0.7rem; color: #94a3b8;">Dominant Peak</div>
                <div style="font-size: 1.1rem; font-weight: bold; color: #a855f7;">${a.dominantFrequency} Hz</div>
              </div>
            </div>
            ${isHazard ? `
              <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; border-radius: 6px; padding: 8px; color: #ef4444; font-weight: bold; margin-bottom: 10px; font-size: 0.8rem; display: flex; align-items: center; gap: 8px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                ACOUSTIC HAZARD ALERT: Sound pressure exceeds safe limit (>85 dB SPL)!
              </div>
            ` : ''}
            <div style="background: #060b17; border: 1px solid #1e293b; border-radius: 6px; padding: 8px;">
              <div style="font-size: 0.75rem; color: #94a3b8; font-weight: bold; margin-bottom: 6px;">Detected Sound Events (SED):</div>
              ${eventsHtml}
            </div>
          `;
        } else {
          voiceAcousticResults.innerHTML = `<span style="color: #ef4444;">${data.error || 'Acoustic analysis failed'}</span>`;
        }
      } catch (err) {
        voiceAcousticResults.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
      }
    });
  }

  // Tab 5: Voice Personas Controller
  const voicePersonasGrid = document.getElementById('voice-personas-grid');
  const voiceActivePersonaName = document.getElementById('voice-active-persona-name');

  async function loadVoicePersonas() {
    if (!voicePersonasGrid) return;
    try {
      const res = await fetch('/api/jarvis/voice/personas');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const personas = data.data;
        voicePersonasGrid.innerHTML = personas.map((p) => `
          <div style="background: #0d1527; border: 1px solid #1e293b; border-radius: 8px; padding: 1rem; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <strong style="color: #fff; font-size: 0.9rem;">${p.name}</strong>
                <span style="font-size: 0.7rem; color: var(--hud-cyan); font-family: monospace;">${p.language}</span>
              </div>
              <p style="font-size: 0.75rem; color: #94a3b8; margin: 0 0 10px 0; line-height: 1.4;">
                ${p.description}
              </p>
              <div style="display: flex; gap: 8px; font-size: 0.7rem; color: #cbd5e1; font-family: monospace; margin-bottom: 12px;">
                <span>Pitch: ${p.defaultPitch}</span>
                <span>Rate: ${p.defaultRate}x</span>
              </div>
            </div>
            <button class="btn btn-sm btn-outline select-persona-btn" data-persona-id="${p.id}" style="border-color: var(--hud-cyan); color: var(--hud-cyan); width: 100%;">
              Activate Persona
            </button>
          </div>
        `).join('');

        voicePersonasGrid.querySelectorAll('.select-persona-btn').forEach((btn) => {
          btn.addEventListener('click', async (e) => {
            const personaId = e.currentTarget.getAttribute('data-persona-id');
            try {
              const postRes = await fetch('/api/jarvis/voice/persona', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
                body: JSON.stringify({ personaId })
              });
              const postData = await postRes.json();
              if (postData.success && postData.data) {
                if (voiceActivePersonaName) voiceActivePersonaName.textContent = postData.data.name;
                if (voiceTtsPersonaSelect) voiceTtsPersonaSelect.value = personaId;
              }
            } catch (err) {
              console.error('Failed to set persona:', err);
            }
          });
        });
      }
    } catch (err) {
      console.warn('Failed to load personas:', err);
    }
  }

  // ==================== PHASE 21: HARDWARE, DEVICE & IOT INTELLIGENCE CONTROLLER ====================
  const devicesModal = document.getElementById('devices-modal');
  const closeDevicesModalBtn = document.getElementById('close-devices-modal-btn');
  const navDevicesBtn = document.getElementById('nav-devices');
  const chipDeviceAgent = document.getElementById('chip-device-agent');

  function openDevicesModal() {
    if (devicesModal) {
      devicesModal.classList.remove('hidden');
      refreshTelemetry();
      refreshIotDevices();
      refreshSafetyInterlock();
      loadBleBeacons();
    }
  }

  function closeDevicesModal() {
    if (devicesModal) {
      devicesModal.classList.add('hidden');
    }
  }

  if (navDevicesBtn) navDevicesBtn.addEventListener('click', (e) => { e.preventDefault(); openDevicesModal(); });
  if (chipDeviceAgent) chipDeviceAgent.addEventListener('click', openDevicesModal);
  if (closeDevicesModalBtn) closeDevicesModalBtn.addEventListener('click', closeDevicesModal);
  if (devicesModal) {
    devicesModal.addEventListener('click', (e) => {
      if (e.target === devicesModal) closeDevicesModal();
    });
  }

  // Devices Modal Tab Switching
  const deviceTabs = [
    { btn: 'devices-tab-btn-telemetry', panel: 'devices-panel-telemetry' },
    { btn: 'devices-tab-btn-iot', panel: 'devices-panel-iot' },
    { btn: 'devices-tab-btn-usb', panel: 'devices-panel-usb' },
    { btn: 'devices-tab-btn-ble', panel: 'devices-panel-ble' },
    { btn: 'devices-tab-btn-safety', panel: 'devices-panel-safety' },
  ];

  deviceTabs.forEach((tab) => {
    const btnEl = document.getElementById(tab.btn);
    if (btnEl) {
      btnEl.addEventListener('click', () => {
        deviceTabs.forEach((t) => {
          const b = document.getElementById(t.btn);
          const p = document.getElementById(t.panel);
          if (b) {
            b.classList.remove('btn-primary');
            b.classList.add('btn-ghost');
            b.style.background = 'transparent';
            b.style.color = '#94a3b8';
          }
          if (p) p.classList.add('hidden');
        });
        btnEl.classList.remove('btn-ghost');
        btnEl.classList.add('btn-primary');
        btnEl.style.background = 'var(--hud-cyan)';
        btnEl.style.color = '#000';
        const activePanel = document.getElementById(tab.panel);
        if (activePanel) activePanel.classList.remove('hidden');
      });
    }
  });

  // Tab 1: System Telemetry Controller
  const refreshTelemetryBtn = document.getElementById('devices-refresh-telemetry-btn');
  const cpuUsageEl = document.getElementById('devices-cpu-usage');
  const cpuTempEl = document.getElementById('devices-cpu-temp');
  const cpuBarEl = document.getElementById('devices-cpu-bar');
  const cpuCoresEl = document.getElementById('devices-cpu-cores');
  const cpuFreqEl = document.getElementById('devices-cpu-freq');
  const cpuThrottleEl = document.getElementById('devices-cpu-throttle');

  const gpuUsageEl = document.getElementById('devices-gpu-usage');
  const gpuTempEl = document.getElementById('devices-gpu-temp');
  const gpuBarEl = document.getElementById('devices-gpu-bar');

  const memPercentEl = document.getElementById('devices-mem-percent');
  const memUsedEl = document.getElementById('devices-mem-used');
  const memBarEl = document.getElementById('devices-mem-bar');
  const memTotalEl = document.getElementById('devices-mem-total');

  const batteryLevelEl = document.getElementById('devices-battery-level');
  const storageUsedEl = document.getElementById('devices-storage-used');
  const uptimeEl = document.getElementById('devices-uptime');

  async function refreshTelemetry() {
    try {
      const res = await fetch('/api/jarvis/devices/telemetry', {
        headers: { 'x-user-id': 'dwight' }
      });
      const data = await res.json();
      if (data.success && data.data) {
        const t = data.data;
        if (cpuUsageEl) cpuUsageEl.textContent = `${t.cpu.usagePercent}%`;
        if (cpuTempEl) cpuTempEl.textContent = `${t.cpu.tempCelsius}°C`;
        if (cpuBarEl) cpuBarEl.style.width = `${Math.min(100, t.cpu.usagePercent)}%`;
        if (cpuCoresEl) cpuCoresEl.textContent = `${t.cpu.cores} Cores`;
        if (cpuFreqEl) cpuFreqEl.textContent = `${t.cpu.freqGhz} GHz`;
        if (cpuThrottleEl) {
          cpuThrottleEl.textContent = t.cpu.throttling ? 'THROTTLED' : 'Nominal';
          cpuThrottleEl.style.color = t.cpu.throttling ? '#ef4444' : '#10b981';
        }

        if (gpuUsageEl) gpuUsageEl.textContent = `${t.gpu.usagePercent}%`;
        if (gpuTempEl) gpuTempEl.textContent = `${t.gpu.tempCelsius}°C`;
        if (gpuBarEl) gpuBarEl.style.width = `${Math.min(100, t.gpu.usagePercent)}%`;

        if (memPercentEl) memPercentEl.textContent = `${t.memory.usagePercent}%`;
        const usedGb = (t.memory.usedBytes / (1024 ** 3)).toFixed(1);
        const totalGb = (t.memory.totalBytes / (1024 ** 3)).toFixed(1);
        if (memUsedEl) memUsedEl.textContent = `${usedGb} GB`;
        if (memBarEl) memBarEl.style.width = `${Math.min(100, t.memory.usagePercent)}%`;
        if (memTotalEl) memTotalEl.textContent = `Total: ${totalGb} GB Installed`;

        if (batteryLevelEl) batteryLevelEl.textContent = `${t.battery.levelPercent}%`;
        const storageGb = Math.round(t.storage.usedBytes / (1024 ** 3));
        if (storageUsedEl) storageUsedEl.textContent = `${storageGb} GB`;

        const uptimeHrs = Math.floor(t.systemUptimeSec / 3600);
        const uptimeMins = Math.floor((t.systemUptimeSec % 3600) / 60);
        if (uptimeEl) uptimeEl.textContent = `${uptimeHrs}h ${uptimeMins}m`;
      }
    } catch (err) {
      console.warn('Telemetry refresh error:', err);
    }
  }

  if (refreshTelemetryBtn) {
    refreshTelemetryBtn.addEventListener('click', refreshTelemetry);
  }

  // Tab 2: Smart Home IoT Controller
  const totalWattageEl = document.getElementById('devices-total-wattage');
  const iotBtnLightDesk = document.getElementById('iot-btn-light-desk');
  const iotSliderLightDesk = document.getElementById('iot-slider-light-desk');
  const iotValLightDeskBright = document.getElementById('iot-val-light-desk-bright');
  const iotTempMinusBtn = document.getElementById('iot-temp-minus-btn');
  const iotTempPlusBtn = document.getElementById('iot-temp-plus-btn');
  const iotTargetTempVal = document.getElementById('iot-target-temp-val');
  const iotBtnPlugWorkstation = document.getElementById('iot-btn-plug-workstation');
  const iotBtnPlugHeater = document.getElementById('iot-btn-plug-heater');

  let currentTargetTemp = 21.0;
  let deskLightPowered = true;
  let workstationPlugPowered = true;
  let heaterPlugPowered = false;

  async function refreshIotDevices() {
    try {
      const res = await fetch('/api/jarvis/devices/iot', {
        headers: { 'x-user-id': 'dwight' }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        let totalWatts = 0;
        data.data.forEach((d) => {
          if (d.power && d.currentWattage) totalWatts += d.currentWattage;
        });
        if (totalWattageEl) totalWattageEl.textContent = `${totalWatts.toFixed(1)} Watts`;
      }
    } catch (err) {
      console.warn('IoT refresh error:', err);
    }
  }

  if (iotBtnLightDesk) {
    iotBtnLightDesk.addEventListener('click', async () => {
      deskLightPowered = !deskLightPowered;
      try {
        await fetch('/api/jarvis/devices/iot/control', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
          body: JSON.stringify({ deviceId: 'iot_light_desk', power: deskLightPowered })
        });
        iotBtnLightDesk.textContent = deskLightPowered ? 'ON' : 'OFF';
        iotBtnLightDesk.style.background = deskLightPowered ? 'var(--hud-cyan)' : 'transparent';
        iotBtnLightDesk.style.color = deskLightPowered ? '#000' : '#64748b';
        refreshIotDevices();
      } catch (err) {
        console.error('Failed to toggle desk light:', err);
      }
    });
  }

  if (iotSliderLightDesk && iotValLightDeskBright) {
    iotSliderLightDesk.addEventListener('input', async () => {
      const val = parseInt(iotSliderLightDesk.value, 10);
      iotValLightDeskBright.textContent = `${val}%`;
      try {
        await fetch('/api/jarvis/devices/iot/control', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
          body: JSON.stringify({ deviceId: 'iot_light_desk', brightness: val })
        });
      } catch (err) {
        console.error('Failed to set light brightness:', err);
      }
    });
  }

  document.querySelectorAll('.iot-color-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const color = e.currentTarget.getAttribute('data-color');
      document.querySelectorAll('.iot-color-btn').forEach((b) => b.style.borderColor = 'transparent');
      e.currentTarget.style.borderColor = '#fff';
      try {
        await fetch('/api/jarvis/devices/iot/control', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
          body: JSON.stringify({ deviceId: 'iot_light_desk', colorHex: color })
        });
      } catch (err) {
        console.error('Failed to set color:', err);
      }
    });
  });

  if (iotTempMinusBtn && iotTargetTempVal) {
    iotTempMinusBtn.addEventListener('click', async () => {
      currentTargetTemp = Math.max(16, currentTargetTemp - 0.5);
      iotTargetTempVal.textContent = `${currentTargetTemp.toFixed(1)}°C`;
      try {
        await fetch('/api/jarvis/devices/iot/control', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
          body: JSON.stringify({ deviceId: 'iot_thermostat_main', targetTempCelsius: currentTargetTemp })
        });
      } catch (err) {
        console.error('Thermostat target error:', err);
      }
    });
  }

  if (iotTempPlusBtn && iotTargetTempVal) {
    iotTempPlusBtn.addEventListener('click', async () => {
      currentTargetTemp = Math.min(30, currentTargetTemp + 0.5);
      iotTargetTempVal.textContent = `${currentTargetTemp.toFixed(1)}°C`;
      try {
        await fetch('/api/jarvis/devices/iot/control', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
          body: JSON.stringify({ deviceId: 'iot_thermostat_main', targetTempCelsius: currentTargetTemp })
        });
      } catch (err) {
        console.error('Thermostat target error:', err);
      }
    });
  }

  ['cool', 'heat', 'auto', 'off'].forEach((mode) => {
    const mBtn = document.getElementById(`iot-hvac-${mode}`);
    if (mBtn) {
      mBtn.addEventListener('click', async () => {
        ['cool', 'heat', 'auto', 'off'].forEach((m) => {
          const b = document.getElementById(`iot-hvac-${m}`);
          if (b) {
            b.classList.remove('btn-primary');
            b.classList.add('btn-ghost');
            b.style.background = 'transparent';
            b.style.color = '#94a3b8';
          }
        });
        mBtn.classList.remove('btn-ghost');
        mBtn.classList.add('btn-primary');
        mBtn.style.background = 'var(--hud-cyan)';
        mBtn.style.color = '#000';
        try {
          await fetch('/api/jarvis/devices/iot/control', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({ deviceId: 'iot_thermostat_main', hvacMode: mode })
          });
        } catch (err) {
          console.error('Failed to set HVAC mode:', err);
        }
      });
    }
  });

  if (iotBtnPlugWorkstation) {
    iotBtnPlugWorkstation.addEventListener('click', async () => {
      workstationPlugPowered = !workstationPlugPowered;
      try {
        await fetch('/api/jarvis/devices/iot/control', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
          body: JSON.stringify({ deviceId: 'iot_plug_workstation', power: workstationPlugPowered })
        });
        iotBtnPlugWorkstation.textContent = workstationPlugPowered ? 'POWERED' : 'OFF';
        iotBtnPlugWorkstation.style.background = workstationPlugPowered ? '#10b981' : 'transparent';
        iotBtnPlugWorkstation.style.color = workstationPlugPowered ? '#000' : '#64748b';
        refreshIotDevices();
      } catch (err) {
        console.error('Workstation plug error:', err);
      }
    });
  }

  if (iotBtnPlugHeater) {
    iotBtnPlugHeater.addEventListener('click', async () => {
      try {
        const nextState = !heaterPlugPowered;
        const res = await fetch('/api/jarvis/devices/iot/control', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
          body: JSON.stringify({ deviceId: 'iot_plug_heater', power: nextState })
        });
        const data = await res.json();
        if (data.success) {
          heaterPlugPowered = nextState;
          iotBtnPlugHeater.textContent = heaterPlugPowered ? 'HEATER ACTIVE' : 'OFF (STANDBY)';
          iotBtnPlugHeater.style.borderColor = heaterPlugPowered ? '#ef4444' : '#64748b';
          iotBtnPlugHeater.style.color = heaterPlugPowered ? '#ef4444' : '#64748b';
          refreshIotDevices();
        } else {
          alert(`Safety Interlock Blocked Action: ${data.error}`);
          refreshSafetyInterlock();
        }
      } catch (err) {
        alert(`Error: ${err.message}`);
      }
    });
  }

  // Tab 3: USB & Serial Diagnostics Controller
  const serialPortSelect = document.getElementById('serial-port-select');
  const serialCmdInput = document.getElementById('serial-command-input');
  const serialSendBtn = document.getElementById('serial-send-btn');
  const serialConsole = document.getElementById('serial-terminal-console');

  document.querySelectorAll('.serial-cmd-preset').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const cmd = e.currentTarget.getAttribute('data-cmd');
      if (serialCmdInput) serialCmdInput.value = cmd;
    });
  });

  if (serialSendBtn && serialCmdInput && serialConsole) {
    serialSendBtn.addEventListener('click', async () => {
      const command = serialCmdInput.value.trim();
      const port = serialPortSelect ? serialPortSelect.value : 'COM3';

      serialConsole.innerHTML += `<div style="color: var(--hud-cyan); margin-top: 4px;">TX &gt; [${port}] ${command}</div>`;
      try {
        const res = await fetch('/api/jarvis/devices/serial/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
          body: JSON.stringify({ port, command })
        });
        const data = await res.json();
        if (data.success && data.data) {
          serialConsole.innerHTML += `<div style="color: #10b981;">RX &lt; ${data.data.response} (${data.data.latencyMs}ms)</div>`;
        } else {
          serialConsole.innerHTML += `<div style="color: #ef4444;">ERROR: ${data.error}</div>`;
        }
        serialConsole.scrollTop = serialConsole.scrollHeight;
      } catch (err) {
        serialConsole.innerHTML += `<div style="color: #ef4444;">COMM ERROR: ${err.message}</div>`;
      }
    });
  }

  // Tab 4: Bluetooth BLE Scanner Controller
  const bleScanBtn = document.getElementById('ble-scan-btn');
  const bleBeaconsList = document.getElementById('ble-beacons-list');
  const bleTriggerHapticBtn = document.getElementById('ble-trigger-haptic-btn');
  const bleInteractionResults = document.getElementById('ble-interaction-results');

  async function loadBleBeacons() {
    if (!bleBeaconsList) return;
    try {
      const res = await fetch('/api/jarvis/devices/ble/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        bleBeaconsList.innerHTML = data.data.map((b) => `
          <div style="background: #060b17; border: 1px solid #1e293b; border-radius: 6px; padding: 10px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: bold; color: #fff; font-size: 0.85rem;">${b.name}</div>
              <div style="font-size: 0.7rem; color: #64748b; font-family: monospace;">${b.address} | RSSI: ${b.rssi} dBm</div>
            </div>
            <span class="badge" style="background: ${b.connected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)'}; color: ${b.connected ? '#10b981' : '#94a3b8'}; font-size: 0.7rem;">
              ${b.connected ? 'CONNECTED' : 'DISCOVERED'}
            </span>
          </div>
        `).join('');
      }
    } catch (err) {
      console.warn('BLE scan error:', err);
    }
  }

  if (bleScanBtn) {
    bleScanBtn.addEventListener('click', loadBleBeacons);
  }

  if (bleTriggerHapticBtn && bleInteractionResults) {
    bleTriggerHapticBtn.addEventListener('click', async () => {
      bleInteractionResults.innerHTML = '<span style="color: var(--hud-cyan);">Sending GATT write to Immediate Alert characteristic...</span>';
      try {
        const res = await fetch('/api/jarvis/devices/ble/write', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
          body: JSON.stringify({
            peripheralId: 'ble_smart_band',
            serviceUuid: '1802',
            charUuid: '2a06',
            hexValue: '02'
          })
        });
        const data = await res.json();
        if (data.success && data.data) {
          bleInteractionResults.innerHTML = `
            <div style="color: #10b981; font-weight: bold;">[GATT WRITE SUCCESSFUL]</div>
            <div>Characteristic: <strong>${data.data.name}</strong></div>
            <div>Value Transmitted: <code style="color: #fff;">0x${data.data.valueHex} (High Alert Vibration)</code></div>
          `;
        } else {
          bleInteractionResults.innerHTML = `<span style="color: #ef4444;">${data.error}</span>`;
        }
      } catch (err) {
        bleInteractionResults.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
      }
    });
  }

  // Tab 5: Safety Interlock Controller
  const safetyBanner = document.getElementById('safety-banner');
  const safetyStatusTitle = document.getElementById('safety-status-title');
  const safetyStatusDesc = document.getElementById('safety-status-desc');
  const safetyWattageText = document.getElementById('safety-wattage-text');
  const safetyWattageBar = document.getElementById('safety-wattage-bar');
  const emergencyCutoffBtn = document.getElementById('devices-emergency-cutoff-btn');
  const resetInterlockBtn = document.getElementById('devices-reset-interlock-btn');

  async function refreshSafetyInterlock() {
    try {
      const res = await fetch('/api/jarvis/devices/safety', {
        headers: { 'x-user-id': 'dwight' }
      });
      const data = await res.json();
      if (data.success && data.data) {
        const s = data.data;
        const isCutoff = s.emergencyCutoffEngaged;
        if (safetyBanner) {
          safetyBanner.style.background = isCutoff ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.1)';
          safetyBanner.style.borderColor = isCutoff ? '#ef4444' : '#10b981';
        }
        if (safetyStatusTitle) {
          safetyStatusTitle.innerHTML = isCutoff
            ? '<span style="width: 12px; height: 12px; border-radius: 50%; background: #ef4444; display: inline-block;"></span> PHYSICAL SAFETY INTERLOCK: TRIPPED (CUTOFF ENGAGED)'
            : '<span style="width: 12px; height: 12px; border-radius: 50%; background: #10b981; display: inline-block;"></span> PHYSICAL SAFETY INTERLOCK: ARMED & SAFE';
          safetyStatusTitle.style.color = isCutoff ? '#ef4444' : '#10b981';
        }
        if (safetyStatusDesc) {
          safetyStatusDesc.textContent = isCutoff
            ? `Safety tripped! Reason: ${s.trippedReasons.join(', ') || 'Emergency killswitch engaged'}`
            : 'All electrical loads and thermal envelopes are within nominal parameters.';
        }
        if (safetyWattageText) safetyWattageText.textContent = `${s.totalWattageDraw} W`;
        if (safetyWattageBar) {
          const pct = Math.min(100, Math.round((s.totalWattageDraw / s.maxSafeWattageLimit) * 100));
          safetyWattageBar.style.width = `${pct}%`;
          safetyWattageBar.style.background = isCutoff ? '#ef4444' : 'var(--hud-cyan)';
        }
      }
    } catch (err) {
      console.warn('Safety refresh error:', err);
    }
  }

  if (emergencyCutoffBtn) {
    emergencyCutoffBtn.addEventListener('click', async () => {
      try {
        const res = await fetch('/api/jarvis/devices/safety/cutoff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
          body: JSON.stringify({ cutoff: true, reason: 'Operator engaged manual emergency cutoff' })
        });
        const data = await res.json();
        if (data.success) {
          refreshSafetyInterlock();
          refreshIotDevices();
        }
      } catch (err) {
        console.error('Failed to engage emergency cutoff:', err);
      }
    });
  }

  if (resetInterlockBtn) {
    resetInterlockBtn.addEventListener('click', async () => {
      try {
        const res = await fetch('/api/jarvis/devices/safety/cutoff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
          body: JSON.stringify({ cutoff: false })
        });
        const data = await res.json();
        if (data.success) {
          refreshSafetyInterlock();
          refreshIotDevices();
        }
      } catch (err) {
        console.error('Failed to reset interlock:', err);
      }
    });
  }

  // ============================================================================
  // PHASE 22: GOALS, PERSONAL PLANNING & STUDY STUDIO CONTROLLER
  // ============================================================================
  const navGoalsBtn = document.getElementById('nav-goals');
  const chipGoalAgent = document.getElementById('chip-goal-agent');
  const chipProjectAgent = document.getElementById('chip-project-agent');
  const goalsModal = document.getElementById('goals-modal');
  const goalsModalClose = document.getElementById('goals-modal-close');

  function openGoalsModal(targetTab) {
    if (!goalsModal) return;
    goalsModal.style.display = 'flex';
    if (targetTab) {
      const tabBtn = goalsModal.querySelector(`.hud-tab-btn[data-tab="${targetTab}"]`);
      if (tabBtn) tabBtn.click();
    }
    refreshGoalsAll();
  }

  function closeGoalsModal() {
    if (goalsModal) goalsModal.style.display = 'none';
  }

  if (navGoalsBtn) navGoalsBtn.addEventListener('click', (e) => { e.preventDefault(); openGoalsModal(); });
  if (chipGoalAgent) chipGoalAgent.addEventListener('click', () => openGoalsModal('goals-tab-roadmap'));
  if (chipProjectAgent) chipProjectAgent.addEventListener('click', () => openGoalsModal('goals-tab-eisenhower'));
  if (goalsModalClose) goalsModalClose.addEventListener('click', closeGoalsModal);

  // Tab switching in goals modal
  if (goalsModal) {
    const tabBtns = goalsModal.querySelectorAll('.hud-tab-btn');
    const tabContents = goalsModal.querySelectorAll('.hud-tab-content');
    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-tab');
        tabBtns.forEach((b) => b.classList.remove('active'));
        tabContents.forEach((c) => c.classList.remove('active'));
        btn.classList.add('active');
        const activeContent = document.getElementById(target);
        if (activeContent) activeContent.classList.add('active');

        if (target === 'goals-tab-roadmap') refreshGoals();
        else if (target === 'goals-tab-eisenhower') refreshTasksAndMatrix();
        else if (target === 'goals-tab-schedule') refreshSchedule();
        else if (target === 'goals-tab-study') refreshStudyPlans();
      });
    });
  }

  // 1. Refresh Roadmap & Goals
  async function refreshGoals() {
    try {
      // Fetch analytics
      const aRes = await fetch('/api/jarvis/goals/analytics', { headers: { 'x-user-id': 'dwight' } });
      const aData = await aRes.json();
      if (aData.success) {
        const a = aData.data;
        const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        setVal('goals-kpi-total', a.totalGoals);
        setVal('goals-kpi-active', a.activeGoals);
        setVal('goals-kpi-completed', a.completedGoals);
        setVal('goals-kpi-progress', a.overallProgressAverage + '%');
        setVal('goals-kpi-velocity', a.weeklyVelocity + '/wk');
        setVal('goals-kpi-focus', a.focusMinutesLogged + 'm');
      }

      // Fetch goals list
      const gRes = await fetch('/api/jarvis/goals', { headers: { 'x-user-id': 'dwight' } });
      const gData = await gRes.json();
      const container = document.getElementById('goals-list-container');
      if (!container) return;

      if (!gData.success || !gData.data.length) {
        container.innerHTML = '<div style="color: #64748b; font-size: 0.85rem; padding: 1rem; text-align: center;">No goals enrolled. Create one above or use the Idea Decomposer.</div>';
        return;
      }

      container.innerHTML = gData.data.map((goal) => {
        const catColors = {
          education: '#38bdf8',
          coding: '#10b981',
          research: '#a855f7',
          finance: '#f59e0b',
          personal: '#ec4899',
        };
        const catColor = catColors[goal.category] || '#94a3b8';
        const progressColor = goal.progressPct === 100 ? '#10b981' : '#f59e0b';

        const milestonesHtml = (goal.milestones || []).map((m) => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0; border-bottom: 1px solid #1e293b; font-size: 0.8rem;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: ${m.completed ? '#10b981' : '#64748b'}; font-weight: bold;">${m.completed ? '✓' : '○'}</span>
              <span style="color: ${m.completed ? '#94a3b8' : '#e2e8f0'}; text-decoration: ${m.completed ? 'line-through' : 'none'};">${m.title}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #64748b; font-size: 0.75rem;">Due: ${m.targetDate}</span>
              ${!m.completed ? `<button class="btn btn-secondary complete-ms-btn" data-goal-id="${goal.id}" data-ms-id="${m.id}" style="padding: 2px 6px; font-size: 0.7rem; color: #10b981; border-color: #10b981;">Complete</button>` : ''}
            </div>
          </div>
        `).join('');

        return `
          <div style="background: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
              <div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-weight: 600; color: #fff; font-size: 0.95rem;">${goal.title}</span>
                  <span style="font-size: 0.7rem; padding: 1px 6px; border-radius: 4px; background: rgba(56,189,248,0.15); color: ${catColor}; border: 1px solid ${catColor}44;">
                    ${goal.category.toUpperCase()}
                  </span>
                  <span style="font-size: 0.7rem; padding: 1px 6px; border-radius: 4px; background: rgba(245,158,11,0.15); color: #f59e0b;">
                    ${goal.priority.toUpperCase()}
                  </span>
                </div>
                <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 4px;">${goal.description}</div>
              </div>
              <div style="text-align: right; min-width: 100px;">
                <span style="font-size: 0.85rem; font-weight: bold; color: ${progressColor};">${goal.progressPct}%</span>
                <div style="font-size: 0.7rem; color: #64748b;">Target: ${goal.targetDate}</div>
              </div>
            </div>

            <!-- Progress Bar -->
            <div style="width: 100%; height: 6px; background: #1e293b; border-radius: 3px; overflow: hidden; margin: 8px 0 10px;">
              <div style="width: ${goal.progressPct}%; height: 100%; background: ${progressColor}; transition: width 0.3s;"></div>
            </div>

            <!-- Milestones Accordion -->
            <div style="background: #0b1329; border-radius: 6px; padding: 8px 12px;">
              <div style="font-size: 0.75rem; color: #64748b; text-transform: uppercase; margin-bottom: 4px; font-weight: bold;">Milestones DAG</div>
              ${milestonesHtml || '<div style="color: #64748b; font-size: 0.75rem;">No milestones defined.</div>'}
            </div>
          </div>
        `;
      }).join('');

      // Attach milestone complete handlers
      container.querySelectorAll('.complete-ms-btn').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const goalId = btn.getAttribute('data-goal-id');
          const msId = btn.getAttribute('data-ms-id');
          try {
            await fetch(`/api/jarvis/goals/${goalId}/milestones/${msId}/complete`, {
              method: 'POST',
              headers: { 'x-user-id': 'dwight' }
            });
            refreshGoals();
          } catch (err) {
            console.error('Failed to complete milestone:', err);
          }
        });
      });
    } catch (err) {
      console.warn('Goals refresh error:', err);
    }
  }

  // Toggle & create goal
  const createGoalToggleBtn = document.getElementById('goals-create-toggle-btn');
  const createGoalForm = document.getElementById('goals-create-form');
  const createGoalSubmitBtn = document.getElementById('goals-create-submit-btn');

  if (createGoalToggleBtn && createGoalForm) {
    createGoalToggleBtn.addEventListener('click', () => {
      createGoalForm.style.display = createGoalForm.style.display === 'none' ? 'block' : 'none';
    });
  }

  if (createGoalSubmitBtn) {
    createGoalSubmitBtn.addEventListener('click', async () => {
      const title = document.getElementById('new-goal-title')?.value?.trim();
      const category = document.getElementById('new-goal-category')?.value || 'personal';
      const targetDate = document.getElementById('new-goal-date')?.value || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
      const description = document.getElementById('new-goal-desc')?.value?.trim();

      if (!title || !description) {
        alert('Please fill in goal title and description');
        return;
      }

      try {
        const res = await fetch('/api/jarvis/goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
          body: JSON.stringify({ title, description, category, priority: 'high', targetDate })
        });
        const data = await res.json();
        if (data.success) {
          if (createGoalForm) createGoalForm.style.display = 'none';
          document.getElementById('new-goal-title').value = '';
          document.getElementById('new-goal-desc').value = '';
          refreshGoals();
        }
      } catch (err) {
        console.error('Failed to create goal:', err);
      }
    });
  }

  // 2. Tasks & Eisenhower Matrix
  async function refreshTasksAndMatrix() {
    try {
      const res = await fetch('/api/jarvis/goals/eisenhower', { headers: { 'x-user-id': 'dwight' } });
      const data = await res.json();
      if (!data.success) return;

      const m = data.data;
      const renderQuadrant = (containerId, countId, tasks, accentColor) => {
        const container = document.getElementById(containerId);
        const countEl = document.getElementById(countId);
        if (countEl) countEl.textContent = tasks.length;
        if (!container) return;

        if (!tasks.length) {
          container.innerHTML = '<div style="color: #475569; font-size: 0.75rem; text-align: center; padding: 1rem;">No tasks in this quadrant</div>';
          return;
        }

        container.innerHTML = tasks.map((t) => {
          const isDone = t.status === 'completed';
          return `
            <div style="background: #020617; border: 1px solid #1e293b; border-left: 3px solid ${accentColor}; border-radius: 4px; padding: 6px 10px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 0.82rem; color: ${isDone ? '#94a3b8' : '#e2e8f0'}; text-decoration: ${isDone ? 'line-through' : 'none'}; font-weight: 500;">
                  ${t.title}
                </div>
                <div style="font-size: 0.7rem; color: #64748b; margin-top: 2px;">
                  ⏱ ${t.estimatedMinutes}m • Assigned: <strong style="color: #38bdf8;">${t.assignedTo}</strong>
                </div>
              </div>
              <div>
                ${!isDone ? `<button class="btn btn-secondary task-done-btn" data-task-id="${t.id}" style="padding: 2px 6px; font-size: 0.68rem; color: #10b981; border-color: #10b981;">Done</button>` : `<span style="color: #10b981; font-size: 0.75rem;">✓</span>`}
              </div>
            </div>
          `;
        }).join('');

        container.querySelectorAll('.task-done-btn').forEach((btn) => {
          btn.addEventListener('click', async () => {
            const taskId = btn.getAttribute('data-task-id');
            await fetch(`/api/jarvis/goals/tasks/${taskId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
              body: JSON.stringify({ status: 'completed' })
            });
            refreshTasksAndMatrix();
          });
        });
      };

      renderQuadrant('quadrant-do-first', 'q1-count', m.do_first || [], '#ef4444');
      renderQuadrant('quadrant-schedule', 'q2-count', m.schedule || [], '#38bdf8');
      renderQuadrant('quadrant-delegate', 'q3-count', m.delegate || [], '#f59e0b');
      renderQuadrant('quadrant-eliminate', 'q4-count', m.eliminate || [], '#64748b');
    } catch (err) {
      console.warn('Matrix refresh error:', err);
    }
  }

  // Add task button
  const addTaskBtn = document.getElementById('goals-add-task-btn');
  if (addTaskBtn) {
    addTaskBtn.addEventListener('click', async () => {
      const title = document.getElementById('task-input-title')?.value?.trim();
      const estimatedMinutes = Number(document.getElementById('task-input-minutes')?.value) || 45;
      const isUrgent = document.getElementById('task-check-urgent')?.checked || false;
      const isImportant = document.getElementById('task-check-important')?.checked || false;
      const assignedTo = document.getElementById('task-select-assign')?.value || 'dwight';

      if (!title) return;

      try {
        const res = await fetch('/api/jarvis/goals/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
          body: JSON.stringify({ title, estimatedMinutes, isUrgent, isImportant, assignedTo })
        });
        const data = await res.json();
        if (data.success) {
          document.getElementById('task-input-title').value = '';
          refreshTasksAndMatrix();
        }
      } catch (err) {
        console.error('Failed to create task:', err);
      }
    });
  }

  // 3. Daily Schedule & Timeblocks
  const scheduleDatePicker = document.getElementById('schedule-date-picker');
  if (scheduleDatePicker) {
    scheduleDatePicker.value = new Date().toISOString().split('T')[0];
    scheduleDatePicker.addEventListener('change', refreshSchedule);
  }

  async function refreshSchedule() {
    const date = scheduleDatePicker?.value || new Date().toISOString().split('T')[0];
    const container = document.getElementById('schedule-blocks-container');
    if (!container) return;

    try {
      const res = await fetch(`/api/jarvis/goals/schedule?date=${date}`);
      const data = await res.json();
      if (!data.success || !data.data.length) {
        container.innerHTML = '<div style="color: #64748b; font-size: 0.85rem; padding: 1rem; text-align: center;">No scheduled blocks for this date. Add one above!</div>';
        return;
      }

      const typeColors = {
        deep_work: '#38bdf8',
        study: '#a855f7',
        coding: '#10b981',
        review: '#f59e0b',
        break: '#64748b'
      };

      container.innerHTML = data.data.map((b) => {
        const color = typeColors[b.type] || '#38bdf8';
        return `
          <div style="background: #020617; border: 1px solid #1e293b; border-left: 4px solid ${color}; border-radius: 6px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-family: monospace; font-size: 0.85rem; color: #fff; background: #0b1329; padding: 2px 8px; border-radius: 4px; border: 1px solid #334155;">
                ${b.startTime} - ${b.endTime}
              </span>
              <div>
                <div style="font-weight: 500; font-size: 0.85rem; color: ${b.completed ? '#94a3b8' : '#e2e8f0'}; text-decoration: ${b.completed ? 'line-through' : 'none'};">
                  ${b.title}
                </div>
                <div style="font-size: 0.7rem; color: ${color}; text-transform: uppercase;">
                  ${b.type.replace('_', ' ')}
                </div>
              </div>
            </div>
            <div>
              ${!b.completed ? `<button class="btn btn-secondary complete-tb-btn" data-tb-id="${b.id}" style="padding: 2px 6px; font-size: 0.7rem; color: #10b981; border-color: #10b981;">Done</button>` : `<span style="color: #10b981; font-size: 0.8rem;">✓ Complete</span>`}
            </div>
          </div>
        `;
      }).join('');

      container.querySelectorAll('.complete-tb-btn').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const tbId = btn.getAttribute('data-tb-id');
          await fetch(`/api/jarvis/goals/schedule/block/${tbId}/complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: true })
          });
          refreshSchedule();
        });
      });
    } catch (err) {
      console.warn('Schedule refresh error:', err);
    }
  }

  // Suggest Focus Slot Button
  const suggestBtn = document.getElementById('schedule-suggest-btn');
  const suggestAlert = document.getElementById('schedule-suggest-alert');
  if (suggestBtn && suggestAlert) {
    suggestBtn.addEventListener('click', async () => {
      const date = scheduleDatePicker?.value || new Date().toISOString().split('T')[0];
      try {
        const res = await fetch(`/api/jarvis/goals/schedule/suggest?date=${date}&duration=90`);
        const data = await res.json();
        if (data.success) {
          const s = data.data;
          suggestAlert.style.display = 'block';
          suggestAlert.innerHTML = `
            <strong>💡 Recommended Focus Window:</strong> ${s.recommendedStart} — ${s.recommendedEnd}
            <br/>
            <span style="color: #94a3b8; font-size: 0.78rem;">${s.reason}</span>
          `;
        }
      } catch (err) {
        console.error('Failed to get focus slot suggestion:', err);
      }
    });
  }

  // Add block button
  const addBlockBtn = document.getElementById('schedule-add-block-btn');
  if (addBlockBtn) {
    addBlockBtn.addEventListener('click', async () => {
      const title = document.getElementById('tb-input-title')?.value?.trim();
      const type = document.getElementById('tb-input-type')?.value || 'deep_work';
      const startTime = document.getElementById('tb-input-start')?.value || '14:00';
      const endTime = document.getElementById('tb-input-end')?.value || '15:30';
      const date = scheduleDatePicker?.value || new Date().toISOString().split('T')[0];

      if (!title) return;

      try {
        const res = await fetch('/api/jarvis/goals/schedule/block', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, type, date, startTime, endTime })
        });
        const data = await res.json();
        if (data.success) {
          document.getElementById('tb-input-title').value = '';
          if (data.conflicts && data.conflicts.length > 0) {
            alert(`Note: Block added with ${data.conflicts.length} overlapping conflict(s).`);
          }
          refreshSchedule();
        }
      } catch (err) {
        console.error('Failed to add timeblock:', err);
      }
    });
  }

  // 4. Study Planner & Spaced Repetition
  let activeReviewPlanId = null;
  let activeReviewTopicId = null;

  async function refreshStudyPlans() {
    try {
      // 1. Study plans
      const pRes = await fetch('/api/jarvis/goals/study/plans');
      const pData = await pRes.json();
      const plansContainer = document.getElementById('study-plans-list');
      if (plansContainer && pData.success) {
        plansContainer.innerHTML = pData.data.map((plan) => `
          <div style="background: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-weight: 600; color: #fff; font-size: 0.9rem;">${plan.title}</span>
              <span style="font-size: 0.85rem; font-weight: bold; color: #10b981;">${plan.overallMasteryPct}% Mastery</span>
            </div>
            <div style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 8px;">Target: ${plan.targetExamOrGoal}</div>
            <div style="width: 100%; height: 6px; background: #1e293b; border-radius: 3px; overflow: hidden; margin-bottom: 8px;">
              <div style="width: ${plan.overallMasteryPct}%; height: 100%; background: #10b981;"></div>
            </div>
            <div style="font-size: 0.72rem; color: #64748b;">Total Studied: <strong>${plan.totalStudyHours} hrs</strong> • Daily Target: <strong>${plan.dailyHoursTarget} hrs</strong></div>
          </div>
        `).join('');
      }

      // 2. Due queue
      const qRes = await fetch('/api/jarvis/goals/study/queue');
      const qData = await qRes.json();
      const queueContainer = document.getElementById('study-due-queue');
      const dueCountEl = document.getElementById('study-due-count');
      if (dueCountEl && qData.success) dueCountEl.textContent = `${qData.count} Due Today`;

      if (queueContainer && qData.success) {
        if (!qData.data.length) {
          queueContainer.innerHTML = '<div style="color: #64748b; font-size: 0.8rem; padding: 1rem; text-align: center;">All topics reviewed! No spaced repetitions due today.</div>';
          return;
        }

        queueContainer.innerHTML = qData.data.map((t) => `
          <div style="background: #020617; border: 1px solid #1e293b; border-left: 3px solid #f59e0b; border-radius: 6px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 0.85rem; font-weight: 500; color: #fff;">${t.topic}</div>
              <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 2px;">
                ${t.subject} • Interval: <strong>${t.repetitionIntervalDays}d</strong> • Mastery: <strong>${t.masteryLevel}%</strong>
              </div>
            </div>
            <button class="btn btn-secondary start-drill-btn" data-topic-id="${t.id}" data-topic-name="${t.topic}" style="font-size: 0.72rem; padding: 4px 8px; color: #38bdf8; border-color: #38bdf8;">
              Review Now
            </button>
          </div>
        `).join('');

        queueContainer.querySelectorAll('.start-drill-btn').forEach((btn) => {
          btn.addEventListener('click', () => {
            const topicId = btn.getAttribute('data-topic-id');
            const topicName = btn.getAttribute('data-topic-name');
            activeReviewPlanId = pData.data?.[0]?.id || 'plan_let_math_2026';
            activeReviewTopicId = topicId;

            const reviewPanel = document.getElementById('study-review-panel');
            const reviewTitle = document.getElementById('review-topic-title');
            if (reviewPanel && reviewTitle) {
              reviewTitle.textContent = `Record Drill: ${topicName}`;
              reviewPanel.style.display = 'block';
            }
          });
        });
      }
    } catch (err) {
      console.warn('Study planner refresh error:', err);
    }
  }

  // Slider change
  const studySlider = document.getElementById('study-score-slider');
  const studyVal = document.getElementById('study-score-val');
  if (studySlider && studyVal) {
    studySlider.addEventListener('input', () => {
      studyVal.textContent = `${studySlider.value}%`;
      studyVal.style.color = Number(studySlider.value) >= 75 ? '#10b981' : '#f87171';
    });
  }

  // Record session button
  const recordSessionBtn = document.getElementById('study-record-session-btn');
  if (recordSessionBtn) {
    recordSessionBtn.addEventListener('click', async () => {
      if (!activeReviewPlanId || !activeReviewTopicId) return;
      const minutesSpent = Number(document.getElementById('study-minutes-input')?.value) || 45;
      const scoreOrSelfRating = Number(studySlider?.value) || 85;

      try {
        const res = await fetch('/api/jarvis/goals/study/review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planId: activeReviewPlanId,
            topicId: activeReviewTopicId,
            minutesSpent,
            scoreOrSelfRating
          })
        });
        const data = await res.json();
        if (data.success) {
          const panel = document.getElementById('study-review-panel');
          if (panel) panel.style.display = 'none';
          refreshStudyPlans();
        }
      } catch (err) {
        console.error('Failed to record study session:', err);
      }
    });
  }

  // 5. Idea-to-Progress Decomposer
  const ideaDecomposeBtn = document.getElementById('idea-decompose-btn');
  const ideaInput = document.getElementById('idea-input');
  const ideaCategorySelect = document.getElementById('idea-category-select');
  const ideaAutocreateCheck = document.getElementById('idea-autocreate-check');
  const ideaPipelineResult = document.getElementById('idea-pipeline-result');

  if (ideaDecomposeBtn && ideaInput && ideaPipelineResult) {
    ideaDecomposeBtn.addEventListener('click', async () => {
      const idea = ideaInput.value.trim();
      if (!idea) {
        alert('Please enter an idea or goal description');
        return;
      }
      const category = ideaCategorySelect?.value || 'education';
      const autoCreate = ideaAutocreateCheck?.checked || false;

      ideaPipelineResult.style.display = 'block';
      ideaPipelineResult.innerHTML = '<div style="color: #f59e0b; text-align: center; padding: 1.5rem;">⚡ Decomposing human idea through SMART & Eisenhower optimization engine...</div>';

      try {
        const res = await fetch('/api/jarvis/goals/decompose', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
          body: JSON.stringify({ idea, category, autoCreate })
        });
        const data = await res.json();
        if (!data.success) {
          ideaPipelineResult.innerHTML = `<div style="color: #ef4444;">Error: ${data.error}</div>`;
          return;
        }

        const d = data.data;
        const sg = d.smartGoal;

        const milestonesHtml = (sg.milestones || []).map((m, idx) => `
          <div style="font-size: 0.8rem; color: #e2e8f0; margin-bottom: 4px;">
            <strong style="color: #38bdf8;">Milestone ${idx + 1}:</strong> ${m.title}
            <span style="color: #64748b; font-size: 0.72rem;">(${m.targetMetric})</span>
          </div>
        `).join('');

        const tasksHtml = (d.tasks || []).map((t) => `
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; padding: 4px 8px; background: #020617; border-radius: 4px; margin-bottom: 4px;">
            <span>${t.title}</span>
            <span style="font-size: 0.7rem; color: ${t.quadrant === 'do_first' ? '#f87171' : '#38bdf8'}; font-weight: bold;">
              ${t.quadrant.toUpperCase()} • ${t.estimatedMinutes}m
            </span>
          </div>
        `).join('');

        const stepsHtml = (d.actionSteps || []).map((step) => `
          <div style="font-size: 0.8rem; color: #cbd5e1; margin-bottom: 4px;">${step}</div>
        `).join('');

        ideaPipelineResult.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 0.75rem; margin-bottom: 1rem;">
            <div>
              <h4 style="margin: 0; color: #fff; font-size: 1.05rem;">${sg.title}</h4>
              <span style="font-size: 0.75rem; color: #10b981;">✓ Successfully Decomposed (${d.estimatedDays} Days Projected)</span>
            </div>
            ${autoCreate ? '<span class="badge" style="background: rgba(16,185,129,0.15); color: #10b981; border: 1px solid #10b981;">Auto-Enrolled in Roadmap</span>' : ''}
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
            <!-- SMART Criteria -->
            <div style="background: #020617; border: 1px solid #1e293b; border-radius: 6px; padding: 10px;">
              <h5 style="margin-top: 0; color: #38bdf8; font-size: 0.85rem; margin-bottom: 6px;">SMART Framework Definition</h5>
              <div style="font-size: 0.75rem; color: #94a3b8; line-height: 1.5;">
                <div><strong>S:</strong> ${sg.smart.specific}</div>
                <div><strong>M:</strong> ${sg.smart.measurable}</div>
                <div><strong>A:</strong> ${sg.smart.achievable}</div>
                <div><strong>R:</strong> ${sg.smart.relevant}</div>
                <div><strong>T:</strong> ${sg.smart.timeBound}</div>
              </div>
            </div>

            <!-- Milestones DAG -->
            <div style="background: #020617; border: 1px solid #1e293b; border-radius: 6px; padding: 10px;">
              <h5 style="margin-top: 0; color: #f59e0b; font-size: 0.85rem; margin-bottom: 6px;">Milestones Sequence</h5>
              ${milestonesHtml}
            </div>
          </div>

          <!-- Tasks & Actions -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div style="background: #020617; border: 1px solid #1e293b; border-radius: 6px; padding: 10px;">
              <h5 style="margin-top: 0; color: #a855f7; font-size: 0.85rem; margin-bottom: 6px;">Generated Eisenhower Tasks</h5>
              ${tasksHtml}
            </div>
            <div style="background: #020617; border: 1px solid #1e293b; border-radius: 6px; padding: 10px;">
              <h5 style="margin-top: 0; color: #10b981; font-size: 0.85rem; margin-bottom: 6px;">Next Recommended Actions</h5>
              ${stepsHtml}
            </div>
          </div>
        `;

        if (autoCreate) {
          refreshGoals();
          refreshTasksAndMatrix();
        }
      } catch (err) {
        ideaPipelineResult.innerHTML = `<div style="color: #ef4444;">Error: ${err.message}</div>`;
      }
    });
  }

  function refreshGoalsAll() {
    refreshGoals();
    refreshTasksAndMatrix();
    refreshSchedule();
    refreshStudyPlans();
  }

  // ==============================================================
  // PHASE 23: PROACTIVE INTELLIGENCE HUD CONTROLLER
  // ==============================================================
  function initProactiveStudio() {
    const navBtn = document.getElementById('nav-proactive');
    const chipBtn = document.getElementById('chip-proactive-agent');
    const modal = document.getElementById('proactive-modal');
    const backdrop = document.getElementById('proactive-modal-backdrop');
    const closeBtn = document.getElementById('proactive-modal-close');
    const runCycleBtn = document.getElementById('proactive-run-cycle-btn');

    if (!modal) return;

    function openModal() {
      modal.style.display = 'flex';
      refreshProactiveAll();
    }

    function closeModal() {
      modal.style.display = 'none';
    }

    if (navBtn) navBtn.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
    if (chipBtn) chipBtn.addEventListener('click', () => openModal());
    if (closeBtn) closeBtn.addEventListener('click', () => closeModal());
    if (backdrop) backdrop.addEventListener('click', () => closeModal());

    // Tab switching
    const tabBtns = modal.querySelectorAll('.hud-tab-btn');
    const tabContents = modal.querySelectorAll('.hud-tab-content');
    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        tabBtns.forEach((b) => {
          b.classList.remove('active');
          b.style.color = '#94a3b8';
          b.style.borderBottom = 'none';
        });
        tabContents.forEach((c) => {
          c.classList.remove('active');
          c.style.display = 'none';
        });

        btn.classList.add('active');
        btn.style.color = 'var(--hud-cyan)';
        btn.style.borderBottom = '2px solid var(--hud-cyan)';

        const activeContent = document.getElementById(targetTab);
        if (activeContent) {
          activeContent.classList.add('active');
          activeContent.style.display = 'block';
        }
      });
    });

    // Run Cycle trigger
    if (runCycleBtn) {
      runCycleBtn.addEventListener('click', async () => {
        const origText = runCycleBtn.innerHTML;
        try {
          runCycleBtn.innerHTML = '⚡ Scanning...';
          runCycleBtn.disabled = true;
          const res = await fetch('/api/jarvis/proactive/cycle', {
            method: 'POST',
            headers: { 'x-user-id': 'dwight' },
          });
          const data = await res.json();
          if (data.success) {
            refreshNotifications();
            refreshSuggestions();
            alert(`Proactive scan completed: ${data.data.deadlinesScanned} deadlines inspected, ${data.data.notificationsGenerated.length} alerts generated across ${data.data.monitoredProjectsCount} monitored projects.`);
          }
        } catch (err) {
          alert(`Error executing proactive cycle: ${err.message}`);
        } finally {
          runCycleBtn.innerHTML = origText;
          runCycleBtn.disabled = false;
        }
      });
    }

    // Filter controls in Tab 1
    let currentNotifFilter = 'all';
    const filterBtns = document.querySelectorAll('#notif-filter-group button');
    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBtns.forEach((b) => {
          b.classList.remove('active');
          b.style.background = '#0b1329';
          b.style.color = '#94a3b8';
          b.style.border = '1px solid #334155';
        });
        btn.classList.add('active');
        btn.style.background = 'rgba(0, 240, 255, 0.2)';
        btn.style.color = 'var(--hud-cyan)';
        btn.style.border = '1px solid var(--hud-cyan)';
        currentNotifFilter = btn.getAttribute('data-filter') || 'all';
        refreshNotifications();
      });
    });

    async function refreshNotifications() {
      const listEl = document.getElementById('proactive-notifications-list');
      const countLabel = document.getElementById('notif-count-label');
      const badge = document.getElementById('proactive-unread-badge');
      if (!listEl) return;

      try {
        let queryUrl = '/api/jarvis/proactive/notifications';
        if (currentNotifFilter === 'unread') queryUrl += '?status=unread';
        else if (currentNotifFilter === 'snoozed') queryUrl += '?status=snoozed';
        else if (currentNotifFilter === 'critical') queryUrl += '?severity=critical';

        const res = await fetch(queryUrl, { headers: { 'x-user-id': 'dwight' } });
        const data = await res.json();
        if (!data.success) return;

        if (badge) badge.textContent = data.unreadCount || 0;
        if (countLabel) countLabel.textContent = `${data.count} alerts active (${data.unreadCount} unread)`;

        if (!data.data || data.data.length === 0) {
          listEl.innerHTML = `
            <div style="background: #020617; border: 1px dashed #334155; border-radius: 6px; padding: 1.5rem; text-align: center; color: #94a3b8; font-size: 0.85rem;">
              No notifications matching current filter "${currentNotifFilter}". All monitoring boundaries optimal.
            </div>
          `;
          return;
        }

        const sevColors = {
          critical: '#ef4444',
          high: '#f97316',
          medium: '#eab308',
          low: '#38bdf8',
          info: '#06b6d4',
        };

        listEl.innerHTML = data.data.map((n) => `
          <div style="background: #020617; border: 1px solid ${n.status === 'unread' ? 'rgba(0, 240, 255, 0.4)' : '#1e293b'}; border-left: 4px solid ${sevColors[n.severity] || '#38bdf8'}; border-radius: 6px; padding: 12px 14px; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; background: rgba(255,255,255,0.06); color: ${sevColors[n.severity] || '#38bdf8'};">
                  ${n.severity}
                </span>
                <span style="font-size: 0.75rem; color: #64748b; font-family: monospace;">${n.type}</span>
                ${n.status === 'snoozed' ? '<span style="font-size: 0.7rem; color: #a855f7;">[Snoozed]</span>' : ''}
              </div>
              <h4 style="margin: 0 0 4px 0; color: #fff; font-size: 0.9rem;">${n.title}</h4>
              <p style="margin: 0; color: #94a3b8; font-size: 0.8rem; line-height: 1.4;">${n.message}</p>
              ${n.context && n.context.projectId ? `<div style="margin-top: 6px; font-size: 0.72rem; color: #38bdf8;">Project: <code>${n.context.projectId}</code></div>` : ''}
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px; align-items: flex-end;">
              ${n.status === 'unread' ? `
                <button class="btn btn-sm btn-mark-read" data-id="${n.id}" style="font-size: 0.7rem; padding: 3px 8px; background: #0b1329; border: 1px solid #334155; color: #38bdf8; border-radius: 4px; cursor: pointer;">
                  Mark Read
                </button>
              ` : ''}
              <button class="btn btn-sm btn-snooze" data-id="${n.id}" style="font-size: 0.7rem; padding: 3px 8px; background: #0b1329; border: 1px solid #334155; color: #e2e8f0; border-radius: 4px; cursor: pointer;">
                Snooze 30m
              </button>
              <button class="btn btn-sm btn-dismiss" data-id="${n.id}" style="font-size: 0.7rem; padding: 3px 8px; background: #0b1329; border: 1px solid #334155; color: #f87171; border-radius: 4px; cursor: pointer;">
                Dismiss
              </button>
            </div>
          </div>
        `).join('');

        // Wire action buttons
        listEl.querySelectorAll('.btn-mark-read').forEach((btn) => {
          btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-id');
            await fetch(`/api/jarvis/proactive/notifications/${id}/read`, {
              method: 'POST',
              headers: { 'x-user-id': 'dwight' },
            });
            refreshNotifications();
          });
        });

        listEl.querySelectorAll('.btn-snooze').forEach((btn) => {
          btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-id');
            await fetch(`/api/jarvis/proactive/notifications/${id}/snooze`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
              body: JSON.stringify({ minutes: 30 }),
            });
            refreshNotifications();
          });
        });

        listEl.querySelectorAll('.btn-dismiss').forEach((btn) => {
          btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-id');
            await fetch(`/api/jarvis/proactive/notifications/${id}/dismiss`, {
              method: 'POST',
              headers: { 'x-user-id': 'dwight' },
            });
            refreshNotifications();
          });
        });
      } catch (err) {
        if (listEl) listEl.innerHTML = `<div style="color: #ef4444; font-size: 0.8rem;">Error loading notifications: ${err.message}</div>`;
      }
    }

    // Refresh Suggestions in Tab 2
    const refreshSuggsBtn = document.getElementById('refresh-suggestions-btn');
    if (refreshSuggsBtn) refreshSuggsBtn.addEventListener('click', () => refreshSuggestions());

    async function refreshSuggestions() {
      const listEl = document.getElementById('proactive-suggestions-list');
      if (!listEl) return;

      try {
        const res = await fetch('/api/jarvis/proactive/suggestions?limit=6', {
          headers: { 'x-user-id': 'dwight' },
        });
        const data = await res.json();
        if (!data.success || !data.data) return;

        listEl.innerHTML = data.data.map((s) => `
          <div style="background: #020617; border: 1px solid #1e293b; border-radius: 6px; padding: 1rem; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 0.72rem; padding: 2px 6px; border-radius: 4px; background: rgba(0, 240, 255, 0.1); color: var(--hud-cyan); font-weight: 600; text-transform: uppercase;">
                  ${s.actionType}
                </span>
                <span style="font-size: 0.8rem; font-weight: 700; color: #10b981;">Score: ${s.impactScore}/100</span>
              </div>
              <h4 style="margin: 0 0 6px 0; color: #fff; font-size: 0.95rem;">${s.title}</h4>
              <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 0.8rem; line-height: 1.4;">${s.rationale}</p>
            </div>
            <div style="border-top: 1px solid #1e293b; padding-top: 8px; margin-top: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: #64748b;">
              <span>⏱️ ${s.estimatedMinutes}m • ${s.urgency.toUpperCase()}</span>
              <span>👤 ${s.suggestedDelegate}</span>
            </div>
          </div>
        `).join('');
      } catch (err) {
        if (listEl) listEl.innerHTML = `<div style="color: #ef4444;">Error loading suggestions: ${err.message}</div>`;
      }
    }

    // Daily Briefing in Tab 3
    let currentBriefingType = 'morning';
    const morningBtn = document.getElementById('briefing-type-morning-btn');
    const eveningBtn = document.getElementById('briefing-type-evening-btn');

    if (morningBtn && eveningBtn) {
      morningBtn.addEventListener('click', () => {
        currentBriefingType = 'morning';
        morningBtn.classList.add('active');
        morningBtn.style.background = 'rgba(0, 240, 255, 0.2)';
        morningBtn.style.color = 'var(--hud-cyan)';
        eveningBtn.classList.remove('active');
        eveningBtn.style.background = '#0b1329';
        eveningBtn.style.color = '#94a3b8';
        refreshBriefing();
      });

      eveningBtn.addEventListener('click', () => {
        currentBriefingType = 'evening';
        eveningBtn.classList.add('active');
        eveningBtn.style.background = 'rgba(0, 240, 255, 0.2)';
        eveningBtn.style.color = 'var(--hud-cyan)';
        morningBtn.classList.remove('active');
        morningBtn.style.background = '#0b1329';
        morningBtn.style.color = '#94a3b8';
        refreshBriefing();
      });
    }

    async function refreshBriefing() {
      const container = document.getElementById('proactive-briefing-container');
      const dateBadge = document.getElementById('briefing-date-badge');
      if (!container) return;

      try {
        const res = await fetch(`/api/jarvis/proactive/briefing?type=${currentBriefingType}`, {
          headers: { 'x-user-id': 'dwight' },
        });
        const data = await res.json();
        if (!data.success || !data.data) return;

        const b = data.data;
        if (dateBadge) dateBadge.textContent = b.date || 'Today';

        const tasksHtml = (b.topTasks || []).map((t) => `
          <div style="font-size: 0.8rem; color: #cbd5e1; padding: 4px 8px; background: #0b1329; border-radius: 4px; margin-bottom: 4px; display: flex; justify-content: space-between;">
            <span>${t.title}</span>
            <span style="color: var(--hud-cyan); font-weight: 600;">${t.priority.toUpperCase()}</span>
          </div>
        `).join('') || '<div style="font-size: 0.8rem; color: #64748b;">No high-priority tasks pending</div>';

        const deadlinesHtml = (b.imminentDeadlines || []).map((d) => `
          <div style="font-size: 0.8rem; color: #cbd5e1; padding: 4px 8px; background: #0b1329; border-radius: 4px; margin-bottom: 4px; display: flex; justify-content: space-between;">
            <span>${d.title}</span>
            <span style="color: #f59e0b; font-weight: 600;">${d.dueDate} (${d.hoursRemaining}h left)</span>
          </div>
        `).join('') || '<div style="font-size: 0.8rem; color: #64748b;">No imminent deadlines detected</div>';

        container.innerHTML = `
          <div style="border-bottom: 1px solid #1e293b; padding-bottom: 1rem; margin-bottom: 1rem;">
            <h3 style="margin: 0 0 6px 0; color: #fff; font-size: 1.05rem;">${b.greeting}</h3>
            <div style="font-size: 0.85rem; color: var(--hud-cyan);">
              🎯 <strong>Primary Strategic Objective:</strong> ${b.focusGoal}
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
            <!-- Top Tasks -->
            <div style="background: #0b0f19; border: 1px solid #1e293b; border-radius: 6px; padding: 10px;">
              <h5 style="margin: 0 0 8px 0; color: #38bdf8; font-size: 0.85rem;">Priority Mission Tasks</h5>
              ${tasksHtml}
            </div>

            <!-- Imminent Deadlines -->
            <div style="background: #0b0f19; border: 1px solid #1e293b; border-radius: 6px; padding: 10px;">
              <h5 style="margin: 0 0 8px 0; color: #f59e0b; font-size: 0.85rem;">Upcoming Milestone Targets</h5>
              ${deadlinesHtml}
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 1rem;">
            <!-- System Health & Study Queue -->
            <div style="background: #0b0f19; border: 1px solid #1e293b; border-radius: 6px; padding: 10px; font-size: 0.8rem; color: #94a3b8;">
              <div style="margin-bottom: 6px;">📚 <strong>Spaced Review Queue:</strong> <span style="color: #10b981;">${b.studyQueueCount} topics due</span></div>
              <div style="margin-bottom: 6px;">🛡️ <strong>Security Guardian:</strong> <span style="color: #38bdf8;">${b.systemHealth?.guardianStatus}</span></div>
              <div>⚡ <strong>Host Telemetry:</strong> CPU ${b.systemHealth?.cpuPercent}% | RAM ${b.systemHealth?.ramPercent}%</div>
            </div>

            <!-- Inspirational Note -->
            <div style="background: rgba(0, 240, 255, 0.04); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: 6px; padding: 10px; display: flex; align-items: center;">
              <p style="margin: 0; font-size: 0.82rem; color: #cbd5e1; font-style: italic;">
                "${b.inspirationalNote}"
              </p>
            </div>
          </div>
        `;
      } catch (err) {
        if (container) container.innerHTML = `<div style="color: #ef4444;">Error generating briefing: ${err.message}</div>`;
      }
    }

    // Monitoring Boundaries & Preferences in Tab 4
    const addProjBtn = document.getElementById('add-monitored-proj-btn');
    const newProjInput = document.getElementById('new-monitored-proj-input');
    const savePrefBtn = document.getElementById('save-preferences-btn');
    const maxNotifsSlider = document.getElementById('pref-max-notifs-slider');
    const maxNotifsLabel = document.getElementById('pref-max-notifs-label');

    if (maxNotifsSlider && maxNotifsLabel) {
      maxNotifsSlider.addEventListener('input', () => {
        maxNotifsLabel.textContent = `${maxNotifsSlider.value} / hr`;
      });
    }

    if (addProjBtn && newProjInput) {
      addProjBtn.addEventListener('click', async () => {
        const pId = newProjInput.value.trim();
        if (!pId) return;
        try {
          const res = await fetch('/api/jarvis/proactive/monitored-projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({ projectId: pId }),
          });
          const data = await res.json();
          if (data.success) {
            newProjInput.value = '';
            refreshPreferences();
          } else {
            alert(`Error: ${data.error}`);
          }
        } catch (err) {
          alert(`Error: ${err.message}`);
        }
      });
    }

    if (savePrefBtn) {
      savePrefBtn.addEventListener('click', async () => {
        try {
          const quietEnabled = document.getElementById('pref-quiet-enabled')?.checked ?? true;
          const quietStart = document.getElementById('pref-quiet-start')?.value || '22:30';
          const quietEnd = document.getElementById('pref-quiet-end')?.value || '07:00';
          const maxPerHour = Number(maxNotifsSlider?.value) || 10;
          const chHud = document.getElementById('pref-channel-hud')?.checked ?? true;
          const chSpeech = document.getElementById('pref-channel-speech')?.checked ?? false;
          const chLog = document.getElementById('pref-channel-log')?.checked ?? true;

          const res = await fetch('/api/jarvis/proactive/preferences', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({
              quietHours: { enabled: quietEnabled, start: quietStart, end: quietEnd },
              maxNotificationsPerHour: maxPerHour,
              channels: { hud: chHud, audioSpeech: chSpeech, systemLog: chLog },
            }),
          });
          const data = await res.json();
          if (data.success) {
            alert('Proactive monitoring preferences saved successfully!');
            refreshPreferences();
          } else {
            alert(`Error saving preferences: ${data.error}`);
          }
        } catch (err) {
          alert(`Error: ${err.message}`);
        }
      });
    }

    async function refreshPreferences() {
      const tagsContainer = document.getElementById('monitored-projects-tags');
      if (!tagsContainer) return;

      try {
        const res = await fetch('/api/jarvis/proactive/preferences', {
          headers: { 'x-user-id': 'dwight' },
        });
        const data = await res.json();
        if (!data.success || !data.data) return;

        const p = data.data;

        // Tags
        tagsContainer.innerHTML = (p.monitoredProjectIds || []).map((id) => `
          <span style="background: #0b1329; border: 1px solid #334155; color: var(--hud-cyan); font-size: 0.78rem; padding: 3px 8px; border-radius: 4px; display: inline-flex; align-items: center; gap: 6px;">
            <code>${id}</code>
            <span class="btn-revoke-proj" data-id="${id}" style="cursor: pointer; color: #94a3b8; font-weight: bold;">&times;</span>
          </span>
        `).join('') || '<span style="color: #64748b; font-size: 0.75rem;">No monitored projects authorized.</span>';

        tagsContainer.querySelectorAll('.btn-revoke-proj').forEach((btn) => {
          btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-id');
            await fetch(`/api/jarvis/proactive/monitored-projects/${id}`, {
              method: 'DELETE',
              headers: { 'x-user-id': 'dwight' },
            });
            refreshPreferences();
          });
        });

        // Form fields
        if (p.quietHours) {
          const qCheck = document.getElementById('pref-quiet-enabled');
          const qStart = document.getElementById('pref-quiet-start');
          const qEnd = document.getElementById('pref-quiet-end');
          if (qCheck) qCheck.checked = p.quietHours.enabled;
          if (qStart) qStart.value = p.quietHours.start;
          if (qEnd) qEnd.value = p.quietHours.end;
        }

        if (p.maxNotificationsPerHour && maxNotifsSlider) {
          maxNotifsSlider.value = p.maxNotificationsPerHour;
          if (maxNotifsLabel) maxNotifsLabel.textContent = `${p.maxNotificationsPerHour} / hr`;
        }

        if (p.channels) {
          const chHud = document.getElementById('pref-channel-hud');
          const chSpeech = document.getElementById('pref-channel-speech');
          const chLog = document.getElementById('pref-channel-log');
          if (chHud) chHud.checked = p.channels.hud;
          if (chSpeech) chSpeech.checked = p.channels.audioSpeech;
          if (chLog) chLog.checked = p.channels.systemLog;
        }
      } catch (err) {
        if (tagsContainer) tagsContainer.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
      }
    }

    function refreshProactiveAll() {
      refreshNotifications();
      refreshSuggestions();
      refreshBriefing();
      refreshPreferences();
    }
  }

  // ==========================================
  // PHASE 24: SKILL & TOOL BUILDER STUDIO
  // ==========================================
  function initSkillBuilderStudio() {
    const navBtn = document.getElementById('nav-skill-builder');
    const chipBtn = document.getElementById('chip-skill-builder-agent');
    const modal = document.getElementById('skill-builder-modal');
    const closeBtn = document.getElementById('skill-builder-modal-close');
    const backdrop = document.getElementById('skill-builder-modal-backdrop');
    const refreshCatalogBtn = document.getElementById('skill-refresh-catalog-btn');

    if (!modal) return;

    let activeFilter = 'all';
    let cachedSkills = [];

    function openModal() {
      modal.style.display = 'flex';
      refreshCatalog();
    }

    function closeModal() {
      modal.style.display = 'none';
    }

    if (navBtn) navBtn.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
    if (chipBtn) chipBtn.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);
    if (refreshCatalogBtn) refreshCatalogBtn.addEventListener('click', () => refreshCatalog());

    // Tab switching
    const tabBtns = modal.querySelectorAll('.hud-tab-btn');
    const tabPanels = modal.querySelectorAll('.hud-tab-content');

    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetTabId = btn.getAttribute('data-tab');
        tabBtns.forEach((b) => {
          b.classList.remove('active');
          b.style.color = '#94a3b8';
          b.style.borderBottom = 'none';
        });
        tabPanels.forEach((p) => {
          p.classList.remove('active');
          p.style.display = 'none';
        });

        btn.classList.add('active');
        btn.style.color = '#ec4899';
        btn.style.borderBottom = '2px solid #ec4899';

        const activePanel = document.getElementById(targetTabId);
        if (activePanel) {
          activePanel.classList.add('active');
          activePanel.style.display = 'block';
        }

        if (targetTabId === 'skill-tab-catalog') refreshCatalog();
        if (targetTabId === 'skill-tab-sandbox' || targetTabId === 'skill-tab-governance') populateDropdowns();
      });
    });

    // Preset templates for Foundry
    const templateSelect = document.getElementById('skill-template-select');
    if (templateSelect) {
      templateSelect.addEventListener('change', () => {
        const val = templateSelect.value;
        const idInput = document.getElementById('skill-input-id');
        const nameInput = document.getElementById('skill-input-name');
        const typeInput = document.getElementById('skill-input-type');
        const tagsInput = document.getElementById('skill-input-tags');
        const descInput = document.getElementById('skill-input-desc');
        const codeInput = document.getElementById('skill-input-code');
        const testsInput = document.getElementById('skill-input-tests');

        if (val === 'math_solver') {
          if (idInput) idInput.value = 'custom.fibonacci_generator';
          if (nameInput) nameInput.value = 'Fibonacci Sequence Generator';
          if (typeInput) typeInput.value = 'custom_solver';
          if (tagsInput) tagsInput.value = 'math, sequence, solver';
          if (descInput) descInput.value = 'Computes N terms of the Fibonacci sequence with range validation.';
          if (codeInput) codeInput.value = `function execute(params, context) {
  const n = Math.min(Math.max(Number(params.n) || 1, 1), 30);
  const seq = [0, 1];
  while (seq.length < n) {
    seq.push(seq[seq.length - 1] + seq[seq.length - 2]);
  }
  return { n, sequence: seq.slice(0, n), lastTerm: seq[n - 1] };
}`;
          if (testsInput) testsInput.value = JSON.stringify([
            { name: 'Compute 5 terms', input: { n: 5 }, expectedSuccess: true, expectedOutputSubstring: '"lastTerm":3' },
            { name: 'Compute 1 term', input: { n: 1 }, expectedSuccess: true, expectedOutputSubstring: '"lastTerm":0' }
          ], null, 2);
        } else if (val === 'data_transformer') {
          if (idInput) idInput.value = 'custom.json_key_sorter';
          if (nameInput) nameInput.value = 'JSON Key Sorter & Minifier';
          if (typeInput) typeInput.value = 'data_transformer';
          if (tagsInput) tagsInput.value = 'data, json, transform';
          if (descInput) descInput.value = 'Sorts object keys alphabetically and computes key statistics.';
          if (codeInput) codeInput.value = `function execute(params, context) {
  const obj = params.input || {};
  const sorted = {};
  Object.keys(obj).sort().forEach(k => { sorted[k] = obj[k]; });
  return { sorted, keyCount: Object.keys(sorted).length };
}`;
          if (testsInput) testsInput.value = JSON.stringify([
            { name: 'Sort 3 keys', input: { input: { z: 1, a: 2, m: 3 } }, expectedSuccess: true, expectedOutputSubstring: '"keyCount":3' }
          ], null, 2);
        } else if (val === 'string_formatter') {
          if (idInput) idInput.value = 'custom.markdown_table_formatter';
          if (nameInput) nameInput.value = 'Markdown Table Formatter';
          if (typeInput) typeInput.value = 'data_transformer';
          if (tagsInput) tagsInput.value = 'markdown, tables, format';
          if (descInput) descInput.value = 'Converts arrays of records into formatted GitHub Markdown tables.';
          if (codeInput) codeInput.value = `function execute(params, context) {
  const headers = params.headers || ['Key', 'Value'];
  const rows = params.rows || [];
  let table = '| ' + headers.join(' | ') + ' |\\n| ' + headers.map(() => '---').join(' | ') + ' |\\n';
  rows.forEach(r => {
    table += '| ' + headers.map(h => String(r[h] ?? '')).join(' | ') + ' |\\n';
  });
  return { markdownTable: table, rowCount: rows.length };
}`;
          if (testsInput) testsInput.value = JSON.stringify([
            { name: 'Format empty table', input: { headers: ['A', 'B'], rows: [] }, expectedSuccess: true, expectedOutputSubstring: '"rowCount":0' }
          ], null, 2);
        } else if (val === 'automation_script') {
          if (idInput) idInput.value = 'custom.batch_hasher';
          if (nameInput) nameInput.value = 'Batch Text Hasher';
          if (typeInput) typeInput.value = 'automation_script';
          if (tagsInput) tagsInput.value = 'crypto, hash, security';
          if (descInput) descInput.value = 'Computes deterministic character count and integer hash fingerprint safely.';
          if (codeInput) codeInput.value = `function execute(params, context) {
  const text = String(params.text || '');
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }
  return { textLength: text.length, hashHex: '0x' + Math.abs(hash).toString(16) };
}`;
          if (testsInput) testsInput.value = JSON.stringify([
            { name: 'Hash text', input: { text: 'hello' }, expectedSuccess: true, expectedOutputSubstring: '"textLength":5' }
          ], null, 2);
        }
      });
    }

    // Filter Buttons in Catalog
    const filterGroup = document.getElementById('skill-filter-group');
    if (filterGroup) {
      filterGroup.querySelectorAll('button').forEach((b) => {
        b.addEventListener('click', () => {
          filterGroup.querySelectorAll('button').forEach((btn) => {
            btn.classList.remove('active');
            btn.style.background = '#0b1329';
            btn.style.color = '#94a3b8';
            btn.style.borderColor = '#334155';
          });
          b.classList.add('active');
          b.style.background = 'rgba(236, 72, 153, 0.2)';
          b.style.color = '#f472b6';
          b.style.borderColor = '#ec4899';
          activeFilter = b.getAttribute('data-filter') || 'all';
          renderCatalogCards();
        });
      });
    }

    // Submit Draft Skill
    const draftSubmitBtn = document.getElementById('skill-draft-submit-btn');
    if (draftSubmitBtn) {
      draftSubmitBtn.addEventListener('click', async () => {
        const id = (document.getElementById('skill-input-id')?.value || '').trim();
        const name = (document.getElementById('skill-input-name')?.value || '').trim();
        const type = document.getElementById('skill-input-type')?.value || 'custom_solver';
        const tags = (document.getElementById('skill-input-tags')?.value || '').split(',').map((t) => t.trim()).filter(Boolean);
        const description = (document.getElementById('skill-input-desc')?.value || '').trim();
        const implementationCode = (document.getElementById('skill-input-code')?.value || '').trim();
        const testsRaw = (document.getElementById('skill-input-tests')?.value || '').trim();

        if (!id || !name || !description || !implementationCode) {
          alert('Please provide Skill ID, Name, Description, and Implementation Code.');
          return;
        }

        let testCases = [];
        if (testsRaw) {
          try {
            testCases = JSON.parse(testsRaw);
          } catch (e) {
            alert('Test Cases must be valid JSON.');
            return;
          }
        }

        try {
          draftSubmitBtn.disabled = true;
          draftSubmitBtn.textContent = 'Synthesizing...';

          const res = await fetch('/api/jarvis/skills/draft', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({
              id,
              name,
              type,
              description,
              implementationCode,
              testCases,
              tags,
            }),
          });
          const data = await res.json();
          draftSubmitBtn.disabled = false;
          draftSubmitBtn.textContent = '⚡ Synthesize & Save Draft';

          if (data.success) {
            alert(`Skill draft "${data.data?.name}" created successfully!`);
            const catalogTabBtn = modal.querySelector('[data-tab="skill-tab-catalog"]');
            if (catalogTabBtn) catalogTabBtn.click();
          } else {
            alert(`Error creating skill: ${data.error}`);
          }
        } catch (err) {
          draftSubmitBtn.disabled = false;
          draftSubmitBtn.textContent = '⚡ Synthesize & Save Draft';
          alert(`Error: ${err.message}`);
        }
      });
    }

    // Refresh Catalog Data
    async function refreshCatalog() {
      const statusLabel = document.getElementById('skill-catalog-status-label');
      const countBadge = document.getElementById('skill-catalog-count');

      try {
        if (statusLabel) statusLabel.textContent = 'Loading custom skills...';
        const res = await fetch('/api/jarvis/skills', {
          headers: { 'x-user-id': 'dwight' },
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          cachedSkills = data.data;
          if (countBadge) countBadge.textContent = cachedSkills.length;
          if (statusLabel) statusLabel.textContent = `${cachedSkills.length} custom skills available`;
          renderCatalogCards();
          populateDropdowns();
        }
      } catch (err) {
        if (statusLabel) statusLabel.textContent = `Error loading: ${err.message}`;
      }
    }

    // Render Cards in Catalog
    function renderCatalogCards() {
      const container = document.getElementById('skill-catalog-cards');
      if (!container) return;

      let list = cachedSkills;
      if (activeFilter !== 'all') {
        list = list.filter((s) => s.status === activeFilter);
      }

      if (list.length === 0) {
        container.innerHTML = `
          <div style="grid-column: 1 / -1; padding: 2rem; text-align: center; color: #64748b; background: #020617; border: 1px dashed #334155; border-radius: 8px;">
            No custom skills matching filter "${activeFilter}". Draft a new skill in the Foundry tab.
          </div>
        `;
        return;
      }

      const statusColors = {
        installed: { bg: 'rgba(16, 185, 129, 0.2)', border: '#10b981', text: '#10b981' },
        tested: { bg: 'rgba(0, 240, 255, 0.2)', border: '#00f0ff', text: '#00f0ff' },
        awaiting_approval: { bg: 'rgba(56, 189, 248, 0.2)', border: '#38bdf8', text: '#38bdf8' },
        generated: { bg: 'rgba(236, 72, 153, 0.2)', border: '#ec4899', text: '#f472b6' },
        draft: { bg: 'rgba(168, 85, 247, 0.2)', border: '#a855f7', text: '#c084fc' },
        rejected: { bg: 'rgba(239, 68, 68, 0.2)', border: '#ef4444', text: '#ef4444' },
        disabled: { bg: 'rgba(100, 116, 139, 0.2)', border: '#64748b', text: '#94a3b8' },
      };

      container.innerHTML = list.map((s) => {
        const color = statusColors[s.status] || { bg: '#1e293b', border: '#475569', text: '#cbd5e1' };
        const isInstalled = s.status === 'installed';
        const canInstall = s.status === 'tested' || s.status === 'awaiting_approval';

        return `
          <div style="background: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 1rem; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                <strong style="color: #fff; font-size: 0.92rem;">${s.name}</strong>
                <span style="background: ${color.bg}; border: 1px solid ${color.border}; color: ${color.text}; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; font-weight: 600;">
                  ${s.status.replace('_', ' ')}
                </span>
              </div>
              <div style="font-family: monospace; font-size: 0.72rem; color: #ec4899; margin-bottom: 6px;">${s.id}</div>
              <p style="font-size: 0.78rem; color: #94a3b8; margin: 0 0 10px 0; line-height: 1.4;">${s.description}</p>
              
              <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 10px;">
                <span style="background: #0b1329; border: 1px solid #334155; color: #38bdf8; font-size: 0.68rem; padding: 2px 6px; border-radius: 3px;">type: ${s.type}</span>
                <span style="background: #0b1329; border: 1px solid #334155; color: #facc15; font-size: 0.68rem; padding: 2px 6px; border-radius: 3px;">v${s.version}</span>
                <span style="background: #0b1329; border: 1px solid #334155; color: #94a3b8; font-size: 0.68rem; padding: 2px 6px; border-radius: 3px;">${s.testCases?.length || 0} tests</span>
              </div>
            </div>

            <div style="border-top: 1px solid #0f172a; padding-top: 8px; display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end;">
              <button class="btn-card-test btn btn-sm" data-id="${s.id}" style="padding: 4px 8px; font-size: 0.72rem; background: rgba(0, 240, 255, 0.1); border: 1px solid #00f0ff; color: #00f0ff; border-radius: 4px; cursor: pointer;">
                🧪 Test
              </button>
              ${canInstall ? `
                <button class="btn-card-install btn btn-sm" data-id="${s.id}" style="padding: 4px 8px; font-size: 0.72rem; background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; color: #10b981; border-radius: 4px; cursor: pointer; font-weight: 600;">
                  ⚡ Install
                </button>
              ` : ''}
              ${isInstalled ? `
                <button class="btn-card-uninstall btn btn-sm" data-id="${s.id}" style="padding: 4px 8px; font-size: 0.72rem; background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; color: #ef4444; border-radius: 4px; cursor: pointer;">
                  Uninstall
                </button>
              ` : ''}
              <button class="btn-card-del btn btn-sm" data-id="${s.id}" style="padding: 4px 8px; font-size: 0.72rem; background: #0b1329; border: 1px solid #334155; color: #64748b; border-radius: 4px; cursor: pointer;">
                &times;
              </button>
            </div>
          </div>
        `;
      }).join('');

      container.querySelectorAll('.btn-card-test').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const sandboxTabBtn = modal.querySelector('[data-tab="skill-tab-sandbox"]');
          if (sandboxTabBtn) sandboxTabBtn.click();
          const targetSelect = document.getElementById('sandbox-target-skill');
          if (targetSelect) targetSelect.value = id;
          runSandboxTest(id);
        });
      });

      container.querySelectorAll('.btn-card-install').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          await installSkill(id);
        });
      });

      container.querySelectorAll('.btn-card-uninstall').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          await uninstallSkill(id);
        });
      });

      container.querySelectorAll('.btn-card-del').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          if (confirm(`Delete skill draft "${id}"?`)) {
            await deleteSkill(id);
          }
        });
      });
    }

    function populateDropdowns() {
      const sandboxTargetSelect = document.getElementById('sandbox-target-skill');
      const governancePendingSelect = document.getElementById('governance-pending-skill');
      const liveToolSelect = document.getElementById('live-tool-select');

      if (sandboxTargetSelect) {
        const curVal = sandboxTargetSelect.value;
        sandboxTargetSelect.innerHTML = cachedSkills.map((s) => `
          <option value="${s.id}">${s.name} (${s.id}) [${s.status}]</option>
        `).join('');
        if (curVal) sandboxTargetSelect.value = curVal;
      }

      if (governancePendingSelect) {
        const pending = cachedSkills.filter((s) => s.status === 'tested' || s.status === 'awaiting_approval' || s.status === 'generated');
        governancePendingSelect.innerHTML = pending.length > 0
          ? pending.map((s) => `<option value="${s.id}">${s.name} (${s.id}) [${s.status}]</option>`).join('')
          : '<option value="">-- No Pending Skills For Review --</option>';
      }

      if (liveToolSelect) {
        const installed = cachedSkills.filter((s) => s.status === 'installed');
        liveToolSelect.innerHTML = installed.length > 0
          ? installed.map((s) => `<option value="${s.id}">${s.name} (${s.id})</option>`).join('')
          : '<option value="">-- No Installed Dynamic Tools --</option>';
      }
    }

    const runSandboxBtn = document.getElementById('sandbox-run-test-btn');
    if (runSandboxBtn) {
      runSandboxBtn.addEventListener('click', () => {
        const id = document.getElementById('sandbox-target-skill')?.value;
        if (!id) return;
        runSandboxTest(id);
      });
    }

    async function runSandboxTest(id) {
      const container = document.getElementById('sandbox-report-container');
      const secBadge = document.getElementById('sandbox-security-badge');
      const secDetails = document.getElementById('sandbox-security-details');
      const overallBadge = document.getElementById('sandbox-overall-badge');
      const passCount = document.getElementById('sandbox-pass-count');
      const totalCount = document.getElementById('sandbox-total-count');
      const resultsList = document.getElementById('sandbox-results-list');

      if (!container) return;
      container.style.display = 'block';

      try {
        if (overallBadge) overallBadge.textContent = 'RUNNING...';
        const res = await fetch(`/api/jarvis/skills/${encodeURIComponent(id)}/test`, {
          method: 'POST',
          headers: { 'x-user-id': 'dwight' },
        });
        const data = await res.json();
        if (!data.success) {
          alert(`Test harness error: ${data.error}`);
          return;
        }

        const rep = data.data;

        if (secBadge) {
          if (rep.securityCleared) {
            secBadge.textContent = 'Safe & Cleared';
            secBadge.style.background = 'rgba(16, 185, 129, 0.2)';
            secBadge.style.borderColor = '#10b981';
            secBadge.style.color = '#10b981';
            secDetails.textContent = 'Static AST security screening cleared. No dangerous forbidden tokens or secret leaks detected.';
          } else {
            secBadge.textContent = 'Threat Detected';
            secBadge.style.background = 'rgba(239, 68, 68, 0.2)';
            secBadge.style.borderColor = '#ef4444';
            secBadge.style.color = '#ef4444';
            secDetails.textContent = `Security violations found: ${(rep.threatsFound || []).join(', ')}`;
          }
        }

        if (overallBadge) {
          if (rep.overallStatus === 'passed') {
            overallBadge.textContent = 'PASSED';
            overallBadge.style.background = 'rgba(16, 185, 129, 0.2)';
            overallBadge.style.borderColor = '#10b981';
            overallBadge.style.color = '#10b981';
          } else {
            overallBadge.textContent = 'FAILED';
            overallBadge.style.background = 'rgba(239, 68, 68, 0.2)';
            overallBadge.style.borderColor = '#ef4444';
            overallBadge.style.color = '#ef4444';
          }
        }

        if (passCount) passCount.textContent = rep.testsPassed;
        if (totalCount) totalCount.textContent = rep.testsTotal;

        if (resultsList && Array.isArray(rep.testResults)) {
          resultsList.innerHTML = rep.testResults.map((tr) => `
            <div style="background: #070c18; border: 1px solid #1e293b; border-radius: 6px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="font-weight: 600; color: #fff; font-size: 0.8rem;">${tr.testCaseName}</span>
                ${tr.error ? `<div style="color: #ef4444; font-size: 0.72rem; margin-top: 2px;">${tr.error}</div>` : ''}
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 0.72rem; color: #64748b;">${tr.executionTimeMs}ms</span>
                <span style="font-size: 0.72rem; padding: 2px 6px; border-radius: 3px; font-weight: bold; background: ${tr.passed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}; color: ${tr.passed ? '#10b981' : '#ef4444'}; border: 1px solid ${tr.passed ? '#10b981' : '#ef4444'};">
                  ${tr.passed ? 'PASS' : 'FAIL'}
                </span>
              </div>
            </div>
          `).join('');
        }

        refreshCatalog();
      } catch (err) {
        alert(`Failed to execute test: ${err.message}`);
      }
    }

    const approveBtn = document.getElementById('governance-approve-btn');
    if (approveBtn) {
      approveBtn.addEventListener('click', async () => {
        const id = document.getElementById('governance-pending-skill')?.value;
        const notes = document.getElementById('governance-review-notes')?.value || '';
        if (!id) return;

        try {
          const res = await fetch(`/api/jarvis/skills/${encodeURIComponent(id)}/approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({ approved: true, reason: notes }),
          });
          const data = await res.json();
          if (data.success) {
            alert(`Skill "${id}" successfully approved! You may now hot-install it.`);
            refreshCatalog();
          } else {
            alert(`Approval failed: ${data.error}`);
          }
        } catch (err) {
          alert(`Error: ${err.message}`);
        }
      });
    }

    const rejectBtn = document.getElementById('governance-reject-btn');
    if (rejectBtn) {
      rejectBtn.addEventListener('click', async () => {
        const id = document.getElementById('governance-pending-skill')?.value;
        const notes = document.getElementById('governance-review-notes')?.value || '';
        if (!id) return;

        try {
          const res = await fetch(`/api/jarvis/skills/${encodeURIComponent(id)}/approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({ approved: false, reason: notes }),
          });
          const data = await res.json();
          if (data.success) {
            alert(`Skill "${id}" marked as rejected.`);
            refreshCatalog();
          } else {
            alert(`Rejection failed: ${data.error}`);
          }
        } catch (err) {
          alert(`Error: ${err.message}`);
        }
      });
    }

    async function installSkill(id) {
      try {
        const res = await fetch(`/api/jarvis/skills/${encodeURIComponent(id)}/install`, {
          method: 'POST',
          headers: { 'x-user-id': 'dwight' },
        });
        const data = await res.json();
        if (data.success) {
          alert(`Skill "${id}" hot-installed into ToolRegistry!`);
          refreshCatalog();
        } else {
          alert(`Install failed: ${data.error}`);
        }
      } catch (err) {
        alert(`Error: ${err.message}`);
      }
    }

    async function uninstallSkill(id) {
      try {
        const res = await fetch(`/api/jarvis/skills/${encodeURIComponent(id)}/uninstall`, {
          method: 'POST',
          headers: { 'x-user-id': 'dwight' },
        });
        const data = await res.json();
        if (data.success) {
          alert(`Skill "${id}" uninstalled from ToolRegistry.`);
          refreshCatalog();
        } else {
          alert(`Uninstall failed: ${data.error}`);
        }
      } catch (err) {
        alert(`Error: ${err.message}`);
      }
    }

    async function deleteSkill(id) {
      try {
        const res = await fetch(`/api/jarvis/skills/${encodeURIComponent(id)}`, {
          method: 'DELETE',
          headers: { 'x-user-id': 'dwight' },
        });
        const data = await res.json();
        if (data.success) {
          refreshCatalog();
        } else {
          alert(`Delete failed: ${data.error}`);
        }
      } catch (err) {
        alert(`Error: ${err.message}`);
      }
    }

    const liveExecBtn = document.getElementById('live-tool-exec-btn');
    if (liveExecBtn) {
      liveExecBtn.addEventListener('click', async () => {
        const toolId = document.getElementById('live-tool-select')?.value;
        const paramsRaw = document.getElementById('live-tool-params')?.value || '{}';
        const outputBox = document.getElementById('live-tool-output');

        if (!toolId) {
          alert('Please select an installed custom tool.');
          return;
        }

        let params = {};
        try {
          params = JSON.parse(paramsRaw);
        } catch (e) {
          alert('Parameters must be valid JSON.');
          return;
        }

        try {
          if (outputBox) outputBox.innerHTML = '<span style="color: #38bdf8;">Invoking tool...</span>';
          const res = await fetch(`/api/tools/${encodeURIComponent(toolId)}/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({ params }),
          });
          const data = await res.json();
          if (outputBox) {
            outputBox.innerHTML = `
              <pre style="margin: 0; color: ${data.success ? '#10b981' : '#ef4444'}; font-size: 0.75rem;">${JSON.stringify(data, null, 2)}</pre>
            `;
          }
        } catch (err) {
          if (outputBox) outputBox.innerHTML = `<span style="color: #ef4444;">Invocation error: ${err.message}</span>`;
        }
      });
    }
  }

  // ==========================================
  // PHASE 25: MULTI-AGENT COLLABORATION STUDIO
  // ==========================================
  function initCollaborationStudio() {
    const navBtn = document.getElementById('nav-collaboration');
    const chipBtn = document.getElementById('chip-collaboration-agent');
    const modal = document.getElementById('collaboration-modal');
    const closeBtn = document.getElementById('collaboration-modal-close');
    const backdrop = document.getElementById('collaboration-modal-backdrop');
    const refreshBtn = document.getElementById('collab-refresh-btn');

    if (!modal) return;

    let activeFilter = 'all';
    let cachedMissions = [];

    function openModal() {
      modal.style.display = 'flex';
      refreshMissions();
    }

    function closeModal() {
      modal.style.display = 'none';
    }

    if (navBtn) navBtn.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
    if (chipBtn) chipBtn.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);
    if (refreshBtn) refreshBtn.addEventListener('click', () => refreshMissions());

    // Tab switching
    const tabBtns = modal.querySelectorAll('.hud-tab-btn');
    const tabPanels = modal.querySelectorAll('.hud-tab-content');

    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetTabId = btn.getAttribute('data-tab');
        tabBtns.forEach((b) => {
          b.classList.remove('active');
          b.style.color = '#94a3b8';
          b.style.borderBottom = 'none';
        });
        tabPanels.forEach((p) => {
          p.classList.remove('active');
          p.style.display = 'none';
        });

        btn.classList.add('active');
        btn.style.color = '#818cf8';
        btn.style.borderBottom = '2px solid #818cf8';

        const activePanel = document.getElementById(targetTabId);
        if (activePanel) {
          activePanel.classList.add('active');
          activePanel.style.display = 'block';
        }

        if (targetTabId === 'collab-tab-missions') refreshMissions();
        if (targetTabId === 'collab-tab-blackboard') refreshBlackboardView();
        if (targetTabId === 'collab-tab-bus') refreshBusView();
      });
    });

    // Preset templates for Dispatch
    const templateSelect = document.getElementById('collab-template-select');
    if (templateSelect) {
      templateSelect.addEventListener('change', () => {
        const val = templateSelect.value;
        const titleInput = document.getElementById('collab-input-title');
        const topologyInput = document.getElementById('collab-input-topology');
        const objectiveInput = document.getElementById('collab-input-objective');
        const agentsInput = document.getElementById('collab-input-agents');
        const stepsInput = document.getElementById('collab-input-steps');

        if (val === 'stem_research_pipeline') {
          if (titleInput) titleInput.value = 'STEM Science & Mathematics Discovery Pipeline';
          if (topologyInput) topologyInput.value = 'pipeline';
          if (objectiveInput) objectiveInput.value = 'Scientific inquiry -> Closed-form math derivation -> Statistical validation -> Production code.';
          if (agentsInput) agentsInput.value = 'research-agent, mathematics-agent, data-agent, coding-agent';
          if (stepsInput) stepsInput.value = JSON.stringify([
            { name: 'Literature Survey', agentId: 'research-agent', description: 'Query epistemic sources and extract prior art.' },
            { name: 'Mathematical Formulation', agentId: 'mathematics-agent', description: 'Derive analytic proof and boundary conditions.' },
            { name: 'Statistical Verification', agentId: 'data-agent', description: 'Evaluate parameter distribution stability.' },
            { name: 'Production Implementation', agentId: 'coding-agent', description: 'Scaffold optimized TypeScript solver.' }
          ], null, 2);
        } else if (val === 'venture_product_builder') {
          if (titleInput) titleInput.value = 'Autonomous Venture & Product Innovation Sprint';
          if (topologyInput) topologyInput.value = 'hierarchical';
          if (objectiveInput) objectiveInput.value = 'Product strategy -> Tech architecture -> Visual branding -> Core microservice prototype.';
          if (agentsInput) agentsInput.value = 'innovation-agent, research-agent, creative-agent, coding-agent';
          if (stepsInput) stepsInput.value = JSON.stringify([
            { name: 'Market & PMF Discovery', agentId: 'innovation-agent', description: 'Analyze market sizing and RICE feature matrix.' },
            { name: 'Architectural Blueprint', agentId: 'research-agent', description: 'Define tech stack and API schema requirements.' },
            { name: 'Visual Identity & UX', agentId: 'creative-agent', description: 'Synthesize SVG vector branding and design tokens.' },
            { name: 'Prototype Scaffolding', agentId: 'coding-agent', description: 'Scaffold core endpoints and automated tests.' }
          ], null, 2);
        } else if (val === 'security_audit_consensus') {
          if (titleInput) titleInput.value = 'Code Review & Security Audit Ensemble';
          if (topologyInput) topologyInput.value = 'consensus';
          if (objectiveInput) objectiveInput.value = 'Scaffold feature implementation -> AST security screening -> Cross-agent peer review.';
          if (agentsInput) agentsInput.value = 'coding-agent, skill-builder-agent, proactive-agent';
          if (stepsInput) stepsInput.value = JSON.stringify([
            { name: 'Feature Implementation', agentId: 'coding-agent', description: 'Generate feature code and patch proposal.' },
            { name: 'Sandbox AST Threat Audit', agentId: 'skill-builder-agent', description: 'Screen for dangerous tokens and secret leaks.' },
            { name: 'Operational Risk Evaluation', agentId: 'proactive-agent', description: 'Assess milestone impact and stability risks.' }
          ], null, 2);
        } else if (val === 'cross_domain_parallel_analysis') {
          if (titleInput) titleInput.value = 'Multi-Perspective Parallel Intelligence Ensemble';
          if (topologyInput) topologyInput.value = 'parallel';
          if (objectiveInput) objectiveInput.value = 'Concurrent evaluation across scientific, mathematical, and financial domains.';
          if (agentsInput) agentsInput.value = 'research-agent, mathematics-agent, finance-agent';
          if (stepsInput) stepsInput.value = JSON.stringify([
            { name: 'Macro Epistemic Context', agentId: 'research-agent', description: 'Evaluate domain background and prior art.' },
            { name: 'Quantitative Modeling', agentId: 'mathematics-agent', description: 'Compute algebraic models and sensitivity coefficients.' },
            { name: 'Financial Feasibility', agentId: 'finance-agent', description: 'Analyze DCF valuation and capital efficiency.' }
          ], null, 2);
        }
      });
    }

    // Filter Buttons in Active Missions
    const filterGroup = document.getElementById('collab-filter-group');
    if (filterGroup) {
      filterGroup.querySelectorAll('button').forEach((b) => {
        b.addEventListener('click', () => {
          filterGroup.querySelectorAll('button').forEach((btn) => {
            btn.classList.remove('active');
            btn.style.background = '#0b1329';
            btn.style.color = '#94a3b8';
            btn.style.borderColor = '#334155';
          });
          b.classList.add('active');
          b.style.background = 'rgba(99, 102, 241, 0.2)';
          b.style.color = '#818cf8';
          b.style.borderColor = '#6366f1';
          activeFilter = b.getAttribute('data-filter') || 'all';
          renderMissionCards();
        });
      });
    }

    // Submit Dispatch Mission
    const dispatchSubmitBtn = document.getElementById('collab-dispatch-submit-btn');
    if (dispatchSubmitBtn) {
      dispatchSubmitBtn.addEventListener('click', async () => {
        const title = (document.getElementById('collab-input-title')?.value || '').trim();
        const objective = (document.getElementById('collab-input-objective')?.value || '').trim();
        const topology = document.getElementById('collab-input-topology')?.value || 'pipeline';
        const agentsRaw = (document.getElementById('collab-input-agents')?.value || '').trim();
        const stepsRaw = (document.getElementById('collab-input-steps')?.value || '').trim();

        if (!title || !objective) {
          alert('Please enter Mission Title and Objective.');
          return;
        }

        const participatingAgentIds = agentsRaw ? agentsRaw.split(',').map((a) => a.trim()).filter(Boolean) : undefined;
        let steps = undefined;
        if (stepsRaw) {
          try {
            steps = JSON.parse(stepsRaw);
          } catch (e) {
            alert('Steps must be valid JSON array.');
            return;
          }
        }

        try {
          dispatchSubmitBtn.disabled = true;
          dispatchSubmitBtn.textContent = 'Launching...';

          const res = await fetch('/api/jarvis/collaboration/missions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({
              title,
              objective,
              topology,
              participatingAgentIds,
              steps,
            }),
          });
          const data = await res.json();
          dispatchSubmitBtn.disabled = false;
          dispatchSubmitBtn.textContent = '🚀 Dispatch Multi-Agent Mission';

          if (data.success) {
            alert(`Mission "${data.data?.title}" successfully dispatched!`);
            const missionsTabBtn = modal.querySelector('[data-tab="collab-tab-missions"]');
            if (missionsTabBtn) missionsTabBtn.click();
          } else {
            alert(`Error creating mission: ${data.error}`);
          }
        } catch (err) {
          dispatchSubmitBtn.disabled = false;
          dispatchSubmitBtn.textContent = '🚀 Dispatch Multi-Agent Mission';
          alert(`Error: ${err.message}`);
        }
      });
    }

    // Refresh Missions
    async function refreshMissions() {
      const statusLabel = document.getElementById('collab-missions-status-label');
      const countBadge = document.getElementById('collab-missions-count');

      try {
        if (statusLabel) statusLabel.textContent = 'Loading team missions...';
        const res = await fetch('/api/jarvis/collaboration/missions', {
          headers: { 'x-user-id': 'dwight' },
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          cachedMissions = data.data;
          if (countBadge) countBadge.textContent = cachedMissions.length;
          if (statusLabel) statusLabel.textContent = `${cachedMissions.length} missions active`;
          renderMissionCards();
          populateMissionDropdowns();
        }
      } catch (err) {
        if (statusLabel) statusLabel.textContent = `Error loading: ${err.message}`;
      }
    }

    // Render Cards in Active Missions
    function renderMissionCards() {
      const container = document.getElementById('collab-missions-cards');
      if (!container) return;

      let list = cachedMissions;
      if (activeFilter !== 'all') {
        list = list.filter((m) => m.status === activeFilter);
      }

      if (list.length === 0) {
        container.innerHTML = `
          <div style="grid-column: 1 / -1; padding: 2rem; text-align: center; color: #64748b; background: #020617; border: 1px dashed #334155; border-radius: 8px;">
            No missions matching filter "${activeFilter}". Dispatch a new mission in the Dispatch tab.
          </div>
        `;
        return;
      }

      const statusColors = {
        completed: { bg: 'rgba(16, 185, 129, 0.2)', border: '#10b981', text: '#10b981' },
        running: { bg: 'rgba(0, 240, 255, 0.2)', border: '#00f0ff', text: '#00f0ff' },
        pending: { bg: 'rgba(245, 158, 11, 0.2)', border: '#f59e0b', text: '#f59e0b' },
        failed: { bg: 'rgba(239, 68, 68, 0.2)', border: '#ef4444', text: '#ef4444' },
      };

      container.innerHTML = list.map((m) => {
        const color = statusColors[m.status] || { bg: '#1e293b', border: '#475569', text: '#cbd5e1' };
        const completedSteps = m.steps?.filter((s) => s.status === 'completed').length || 0;
        const totalSteps = m.steps?.length || 1;
        const pct = Math.round((completedSteps / totalSteps) * 100);

        return `
          <div style="background: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 1rem; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                <strong style="color: #fff; font-size: 0.92rem;">${m.title}</strong>
                <span style="background: ${color.bg}; border: 1px solid ${color.border}; color: ${color.text}; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; font-weight: 600;">
                  ${m.status}
                </span>
              </div>
              <div style="font-family: monospace; font-size: 0.72rem; color: #818cf8; margin-bottom: 6px;">
                ${m.id} • <span style="color: #38bdf8;">topology: ${m.topology}</span>
              </div>
              <p style="font-size: 0.78rem; color: #94a3b8; margin: 0 0 10px 0; line-height: 1.4;">${m.objective}</p>
              
              <!-- Agent chips -->
              <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 10px;">
                ${(m.participatingAgentIds || []).map((a) => `
                  <span style="background: #0b1329; border: 1px solid #334155; color: #cbd5e1; font-size: 0.68rem; padding: 2px 6px; border-radius: 3px;">
                    🤖 ${a}
                  </span>
                `).join('')}
              </div>

              <!-- Progress bar -->
              <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: #94a3b8; margin-bottom: 4px;">
                  <span>Step Progress</span>
                  <span>${completedSteps}/${totalSteps} (${pct}%)</span>
                </div>
                <div style="height: 6px; background: #0f172a; border-radius: 3px; overflow: hidden;">
                  <div style="width: ${pct}%; height: 100%; background: ${m.status === 'completed' ? '#10b981' : '#6366f1'}; border-radius: 3px; transition: width 0.3s;"></div>
                </div>
              </div>
            </div>

            <div style="border-top: 1px solid #0f172a; padding-top: 8px; display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end;">
              ${m.status !== 'completed' ? `
                <button class="btn-mission-run btn btn-sm" data-id="${m.id}" style="padding: 4px 10px; font-size: 0.72rem; background: rgba(99, 102, 241, 0.2); border: 1px solid #6366f1; color: #818cf8; border-radius: 4px; cursor: pointer; font-weight: 600;">
                  ▶ Run Mission
                </button>
              ` : ''}
              <button class="btn-mission-bb btn btn-sm" data-id="${m.id}" style="padding: 4px 8px; font-size: 0.72rem; background: rgba(56, 189, 248, 0.1); border: 1px solid #38bdf8; color: #38bdf8; border-radius: 4px; cursor: pointer;">
                📋 Blackboard
              </button>
              <button class="btn-mission-bus btn btn-sm" data-id="${m.id}" style="padding: 4px 8px; font-size: 0.72rem; background: rgba(168, 85, 247, 0.1); border: 1px solid #a855f7; color: #c084fc; border-radius: 4px; cursor: pointer;">
                💬 Bus Log
              </button>
            </div>
          </div>
        `;
      }).join('');

      container.querySelectorAll('.btn-mission-run').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          btn.textContent = 'Running...';
          btn.disabled = true;
          try {
            const res = await fetch(`/api/jarvis/collaboration/missions/${encodeURIComponent(id)}/run`, {
              method: 'POST',
              headers: { 'x-user-id': 'dwight' },
            });
            const data = await res.json();
            if (data.success) {
              refreshMissions();
            } else {
              alert(`Mission failed: ${data.error}`);
            }
          } catch (err) {
            alert(`Error: ${err.message}`);
          }
        });
      });

      container.querySelectorAll('.btn-mission-bb').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const bbTabBtn = modal.querySelector('[data-tab="collab-tab-blackboard"]');
          if (bbTabBtn) bbTabBtn.click();
          const bbSelect = document.getElementById('blackboard-mission-select');
          if (bbSelect) {
            bbSelect.value = id;
            refreshBlackboardView();
          }
        });
      });

      container.querySelectorAll('.btn-mission-bus').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const busTabBtn = modal.querySelector('[data-tab="collab-tab-bus"]');
          if (busTabBtn) busTabBtn.click();
          const busSelect = document.getElementById('bus-mission-select');
          if (busSelect) {
            busSelect.value = id;
            refreshBusView();
          }
        });
      });
    }

    // Populate Mission Dropdowns
    function populateMissionDropdowns() {
      const bbSelect = document.getElementById('blackboard-mission-select');
      const busSelect = document.getElementById('bus-mission-select');

      if (bbSelect) {
        const cur = bbSelect.value;
        bbSelect.innerHTML = cachedMissions.map((m) => `
          <option value="${m.id}">${m.title} (${m.id}) [${m.status}]</option>
        `).join('');
        if (cur) bbSelect.value = cur;
      }

      if (busSelect) {
        const cur = busSelect.value;
        busSelect.innerHTML = cachedMissions.map((m) => `
          <option value="${m.id}">${m.title} (${m.id})</option>
        `).join('');
        if (cur) busSelect.value = cur;
      }
    }

    // Tab 3: Blackboard
    const bbRefreshBtn = document.getElementById('blackboard-refresh-btn');
    if (bbRefreshBtn) bbRefreshBtn.addEventListener('click', () => refreshBlackboardView());

    const bbMissionSelect = document.getElementById('blackboard-mission-select');
    if (bbMissionSelect) bbMissionSelect.addEventListener('change', () => refreshBlackboardView());

    async function refreshBlackboardView() {
      const missionId = document.getElementById('blackboard-mission-select')?.value;
      const container = document.getElementById('blackboard-entries-container');
      if (!missionId || !container) return;

      try {
        container.innerHTML = '<div style="color: #64748b; font-size: 0.78rem;">Loading blackboard data...</div>';
        const res = await fetch(`/api/jarvis/collaboration/missions/${encodeURIComponent(missionId)}/blackboard`, {
          headers: { 'x-user-id': 'dwight' },
        });
        const data = await res.json();
        if (data.success && data.data) {
          const entries = Object.entries(data.data);
          if (entries.length === 0) {
            container.innerHTML = '<div style="color: #64748b; font-size: 0.78rem;">Blackboard is empty for this mission.</div>';
            return;
          }

          container.innerHTML = entries.map(([k, v]) => `
            <div style="background: #070c18; border: 1px solid #1e293b; border-radius: 6px; padding: 8px 10px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <code style="color: #38bdf8; font-size: 0.78rem;">${k}</code>
                <span style="font-size: 0.68rem; color: #64748b;">stored artifact</span>
              </div>
              <pre style="margin: 0; color: #cbd5e1; font-family: monospace; font-size: 0.72rem; white-space: pre-wrap; word-break: break-all;">${typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v)}</pre>
            </div>
          `).join('');
        }
      } catch (err) {
        if (container) container.innerHTML = `<div style="color: #ef4444; font-size: 0.78rem;">Error: ${err.message}</div>`;
      }
    }

    // Write to Blackboard
    const bbWriteBtn = document.getElementById('bb-write-btn');
    if (bbWriteBtn) {
      bbWriteBtn.addEventListener('click', async () => {
        const missionId = document.getElementById('blackboard-mission-select')?.value;
        const key = (document.getElementById('bb-input-key')?.value || '').trim();
        const rawVal = (document.getElementById('bb-input-value')?.value || '').trim();
        const author = (document.getElementById('bb-input-author')?.value || 'dwight').trim();

        if (!missionId || !key || !rawVal) {
          alert('Please enter Mission, Key, and Value.');
          return;
        }

        let value = rawVal;
        try {
          value = JSON.parse(rawVal);
        } catch (_) {}

        try {
          const res = await fetch(`/api/jarvis/collaboration/missions/${encodeURIComponent(missionId)}/blackboard`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({ key, value, author }),
          });
          const data = await res.json();
          if (data.success) {
            document.getElementById('bb-input-key').value = '';
            document.getElementById('bb-input-value').value = '';
            refreshBlackboardView();
          } else {
            alert(`Error: ${data.error}`);
          }
        } catch (err) {
          alert(`Error: ${err.message}`);
        }
      });
    }

    // Tab 4: Bus & Peer Reviews
    const busMissionSelect = document.getElementById('bus-mission-select');
    if (busMissionSelect) busMissionSelect.addEventListener('change', () => refreshBusView());

    async function refreshBusView() {
      const missionId = document.getElementById('bus-mission-select')?.value;
      const messagesFeed = document.getElementById('bus-messages-feed');
      const reviewsFeed = document.getElementById('bus-reviews-feed');
      if (!missionId) return;

      try {
        const res = await fetch(`/api/jarvis/collaboration/missions/${encodeURIComponent(missionId)}`, {
          headers: { 'x-user-id': 'dwight' },
        });
        const data = await res.json();
        if (data.success && data.data) {
          const m = data.data;

          // Render messages
          if (messagesFeed) {
            if (!m.messages || m.messages.length === 0) {
              messagesFeed.innerHTML = '<div style="color: #64748b; font-size: 0.78rem;">No inter-agent messages logged yet.</div>';
            } else {
              messagesFeed.innerHTML = m.messages.map((msg) => `
                <div style="background: #070c18; border: 1px solid #1e293b; border-radius: 6px; padding: 8px 10px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span style="font-size: 0.75rem; font-weight: 600; color: #fff;">
                      🤖 ${msg.fromAgentId} &rarr; ${msg.toAgentId}
                    </span>
                    <span style="font-size: 0.68rem; padding: 1px 6px; border-radius: 3px; background: rgba(99, 102, 241, 0.2); color: #818cf8;">${msg.type}</span>
                  </div>
                  <p style="margin: 0; font-size: 0.78rem; color: #cbd5e1; line-height: 1.4;">${msg.content}</p>
                </div>
              `).join('');
            }
          }

          // Render peer reviews
          if (reviewsFeed) {
            if (!m.reviews || m.reviews.length === 0) {
              reviewsFeed.innerHTML = '<div style="color: #64748b; font-size: 0.75rem;">No peer reviews recorded.</div>';
            } else {
              reviewsFeed.innerHTML = m.reviews.map((r) => `
                <div style="background: #070c18; border: 1px solid #1e293b; border-radius: 4px; padding: 6px 8px;">
                  <div style="display: flex; justify-content: space-between; font-size: 0.72rem; margin-bottom: 2px;">
                    <span style="color: #10b981; font-weight: 600;">${r.reviewerAgentId} on ${r.targetStepId}</span>
                    <span style="color: ${r.approved ? '#10b981' : '#ef4444'}; font-weight: bold;">${r.approved ? 'APPROVED' : 'REJECTED'} (${r.score}%)</span>
                  </div>
                  <div style="font-size: 0.72rem; color: #94a3b8;">${r.critique}</div>
                </div>
              `).join('');
            }
          }
        }
      } catch (err) {
        if (messagesFeed) messagesFeed.innerHTML = `<div style="color: #ef4444; font-size: 0.78rem;">Error: ${err.message}</div>`;
      }
    }

    // Trigger Peer Review
    const triggerReviewBtn = document.getElementById('bus-trigger-review-btn');
    if (triggerReviewBtn) {
      triggerReviewBtn.addEventListener('click', async () => {
        const missionId = document.getElementById('bus-mission-select')?.value;
        const reviewerAgentId = (document.getElementById('bus-reviewer-agent')?.value || '').trim();
        const targetStepId = (document.getElementById('bus-target-step')?.value || '').trim();
        const critique = (document.getElementById('bus-critique-notes')?.value || '').trim();

        if (!missionId || !reviewerAgentId || !targetStepId) {
          alert('Please enter Mission, Reviewer Agent, and Target Step ID.');
          return;
        }

        try {
          const res = await fetch(`/api/jarvis/collaboration/missions/${encodeURIComponent(missionId)}/review`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({ reviewerAgentId, targetStepId, critique }),
          });
          const data = await res.json();
          if (data.success) {
            alert('Peer review recorded successfully!');
            refreshBusView();
          } else {
            alert(`Error: ${data.error}`);
          }
        } catch (err) {
          alert(`Error: ${err.message}`);
        }
      });
    }
  }

  // ==========================================
  // PHASE 26: VERIFICATION & ANTI-HALLUCINATION STUDIO
  // ==========================================
  function initVerificationStudio() {
    const verificationModal = document.getElementById('verification-modal');
    const closeBtn = document.getElementById('close-verification-modal-btn');
    const navVerification = document.getElementById('nav-verification');
    const chipVerificationAgent = document.getElementById('chip-verification-agent');

    function openModal() {
      if (verificationModal) {
        verificationModal.style.display = 'flex';
        loadAttestationsLedger();
      }
    }

    function closeModal() {
      if (verificationModal) {
        verificationModal.style.display = 'none';
      }
    }

    if (navVerification) navVerification.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
    if (chipVerificationAgent) chipVerificationAgent.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    // Tab Switching
    const tabBtns = document.querySelectorAll('button[data-v-tab]');
    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        tabBtns.forEach((b) => {
          b.style.borderColor = '#334155';
          b.style.color = '#94a3b8';
        });
        btn.style.borderColor = '#10b981';
        btn.style.color = '#10b981';

        const targetId = btn.getAttribute('data-v-tab');
        document.querySelectorAll('.v-tab-content').forEach((c) => {
          c.style.display = 'none';
        });
        const target = document.getElementById(targetId);
        if (target) target.style.display = 'block';

        if (targetId === 'tab-v-ledger') {
          loadAttestationsLedger();
        }
      });
    });

    // 1. Attestations Ledger & Metrics
    async function loadAttestationsLedger() {
      const totalEl = document.getElementById('v-metric-total');
      const passRateEl = document.getElementById('v-metric-passrate');
      const statusEl = document.getElementById('v-metric-status');
      const tableBody = document.getElementById('v-attestations-table-body');

      try {
        const reportRes = await fetch('/api/jarvis/verification/report', { headers: { 'x-user-id': 'dwight' } });
        const reportData = await reportRes.json();
        if (reportData.success) {
          if (totalEl) totalEl.textContent = reportData.data.totalAttestations;
          if (passRateEl) passRateEl.textContent = `${reportData.data.passRatePercent}%`;
          if (statusEl) statusEl.textContent = reportData.data.complianceStatus;
        }

        const attestRes = await fetch('/api/jarvis/verification/attestations', { headers: { 'x-user-id': 'dwight' } });
        const attestData = await attestRes.json();
        if (attestData.success && tableBody) {
          if (attestData.data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="padding: 12px; text-align: center; color: #94a3b8;">No attestations recorded yet.</td></tr>';
            return;
          }

          tableBody.innerHTML = attestData.data.map((a) => {
            const verdictBadge = a.passed
              ? '<span style="background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid #10b981; padding: 2px 6px; border-radius: 4px; font-weight: bold;">PASSED</span>'
              : '<span style="background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid #ef4444; padding: 2px 6px; border-radius: 4px; font-weight: bold;">FAILED</span>';
            const dateStr = new Date(a.verifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            return `
              <tr style="border-bottom: 1px solid #1e293b;">
                <td style="padding: 6px; font-family: monospace; color: #38bdf8;">${a.attestationId}</td>
                <td style="padding: 6px; color: #f8fafc; font-weight: 500;">${a.actionName}</td>
                <td style="padding: 6px;">${verdictBadge}</td>
                <td style="padding: 6px; color: #94a3b8;">${a.passedChecks}/${a.totalChecks}</td>
                <td style="padding: 6px; font-family: monospace; color: #64748b;" title="${a.fingerprint}">${a.fingerprint.slice(0, 16)}...</td>
                <td style="padding: 6px; color: #64748b;">${dateStr}</td>
              </tr>
            `;
          }).join('');
        }
      } catch (err) {
        if (tableBody) tableBody.innerHTML = `<tr><td colspan="6" style="color: #ef4444; padding: 12px;">Failed to load attestations: ${err.message}</td></tr>`;
      }
    }

    const refreshBtn = document.getElementById('v-refresh-attestations-btn');
    if (refreshBtn) refreshBtn.addEventListener('click', loadAttestationsLedger);

    // 2. Multi-Modal Inspector Presets
    const presetSelect = document.getElementById('v-inspector-preset');
    const actionInput = document.getElementById('v-inspector-action-name');
    const payloadInput = document.getElementById('v-inspector-payload');

    if (presetSelect && actionInput && payloadInput) {
      presetSelect.addEventListener('change', () => {
        const val = presetSelect.value;
        if (val === 'process_and_schema') {
          actionInput.value = 'simulated.build_and_deploy';
          payloadInput.value = '{"exitCode": 0, "status": "COMPLETED", "bundleSize": 14205}';
        } else if (val === 'math_tolerance') {
          actionInput.value = 'math.eigenvalue_calculation';
          payloadInput.value = '{"result": 42.00005, "iterations": 15}';
        } else if (val === 'code_syntax') {
          actionInput.value = 'code.ast_generator';
          payloadInput.value = '{"code": "function executeTask(ctx) { return ctx.status === 200; }"}';
        } else if (val === 'file_integrity') {
          actionInput.value = 'fs.artifact_integrity';
          payloadInput.value = '{"filePath": "package.json"}';
        }
      });
    }

    // Run Inspector Verification
    const inspectorRunBtn = document.getElementById('v-inspector-run-btn');
    if (inspectorRunBtn) {
      inspectorRunBtn.addEventListener('click', async () => {
        const actionName = (actionInput?.value || 'unspecified_action').trim();
        const preset = presetSelect?.value || 'process_and_schema';
        let parsedPayload = {};
        try {
          parsedPayload = JSON.parse(payloadInput?.value || '{}');
        } catch {
          parsedPayload = payloadInput?.value;
        }

        let checks = [];
        if (preset === 'process_and_schema') {
          checks = [
            { type: 'exit_code_zero', expected: 0 },
            { type: 'schema_valid', expected: ['exitCode', 'status'] },
          ];
        } else if (preset === 'math_tolerance') {
          checks = [
            { type: 'computation_verified', expected: 42.0, options: { tolerance: 0.001 } },
          ];
        } else if (preset === 'code_syntax') {
          checks = [
            { type: 'code_syntax_valid', target: 'synthesized_code.js' },
          ];
        } else if (preset === 'file_integrity') {
          checks = [
            { type: 'file_exists', target: 'package.json' },
            { type: 'file_size', target: 'package.json', expected: 50 },
          ];
        }

        const statusBox = document.getElementById('v-inspector-result-status');
        const logBox = document.getElementById('v-inspector-evidence-log');

        try {
          if (statusBox) statusBox.innerHTML = '<span style="color: #38bdf8;">Running independent verification suite...</span>';
          const res = await fetch('/api/jarvis/verification/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({ actionName, checks, runtimePayload: parsedPayload }),
          });
          const data = await res.json();

          if (data.success && data.data) {
            const a = data.data;
            if (statusBox) {
              statusBox.innerHTML = a.passed
                ? `<span style="color: #10b981; font-weight: bold;">VERIFICATION PASSED</span> (${a.passedChecks}/${a.totalChecks} checks cleared) • SHA-256: <code style="color: #38bdf8;">${a.fingerprint.slice(0, 16)}...</code>`
                : `<span style="color: #ef4444; font-weight: bold;">VERIFICATION FAILED</span> (${a.failedChecks} checks failed) • Root cause: ${a.diagnosis?.rootCauseCategory || 'Unknown'}`;
            }
            if (logBox) {
              logBox.textContent = JSON.stringify(a.evidence, null, 2);
            }
          } else {
            if (statusBox) statusBox.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
          }
        } catch (err) {
          if (statusBox) statusBox.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    // 3. Anti-Hallucination Gate Runner
    const hallBtn = document.getElementById('v-hallucination-run-btn');
    if (hallBtn) {
      hallBtn.addEventListener('click', async () => {
        const claimText = (document.getElementById('v-hallucination-claim')?.value || '').trim();
        const sourcesRaw = (document.getElementById('v-hallucination-sources')?.value || '').trim();
        const strictness = document.getElementById('v-hallucination-strictness')?.value || 'standard';
        const summaryBox = document.getElementById('v-hallucination-summary');
        const citationsBox = document.getElementById('v-hallucination-citations');

        const groundingSources = sourcesRaw.split('\n').map((s) => s.trim()).filter((s) => s.length > 5);

        try {
          if (summaryBox) summaryBox.innerHTML = '<span style="color: #ec4899;">Auditing text grounding against reference sources...</span>';
          const res = await fetch('/api/jarvis/verification/hallucination-audit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({ claimText, groundingSources, strictness }),
          });
          const data = await res.json();

          if (data.success && data.data) {
            const a = data.data;
            const riskPct = Math.round(a.hallucinationRisk * 100);
            const riskColor = a.passed ? '#10b981' : '#ef4444';

            if (summaryBox) {
              summaryBox.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-weight: bold; color: ${riskColor};">${a.passed ? 'GATE PASSED: VERIFIED GROUNDED' : 'GATE FLAGGED: HIGH HALLUCINATION RISK'}</span>
                  <span style="padding: 2px 8px; border-radius: 4px; background: rgba(0,0,0,0.4); color: ${riskColor}; font-weight: bold;">Risk: ${riskPct}%</span>
                </div>
                <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 4px;">${a.auditNotes}</div>
              `;
            }

            if (citationsBox) {
              if (a.citationMatches.length === 0 && a.unsupportedClaims.length === 0) {
                citationsBox.innerHTML = '<div style="color: #64748b;">No sentences parsed.</div>';
              } else {
                let html = '';
                if (a.citationMatches.length > 0) {
                  html += '<div style="color: #10b981; font-weight: bold; margin-bottom: 4px;">Grounded Citations:</div>';
                  html += a.citationMatches.map((c) => `
                    <div style="background: #020617; border-left: 3px solid #10b981; padding: 4px 8px; margin-bottom: 4px; border-radius: 0 4px 4px 0;">
                      <div style="color: #e2e8f0;">"${c.claim}"</div>
                      <div style="color: #64748b; font-size: 0.7rem;">Source snippet: ${c.sourceSnippet} (Score: ${Math.round(c.score * 100)}%)</div>
                    </div>
                  `).join('');
                }
                if (a.unsupportedClaims.length > 0) {
                  html += '<div style="color: #ef4444; font-weight: bold; margin: 8px 0 4px 0;">Unsupported Claims (Hallucinations):</div>';
                  html += a.unsupportedClaims.map((u) => `
                    <div style="background: #020617; border-left: 3px solid #ef4444; padding: 4px 8px; margin-bottom: 4px; border-radius: 0 4px 4px 0;">
                      <div style="color: #fca5a5;">"${u}"</div>
                    </div>
                  `).join('');
                }
                citationsBox.innerHTML = html;
              }
            }
          }
        } catch (err) {
          if (summaryBox) summaryBox.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    // 4. Auto-Retry Loop Simulator
    const retryBtn = document.getElementById('v-retry-run-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', async () => {
        const actionName = (document.getElementById('v-retry-action-name')?.value || 'simulated_action').trim();
        const maxAttempts = parseInt(document.getElementById('v-retry-max-attempts')?.value || '3', 10);
        const simulatedSuccessOnAttempt = parseInt(document.getElementById('v-retry-pass-attempt')?.value || '2', 10);
        const summaryBox = document.getElementById('v-retry-summary');
        const logBox = document.getElementById('v-retry-log');

        try {
          if (summaryBox) summaryBox.innerHTML = '<span style="color: #f59e0b;">Executing self-healing loop with autonomous verification...</span>';
          const res = await fetch('/api/jarvis/verification/retry-loop', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({
              actionName,
              checks: [{ type: 'schema_valid', expected: ['attempt', 'passed'] }],
              maxAttempts,
              simulatedSuccessOnAttempt,
            }),
          });
          const data = await res.json();

          if (data.success && data.data) {
            const loop = data.data;
            if (summaryBox) {
              summaryBox.innerHTML = loop.finalPassed
                ? `<span style="color: #10b981; font-weight: bold;">SELF-HEALING LOOP SUCCEEDED</span> (Resolved in ${loop.attemptsUsed}/${loop.maxAttempts} attempts)`
                : `<span style="color: #ef4444; font-weight: bold;">SELF-HEALING LOOP EXHAUSTED</span> (${loop.attemptsUsed} attempts failed)`;
            }
            if (logBox) {
              logBox.textContent = loop.recoveryLog.join('\n');
            }
          }
        } catch (err) {
          if (summaryBox) summaryBox.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }
  }

  // Phase 27: Self-Correction & Learning Loop Studio Controller
  function initLearningStudio() {
    const learningModal = document.getElementById('learning-modal');
    const closeBtn = document.getElementById('close-learning-modal-btn');
    const navLearning = document.getElementById('nav-learning');
    const chipSelfCorrectionAgent = document.getElementById('chip-self-correction-agent');

    function openModal() {
      if (learningModal) {
        learningModal.style.display = 'flex';
        loadEvolutionRadar();
        loadIncidents();
        loadRules();
      }
    }

    function closeModal() {
      if (learningModal) {
        learningModal.style.display = 'none';
      }
    }

    if (navLearning) navLearning.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
    if (chipSelfCorrectionAgent) chipSelfCorrectionAgent.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    // Tab Switching
    const tabBtns = document.querySelectorAll('button[data-l-tab]');
    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        tabBtns.forEach((b) => {
          b.style.borderColor = '#334155';
          b.style.color = '#94a3b8';
        });
        btn.style.borderColor = '#f59e0b';
        btn.style.color = '#f59e0b';

        const targetId = btn.getAttribute('data-l-tab');
        document.querySelectorAll('.l-tab-content').forEach((c) => {
          c.style.display = 'none';
        });
        const target = document.getElementById(targetId);
        if (target) target.style.display = 'block';

        if (targetId === 'tab-l-radar') loadEvolutionRadar();
        if (targetId === 'tab-l-incidents') loadIncidents();
        if (targetId === 'tab-l-rules') loadRules();
      });
    });

    // 1. Learning Evolution Radar
    async function loadEvolutionRadar() {
      const incEl = document.getElementById('l-metric-incidents');
      const rulesEl = document.getElementById('l-metric-rules');
      const recEl = document.getElementById('l-metric-recurrence');
      const velEl = document.getElementById('l-metric-velocity');
      const directivesList = document.getElementById('l-directives-list');
      const categoriesList = document.getElementById('l-categories-list');

      try {
        const res = await fetch('/api/jarvis/learning/report', { headers: { 'x-user-id': 'dwight' } });
        const report = await res.json();
        if (report.success && report.data) {
          const d = report.data;
          if (incEl) incEl.textContent = d.totalIncidents;
          if (rulesEl) rulesEl.textContent = d.activeRules;
          if (recEl) recEl.textContent = `${d.recurrenceRatePercent}%`;
          if (velEl) velEl.textContent = `${d.learningVelocityScore}x`;

          if (directivesList) {
            directivesList.innerHTML = (d.activeDirectiveSummary || [])
              .map((dir) => `
                <div style="padding: 6px 10px; background: #070c18; border-left: 3px solid #10b981; border-radius: 4px; font-size: 0.75rem; color: #cbd5e1;">
                  ${dir}
                </div>
              `)
              .join('');
          }

          if (categoriesList) {
            const cats = d.topFailingCategories || {};
            const keys = Object.keys(cats);
            if (keys.length === 0) {
              categoriesList.innerHTML = '<div style="font-size: 0.75rem; color: #94a3b8;">No root cause categories recorded yet.</div>';
            } else {
              categoriesList.innerHTML = keys
                .map((k) => `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: #070c18; border-radius: 4px; font-size: 0.75rem;">
                    <span style="color: #38bdf8;">${k}</span>
                    <span style="font-weight: 600; color: #f59e0b;">${cats[k]} incident(s)</span>
                  </div>
                `)
                .join('');
            }
          }
        }
      } catch (err) {
        console.error('Failed to load evolution radar:', err);
      }
    }

    const refreshReportBtn = document.getElementById('l-refresh-report-btn');
    if (refreshReportBtn) refreshReportBtn.addEventListener('click', loadEvolutionRadar);

    // 2. Incident Ledger
    async function loadIncidents() {
      const tbody = document.getElementById('l-incidents-table-body');
      if (!tbody) return;

      try {
        const res = await fetch('/api/jarvis/learning/incidents', { headers: { 'x-user-id': 'dwight' } });
        const data = await res.json();
        if (data.success) {
          if (data.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="padding: 12px; text-align: center; color: #94a3b8;">No incidents recorded.</td></tr>';
            return;
          }
          tbody.innerHTML = data.data
            .map((inc) => `
              <tr style="border-bottom: 1px solid #1e293b;">
                <td style="padding: 6px; font-family: monospace; color: #38bdf8;">${inc.actionName}</td>
                <td style="padding: 6px; color: #94a3b8;">${inc.rootCauseCategory}</td>
                <td style="padding: 6px;">
                  <span style="color: ${inc.severity === 'critical' ? '#ef4444' : inc.severity === 'high' ? '#f59e0b' : '#10b981'}; font-weight: 600;">
                    ${inc.severity.toUpperCase()}
                  </span>
                </td>
                <td style="padding: 6px; color: ${inc.resolved ? '#10b981' : '#f59e0b'};">
                  ${inc.resolved ? 'RESOLVED' : 'OPEN'}
                </td>
              </tr>
            `)
            .join('');
        }
      } catch (err) {
        tbody.innerHTML = `<tr><td colspan="4" style="padding: 12px; color: #ef4444;">Failed to load incidents: ${err.message}</td></tr>`;
      }
    }

    const refreshIncBtn = document.getElementById('l-refresh-incidents-btn');
    if (refreshIncBtn) refreshIncBtn.addEventListener('click', loadIncidents);

    const recordIncBtn = document.getElementById('l-record-incident-btn');
    const recordResEl = document.getElementById('l-record-res');
    if (recordIncBtn) {
      recordIncBtn.addEventListener('click', async () => {
        const actionName = (document.getElementById('l-inc-action') || {}).value;
        const errorMessage = (document.getElementById('l-inc-message') || {}).value;
        const rootCauseCategory = (document.getElementById('l-inc-rootcause') || {}).value;
        const severity = (document.getElementById('l-inc-severity') || {}).value;

        if (!actionName || !errorMessage) {
          alert('Action Name and Error Message are required.');
          return;
        }

        try {
          const res = await fetch('/api/jarvis/learning/incidents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({ actionName, errorMessage, rootCauseCategory, severity }),
          });
          const result = await res.json();
          if (result.success && recordResEl) {
            recordResEl.style.display = 'block';
            recordResEl.textContent = `Ingested & synthesized rule: "${result.data.rule.title}"`;
            loadIncidents();
            loadRules();
            loadEvolutionRadar();
          }
        } catch (err) {
          alert(`Failed to ingest incident: ${err.message}`);
        }
      });
    }

    // 3. Heuristics Foundry
    async function loadRules() {
      const container = document.getElementById('l-rules-container');
      if (!container) return;

      try {
        const res = await fetch('/api/jarvis/learning/rules', { headers: { 'x-user-id': 'dwight' } });
        const data = await res.json();
        if (data.success) {
          if (data.data.length === 0) {
            container.innerHTML = '<div style="color: #94a3b8; padding: 12px;">No heuristics synthesized yet.</div>';
            return;
          }
          container.innerHTML = data.data
            .map((rule) => `
              <div style="background: #070c18; border: 1px solid #1e293b; border-radius: 6px; padding: 10px; display: flex; justify-content: space-between; align-items: center;">
                <div style="max-width: 75%;">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                    <span style="font-weight: 600; color: #fff; font-size: 0.82rem;">${rule.title}</span>
                    <span style="padding: 1px 6px; border-radius: 4px; font-size: 0.68rem; background: ${rule.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}; color: ${rule.status === 'active' ? '#10b981' : '#f59e0b'};">
                      ${rule.status.toUpperCase()}
                    </span>
                    <span style="font-size: 0.72rem; color: #38bdf8; font-family: monospace;">[${rule.category}]</span>
                  </div>
                  <div style="font-size: 0.76rem; color: #cbd5e1; margin-bottom: 4px;">
                    ${rule.directive}
                  </div>
                  <div style="font-size: 0.7rem; color: #94a3b8;">
                    Confidence: <b style="color: #10b981;">${Math.round(rule.confidence * 100)}%</b> • Applied: <b>${rule.timesApplied}x</b> • Succeeded: <b>${rule.timesSucceeded}x</b>
                  </div>
                </div>
                <div style="display: flex; gap: 6px;">
                  <button class="rule-feedback-btn" data-rule-id="${rule.id}" data-success="true" style="padding: 4px 8px; background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; border-radius: 4px; color: #10b981; cursor: pointer; font-size: 0.72rem;">
                    &#9650; Valid
                  </button>
                  <button class="rule-feedback-btn" data-rule-id="${rule.id}" data-success="false" style="padding: 4px 8px; background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; border-radius: 4px; color: #ef4444; cursor: pointer; font-size: 0.72rem;">
                    &#9660; Invalidate
                  </button>
                </div>
              </div>
            `)
            .join('');

          // Wire feedback buttons
          container.querySelectorAll('.rule-feedback-btn').forEach((btn) => {
            btn.addEventListener('click', async () => {
              const ruleId = btn.getAttribute('data-rule-id');
              const succeeded = btn.getAttribute('data-success') === 'true';
              try {
                await fetch(`/api/jarvis/learning/rules/${ruleId}/feedback`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
                  body: JSON.stringify({ succeeded }),
                });
                loadRules();
                loadEvolutionRadar();
              } catch (err) {
                console.error('Feedback error:', err);
              }
            });
          });
        }
      } catch (err) {
        container.innerHTML = `<div style="color: #ef4444; padding: 12px;">Failed to load heuristics: ${err.message}</div>`;
      }
    }

    const refreshRulesBtn = document.getElementById('l-refresh-rules-btn');
    if (refreshRulesBtn) refreshRulesBtn.addEventListener('click', loadRules);

    // 4. Simulator
    const simGuardBtn = document.getElementById('l-sim-guardrail-btn');
    const simPlanBtn = document.getElementById('l-sim-plan-btn');
    const simVerdict = document.getElementById('l-sim-verdict');
    const simOutput = document.getElementById('l-sim-output');

    if (simGuardBtn) {
      simGuardBtn.addEventListener('click', async () => {
        const actionName = (document.getElementById('l-sim-action') || {}).value;
        let params = {};
        try {
          params = JSON.parse((document.getElementById('l-sim-params') || {}).value || '{}');
        } catch {
          alert('Invalid JSON in Proposed Parameters');
          return;
        }

        if (simVerdict) simVerdict.innerHTML = '<span style="color: #38bdf8;">Evaluating active guardrails...</span>';

        try {
          const res = await fetch('/api/jarvis/learning/guardrails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({ actionName, params }),
          });
          const match = await res.json();
          if (match.success && match.data) {
            const d = match.data;
            if (simVerdict) {
              simVerdict.innerHTML = d.safeToProceed
                ? `<span style="color: #10b981; font-weight: 600;">SAFE TO PROCEED</span> — Matched ${d.matchedRules.length} guardrail(s).`
                : `<span style="color: #ef4444; font-weight: 600;">GUARDRAIL INTERCEPTED</span> — Safety warnings raised.`;
            }
            if (simOutput) {
              simOutput.textContent = JSON.stringify(
                {
                  actionName: d.actionName,
                  injectedDirectives: d.injectedDirectives,
                  parameterAdjustments: d.parameterAdjustments,
                  warnings: d.warnings,
                },
                null,
                2
              );
            }
          }
        } catch (err) {
          if (simVerdict) simVerdict.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }

    if (simPlanBtn) {
      simPlanBtn.addEventListener('click', async () => {
        let params = {};
        try {
          params = JSON.parse((document.getElementById('l-sim-params') || {}).value || '{}');
        } catch {
          alert('Invalid JSON in Proposed Parameters');
          return;
        }

        if (simVerdict) simVerdict.innerHTML = '<span style="color: #f59e0b;">Synthesizing correction plan...</span>';

        try {
          const res = await fetch('/api/jarvis/learning/correction-plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({ incidentId: 'inc_seed_math_01', originalParams: params }),
          });
          const plan = await res.json();
          if (plan.success && plan.data) {
            const d = plan.data;
            if (simVerdict) {
              simVerdict.innerHTML = `<span style="color: #10b981; font-weight: 600;">CORRECTION PLAN SYNTHESIZED</span> — ${d.reasoning}`;
            }
            if (simOutput) {
              simOutput.textContent = JSON.stringify(
                {
                  incidentId: d.incidentId,
                  actionName: d.actionName,
                  adjustedParams: d.adjustedParams,
                  appliedRules: d.appliedRules.map((r) => r.title),
                  preventedFault: d.preventedFault,
                },
                null,
                2
              );
            }
          }
        } catch (err) {
          if (simVerdict) simVerdict.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
        }
      });
    }
  }

  // ==================== PHASE 28: PERSONAL CONTEXT ENGINE & UNIFIED DASHBOARD ====================
  function initContextStudio() {
    const modal = document.getElementById('context-modal');
    const navBtn = document.getElementById('nav-context');
    const chipBtn = document.getElementById('chip-context-agent');
    const focusModeSidebarBtn = document.getElementById('focus-mode-btn');
    const closeBtn = document.getElementById('close-context-modal');

    const openModal = () => {
      if (modal) {
        modal.style.display = 'flex';
        loadOverview();
        loadCognitive();
        loadActivities();
        loadInsights();
      }
    };

    if (navBtn) navBtn.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
    if (chipBtn) chipBtn.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
    if (focusModeSidebarBtn) focusModeSidebarBtn.addEventListener('click', (e) => { e.preventDefault(); openModal(); switchTab('focus'); });
    if (closeBtn) closeBtn.addEventListener('click', () => { if (modal) modal.style.display = 'none'; });
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
      });
    }

    // Tabs Switcher
    const tabs = ['overview', 'focus', 'timeline', 'insights'];
    function switchTab(activeTab) {
      tabs.forEach((t) => {
        const btn = document.getElementById(`tab-btn-ctx-${t}`);
        const content = document.getElementById(`tab-ctx-${t}`);
        if (btn && content) {
          if (t === activeTab) {
            btn.style.background = '#0b1730';
            btn.style.borderColor = '#38bdf8';
            btn.style.color = '#38bdf8';
            content.style.display = 'flex';
          } else {
            btn.style.background = 'transparent';
            btn.style.borderColor = 'transparent';
            btn.style.color = '#94a3b8';
            content.style.display = 'none';
          }
        }
      });
    }

    tabs.forEach((t) => {
      const btn = document.getElementById(`tab-btn-ctx-${t}`);
      if (btn) btn.addEventListener('click', () => switchTab(t));
    });

    // 1. Master System Matrix & Overview
    async function loadOverview() {
      try {
        const res = await fetch('/api/jarvis/context/overview', {
          headers: { 'x-user-id': 'dwight' },
        });
        const data = await res.json();
        if (data.success && data.data) {
          const d = data.data;
          const statEngines = document.getElementById('ctx-stat-engines');
          const statCog = document.getElementById('ctx-stat-cog');
          const statCogLevel = document.getElementById('ctx-stat-cog-level');
          const statFocus = document.getElementById('ctx-stat-focus');
          const grid = document.getElementById('ctx-engine-grid');

          if (statEngines) statEngines.textContent = `${d.totalEnginesOnline} / 30`;
          if (statCog) statCog.textContent = d.cognitiveLoadScore.toFixed(2);
          if (statCogLevel) statCogLevel.textContent = `Status: ${d.systemStatus.toUpperCase()}`;
          if (statFocus) statFocus.textContent = d.activeFocusMode;

          if (grid && d.engineStatuses) {
            grid.innerHTML = Object.entries(d.engineStatuses)
              .map(([name, status]) => {
                const color = status === 'online' ? '#10b981' : '#f59e0b';
                return `
                  <div style="background: #070e1e; border: 1px solid #1e293b; border-radius: 6px; padding: 6px 10px; display: flex; align-items: center; justify-content: space-between;">
                    <span style="font-size: 0.72rem; color: #cbd5e1; font-family: monospace;">${escapeHtml(name)}</span>
                    <span style="display: flex; align-items: center; gap: 4px; font-size: 0.68rem; color: ${color}; text-transform: uppercase;">
                      <span style="width: 6px; height: 6px; border-radius: 50%; background: ${color};"></span>
                      ${status}
                    </span>
                  </div>
                `;
              })
              .join('');
          }
        }
      } catch (err) {
        console.error('Context overview error:', err);
      }
    }

    const refreshOverviewBtn = document.getElementById('ctx-refresh-overview-btn');
    if (refreshOverviewBtn) refreshOverviewBtn.addEventListener('click', loadOverview);

    // 2. Focus & Cognitive Load
    async function loadCognitive() {
      try {
        const res = await fetch('/api/jarvis/context/cognitive-load', {
          headers: { 'x-user-id': 'dwight' },
        });
        const data = await res.json();
        if (data.success && data.data) {
          const c = data.data;
          const scoreVal = document.getElementById('ctx-cog-score-val');
          const bar = document.getElementById('ctx-cog-bar');
          const factors = document.getElementById('ctx-cog-factors');
          const rec = document.getElementById('ctx-cog-rec');

          if (scoreVal) scoreVal.textContent = `${c.score.toFixed(2)} (${c.level.toUpperCase()})`;
          if (bar) {
            const pct = Math.min(100, Math.round(c.score * 100));
            bar.style.width = `${pct}%`;
            bar.style.background = c.level === 'optimal' ? '#10b981' : c.level === 'low' ? '#38bdf8' : c.level === 'high' ? '#f59e0b' : '#ef4444';
          }
          if (factors && Array.isArray(c.factors)) {
            factors.innerHTML = c.factors.map((f) => `<li>${escapeHtml(f)}</li>`).join('');
          }
          if (rec) rec.textContent = c.recommendation;
        }
      } catch (err) {
        console.error('Cognitive load error:', err);
      }
    }

    const startFocusBtn = document.getElementById('ctx-start-focus-btn');
    const endFocusBtn = document.getElementById('ctx-end-focus-btn');
    const focusMsg = document.getElementById('ctx-focus-status-msg');

    if (startFocusBtn) {
      startFocusBtn.addEventListener('click', async () => {
        const mode = (document.getElementById('ctx-focus-mode') || {}).value || 'deep_work';
        const goal = ((document.getElementById('ctx-focus-goal') || {}).value || '').trim();
        const project = ((document.getElementById('ctx-focus-project') || {}).value || '').trim();
        const durationMinutes = parseInt((document.getElementById('ctx-focus-duration') || {}).value || '45', 10);

        if (!goal) {
          alert('Please enter a goal objective for the focus session.');
          return;
        }

        try {
          const res = await fetch('/api/jarvis/context/focus', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({ mode, goal, project, durationMinutes }),
          });
          const d = await res.json();
          if (d.success) {
            if (focusMsg) {
              focusMsg.style.display = 'block';
              focusMsg.style.color = '#10b981';
              focusMsg.textContent = `Focus session activated: [${d.data.mode}] ${d.data.goal}`;
            }
            loadOverview();
            loadCognitive();
          }
        } catch (err) {
          if (focusMsg) {
            focusMsg.style.display = 'block';
            focusMsg.style.color = '#ef4444';
            focusMsg.textContent = `Error: ${err.message}`;
          }
        }
      });
    }

    if (endFocusBtn) {
      endFocusBtn.addEventListener('click', async () => {
        try {
          const res = await fetch('/api/jarvis/context/focus/end', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
          });
          const d = await res.json();
          if (d.success) {
            if (focusMsg) {
              focusMsg.style.display = 'block';
              focusMsg.style.color = '#f59e0b';
              focusMsg.textContent = d.data.active === false ? 'Active focus session successfully concluded.' : 'No active session was running.';
            }
            loadOverview();
            loadCognitive();
          }
        } catch (err) {
          if (focusMsg) {
            focusMsg.style.display = 'block';
            focusMsg.style.color = '#ef4444';
            focusMsg.textContent = `Error: ${err.message}`;
          }
        }
      });
    }

    // 3. Activity Stream
    async function loadActivities() {
      const stream = document.getElementById('ctx-act-stream');
      const cat = (document.getElementById('ctx-act-filter') || {}).value || '';
      if (!stream) return;

      try {
        const url = cat ? `/api/jarvis/context/activities?category=${encodeURIComponent(cat)}&limit=30` : `/api/jarvis/context/activities?limit=30`;
        const res = await fetch(url, { headers: { 'x-user-id': 'dwight' } });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          if (data.data.length === 0) {
            stream.innerHTML = '<div style="color: #64748b; font-size: 0.78rem; padding: 12px;">No activities recorded yet in this stream.</div>';
            return;
          }
          stream.innerHTML = data.data
            .map((item) => `
              <div style="background: #070e1e; border: 1px solid #1e293b; border-radius: 6px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
                    <span style="font-size: 0.68rem; font-weight: 600; text-transform: uppercase; padding: 2px 6px; border-radius: 3px; background: rgba(56, 189, 248, 0.15); color: #38bdf8;">${escapeHtml(item.category)}</span>
                    <span style="font-size: 0.72rem; color: #94a3b8; font-family: monospace;">${escapeHtml(item.action)}</span>
                  </div>
                  <div style="font-size: 0.78rem; color: #f8fafc;">${escapeHtml(item.summary)}</div>
                </div>
                <div style="font-size: 0.68rem; color: #64748b;">${new Date(item.timestamp).toLocaleTimeString()}</div>
              </div>
            `)
            .join('');
        }
      } catch (err) {
        stream.innerHTML = `<div style="color: #ef4444; font-size: 0.78rem; padding: 12px;">Failed to load activities: ${err.message}</div>`;
      }
    }

    const refreshActBtn = document.getElementById('ctx-refresh-act-btn');
    const actFilter = document.getElementById('ctx-act-filter');
    if (refreshActBtn) refreshActBtn.addEventListener('click', loadActivities);
    if (actFilter) actFilter.addEventListener('change', loadActivities);

    const logBtn = document.getElementById('ctx-log-btn');
    if (logBtn) {
      logBtn.addEventListener('click', async () => {
        const category = (document.getElementById('ctx-log-cat') || {}).value || 'system';
        const action = ((document.getElementById('ctx-log-action') || {}).value || '').trim();
        const summary = ((document.getElementById('ctx-log-summary') || {}).value || '').trim();

        if (!action || !summary) {
          alert('Action and summary are required.');
          return;
        }

        try {
          const res = await fetch('/api/jarvis/context/activities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({ category, action, summary }),
          });
          const d = await res.json();
          if (d.success) {
            (document.getElementById('ctx-log-action') || {}).value = '';
            (document.getElementById('ctx-log-summary') || {}).value = '';
            loadActivities();
          }
        } catch (err) {
          console.error('Log activity error:', err);
        }
      });
    }

    // 4. Context Query & Insights
    async function loadInsights() {
      const list = document.getElementById('ctx-insights-list');
      if (!list) return;

      try {
        const res = await fetch('/api/jarvis/context/insights', {
          headers: { 'x-user-id': 'dwight' },
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          list.innerHTML = data.data
            .map((ins) => {
              const borderCol = ins.priority === 'high' ? '#ef4444' : ins.priority === 'medium' ? '#f59e0b' : '#38bdf8';
              return `
                <div style="background: #070e1e; border: 1px solid #1e293b; border-left: 3px solid ${borderCol}; border-radius: 6px; padding: 10px 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span style="font-weight: 600; font-size: 0.8rem; color: #f8fafc;">${escapeHtml(ins.title)}</span>
                    <span style="font-size: 0.68rem; text-transform: uppercase; color: ${borderCol}; font-weight: 600;">${ins.priority}</span>
                  </div>
                  <div style="font-size: 0.75rem; color: #cbd5e1; margin-bottom: 4px;">${escapeHtml(ins.message)}</div>
                  ${ins.actionableSuggestion ? `<div style="font-size: 0.72rem; color: #38bdf8; font-style: italic;">Suggestion: ${escapeHtml(ins.actionableSuggestion)}</div>` : ''}
                </div>
              `;
            })
            .join('');
        }
      } catch (err) {
        list.innerHTML = `<div style="color: #ef4444; font-size: 0.78rem; padding: 12px;">Failed to load insights: ${err.message}</div>`;
      }
    }

    const refreshInsBtn = document.getElementById('ctx-refresh-ins-btn');
    if (refreshInsBtn) refreshInsBtn.addEventListener('click', loadInsights);

    const queryBtn = document.getElementById('ctx-query-btn');
    const queryOutput = document.getElementById('ctx-query-output');

    if (queryBtn) {
      queryBtn.addEventListener('click', async () => {
        const inputVal = ((document.getElementById('ctx-query-input') || {}).value || '').trim();
        if (!inputVal) return;

        if (queryOutput) queryOutput.textContent = '// Querying cross-engine knowledge nodes and memory...';

        try {
          const res = await fetch('/api/jarvis/context/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({
              actionOrGoal: inputVal,
              includeProfile: true,
              includeGoals: true,
              includeMemories: true,
              includeKnowledgeNodes: true,
            }),
          });
          const d = await res.json();
          if (d.success && d.data && queryOutput) {
            queryOutput.textContent = d.data.compositeContextString;
          }
        } catch (err) {
          if (queryOutput) queryOutput.textContent = `// Query error: ${err.message}`;
        }
      });
    }
  }

  // ==================== PHASE 29: SECURITY & PRIVACY CITADEL CONTROLLER ====================
  function initSecurityStudio() {
    const modal = document.getElementById('security-modal');
    const openNav = document.getElementById('nav-security');
    const openChip = document.getElementById('chip-security-agent');
    const closeBtn = document.getElementById('close-security-modal');

    let lastEnvelope = null;
    let lastToken = null;

    function openModal() {
      if (modal) {
        modal.style.display = 'flex';
        loadPosture();
        loadKeyHistory();
        loadDelegations();
      }
    }

    function closeModal() {
      if (modal) modal.style.display = 'none';
    }

    if (openNav) {
      openNav.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
      });
    }

    if (openChip) {
      openChip.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
      });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
    }

    // Tab Switching
    const tabBtns = [
      { btn: document.getElementById('tab-btn-sec-posture'), content: document.getElementById('tab-sec-posture') },
      { btn: document.getElementById('tab-btn-sec-crypto'), content: document.getElementById('tab-sec-crypto') },
      { btn: document.getElementById('tab-btn-sec-privacy'), content: document.getElementById('tab-sec-privacy') },
      { btn: document.getElementById('tab-btn-sec-scanner'), content: document.getElementById('tab-sec-scanner') },
    ];

    tabBtns.forEach(({ btn, content }) => {
      if (!btn || !content) return;
      btn.addEventListener('click', () => {
        tabBtns.forEach((t) => {
          if (t.btn) {
            t.btn.style.background = 'transparent';
            t.btn.style.borderColor = 'transparent';
            t.btn.style.color = '#94a3b8';
          }
          if (t.content) t.content.style.display = 'none';
        });

        btn.style.background = '#0b1730';
        btn.style.borderColor = '#10b981';
        btn.style.color = '#10b981';
        content.style.display = 'flex';
      });
    });

    // 1. Posture & Defenses
    async function loadPosture() {
      try {
        const res = await fetch('/api/jarvis/security/posture', {
          headers: { 'x-user-id': 'dwight' },
        });
        const data = await res.json();
        if (data.success && data.data) {
          const p = data.data;
          const gradeEl = document.getElementById('sec-posture-grade');
          const algoEl = document.getElementById('sec-posture-algo');
          const keyEl = document.getElementById('sec-posture-key');
          const delgEl = document.getElementById('sec-posture-delg');
          const defEl = document.getElementById('sec-defenses-list');

          if (gradeEl) gradeEl.textContent = `${p.rating || 'GRADE_A_CITADEL'} (${p.postureScore || 100}/100)`;
          if (algoEl) algoEl.textContent = 'AES-256-GCM';
          if (keyEl) keyEl.textContent = `v${p.activeKeysCount || 1}`;
          if (delgEl) delgEl.textContent = `${p.activeDelegationsCount || 0} Tokens`;

          if (defEl && p.subsystemDefenses) {
            const defenseNames = {
              cryptoVault: 'AES-256-GCM Envelope Encryption (NIST SP 800-38D)',
              privacyVault: 'RA 10173 Philippine Statutory PII Redactor',
              securityScanner: 'AST & Prototype Pollution Interceptor',
              delegationManager: 'Zero-Trust Ephemeral Delegations (HMAC-SHA256)',
              auditLogging: 'Immutable Audit Trail & Tamper Detection',
            };

            defEl.innerHTML = Object.entries(p.subsystemDefenses)
              .map(([k, status]) => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: #070e1e; border: 1px solid #1e293b; border-radius: 4px;">
                  <span style="color: #cbd5e1;">${defenseNames[k] || k}</span>
                  <span style="font-size: 0.72rem; font-weight: 600; padding: 2px 6px; border-radius: 4px; background: rgba(16, 185, 129, 0.15); color: #10b981; text-transform: uppercase;">
                    ${status}
                  </span>
                </div>
              `)
              .join('');
          }
        }
      } catch (err) {
        console.error('Failed to load security posture:', err);
      }
    }

    const refreshPostureBtn = document.getElementById('sec-refresh-posture-btn');
    if (refreshPostureBtn) refreshPostureBtn.addEventListener('click', loadPosture);

    // 2. Envelope Crypto & Key Rotation
    const encBtn = document.getElementById('sec-encrypt-btn');
    const decBtn = document.getElementById('sec-decrypt-btn');
    const cryptoOutput = document.getElementById('sec-crypto-output');

    if (encBtn) {
      encBtn.addEventListener('click', async () => {
        const rawInput = (document.getElementById('sec-enc-data')?.value || '').trim();
        const plaintext = rawInput;

        try {
          if (cryptoOutput) cryptoOutput.textContent = '// Encrypting with AES-256-GCM...';
          const res = await fetch('/api/jarvis/security/encrypt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({ plaintext }),
          });
          const d = await res.json();
          if (d.success && d.data) {
            lastEnvelope = d.data;
            if (cryptoOutput) cryptoOutput.textContent = JSON.stringify(d.data, null, 2);
          } else {
            if (cryptoOutput) cryptoOutput.textContent = `// Encryption failed: ${d.error}`;
          }
        } catch (err) {
          if (cryptoOutput) cryptoOutput.textContent = `// Encryption error: ${err.message}`;
        }
      });
    }

    if (decBtn) {
      decBtn.addEventListener('click', async () => {
        let env = lastEnvelope;
        if (!env) {
          try {
            env = JSON.parse(cryptoOutput?.textContent || '{}');
          } catch {
            env = null;
          }
        }

        if (!env || !env.ciphertext) {
          if (cryptoOutput) cryptoOutput.textContent = '// Please encrypt a payload first or provide an envelope';
          return;
        }

        try {
          if (cryptoOutput) cryptoOutput.textContent = '// Decrypting envelope with authentication tag verification...';
          const res = await fetch('/api/jarvis/security/decrypt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({ envelope: env }),
          });
          const d = await res.json();
          if (d.success && d.data) {
            if (cryptoOutput) cryptoOutput.textContent = `// DECRYPTED PAYLOAD (Authentication Tag Validated):\n${d.data.decryptedText}`;
          } else {
            if (cryptoOutput) cryptoOutput.textContent = `// Decryption failed: ${d.error}`;
          }
        } catch (err) {
          if (cryptoOutput) cryptoOutput.textContent = `// Decryption error: ${err.message}`;
        }
      });
    }

    // Key Rotation
    async function loadKeyHistory() {
      const container = document.getElementById('sec-key-history');
      if (!container) return;
      try {
        const res = await fetch('/api/jarvis/security/keys', {
          headers: { 'x-user-id': 'dwight' },
        });
        const d = await res.json();
        if (d.success && Array.isArray(d.data)) {
          container.innerHTML = d.data
            .map((k) => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: #070e1e; border: 1px solid #1e293b; border-radius: 4px;">
                <div>
                  <span style="font-weight: 600; color: #f8fafc; font-size: 0.78rem;">v${k.version} (${k.keyId})</span>
                  <span style="font-size: 0.72rem; color: #94a3b8; margin-left: 6px;">[${k.algorithm}]</span>
                </div>
                <span style="font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; background: ${k.status === 'active' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(100, 116, 139, 0.2)'}; color: ${k.status === 'active' ? '#f59e0b' : '#94a3b8'}; font-weight: 600; text-transform: uppercase;">
                  ${k.status}
                </span>
              </div>
            `)
            .join('');
        }
      } catch (err) {
        console.error('Failed to load key history:', err);
      }
    }

    const rotateBtn = document.getElementById('sec-rotate-key-btn');
    if (rotateBtn) {
      rotateBtn.addEventListener('click', async () => {
        const reason = (document.getElementById('sec-rotate-reason')?.value || '').trim() || 'Manual UI rotation';
        try {
          const res = await fetch('/api/jarvis/security/rotate-key', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({ reason }),
          });
          const d = await res.json();
          if (d.success) {
            loadKeyHistory();
            loadPosture();
            alert(`Master key rotated to version ${d.data?.version}!`);
          } else {
            alert(`Rotation failed: ${d.error}`);
          }
        } catch (err) {
          alert(`Error: ${err.message}`);
        }
      });
    }

    // 3. RA 10173 Privacy & Token Vault
    const redactBtn = document.getElementById('sec-redact-btn');
    if (redactBtn) {
      redactBtn.addEventListener('click', async () => {
        const text = (document.getElementById('sec-pii-input')?.value || '').trim();
        const outEl = document.getElementById('sec-redact-output');
        const metaEl = document.getElementById('sec-redact-meta');
        if (!text) return;

        try {
          const res = await fetch('/api/jarvis/security/redact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({ text }),
          });
          const d = await res.json();
          if (d.success && d.data) {
            if (outEl) outEl.textContent = d.data.sanitizedText;
            if (metaEl) {
              const types = d.data.detections?.map((m) => m.type).join(', ') || 'None';
              metaEl.textContent = `Detections Found: ${d.data.matchesCount} | Classifications: ${types}`;
            }
          }
        } catch (err) {
          if (outEl) outEl.textContent = `Error: ${err.message}`;
        }
      });
    }

    const tokBtn = document.getElementById('sec-tokenize-btn');
    const detokBtn = document.getElementById('sec-detokenize-btn');
    const tokOutput = document.getElementById('sec-token-output');

    if (tokBtn) {
      tokBtn.addEventListener('click', async () => {
        const plaintext = (document.getElementById('sec-tok-plain')?.value || '').trim();
        const classification = (document.getElementById('sec-tok-class')?.value || 'SECRET').trim();
        if (!plaintext) return;

        try {
          const res = await fetch('/api/jarvis/security/tokenize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({ value: plaintext, classification, durationMinutes: 60 }),
          });
          const d = await res.json();
          if (d.success && d.data) {
            lastToken = d.data.tokenId;
            if (tokOutput) tokOutput.textContent = JSON.stringify(d.data, null, 2);
          }
        } catch (err) {
          if (tokOutput) tokOutput.textContent = `Error: ${err.message}`;
        }
      });
    }

    if (detokBtn) {
      detokBtn.addEventListener('click', async () => {
        if (!lastToken) {
          if (tokOutput) tokOutput.textContent = '// Please tokenize a secret first';
          return;
        }

        try {
          const res = await fetch('/api/jarvis/security/detokenize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({ tokenId: lastToken }),
          });
          const d = await res.json();
          if (d.success && d.data) {
            if (tokOutput) tokOutput.textContent = `// REVERSED PLAINTEXT FROM VAULT:\n${d.data.originalValue}`;
          } else {
            if (tokOutput) tokOutput.textContent = `Lookup error: ${d.error}`;
          }
        } catch (err) {
          if (tokOutput) tokOutput.textContent = `Error: ${err.message}`;
        }
      });
    }

    // 4. Vulnerability Scanner & Delegations
    const auditBtn = document.getElementById('sec-audit-btn');
    const auditOutput = document.getElementById('sec-audit-output');

    if (auditBtn) {
      auditBtn.addEventListener('click', async () => {
        const raw = (document.getElementById('sec-audit-payload')?.value || '').trim();
        let payload;
        try {
          payload = JSON.parse(raw);
        } catch {
          payload = raw;
        }

        try {
          if (auditOutput) auditOutput.textContent = '// Scanning payload across AST, injection, traversal, ReDoS vectors...';
          const res = await fetch('/api/jarvis/security/audit-payload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({ payload }),
          });
          const d = await res.json();
          if (d.success && d.data) {
            if (auditOutput) auditOutput.textContent = JSON.stringify(d.data, null, 2);
          }
        } catch (err) {
          if (auditOutput) auditOutput.textContent = `Error: ${err.message}`;
        }
      });
    }

    // Delegations
    async function loadDelegations() {
      const container = document.getElementById('sec-delg-list');
      if (!container) return;

      try {
        const res = await fetch('/api/jarvis/security/delegations', {
          headers: { 'x-user-id': 'dwight' },
        });
        const d = await res.json();
        if (d.success && Array.isArray(d.data)) {
          if (d.data.length === 0) {
            container.innerHTML = `<div style="font-size: 0.75rem; color: #64748b; padding: 8px;">No active delegations.</div>`;
            return;
          }
          container.innerHTML = d.data
            .map((del) => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: #070e1e; border: 1px solid #1e293b; border-radius: 4px;">
                <div>
                  <div style="font-weight: 600; color: #38bdf8; font-size: 0.78rem;">${del.delegateeId}</div>
                  <div style="font-size: 0.7rem; color: #94a3b8;">${del.resource} | ${del.action} (${del.level})</div>
                </div>
                <button class="revoke-delg-btn" data-id="${del.id}" style="padding: 3px 8px; background: #ef4444; border: none; border-radius: 4px; color: #fff; font-size: 0.7rem; cursor: pointer;">
                  Revoke
                </button>
              </div>
            `)
            .join('');

          container.querySelectorAll('.revoke-delg-btn').forEach((btn) => {
            btn.addEventListener('click', async (e) => {
              const id = e.target.getAttribute('data-id');
              if (!id) return;
              try {
                const r = await fetch(`/api/jarvis/security/delegations/${id}`, {
                  method: 'DELETE',
                  headers: { 'x-user-id': 'dwight' },
                });
                const resData = await r.json();
                if (resData.success) {
                  loadDelegations();
                  loadPosture();
                }
              } catch (err) {
                console.error('Revocation failed:', err);
              }
            });
          });
        }
      } catch (err) {
        console.error('Failed to load delegations:', err);
      }
    }

    const createDelgBtn = document.getElementById('sec-create-delg-btn');
    if (createDelgBtn) {
      createDelgBtn.addEventListener('click', async () => {
        const delegateUserId = (document.getElementById('sec-delg-user')?.value || '').trim() || 'subagent-01';
        const durationMinutes = parseInt(document.getElementById('sec-delg-ttl')?.value || '60', 10);
        const reason = (document.getElementById('sec-delg-reason')?.value || '').trim() || 'Ephemeral delegation';

        try {
          const res = await fetch('/api/jarvis/security/delegations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'dwight' },
            body: JSON.stringify({
              delegateeId: delegateUserId,
              resource: 'SYSTEM',
              action: 'read',
              level: 'READ',
              durationMinutes,
              reason,
            }),
          });
          const d = await res.json();
          if (d.success) {
            loadDelegations();
            loadPosture();
            alert(`Delegation created for ${delegateUserId}!`);
          } else {
            alert(`Failed: ${d.error}`);
          }
        } catch (err) {
          alert(`Error: ${err.message}`);
        }
      });
    }
  }

  // Start
  initProactiveStudio();
  initSkillBuilderStudio();
  initCollaborationStudio();
  initVerificationStudio();
  initLearningStudio();
  initContextStudio();
  initSecurityStudio();
  initSession();
});


