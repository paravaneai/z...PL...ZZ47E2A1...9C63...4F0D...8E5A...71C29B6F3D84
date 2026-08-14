(function () {
    "use strict";

    var localHostnames = ["localhost", "127.0.0.1", "::1"];
    var API_BASE = window.PARAVANE_API_BASE ||
        (localHostnames.indexOf(window.location.hostname) >= 0 ? "" : "https://api.paravane.io");

    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function setText(selector, value, root) {
        var el = $(selector, root);
        if (el) el.textContent = value == null || value === "" ? "Not available" : String(value);
    }

    function setStatus(message, state) {
        var el = $("[data-app-status]");
        if (!el) return;
        el.textContent = message;
        el.classList.remove("is-success", "is-error");
        if (state) el.classList.add("is-" + state);
    }

    function escapeHtml(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v003.016.001/g, "&quot;")
            .replace(/'/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v003.016.001/g, "&#39;");
    }

    function formatDate(value) {
        if (!value) return "Not available";
        var date = new Date(value);
        if (Number.isNaN(date.getTime())) return "Unknown";
        return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    }

    function formatNumber(value) {
        var number = Number(value || 0);
        return number.toLocaleString();
    }

    function billingStatusLabel(billing) {
        var sub = billing && billing.subscription;
        return sub && sub.status ? sub.status.replace(/_/g, " ") : "Not connected";
    }

    function redirectToLogin() {
        var next = window.location.pathname.split("/").slice(-2).join("/");
        window.location.href = "../login.html?next=" + encodeURIComponent(next || "app/index.html");
    }

    async function requestJson(path, options) {
        var response = await fetch(API_BASE + path, Object.assign({
            credentials: "include",
            headers: { "Accept": "application/json" }
        }, options || {}));
        var result = await response.json().catch(function () { return {}; });
        if (response.status === 401 || response.status === 403) {
            redirectToLogin();
            throw new Error("Session required.");
        }
        if (!response.ok || result.ok === false) {
            throw new Error(result.detail || "The request could not be completed.");
        }
        return result;
    }

    function renderUsageRows(items) {
        var body = $("[data-usage-rows]");
        var empty = $("[data-empty-usage]");
        if (!body) return;
        var rows = Array.isArray(items) ? items : [];
        body.innerHTML = rows.map(function (item) {
            return [
                "<tr>",
                "<td>" + escapeHtml(formatDate(item.created_at)) + "</td>",
                "<td>" + escapeHtml(item.event_type || "analysis") + "</td>",
                "<td>" + escapeHtml(formatNumber(item.quantity || 0)) + "</td>",
                "<td>" + escapeHtml(item.model_profile || "NeuralScore") + "</td>",
                "</tr>"
            ].join("");
        }).join("");
        if (empty) empty.hidden = rows.length > 0;
    }

    function renderDashboard(data) {
        var tenant = data.tenant || {};
        var user = data.user || {};
        var usage = data.usage || {};
        var apiKeys = data.api_keys || {};
        var billing = data.billing || {};
        setText("[data-user-name]", user.name || user.email);
        setText("[data-user-email]", user.email);
        setText("[data-tenant-name]", tenant.name);
        setText("[data-plan]", (tenant.plan || "FREE") + " plan");
        setText("[data-api-key-count]", apiKeys.active_count || 0);
        setText("[data-usage]", formatNumber(usage.month_to_date || 0));
        setText("[data-limit]", usage.monthly_limit ? "of " + formatNumber(usage.monthly_limit) + " credits this month" : "Current month");
        setText("[data-billing-status]", billingStatusLabel(billing));
        setText("[data-billing-note]", billing.subscription ? "Subscription status" : "No Stripe subscription");
        renderUsageRows(usage.recent);
    }

    async function initDashboard() {
        if (!$("[data-app-dashboard]")) return;
        try {
            var data = await requestJson("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v003.016.001/v1/app/summary");
            renderDashboard(data);
            setStatus("Dashboard ready.", "success");
        } catch (err) {
            setStatus(err.message || "Dashboard unavailable.", "error");
        }
    }

    function renderProfileRows(items) {
        var body = $("[data-profile-usage-rows]");
        var empty = $("[data-empty-profile-usage]");
        if (!body) return;
        var rows = Array.isArray(items) ? items : [];
        body.innerHTML = rows.map(function (item) {
            return [
                "<tr>",
                "<td>" + escapeHtml(item.model_profile || "unknown") + "</td>",
                "<td>" + escapeHtml(formatNumber(item.credits || 0)) + "</td>",
                "<td>" + escapeHtml(formatNumber(item.events || 0)) + "</td>",
                "</tr>"
            ].join("");
        }).join("");
        if (empty) empty.hidden = rows.length > 0;
    }

    async function initUsagePage() {
        if (!$("[data-usage-page]")) return;
        try {
            var data = await requestJson("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v003.016.001/v1/app/usage");
            var usage = data.usage || {};
            var total = Number(usage.month_to_date || 0);
            var limit = usage.monthly_limit == null ? null : Number(usage.monthly_limit);
            setText("[data-usage-total]", formatNumber(total));
            setText("[data-usage-limit]", limit == null ? "Custom" : formatNumber(limit));
            setText("[data-usage-remaining]", limit == null ? "Custom" : formatNumber(Math.max(limit - total, 0)));
            renderProfileRows(usage.by_profile);
            renderUsageRows(usage.recent);
            setStatus("Usage loaded.", "success");
        } catch (err) {
            setStatus(err.message || "Usage unavailable.", "error");
        }
    }

    function renderApiKeyRows(items) {
        var body = $("[data-api-key-rows]");
        var empty = $("[data-empty-keys]");
        if (!body) return;
        var rows = Array.isArray(items) ? items : [];
        body.innerHTML = rows.map(function (item) {
            var active = item.active && !item.revoked_at;
            return [
                "<tr>",
                "<td>" + escapeHtml(item.name || "API key") + "</td>",
                "<td><code>" + escapeHtml(item.key_prefix || "") + "</code></td>",
                "<td>" + escapeHtml(item.tier || "BASIC") + "</td>",
                "<td>" + (active ? "Active" : "Revoked") + "</td>",
                "<td>" + escapeHtml(formatDate(item.created_at)) + "</td>",
                "<td>" + (active ? '<button class="table-action" type="button" data-revoke-key="' + escapeHtml(item.id) + '">Revoke</button>' : "") + "</td>",
                "</tr>"
            ].join("");
        }).join("");
        if (empty) empty.hidden = rows.length > 0;
    }

    async function loadApiKeys() {
        var data = await requestJson("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v003.016.001/v1/app/api-keys");
        renderApiKeyRows(data.items);
        setStatus("API keys loaded.", "success");
    }

    function initCreateApiKeyForm() {
        var form = $("[data-create-api-key]");
        if (!form) return;
        form.addEventListener("submit", async function (event) {
            event.preventDefault();
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            var button = form.querySelector("button[type='submit']");
            if (button) button.disabled = true;
            setStatus("Creating API key.", null);
            try {
                var data = new FormData(form);
                var result = await requestJson("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v003.016.001/v1/app/api-keys", {
                    method: "POST",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ name: String(data.get("name") || "").trim() || "Production key" })
                });
                var box = $("[data-new-api-key]");
                var value = $("[data-new-api-key-value]");
                if (box && value) {
                    value.textContent = result.api_key || "";
                    box.hidden = false;
                }
                await loadApiKeys();
                setStatus("API key created. Copy it before leaving this page.", "success");
            } catch (err) {
                setStatus(err.message || "API key could not be created.", "error");
            } finally {
                if (button) button.disabled = false;
            }
        });
    }

    function initApiKeyActions() {
        document.addEventListener("click", async function (event) {
            var button = event.target.closest("[data-revoke-key]");
            if (!button) return;
            var id = button.getAttribute("data-revoke-key");
            if (!id || !window.confirm("Revoke this API key? Existing integrations using it will stop working.")) {
                return;
            }
            button.disabled = true;
            setStatus("Revoking API key.", null);
            try {
                await requestJson("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v003.016.001/v1/app/api-keys/" + encodeURIComponent(id) + "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v003.016.001/revoke", { method: "POST" });
                await loadApiKeys();
                setStatus("API key revoked.", "success");
            } catch (err) {
                setStatus(err.message || "API key could not be revoked.", "error");
                button.disabled = false;
            }
        });
    }

    async function initApiKeysPage() {
        if (!$("[data-api-keys-page]")) return;
        initCreateApiKeyForm();
        initApiKeyActions();
        try {
            await loadApiKeys();
        } catch (err) {
            setStatus(err.message || "API keys unavailable.", "error");
        }
    }

    function showBillingMessage(message) {
        var box = $("[data-billing-message]");
        var value = $("[data-billing-message-value]");
        if (box && value) {
            value.textContent = message;
            box.hidden = false;
        }
    }

    function renderBilling(data) {
        var tenant = data.tenant || {};
        var billing = data.billing || {};
        var sub = billing.subscription || null;
        setText("[data-current-plan]", tenant.plan || "FREE");
        setText("[data-subscription-status]", sub ? billingStatusLabel(billing) : "No Stripe subscription");
        setText("[data-period-end]", sub && sub.current_period_end ? formatDate(sub.current_period_end) : "Not available");
        setText("[data-cancel-status]", sub && sub.cancel_at_period_end ? "Cancels at period end" : "");
    }

    async function initBillingPage() {
        if (!$("[data-billing-page]")) return;
        try {
            var data = await requestJson("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v003.016.001/v1/billing/status");
            renderBilling(data);
            setStatus("Billing loaded.", "success");
        } catch (err) {
            setStatus(err.message || "Billing unavailable.", "error");
        }

        document.querySelectorAll("[data-checkout-plan]").forEach(function (button) {
            button.addEventListener("click", async function () {
                var plan = button.getAttribute("data-checkout-plan");
                button.disabled = true;
                setStatus("Opening Stripe Checkout.", null);
                try {
                    var result = await requestJson("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v003.016.001/v1/billing/checkout", {
                        method: "POST",
                        headers: {
                            "Accept": "application/json",
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ plan: plan })
                    });
                    if (!result.url) throw new Error("Stripe did not return a checkout URL.");
                    window.location.href = result.url;
                } catch (err) {
                    setStatus(err.message || "Checkout could not be started.", "error");
                    showBillingMessage(err.message || "Checkout could not be started.");
                    button.disabled = false;
                }
            });
        });

        var portalButton = $("[data-open-billing-portal]");
        if (portalButton) {
            portalButton.addEventListener("click", async function () {
                portalButton.disabled = true;
                setStatus("Opening Stripe billing portal.", null);
                try {
                    var result = await requestJson("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v003.016.001/v1/billing/portal", { method: "POST" });
                    if (!result.url) throw new Error("Stripe did not return a portal URL.");
                    window.location.href = result.url;
                } catch (err) {
                    setStatus(err.message || "Billing portal could not be opened.", "error");
                    showBillingMessage(err.message || "Billing portal could not be opened.");
                    portalButton.disabled = false;
                }
            });
        }
    }

    function initLogout() {
        document.querySelectorAll("[data-logout]").forEach(function (button) {
            button.addEventListener("click", async function () {
                button.disabled = true;
                try {
                    await requestJson("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v003.016.001/v1/auth/logout", { method: "POST" });
                } catch (err) {
                    // A failed logout still sends the user back to sign in.
                }
                window.location.href = "../login.html";
            });
        });
    }

    initLogout();
    initDashboard();
    initUsagePage();
    initApiKeysPage();
    initBillingPage();
})();
