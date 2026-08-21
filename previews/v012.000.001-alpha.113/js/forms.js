(function () {
    "use strict";

    var localHostnames = ["localhost", "127.0.0.1", "::1"];
    var API_BASE = window.PARAVANE_API_BASE ||
        (localHostnames.indexOf(window.location.hostname) >= 0 ? "" : "https://api.paravane.io");
    var TURNSTILE_SITE_KEY = window.PARAVANE_TURNSTILE_SITE_KEY || "0x4AAAAAADfgZgjq1AON2RdA";
    var TURNSTILE_SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    var endpoints = {
        contact: "../v1/contact",
        careers: "../v1/careers/apply",
        signup: "../v1/signup",
        demo: "../v1/demo/score"
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
        if (button) {
            button.disabled = busy;
            if (!button.dataset.defaultText) button.dataset.defaultText = button.textContent;
            button.textContent = busy ? "Sending..." : button.dataset.defaultText;
        }
    }

    function reportFirstInvalidField(form) {
        var fields = Array.prototype.slice.call(form.querySelectorAll("input, textarea, select"));
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
            var widgetId = turnstile.render(slot, {
                sitekey: TURNSTILE_SITE_KEY,
                theme: pageTheme(),
                callback: function (token) {
                    form.dataset.turnstileToken = token || "";
                    setStatus(form, "", null);
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

    function demoSignalMarkup(title, signal, fallback) {
        var value = signal && typeof signal === "object" ? signal : fallback;
        var statuses = ["clear", "capable", "elevated", "not_capable", "indeterminate", "not_checked"];
        var status = statuses.indexOf(value.status) >= 0 ? value.status : "indeterminate";
        var findings = Array.isArray(value.findings) ? value.findings : [];
        return [
            '<section class="demo-signal demo-signal-' + status + '">',
                '<span class="demo-signal-indicator" aria-hidden="true"></span>',
                '<div class="demo-signal-copy">',
                    '<p class="demo-signal-name">' + escapeHtml(title) + '</p>',
                    '<strong class="demo-signal-label">' + escapeHtml(value.label) + '</strong>',
                    findings.length ? '<ul class="demo-signal-findings">' + findings.map(function (finding) {
                        return '<li>' + escapeHtml(finding) + '</li>';
                    }).join("") + '</ul>' : '',
                '</div>',
            '</section>'
        ].join("");
    }

    function renderDemoResult(form, result) {
        var el = demoResultEl(form);
        if (!el) return;
        var band = result.risk_band || "review";
        var confidence = result.confidence || {
            label: "Limited confidence",
            reason: "Mailbox verification is not included in this public preview."
        };
        var signals = result.signals || {};
        var elevated = band === "high" || band === "medium" || band === "review";
        var addressFallback = {
            status: elevated ? "elevated" : "clear",
            label: elevated ? "Public address risk flags detected" : "No public address risk flags found",
            findings: Array.isArray(result.reasons) ? result.reasons : []
        };
        var domainFallback = {
            status: "indeterminate",
            label: "Domain mail capability was not included in this result",
            findings: []
        };
        var mailboxFallback = {
            status: "not_checked",
            label: "Mailbox not verified",
            findings: ["This public preview does not contact the destination mail server."]
        };
        el.classList.remove("risk-low", "risk-medium", "risk-high", "risk-review");
        el.classList.add("is-visible", "risk-" + band);
        el.removeAttribute("hidden");
        el.innerHTML = [
            '<div class="demo-result-top">',
                '<span class="demo-result-model">' + escapeHtml(result.model || "smtpRS Preview") + '</span>',
                '<span class="demo-confidence-badge">' + escapeHtml(confidence.label || "Limited confidence") + '</span>',
            '</div>',
            '<h3 class="demo-result-headline">' + escapeHtml(result.headline || "No public risk flags detected.") + '</h3>',
            '<p class="demo-confidence-copy">' + escapeHtml(confidence.reason || "Mailbox verification is not included in this public preview.") + '</p>',
            '<div class="demo-signal-list">',
                demoSignalMarkup("Address risk", signals.address_risk, addressFallback),
                demoSignalMarkup("Domain / mail capability", signals.domain_mail_capability, domainFallback),
                demoSignalMarkup("Mailbox verification", signals.mailbox_verification, mailboxFallback),
            '</div>',
            '<div class="demo-result-actions">',
                '<a class="text-link" href="../pages/auth/register">Create account</a>',
                '<a class="text-link" href="../pages/docs/">View API docs</a>',
            '</div>'
        ].join("");
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"../g, "&quot;")
            .replace(/'../g, "&#39;");
    }

    async function submitForm(form) {
        var kind = form.dataset.apiForm;
        var endpoint = endpoints[kind];
        if (!endpoint) return;

        setBusy(form, true);
        setStatus(form, "Sending...", null);
        if (kind === "demo") clearDemoResult(form);

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
            var response = await fetch(API_BASE + endpoint, requestOptions);
            var result = await response.json().catch(function () { return {}; });
            if (!response.ok || !result.ok) {
                throw new Error(result.detail || "The request could not be completed.");
            }
            if (kind === "demo") {
                renderDemoResult(form, result);
                setStatus(form, "Preview ready. Full API access is available by evaluation request.", "success");
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
            setStatus(
                form,
                err.message || (kind === "careers"
                    ? "Something went wrong. Please email careers@paravane.io."
                    : "Something went wrong. Please email contact@paravane.io."),
                "error"
            );
        } finally {
            resetTurnstile(form);
            setBusy(form, false);
        }
    }

    function bindApiForm(form) {
        if (!form || form.dataset.apiFormBound === "true") return;
        form.dataset.apiFormBound = "true";
        renderTurnstile(form).catch(function () {});
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

    bindApiForms(document);
    document.addEventListener("paravane:forms-ready", function (event) {
        bindApiForms(event.target || document);
    });
    window.addEventListener("paravane:themechange", rerenderTurnstileForTheme);
})();
