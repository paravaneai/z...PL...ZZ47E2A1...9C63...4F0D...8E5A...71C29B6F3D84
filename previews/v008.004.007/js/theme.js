(function () {
    "use strict";

    var storageKey = "paravane-theme";
    var defaultTheme = "dark";

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
        try {
            window.localStorage.setItem(storageKey, theme);
        } catch (err) {}
    }

    function currentTheme() {
        var theme = document.documentElement.getAttribute("data-theme");
        return isValidTheme(theme) ? theme : defaultTheme;
    }

    function updateToggle(theme) {
        var nextTheme = theme === "dark" ? "light" : "dark";
        var label = theme === "dark" ? "Dark" : "Light";
        var title = "Switch to " + nextTheme + " theme";

        document.querySelectorAll("[data-theme-toggle]").forEach(function (button) {
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

        if (window.ParavaneImages) {
            window.ParavaneImages.apply(document);
        }

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

    function setTheme(theme, options) {
        if (!isValidTheme(theme)) theme = defaultTheme;
        document.documentElement.setAttribute("data-theme", theme);
        persistTheme(theme);
        syncLoaderTheme(theme);
        syncThemeMedia(theme);
        updateToggle(theme);

        if (!options || !options.silent) {
            window.dispatchEvent(new CustomEvent("paravane:themechange", {
                detail: { theme: theme }
            }));
        }
    }

    function toggleTheme() {
        setTheme(currentTheme() === "dark" ? "light" : "dark");
    }

    setTheme(storedTheme(), { silent: true });

    function bindThemeControls() {
        updateToggle(currentTheme());
        syncLoaderTheme(currentTheme());
        syncThemeMedia(currentTheme());
        document.querySelectorAll("[data-theme-toggle]").forEach(function (button) {
            button.addEventListener("click", toggleTheme);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", bindThemeControls);
    } else {
        bindThemeControls();
    }

    window.ParavaneTheme = {
        get: currentTheme,
        set: setTheme,
        toggle: toggleTheme
    };
})();
