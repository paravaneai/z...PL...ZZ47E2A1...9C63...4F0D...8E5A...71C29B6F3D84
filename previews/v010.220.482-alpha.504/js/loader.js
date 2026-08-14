/* ==========================================================================
   File: loader.js
   Paravane startup loader
   ==========================================================================
   Plays the branded loader exactly once, then hands off to the page as soon
   as both the loader animation and the page load have completed.
========================================================================== */

(function () {
    'use strict';

    var loaderTiming = {
        dark: {
            // 7 GIF frames x 200ms = 1400ms.
            animationDurationMs: 1670,
            removalTransitionMs: 650
        },
        light: {
            // Legacy light loader: 15 frames = 2300ms total.
            // animationDurationMs: 2300,
            // removalTransitionMs: 650
            animationDurationMs: 1670,
            removalTransitionMs: 650         
        }
    };

    var platformVisitedKey = "paravane-platform-visited";
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

    if (hasSeenPlatform()) {
        document.documentElement.classList.add("site-platform-loader-skipped");

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', removeLoader);
        } else {
            removeLoader();
        }

        return;
    }

    markPlatformSeen();
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
