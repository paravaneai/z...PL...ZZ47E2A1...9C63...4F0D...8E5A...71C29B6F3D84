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

    function currentTheme() {
        var theme = document.documentElement.getAttribute("data-theme");
        return theme === "light" ? "light" : "dark";
    }

    function currentTiming() {
        return loaderTiming[currentTheme()] || loaderTiming.dark;
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

    if (document.readyState === 'complete') {
        hideLoader();
    } else {
        window.addEventListener('load', hideLoader);
    }

    window.ParavaneLoader = {
        timing: loaderTiming
    };
}());
