(function () {
    "use strict";

    var localHostnames = ["localhost", "127.0.0.1", "::1"];
    var API_BASE = window.PARAVANE_API_BASE ||
        (localHostnames.indexOf(window.location.hostname) >= 0 ? "" : "https://api.paravane.io");
    var pageTransitionStateKey = "paravane-page-transition";
    var transitionTiming = readRouteTransitionTiming();
    var transitionReadyAt = Date.now() + transitionTiming.minimumDisplayMs;
    var transitionHideTimer = null;
    var apiKeySecretStorageKey = "paravane-app-api-key-secrets-session-v1";
    var apiKeyRowsByRef = {};
    var apiKeyCreateState = { disabled: false, message: "" };
    var apiKeyPlanLimits = {
        FREE: 1,
        BASIC: 1,
        PRO: 3,
        SCALE: 5,
        BUSINESS: 10
    };

    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function transitionMilliseconds(name, fallback) {
        var raw = window.getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        var value = parseFloat(raw);
        if (!raw || !isFinite(value)) return fallback;
        if (/s$/i.test(raw) && !/ms$/i.test(raw)) return value * 1000;
        return value;
    }

    function readRouteTransitionTiming() {
        return {
            minimumDisplayMs: transitionMilliseconds("--route-transition-min-display-ms", 850),
            removalTransitionMs: transitionMilliseconds("--route-transition-overlay-ms", 560),
            navigationDelayMs: transitionMilliseconds("--route-transition-navigation-delay-ms", 220)
        };
    }

    function targetUrlNoHash(url) {
        return url.origin + url.pathname + url.search;
    }

    function writePageArrivalState(url) {
        try {
            window.sessionStorage.setItem(pageTransitionStateKey, JSON.stringify({
                target: targetUrlNoHash(url),
                startedAt: Date.now()
            }));
        } catch (err) {}
    }

    function isEligiblePagePath(pathname) {
        return pathname === "/" || /\.html$/i.test(pathname);
    }

    function isPlatformPathname(pathname) {
        return pathname === "/" || pathname === "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v008.008.002/index.html";
    }

    function cameFromPlatform() {
        if (!document.referrer) return false;
        try {
            var referrer = new URL(document.referrer);
            return referrer.origin === window.location.origin && isPlatformPathname(referrer.pathname);
        } catch (err) {
            return false;
        }
    }

    function clearAppTransitionNow() {
        window.clearTimeout(transitionHideTimer);
        $all(".app-route-backdrop, .app-route-loader").forEach(function (el) {
            el.hidden = true;
            el.style.opacity = "0";
            el.style.visibility = "hidden";
        });
        document.documentElement.classList.remove("app-is-booting", "app-is-leaving");
        document.documentElement.classList.add("app-is-ready");
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

    function showAppTransition() {
        transitionTiming = readRouteTransitionTiming();
        transitionReadyAt = Date.now() + transitionTiming.minimumDisplayMs;
        window.clearTimeout(transitionHideTimer);
        $all(".app-route-backdrop, .app-route-loader").forEach(function (el) {
            el.hidden = false;
            el.style.opacity = "1";
            el.style.visibility = "visible";
        });
        document.documentElement.classList.remove("app-is-ready");
        document.documentElement.classList.add("app-is-leaving");
    }

    function hideAppTransition() {
        transitionTiming = readRouteTransitionTiming();
        var remaining = Math.max(0, transitionReadyAt - Date.now());
        window.clearTimeout(transitionHideTimer);
        transitionHideTimer = window.setTimeout(function () {
            window.requestAnimationFrame(function () {
                $all(".app-route-backdrop, .app-route-loader").forEach(function (el) {
                    el.style.opacity = "0";
                    el.style.visibility = "hidden";
                    window.setTimeout(function () {
                        if (document.documentElement.classList.contains("app-is-ready")) {
                            el.hidden = true;
                        }
                    }, transitionTiming.removalTransitionMs);
                });
                document.documentElement.classList.remove("app-is-booting", "app-is-leaving");
                document.documentElement.classList.add("app-is-ready");
            });
        }, remaining);
    }

    function shouldTransitionLink(link, event) {
        if (!link || event.defaultPrevented || event.button !== 0) return false;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
        if (link.target && link.target !== "_self") return false;
        if (link.hasAttribute("download")) return false;
        if (link.getAttribute("href") && link.getAttribute("href").charAt(0) === "#") return false;
        if (link.getAttribute("href") && /^(mailto|tel|sms|javascript):/i.test(link.getAttribute("href"))) return false;

        var url;
        try {
            url = new URL(link.href, window.location.href);
        } catch (err) {
            return false;
        }

        if (url.origin !== window.location.origin) return false;
        if (url.pathname === window.location.pathname && url.search === window.location.search) return false;
        if (!isEligiblePagePath(url.pathname)) return false;
        return true;
    }

    function beginAppNavigation(url) {
        transitionTiming = readRouteTransitionTiming();
        writePageArrivalState(url);
        showAppTransition();
        window.setTimeout(function () {
            window.location.href = url.href;
        }, transitionTiming.navigationDelayMs);
    }

    function initAppTransitions() {
        document.addEventListener("click", function (event) {
            var link = event.target.closest ? event.target.closest("a[href]") : null;
            var url;
            if (shouldTransitionLink(link, event)) {
                try {
                    url = new URL(link.href, window.location.href);
                } catch (err) {
                    return;
                }
                event.preventDefault();
                beginAppNavigation(url);
            }
        });

        window.addEventListener("pageshow", function () {
            document.documentElement.classList.remove("app-is-leaving");
        });
    }

    function escapeHtml(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v008.008.002/g, "&quot;")
            .replace(/'/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v008.008.002/g, "&#39;");
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

    function formatCurrencyMinor(amount, currency) {
        var value = Number(amount || 0) / 100;
        try {
            return new Intl.NumberFormat(undefined, {
                style: "currency",
                currency: String(currency || "usd").toUpperCase(),
                maximumFractionDigits: value % 1 ? 2 : 0
            }).format(value);
        } catch (err) {
            return "$" + value.toFixed(value % 1 ? 2 : 0);
        }
    }

    function formatLabel(value) {
        if (value == null || value === "") return "Not available";
        return String(value).replace(/_/g, " ");
    }

    function normalizePlan(value) {
        if (value == null || value === "") return "FREE";
        return String(value).replace(/\s+plan$/i, "").trim().toUpperCase();
    }

    function planLabel(plan) {
        return formatLabel(normalizePlan(plan)).replace(/\b\w/g, function (char) {
            return char.toUpperCase();
        });
    }

    function finiteLimit(value) {
        var number = Number(value);
        return Number.isFinite(number) && number >= 0 ? number : null;
    }

    function firstFiniteLimit(values) {
        for (var index = 0; index < values.length; index += 1) {
            var limit = finiteLimit(values[index]);
            if (limit !== null) return limit;
        }
        return null;
    }

    function isActiveApiKey(item) {
        return !!(item && item.active && !item.revoked_at);
    }

    function apiKeyRowRef(item, index) {
        if (item && item.id != null && item.id !== "") return "id:" + String(item.id);
        if (item && item.key_prefix) return "prefix:" + String(item.key_prefix);
        return "row:" + String(index || 0);
    }

    function clearSensitiveSessionState() {
        try {
            window.sessionStorage.removeItem(apiKeySecretStorageKey);
        } catch (err) {}
    }

    function looksLikeApiSecret(value) {
        var text = String(value || "").trim();
        return text.length >= 16 && !/\s/.test(text);
    }

    function extractApiKeySecret(source) {
        if (!source || typeof source !== "object") return "";
        if (source.api_key && typeof source.api_key === "object") {
            var nestedSecret = extractApiKeySecret(source.api_key);
            if (nestedSecret) return nestedSecret;
        }
        var candidates = [
            source.api_key,
            source.plaintext_key,
            source.raw_key,
            source.secret,
            source.token,
            source.value,
            source.key
        ];
        for (var index = 0; index < candidates.length; index += 1) {
            if (looksLikeApiSecret(candidates[index])) return String(candidates[index]).trim();
        }
        return "";
    }

    async function copyText(text) {
        if (!looksLikeApiSecret(text)) throw new Error("No API key value is available to copy.");
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return;
        }
        var textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand("copy");
        } finally {
            textarea.remove();
        }
    }

    function billingStatusLabel(billing) {
        var sub = billing && billing.subscription;
        return sub && sub.status ? sub.status.replace(/_/g, " ") : "Not connected";
    }

    function redirectToLogin() {
        var next = window.location.pathname || "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v008.008.002/pages/app/index.html";
        window.location.href = "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v008.008.002/pages/auth/login.html?next=" + encodeURIComponent(next);
    }

    async function requestJson(path, options) {
        var headers = Object.assign({ "Accept": "application/json" }, (options && options.headers) || {});
        var requestOptions = Object.assign({}, options || {});
        requestOptions.credentials = "include";
        requestOptions.headers = headers;
        var response = await fetch(API_BASE + path, requestOptions);
        var result = await response.json().catch(function () { return {}; });
        if (response.status === 401) {
            redirectToLogin();
            throw new Error("Session required.");
        }
        if (!response.ok || result.ok === false) {
            var detail = result.detail || result.error || "The request could not be completed.";
            if (detail && typeof detail === "object") {
                detail = detail.message || detail.error || JSON.stringify(detail);
            }
            var error = new Error(String(detail));
            error.status = response.status;
            error.payload = result;
            throw error;
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
                "<td>" + escapeHtml(item.model_profile || "smtpRS") + "</td>",
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
        var billingControls = billing.controls || {};
        setText("[data-user-name]", user.name || user.email);
        setText("[data-user-email]", user.email);
        setText("[data-tenant-name]", tenant.name);
        setText("[data-plan]", (tenant.plan || "FREE") + " plan");
        setText("[data-api-key-count]", apiKeys.active_count || 0);
        setText("[data-usage]", formatNumber(usage.month_to_date || 0));
        setText("[data-usage-limit]", usage.monthly_limit == null ? "Custom" : formatNumber(usage.monthly_limit));
        setText(
            "[data-limit]",
            usage.monthly_limit
                ? "of " + formatNumber(usage.monthly_limit) + " credits this billing period"
                : "Current billing period"
        );
        setText("[data-billing-status]", billingControls.headline || billingStatusLabel(billing));
        setText("[data-billing-note]", billingControls.state ? "Current billing state" : (billing.subscription ? "Subscription status" : "No Stripe subscription"));
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
            var data = await requestJson("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v008.008.002/v1/app/summary");
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
        } finally {
            hideAppTransition();
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
            var data = await requestJson("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v008.008.002/v1/app/usage");
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
        } finally {
            hideAppTransition();
        }
    }

    function apiKeyLimitFromData(data, plan) {
        var tenant = (data && (data.tenant || data.workspace || data.account)) || {};
        var limits = (data && (data.limits || data.entitlements)) || {};
        var explicitLimit = firstFiniteLimit([
            data && data.api_key_limit,
            data && data.active_api_key_limit,
            data && data.key_limit,
            data && data.max_api_keys,
            limits.api_keys,
            limits.active_api_keys,
            limits.max_api_keys,
            tenant.api_key_limit,
            tenant.active_api_key_limit,
            tenant.max_api_keys
        ]);
        if (explicitLimit !== null) return explicitLimit;
        return apiKeyPlanLimits[normalizePlan(plan)] == null ? null : apiKeyPlanLimits[normalizePlan(plan)];
    }

    function apiKeyPlanFromData(data, rows) {
        var tenant = (data && (data.tenant || data.workspace || data.account)) || {};
        var firstKey = rows && rows[0] ? rows[0] : {};
        return normalizePlan(
            (data && (data.plan || data.tier || data.current_plan)) ||
            tenant.plan ||
            tenant.tier ||
            firstKey.tier ||
            firstKey.plan ||
            "FREE"
        );
    }

    function apiKeyCreateReason(data, plan, activeCount, limit, disabledByPlan) {
        if (data && data.billing_required) {
            return "Complete billing for the " + planLabel(plan) + " plan before creating an API key.";
        }
        var detail = data && (
            data.create_disabled_reason ||
            data.api_key_create_reason ||
            data.reason ||
            data.detail
        );
        if (detail && typeof detail === "object") {
            detail = detail.message || detail.error || "";
        }
        if (detail) return String(detail);
        if (disabledByPlan) {
            return "You are out of active API keys for the " + planLabel(plan) +
                " plan (" + activeCount + " of " + limit + "). Revoke an existing key or upgrade before creating another.";
        }
        return "API key creation is not available for this workspace.";
    }

    function updateApiKeyCreateState(data) {
        var rows = Array.isArray(data && data.items) ? data.items : [];
        var activeCount = rows.filter(isActiveApiKey).length;
        var plan = apiKeyPlanFromData(data || {}, rows);
        var limit = apiKeyLimitFromData(data || {}, plan);
        var serverCanCreate = !(
            data &&
            (data.can_create === false ||
                data.can_create_api_key === false ||
                data.can_create_api_keys === false)
        );
        var disabledByPlan = limit !== null && activeCount >= limit;
        var disabled = disabledByPlan || !serverCanCreate;
        var limitText = limit === null ? "Custom" : activeCount + " / " + limit;
        var noteText = planLabel(plan) + " plan";
        var message = disabled ? apiKeyCreateReason(data || {}, plan, activeCount, limit, disabledByPlan) : "";
        var messageEl = $("[data-api-key-limit-message]");

        apiKeyCreateState = { disabled: disabled, message: message };
        setText("[data-api-key-plan-limit]", limitText);
        setText("[data-api-key-plan-note]", noteText);
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.hidden = !message;
        }
        var form = $("[data-create-api-key]");
        if (form) form.classList.toggle("is-plan-limited", disabled);
        syncApiKeyCreateButton(false);
    }

    function syncApiKeyCreateButton(submitting) {
        var button = $("[data-create-api-key-button]");
        if (!button) return;
        button.disabled = !!submitting || !!apiKeyCreateState.disabled;
        button.classList.toggle("is-disabled", !!apiKeyCreateState.disabled);
        button.title = apiKeyCreateState.disabled ? apiKeyCreateState.message : "";
    }

    function applyApiKeysData(data) {
        renderApiKeyRows(data && data.items);
        updateApiKeyCreateState(data || {});
    }

    function renderApiKeyRows(items) {
        var body = $("[data-api-key-rows]");
        var empty = $("[data-empty-keys]");
        if (!body) return;
        var rows = Array.isArray(items) ? items : [];
        apiKeyRowsByRef = {};
        body.innerHTML = rows.map(function (item, index) {
            var active = isActiveApiKey(item);
            var ref = apiKeyRowRef(item, index);
            var actions = [
                '<button class="table-action" type="button" data-edit-key="' + escapeHtml(item.id) +
                    '" data-key-ref="' + escapeHtml(ref) + '">Edit</button>'
            ];
            if (active) {
                actions.push('<button class="table-action" type="button" data-revoke-key="' + escapeHtml(item.id) + '">Revoke</button>');
            }
            apiKeyRowsByRef[ref] = item;
            return [
                "<tr>",
                "<td>" + escapeHtml(item.name || "API key") + "</td>",
                "<td><code>" + escapeHtml(item.key_prefix || "") + "</code></td>",
                "<td>" + escapeHtml(item.tier || "BASIC") + "</td>",
                "<td>" + (active ? "Active" : "Revoked") + "</td>",
                "<td>" + escapeHtml(formatDate(item.created_at)) + "</td>",
                '<td><div class="key-action-group">' + actions.join("") + "</div></td>",
                "</tr>"
            ].join("");
        }).join("");
        if (empty) empty.hidden = rows.length > 0;
    }

    async function loadApiKeys() {
        renderTableSkeleton("[data-api-key-rows]", 6, 4);
        var data = await requestJson("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v008.008.002/v1/app/api-keys");
        applyApiKeysData(data);
        setStatus("API keys loaded.", "success");
        return data;
    }

    function initCreateApiKeyForm() {
        var form = $("[data-create-api-key]");
        if (!form) return;
        form.addEventListener("submit", async function (event) {
            event.preventDefault();
            if (apiKeyCreateState.disabled) {
                setStatus(apiKeyCreateState.message || "API key creation is not available for this workspace.", "error");
                return;
            }
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            syncApiKeyCreateButton(true);
            setStatus("Creating API key.", "loading");
            try {
                var data = new FormData(form);
                var result = await requestJson("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v008.008.002/v1/app/api-keys", {
                    method: "POST",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ name: String(data.get("name") || "").trim() || "Production key" })
                });
                var secret = extractApiKeySecret(result);
                var box = $("[data-new-api-key]");
                var value = $("[data-new-api-key-value]");
                if (box && value) {
                    value.textContent = secret || "";
                    box.hidden = !secret;
                }
                var refreshed = await requestJson("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v008.008.002/v1/app/api-keys");
                applyApiKeysData(refreshed);
                setStatus(secret ? "API key created and ready to copy." : "API key created.", "success");
            } catch (err) {
                setStatus(err.message || "API key could not be created.", "error");
            } finally {
                syncApiKeyCreateButton(false);
            }
        });
    }

    function initApiKeyActions() {
        var renameModal = $("[data-api-key-rename-modal]");
        var renameForm = renameModal ? $("[data-api-key-rename-form]", renameModal) : null;
        var renameInput = renameModal ? $("[data-api-key-rename-input]", renameModal) : null;
        var renameSubmit = renameModal ? $("[data-api-key-rename-modal-confirm]", renameModal) : null;
        var renameCancelControls = renameModal ? $all("[data-api-key-rename-modal-cancel]", renameModal) : [];
        var renameLastFocusedElement = null;
        var renameKeyId = null;
        var revokeModal = $("[data-api-key-revoke-modal]");
        var revokeModalConfirm = revokeModal ? $("[data-api-key-revoke-modal-confirm]", revokeModal) : null;
        var revokeModalCancelControls = revokeModal ? $all("[data-api-key-revoke-modal-cancel]", revokeModal) : [];
        var revokeModalName = revokeModal ? $("[data-api-key-revoke-name]", revokeModal) : null;
        var revokeLastFocusedElement = null;

        function closeRenameDialog() {
            if (renameModal) renameModal.hidden = true;
            document.removeEventListener("keydown", handleRenameDialogKeydown);
            renameKeyId = null;
            if (renameLastFocusedElement && typeof renameLastFocusedElement.focus === "function") {
                renameLastFocusedElement.focus();
            }
            renameLastFocusedElement = null;
        }

        function handleRenameDialogKeydown(event) {
            if (event.key !== "Escape" || !renameModal || renameModal.hidden) return;
            event.preventDefault();
            closeRenameDialog();
        }

        function showRenameDialog(button) {
            if (!renameModal || !renameInput || !button) return;
            var ref = button.getAttribute("data-key-ref") || "";
            var item = apiKeyRowsByRef[ref] || {};
            renameKeyId = button.getAttribute("data-edit-key");
            if (!renameKeyId) return;
            renameInput.value = item.name || "API key";
            renameLastFocusedElement = document.activeElement;
            renameModal.hidden = false;
            document.addEventListener("keydown", handleRenameDialogKeydown);
            window.requestAnimationFrame(function () {
                renameInput.focus();
                renameInput.select();
            });
        }

        renameCancelControls.forEach(function (control) {
            control.addEventListener("click", closeRenameDialog);
        });

        if (renameForm) {
            renameForm.addEventListener("submit", async function (event) {
                event.preventDefault();
                if (!renameKeyId || !renameInput || !renameForm.checkValidity()) {
                    renameForm.reportValidity();
                    return;
                }
                var name = renameInput.value.trim();
                if (!name) {
                    renameInput.setCustomValidity("Enter a name for this API key.");
                    renameInput.reportValidity();
                    renameInput.setCustomValidity("");
                    return;
                }
                if (renameSubmit) renameSubmit.disabled = true;
                setStatus("Renaming API key.", "loading");
                try {
                    await requestJson("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v008.008.002/v1/app/api-keys/" + encodeURIComponent(renameKeyId), {
                        method: "PATCH",
                        headers: {
                            "Accept": "application/json",
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ name: name })
                    });
                    await loadApiKeys();
                    closeRenameDialog();
                    setStatus("API key renamed.", "success");
                } catch (err) {
                    setStatus(err.message || "API key could not be renamed.", "error");
                    renameInput.focus();
                } finally {
                    if (renameSubmit) renameSubmit.disabled = false;
                }
            });
        }

        function closeRevokeDialog(resolve, result) {
            if (revokeModal) revokeModal.hidden = true;
            document.removeEventListener("keydown", handleRevokeDialogKeydown);
            if (revokeLastFocusedElement && typeof revokeLastFocusedElement.focus === "function") {
                revokeLastFocusedElement.focus();
            }
            revokeLastFocusedElement = null;
            resolve(result);
        }

        function handleRevokeDialogKeydown(event) {
            if (event.key !== "Escape") return;
            var resolver = revokeModal && revokeModal._revokeDialogResolver;
            if (!resolver) return;
            event.preventDefault();
            revokeModal._revokeDialogResolver = null;
            closeRevokeDialog(resolver, false);
        }

        function showRevokeDialog(button) {
            return new Promise(function (resolve) {
                if (!revokeModal || !revokeModalConfirm) {
                    resolve(false);
                    return;
                }

                var row = button ? button.closest("tr") : null;
                var keyName = row && row.cells && row.cells[0] ? row.cells[0].textContent.trim() : "API key";
                if (revokeModalName) revokeModalName.textContent = keyName || "API key";
                revokeLastFocusedElement = document.activeElement;
                revokeModal.hidden = false;
                revokeModal._revokeDialogResolver = resolve;
                document.addEventListener("keydown", handleRevokeDialogKeydown);
                window.requestAnimationFrame(function () {
                    revokeModalConfirm.focus();
                });
            });
        }

        function resolveRevokeDialog(result) {
            if (!revokeModal || !revokeModal._revokeDialogResolver) return;
            var resolver = revokeModal._revokeDialogResolver;
            revokeModal._revokeDialogResolver = null;
            closeRevokeDialog(resolver, result);
        }

        if (revokeModalConfirm) {
            revokeModalConfirm.addEventListener("click", function () {
                resolveRevokeDialog(true);
            });
        }
        revokeModalCancelControls.forEach(function (control) {
            control.addEventListener("click", function () {
                resolveRevokeDialog(false);
            });
        });

        document.addEventListener("click", async function (event) {
            var newKeyButton = event.target.closest("[data-copy-new-api-key]");
            var editButton = event.target.closest("[data-edit-key]");
            var button = event.target.closest("[data-revoke-key]");
            if (newKeyButton) {
                var value = $("[data-new-api-key-value]");
                try {
                    await copyText(value ? value.textContent : "");
                    setStatus("API key copied.", "success");
                } catch (err) {
                    setStatus(err.message || "API key could not be copied.", "error");
                }
                return;
            }
            if (editButton) {
                showRenameDialog(editButton);
                return;
            }
            if (!button) return;
            var id = button.getAttribute("data-revoke-key");
            if (!id || !await showRevokeDialog(button)) {
                return;
            }
            button.disabled = true;
            setStatus("Revoking API key.", "loading");
            try {
                await requestJson("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v008.008.002/v1/app/api-keys/" + encodeURIComponent(id) + "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v008.008.002/revoke", { method: "POST" });
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
        clearSensitiveSessionState();
        initCreateApiKeyForm();
        initApiKeyActions();
        setStatus("Loading API keys.", "loading");
        try {
            await loadApiKeys();
        } catch (err) {
            renderApiKeyRows([]);
            setStatus(err.message || "API keys unavailable.", "error");
        } finally {
            hideAppTransition();
        }
    }

    function showBillingMessage(message) {
        var box = $("[data-billing-message]");
        var value = $("[data-billing-message-value]");
        if (box && value) {
            value.textContent = message || "";
            box.hidden = !message;
        }
    }

    function billingControlReason(reason) {
        var messages = {
            plan_review_required: "This plan requires approval before checkout.",
            subscription_managed_in_portal: "Manage the existing subscription in Stripe before starting another checkout.",
            missing_customer: "A Stripe billing account is created when checkout starts."
        };
        return messages[reason] || "";
    }

    function renderCreditGrants(items) {
        var body = $("[data-credit-grant-rows]");
        var empty = $("[data-empty-credit-grants]");
        if (!body) return;
        var rows = Array.isArray(items) ? items : [];
        body.innerHTML = rows.map(function (item) {
            return [
                "<tr>",
                "<td>" + escapeHtml(formatDate(item.created_at)) + "</td>",
                "<td>" + escapeHtml(formatLabel(item.source || "credit")) + "</td>",
                "<td>" + escapeHtml(formatNumber(item.credits || 0)) + "</td>",
                "<td>" + escapeHtml(formatLabel(item.status || "active")) + "</td>",
                "<td>" + escapeHtml(formatDate(item.expires_at)) + "</td>",
                "</tr>"
            ].join("");
        }).join("");
        if (empty) empty.hidden = rows.length > 0;
    }

    function renderCreditPacks(data) {
        var section = $("[data-credit-pack-section]");
        var list = $("[data-credit-pack-list]");
        if (!section || !list) return;
        var billing = data.billing || {};
        var controls = billing.controls || {};
        var packs = Array.isArray(data.credit_packs) ? data.credit_packs : [];
        var eligible = controls.state === "active" || controls.state === "canceling";
        section.hidden = !eligible || packs.length === 0;
        if (section.hidden) return;

        var credits = data.credits || {};
        setText("[data-credit-base]", credits.base_limit == null ? "Custom" : formatNumber(credits.base_limit));
        setText("[data-credit-purchased]", formatNumber(credits.purchased_credits || 0));
        setText("[data-credit-effective]", credits.effective_limit == null ? "Custom" : formatNumber(credits.effective_limit));
        setText("[data-credit-remaining]", credits.remaining == null ? "Custom" : formatNumber(credits.remaining));
        setText(
            "[data-credit-period-end]",
            credits.period && credits.period.end ? "Expires " + formatDate(credits.period.end) : "Current period"
        );

        list.innerHTML = packs.map(function (pack) {
            return [
                '<article class="credit-pack-row">',
                '<div class="credit-pack-copy">',
                "<strong>" + escapeHtml(pack.name) + "</strong>",
                "<span>" + escapeHtml(formatNumber(pack.credits)) + " credits</span>",
                "<p>" + escapeHtml(pack.description) + "</p>",
                "</div>",
                '<div class="credit-pack-action">',
                "<strong>" + escapeHtml(formatCurrencyMinor(pack.amount_cents, pack.currency)) + "</strong>",
                '<button class="btn btn-primary" type="button" data-credit-pack="' + escapeHtml(pack.code) + '">',
                '<i class="fa-solid fa-circle-plus" aria-hidden="true"></i><span>Buy credits</span>',
                "</button>",
                "</div>",
                "</article>"
            ].join("");
        }).join("");
        renderCreditGrants(data.credit_grants || []);
    }

    function renderBilling(data) {
        var tenant = data.tenant || {};
        var billing = data.billing || {};
        var sub = billing.subscription || null;
        var controls = billing.controls || {};
        setText("[data-current-plan]", tenant.plan || "FREE");
        setText("[data-subscription-status]", controls.headline || (sub ? billingStatusLabel(billing) : "No Stripe subscription"));
        setText("[data-period-end]", sub && sub.current_period_end ? formatDate(sub.current_period_end) : "Not available");
        setText("[data-cancel-status]", sub && sub.cancel_at_period_end ? "Cancels at period end" : "");
        showBillingMessage(controls.message || "");
        document.querySelectorAll("[data-checkout-plan]").forEach(function (button) {
            var plan = button.getAttribute("data-checkout-plan");
            var control = (controls.plans || {})[plan];
            if (control) {
                button.disabled = !control.enabled;
                button.textContent = control.label;
                button.title = billingControlReason(control.reason);
            } else {
                var reviewed = plan === "SCALE" || plan === "BUSINESS";
                if (!button.dataset.defaultLabel) button.dataset.defaultLabel = button.textContent;
                button.disabled = reviewed && tenant.plan !== plan;
                button.textContent = button.disabled ? "Review required" : button.dataset.defaultLabel;
                button.title = button.disabled ? "This plan requires approval before checkout." : "";
            }
        });
        var portalButton = $("[data-open-billing-portal]");
        var portalControl = controls.portal || null;
        if (portalButton && portalControl) {
            portalButton.disabled = !portalControl.enabled;
            portalButton.textContent = portalControl.label;
            portalButton.title = billingControlReason(portalControl.reason);
        }
        renderCreditPacks(data);
        setPanelLoading(".billing-summary-card", false);
    }

    async function initBillingPage() {
        if (!$("[data-billing-page]")) return;
        setStatus("Loading billing.", "loading");
        setPanelLoading(".billing-summary-card", true);
        async function loadBilling() {
            var data = await requestJson("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v008.008.002/v1/billing/status");
            renderBilling(data);
            return data;
        }

        try {
            await loadBilling();
            setStatus("Billing loaded.", "success");
        } catch (err) {
            setPanelLoading(".billing-summary-card", false);
            setText("[data-current-plan]", "Not available");
            setText("[data-subscription-status]", "Billing unavailable");
            setText("[data-period-end]", "Not available");
            setText("[data-cancel-status]", "");
            setStatus(err.message || "Billing unavailable.", "error");
        } finally {
            hideAppTransition();
        }

        document.querySelectorAll("[data-checkout-plan]").forEach(function (button) {
            button.addEventListener("click", async function () {
                var plan = button.getAttribute("data-checkout-plan");
                button.disabled = true;
                setStatus("Opening Stripe Checkout.", "loading");
                try {
                    var result = await requestJson("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v008.008.002/v1/billing/checkout", {
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

        document.addEventListener("click", async function (event) {
            var button = event.target.closest("[data-credit-pack]");
            if (!button) return;
            button.disabled = true;
            setStatus("Opening secure credit checkout.", "loading");
            try {
                var result = await requestJson("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v008.008.002/v1/billing/credit-packs/checkout", {
                    method: "POST",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ pack_code: button.getAttribute("data-credit-pack") })
                });
                if (!result.url) throw new Error("Stripe did not return a checkout URL.");
                window.location.href = result.url;
            } catch (err) {
                setStatus(err.message || "Credit checkout could not be started.", "error");
                showBillingMessage(err.message || "Credit checkout could not be started.");
                button.disabled = false;
            }
        });

        var portalButton = $("[data-open-billing-portal]");
        if (portalButton) {
            portalButton.addEventListener("click", async function () {
                portalButton.disabled = true;
                setStatus("Opening Stripe billing portal.", "loading");
                try {
                    var result = await requestJson("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v008.008.002/v1/billing/portal", { method: "POST" });
                    if (!result.url) throw new Error("Stripe did not return a portal URL.");
                    window.location.href = result.url;
                } catch (err) {
                    setStatus(err.message || "Billing portal could not be opened.", "error");
                    showBillingMessage(err.message || "Billing portal could not be opened.");
                    portalButton.disabled = false;
                }
            });
        }

        var returnState = new URLSearchParams(window.location.search).get("credit_pack");
        if (returnState === "success") {
            setStatus("Payment received. Confirming the new credit balance.", "loading");
            window.setTimeout(async function () {
                try {
                    await loadBilling();
                    setStatus("Credit balance updated.", "success");
                } catch (err) {
                    setStatus("Payment received. The balance will update after Stripe confirmation.", "loading");
                }
            }, 1800);
        } else if (returnState === "canceled") {
            setStatus("Credit purchase canceled. No charge was made.", "success");
        }
    }

    function initAccountDeletion() {
        var form = $("[data-delete-account-form]");
        if (!form) return;

        var acknowledgement = $("[data-delete-account-ack]", form);
        var confirmation = $("[data-delete-account-confirm]", form);
        var button = $("[data-delete-account-button]", form);
        var message = $("[data-delete-account-message]", form);
        var modal = $("[data-account-delete-modal]");
        var modalPanel = modal ? $(".app-confirm-panel", modal) : null;
        var modalConfirm = modal ? $("[data-account-delete-modal-confirm]", modal) : null;
        var modalCancelControls = modal ? $all("[data-account-delete-modal-cancel]", modal) : [];
        var requiredText = "DELETE";
        var lastFocusedElement = null;

        function closeDeleteDialog(resolve, result) {
            if (modal) modal.hidden = true;
            document.removeEventListener("keydown", handleDeleteDialogKeydown);
            if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
                lastFocusedElement.focus();
            }
            lastFocusedElement = null;
            resolve(result);
        }

        function handleDeleteDialogKeydown(event) {
            if (event.key !== "Escape") return;
            var resolver = modal && modal._deleteDialogResolver;
            if (!resolver) return;
            event.preventDefault();
            modal._deleteDialogResolver = null;
            closeDeleteDialog(resolver, false);
        }

        function showDeleteDialog() {
            return new Promise(function (resolve) {
                if (!modal || !modalPanel || !modalConfirm) {
                    resolve(false);
                    return;
                }

                lastFocusedElement = document.activeElement;
                modal.hidden = false;
                modal._deleteDialogResolver = resolve;
                document.addEventListener("keydown", handleDeleteDialogKeydown);
                window.requestAnimationFrame(function () {
                    modalConfirm.focus();
                });
            });
        }

        function resolveDeleteDialog(result) {
            if (!modal || !modal._deleteDialogResolver) return;
            var resolver = modal._deleteDialogResolver;
            modal._deleteDialogResolver = null;
            closeDeleteDialog(resolver, result);
        }

        function showDeleteMessage(text, state) {
            if (!message) return;
            message.hidden = false;
            message.textContent = text;
            message.classList.remove("is-success", "is-error", "is-loading");
            if (state) message.classList.add("is-" + state);
        }

        function syncDeleteButton() {
            if (!button) return;
            var confirmed = confirmation && confirmation.value.trim().toUpperCase() === requiredText;
            var accepted = acknowledgement && acknowledgement.checked;
            button.disabled = !(confirmed && accepted);
        }

        if (acknowledgement) acknowledgement.addEventListener("change", syncDeleteButton);
        if (confirmation) confirmation.addEventListener("input", syncDeleteButton);
        if (modalConfirm) {
            modalConfirm.addEventListener("click", function () {
                resolveDeleteDialog(true);
            });
        }
        modalCancelControls.forEach(function (control) {
            control.addEventListener("click", function () {
                resolveDeleteDialog(false);
            });
        });
        syncDeleteButton();

        form.addEventListener("submit", async function (event) {
            event.preventDefault();
            if (!button || button.disabled) return;
            if (!await showDeleteDialog()) return;

            button.disabled = true;
            form.classList.add("is-busy");
            setStatus("Checking billing and deleting account.", "loading");
            showDeleteMessage("Verifying billing and submitting account deletion.", "loading");

            try {
                await requestJson("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v008.008.002/v1/app/account", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ confirmation: requiredText })
                });
                clearSensitiveSessionState();
                try {
                    await requestJson("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v008.008.002/v1/auth/logout", { method: "POST" });
                } catch (err) {}
                showAppTransition();
                var loginUrl = new URL("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v008.008.002/pages/auth/login.html?account=deleted", window.location.href);
                writePageArrivalState(loginUrl);
                window.location.href = loginUrl.href;
            } catch (err) {
                var fallback = err && err.status === 404
                    ? "Account deletion is not enabled on this API deployment yet. No account data was changed."
                    : "Account deletion could not be completed.";
                var text = (err && err.message) || fallback;
                if (err && err.status === 404) text = fallback;
                setStatus(text, "error");
                showDeleteMessage(text, "error");
                form.classList.remove("is-busy");
                syncDeleteButton();
            }
        });
    }

    function initLogout() {
        document.querySelectorAll("[data-logout]").forEach(function (button) {
            button.addEventListener("click", async function () {
                button.disabled = true;
                showAppTransition();
                try {
                    await requestJson("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v008.008.002/v1/auth/logout", { method: "POST" });
                } catch (err) {
                    // A failed logout still sends the user back to sign in.
                }
                var loginUrl = new URL("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v008.008.002/pages/auth/login.html", window.location.href);
                writePageArrivalState(loginUrl);
                window.location.href = loginUrl.href;
            });
        });
    }

    initAppTransitions();
    if (cameFromPlatform()) clearAppTransitionNow();
    initLogout();
    initAccountDeletion();
    initDashboard();
    initUsagePage();
    initApiKeysPage();
    initBillingPage();
    if (!$("[data-app-dashboard]") && !$("[data-usage-page]") && !$("[data-api-keys-page]") && !$("[data-billing-page]")) {
        hideAppTransition();
    }
})();
