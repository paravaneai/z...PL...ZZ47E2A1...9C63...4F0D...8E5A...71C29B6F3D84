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
        "brand.favicon": "../../../shared/5c/5c0b22202097d2111076516815a4316e0be58467ac5161de9ee4ca1d0771e901.ico",

        "brand.wordmark": "../../../shared/02/02c14fb8f12f2de1620aae8c89e2a025036a24bed8dea8d040df51c67ee4c3ea.png",
        "brand.heroMark": "../../../shared/2f/2fbb30dde6353d85b496f4fe916315ad8349cd51edd7a8b11b9a6a731f5aeb9a.png",

        // "brand.loader.dark": "assets/gif/brand-logo-paravane-labs-animated-gradient-loop-black.gif",
        // "brand.loader.light": "assets/gif/brand-logo-paravane-labs-animated-gradient-loop-white.gif",
        "brand.loader.dark": "../../../shared/3d/3d4459a900b101744e214db20a94ee12c12255138b28dae6883b63926b458cdc.gif",
        "brand.loader.light": "../../../shared/36/36711ff3422b35db24f4058d4546f43f896d4fa13a4fe8f97b7a1e22bfa7164f.gif",        

        // "home.platformVisual.webp.dark": "assets/webp/ai-visualization-neural-signal-network-transparent-animation-vibrant.webp",
        // "home.platformVisual.webp.light": "assets/webp/ai-visualization-neural-signal-network-transparent-animation-vibrant-for-white.webp",
        "home.platformVisual.webp.dark": "../../../shared/cb/cb9d503fc03e66f7c10644173a58cc269167736cca89f8fc85a1de4c42c376d4.webp",
        "home.platformVisual.webp.light": "../../../shared/08/080318e1734dad232c356ce7c302e7bb71f5dab3bfb434f5c0ec553d530696f5.webp",        

        // "home.platformVisual.gif.dark": "assets/gif/animation-intelligence-neural-network-dark-transparent.gif",
        // "home.platformVisual.gif.light": "assets/gif/animation-intelligence-neural-network-white-transparent.gif",
        "home.platformVisual.gif.dark": "../../../shared/3b/3b0309db26c4795a8cb9c969f7411fa8e2369707387c5a5a7b1c581c0d13bcec.gif",
        "home.platformVisual.gif.light": "../../../shared/b2/b286d53c21135bb93f376912b488a76dbb1d0a4cef4fee4a5e859acce02c4df9.gif",

        // "neuralscore.hero.dark": "assets/gif/neuralscore-email-risk-intelligence-animated-loop-large-black.gif",
        // "neuralscore.hero.light": "assets/gif/neuralscore-email-risk-intelligence-animated-loop-large-white.gif"
        "neuralscore.hero.dark": "../../../shared/25/25141248c59084a2be55c72e717836f14bdf113b97b7d3867c1b3b0a3c6a1ea9.gif",
        "neuralscore.hero.light": "../../../shared/b4/b4fed8821ff512ca662ecaa33188af3721de4207544afeb813372c49549b0c94.gif"        
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

    function get(key) {
        return paths[key] || "";
    }

    function setAttrFromKey(element, keyAttr, targetAttr) {
        var key = element.getAttribute(keyAttr);
        var value = get(key);

        if (value) {
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
                document.documentElement.style.setProperty(variableName, "url('/" + value + "')");
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
