/* ==========================================================================
   File: image-config.js
   Paravane Labs image registry
   ==========================================================================
   Update image paths here first. HTML elements can reference these keys with:
   - data-image-src="brand.wordmark"
   - data-image-href="brand.favicon"
   - data-image-srcset="home.platformVisual.webp.dark"
   - data-theme-src-dark-key="..."
   - data-theme-src-light-key="..."
   - data-theme-srcset-dark-key="..."
   - data-theme-srcset-light-key="..."

   To force animated GIFs instead of animated WebP for configured format groups,
   change preferredAnimationFormat from "webp" to "gif".
========================================================================== */

(function () {
    "use strict";

    var settings = {
        // preferredAnimationFormat: "webp"
        preferredAnimationFormat: "gif"        
    };

    var paths = {
        "brand.favicon": "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/shared/b4/b47d8a12345bdbf064f0de8351c8ff55b0c87d6eec4e283d71a72b3fa8e150eb.ico",

        "brand.wordmark": "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/shared/53/5324d7fe22bb243f1b8198e1552ef6818428086c753da78222be42bdeccddd26.png",
        "brand.heroMark": "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/shared/53/5324d7fe22bb243f1b8198e1552ef6818428086c753da78222be42bdeccddd26.png",
        "email.brandmark": "https://paravane.io/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/shared/53/5324d7fe22bb243f1b8198e1552ef6818428086c753da78222be42bdeccddd26.png",

        "brand.loader.dark": "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/shared/5e/5e738c67bf6e52f14d67871b57832a1eabae299cf71e1da13a1a2f778c99714c.gif",
        "brand.loader.light": "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/shared/ac/ac39c48bd5bde593c38e8c876e1181c76458102461a31b7919aeedb1a6110661.gif",        

        "home.platformVisual.webp.dark": "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v010.220.482-alpha.500/assets/webp/transparent/ai-visualization-neural-signal-network-transparent-animation-vibrant.webp",
        "home.platformVisual.webp.light": "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v010.220.482-alpha.500/assets/webp/opaque/ai-visualization-neural-signal-network-transparent-animation-vibrant-for-white.webp",        

        "home.platformVisual.gif.dark": "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v010.220.482-alpha.500/assets/gif/transparent/ai-visualization-neural-signal-network-animation-vibrant-transparent.gif",
        "home.platformVisual.gif.light": "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v010.220.482-alpha.500/assets/gif/opaque/ai-visualization-neural-signal-network-animation-vibrant-on-white.gif",

        "smtprs.hero.dark": "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v010.220.482-alpha.500/assets/gif/opaque/smtprs-email-risk-intelligence-animated-loop-large-black-lossy.gif",
        "smtprs.hero.light": "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v010.220.482-alpha.500/assets/gif/opaque/smtprs-email-risk-intelligence-animated-loop-large-white-lossy.gif"      
    };

    var formatGroups = {
        "home.platformVisual": {
            webp: {
                dark: "home.platformVisual.webp.dark",
                light: "home.platformVisual.webp.light"
            },
            gif: {
                dark: "home.platformVisual.gif.dark",
                light: "home.platformVisual.gif.light"
            }
        }
    };

    var cssVariables = {
        "--image-loader-logo-dark": "brand.loader.dark",
        "--image-loader-logo-light": "brand.loader.light"
    };

    function normalizePath(value) {
        if (!value) {
            return "";
        }
        if (/^(?:[a-z]+:|\/\/|#|data:|mailto:|tel:)/i.test(value) || value.charAt(0) === "/") {
            return value;
        }
        return "/" + value;
    }

    function get(key) {
        return normalizePath(paths[key] || "");
    }

    function setAttrFromKey(element, keyAttr, targetAttr) {
        var key = element.getAttribute(keyAttr);
        var value = get(key);

        if (value && element.getAttribute(targetAttr) !== value) {
            element.setAttribute(targetAttr, value);
        }
    }

    function preferredAnimationFormat() {
        return settings.preferredAnimationFormat === "gif" ? "gif" : "webp";
    }

    function applyCssVariables() {
        Object.keys(cssVariables).forEach(function (variableName) {
            var value = get(cssVariables[variableName]);

            if (value) {
                document.documentElement.style.setProperty(variableName, "url('" + value + "')");
            }
        });
    }

    function applyFormatPreferences(scope) {
        var format = preferredAnimationFormat();

        scope.querySelectorAll("[data-image-format-group]").forEach(function (element) {
            var groupName = element.getAttribute("data-image-format-group");
            var elementFormat = element.getAttribute("data-image-format");
            var group = formatGroups[groupName];

            if (!group || !group[format]) {
                return;
            }

            if (element.tagName.toLowerCase() === "source") {
                if (elementFormat === format) {
                    element.setAttribute("data-theme-srcset-dark", get(group[format].dark));
                    element.setAttribute("data-theme-srcset-light", get(group[format].light));
                    element.setAttribute("type", "image/" + format);
                } else {
                    element.removeAttribute("srcset");
                    element.removeAttribute("data-theme-srcset-dark");
                    element.removeAttribute("data-theme-srcset-light");
                }
            } else if (elementFormat === "gif") {
                element.setAttribute("data-theme-src-dark", get(group.gif.dark));
                element.setAttribute("data-theme-src-light", get(group.gif.light));
            }
        });
    }

    function apply(root) {
        var scope = root || document;

        scope.querySelectorAll("[data-image-src]").forEach(function (element) {
            setAttrFromKey(element, "data-image-src", "src");
        });

        scope.querySelectorAll("[data-image-href]").forEach(function (element) {
            setAttrFromKey(element, "data-image-href", "href");
        });

        scope.querySelectorAll("[data-image-srcset]").forEach(function (element) {
            setAttrFromKey(element, "data-image-srcset", "srcset");
        });

        scope.querySelectorAll("[data-theme-src-dark-key]").forEach(function (element) {
            setAttrFromKey(element, "data-theme-src-dark-key", "data-theme-src-dark");
        });

        scope.querySelectorAll("[data-theme-src-light-key]").forEach(function (element) {
            setAttrFromKey(element, "data-theme-src-light-key", "data-theme-src-light");
        });

        scope.querySelectorAll("[data-theme-srcset-dark-key]").forEach(function (element) {
            setAttrFromKey(element, "data-theme-srcset-dark-key", "data-theme-srcset-dark");
        });

        scope.querySelectorAll("[data-theme-srcset-light-key]").forEach(function (element) {
            setAttrFromKey(element, "data-theme-srcset-light-key", "data-theme-srcset-light");
        });

        applyFormatPreferences(scope);
    }

    applyCssVariables();

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function () {
            apply(document);
        });
    } else {
        apply(document);
    }

    window.ParavaneImages = {
        get: get,
        apply: apply,
        settings: settings,
        paths: paths
    };
})();
