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

  // Start
  initSession();
});
