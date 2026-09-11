(function () {
    "use strict";

    var localHostnames = ["localhost", "127.0.0.1", "::1"];
    var API_BASE = window.PARAVANE_API_BASE ||
        (localHostnames.indexOf(window.location.hostname) >= 0 ? "https://paravane.io" : "https://api.paravane.io");
    // The public endpoint lives on the API host, including localhost previews.
    // The website host no longer serves /v1/demo/score.
    var DEMO_API_BASE = window.PARAVANE_API_BASE || "https://api.paravane.io";
    var TURNSTILE_SITE_KEY = window.PARAVANE_TURNSTILE_SITE_KEY || "0x4AAAAAADfgZgjq1AON2RdA";
    var TURNSTILE_SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    var endpoints = {
        contact: "../v1/contact",
        careers: "../v1/careers/apply",
        signup: "../v1/signup",
        demo: "../v1/demo/score"
    };
    var contactSubtopics = {
        product_information: [
            ["features_capabilities", "Features and capabilities"],
            ["product_availability", "Product availability"],
            ["use_case_evaluation", "Use case evaluation"],
            ["future_product_plans", "Future product plans"],
            ["request_feature", "Request a feature"],
            ["product_feedback", "Share product feedback"]
        ],
        developer_integration: [
            ["api_getting_started", "Getting started with the API"],
            ["api_authentication", "API authentication"],
            ["sdks_code_examples", "SDKs and code examples"],
            ["technical_requirements", "Technical requirements"],
            ["security_data_handling", "Security and data handling"],
            ["documentation_question", "Documentation question"],
            ["integration_problem", "Integration problem"]
        ],
        plans_purchasing: [
            ["compare_plans", "Compare plans"],
            ["pricing_question", "Pricing question"],
            ["credits_usage_limits", "Credits and usage limits"],
            ["enterprise_custom_plan", "Enterprise or custom plan"],
            ["purchasing_vendor_onboarding", "Purchasing and vendor onboarding"],
            ["request_quote", "Request a quote"]
        ],
        account_support: [
            ["sign_in_access", "Sign-in or account access"],
            ["change_account_email", "Change account email"],
            ["update_contact_information", "Update personal or contact information"],
            ["update_workspace_name", "Update workspace name"],
            ["update_company_details", "Update company or organization details"],
            ["workspace_ownership_membership", "Workspace ownership or membership"],
            ["account_settings", "Account settings"],
            ["subscription_billing", "Subscription and billing"],
            ["manage_api_keys", "Manage API keys"],
            ["credits_usage", "Credits and usage"],
            ["technical_problem", "Technical problem"],
            ["report_bug", "Report a bug"],
            ["service_availability", "Service availability"],
            ["cancel_subscription", "Cancel subscription"],
            ["close_account", "Close account"]
        ]
    };
    var turnstileScriptPromise = null;

    function pageTheme() {
        return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
    }

    function statusEl(form) {
        return form.querySelector("[data-form-status]");
    }

    function setStatus(form, message, state) {
        var el = statusEl(form);
        if (!el) return;
        el.textContent = message;
        el.classList.remove("is-success", "is-error");
        if (state) el.classList.add("is-" + state);
    }

    function payloadFromForm(form) {
        var data = new FormData(form);
        var out = {};
        data.forEach(function (value, key) {
            out[key] = typeof value === "string" ? value.trim() : value;
        });
        if (form.dataset.apiForm === "signup" || form.dataset.apiForm === "demo") {
            out.screen_size = window.screen ? [window.screen.width, window.screen.height].join("x") : "";
            out.tz_offset = String(new Date().getTimezoneOffset());
            out.client_language = navigator.language || "";
        }
        var turnstileToken = getTurnstileToken(form);
        if (turnstileToken) {
            out.turnstile_token = turnstileToken;
        }
        return out;
    }

    function multipartPayloadFromForm(form) {
        var data = new FormData(form);
        data.forEach(function (value, key) {
            if (typeof value === "string") {
                data.set(key, value.trim());
            }
        });
        var turnstileToken = getTurnstileToken(form);
        if (turnstileToken) {
            data.set("turnstile_token", turnstileToken);
        }
        return data;
    }

    function validationFieldLabel(form, fieldName) {
        var field = form.querySelector("[name='" + fieldName + "']");
        var label = field && field.closest("label");
        var labelText = label && label.querySelector("span");
        return labelText && labelText.textContent.trim()
            ? labelText.textContent.trim()
            : String(fieldName || "Field").replace(/_/g, " ");
    }

    function validationErrorMessage(form, detail) {
        if (!detail || typeof detail !== "object") return "";
        var location = Array.isArray(detail.loc) ? detail.loc : [];
        var fieldName = location.length ? location[location.length - 1] : "";
        var label = validationFieldLabel(form, fieldName);
        var context = detail.ctx && typeof detail.ctx === "object" ? detail.ctx : {};

        if (detail.type === "string_too_short" && context.min_length) {
            return label + " must be at least " + context.min_length + " characters.";
        }
        if (detail.type === "string_too_long" && context.max_length) {
            return label + " must be no more than " + context.max_length + " characters.";
        }
        if (typeof detail.msg === "string" && detail.msg.trim()) {
            return label + ": " + detail.msg.trim() + ".";
        }
        return "";
    }

    function requestErrorMessage(form, result, fallback) {
        var detail = result && result.detail;
        if (typeof detail === "string" && detail.trim()) return detail.trim();
        if (Array.isArray(detail)) {
            var messages = detail.map(function (item) {
                return validationErrorMessage(form, item);
            }).filter(Boolean);
            if (messages.length) return messages.join(" ");
        }
        if (detail && typeof detail === "object") {
            return validationErrorMessage(form, detail) || fallback;
        }
        return fallback;
    }

    function validateCareerResume(form) {
        if (form.dataset.apiForm !== "careers") return;
        var input = form.querySelector("input[type='file'][name='resume']");
        var file = input && input.files ? input.files[0] : null;
        if (!file) {
            throw new Error("Please attach your resume before sending the application.");
        }
        var allowedExtensions = /\.(pdf|doc|docx)$/i;
        if (!allowedExtensions.test(file.name)) {
            throw new Error("Please attach a PDF, DOC, or DOCX resume.");
        }
        if (file.size > 5 * 1024 * 1024) {
            throw new Error("The resume must be 5 MB or smaller.");
        }
    }

    function setBusy(form, busy) {
        var button = form.querySelector("button[type='submit']");
        form.classList.toggle("is-busy", busy);
        // Keep the live status outside the busy region so stages are announced.
        var busyRegion = form.dataset.apiForm === "demo" ? form.querySelector(".smtprs-results-body") : form;
        if (busyRegion) busyRegion.setAttribute("aria-busy", String(busy));
        if (button) {
            button.disabled = busy;
            if (!button.dataset.defaultMarkup) button.dataset.defaultMarkup = button.innerHTML;
            if (busy) button.textContent = form.dataset.apiForm === "demo" ? "Analyzing email..." : "Sending...";
            else button.innerHTML = button.dataset.defaultMarkup;
        }
    }

    function bindContactTopicSelector(form) {
        if (form.dataset.apiForm !== "contact") return;
        var topic = form.querySelector("[data-contact-topic]");
        var subtopic = form.querySelector("[data-contact-subtopic]");
        var field = form.querySelector("[data-contact-subtopic-field]");
        if (!topic || !subtopic || !field) return;

        function updateSubtopics() {
            var choices = contactSubtopics[topic.value] || [];
            while (subtopic.firstChild) subtopic.removeChild(subtopic.firstChild);

            var placeholder = document.createElement("option");
            placeholder.value = "";
            placeholder.textContent = "Select a subtopic";
            placeholder.disabled = true;
            placeholder.selected = true;
            subtopic.appendChild(placeholder);

            choices.forEach(function (choice) {
                var option = document.createElement("option");
                option.value = choice[0];
                option.textContent = choice[1];
                subtopic.appendChild(option);
            });

            field.hidden = choices.length === 0;
            subtopic.disabled = choices.length === 0;
            subtopic.required = choices.length > 0;
        }

        topic.addEventListener("change", updateSubtopics);
        form.addEventListener("reset", function () {
            window.setTimeout(updateSubtopics, 0);
        });
        updateSubtopics();
    }

    function reportFirstInvalidField(form) {
        var fields = Array.prototype.slice.call(form.querySelectorAll("input, textarea, select"));
        var shortField = fields.find(function (field) {
            var minimum = parseInt(field.getAttribute("minlength") || "0", 10);
            return minimum > 0 && typeof field.value === "string" && field.value.trim().length < minimum;
        });
        if (shortField) {
            setStatus(
                form,
                validationFieldLabel(form, shortField.name) + " must be at least " + shortField.getAttribute("minlength") + " characters.",
                "error"
            );
            shortField.focus();
            return false;
        }
        var invalid = fields.find(function (field) {
            return field.willValidate && !field.checkValidity();
        });
        if (invalid) {
            invalid.reportValidity();
            return false;
        }
        return true;
    }

    function ensureTurnstileScript() {
        if (!TURNSTILE_SITE_KEY) {
            return Promise.reject(new Error("Verification is not configured."));
        }
        if (window.turnstile && typeof window.turnstile.render === "function") {
            return Promise.resolve(window.turnstile);
        }
        if (turnstileScriptPromise) {
            return turnstileScriptPromise;
        }
        turnstileScriptPromise = new Promise(function (resolve, reject) {
            var script = document.createElement("script");
            script.src = TURNSTILE_SCRIPT_SRC;
            script.async = true;
            script.defer = true;
            script.onload = function () {
                if (window.turnstile && typeof window.turnstile.render === "function") {
                    resolve(window.turnstile);
                } else {
                    reject(new Error("Verification could not be loaded."));
                }
            };
            script.onerror = function () {
                reject(new Error("Verification could not be loaded."));
            };
            document.head.appendChild(script);
        });
        return turnstileScriptPromise;
    }

    function insertTurnstileSlot(form) {
        var existing = form.querySelector("[data-turnstile-slot]");
        if (existing) return existing;

        var slot = document.createElement("div");
        slot.className = "turnstile-slot";
        slot.setAttribute("data-turnstile-slot", "");
        slot.setAttribute("aria-label", "Bot protection verification");

        var footer = form.querySelector(".form-footer");
        var submit = form.querySelector("button[type='submit']");
        if (footer) {
            form.insertBefore(slot, footer);
        } else if (submit) {
            submit.parentNode.insertBefore(slot, submit);
        } else {
            form.appendChild(slot);
        }
        return slot;
    }

    function renderTurnstile(form) {
        var slot = insertTurnstileSlot(form);
        if (form.dataset.turnstileWidgetId) return Promise.resolve(form.dataset.turnstileWidgetId);

        return ensureTurnstileScript().then(function (turnstile) {
            if (form.dataset.turnstileWidgetId) return form.dataset.turnstileWidgetId;
            var widgetSize = form.dataset.apiForm === "demo" ? (slot.clientWidth < 300 ? "compact" : "flexible") : "normal";
            var widgetId = turnstile.render(slot, {
                sitekey: TURNSTILE_SITE_KEY,
                theme: form.dataset.apiForm === "demo" ? "dark" : pageTheme(),
                size: widgetSize,
                appearance: form.dataset.turnstileAppearance === "interaction-only" ? "interaction-only" : "always",
                callback: function (token) {
                    form.dataset.turnstileToken = token || "";
                    if (form.dataset.preserveFormError !== "true" && !form.classList.contains("is-busy") && form.dataset.previewState !== "complete") {
                        setStatus(form, "", null);
                    }
                },
                "expired-callback": function () {
                    form.dataset.turnstileToken = "";
                    setStatus(form, "Verification expired. Please complete it again.", "error");
                },
                "error-callback": function () {
                    form.dataset.turnstileToken = "";
                    setStatus(form, "Verification could not be completed. Please refresh and try again.", "error");
                }
            });
            form.dataset.turnstileWidgetId = String(widgetId);
            form.dataset.turnstileSize = widgetSize;
            return widgetId;
        }).catch(function (err) {
            setStatus(form, err.message || "Verification could not be loaded.", "error");
            throw err;
        });
    }

    function rerenderTurnstileForTheme() {
        if (!window.turnstile) return;
        document.querySelectorAll("form[data-api-form]").forEach(function (form) {
            var slot = form.querySelector("[data-turnstile-slot]");
            if (!slot || !form.dataset.turnstileWidgetId) return;

            if (typeof window.turnstile.remove === "function") {
                window.turnstile.remove(form.dataset.turnstileWidgetId);
            } else {
                slot.innerHTML = "";
            }

            form.dataset.turnstileToken = "";
            delete form.dataset.turnstileWidgetId;
            renderTurnstile(form).catch(function () {});
        });
    }

    function getTurnstileToken(form) {
        if (form.dataset.turnstileToken) return form.dataset.turnstileToken;
        if (!window.turnstile || !form.dataset.turnstileWidgetId) return "";
        return window.turnstile.getResponse(form.dataset.turnstileWidgetId) || "";
    }

    function resetTurnstile(form) {
        form.dataset.turnstileToken = "";
        if (window.turnstile && form.dataset.turnstileWidgetId) {
            var slot = form.querySelector("[data-turnstile-slot]");
            var size = slot && slot.clientWidth < 300 ? "compact" : "flexible";
            if (form.dataset.apiForm === "demo" && form.dataset.turnstileSize && form.dataset.turnstileSize !== size) {
                window.turnstile.remove(form.dataset.turnstileWidgetId);
                delete form.dataset.turnstileWidgetId;
                renderTurnstile(form).catch(function () {});
                return;
            }
            window.turnstile.reset(form.dataset.turnstileWidgetId);
        }
    }

    function successRedirect(form, result) {
        var target = form.dataset.successRedirect || "";
        if (!target) return "";
        var url = new URL(target, window.location.origin);
        if (result && result.status) {
            url.searchParams.set("status", result.status);
        }
        if (result && result.verification_sent === false) {
            url.searchParams.set("verification", "pending");
        }
        if (result && typeof result.confirmation_sent === "boolean") {
            url.searchParams.set("confirmation", result.confirmation_sent ? "sent" : "pending");
        }
        return url.pathname + url.search + url.hash;
    }

    function navigateWithTransition(target) {
        var url = new URL(target, window.location.href);
        if (window.ParavanePageTransition && typeof window.ParavanePageTransition.begin === "function") {
            window.ParavanePageTransition.begin(url);
            return;
        }
        window.location.href = url.href;
    }

    function demoResultEl(form) {
        var target = form.getAttribute("data-result-target");
        if (target) return document.querySelector(target);
        return document.querySelector("[data-demo-result]");
    }

    function clearDemoResult(form) {
        var el = demoResultEl(form);
        if (!el) return;
        el.classList.remove("is-visible", "risk-low", "risk-medium", "risk-high", "risk-review");
        el.setAttribute("hidden", "");
    }

    var demoAnalysisRuns = new WeakMap();
    var demoAnalysisMessages = [
        "Validating email address structure...",
        "Reviewing public address risk signals...",
        "Inspecting domain reputation evidence...",
        "Checking domain mail-routing readiness...",
        "Preparing your smtpRS risk decision..."
    ];

    function stopDemoAnalysis(form) {
        var run = demoAnalysisRuns.get(form);
        var panel = form.querySelector("[data-demo-analysis]");
        if (run && run.timer) window.clearTimeout(run.timer);
        demoAnalysisRuns.delete(form);
        if (!panel) return;
        panel.classList.remove("is-running");
        panel.setAttribute("hidden", "");
    }

    function startDemoAnalysis(form) {
        var panel = form.querySelector("[data-demo-analysis]");
        if (!panel) return;
        stopDemoAnalysis(form);

        var steps = Array.prototype.slice.call(panel.querySelectorAll("[data-demo-analysis-step]"));
        var count = panel.querySelector("[data-demo-analysis-count]");
        // Estimated categories around one non-streaming public request; never
        // delay its response to finish the animation.
        var run = { index: 0, timer: null };
        setDemoState(form, "analyzing", "Analysis in progress");

        function showStep() {
            steps.forEach(function (step, index) {
                step.classList.toggle("is-complete", index < run.index);
                step.classList.toggle("is-active", index === run.index);
                if (index === run.index) step.setAttribute("aria-current", "step");
                else step.removeAttribute("aria-current");
                step.setAttribute("aria-label", (index < run.index ? "Completed: " : index === run.index ? "Current: " : "Pending: ") + step.querySelector("strong").textContent);
            });
            if (count) count.textContent = "Step " + (run.index + 1) + " of " + steps.length;
            setStatus(form, demoAnalysisMessages[run.index], null);

            if (run.index < steps.length - 1) {
                run.timer = window.setTimeout(function () {
                    run.index += 1;
                    showStep();
                }, 850);
            }
        }

        panel.removeAttribute("hidden");
        panel.classList.add("is-running");
        demoAnalysisRuns.set(form, run);
        showStep();
    }

    var demoSignupWallLastFocus = null;
    var demoSignupWallHideTimer = null;

    function demoSignupWallEl() {
        return document.querySelector("[data-demo-signup-wall]");
    }

    function closeDemoSignupWall() {
        var wall = demoSignupWallEl();
        if (!wall || wall.hasAttribute("hidden")) return;

        wall.classList.remove("is-visible");
        wall.setAttribute("aria-hidden", "true");
        document.documentElement.classList.remove("demo-signup-wall-is-open");

        window.clearTimeout(demoSignupWallHideTimer);
        demoSignupWallHideTimer = window.setTimeout(function () {
            wall.setAttribute("hidden", "");
        }, 220);

        if (demoSignupWallLastFocus && typeof demoSignupWallLastFocus.focus === "function") {
            demoSignupWallLastFocus.focus();
        }
        demoSignupWallLastFocus = null;
    }

    function openDemoSignupWall(form) {
        var wall = demoSignupWallEl();
        if (!wall) return;

        var dialog = wall.querySelector("[role='dialog']");
        demoSignupWallLastFocus = document.activeElement || form.querySelector("button[type='submit']");
        window.clearTimeout(demoSignupWallHideTimer);
        wall.removeAttribute("hidden");
        wall.setAttribute("aria-hidden", "false");
        document.documentElement.classList.add("demo-signup-wall-is-open");

        window.requestAnimationFrame(function () {
            wall.classList.add("is-visible");
            window.setTimeout(function () {
                if (dialog && wall.classList.contains("is-visible")) {
                    dialog.focus();
                }
            }, 240);
        });
    }

    function bindDemoSignupWall() {
        var wall = demoSignupWallEl();
        if (!wall || wall.dataset.demoSignupWallBound === "true") return;
        wall.dataset.demoSignupWallBound = "true";

        wall.querySelectorAll("[data-demo-signup-wall-close]").forEach(function (control) {
            control.addEventListener("click", closeDemoSignupWall);
        });

        var dialog = wall.querySelector("[role='dialog']");
        if (dialog) {
            dialog.addEventListener("keydown", function (event) {
                if (event.key !== "Tab") return;
                var focusable = Array.prototype.slice.call(dialog.querySelectorAll("a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])"));
                if (!focusable.length) return;

                var first = focusable[0];
                var last = focusable[focusable.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            });
        }

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && !wall.hasAttribute("hidden")) {
                closeDemoSignupWall();
            }
        });
    }

    function setDemoState(form, state, checkedText) {
        form.dataset.previewState = state;
        var ready = form.querySelector("[data-demo-ready]");
        var checked = form.querySelector("[data-demo-checked]");
        if (ready) ready.hidden = state !== "ready";
        if (checked && checkedText) checked.textContent = checkedText;
    }

    function demoSignalMarkup(title, signal) {
        var value = signal && typeof signal === "object" ? signal : {};
        var statuses = {
            clear: ["✓", "Positive"], capable: ["✓", "Positive"],
            elevated: ["!", "Caution"], not_capable: ["×", "Failed"],
            indeterminate: ["?", "Unknown"], not_checked: ["−", "Not checked"]
        };
        var status = Object.prototype.hasOwnProperty.call(statuses, value.status) ? value.status : "indeterminate";
        var findings = Array.isArray(value.findings) ? value.findings.filter(function (item) {
            return typeof item === "string" && item.trim();
        }) : [];
        return [
            '<details class="smtprs-signal signal-' + status + '">',
                '<summary><span class="smtprs-signal-icon" aria-hidden="true">' + statuses[status][0] + '</span>',
                    '<span><strong>' + escapeHtml(title) + '</strong><small>' + escapeHtml(value.label || "Signal unavailable in this response") + '</small></span>',
                '</summary>',
                '<div class="smtprs-signal-evidence"><p>Status: ' + statuses[status][1] + '</p>',
                    findings.length ? '<ul>' + findings.map(function (finding) {
                        return '<li>' + escapeHtml(finding) + '</li>';
                    }).join("") + '</ul>' : '<p>No additional evidence was returned.</p>',
                '</div>',
            '</details>'
        ].join("");
    }

    function renderDemoResult(form, result) {
        var el = demoResultEl(form);
        if (!el) return;
        var bands = { low: "Low risk", medium: "Review advised", high: "High risk", review: "Needs review" };
        var band = Object.prototype.hasOwnProperty.call(bands, result.risk_band) ? result.risk_band : "review";
        var confidence = result.confidence || {};
        var signals = result.signals || {};
        el.classList.remove("risk-low", "risk-medium", "risk-high", "risk-review");
        el.classList.add("is-visible", "risk-" + band);
        el.hidden = false;
        el.innerHTML = [
            '<div class="smtprs-verdict">',
                '<span class="smtprs-verdict-icon" aria-hidden="true">' + (band === "low" ? "✓" : band === "high" ? "×" : "!") + '</span>',
                '<div><h3>' + escapeHtml(result.headline || "Public analysis returned limited evidence.") + '</h3>',
                    '<p>' + escapeHtml(confidence.reason || "Mailbox verification is not included in this public preview.") + '</p></div>',
                '<div class="smtprs-verdict-band"><small>Public risk</small><strong>' + bands[band] + '</strong><span>' + escapeHtml(confidence.label || "Limited confidence") + '</span></div>',
            '</div>',
            '<div class="smtprs-signal-grid">',
                demoSignalMarkup("Address risk", signals.address_risk),
                demoSignalMarkup("Domain & mail", signals.domain_mail_capability),
                demoSignalMarkup("Mailbox verification", signals.mailbox_verification),
            '</div>'
        ].join("");
        setDemoState(form, "complete", "Checked " + new Date().toISOString().slice(11, 19) + " UTC");
    }

    function renderDemoError(form, message, limited) {
        var el = demoResultEl(form);
        setDemoState(form, "error", limited ? "Preview limit reached" : "Check not completed");
        if (!el) return;
        el.hidden = false;
        el.innerHTML = '<div class="smtprs-preview-error"><span aria-hidden="true">!</span><h3>' +
            (limited ? "Public preview limit reached" : "Analysis could not complete") + '</h3><p>' + escapeHtml(message) +
            '</p><p>Your email address is still in the input. ' +
            (limited ? 'See <a href="../pages/auth/register">evaluation access</a> for more checks.' : 'You can run the check again when ready.') + '</p></div>';
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"../g, "&quot;")
            .replace(/'../g, "&#39;");
    }

    function customerRequestErrorMessage(kind, error) {
        var message = error && error.message ? String(error.message).trim() : "";
        var isNetworkFailure = error instanceof TypeError || /failed to fetch|networkerror|network request failed|load failed/i.test(message);

        if (!isNetworkFailure) return message;
        if (kind === "demo") {
            return "smtpRS Preview could not complete this analysis right now. Please try again in a moment.";
        }
        if (kind === "signup") {
            return "We could not complete your signup right now. Please try again in a moment.";
        }
        if (kind === "careers") {
            return "We could not submit your application right now. Please try again in a moment.";
        }
        return "We could not submit your request right now. Please try again in a moment.";
    }

    async function submitForm(form) {
        var kind = form.dataset.apiForm;
        var endpoint = endpoints[kind];
        if (!endpoint || form.classList.contains("is-busy")) return;

        delete form.dataset.preserveFormError;
        setBusy(form, true);
        if (kind === "demo") {
            clearDemoResult(form);
            startDemoAnalysis(form);
            var resultsHeading = form.querySelector(".smtprs-results-heading");
            if (resultsHeading && window.matchMedia("(max-width: 820px)").matches) {
                resultsHeading.scrollIntoView({ block: "start", behavior: "instant" });
            }
        } else {
            setStatus(form, "Sending...", null);
        }

        var requestTimer = null;
        try {
            validateCareerResume(form);
            await renderTurnstile(form);
            if (!getTurnstileToken(form)) {
                throw new Error("Please complete the verification check.");
            }
            var requestOptions = {
                method: "POST",
                credentials: "include",
                headers: {
                    "Accept": "application/json"
                },
                body: kind === "careers"
                    ? multipartPayloadFromForm(form)
                    : JSON.stringify(payloadFromForm(form))
            };
            if (kind !== "careers") {
                requestOptions.headers["Content-Type"] = "application/json";
            }
            if (kind === "demo") {
                var controller = new AbortController();
                requestOptions.signal = controller.signal;
                requestTimer = window.setTimeout(function () { controller.abort(); }, 30000);
            }
            var response = await fetch((kind === "demo" ? DEMO_API_BASE : API_BASE) + endpoint, requestOptions);
            var result = await response.json().catch(function () { return {}; });
            if (kind === "demo" && response.status === 429) {
                form.dataset.preserveFormError = "true";
                setStatus(form, "The complimentary live preview limit has been reached.", "error");
                renderDemoError(form, "The complimentary live preview limit has been reached.", true);
                openDemoSignupWall(form);
                return;
            }
            if (!response.ok || !result.ok) {
                throw new Error(requestErrorMessage(form, result, "The request could not be completed."));
            }
            if (kind === "demo") {
                if (!result.signals || typeof result.signals !== "object" || !Object.keys(result.signals).length) {
                    throw new Error("The service returned no public analysis evidence. Please try again.");
                }
                renderDemoResult(form, result);
                setStatus(form, "Analysis complete. Expand a signal card to inspect its evidence.", "success");
            } else {
                var redirect = successRedirect(form, result);
                if (redirect) {
                    form.reset();
                    navigateWithTransition(redirect);
                    return;
                }
                form.reset();
                setStatus(
                    form,
                    kind === "signup"
                        ? "Signup received. Check your email to verify the account and continue to activation, billing, or review."
                        : kind === "careers"
                            ? "Application received. Thank you for your interest in Paravane Labs."
                        : "Message received. Paravane Labs will follow up by email.",
                    "success"
                );
            }
        } catch (err) {
            form.dataset.preserveFormError = "true";
            if (kind === "demo") {
                var demoError = err && err.name === "AbortError"
                    ? "The public check timed out. Please try again."
                    : customerRequestErrorMessage(kind, err) || "The public check could not complete. Please try again.";
                renderDemoError(form, demoError, false);
                setStatus(form, demoError, "error");
                return;
            }
            setStatus(
                form,
                customerRequestErrorMessage(kind, err) || (kind === "careers"
                    ? "Something went wrong. Please email careers@paravane.io."
                    : "Something went wrong. Please email contact@paravane.io."),
                "error"
            );
        } finally {
            if (requestTimer) window.clearTimeout(requestTimer);
            if (kind === "demo") stopDemoAnalysis(form);
            resetTurnstile(form);
            setBusy(form, false);
        }
    }

    function bindApiForm(form) {
        if (!form || form.dataset.apiFormBound === "true") return;
        form.dataset.apiFormBound = "true";
        bindContactTopicSelector(form);
        renderTurnstile(form).catch(function () {});
        if (form.dataset.apiForm === "demo" && window.ResizeObserver) {
            var slot = form.querySelector("[data-turnstile-slot]");
            new window.ResizeObserver(function () {
                var size = slot.clientWidth < 300 ? "compact" : "flexible";
                if (!form.dataset.turnstileWidgetId || form.dataset.turnstileSize === size || form.classList.contains("is-busy")) return;
                window.turnstile.remove(form.dataset.turnstileWidgetId);
                delete form.dataset.turnstileWidgetId;
                form.dataset.turnstileToken = "";
                renderTurnstile(form).catch(function () {});
            }).observe(slot);
        }
        var submitButton = form.querySelector("button[type='submit']");
        if (submitButton) submitButton.addEventListener("click", function (event) {
            event.preventDefault();
            if (reportFirstInvalidField(form)) submitForm(form);
        });
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            if (reportFirstInvalidField(form)) submitForm(form);
        });
    }

    function bindApiForms(root) {
        (root && root.querySelectorAll ? root : document)
            .querySelectorAll("form[data-api-form]").forEach(bindApiForm);
    }

    bindDemoSignupWall();
    bindApiForms(document);
    document.addEventListener("paravane:forms-ready", function (event) {
        bindApiForms(event.target || document);
    });
    window.addEventListener("paravane:themechange", rerenderTurnstileForTheme);
})();
