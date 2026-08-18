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
            .replace(/"../g, "&quot;")
            .replace(/'../g, "&#39;");
    }

    function formatDate(value) {
        if (!value) return "Never";
        var date = new Date(value);
        if (Number.isNaN(date.getTime())) return "Unknown";
        return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
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
                "<td>" + escapeHtml(item.quantity || 0) + "</td>",
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
        setText("[data-plan]", (tenant.plan || "BASIC") + " plan");
        setText("[data-api-key-count]", apiKeys.active_count || 0);
        setText("[data-usage]", usage.month_to_date || 0);
        setText("[data-limit]", usage.monthly_limit ? "of " + usage.monthly_limit + " this month" : "Current month");
        setText("[data-billing-status]", billing.status || "Not connected");
        renderUsageRows(usage.recent);
    }

    async function initDashboard() {
        if (!$("[data-app-dashboard]")) return;
        try {
            var data = await requestJson("../v1/app/summary");
            renderDashboard(data);
            setStatus("Dashboard ready.", "success");
        } catch (err) {
            setStatus(err.message || "Dashboard unavailable.", "error");
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
        var data = await requestJson("../v1/app/api-keys");
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
                var result = await requestJson("../v1/app/api-keys", {
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
                await requestJson("../v1/app/api-keys/" + encodeURIComponent(id) + "../revoke", { method: "POST" });
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

    function initLogout() {
        document.querySelectorAll("[data-logout]").forEach(function (button) {
            button.addEventListener("click", async function () {
                button.disabled = true;
                try {
                    await requestJson("../v1/auth/logout", { method: "POST" });
                } catch (err) {
                    // A failed logout still sends the user back to sign in.
                }
                window.location.href = "../login.html";
            });
        });
    }

    initLogout();
    initDashboard();
    initApiKeysPage();
})();
