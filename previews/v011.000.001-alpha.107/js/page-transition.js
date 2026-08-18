/* ========================================================================== 
   File: page-transition.js
   Paravane Labs public page transitions
   ========================================================================== */

(function () {
    "use strict";

    var stateKey = "paravane-page-transition";
    var platformVisitedKey = "paravane-platform-visited";
    var transitionTtlMs = 15000;
    var arrivalSafetyMs = 5000;
    var routeLoaderFrameDurationMs = 120;
    var routeLoaderFrames = {
        dark: [
            "../../../shared/53/5379caf98dc03f58295f0478bbea0ec723e97bd443ddd5f4bfc6e946ae659fbe.svg",
            "../../../shared/39/3923b030634e2794db68f07b28613082370255f3c478a2c470dc429e34065440.svg",
            "../../../shared/92/92fdc67d3c9b32e088d84ea9f688d36fec17c19ac666babd7d11d14b68ac0883.svg",
            "../../../shared/81/8112244f5cbf981ee70cf8fb19c1be4b389621c299752058ffcf4fa89930f228.svg",
            "../../../shared/07/077bd53154b7b56f5cfe4ee96196ebd2f71ddfbdcf9ccff986afa7c442475071.svg",
            "../../../shared/74/74672dcdbdcd8ee20497f4b6d92f33cec13f4f86034d2a7c64a5c1b627065530.svg",
            "../../../shared/76/76010f0394048a52ec556035630d91c9204895f9c94f9fe83fb61d8fb9ecd180.svg"
        ],
        light: [
            "../../../shared/76/76010f0394048a52ec556035630d91c9204895f9c94f9fe83fb61d8fb9ecd180.svg",
            "../../../shared/32/32f95ab33901c5b3673014d6a099a2eb64a6a08886d253e8b75f97e51cc8a410.svg",
            "../../../shared/7a/7a99ec1693d4a5cf323e903cce10078291130bf33c35e3e29a30538fa1ec19f7.svg",
            "../../../shared/6a/6a4e3e2b34311dfe4d063877e5c9884da41643fe1e0f7568dd19ba2aa5dc53bd.svg",
            "../../../shared/22/22bc214ca99f35008f34c0fc8c8f3a020eb9bbab7562a5400fa2e742f0a14b72.svg",
            "../../../shared/cb/cbf843fcd47f864d97d926532b30a471a95893e6f376c47c5545e1e7e081ced0.svg",
            "../../../shared/53/5379caf98dc03f58295f0478bbea0ec723e97bd443ddd5f4bfc6e946ae659fbe.svg"
        ]
    };
    var leaving = false;
    var pageLeft = false;
    var arrivalFinished = false;
    var loaderTimer = null;
    var finalizeTimer = null;
    var arrivalSafetyTimer = null;
    var routeLoaderFrameTimer = null;

    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function isValidTheme(theme) {
        return theme === "dark" || theme === "light";
    }

    function activeRouteLoaderFrames() {
        var theme = document.documentElement.getAttribute("data-theme");
        return routeLoaderFrames[theme] || routeLoaderFrames.dark;
    }

    function stopRouteLoaderAnimation() {
        window.clearInterval(routeLoaderFrameTimer);
        routeLoaderFrameTimer = null;
    }

    function startRouteLoaderAnimation() {
        var frameNode = $(".page-route-svg-frame");
        var frames = activeRouteLoaderFrames();
        var frameIndex = 0;

        stopRouteLoaderAnimation();
        if (!frameNode || !frames.length) return;

        frameNode.src = frames[frameIndex];

        frames.forEach(function (framePath) {
            var frame = new Image();
            frame.src = framePath;
        });


        routeLoaderFrameTimer = window.setInterval(function () {
            frameIndex = (frameIndex + 1) % frames.length;
            frameNode.src = frames[frameIndex];
        }, routeLoaderFrameDurationMs);
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
        if (!pathname || pathname === "/") return "../index.html";
        return pathname.replace(/\/+$/, "") || "../index.html";
    }

    function isPlatformPath(pathname) {
        return normalizePath(pathname) === "../index.html";
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
            startedAt: Date.now(),
            theme: document.documentElement.getAttribute("data-theme")
        }));
    }

    function clearArrivalState() {
        storageRemove(stateKey);
    }

    function loaderNodes() {
        return {
            backdrop: $(".page-route-backdrop"),
            loader: $(".page-route-loader")
        };
    }

    function ensureLoader() {
        var nodes = loaderNodes();
        var backdrop = nodes.backdrop;
        var loader = nodes.loader;
        var host = document.body || document.documentElement;

        if (!host) return null;

        if (!backdrop) {
            backdrop = document.createElement("div");
            backdrop.className = "page-route-backdrop";
            backdrop.setAttribute("aria-hidden", "true");
            host.appendChild(backdrop);
        }

        if (!loader) {
            loader = document.createElement("div");
            loader.className = "page-route-loader";
            loader.setAttribute("aria-live", "polite");
            host.appendChild(loader);
        }

        loader.setAttribute("aria-label", "Loading");
        loader.innerHTML = '<img class="page-route-svg-frame" alt="" aria-hidden="true" />';

        backdrop.hidden = false;
        loader.hidden = false;
        return { backdrop: backdrop, loader: loader };
    }

    function showLoader() {
        if (pageLeft || arrivalFinished) return;
        ensureLoader();
        startRouteLoaderAnimation();
        document.documentElement.classList.add("site-loader-active");
    }

    function hideLoader(immediate) {
        var currentTiming = timing();
        var nodes = loaderNodes();
        var delay = immediate ? 0 : currentTiming.loaderFadeMs;

        stopRouteLoaderAnimation();
        document.documentElement.classList.remove("site-loader-active");
        window.clearTimeout(finalizeTimer);

        if (!nodes.backdrop && !nodes.loader) return;

        finalizeTimer = window.setTimeout(function () {
            if (document.documentElement.classList.contains("site-loader-active")) return;
            if (nodes.backdrop) nodes.backdrop.hidden = true;
            if (nodes.loader) nodes.loader.hidden = true;
        }, delay);
    }

    function scheduleLoader() {
        var currentTiming = timing();
        window.clearTimeout(loaderTimer);
        loaderTimer = window.setTimeout(showLoader, currentTiming.loaderDelayMs);
    }

    function showArrivalLoader() {
        window.clearTimeout(loaderTimer);
        showLoader();
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
        arrivalFinished = false;
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

        if (arrivalFinished) return;
        arrivalFinished = true;

        window.clearTimeout(loaderTimer);
        window.clearTimeout(arrivalSafetyTimer);
        hideLoader(false);
        clearArrivalState();

        window.requestAnimationFrame(function () {
            root.classList.remove("site-is-arriving", "site-is-leaving");
            root.classList.add("site-is-ready");
        });
    }

    function restoreArrivalTheme(state) {
        if (!state || !isValidTheme(state.theme)) return;

        if (window.ParavaneTheme && typeof window.ParavaneTheme.set === "function") {
            window.ParavaneTheme.set(state.theme, {
                silent: true,
                persist: false
            });
            return;
        }

        document.documentElement.setAttribute("data-theme", state.theme);
    }

    function initArrival() {
        var root = document.documentElement;
        var state = readArrivalState();
        var usePlatformStartupLoader = !!state && isPlatformPath(window.location.pathname);

        if (isPlatformPath(window.location.pathname) && platformHasBeenVisited()) {
            root.classList.add("site-platform-loader-skipped");
        }

        if (!state) {
            root.classList.add("site-is-ready");
            return;
        }

        restoreArrivalTheme(state);
        root.classList.add("site-transition-enabled", "site-is-arriving");

        if (usePlatformStartupLoader) {
            root.classList.remove("site-platform-loader-skipped");
        } else {
            showArrivalLoader();
        }

        arrivalSafetyTimer = window.setTimeout(finishArrival, arrivalSafetyMs);

        if (document.readyState === "complete") {
            finishArrival();
        } else {
            window.addEventListener("load", finishArrival, { once: true });
        }
    }

    function resetRestoredPage() {
        leaving = false;
        pageLeft = false;
        arrivalFinished = true;
        window.clearTimeout(loaderTimer);
        window.clearTimeout(arrivalSafetyTimer);
        hideLoader(true);
        clearArrivalState();
        document.documentElement.classList.remove("site-is-leaving", "site-is-arriving", "site-loader-active");
        document.documentElement.classList.add("site-is-ready");
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
            if (event.persisted) {
                resetRestoredPage();
            }
        });
    }

    initArrival();

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", bindNavigation, { once: true });
    } else {
        bindNavigation();
    }

    window.ParavanePageTransition = {
        begin: beginNavigation,
        isPlatformPath: isPlatformPath,
        platformHasBeenVisited: platformHasBeenVisited
    };
})();
