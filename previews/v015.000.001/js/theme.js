(function () {
    "use strict";

    var storageKey = "paravane-theme";
    var siteConfig = window.ParavaneSiteConfig || {};
    var themeConfig = siteConfig.theme || {};
    var switchingEnabled = themeConfig.switchingEnabled === true;
    var defaultTheme = themeConfig.defaultTheme === "light" ? "light" : "dark";
    var root = document.documentElement;
    var localHostnames = ["localhost", "127.0.0.1", "::1"];
    var API_BASE = window.PARAVANE_API_BASE ||
        (localHostnames.indexOf(window.location.hostname) >= 0 ? "" : "https://api.paravane.io");
    var themeChangeReleaseFrame = 0;
    var faviconPaths = {
        dark: "../../../shared/b4/b47d8a12345bdbf064f0de8351c8ff55b0c87d6eec4e283d71a72b3fa8e150eb.ico",
        light: "../../../shared/47/47f41a0063dc5d27def2b6ab47b53a7d22ee2aefecb2a84765c9e6c1539af98c.ico"
    };

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
            button.setAttribute("aria-checked", theme === "dark" ? "true" : "false");
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

    function syncFavicon(theme) {
        var favicon = document.querySelector('link[rel~="icon"]');
        var nextHref = faviconPaths[theme === "light" ? "light" : "dark"];

        if (!favicon) {
            favicon = document.createElement("link");
            favicon.setAttribute("rel", "icon");
            document.head.appendChild(favicon);
        }

        if (favicon.getAttribute("href") !== nextHref) {
            favicon.setAttribute("href", nextHref);
        }
    }

    function syncThemeUi(theme) {
        syncLoaderTheme(theme);
        syncThemeMedia(theme);
        syncFavicon(theme);
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

    function authenticatedAccountMarkup() {
        return '<span class="nav-session-action__icon" aria-hidden="true">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' +
                '<circle cx="12" cy="8" r="3.25"></circle>' +
                '<path d="M5.8 19.1c.8-3.2 3-5 6.2-5s5.4 1.8 6.2 5"></path>' +
            '</svg>' +
        '</span><span>Account</span>';
    }

    function sessionNavigationActions() {
        return Array.prototype.slice.call(document.querySelectorAll(
            'a.nav-action[href^="../pages/auth/signin"], a.nav-session-action'
        ));
    }

    function showAuthenticatedNavigation(actions) {
        actions.forEach(function (action) {
            action.classList.add("nav-session-action");
            action.classList.remove("active");
            action.setAttribute("data-session-state", "authenticated");
            action.setAttribute("href", "../pages/app/");
            action.setAttribute("aria-label", "Open account dashboard");
            action.setAttribute("title", "Open account dashboard");
            action.innerHTML = authenticatedAccountMarkup();
        });
        root.classList.add("site-session-authenticated");
    }

    async function refreshSessionNavigation() {
        var actions = sessionNavigationActions();

        if (!actions.length || document.querySelector('form[data-auth-form="login"]')) return;

        try {
            var response = await fetch(API_BASE + "../v1/auth/me", {
                credentials: "include",
                headers: { "Accept": "application/json" }
            });
            if (!response.ok) return;

            var result = await response.json().catch(function () { return {}; });
            var tenant = result && result.tenant;
            if (!tenant || String(tenant.status || "").toLowerCase() !== "active") return;

            showAuthenticatedNavigation(actions);
        } catch (err) {
            /* Leave the static Sign in action in place when session checks fail. */
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", refreshSessionNavigation, { once: true });
    } else {
        refreshSessionNavigation();
    }

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

    function bindMobileNavigation() {
        var header = document.querySelector(".site-header");

        if (!header || header.getAttribute("data-mobile-nav-bound") === "true") {
            return;
        }

        var nav = header.querySelector(".nav");
        var links = header.querySelector(".nav-links");
        var actions = header.querySelector(".nav-actions");
        var catalog = links ? links.querySelector(".nav-catalog") : null;
        var catalogTrigger = catalog ? catalog.querySelector(".nav-catalog-trigger") : null;
        var catalogMenu = catalog ? catalog.querySelector(".product-catalog-menu") : null;

        function usesCatalogDisclosure(event) {
            var pointerType = event && typeof event.pointerType === "string" ? event.pointerType : "";

            if (window.innerWidth <= 720 || pointerType === "touch" || pointerType === "pen") {
                return true;
            }

            return Boolean(window.matchMedia) && (
                window.matchMedia("(hover: none)").matches ||
                window.matchMedia("(pointer: coarse)").matches
            );
        }

        if (!nav || !links || !actions) {
            return;
        }

        header.setAttribute("data-mobile-nav-bound", "true");

        if (!links.id) {
            links.id = "primary-navigation";
        }

        var button = document.createElement("button");
        button.className = "mobile-nav-toggle";
        button.type = "button";
        button.setAttribute("aria-label", "Open navigation menu");
        button.setAttribute("aria-controls", links.id);
        button.setAttribute("aria-expanded", "false");
        button.innerHTML = '<span class="mobile-nav-toggle__icon" aria-hidden="true"></span>';
        actions.appendChild(button);

        var mobileMenuOpenScrollY = 0;
        var mobileMenuScrollClosePausedUntil = 0;

        function stabilizeMobileMenuScrollOrigin() {
            mobileMenuScrollClosePausedUntil = window.performance.now() + 360;
            mobileMenuOpenScrollY = window.scrollY || 0;

            window.requestAnimationFrame(function () {
                mobileMenuOpenScrollY = window.scrollY || 0;

                window.requestAnimationFrame(function () {
                    mobileMenuOpenScrollY = window.scrollY || 0;
                });
            });
        }

        function setCatalogOpen(open, restoreFocus) {
            if (!catalog || !catalogTrigger || !catalogMenu) {
                return;
            }

            if (open) {
                stabilizeMobileMenuScrollOrigin();
            }

            catalog.classList.toggle("is-open", open);
            catalogTrigger.setAttribute("aria-expanded", open ? "true" : "false");

            if (!open && restoreFocus) {
                catalogTrigger.focus();
            }
        }

        function setMenuOpen(open, restoreFocus) {
            if (open) {
                stabilizeMobileMenuScrollOrigin();
            }

            header.classList.toggle("mobile-nav-open", open);
            root.classList.toggle("mobile-nav-is-open", open);
            button.setAttribute("aria-expanded", open ? "true" : "false");
            button.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");

            if (!open) {
                setCatalogOpen(false, false);
            }

            if (!open && restoreFocus) {
                button.focus();
            }
        }

        button.addEventListener("click", function () {
            setMenuOpen(button.getAttribute("aria-expanded") !== "true", false);
        });

        if (catalogTrigger && catalogMenu) {
            if (!catalogMenu.id) {
                catalogMenu.id = "product-catalog-navigation";
            }

            catalogTrigger.setAttribute("aria-controls", catalogMenu.id);
            catalogTrigger.setAttribute("aria-expanded", "false");
            catalogTrigger.addEventListener("click", function (event) {
                if (!usesCatalogDisclosure(event)) {
                    return;
                }

                event.preventDefault();
                var shouldOpen = catalogTrigger.getAttribute("aria-expanded") !== "true";

                if (shouldOpen) {
                    links.querySelectorAll(".nav-catalog").forEach(function (other) {
                        if (other === catalog) {
                            return;
                        }

                        other.classList.remove("is-open");
                        var otherTrigger = other.querySelector(".nav-catalog-trigger");
                        if (otherTrigger) {
                            otherTrigger.setAttribute("aria-expanded", "false");
                        }
                    });
                }

                setCatalogOpen(shouldOpen, false);
            });
        }

        links.addEventListener("click", function (event) {
            if (event.target.closest("a")) {
                setMenuOpen(false, false);
            }
        });

        document.addEventListener("click", function (event) {
            if (catalogTrigger && catalogTrigger.getAttribute("aria-expanded") === "true" && !catalog.contains(event.target)) {
                setCatalogOpen(false, false);
            }

            if (button.getAttribute("aria-expanded") === "true" && !header.contains(event.target)) {
                setMenuOpen(false, false);
            }
        });

        document.addEventListener("keydown", function (event) {
            if (event.key !== "Escape") {
                return;
            }

            if (catalogTrigger && catalogTrigger.getAttribute("aria-expanded") === "true") {
                setCatalogOpen(false, true);
            } else if (button.getAttribute("aria-expanded") === "true") {
                setMenuOpen(false, true);
            }
        });

        window.addEventListener("resize", function () {
            if (window.innerWidth > 720) {
                setCatalogOpen(false, false);

                if (button.getAttribute("aria-expanded") === "true") {
                    setMenuOpen(false, false);
                }
            }
        }, { passive: true });

        window.addEventListener("scroll", function () {
            if (window.innerWidth > 720 || button.getAttribute("aria-expanded") !== "true") {
                return;
            }

            if (window.performance.now() < mobileMenuScrollClosePausedUntil) {
                mobileMenuOpenScrollY = window.scrollY || 0;
                return;
            }

            if (Math.abs((window.scrollY || 0) - mobileMenuOpenScrollY) < 12) {
                return;
            }

            setMenuOpen(false, false);
        }, { passive: true });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", bindMobileNavigation, { once: true });
    } else {
        bindMobileNavigation();
    }

    function bindScrollAwareHeader() {
        var header = document.querySelector("body:not(.page-app) .site-header");

        if (!header || header.getAttribute("data-scroll-aware-bound") === "true") {
            return;
        }

        header.setAttribute("data-scroll-aware-bound", "true");

        var lastScrollY = Math.max(window.scrollY || 0, 0);
        var downwardTravel = 0;
        var headerHeight = 0;
        var frameRequested = false;
        var collapseTravel = 12;
        var topRevealPoint = 24;

        function isHeaderInUse() {
            /*
             * Pointer clicks leave controls focused after activation. Treating
             * all focus as active use would pin the header open after clicking
             * the theme toggle. Preserve it only for visible keyboard focus or
             * while the product catalog is being used.
             */
            return header.classList.contains("mobile-nav-open") ||
                Boolean(header.querySelector(".nav-catalog.is-open")) ||
                Boolean(header.querySelector(":focus-visible:not([data-theme-toggle])")) ||
                Boolean(header.querySelector(".nav-catalog:hover"));
        }

        function measureHeader() {
            headerHeight = Math.ceil(header.getBoundingClientRect().height);
            root.style.setProperty("--site-header-height", headerHeight + "px");

            if (!root.classList.contains("site-header-is-collapsed")) {
                root.style.setProperty("--site-header-visible-height", headerHeight + "px");
            }
        }

        function setCollapsed(collapsed) {
            if (collapsed && isHeaderInUse()) {
                collapsed = false;
            }

            header.classList.toggle("is-scroll-collapsed", collapsed);
            header.classList.toggle("is-scroll-expanded", !collapsed);
            root.classList.toggle("site-header-is-collapsed", collapsed);
            root.style.setProperty(
                "--site-header-visible-height",
                collapsed ? "0px" : headerHeight + "px"
            );
        }

        function updateHeader() {
            var currentScrollY = Math.max(window.scrollY || 0, 0);
            var delta = currentScrollY - lastScrollY;

            header.classList.toggle("is-scroll-elevated", currentScrollY > topRevealPoint);

            if (currentScrollY <= topRevealPoint || isHeaderInUse()) {
                downwardTravel = 0;
                setCollapsed(false);
            } else if (delta < -1) {
                downwardTravel = 0;
                setCollapsed(false);
            } else if (delta > 1) {
                downwardTravel += delta;

                if (downwardTravel >= collapseTravel && currentScrollY > headerHeight) {
                    setCollapsed(true);
                }
            }

            lastScrollY = currentScrollY;
            frameRequested = false;
        }

        function requestHeaderUpdate() {
            if (frameRequested) return;
            frameRequested = true;
            window.requestAnimationFrame(updateHeader);
        }

        measureHeader();
        setCollapsed(false);
        header.classList.toggle("is-scroll-elevated", lastScrollY > topRevealPoint);

        window.addEventListener("scroll", requestHeaderUpdate, { passive: true });
        window.addEventListener("resize", function () {
            measureHeader();
            requestHeaderUpdate();
        }, { passive: true });

        header.addEventListener("focusin", function () {
            downwardTravel = 0;
            setCollapsed(false);
        });

        window.addEventListener("paravane:themechange", function () {
            lastScrollY = Math.max(window.scrollY || 0, 0);
            downwardTravel = 0;
            measureHeader();
            setCollapsed(false);

            window.requestAnimationFrame(function () {
                measureHeader();
                requestHeaderUpdate();
            });
        });

        window.addEventListener("pageshow", function () {
            lastScrollY = Math.max(window.scrollY || 0, 0);
            downwardTravel = 0;
            measureHeader();
            setCollapsed(false);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", bindThemeControls, { once: true });
        document.addEventListener("DOMContentLoaded", bindScrollAwareHeader, { once: true });
    } else {
        bindThemeControls();
        bindScrollAwareHeader();
    }

    window.addEventListener("pageshow", function (event) {
        /* Normal navigations already restored the theme before CSS loaded. */
        if (event.persisted) {
            restoreTheme();
            refreshSessionNavigation();
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


/* Additional mobile catalog controls: v012.000.001-alpha.108 */
(function () {
    "use strict";

    function bindAdditionalMobileCatalogs() {
        document.querySelectorAll(".site-header").forEach(function (header) {
            var catalogs = Array.prototype.slice.call(header.querySelectorAll(".nav-catalog"));

            function usesCatalogDisclosure(event) {
                var pointerType = event && typeof event.pointerType === "string" ? event.pointerType : "";

                if (window.innerWidth <= 720 || pointerType === "touch" || pointerType === "pen") {
                    return true;
                }

                return Boolean(window.matchMedia) && (
                    window.matchMedia("(hover: none)").matches ||
                    window.matchMedia("(pointer: coarse)").matches
                );
            }

            catalogs.slice(1).forEach(function (catalog, index) {
                var trigger = catalog.querySelector(".nav-catalog-trigger");
                var menu = catalog.querySelector(".product-catalog-menu");
                if (!trigger || !menu || trigger.dataset.additionalCatalogBound === "true") return;

                trigger.dataset.additionalCatalogBound = "true";
                if (!menu.id) menu.id = "additional-navigation-catalog-" + index;
                trigger.setAttribute("aria-controls", menu.id);
                trigger.setAttribute("aria-expanded", "false");

                function setOpen(open, restoreFocus) {
                    catalog.classList.toggle("is-open", open);
                    trigger.setAttribute("aria-expanded", String(open));
                    if (!open && restoreFocus) trigger.focus();
                }

                trigger.addEventListener("click", function (event) {
                    if (!usesCatalogDisclosure(event)) return;
                    event.preventDefault();
                    event.stopPropagation();
                    var shouldOpen = trigger.getAttribute("aria-expanded") !== "true";

                    catalogs.forEach(function (other) {
                        if (other === catalog) return;
                        other.classList.remove("is-open");
                        var otherTrigger = other.querySelector(".nav-catalog-trigger");
                        if (otherTrigger) otherTrigger.setAttribute("aria-expanded", "false");
                    });
                    setOpen(shouldOpen, false);
                });

                catalog.addEventListener("click", function (event) {
                    event.stopPropagation();
                });
                document.addEventListener("click", function () {
                    if (trigger.getAttribute("aria-expanded") === "true") setOpen(false, false);
                });
                document.addEventListener("keydown", function (event) {
                    if (event.key === "Escape" && trigger.getAttribute("aria-expanded") === "true") {
                        setOpen(false, true);
                    }
                });
                window.addEventListener("resize", function () {
                    if (!usesCatalogDisclosure()) setOpen(false, false);
                });
            });
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", bindAdditionalMobileCatalogs, { once: true });
    } else {
        bindAdditionalMobileCatalogs();
    }
}());
