(function () {
    "use strict";

    var localHostnames = ["localhost", "127.0.0.1", "::1"];
    var API_BASE = window.PARAVANE_API_BASE ||
        (localHostnames.indexOf(window.location.hostname) >= 0 ? "" : "https://api.paravane.io");

    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setText(selector, value, root) {
        var el = $(selector, root);
        if (el) el.textContent = value == null || value === "" ? "Not available" : String(value);
    }

    function setStatus(message, state) {
        var el = $("[data-app-status]");
        if (!el) return;
        el.textContent = message;
        el.classList.remove("is-success", "is-error", "is-loading");
        if (state) el.classList.add("is-" + state);
    }

    function escapeHtml(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v004.111.002/g, "&quot;")
            .replace(/'/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v004.111.002/g, "&#39;");
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

    function formatLabel(value) {
        if (value == null || value === "") return "Not available";
        return String(value).replace(/_/g, " ");
    }

    function billingStatusLabel(billing) {
        var sub = billing && billing.subscription;
        return sub && sub.status ? sub.status.replace(/_/g, " ") : "Not connected";
    }

    function redirectToLogin() {
        var next = window.location.pathname || "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v004.111.002/pages/app/index.html";
        window.location.href = "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v004.111.002/pages/auth/login.html?next=" + encodeURIComponent(next);
    }

    async function requestJson(path, options) {
        var headers = Object.assign({ "Accept": "application/json" }, (options && options.headers) || {});
        var requestOptions = Object.assign({}, options || {});
        requestOptions.credentials = "include";
        requestOptions.headers = headers;
        var response = await fetch(API_BASE + path, requestOptions);
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

    function line(width) {
        return '<span class="loading-line" style="width:' + width + '%"></span>';
    }

    function renderMetricSkeleton(count) {
        var grid = $(".metric-grid");
        if (!grid) return;
        var existingCards = $all(".metric-card", grid);
        if (existingCards.length) {
            existingCards.forEach(function (card) {
                card.classList.add("is-loading");
            });
            return;
        }
        grid.innerHTML = Array.from({ length: count || 4 }).map(function (_, idx) {
            return '<article class="metric-card is-loading" aria-hidden="true">' +
                line(idx % 2 ? 42 : 54) + line(idx % 3 ? 35 : 48) + line(68) +
                "</article>";
        }).join("");
    }

    function renderTableSkeleton(selector, columns, rows) {
        var body = $(selector);
        if (!body) return;
        body.innerHTML = Array.from({ length: rows || 4 }).map(function (_, rowIndex) {
            var cells = Array.from({ length: columns || 4 }).map(function (_, colIndex) {
                var width = 38 + ((rowIndex + colIndex) % 4) * 13;
                return "<td>" + line(width) + "</td>";
            }).join("");
            return '<tr class="is-loading" aria-hidden="true">' + cells + "</tr>";
        }).join("");
    }

    function clearMetricLoading() {
        $all(".metric-card.is-loading").forEach(function (card) {
            card.classList.remove("is-loading");
        });
    }

    function setPanelLoading(selector, loading) {
        $all(selector).forEach(function (el) {
            el.classList.toggle("is-loading", !!loading);
        });
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
        setText("[data-usage-limit]", usage.monthly_limit == null ? "Custom" : formatNumber(usage.monthly_limit));
        setText("[data-limit]", usage.monthly_limit ? "of " + formatNumber(usage.monthly_limit) + " credits this month" : "Current month");
        setText("[data-billing-status]", billingStatusLabel(billing));
        setText("[data-billing-note]", billing.subscription ? "Subscription status" : "No Stripe subscription");
        setText("[data-access-status]", formatLabel(tenant.status || user.status || "active"));
        renderUsageRows(usage.recent);
        clearMetricLoading();
        setPanelLoading(".app-mini-stat", false);
    }

    async function initDashboard() {
        if (!$("[data-app-dashboard]")) return;
        setStatus("Loading account.", "loading");
        renderMetricSkeleton(4);
        setPanelLoading(".app-mini-stat", true);
        renderTableSkeleton("[data-usage-rows]", 4, 4);
        try {
            var data = await requestJson("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v004.111.002/v1/app/summary");
            renderDashboard(data);
            setStatus("Dashboard ready.", "success");
        } catch (err) {
            clearMetricLoading();
            setPanelLoading(".app-mini-stat", false);
            setText("[data-user-name]", "Account unavailable");
            setText("[data-tenant-name]", "Workspace unavailable");
            setText("[data-plan]", "Not available");
            setText("[data-billing-status]", "Not available");
            setText("[data-billing-note]", "Billing unavailable");
            setText("[data-access-status]", "Not available");
            renderUsageRows([]);
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
        setStatus("Loading usage.", "loading");
        renderMetricSkeleton(4);
        renderTableSkeleton("[data-profile-usage-rows]", 3, 4);
        renderTableSkeleton("[data-usage-rows]", 4, 4);
        try {
            var data = await requestJson("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v004.111.002/v1/app/usage");
            var usage = data.usage || {};
            var total = Number(usage.month_to_date || 0);
            var limit = usage.monthly_limit == null ? null : Number(usage.monthly_limit);
            setText("[data-usage-total]", formatNumber(total));
            setText("[data-usage-limit]", limit == null ? "Custom" : formatNumber(limit));
            setText("[data-usage-remaining]", limit == null ? "Custom" : formatNumber(Math.max(limit - total, 0)));
            setText("[data-usage-events]", formatNumber((usage.recent || []).length));
            renderProfileRows(usage.by_profile);
            renderUsageRows(usage.recent);
            clearMetricLoading();
            setStatus("Usage loaded.", "success");
        } catch (err) {
            clearMetricLoading();
            renderProfileRows([]);
            renderUsageRows([]);
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
        renderTableSkeleton("[data-api-key-rows]", 6, 4);
        var data = await requestJson("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v004.111.002/v1/app/api-keys");
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
            setStatus("Creating API key.", "loading");
            try {
                var data = new FormData(form);
                var result = await requestJson("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v004.111.002/v1/app/api-keys", {
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
            setStatus("Revoking API key.", "loading");
            try {
                await requestJson("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v004.111.002/v1/app/api-keys/" + encodeURIComponent(id) + "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v004.111.002/revoke", { method: "POST" });
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
        setStatus("Loading API keys.", "loading");
        try {
            await loadApiKeys();
        } catch (err) {
            renderApiKeyRows([]);
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
        setPanelLoading(".billing-summary-card", false);
    }

    async function initBillingPage() {
        if (!$("[data-billing-page]")) return;
        setStatus("Loading billing.", "loading");
        setPanelLoading(".billing-summary-card", true);
        try {
            var data = await requestJson("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v004.111.002/v1/billing/status");
            renderBilling(data);
            setStatus("Billing loaded.", "success");
        } catch (err) {
            setPanelLoading(".billing-summary-card", false);
            setText("[data-current-plan]", "Not available");
            setText("[data-subscription-status]", "Billing unavailable");
            setText("[data-period-end]", "Not available");
            setText("[data-cancel-status]", "");
            setStatus(err.message || "Billing unavailable.", "error");
        }

        document.querySelectorAll("[data-checkout-plan]").forEach(function (button) {
            button.addEventListener("click", async function () {
                var plan = button.getAttribute("data-checkout-plan");
                button.disabled = true;
                setStatus("Opening Stripe Checkout.", "loading");
                try {
                    var result = await requestJson("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v004.111.002/v1/billing/checkout", {
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
                setStatus("Opening Stripe billing portal.", "loading");
                try {
                    var result = await requestJson("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v004.111.002/v1/billing/portal", { method: "POST" });
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
                    await requestJson("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v004.111.002/v1/auth/logout", { method: "POST" });
                } catch (err) {
                    // A failed logout still sends the user back to sign in.
                }
                window.location.href = "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v004.111.002/pages/auth/login.html";
            });
        });
    }

    initLogout();
    initDashboard();
    initUsagePage();
    initApiKeysPage();
    initBillingPage();
})();
