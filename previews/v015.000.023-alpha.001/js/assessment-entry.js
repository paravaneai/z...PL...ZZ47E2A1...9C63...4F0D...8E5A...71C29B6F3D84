(() => {
  'use strict';

  const form = document.querySelector('#invitation-form');
  const input = document.querySelector('#invitation-code');
  const button = document.querySelector('#invitation-submit');
  const error = document.querySelector('#invitation-error');
  const transition = window.ParavanePageTransition;
  let pending = false;

  function showError(message) {
    error.textContent = message;
    error.hidden = !message;
    if (message) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (pending) return;
    const code = input.value.trim();
    showError('');
    if (!/^[A-Za-z0-9_-]{32,128}$/.test(code)) {
      showError('Paste the complete invitation code from your email, not the assessment ID or a web address.');
      input.focus();
      return;
    }

    pending = true;
    button.disabled = true;
    button.textContent = 'Checking invitation…';
    form.setAttribute('aria-busy', 'true');
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    let busy = false;
    let destination = null;
    const loader = window.setTimeout(() => {
      if (transition) { busy = true; transition.setBusy(true); }
    }, 320);

    try {
      // The existing bearer token is the code. Looking it up is read-only:
      // never call /sign-in here, and never persist it in browser storage.
      const response = await fetch(`../careers/assessments/api/instances/${encodeURIComponent(code)}`, {
        cache: 'no-store', credentials: 'same-origin', signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      if ([400, 403, 404, 410].includes(response.status)) {
        throw new Error('This invitation code is unavailable. Check your latest invitation or ask Paravane for a replacement.');
      }
      if (!response.ok) throw new Error('Assessment access is temporarily unavailable. Please try again.');
      const payload = await response.json();
      if (!payload.instance?.id || !['INVITED', 'STARTED', 'SUBMITTED'].includes(payload.instance.status)) {
        throw new Error('This invitation is unavailable. Please contact Paravane.');
      }
      destination = new URL(`../careers/assessments/start/${encodeURIComponent(code)}`, window.location.origin);
    } catch (cause) {
      showError(cause.name === 'AbortError'
        ? 'The connection timed out. Please try again; your assessment has not been started.'
        : cause instanceof TypeError || cause instanceof SyntaxError
          ? 'Could not connect to assessment access. Please try again.'
          : cause.message);
    } finally {
      window.clearTimeout(timeout);
      window.clearTimeout(loader);
      if (busy) transition.setBusy(false);
      form.setAttribute('aria-busy', 'false');
      if (!destination) {
        pending = false;
        button.disabled = false;
        button.textContent = 'Continue to assessment';
        input.focus();
      }
    }

    if (destination) {
      input.value = '';
      button.textContent = 'Opening assessment…';
      if (transition) transition.begin(destination);
      else window.location.assign(destination.href);
    }
  });

  window.addEventListener('pageshow', (event) => {
    if (!event.persisted) return;
    pending = false;
    button.disabled = false;
    button.textContent = 'Continue to assessment';
    form.setAttribute('aria-busy', 'false');
    showError('');
  });
  button.disabled = false;
})();
