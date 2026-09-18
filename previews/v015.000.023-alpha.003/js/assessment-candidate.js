(() => {
  'use strict';

  const match = window.location.pathname.match(/^\/careers\/assessments\/start\/([A-Za-z0-9_-]{32,128})\/?$/);
  const token = match ? match[1] : '';
  const apiBase = `../careers/assessments/api/instances/${encodeURIComponent(token)}`;
  const elements = {
    loading: document.querySelector('#loading'),
    fatal: document.querySelector('#fatal'),
    assessment: document.querySelector('#assessment'),
    assessmentId: document.querySelector('#assessment-id'),
    status: document.querySelector('#status-pill'),
    role: document.querySelector('#role'),
    candidate: document.querySelector('#candidate'),
    duration: document.querySelector('#duration'),
    message: document.querySelector('#message'),
    prestart: document.querySelector('#prestart'),
    started: document.querySelector('#started'),
    timerLabel: document.querySelector('#timer-label'),
    timerValue: document.querySelector('#timer-value'),
    progress: document.querySelector('#progress'),
    startedAt: document.querySelector('#started-at'),
    deadline: document.querySelector('#deadline'),
    download: document.querySelector('#download'),
    upload: document.querySelector('#upload'),
    uploadLabel: document.querySelector('#upload-label'),
    noSubmissions: document.querySelector('#no-submissions'),
    submissions: document.querySelector('#submissions'),
    signIn: document.querySelector('#sign-in'),
  };

  let instance = null;
  let submissions = [];
  let serverOffset = 0;
  let clockHandle = null;

  const formatTime = (value) => new Intl.DateTimeFormat(undefined, {
    hour: 'numeric', minute: '2-digit',
  }).format(value);

  const formatDate = (value) => new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium', timeStyle: 'medium',
  }).format(value);

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    return minutes ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
  };

  async function jsonRequest(url, options = {}) {
    const response = await fetch(url, { cache: 'no-store', ...options });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || 'The request could not be completed.');
    return payload;
  }

  function showMessage(text) {
    elements.message.textContent = text;
    elements.message.hidden = !text;
  }

  function renderSubmissions() {
    elements.submissions.replaceChildren();
    elements.noSubmissions.hidden = submissions.length > 0;
    for (const submission of submissions) {
      const item = document.createElement('li');
      const name = document.createElement('p');
      name.className = 'filename';
      name.textContent = submission.originalFilename;
      const date = document.createElement('p');
      date.className = 'metadata';
      date.textContent = formatDate(submission.submittedAt);
      const status = document.createElement('span');
      status.className = submission.lateBySeconds ? 'pill amber' : 'pill';
      status.style.marginTop = '9px';
      status.textContent = submission.lateBySeconds
        ? `Late by ${formatDuration(submission.lateBySeconds)}`
        : 'On time';
      item.append(name, date, status);
      elements.submissions.append(item);
    }
  }

  function renderClock() {
    if (!instance?.startedAt) return;
    const current = Date.now() + serverOffset;
    const remaining = Math.max(0, instance.expiresAt - current);
    const elapsed = Math.max(0, current - instance.startedAt);
    const total = instance.durationMinutes * 60_000;
    const totalSeconds = Math.floor(remaining / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    elements.timerValue.textContent = [hours, minutes, seconds]
      .map((value) => String(value).padStart(2, '0')).join(' : ');
    elements.progress.style.width = `${Math.min(100, (elapsed / total) * 100)}%`;
    elements.timerLabel.textContent = remaining === 0 ? 'Assessment window closed' : 'Time remaining';
    elements.status.textContent = remaining === 0 ? 'Time elapsed' : instance.status === 'SUBMITTED' ? 'Submitted' : 'In progress';
    elements.status.className = remaining === 0 ? 'pill amber' : 'pill';
  }

  function render() {
    elements.assessmentId.textContent = instance.id;
    elements.role.textContent = instance.role;
    elements.candidate.textContent = `Prepared for ${instance.candidateName}`;
    elements.duration.textContent = instance.durationMinutes % 60 === 0
      ? `${instance.durationMinutes / 60} ${instance.durationMinutes === 60 ? 'hour' : 'hours'}`
      : `${instance.durationMinutes} minutes`;
    const started = Boolean(instance.startedAt);
    elements.prestart.hidden = started;
    elements.started.hidden = !started;
    elements.status.textContent = started ? 'In progress' : 'Not started';
    elements.status.className = started ? 'pill' : 'pill slate';
    if (started) {
      elements.startedAt.textContent = `Started ${formatTime(instance.startedAt)}`;
      elements.deadline.textContent = `Deadline ${formatTime(instance.expiresAt)}`;
      elements.download.href = `${apiBase}/workbook`;
      renderClock();
      if (!clockHandle) clockHandle = window.setInterval(renderClock, 1000);
    }
    renderSubmissions();
  }

  async function load() {
    const transition = window.ParavanePageTransition;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    let busy = false;
    const loader = window.setTimeout(() => {
      if (transition) { busy = true; transition.setBusy(true); }
    }, 320);
    try {
      if (!token) throw new Error('Open the complete private link from your invitation.');
      const payload = await jsonRequest(apiBase, { signal: controller.signal });
      instance = payload.instance;
      submissions = payload.submissions || [];
      serverOffset = payload.serverTime - Date.now();
      elements.loading.hidden = true;
      elements.assessment.hidden = false;
      render();
    } catch (error) {
      elements.loading.hidden = true;
      elements.fatal.textContent = error.name === 'AbortError'
        ? 'Loading your assessment timed out. Refresh to try again. Your existing timer is unchanged.'
        : error.message;
      elements.fatal.hidden = false;
    } finally {
      window.clearTimeout(timeout);
      window.clearTimeout(loader);
      if (busy) transition.setBusy(false);
    }
  }

  function downloadAssessment() {
    const link = document.createElement('a');
    link.href = `${apiBase}/workbook`;
    link.download = '';
    link.hidden = true;
    document.body.append(link);
    link.click();
    link.remove();
  }

  async function signInAndDownload() {
    elements.signIn.disabled = true;
    elements.signIn.textContent = 'Beginning assessment…';
    showMessage('');
    try {
      const payload = await jsonRequest(`${apiBase}/sign-in`, { method: 'POST' });
      instance = payload.instance;
      serverOffset = payload.serverTime - Date.now();
      render();
      downloadAssessment();
      return { status: 'signed_in', assessmentId: instance.id };
    } catch (error) {
      showMessage(error.message);
      throw error;
    } finally {
      elements.signIn.disabled = false;
      elements.signIn.textContent = 'Begin assessment & download workbook';
    }
  }

  async function uploadWorkbook(file) {
    elements.upload.disabled = true;
    elements.uploadLabel.textContent = 'Uploading workbook…';
    showMessage('');
    try {
      const form = new FormData();
      form.set('file', file);
      const payload = await jsonRequest(`${apiBase}/submissions`, { method: 'POST', body: form });
      submissions.unshift(payload.submission);
      instance.status = 'SUBMITTED';
      render();
    } catch (error) {
      showMessage(error.message);
    } finally {
      elements.upload.value = '';
      elements.upload.disabled = false;
      elements.uploadLabel.textContent = 'Submit completed workbook';
    }
  }

  elements.signIn.addEventListener('click', () => {
    void signInAndDownload().catch(() => undefined);
  });
  elements.upload.addEventListener('change', () => {
    const file = elements.upload.files?.[0];
    if (file) void uploadWorkbook(file);
  });
  elements.upload.closest('[role="button"]').addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      elements.upload.click();
    }
  });

  const modelContext = document.modelContext;
  if (modelContext?.registerTool) {
    try {
      void Promise.resolve(modelContext.registerTool({
        name: 'sign_in_and_download_candidate_assessment',
        title: 'Begin and download candidate assessment',
        description: 'Begin the visible Paravane assessment, start its authoritative timer, and download the workbook.',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute: async () => instance?.startedAt
          ? { status: 'already_started', assessmentId: instance.id }
          : signInAndDownload(),
      })).catch(() => undefined);
    } catch (_) {
      // WebMCP is optional; the visible interface remains authoritative.
    }
  }

  void load();
})();
