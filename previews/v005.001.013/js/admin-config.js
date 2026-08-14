/* ==========================================================================
   Paravane Labs admin console configuration

   Set isolateFromPublicSite to false to show the public-site logo/navigation
   inside admin pages again.
   ========================================================================== */

(function () {
    "use strict";

    var defaults = {
        isolateFromPublicSite: true
    };

    window.PARAVANE_ADMIN_CONFIG = Object.assign({}, defaults, window.PARAVANE_ADMIN_CONFIG || {});

    if (window.PARAVANE_ADMIN_CONFIG.isolateFromPublicSite) {
        document.documentElement.classList.add("admin-public-site-isolated");
    } else {
        document.documentElement.classList.remove("admin-public-site-isolated");
    }
})();
