/* ==========================================================================
   File: loader.js
   Paravane Labs page loader
   ==========================================================================
   Shows the full-screen Paravane Labs GIF loader on a black background, then
   fades it out once the page has fully loaded.
========================================================================== */

(function () {
    'use strict';

    // var minimumDisplayMs = 1000;
    var minimumDisplayMs = 3000;    

    function hideLoader() {
        var overlay = document.querySelector('.animationload');

        if (!overlay) {
            return;
        }

        window.setTimeout(function () {
            overlay.classList.add('is-hidden');

            window.setTimeout(function () {
                if (overlay && overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 700);
        }, minimumDisplayMs);
    }

    if (document.readyState === 'complete') {
        hideLoader();
    } else {
        window.addEventListener('load', hideLoader);
    }
}());
