// Prompt Studio Client Logic
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const targetModelOptions = document.querySelectorAll('.model-option');
  const nvidiaModelSelect = document.getElementById('nvidiaModelSelect');
  const nvidiaModelDesc = document.getElementById('nvidiaModelDesc');
  
  const userPromptInput = document.getElementById('userPromptInput');
  const charCounter = document.getElementById('charCounter');
  const btnGenerate = document.getElementById('btnGenerate');
  
  const resultCard = document.getElementById('resultCard');
  const resultTitle = document.getElementById('resultTitle');
  const resultStatus = document.getElementById('resultStatus');
  const resultActions = document.getElementById('resultActions');
  const emptyState = document.getElementById('emptyState');
  const loadingState = document.getElementById('loadingState');
  const resultContent = document.getElementById('resultContent');
  const errorContainer = document.getElementById('errorContainer');
  const errorTitle = document.getElementById('errorTitle');
  const errorDesc = document.getElementById('errorDesc');
  
  const btnCopyPrompt = document.getElementById('btnCopyPrompt');
  const btnCopyAll = document.getElementById('btnCopyAll');
  const toast = document.getElementById('toast');

  let currentRawResponse = '';
  let currentExtractedPrompt = '';
  let availableNvidiaModels = [];

  // 1. Load Models from Server
  async function loadModels() {
    try {
      const res = await fetch('/api/models');
      if (res.ok) {
        const data = await res.json();
        availableNvidiaModels = data.nvidiaModels || [];
        
        nvidiaModelSelect.innerHTML = '';
        availableNvidiaModels.forEach((m, idx) => {
          const opt = document.createElement('option');
          opt.value = m.id;
          opt.textContent = `${m.name} [${m.badge}]`;
          if (idx === 0) opt.selected = true;
          nvidiaModelSelect.appendChild(opt);
        });

        updateNvidiaModelDesc();
      }
    } catch (e) {
      console.warn('Could not load models from server:', e);
    }
  }

  function updateNvidiaModelDesc() {
    const selectedId = nvidiaModelSelect.value;
    const model = availableNvidiaModels.find(m => m.id === selectedId);
    if (model) {
      nvidiaModelDesc.textContent = `💡 ${model.desc}`;
    }
  }

  nvidiaModelSelect.addEventListener('change', updateNvidiaModelDesc);

  // 2. Target Model Selection
  targetModelOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      targetModelOptions.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      const radio = opt.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });

  function getSelectedTargetModel() {
    const checked = document.querySelector('input[name="targetModel"]:checked');
    return checked ? checked.value : 'seedream-5.0';
  }

  // 3. Character Counter & Keyboard Shortcut
  userPromptInput.addEventListener('input', () => {
    charCounter.textContent = `${userPromptInput.value.length} символов`;
  });

  userPromptInput.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      triggerGeneration();
    }
  });

  btnGenerate.addEventListener('click', triggerGeneration);

  // 4. Main Generation Call
  async function triggerGeneration() {
    const userPrompt = userPromptInput.value.trim();
    if (!userPrompt) {
      showToast('Пожалуйста, введите задумку для промта');
      userPromptInput.focus();
      return;
    }

    const targetModel = getSelectedTargetModel();
    const nvidiaModel = nvidiaModelSelect.value;

    setLoadingState(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetModel,
          nvidiaModel,
          userPrompt
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      currentRawResponse = data.result || '';
      renderResult(data);

    } catch (err) {
      showError('Ошибка генерации', err.message);
    } finally {
      setLoadingState(false);
    }
  }

  // 5. Result Rendering & Parser
  function renderResult(data) {
    emptyState.style.display = 'none';
    errorContainer.style.display = 'none';
    loadingState.style.display = 'none';
    resultContent.style.display = 'block';
    resultActions.style.display = 'flex';

    resultTitle.textContent = data.isDemo ? 'Готовый промт (Демо-превью)' : `Готовый промт • ${data.modelUsed}`;
    resultStatus.className = 'status-indicator ready';

    const text = data.result || '';

    // Extract code block for the final prompt
    const codeMatch = text.match(/```(?:text)?\s*([\s\S]*?)```/);
    if (codeMatch) {
      currentExtractedPrompt = codeMatch[1].trim();
    } else {
      currentExtractedPrompt = text;
    }

    resultContent.innerHTML = formatMarkdownToHTML(text);
  }

  function formatMarkdownToHTML(md) {
    // Replace code blocks with styled code box
    let html = md.replace(/```(?:text|markdown)?\s*([\s\S]*?)```/g, (match, code) => {
      const escapedCode = escapeHtml(code.trim());
      return `
        <div class="prompt-code-box">
          <span class="prompt-code-badge">PROMPT READY</span>
          <pre id="extractedPromptPre">${escapedCode}</pre>
        </div>
      `;
    });

    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.08);padding:2px 6px;border-radius:4px;font-family:var(--font-mono);font-size:0.85em;color:#38bdf8;">$1</code>');
    html = html.replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    const paragraphs = html.split(/\n\n+/);
    html = paragraphs.map(p => {
      p = p.trim();
      if (!p) return '';
      if (p.startsWith('<h3>') || p.startsWith('<ul>') || p.startsWith('<div class="prompt-code-box">')) {
        return p;
      }
      return `<p>${p.replace(/\n/g, '<br>')}</p>`;
    }).join('\n');

    return html;
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setLoadingState(isLoading) {
    if (isLoading) {
      btnGenerate.classList.add('loading');
      btnGenerate.disabled = true;
      emptyState.style.display = 'none';
      resultContent.style.display = 'none';
      errorContainer.style.display = 'none';
      resultActions.style.display = 'none';
      loadingState.style.display = 'flex';
      resultStatus.className = 'status-indicator working';
      resultTitle.textContent = 'Генерация...';
    } else {
      btnGenerate.classList.remove('loading');
      btnGenerate.disabled = false;
      loadingState.style.display = 'none';
    }
  }

  function showError(title, desc) {
    emptyState.style.display = 'none';
    loadingState.style.display = 'none';
    resultContent.style.display = 'none';
    resultActions.style.display = 'none';
    errorContainer.style.display = 'flex';
    errorTitle.textContent = title;
    errorDesc.textContent = desc;
    resultStatus.className = 'status-indicator';
    resultTitle.textContent = 'Ошибка';
  }

  btnCopyPrompt.addEventListener('click', () => {
    if (!currentExtractedPrompt) return;
    navigator.clipboard.writeText(currentExtractedPrompt).then(() => {
      showToast('Промт скопирован в буфер!');
      const prevText = btnCopyPrompt.querySelector('span').textContent;
      btnCopyPrompt.querySelector('span').textContent = '✓ Скопировано';
      setTimeout(() => {
        btnCopyPrompt.querySelector('span').textContent = prevText;
      }, 2000);
    });
  });

  btnCopyAll.addEventListener('click', () => {
    if (!currentRawResponse) return;
    navigator.clipboard.writeText(currentRawResponse).then(() => {
      showToast('Весь ответ скопирован!');
    });
  });

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  loadModels();
});
