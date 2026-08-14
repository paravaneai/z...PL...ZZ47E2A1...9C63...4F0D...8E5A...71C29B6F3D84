/**
 * Paravane global theme and brand registry.
 *
 * This static site is a Webflow-style HTML/CSS export, so there is no build
 * system to compile a TypeScript or Tailwind theme. This single runtime config
 * file is loaded by every HTML page. It injects the global :root CSS variables
 * and applies the logo/favicon registry to shared page elements.
 *
 * How to update the site globally later:
 * 1. Change colors in THEME.colors below.
 * 2. Change logo filenames/paths in THEME.logos below.
 * 3. Keep logo files inside /assets/logos/ unless you also update paths here.
 * 4. Add data-theme-logo="primary|secondary|dark|light|icon|favicon|socialPreview"
 *    to any new <img> that should be controlled by this registry.
 */
(function applyParavaneTheme(window, document) {
    "use strict";

    var scriptUrl = new URL(
        (document.currentScript && document.currentScript.getAttribute("src")) || "theme/paravane-theme.js",
        window.location.href
    );
    var siteRootUrl = new URL("../", scriptUrl);

    function asset(path) {
        return new URL(String(path).replace(/^\/+/, ""), siteRootUrl).href;
    }

    var THEME = {
        brand: {
            companyName: "Paravane",
            displayName: "Paravane",
            legalName: "Paravane",
            shortName: "Paravane"
        },

        colors: {
            primary: "#F7601C",
            primaryHover: "#DC773D",
            primarySoft: "#FFF3E6",
            secondary: "#FDB91D",
            secondarySoft: "#FFE0A6",
            accent: "#FD8C1E",
            accentDeep: "#5A2608",
            background: "#FAFCFD",
            backgroundMuted: "#F5F8FA",
            backgroundSoft: "#F7F7FF",
            surface: "#FFFFFF",
            surfaceDark: "#21292E",
            text: "#1B2226",
            textMuted: "#38464F",
            textSubtle: "#6F7E87",
            textInverse: "#FAFCFD",
            border: "#E3EBF0",
            borderLight: "#EBF1F5",
            borderMuted: "#A6B4BD",
            success: "#1CC67E",
            warning: "#FDB91D",
            danger: "#F74A13"
        },

        buttons: {
            primaryBg: "#F7601C",
            primaryText: "#1B2226",
            primaryHoverBg: "#DC773D",
            secondaryBg: "#FDB91D",
            secondaryText: "#1B2226",
            ghostHoverBg: "#FFF3E6"
        },

        gradients: {
            brand: "linear-gradient(135deg, #F7601C 0%, #FD8C1E 48%, #FDB91D 100%)",
            brandVertical: "linear-gradient(180deg, #F47B28 0%, #DC773D 100%)"
        },

        shadows: {
            sm: "0 4px 12px rgba(27, 34, 38, 0.08)",
            md: "0 12px 32px rgba(27, 34, 38, 0.12)",
            brandGlow: "0 16px 48px rgba(247, 96, 28, 0.22)"
        },

        fonts: {
            body: "Matter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            heading: "Matter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            mono: "Abcfavoritmono, Inconsolata, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
        },

        spacing: {
            xs: "4px",
            sm: "8px",
            md: "16px",
            lg: "24px",
            xl: "32px",
            xxl: "48px"
        },

        radii: {
            sm: "4px",
            md: "8px",
            lg: "16px",
            pill: "999px"
        },

        logos: {
            primary: {
                path: "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/shared/ca/cac0ae6c7817e9eef91d11f5a08dc56dfe6bd70859e5e58d9a3bc61c4c2b7082.svg",
                displayName: "Paravane primary logo",
                alt: "Paravane logo"
            },
            secondary: {
                path: "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/shared/43/43c5512f12c07b377557011725253faab0ed81602cdc3df0a4827af82230a26d.svg",
                displayName: "Paravane secondary logo",
                alt: "Paravane logo"
            },
            dark: {
                path: "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/shared/43/43c5512f12c07b377557011725253faab0ed81602cdc3df0a4827af82230a26d.svg",
                displayName: "Paravane dark logo",
                alt: "Paravane logo"
            },
            light: {
                path: "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/shared/ca/cac0ae6c7817e9eef91d11f5a08dc56dfe6bd70859e5e58d9a3bc61c4c2b7082.svg",
                displayName: "Paravane light logo",
                alt: "Paravane logo"
            },
            icon: {
                path: "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/shared/ca/cac0ae6c7817e9eef91d11f5a08dc56dfe6bd70859e5e58d9a3bc61c4c2b7082.svg",
                displayName: "Paravane icon",
                alt: "Paravane icon"
            },
            favicon: {
                path: "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/shared/de/de4e1830590e29e61056af418b1b4c5afdccc3c0019a9a5a21d0e7c5a37ff97e.png",
                displayName: "Paravane favicon",
                alt: "Paravane icon"
            },
            socialPreview: {
                path: "/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/shared/de/de4e1830590e29e61056af418b1b4c5afdccc3c0019a9a5a21d0e7c5a37ff97e.png",
                displayName: "Paravane social preview image",
                alt: "Paravane social preview image"
            }
        }
    };

    THEME.resolveAssetPath = asset;

    function cssVarsFromObject(prefix, obj) {
        return Object.keys(obj)
            .map(function (key) {
                return "--" + prefix + "-" + key.replace(/[A-Z]/g, function (letter) { return "-" + letter.toLowerCase(); }) + ": " + obj[key] + ";";
            })
            .join("\n        ");
    }

    function logoVar(name) {
        return "url(\"" + asset(THEME.logos[name].path) + "\")";
    }

    function injectThemeVariables() {
        var style = document.getElementById("paravane-theme-variables");
        if (!style) {
            style = document.createElement("style");
            style.id = "paravane-theme-variables";
            document.head.appendChild(style);
        }

        style.textContent = "\n" +
            ":root {\n" +
            "        --paravane-brand-name: '" + THEME.brand.companyName + "';\n" +
            "        " + cssVarsFromObject("paravane-color", THEME.colors) + "\n" +
            "        " + cssVarsFromObject("paravane-button", THEME.buttons) + "\n" +
            "        " + cssVarsFromObject("paravane-gradient", THEME.gradients) + "\n" +
            "        " + cssVarsFromObject("paravane-shadow", THEME.shadows) + "\n" +
            "        " + cssVarsFromObject("paravane-font", THEME.fonts) + "\n" +
            "        " + cssVarsFromObject("paravane-space", THEME.spacing) + "\n" +
            "        " + cssVarsFromObject("paravane-radius", THEME.radii) + "\n" +
            "        --paravane-logo-primary: " + logoVar("primary") + ";\n" +
            "        --paravane-logo-secondary: " + logoVar("secondary") + ";\n" +
            "        --paravane-logo-dark: " + logoVar("dark") + ";\n" +
            "        --paravane-logo-light: " + logoVar("light") + ";\n" +
            "        --paravane-logo-icon: " + logoVar("icon") + ";\n" +
            "        --paravane-logo-favicon: " + logoVar("favicon") + ";\n" +
            "        --paravane-logo-social-preview: " + logoVar("socialPreview") + ";\n\n" +
            "        /* Legacy Webflow token bridge: existing CSS now follows the Paravane theme. */\n" +
            "        --green4: var(--paravane-color-primary);\n" +
            "        --green5: var(--paravane-color-primary-hover);\n" +
            "        --neutral100: var(--paravane-color-text);\n" +
            "        --neutral10: var(--paravane-color-text);\n" +
            "        --neutral20: var(--paravane-color-surface-dark);\n" +
            "        --neutral30: var(--paravane-color-text-muted);\n" +
            "        --neutral40: var(--paravane-color-text-subtle);\n" +
            "        --neutral50: var(--paravane-color-border-muted);\n" +
            "        --neutral60: var(--paravane-color-border);\n" +
            "        --neutrals60: var(--paravane-color-border);\n" +
            "        --neutral70: var(--paravane-color-border-light);\n" +
            "        --neutral80: var(--paravane-color-background-muted);\n" +
            "        --neutral90: var(--paravane-color-background);\n" +
            "        --white90: var(--paravane-color-background);\n" +
            "        --white80: var(--paravane-color-background-soft);\n" +
            "        --white: var(--paravane-color-surface);\n" +
            "        --royal-blue-2: var(--paravane-color-text);\n" +
            "        --efc11e: var(--paravane-color-secondary);\n" +
            "    }\n\n" +
            "    body {\n" +
            "        color: var(--paravane-color-text);\n" +
            "        background-color: var(--paravane-color-background);\n" +
            "        font-family: var(--paravane-font-body);\n" +
            "    }\n\n" +
            "    .cta-button,\n" +
            "    .button-primary,\n" +
            "    .button,\n" +
            "    .w-button {\n" +
            "        border-radius: var(--paravane-radius-pill);\n" +
            "    }\n\n" +
            "    .cta-button {\n" +
            "        background-color: var(--paravane-button-primary-bg);\n" +
            "        color: var(--paravane-button-primary-text);\n" +
            "    }\n\n" +
            "    .cta-button:hover {\n" +
            "        background-color: var(--paravane-button-primary-hover-bg);\n" +
            "    }\n\n" +
            "    .abstract-logo,\n" +
            "    .footer-logo,\n" +
            "    [data-theme-logo] {\n" +
            "        object-fit: contain;\n" +
            "    }\n\n" +
            "    ::selection {\n" +
            "        background: var(--paravane-color-secondary-soft);\n" +
            "        color: var(--paravane-color-text);\n" +
            "    }\n";
    }

    function applyLogoToElement(element, logoName) {
        var logo = THEME.logos[logoName] || THEME.logos.primary;
        if (!logo || !element) return;

        var resolvedPath = asset(logo.path);
        var tagName = element.tagName && element.tagName.toLowerCase();

        if (tagName === "img") {
            element.setAttribute("src", resolvedPath);
            element.setAttribute("alt", logo.alt || THEME.brand.displayName + " logo");
            element.setAttribute("title", logo.displayName || THEME.brand.displayName);
        } else if (tagName === "link") {
            element.setAttribute("href", resolvedPath);
        } else if (tagName === "meta") {
            element.setAttribute("content", resolvedPath);
        }
    }

    function applyBrandAssets() {
        document.documentElement.setAttribute("data-brand", THEME.brand.companyName);
        document.documentElement.setAttribute("data-theme", "paravane");

        Array.prototype.forEach.call(document.querySelectorAll("[data-theme-logo]"), function (element) {
            applyLogoToElement(element, element.getAttribute("data-theme-logo"));
        });

        Array.prototype.forEach.call(document.querySelectorAll("img.abstract-logo:not([data-theme-logo]), img.footer-logo:not([data-theme-logo])"), function (element) {
            applyLogoToElement(element, "primary");
        });

        Array.prototype.forEach.call(document.querySelectorAll('link[rel~="icon"], link[rel="shortcut icon"]'), function (element) {
            applyLogoToElement(element, "favicon");
        });

        Array.prototype.forEach.call(document.querySelectorAll('link[rel="apple-touch-icon"]'), function (element) {
            applyLogoToElement(element, "icon");
        });

        Array.prototype.forEach.call(document.querySelectorAll('meta[property="og:image"], meta[property="twitter:image"], meta[name="twitter:image"]'), function (element) {
            applyLogoToElement(element, "socialPreview");
        });

        Array.prototype.forEach.call(document.querySelectorAll("[data-theme-text='company-name']"), function (element) {
            element.textContent = THEME.brand.companyName;
        });
    }

    window.ParavaneTheme = THEME;
    injectThemeVariables();

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", applyBrandAssets);
    } else {
        applyBrandAssets();
    }
})(window, document);
