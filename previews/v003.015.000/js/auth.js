(function () {
    "use strict";

    var localHostnames = ["localhost", "127.0.0.1", "::1"];
    var API_BASE = window.PARAVANE_API_BASE ||
        (localHostnames.indexOf(window.location.hostname) >= 0 ? "" : "https://api.paravane.io");
    var endpoints = {
        login: "../v1/auth/login",
        forgot: "../v1/auth/forgot-password",
        reset: "../v1/auth/reset-password",
        verify: "../v1/auth/verify-email",
        resend: "../v1/auth/resend-verification"
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
            button.disabled = busy;
            if (!button.dataset.defaultText) button.dataset.defaultText = button.textContent;
            button.textContent = busy ? "Working..." : button.dataset.defaultText;
        }
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
        return params.get("next") || form.dataset.successRedirect || "app/index.html";
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
            await postJson(endpoint, payload);

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
                form.reset();
                setStatus(form, "Password updated. You can sign in with the new password.", "success");
            } else if (kind === "verify") {
                setStatus(form, "Email verified. You can now sign in once your account is approved.", "success");
            } else if (kind === "resend") {
                setStatus(form, "If verification is still needed, a new email has been sent.", "success");
            }
        } catch (err) {
            setStatus(form, err.message || "Something went wrong.", "error");
        } finally {
            setBusy(form, false);
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
            setStatus(form, "This page needs a token from an email link.", "error");
        }
    });
})();
