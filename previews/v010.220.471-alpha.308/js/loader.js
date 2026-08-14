/* ==========================================================================
   File: loader.js
   Paravane Labs page loader
   ==========================================================================
   Shows the full-screen Paravane Labs GIF loader, then fades it out once the
   page has fully loaded.
========================================================================== */

(function () {
    'use strict';

    var loaderTiming = {
        dark: {
            // minimumDisplayMs: 3000,
            minimumDisplayMs: 1700,            
            removalTransitionMs: 700
        },
        light: {
            // minimumDisplayMs: 3000,
            minimumDisplayMs: 1700,            
            removalTransitionMs: 700
        }
    };
    var platformVisitedKey = "paravane-platform-visited";

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

    function hideLoader() {
        var overlay = document.querySelector('.animationload');
        var timing = currentTiming();

        if (!overlay) {
            return;
        }

        window.setTimeout(function () {
            overlay.classList.add('is-hidden');

            window.setTimeout(function () {
                if (overlay && overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, timing.removalTransitionMs);
        }, timing.minimumDisplayMs);
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

    if (document.readyState === 'complete') {
        hideLoader();
    } else {
        window.addEventListener('load', hideLoader);
    }
}());
