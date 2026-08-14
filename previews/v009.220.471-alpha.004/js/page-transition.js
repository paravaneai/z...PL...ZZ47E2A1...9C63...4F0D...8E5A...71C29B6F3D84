/* ==========================================================================
   File: page-transition.js
   Paravane Labs public page transitions
   ========================================================================== */

(function () {
    "use strict";

    var stateKey = "paravane-page-transition";
    var platformVisitedKey = "paravane-platform-visited";
    var transitionTtlMs = 15000;
    var leaving = false;
    var pageLeft = false;
    var loaderTimer = null;
    var finalizeTimer = null;

    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function transitionMilliseconds(name, fallback) {
        var raw = window.getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        var value = parseFloat(raw);
        if (!raw || !isFinite(value)) return fallback;
        if (/s$/i.test(raw) && !/ms$/i.test(raw)) return value * 1000;
        return value;
    }

    function timing() {
        return {
            outMs: transitionMilliseconds("--page-transition-out-ms", 280),
            loaderDelayMs: transitionMilliseconds("--page-transition-loader-delay-ms", 320),
            loaderFadeMs: transitionMilliseconds("--page-transition-loader-fade-ms", 360)
        };
    }

    function storageGet(key) {
        try {
            return window.sessionStorage.getItem(key);
        } catch (err) {
            return "";
        }
    }

    function storageSet(key, value) {
        try {
            window.sessionStorage.setItem(key, value);
        } catch (err) {}
    }

    function storageRemove(key) {
        try {
            window.sessionStorage.removeItem(key);
        } catch (err) {}
    }

    function localGet(key) {
        try {
            return window.localStorage.getItem(key);
        } catch (err) {
            return "";
        }
    }

    function normalizePath(pathname) {
        if (!pathname || pathname === "/") return "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v009.220.471-alpha.004/index.html";
        return pathname.replace(/\/+$/, "") || "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v009.220.471-alpha.004/index.html";
    }

    function isPlatformPath(pathname) {
        return normalizePath(pathname) === "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v009.220.471-alpha.004/index.html";
    }

    function platformHasBeenVisited() {
        return localGet(platformVisitedKey) === "1";
    }

    function currentUrlNoHash() {
        return window.location.origin + window.location.pathname + window.location.search;
    }

    function targetUrlNoHash(url) {
        return url.origin + url.pathname + url.search;
    }

    function readArrivalState() {
        var raw = storageGet(stateKey);
        var parsed;

        if (!raw) return null;

        try {
            parsed = JSON.parse(raw);
        } catch (err) {
            storageRemove(stateKey);
            return null;
        }

        if (!parsed || !parsed.target || !parsed.startedAt) {
            storageRemove(stateKey);
            return null;
        }

        if (Date.now() - parsed.startedAt > transitionTtlMs) {
            storageRemove(stateKey);
            return null;
        }

        if (parsed.target !== currentUrlNoHash()) {
            storageRemove(stateKey);
            return null;
        }

        return parsed;
    }

    function writeArrivalState(url) {
        storageSet(stateKey, JSON.stringify({
            target: targetUrlNoHash(url),
            startedAt: Date.now()
        }));
    }

    function clearArrivalState() {
        storageRemove(stateKey);
    }

    function ensureLoader() {
        var backdrop = $(".page-route-backdrop");
        var loader = $(".page-route-loader");

        if (!document.body) return null;

        if (!backdrop) {
            backdrop = document.createElement("div");
            backdrop.className = "page-route-backdrop";
            backdrop.setAttribute("aria-hidden", "true");
            document.body.appendChild(backdrop);
        }

        if (!loader) {
            loader = document.createElement("div");
            loader.className = "page-route-loader";
            loader.setAttribute("aria-live", "polite");
            loader.setAttribute("aria-label", "Loading page");
            loader.innerHTML = '<span class="page-route-spinner" aria-hidden="true"></span><span>Loading page</span>';
            document.body.appendChild(loader);
        }

        backdrop.hidden = false;
        loader.hidden = false;
        return { backdrop: backdrop, loader: loader };
    }

    function showLoader() {
        if (pageLeft) return;
        ensureLoader();
        document.documentElement.classList.add("site-loader-active");
    }

    function hideLoader() {
        var currentTiming = timing();
        var nodes = ensureLoader();

        document.documentElement.classList.remove("site-loader-active");

        if (!nodes) return;

        window.clearTimeout(finalizeTimer);
        finalizeTimer = window.setTimeout(function () {
            if (!document.documentElement.classList.contains("site-loader-active")) {
                if (nodes.backdrop) nodes.backdrop.hidden = true;
                if (nodes.loader) nodes.loader.hidden = true;
            }
        }, currentTiming.loaderFadeMs);
    }

    function scheduleLoader() {
        var currentTiming = timing();
        window.clearTimeout(loaderTimer);
        loaderTimer = window.setTimeout(showLoader, currentTiming.loaderDelayMs);
    }

    function isEligibleUrl(url) {
        if (url.origin !== window.location.origin) return false;
        if (!/\.html$/i.test(url.pathname) && url.pathname !== "/") return false;
        if (url.pathname === window.location.pathname && url.search === window.location.search) return false;
        return true;
    }

    function shouldTransitionLink(link, event) {
        var href = link && link.getAttribute("href");
        var url;

        if (!link || event.defaultPrevented || event.button !== 0) return false;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
        if (link.target && link.target !== "_self") return false;
        if (link.hasAttribute("download")) return false;
        if (!href || href.charAt(0) === "#") return false;
        if (/^(mailto|tel|sms|javascript):/i.test(href)) return false;

        try {
            url = new URL(link.href, window.location.href);
        } catch (err) {
            return false;
        }

        if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) {
            return false;
        }

        return isEligibleUrl(url);
    }

    function beginNavigation(url) {
        var currentTiming = timing();

        if (leaving) return;
        leaving = true;
        pageLeft = false;
        writeArrivalState(url);
        window.clearTimeout(loaderTimer);

        document.documentElement.classList.remove("site-is-ready", "site-is-arriving");
        document.documentElement.classList.add("site-transition-enabled", "site-is-leaving");

        window.setTimeout(function () {
            scheduleLoader();
            window.location.href = url.href;
        }, currentTiming.outMs);
    }

    function finishArrival() {
        var root = document.documentElement;

        window.clearTimeout(loaderTimer);
        hideLoader();
        clearArrivalState();

        window.requestAnimationFrame(function () {
            root.classList.remove("site-is-arriving", "site-is-leaving");
            root.classList.add("site-is-ready");
        });
    }

    function initArrival() {
        var root = document.documentElement;
        var state = readArrivalState();

        if (isPlatformPath(window.location.pathname) && platformHasBeenVisited()) {
            root.classList.add("site-platform-loader-skipped");
        }

        if (!state) return;

        root.classList.add("site-transition-enabled", "site-is-arriving");
        scheduleLoader();

        if (document.readyState === "complete") {
            finishArrival();
        } else {
            window.addEventListener("load", finishArrival, { once: true });
        }
    }

    function bindNavigation() {
        document.addEventListener("click", function (event) {
            var link = event.target.closest ? event.target.closest("a[href]") : null;
            var url;

            if (!shouldTransitionLink(link, event)) return;

            try {
                url = new URL(link.href, window.location.href);
            } catch (err) {
                return;
            }

            event.preventDefault();
            beginNavigation(url);
        });

        window.addEventListener("pagehide", function () {
            pageLeft = true;
        });

        window.addEventListener("pageshow", function (event) {
            if (!event.persisted) return;
            leaving = false;
            pageLeft = false;
            window.clearTimeout(loaderTimer);
            hideLoader();
            document.documentElement.classList.remove("site-is-leaving", "site-is-arriving", "site-loader-active");
            document.documentElement.classList.add("site-is-ready");
        });
    }

    initArrival();

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", bindNavigation);
    } else {
        bindNavigation();
    }

    window.ParavanePageTransition = {
        begin: beginNavigation,
        isPlatformPath: isPlatformPath,
        platformHasBeenVisited: platformHasBeenVisited
    };
})();
