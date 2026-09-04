/* ==========================================================================
   File: loader.js
   Paravane startup loader
   Plays the branded loader exactly once, then hands off to the page as soon
   as both the loader animation and the page load have completed.

   true  => show loader only for first visit per browser storage
   false => show loader on every page load
========================================================================== */

(function () {
    'use strict';

    var loaderTiming = {
        dark: {
            animationDurationMs: 1670,
            removalTransitionMs: 650
        },
        light: {
            animationDurationMs: 1670,
            removalTransitionMs: 650
        }
    };

    // true  => show loader only for first visit per browser storage
    // false => show loader on every page load
    var showLoaderOnlyOnce = false;

    var platformVisitedKey = "paravane-platform-visited";
    var pageTransitionStateKey = "paravane-page-transition";
    var pageTransitionTtlMs = 15000;
    var animationFinished = false;
    var pageFinished = document.readyState === 'complete';
    var finishStarted = false;
    var animationTimer = null;

    function hasSeenPlatform() {
        try {
            return window.localStorage.getItem(platformVisitedKey) === "1";
        } catch (err) {
            return false;
        }
    }

    function markPlatformSeen() {
        try {
            window.localStorage.setItem(platformVisitedKey, "1");
        } catch (err) {}
    }

    function currentTheme() {
        var theme = document.documentElement.getAttribute("data-theme");
        return theme === "light" ? "light" : "dark";
    }

    function currentTiming() {
        return loaderTiming[currentTheme()] || loaderTiming.dark;
    }

    function isPlatformPage() {
        return window.location.pathname === "/" || window.location.pathname === "../index.html";
    }

    function hasActiveRouteArrival() {
        var raw;
        var state;
        var currentTarget = window.location.origin + window.location.pathname + window.location.search;

        try {
            raw = window.sessionStorage.getItem(pageTransitionStateKey);
            if (!raw) return false;
            state = JSON.parse(raw);
        } catch (err) {
            return false;
        }

        return !!(
            state &&
            state.target === currentTarget &&
            state.startedAt &&
            Date.now() - state.startedAt <= pageTransitionTtlMs
        );
    }

    function removeLoader() {
        var overlay = document.querySelector('.animationload');

        if (overlay && overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
    }

    function finishLoader() {
        var overlay = document.querySelector('.animationload');
        var timing = currentTiming();

        if (finishStarted || !overlay) {
            return;
        }

        finishStarted = true;
        overlay.classList.add('is-hidden');

        window.setTimeout(function () {
            if (overlay && overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, timing.removalTransitionMs);
    }

    function tryToFinish() {
        if (!animationFinished || !pageFinished) {
            return;
        }

        finishLoader();
    }

    function startAnimationClock() {
        var timing = currentTiming();

        window.clearTimeout(animationTimer);
        animationTimer = window.setTimeout(function () {
            animationFinished = true;
            tryToFinish();
        }, timing.animationDurationMs);
    }

    window.ParavaneLoader = {
        timing: loaderTiming
    };

    if (hasActiveRouteArrival() && !isPlatformPage()) {
        document.documentElement.classList.add("site-platform-loader-skipped");

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', removeLoader, { once: true });
        } else {
            removeLoader();
        }

        return;
    }

    if (showLoaderOnlyOnce && hasSeenPlatform()) {
        document.documentElement.classList.add("site-platform-loader-skipped");

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', removeLoader);
        } else {
            removeLoader();
        }

        return;
    }

    if (showLoaderOnlyOnce) {
        markPlatformSeen();
    }

    startAnimationClock();

    if (pageFinished) {
        tryToFinish();
    } else {
        window.addEventListener('load', function () {
            pageFinished = true;
            tryToFinish();
        }, { once: true });
    }
}());
