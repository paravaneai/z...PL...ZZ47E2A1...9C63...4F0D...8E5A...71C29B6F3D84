(function () {
    "use strict";

    var localHostnames = ["localhost", "127.0.0.1", "::1"];
    var API_BASE = window.PARAVANE_API_BASE ||
        (localHostnames.indexOf(window.location.hostname) >= 0 ? "" : "https://api.paravane.io");
    var endpoints = {
        login: "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v010.220.471-alpha.311/v1/auth/login",
        forgot: "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v010.220.471-alpha.311/v1/auth/forgot-password",
        reset: "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v010.220.471-alpha.311/v1/auth/reset-password",
        verify: "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v010.220.471-alpha.311/v1/auth/verify-email",
        resend: "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v010.220.471-alpha.311/v1/auth/resend-verification"
    };

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

    function setBusy(form, busy) {
        var button = form.querySelector("button[type='submit']");
        form.classList.toggle("is-busy", busy);
        if (button) {
            if (button.hidden) return;
            button.disabled = busy;
            if (!button.dataset.defaultText) button.dataset.defaultText = button.textContent;
            button.textContent = busy ? "Working..." : button.dataset.defaultText;
        }
    }

    function setElementHidden(element, hidden) {
        if (!element) return;
        element.hidden = hidden;
        element.style.display = hidden ? "none" : "";
    }

    function verificationTier(result) {
        var tier = String((result && result.tier) || "FREE").trim().toUpperCase();
        return tier.charAt(0) + tier.slice(1).toLowerCase();
    }

    function verificationMessage(result, concise) {
        var status = result && result.status;
        var nextAction = result && result.next_action;
        var tier = verificationTier(result);
        if (nextAction === "create_api_key" || status === "active") {
            return concise
                ? "Email verified. Sign in to create your " + tier + " API key."
                : "Your email is confirmed and " + tier + " access is active. Sign in to create your API key in the authenticated dashboard.";
        }
        if (nextAction === "complete_billing" || status === "active_billing_required") {
            return concise
                ? "Email verified. Sign in and complete " + tier + " billing to activate paid API access."
                : "Your email is confirmed. Sign in and complete " + tier + " billing before paid API access or API key creation is enabled.";
        }
        return concise
            ? "Email verified. Your " + tier + " request remains under review."
            : "Your email is confirmed. Your " + tier + " request is under review before API access is activated.";
    }

    function completeVerificationPage(form, result) {
        var title = document.querySelector("[data-verify-title]");
        var copy = document.querySelector("[data-verify-copy]");
        var button = form.querySelector("[data-verify-button]");
        var actions = form.querySelector("[data-verify-actions]");
        var resendCard = document.querySelector("[data-resend-card]");
        var status = result && result.status;
        var nextAction = result && result.next_action;
        var active = nextAction === "create_api_key" || status === "active";
        var billingRequired = nextAction === "complete_billing" || status === "active_billing_required";
        if (title) title.textContent = "Email verified.";
        if (copy) copy.textContent = verificationMessage(result, false);
        if (actions) {
            var nextLink = actions.querySelector("a");
            if (nextLink) {
                if (active) {
                    nextLink.href = "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v010.220.471-alpha.311/pages/auth/login.html?next=%2Fpages%2Fapp%2Fapi-keys.html";
                    nextLink.textContent = "Sign in to create API key";
                } else if (billingRequired) {
                    nextLink.href = "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v010.220.471-alpha.311/pages/auth/login.html?next=%2Fpages%2Fapp%2Fbilling.html";
                    nextLink.textContent = "Sign in to complete billing";
                } else {
                    nextLink.href = "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v010.220.471-alpha.311/index.html";
                    nextLink.textContent = "Return to Paravane Labs";
                }
            }
        }
        if (button) {
            setElementHidden(button, true);
            button.disabled = true;
        }
        setElementHidden(actions, false);
        setElementHidden(resendCard, true);
        form.classList.add("is-verification-complete");
    }

    function declineVerificationPage(form, message) {
        var title = document.querySelector("[data-verify-title]");
        var copy = document.querySelector("[data-verify-copy]");
        var button = form.querySelector("[data-verify-button]");
        var actions = form.querySelector("[data-verify-actions]");
        var resendCard = document.querySelector("[data-resend-card]");
        if (title) title.textContent = "Verification link declined.";
        if (copy) {
            copy.textContent = "This verification link could not be accepted. It may be expired, already used, or missing required information.";
        }
        if (button) {
            setElementHidden(button, true);
            button.disabled = true;
        }
        setElementHidden(actions, true);
        setElementHidden(resendCard, false);
        form.classList.add("is-verification-declined");
        setStatus(form, message || "Request a fresh verification email below.", "error");
    }

    function payloadFromForm(form) {
        var data = new FormData(form);
        var out = {};
        data.forEach(function (value, key) {
            out[key] = typeof value === "string" ? value.trim() : value;
        });
        return out;
    }

    function tokenFromUrl() {
        return new URLSearchParams(window.location.search).get("token") || "";
    }

    function nextUrl(form) {
        var params = new URLSearchParams(window.location.search);
        var next = params.get("next") || form.dataset.successRedirect || "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v010.220.471-alpha.311/pages/app/index.html";
        return next.charAt(0) === "/" && next.charAt(1) !== "/" ? next : "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v010.220.471-alpha.311/pages/app/index.html";
    }

    function successRedirect(form, fallback) {
        var target = form.dataset.successRedirect || fallback || "";
        return target && target.charAt(0) === "/" && target.charAt(1) !== "/" ? target : fallback;
    }

    function navigateWithTransition(target, delay) {
        var wait = typeof delay === "number" ? delay : 0;
        window.setTimeout(function () {
            var url = new URL(target, window.location.href);
            if (window.ParavanePageTransition && typeof window.ParavanePageTransition.begin === "function") {
                window.ParavanePageTransition.begin(url);
                return;
            }
            window.location.href = url.href;
        }, wait);
    }

    async function postJson(endpoint, payload) {
        var response = await fetch(API_BASE + endpoint, {
            method: "POST",
            credentials: "include",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        var result = await response.json().catch(function () { return {}; });
        if (!response.ok || result.ok === false) {
            throw new Error(result.detail || "The request could not be completed.");
        }
        return result;
    }

    async function submitForm(form) {
        var kind = form.dataset.authForm;
        var endpoint = endpoints[kind];
        if (!endpoint) return;
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        setBusy(form, true);
        setStatus(form, "Working...", null);

        try {
            var payload = payloadFromForm(form);
            if ((kind === "verify" || kind === "reset") && !payload.token) {
                throw new Error("This link is missing its token. Request a fresh email and try again.");
            }
            var result = await postJson(endpoint, payload);

            if (kind === "login") {
                setStatus(form, "Signed in. Opening your dashboard...", "success");
                window.setTimeout(function () {
                    window.location.href = nextUrl(form);
                }, 350);
                return;
            }
            if (kind === "forgot") {
                setStatus(form, "If an account exists for that email, a reset link has been sent.", "success");
            } else if (kind === "reset") {
                setStatus(form, "Password updated. Opening confirmation...", "success");
                navigateWithTransition(successRedirect(form, "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v010.220.471-alpha.311/pages/auth/password-reset-success.html"), 350);
                return;
            } else if (kind === "verify") {
                setStatus(form, verificationMessage(result, true), "success");
                completeVerificationPage(form, result);
            } else if (kind === "resend") {
                setStatus(form, "If verification is still needed, a new email has been sent.", "success");
            }
        } catch (err) {
            if (kind === "verify") {
                declineVerificationPage(form, err.message || "Request a fresh verification email below.");
            } else {
                setStatus(form, err.message || "Something went wrong.", "error");
            }
        } finally {
            setBusy(form, false);
            if (form.classList.contains("is-verification-complete") || form.classList.contains("is-verification-declined")) {
                var button = form.querySelector("[data-verify-button]");
                if (button) button.disabled = true;
            }
        }
    }

    document.querySelectorAll("form[data-auth-form]").forEach(function (form) {
        var tokenField = form.querySelector("[data-token-field]");
        if (tokenField && !tokenField.value) {
            tokenField.value = tokenFromUrl();
        }
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            submitForm(form);
        });
        if (form.dataset.autoSubmit === "true" && tokenField && tokenField.value) {
            submitForm(form);
        } else if ((form.dataset.authForm === "verify" || form.dataset.authForm === "reset") && tokenField && !tokenField.value) {
            if (form.dataset.authForm === "verify") {
                declineVerificationPage(form, "This page needs a valid token from an email link.");
            } else {
                setStatus(form, "This page needs a token from an email link.", "error");
            }
        }
    });
})();
