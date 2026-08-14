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
    var routeLoaderFrameDurationMs = 180;
    var routeLoaderFrames = {
        dark: [
            "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/shared/a4/a464982dfc7fcff78e473390878a6c08366961329cbd5e40873f6825a9ec12e7.svg",
            "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/shared/88/8823041f19a147c4f6f2a296b8ae8d581932ee2af20dbe48c08302de75fbf865.svg",
            "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/shared/03/03be89191b32cd5a4f2351626b34bff1a12a129aa0508961aed663b284de1cf9.svg",
            "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/shared/3f/3f0f539b5b93d08b49e217952ea8a32890a2587ee83fccacc3c067aa671d9365.svg",
            "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/shared/f3/f37c7698d266204e9c2a105b17de2fa7501fe5a328622aac40577ce05a72641e.svg",
            "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/shared/09/092d5c9dbe3359448b772a990caa3ff67c5319564d16fccfcb561de5033da98e.svg",
            "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/shared/49/496fb232594cc7e0eb64471b0d0dbd01866047ca1845e2dde8855e385bc8d1bf.svg"
        ],
        light: [
            "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/shared/49/496fb232594cc7e0eb64471b0d0dbd01866047ca1845e2dde8855e385bc8d1bf.svg",
            "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/shared/25/25c65b9dd5c2b3440798b000dd5264cb913920c7737e2820f64c3f72f9671fff.svg",
            "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/shared/7b/7bcce4d836222bb9ecbe095129e3bedc92ad51879e3fe9b9ab91a6d0c5a170b2.svg",
            "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/shared/34/348da86a0a85e4da7cbcb1f0453823b134d41f636e5d108b3cba931409275ef2.svg",
            "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/shared/ae/aec276cb4d877b1df929ed8ae8251298b7b4346c4b9d07ff0797c9ccd3dcbd4e.svg",
            "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/shared/3e/3e25d33f547d6762a38d65a2db2f47c7b47c0e5af740f0a10764bcea2c912dca.svg",
            "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/shared/a4/a464982dfc7fcff78e473390878a6c08366961329cbd5e40873f6825a9ec12e7.svg"
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
        var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        stopRouteLoaderAnimation();
        if (!frameNode || !frames.length) return;

        frameNode.src = frames[frameIndex];

        frames.forEach(function (framePath) {
            var frame = new Image();
            frame.src = framePath;
        });

        if (reducedMotion) return;

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
        if (!pathname || pathname === "/") return "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v011.000.001-alpha.105/index.html";
        return pathname.replace(/\/+$/, "") || "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v011.000.001-alpha.105/index.html";
    }

    function isPlatformPath(pathname) {
        return normalizePath(pathname) === "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v011.000.001-alpha.105/index.html";
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
            document.body.appendChild(loader);
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

        if (isPlatformPath(window.location.pathname) && platformHasBeenVisited()) {
            root.classList.add("site-platform-loader-skipped");
        }

        if (!state) {
            root.classList.add("site-is-ready");
            return;
        }

        restoreArrivalTheme(state);
        root.classList.add("site-transition-enabled", "site-is-arriving");
        scheduleLoader();

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
