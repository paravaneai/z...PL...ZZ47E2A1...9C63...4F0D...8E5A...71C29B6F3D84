/**
 * Paravane brand theme
 *
 * This is the single source of truth for site-wide branding.
 * Future brand color, logo, spacing, radius, shadow, and URL changes should start here.
 */
(function () {
    const currentScript = document.currentScript;
    const scriptUrl = currentScript && currentScript.src ? currentScript.src : new URL("theme/brand-theme.js", document.baseURI).href;
    const assetUrl = (relativePath) => new URL(relativePath, scriptUrl).href;

    const theme = {
        name: "Paravane",
        colors: {
            brand: {
                primary: "#F7601C",
                primaryHover: "#E55318",
                secondary: "#FD8C1E",
                accent: "#FDB91D",
                soft: "#FFE5D3",
                softStrong: "#FFD2AE",
                dark: "#6B2E12",
                transparent10: "rgba(247, 96, 28, 0.1)",
                transparent20: "rgba(247, 96, 28, 0.2)",
            },
            background: {
                page: "#FAFCFD",
                subtle: "#F5F8FA",
                elevated: "#FFFFFF",
                inverse: "#171C1F",
            },
            text: {
                primary: "#1B2226",
                muted: "#6F7E87",
                subtle: "#A6B4BD",
                inverse: "#FFFFFF",
            },
            border: {
                default: "#E3EBF0",
                strong: "#38464F",
                inverse: "#21292E",
            },
            utility: {
                white: "#FFFFFF",
                codeDanger: "#F74A13",
                codeWarning: "#EFC11E",
                overlay: "rgba(33, 41, 46, 0.6)",
            },
        },
        typography: {
            sans: '"Matter", sans-serif',
            mono: '"Abcfavoritmono", sans-serif',
            monoBook: '"Abcfavoritmono Book", sans-serif',
            fallbackMono: '"Inconsolata", monospace',
        },
        spacing: {
            xs: "4px",
            sm: "8px",
            md: "12px",
            lg: "16px",
            xl: "24px",
            xxl: "32px",
        },
        radius: {
            sm: "4px",
            md: "8px",
            lg: "12px",
            pill: "999px",
        },
        shadows: {
            insetSoft: "0px -3px 8px 0px rgba(86, 86, 92, 0.03) inset",
            insetStrong: "0px -3px 38px 0px rgba(86, 86, 92, 0.13) inset",
            card: "0px 18px 36px -18px rgba(0, 0, 0, 0.1), 0px 30px 45px -30px rgba(227, 235, 240, 0.5)",
            darkCard: "0px 0px 0px 5px rgba(33, 41, 46, 0.6), 0px 2px 5px 0px rgba(0, 0, 0, 0.31)",
            focus: "0 0 0 5px rgba(247, 96, 28, 0.2)",
        },
        gradients: {
            brand: "linear-gradient(135deg, #F7601C 0%, #FD8C1E 48%, #FDB91D 100%)",
            brandSubtle: "linear-gradient(225deg, rgba(247, 96, 28, 0.11), #FFFFFF)",
            page: "linear-gradient(3deg, #F6F5FA, #FFFFFF)",
        },
        assets: {
            basePath: "../assets/brand/",
            files: {
                compactGradientSvg: "paravane-brandmark-compact-stem-orange-yellow-gradient-01.svg",
                compactGradientPng: "paravane-brandmark-compact-stem-orange-yellow-gradient-01.png",
                extendedSolidSvg: "paravane-brandmark-extended-stem-orange-solid.svg",
                extendedSolidPng: "paravane-brandmark-extended-stem-orange-solid.png",
                socialCardPng: "paravane-social-card.png",
            },
            primaryLogo: assetUrl("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/shared/43/43c5512f12c07b377557011725253faab0ed81602cdc3df0a4827af82230a26d.svg"),
            darkLogo: assetUrl("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/shared/43/43c5512f12c07b377557011725253faab0ed81602cdc3df0a4827af82230a26d.svg"),
            lightLogo: assetUrl("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/shared/43/43c5512f12c07b377557011725253faab0ed81602cdc3df0a4827af82230a26d.svg"),
            iconLogo: assetUrl("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/shared/ca/cac0ae6c7817e9eef91d11f5a08dc56dfe6bd70859e5e58d9a3bc61c4c2b7082.svg"),
            favicon: assetUrl("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/shared/ca/cac0ae6c7817e9eef91d11f5a08dc56dfe6bd70859e5e58d9a3bc61c4c2b7082.svg"),
            appleTouchIcon: assetUrl("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/shared/de/de4e1830590e29e61056af418b1b4c5afdccc3c0019a9a5a21d0e7c5a37ff97e.png"),
            wordmark: assetUrl("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/shared/43/43c5512f12c07b377557011725253faab0ed81602cdc3df0a4827af82230a26d.svg"),
            socialCard: assetUrl("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/shared/8a/8a9b289690a469189d42134f42c4368992157a480ea098c65d8470761731993b.png"),
        },
        links: {
            /*
             * Keep current destinations here until Paravane's final URLs are ready.
             * Changing these bases updates matching document links automatically.
             */
            publicSite: "https://www.abstractapi.com",
            app: "https://app.abstractapi.com",
            docs: "https://docs.abstractapi.com",
            trust: "https://trust.abstractapi.com",
            services: {
                emailValidation: "https://emailvalidation.abstractapi.com",
                emailReputation: "https://emailreputation.abstractapi.com",
                ipGeolocation: "https://ipgeolocation.abstractapi.com",
                ipIntelligence: "https://ip-intelligence.abstractapi.com",
                ipIntelligenceLegacy: "https://ipintelligence.abstractapi.com",
            },
            social: {
                linkedin: "https://www.linkedin.com/company/abstractapi",
                github: "https://github.com/abstractapi",
                x: "https://twitter.com/abstractapi",
                facebook: "https://www.facebook.com/abstractapi/",
                crunchbase: "https://www.crunchbase.com/organization/abstract-8b33",
            },
        },
    };

    const cssVariables = {
        "--color-brand-primary": theme.colors.brand.primary,
        "--color-brand-primary-hover": theme.colors.brand.primaryHover,
        "--color-brand-secondary": theme.colors.brand.secondary,
        "--color-brand-accent": theme.colors.brand.accent,
        "--color-brand-soft": theme.colors.brand.soft,
        "--color-brand-soft-strong": theme.colors.brand.softStrong,
        "--color-brand-dark": theme.colors.brand.dark,
        "--color-brand-primary-transparent-10": theme.colors.brand.transparent10,
        "--color-brand-primary-transparent-20": theme.colors.brand.transparent20,
        "--color-background-page": theme.colors.background.page,
        "--color-background-subtle": theme.colors.background.subtle,
        "--color-background-elevated": theme.colors.background.elevated,
        "--color-background-inverse": theme.colors.background.inverse,
        "--color-text-primary": theme.colors.text.primary,
        "--color-text-muted": theme.colors.text.muted,
        "--color-text-subtle": theme.colors.text.subtle,
        "--color-text-inverse": theme.colors.text.inverse,
        "--color-border-default": theme.colors.border.default,
        "--color-border-strong": theme.colors.border.strong,
        "--color-border-inverse": theme.colors.border.inverse,
        "--color-white": theme.colors.utility.white,
        "--color-code-danger": theme.colors.utility.codeDanger,
        "--color-code-warning": theme.colors.utility.codeWarning,
        "--font-family-sans": theme.typography.sans,
        "--font-family-mono": theme.typography.mono,
        "--font-family-mono-book": theme.typography.monoBook,
        "--font-family-fallback-mono": theme.typography.fallbackMono,
        "--space-xs": theme.spacing.xs,
        "--space-sm": theme.spacing.sm,
        "--space-md": theme.spacing.md,
        "--space-lg": theme.spacing.lg,
        "--space-xl": theme.spacing.xl,
        "--space-xxl": theme.spacing.xxl,
        "--radius-sm": theme.radius.sm,
        "--radius-md": theme.radius.md,
        "--radius-lg": theme.radius.lg,
        "--radius-pill": theme.radius.pill,
        "--shadow-inset-soft": theme.shadows.insetSoft,
        "--shadow-inset-strong": theme.shadows.insetStrong,
        "--shadow-card": theme.shadows.card,
        "--shadow-dark-card": theme.shadows.darkCard,
        "--shadow-focus": theme.shadows.focus,
        "--gradient-brand": theme.gradients.brand,
        "--gradient-brand-subtle": theme.gradients.brandSubtle,
        "--gradient-page": theme.gradients.page,
    };

    const themeStyle = document.createElement("style");
    themeStyle.id = "paravane-theme-vars";
    themeStyle.textContent = `:root {\n${Object.entries(cssVariables)
        .map(([name, value]) => `    ${name}: ${value};`)
        .join("\n")}\n}`;
    document.head.prepend(themeStyle);

    const applyBrandAssets = () => {
        document.querySelectorAll("[data-brand-asset]").forEach((element) => {
            const assetKey = element.getAttribute("data-brand-asset");
            const assetValue = theme.assets[assetKey];

            if (!assetValue) {
                return;
            }

            if (element.tagName === "LINK") {
                element.setAttribute("href", assetValue);
                return;
            }

            if (element.tagName === "IMG") {
                element.setAttribute("src", assetValue);
                return;
            }

            if (element.tagName === "META") {
                element.setAttribute("content", assetValue);
            }
        });
    };

    const getThemeValue = (path) => path.split(".").reduce((value, key) => (value ? value[key] : undefined), theme);

    const themedHosts = {
        "www.abstractapi.com": theme.links.publicSite,
        "abstractapi.com": theme.links.publicSite,
        "app.abstractapi.com": theme.links.app,
        "docs.abstractapi.com": theme.links.docs,
        "trust.abstractapi.com": theme.links.trust,
        "emailvalidation.abstractapi.com": theme.links.services.emailValidation,
        "emailreputation.abstractapi.com": theme.links.services.emailReputation,
        "ipgeolocation.abstractapi.com": theme.links.services.ipGeolocation,
        "ip-intelligence.abstractapi.com": theme.links.services.ipIntelligence,
        "ipintelligence.abstractapi.com": theme.links.services.ipIntelligenceLegacy,
    };

    const rewriteThemedUrl = (value) => {
        if (!value) {
            return value;
        }

        try {
            const currentUrl = new URL(value, document.baseURI);
            const replacementBase = themedHosts[currentUrl.hostname];

            if (!replacementBase) {
                return value;
            }

            const replacementUrl = new URL(replacementBase);
            replacementUrl.pathname = currentUrl.pathname;
            replacementUrl.search = currentUrl.search;
            replacementUrl.hash = currentUrl.hash;
            return replacementUrl.href;
        } catch (error) {
            return value;
        }
    };

    const rewriteStructuredUrls = (value) => {
        if (Array.isArray(value)) {
            return value.map(rewriteStructuredUrls);
        }

        if (value && typeof value === "object") {
            return Object.fromEntries(Object.entries(value).map(([key, nestedValue]) => [key, rewriteStructuredUrls(nestedValue)]));
        }

        if (typeof value === "string") {
            return rewriteThemedUrl(value);
        }

        return value;
    };

    const applyBrandLinks = () => {
        document.querySelectorAll("[data-brand-link]").forEach((element) => {
            const linkKey = element.getAttribute("data-brand-link");
            const linkValue = getThemeValue(`links.${linkKey}`);

            if (linkValue) {
                element.setAttribute("href", linkValue);
            }
        });

        document.querySelectorAll("a[href], link[href]").forEach((element) => {
            element.setAttribute("href", rewriteThemedUrl(element.getAttribute("href")));
        });
    };

    const updateStructuredBrandData = () => {
        document.querySelectorAll('script[data-brand-schema="organization"]').forEach((script) => {
            try {
                const parsed = rewriteStructuredUrls(JSON.parse(script.textContent));
                const items = Array.isArray(parsed) ? parsed : [parsed];

                items.forEach((item) => {
                    if (!item || item["@type"] !== "Organization" || !item.logo) {
                        return;
                    }

                    if (typeof item.logo === "string") {
                        item.logo = theme.assets.primaryLogo;
                        return;
                    }

                    item.logo.url = theme.assets.primaryLogo;

                    if (Array.isArray(item.sameAs)) {
                        item.sameAs = [
                            theme.links.social.linkedin,
                            theme.links.social.github,
                            theme.links.social.x,
                            theme.links.social.crunchbase,
                            theme.links.social.facebook,
                        ];
                    }
                });

                script.textContent = JSON.stringify(parsed, null, 2);
            } catch (error) {
                console.warn("Unable to update branded structured data.", error);
            }
        });
    };

    window.ParavaneTheme = theme;

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            applyBrandAssets();
            applyBrandLinks();
            updateStructuredBrandData();
        });
    } else {
        applyBrandAssets();
        applyBrandLinks();
        updateStructuredBrandData();
    }
})();
