(function () {
    "use strict";
    // Presentation only. forms.js owns validation, Turnstile, requests and quotas.
    // Recent checks exist only in this page's memory; no database or result storage.
    var root = document.querySelector(".smtprs-studio");
    if (!root) return;
    var form = root.querySelector("#demo-score-form");
    var output = root.querySelector("[data-demo-result]");
    var drawer = root.querySelector(".smtprs-studio-drawer");
    var drawerBody = root.querySelector(".smtprs-studio-drawer-body");
    var toolbar = Array.from(root.querySelectorAll("[data-studio-panel]"));
    var motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var activePanel = null, panelTimer = null, returnFocus = null;
    var current = null, recent = [], nextId = 0;
    var groups = [
        { key: "address_risk", title: "Address risk" },
        { key: "domain_mail_capability", title: "Domain & mail" },
        { key: "mailbox_verification", title: "Mailbox" }
    ];
    var states = {
        clear: ["✓", "Clear", "good"], capable: ["✓", "Configured", "good"],
        elevated: ["!", "Caution", "caution"], not_capable: ["×", "Not capable", "bad"],
        indeterminate: ["?", "Unknown", "unknown"], not_checked: ["−", "Not checked", "muted"]
    };
    var bands = { low: "Low public risk", medium: "Review advised", high: "High public risk", review: "Needs review" };
    function esc(value) {
        return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }
    function signal(key) {
        var value = current && current.result.signals && current.result.signals[key];
        return value && typeof value === "object" ? value : {};
    }
    function state(value) { return Object.hasOwn(states, value.status) ? states[value.status] : states.indeterminate; }
    function band(result) { return Object.hasOwn(bands, result.risk_band) ? result.risk_band : "review"; }
    function evaluatedCount() {
        return current ? groups.filter(function (group) {
            return ["clear", "capable", "elevated", "not_capable"].indexOf(signal(group.key).status) >= 0;
        }).length : 0;
    }
    function timestamp(value) { return new Date(value).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }); }
    function busy() { return form.classList.contains("is-busy"); }
    function renderCoverage(analyzing) {
        root.querySelector("[data-studio-coverage-count]").textContent = evaluatedCount() + " of 3 public groups evaluated";
        root.querySelector("[data-studio-coverage]").innerHTML = groups.map(function (group) {
            var status = current ? state(signal(group.key)) : group.key === "mailbox_verification"
                ? ["−", "Not included", "muted"] : ["○", analyzing ? "Checking…" : "Waiting", "muted"];
            return '<button type="button" data-studio-signal="' + group.key + '" aria-label="' + esc(group.title + ": " + status[1] + ". Open signal summary") + '">' +
                '<span class="smtprs-studio-state tone-' + status[2] + '" aria-hidden="true">' + status[0] + '</span>' +
                '<span><strong>' + group.title + '</strong><small>' + status[1] + '</small></span></button>';
        }).join("") + '<button type="button" data-studio-signal="scope" aria-label="Organization: off in the free preview. Read limitations"><span class="smtprs-studio-state tone-muted" aria-hidden="true">−</span><span><strong>Organization</strong><small>Off · Desktop only</small></span></button>' +
            '<button type="button" data-studio-signal="scope" aria-label="Full model: unavailable in the free preview. Read limitations"><span class="smtprs-studio-state tone-muted" aria-hidden="true">−</span><span><strong>Full model</strong><small>Desktop only</small></span></button>';
    }
    function renderSummary() {
        var html = '<p class="smtprs-studio-panel-note">' + (current ? 'Public evidence returned for <strong>' + esc(current.email) + '</strong>.' : 'Run a Quick Scan to inspect its returned public evidence.') + '</p>';
        if (current) html += groups.map(function (group) {
            var value = signal(group.key), status = state(value);
            var findings = Array.isArray(value.findings) ? value.findings.filter(function (item) { return typeof item === "string" && item.trim(); }) : [];
            return '<details class="smtprs-studio-evidence" data-evidence="' + group.key + '"><summary><span class="tone-' + status[2] + '" aria-hidden="true">' + status[0] + '</span><strong>' + group.title + '</strong><small>' + status[1] + '</small></summary>' +
                '<div><p>' + esc(value.label || 'Signal unavailable in this response') + '</p>' +
                (findings.length ? '<ul>' + findings.map(function (finding) { return '<li>' + esc(finding) + '</li>'; }).join('') + '</ul>' : '<p>No additional evidence was returned.</p>') + '</div></details>';
        }).join("");
        html += '<section class="smtprs-studio-scope" data-evidence="scope" tabindex="-1"><h4>Included in Quick Scan</h4><p>Public address-risk patterns and domain mail-routing evidence, as available in the response.</p><h4>Beyond this preview</h4><p>Individual mailbox verification, destination-server contact, organization checks, the full model risk score, and API recommendations are not included.</p><p>No email is sent. A low public risk result does not confirm that a mailbox exists or who owns it.</p></section>';
        root.querySelector("[data-studio-summary]").innerHTML = html;
    }
    function renderResult(record) {
        current = record;
        var result = record.result, risk = band(result), confidence = result.confidence || {};
        var icon = risk === "low" ? "✓" : risk === "high" ? "×" : "!";
        output.classList.remove("risk-low", "risk-medium", "risk-high", "risk-review");
        output.classList.add("is-visible", "risk-" + risk);
        output.hidden = false;
        output.innerHTML = '<div class="smtprs-verdict smtprs-studio-verdict">' +
            '<span class="smtprs-verdict-icon" aria-hidden="true">' + icon + '</span><div><h3>' + bands[risk] + '</h3><p class="smtprs-studio-result-email">' + esc(record.email) + '</p></div>' +
            '<div class="smtprs-studio-risk-label"><small>Public signals</small><strong>Quick Scan</strong></div>' +
            '<div class="smtprs-studio-result-copy"><strong>' + evaluatedCount() + ' of 3 public signal groups assessed</strong><p>' + esc(result.headline || 'Public analysis returned limited evidence.') + '</p><p>' + esc(confidence.reason || 'Mailbox verification is not included in this public preview.') + '</p></div></div>' +
            '<section class="smtprs-studio-run-details" aria-label="Run details"><h4>Run details</h4><dl>' +
            [['Profile', 'Quick Scan'], ['Model', result.model_profile || 'Public preview'], ['Cost', 'Free preview'], ['Confidence', confidence.label || 'Limited confidence'], ['Completed', timestamp(record.completedAt)], ['Saved locally', 'No · this tab only']].map(function (row) {
                return '<div><dt>' + row[0] + '</dt><dd>' + esc(row[1]) + '</dd></div>';
            }).join('') + '</dl></section>' +
            '<div class="smtprs-studio-result-actions"><button type="button" data-studio-rerun>Run again <span aria-hidden="true">↻</span></button><a href="../pages/docs/smtprs/">Explore the full API <span aria-hidden="true">↗</span></a></div>';
        root.querySelector('[data-demo-ready]').hidden = true;
        root.querySelector('[data-demo-analysis]').hidden = true;
        form.dataset.previewState = 'complete';
        root.querySelector('[data-demo-checked]').textContent = 'Checked ' + timestamp(record.completedAt);
        renderCoverage(false);
        renderSummary();
    }
    function renderRecent() {
        root.querySelector('[data-studio-recent]').innerHTML = recent.map(function (record) {
            var risk = band(record.result);
            return '<button type="button" data-studio-reopen="' + record.id + '" aria-label="Reopen ' + esc(record.email + ', ' + bands[risk] + ', Quick Scan, ' + timestamp(record.completedAt)) + '"' + (busy() ? ' disabled' : '') + '><strong title="' + esc(record.email) + '">' + esc(record.email) + '</strong><span class="tone-' + (risk === 'low' ? 'good' : risk === 'high' ? 'bad' : 'caution') + '">' + (risk === 'low' ? '✓ ' : '! ') + bands[risk] + '</span><small>Quick Scan · ' + esc(timestamp(record.completedAt)) + '</small></button>';
        }).join('') || '<p>No checks in this session.</p>';
    }
    function syncToolbar() {
        toolbar.forEach(function (button) {
            var selected = button.dataset.studioPanel === activePanel;
            button.setAttribute('aria-expanded', String(selected));
            button.setAttribute('aria-pressed', String(selected));
        });
    }
    function closePanel(restore) {
        if (!activePanel) return;
        window.clearTimeout(panelTimer);
        activePanel = null;
        drawer.classList.remove('is-open');
        // Keep painted through the exit, but remove hidden controls from keyboard navigation.
        drawer.inert = true;
        syncToolbar();
        if (restore !== false && returnFocus && returnFocus.isConnected) returnFocus.focus({ preventScroll: true });
        panelTimer = window.setTimeout(function () { drawer.hidden = true; }, motion.matches ? 0 : 220);
    }
    function openPanel(name, trigger) {
        window.clearTimeout(panelTimer);
        activePanel = name;
        returnFocus = trigger || toolbar.find(function (button) { return button.dataset.studioPanel === name; });
        root.querySelector('#studio-drawer-title').textContent = { settings: 'Settings', summary: 'Signal summary', options: 'Options' }[name];
        root.querySelectorAll('[data-studio-pane]').forEach(function (pane) { pane.hidden = pane.dataset.studioPane !== name; });
        drawer.hidden = false;
        drawer.inert = false;
        drawerBody.scrollTop = 0;
        syncToolbar();
        window.requestAnimationFrame(function () {
            if (activePanel) drawer.classList.add('is-open');
        });
        root.querySelector('[data-studio-close]').focus({ preventScroll: true });
    }
    function reset() {
        if (busy()) return;
        form.dispatchEvent(new CustomEvent('smtprs:reset'));
        closePanel(false);
        form.querySelector('[name=email]').focus({ preventScroll: true });
        root.querySelector('.smtprs-studio-scroll').scrollTop = 0;
    }
    form.addEventListener('smtprs:state', function (event) {
        var loading = event.detail.state === 'analyzing';
        if (event.detail.state !== 'complete') {
            current = null;
            renderCoverage(loading);
            renderSummary();
        }
        root.querySelector('[data-studio-new]').disabled = loading;
        root.querySelectorAll('[data-studio-reopen]').forEach(function (button) { button.disabled = loading; });
    });
    form.addEventListener('smtprs:result', function (event) {
        event.preventDefault();
        var record = { id: ++nextId, result: event.detail.result, email: event.detail.email, completedAt: event.detail.completedAt };
        recent.unshift(record);
        recent = recent.slice(0, 5);
        renderResult(record);
        renderRecent();
    });
    // The form releases its busy state after the result is painted.
    var busyObserver = new MutationObserver(function () {
        root.querySelector('[data-studio-new]').disabled = busy();
        root.querySelectorAll('[data-studio-reopen], [data-studio-rerun]').forEach(function (button) { button.disabled = busy(); });
    });
    busyObserver.observe(form, { attributes: true, attributeFilter: ['class'] });
    root.addEventListener('click', function (event) {
        var button = event.target.closest('button');
        if (!button || button.disabled) return;
        if (button.hasAttribute('data-studio-panel')) {
            var name = button.dataset.studioPanel;
            if (activePanel === name) closePanel();
            else openPanel(name, button);
        } else if (button.hasAttribute('data-studio-close')) closePanel();
        else if (button.hasAttribute('data-studio-new')) reset();
        else if (button.hasAttribute('data-studio-analyze')) {
            closePanel(false);
            form.querySelector('[name=email]').focus({ preventScroll: true });
        } else if (button.hasAttribute('data-studio-rerun')) {
            if (!busy()) form.requestSubmit();
        } else if (button.hasAttribute('data-studio-reopen') && !busy()) {
            var record = recent.find(function (item) { return String(item.id) === button.dataset.studioReopen; });
            if (record) {
                form.dispatchEvent(new CustomEvent('smtprs:reset'));
                form.querySelector('[name=email]').value = record.email;
                renderResult(record);
                root.querySelector('[data-form-status]').textContent = 'Reopened from this session. No new check was run.';
                root.querySelector('.smtprs-studio-scroll').scrollTop = 0;
            }
        } else if (button.hasAttribute('data-studio-signal')) {
            openPanel('summary', button);
            var evidence = root.querySelector('[data-evidence="' + button.dataset.studioSignal + '"]');
            if (evidence) {
                if (evidence.tagName === 'DETAILS') evidence.open = true;
                // Scroll only the drawer, never the surrounding product page.
                drawerBody.scrollTop = Math.max(0, evidence.offsetTop - drawerBody.offsetTop - 8);
            }
        }
    });
    root.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && activePanel) { event.preventDefault(); closePanel(); }
    });
    function setPreviewTheme(theme, notify) {
        root.dataset.previewTheme = theme;
        root.querySelector('[data-studio-theme-setting]').value = theme;
        var toggle = root.querySelector('[data-studio-theme-toggle]');
        toggle.setAttribute('aria-label', 'Switch preview to ' + (theme === 'light' ? 'dark' : 'light') + ' theme');
        toggle.setAttribute('aria-pressed', String(theme === 'light'));
        if (notify) root.dispatchEvent(new CustomEvent('smtprs:themechange', { bubbles: true, detail: { theme: theme } }));
    }
    root.querySelector('[data-studio-theme-toggle]').addEventListener('click', function () {
        setPreviewTheme(root.dataset.previewTheme === 'light' ? 'dark' : 'light', true);
    });
    var scrollTimers = new Map();
    root.addEventListener('scroll', function (event) {
        var region = event.target;
        if (!region.matches('.smtprs-studio-scroll, .smtprs-studio-side, .smtprs-studio-drawer-body, .smtprs-studio-recent')) return;
        window.clearTimeout(scrollTimers.get(region));
        region.classList.add('is-scrolling');
        scrollTimers.set(region, window.setTimeout(function () { region.classList.remove('is-scrolling'); scrollTimers.delete(region); }, 220));
    }, { capture: true, passive: true });
    window.addEventListener('pagehide', function () {
        window.clearTimeout(panelTimer);
        scrollTimers.forEach(function (timer, region) { window.clearTimeout(timer); region.classList.remove('is-scrolling'); });
        scrollTimers.clear();
        // bfcache may retain the controller and its listeners for back navigation.
        if (!activePanel) drawer.hidden = true;
    });
    renderCoverage(false);
    renderSummary();
    // Start with the site's current appearance, then keep this preview independent.
    // Do not change the document theme, the global theme controller, or its preference.
    setPreviewTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark', false);
})();
