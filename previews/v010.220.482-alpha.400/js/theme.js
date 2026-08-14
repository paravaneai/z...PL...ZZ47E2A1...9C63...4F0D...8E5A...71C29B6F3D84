(function () {
    "use strict";

    var storageKey = "paravane-theme";
    var siteConfig = window.ParavaneSiteConfig || {};
    var themeConfig = siteConfig.theme || {};
    var switchingEnabled = themeConfig.switchingEnabled === true;
    var defaultTheme = themeConfig.defaultTheme === "light" ? "light" : "dark";
    var root = document.documentElement;
    var themeChangeReleaseFrame = 0;

    root.setAttribute(
        "data-theme-switching",
        switchingEnabled ? "enabled" : "disabled"
    );

    function isValidTheme(theme) {
        return theme === "dark" || theme === "light";
    }

    function storedTheme() {
        try {
            var theme = window.localStorage.getItem(storageKey);
            return isValidTheme(theme) ? theme : defaultTheme;
        } catch (err) {
            return defaultTheme;
        }
    }

    function persistTheme(theme) {
        if (!switchingEnabled) return;

        try {
            window.localStorage.setItem(storageKey, theme);
        } catch (err) {}
    }

    function currentTheme() {
        var theme = root.getAttribute("data-theme");
        return isValidTheme(theme) ? theme : defaultTheme;
    }

    function beginAtomicThemeChange() {
        if (themeChangeReleaseFrame) {
            window.cancelAnimationFrame(themeChangeReleaseFrame);
            themeChangeReleaseFrame = 0;
        }

        root.classList.add("theme-changing");

        /*
         * Commit transition suppression before data-theme changes. Without this
         * read, Chromium may batch the class and theme attribute into one style
         * recalculation and allow existing theme-sensitive transitions to start.
         */
        void root.offsetWidth;
    }

    function endAtomicThemeChange() {
        themeChangeReleaseFrame = window.requestAnimationFrame(function () {
            themeChangeReleaseFrame = window.requestAnimationFrame(function () {
                root.classList.remove("theme-changing");
                themeChangeReleaseFrame = 0;
            });
        });
    }

    function updateToggle(theme) {
        var nextTheme = theme === "dark" ? "light" : "dark";
        var label = theme === "dark" ? "Dark" : "Light";
        var title = "Switch to " + nextTheme + " theme";

        document.querySelectorAll("[data-theme-toggle]").forEach(function (button) {
            button.hidden = !switchingEnabled;
            button.disabled = !switchingEnabled;
            button.setAttribute("aria-hidden", switchingEnabled ? "false" : "true");

            if (!switchingEnabled) return;

            button.setAttribute("aria-label", title);
            button.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
            button.setAttribute("title", title);

            var labelEl = button.querySelector("[data-theme-toggle-label]");
            if (labelEl) {
                labelEl.textContent = label;
            }
        });
    }

    function syncLoaderTheme(theme) {
        var overlay = document.querySelector(".animationload");
        var loader = document.querySelector(".loader");
        var isLight = theme === "light";
        var imageRegistry = window.ParavaneImages;
        var loaderImage = imageRegistry
            ? imageRegistry.get(isLight ? "brand.loader.light" : "brand.loader.dark")
            : "";

        if (overlay) {
            overlay.style.background = isLight ? "#ffffff" : "#000000";
        }

        if (loader) {
            loader.style.backgroundImage = loaderImage ? "url('" + loaderImage + "')" : "";
        }
    }

    function syncThemeMedia(theme) {
        var srcAttr = theme === "light" ? "data-theme-src-light" : "data-theme-src-dark";
        var srcsetAttr = theme === "light" ? "data-theme-srcset-light" : "data-theme-srcset-dark";

        document.querySelectorAll("[data-theme-src-dark][data-theme-src-light]").forEach(function (image) {
            var nextSrc = image.getAttribute(srcAttr);
            if (nextSrc && image.getAttribute("src") !== nextSrc) {
                image.setAttribute("src", nextSrc);
            }
        });

        document.querySelectorAll("[data-theme-srcset-dark][data-theme-srcset-light]").forEach(function (source) {
            var nextSrcset = source.getAttribute(srcsetAttr);
            if (nextSrcset && source.getAttribute("srcset") !== nextSrcset) {
                source.setAttribute("srcset", nextSrcset);
            }
        });
    }

    function syncThemeUi(theme) {
        syncLoaderTheme(theme);
        syncThemeMedia(theme);
        updateToggle(theme);
    }

    function setTheme(theme, options) {
        var previousTheme = currentTheme();

        if (!switchingEnabled) theme = defaultTheme;
        if (!isValidTheme(theme)) theme = defaultTheme;

        var themeChanged = previousTheme !== theme || !root.hasAttribute("data-theme");

        /*
         * The stylesheet owns color-scheme. Keeping it out of an inline style
         * prevents Chromium or a color-conversion extension from interpreting
         * a repeated inline assignment during navigation as a new rendering
         * mode. The document also opts out of generated dark themes in <head>.
         */
        root.style.removeProperty("color-scheme");

        if (themeChanged) {
            beginAtomicThemeChange();
        }

        try {
            if (themeChanged) {
                root.setAttribute("data-theme", theme);
            }

            if (!options || options.persist !== false) {
                persistTheme(theme);
            }

            syncThemeUi(theme);
        } finally {
            if (themeChanged) {
                endAtomicThemeChange();
            }
        }

        if ((!options || !options.silent) && previousTheme !== theme) {
            window.dispatchEvent(new CustomEvent("paravane:themechange", {
                detail: { theme: theme }
            }));
        }
    }

    function toggleTheme() {
        if (!switchingEnabled) return;
        setTheme(currentTheme() === "dark" ? "light" : "dark");
    }

    function restoreTheme() {
        var expectedTheme = switchingEnabled ? storedTheme() : defaultTheme;

        if (currentTheme() !== expectedTheme || root.style.getPropertyValue("color-scheme")) {
            setTheme(expectedTheme, {
                silent: true,
                persist: false
            });
            return;
        }

        syncThemeUi(expectedTheme);
    }

    restoreTheme();

    function bindThemeControls() {
        restoreTheme();

        document.querySelectorAll("[data-theme-toggle]").forEach(function (button) {
            if (!switchingEnabled || button.getAttribute("data-theme-toggle-bound") === "true") {
                return;
            }

            button.setAttribute("data-theme-toggle-bound", "true");
            button.addEventListener("click", toggleTheme);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", bindThemeControls, { once: true });
    } else {
        bindThemeControls();
    }

    window.addEventListener("pageshow", function (event) {
        /* Normal navigations already restored the theme before CSS loaded. */
        if (event.persisted) {
            restoreTheme();
        } else {
            syncThemeUi(currentTheme());
        }
    });

    window.addEventListener("storage", function (event) {
        if (event.key === storageKey) {
            restoreTheme();
        }
    });

    window.ParavaneTheme = {
        isSwitchingEnabled: function () {
            return switchingEnabled;
        },
        get: currentTheme,
        set: setTheme,
        toggle: toggleTheme,
        restore: restoreTheme
    };
})();
