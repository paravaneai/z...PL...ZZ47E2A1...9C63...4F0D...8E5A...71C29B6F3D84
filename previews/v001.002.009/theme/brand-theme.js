/**
 * Paravane brand theme
 *
 * This is the single source of truth for site-wide branding.
 * Future brand color, logo, spacing, radius, shadow, URL, and product-availability changes should start here.
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
            nav: {
                /* Nav/dropdown-only tokens. Change these instead of repurposing
                 * general tokens like --color-white or --color-border-default.
                 */
                shellBackground: "#171C1F",
                shellBorder: "#38464F",
                triggerText: "#FFFFFF",
                triggerHoverText: "#F7601C",
                triggerActiveBackground: "#032841",
                dropdownSurface: "#FFFFFF",
                dropdownBorder: "#E3EBF0",
                dropdownDivider: "#F5F8FA",
                dropdownHeadingText: "#A6B4BD",
                dropdownText: "#1B2226",
                dropdownMutedText: "#6F7E87",
                dropdownHoverBackground: "#F5F8FA",
                ctaPanelBackground: "#171C1F",
                ctaPanelText: "#FFFFFF",
                ctaInputBackground: "#38464F",
                ctaInputText: "#A6B4BD",
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
            favicon: assetUrl("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/shared/5c/5c0b22202097d2111076516815a4316e0be58467ac5161de9ee4ca1d0771e901.ico"),
            appleTouchIcon: assetUrl("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/shared/de/de4e1830590e29e61056af418b1b4c5afdccc3c0019a9a5a21d0e7c5a37ff97e.png"),
            wordmark: assetUrl("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/shared/43/43c5512f12c07b377557011725253faab0ed81602cdc3df0a4827af82230a26d.svg"),
            socialCard: assetUrl("/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/shared/8a/8a9b289690a469189d42134f42c4368992157a480ea098c65d8470761731993b.png"),
        },
        links: {
            /*
             * Keep current destinations here until Paravane's final URLs are ready.
             * Changing these bases updates matching document links automatically.
             */
            publicSite: "https://www.paravaneapi.com",
            app: "https://app.paravaneapi.com",
            docs: "https://docs.paravaneapi.com",
            trust: "https://trust.paravaneapi.com",
            services: {
                emailValidation: "https://emailvalidation.paravaneapi.com",
                emailReputation: "https://emailreputation.paravaneapi.com",
                ipGeolocation: "https://ipgeolocation.paravaneapi.com",
                ipIntelligence: "https://ip-intelligence.paravaneapi.com",
                ipIntelligenceLegacy: "https://ipintelligence.paravaneapi.com",
            },
            social: {
                linkedin: "https://www.linkedin.com/company/paravaneapi",
                github: "https://github.com/paravaneapi",
                x: "https://twitter.com/paravaneapi",
                facebook: "https://www.facebook.com/paravaneapi/",
                crunchbase: "https://www.crunchbase.com/organization/abstract-8b33",
            },
        },
        products: {
            /*
             * Toggle products here instead of deleting pages or hand-editing every menu.
             * Disabled products are hidden from shared site surfaces and any disabled
             * product page that still exists redirects to the current primary product.
             */
            primaryProductKey: "emailValidation",
            redirectDisabledPagesToPrimary: true,
            items: {
                ipIntelligence: {
                    enabled: false,
                    name: "IP Intelligence",
                    pagePath: "api/ip-intelligence.html",
                    pathHints: ["ip-intelligence", "ipintelligence"],
                    aliases: ["IP Intelligence", "IP Intelligence API"],
                },
                ipGeolocation: {
                    enabled: false,
                    name: "IP Geolocation",
                    pagePath: "api/ip-geolocation-api.html",
                    pathHints: ["ip-geolocation", "ip geolocation"],
                    aliases: ["IP Geolocation", "IP Geolocation API"],
                },
                companyEnrichment: {
                    enabled: false,
                    name: "Company Enrichment",
                    pagePath: "api/company-enrichment.html",
                    pathHints: ["company-enrichment"],
                    aliases: ["Company Enrichment", "Company Enrichment API"],
                },
                exchangeRates: {
                    enabled: false,
                    name: "Exchange Rates",
                    pagePath: "api/exchange-rate-api.html",
                    pathHints: ["exchange-rate"],
                    aliases: ["Exchange Rates & Currencies", "Exchange Rate API"],
                },
                timeDateTimezone: {
                    enabled: false,
                    name: "Time, Date, and Timezones",
                    pagePath: "api/time-date-timezone-api.html",
                    pathHints: ["time-date-timezone"],
                    aliases: ["Time, Date, and Timezones", "Time, Date, Timezone API"],
                },
                publicHolidays: {
                    enabled: false,
                    name: "Public Holidays",
                    pagePath: "api/holidays-api.html",
                    pathHints: ["holidays-api", "public-holidays"],
                    aliases: ["Public Holidays", "Public Holidays API"],
                },
                websiteScreenshot: {
                    enabled: false,
                    name: "Website Screenshot",
                    pagePath: "api/website-screenshot-api.html",
                    pathHints: ["website-screenshot"],
                    aliases: ["Website Screenshot", "Website Screenshot API"],
                },
                imageProcessing: {
                    enabled: false,
                    name: "Image Processing",
                    pagePath: "api/image-processing-optimization-api.html",
                    pathHints: ["image-processing"],
                    aliases: ["Image Processing", "Image Processing API"],
                },
                webScraping: {
                    enabled: false,
                    name: "Web Scraping",
                    pagePath: "api/web-scraping-api.html",
                    pathHints: ["web-scraping"],
                    aliases: ["Web Scraping", "Web Scraping API"],
                },
                userAvatars: {
                    enabled: false,
                    name: "User Avatars",
                    pagePath: "api/user-avatar-api.html",
                    pathHints: ["user-avatar"],
                    aliases: ["User Avatars", "User Avatar API"],
                },
                emailValidation: {
                    enabled: true,
                    name: "Email Intelligence",
                    pagePath: "pages/api/email-intelligence-api.html",
                    pathHints: ["email-intelligence-api", "email-intelligence"],
                    aliases: ["Email Intelligence", "Email Intelligence API", "Email Verification"],
                },
                emailReputation: {
                    enabled: false,
                    name: "Email Reputation",
                    pagePath: "api/email-reputation-api.html",
                    pathHints: ["email-reputation"],
                    aliases: ["Email Reputation", "Email Reputation API"],
                },
                phoneValidation: {
                    enabled: false,
                    name: "Phone Validation",
                    pagePath: "api/phone-validation-api.html",
                    pathHints: ["phone-validation"],
                    aliases: ["Phone Validation", "Phone Validation API"],
                },
                vatValidation: {
                    enabled: false,
                    name: "VAT Validation",
                    pagePath: "api/vat-validation-rates-api.html",
                    pathHints: ["vat-validation"],
                    aliases: ["VAT Validation", "VAT Validation API", "VAT Validation & Rates"],
                },
                ibanValidation: {
                    enabled: false,
                    name: "IBAN Validation",
                    pagePath: "api/iban-validation.html",
                    pathHints: ["iban-validation"],
                    aliases: ["IBAN Validation", "IBAN Validation API"],
                },
            },
        },
        pages: {
            /*
             * Pages can be retired here without deleting their archived HTML.
             * Disabled pages are removed from site navigation and externalized links
             * that point at those public paths are hidden from the live experience.
             */
            items: {
                guides: {
                    enabled: false,
                    name: "Guides",
                    publicPath: "guides.html",
                    archivedPath: "pages/retired-pages/guides.html",
                    pathHints: ["/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v001.002.009/guides", "guides.html"],
                },
                integrations: {
                    enabled: false,
                    name: "Integrations",
                    publicPath: "integrations.html",
                    archivedPath: "pages/retired-pages/integrations.html",
                    pathHints: ["/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v001.002.009/integrations", "integrations.html"],
                },
                resources: {
                    enabled: false,
                    name: "Resources",
                    publicPath: "resources.html",
                    archivedPath: "pages/retired-pages/resources.html",
                    pathHints: ["/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v001.002.009/resources", "resources.html"],
                },
                domainReputationChecker: {
                    enabled: false,
                    name: "Domain Reputation Checker",
                    publicPath: "domain-reputation-checker.html",
                    archivedPath: "pages/retired-pages/domain-reputation-checker.html",
                    pathHints: ["/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v001.002.009/domain-reputation-checker", "domain-reputation-checker.html"],
                },
                companyEnrichmentPage: {
                    enabled: false,
                    name: "Company Enrichment page",
                    publicPath: "api/company-enrichment.html",
                    archivedPath: "pages/retired-pages/api/company-enrichment.html",
                    pathHints: ["/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v001.002.009/api/company-enrichment", "api/company-enrichment.html"],
                },
                emailReputationPage: {
                    enabled: false,
                    name: "Email Reputation page",
                    publicPath: "api/email-reputation-api.html",
                    archivedPath: "pages/retired-pages/api/email-reputation-api.html",
                    pathHints: ["/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v001.002.009/api/email-reputation-api", "api/email-reputation-api.html"],
                },
                customerRiskAssessment: {
                    enabled: false,
                    name: "Customer Risk Assessment",
                    publicPath: "solutions/customer-risk-assessment.html",
                    archivedPath: "pages/retired-pages/solutions/customer-risk-assessment.html",
                    pathHints: ["/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v001.002.009/solutions/customer-risk-assessment", "solutions/customer-risk-assessment.html"],
                },
                paymentFraudDetection: {
                    enabled: false,
                    name: "Payment Fraud Detection",
                    publicPath: "solutions/payment-fraud-detection.html",
                    archivedPath: "pages/retired-pages/solutions/payment-fraud-detection.html",
                    pathHints: ["/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v001.002.009/solutions/payment-fraud-detection", "solutions/payment-fraud-detection.html"],
                },
                disposableEmailChecker: {
                    enabled: false,
                    name: "Disposable Email Checker",
                    publicPath: "tools/disposable-email-checker.html",
                    archivedPath: "pages/retired-pages/tools/disposable-email-checker.html",
                    pathHints: ["/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v001.002.009/tools/disposable-email-checker", "tools/disposable-email-checker.html"],
                },
                dmarcCheck: {
                    enabled: false,
                    name: "DMARC Check",
                    publicPath: "tools/dmarc-check.html",
                    archivedPath: "pages/retired-pages/tools/dmarc-check.html",
                    pathHints: ["/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v001.002.009/tools/dmarc-check", "tools/dmarc-check.html"],
                },
                domainAgeChecker: {
                    enabled: false,
                    name: "Domain Age Checker",
                    publicPath: "tools/domain-age-checker.html",
                    archivedPath: "pages/retired-pages/tools/domain-age-checker.html",
                    pathHints: ["/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v001.002.009/tools/domain-age-checker", "tools/domain-age-checker.html"],
                },
                proxyDetector: {
                    enabled: false,
                    name: "Proxy Detector",
                    publicPath: "tools/proxy-detector.html",
                    archivedPath: "pages/retired-pages/tools/proxy-detector.html",
                    pathHints: ["/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v001.002.009/tools/proxy-detector", "tools/proxy-detector.html"],
                },
                spfCheck: {
                    enabled: false,
                    name: "SPF Check",
                    publicPath: "tools/spf-check.html",
                    archivedPath: "pages/retired-pages/tools/spf-check.html",
                    pathHints: ["/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v001.002.009/tools/spf-check", "tools/spf-check.html"],
                },
            },
        },
        features: {
            /*
             * Decorative motion is configurable here so performance changes do not
             * require hand-editing the page templates later.
             */
            heroRainAnimation: {
                enabled: true,
                useLegacyDensity: true,
                legacyDensityMultiplier: 12.1,
                densityPerViewportPixel: 0.12,
                minParticles: 36,
                maxParticles: 180,
            },
            decorativeLottieAnimations: true,
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
        "--color-nav-shell-background": theme.colors.nav.shellBackground,
        "--color-nav-shell-border": theme.colors.nav.shellBorder,
        "--color-nav-trigger-text": theme.colors.nav.triggerText,
        "--color-nav-trigger-hover-text": theme.colors.nav.triggerHoverText,
        "--color-nav-trigger-active-background": theme.colors.nav.triggerActiveBackground,
        "--color-nav-dropdown-surface": theme.colors.nav.dropdownSurface,
        "--color-nav-dropdown-border": theme.colors.nav.dropdownBorder,
        "--color-nav-dropdown-divider": theme.colors.nav.dropdownDivider,
        "--color-nav-dropdown-heading-text": theme.colors.nav.dropdownHeadingText,
        "--color-nav-dropdown-text": theme.colors.nav.dropdownText,
        "--color-nav-dropdown-muted-text": theme.colors.nav.dropdownMutedText,
        "--color-nav-dropdown-hover-background": theme.colors.nav.dropdownHoverBackground,
        "--color-nav-cta-panel-background": theme.colors.nav.ctaPanelBackground,
        "--color-nav-cta-panel-text": theme.colors.nav.ctaPanelText,
        "--color-nav-cta-input-background": theme.colors.nav.ctaInputBackground,
        "--color-nav-cta-input-text": theme.colors.nav.ctaInputText,
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

    const disabledProductSelectors = Object.values(theme.products.items)
        .filter((product) => !product.enabled)
        .flatMap((product) =>
            product.pathHints
                .filter((hint) => !hint.includes(" "))
                .map((hint) => `a[href*="${hint}"]`)
        );
    const disabledPageSelectors = Object.values(theme.pages.items)
        .filter((page) => !page.enabled)
        .flatMap((page) => page.pathHints.map((hint) => `a[href*="${hint}"]`));

    if (disabledProductSelectors.length) {
        themeStyle.textContent += `\n${disabledProductSelectors.join(",\n")} { display: none !important; }`;
    }

    if (disabledPageSelectors.length) {
        themeStyle.textContent += `\n${disabledPageSelectors.join(",\n")} { display: none !important; }`;
    }

    if (!theme.features.heroRainAnimation.enabled) {
        themeStyle.textContent += "\n#rain-canvas { display: none !important; }";
    }

    if (!theme.features.decorativeLottieAnimations) {
        themeStyle.textContent += '\n[data-animation-type="lottie"] { display: none !important; }';
    }

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
    const siteRootUrl = new URL("../", scriptUrl);

    const normalizeProductValue = (value) =>
        decodeURIComponent(String(value || ""))
            .toLowerCase()
            .replace(/&amp;/g, "&")
            .replace(/\s+/g, " ")
            .trim();

    const productEntries = Object.entries(theme.products.items);
    const pageEntries = Object.entries(theme.pages.items);

    const getProductKeyForValue = (value) => {
        const comparableValue = normalizeProductValue(value);

        if (!comparableValue) {
            return undefined;
        }

        const matchingProduct = productEntries.find(([, product]) => {
            const searchValues = [...product.pathHints, ...product.aliases].map(normalizeProductValue);
            return searchValues.some((searchValue) => comparableValue.includes(searchValue));
        });

        return matchingProduct ? matchingProduct[0] : undefined;
    };

    const getProductKeyForElement = (element) => {
        if (!element) {
            return undefined;
        }

        const explicitKey = element.getAttribute("data-product-key");
        if (explicitKey) {
            return explicitKey;
        }

        return getProductKeyForValue(`${element.getAttribute("href") || ""} ${element.textContent || ""}`);
    };

    const isProductEnabled = (productKey) => Boolean(theme.products.items[productKey] && theme.products.items[productKey].enabled);
    const isPageEnabled = (pageKey) => Boolean(theme.pages.items[pageKey] && theme.pages.items[pageKey].enabled);

    const getPageKeyForValue = (value) => {
        const comparableValue = normalizeProductValue(value);

        if (!comparableValue) {
            return undefined;
        }

        const matchingPage = pageEntries.find(([, page]) =>
            page.pathHints.map(normalizeProductValue).some((searchValue) => comparableValue.includes(searchValue))
        );

        return matchingPage ? matchingPage[0] : undefined;
    };

    const getPageKeyForElement = (element) => {
        if (!element) {
            return undefined;
        }

        const explicitKey = element.getAttribute("data-page-key");
        if (explicitKey) {
            return explicitKey;
        }

        return getPageKeyForValue(`${element.getAttribute("href") || ""} ${element.textContent || ""}`);
    };

    const hideRetiredElement = (element, availabilityKind = "generic") => {
        if (!element) {
            return;
        }

        element.hidden = true;
        element.style.display = "none";
        element.setAttribute("aria-hidden", "true");
        element.setAttribute("data-availability", "disabled");

        if (availabilityKind !== "generic") {
            element.setAttribute(`data-${availabilityKind}-availability`, "disabled");
        }
    };

    const redirectDisabledProductPage = () => {
        if (!theme.products.redirectDisabledPagesToPrimary) {
            return;
        }

        const currentPath = normalizeProductValue(window.location.pathname);
        const currentProductEntry = productEntries.find(([, product]) => currentPath.endsWith(normalizeProductValue(product.pagePath)));

        if (!currentProductEntry) {
            return;
        }

        const [currentProductKey] = currentProductEntry;
        if (isProductEnabled(currentProductKey)) {
            return;
        }

        const activeProduct = theme.products.items[theme.products.primaryProductKey];
        if (!activeProduct || !activeProduct.pagePath) {
            return;
        }

        window.location.replace(new URL(activeProduct.pagePath, siteRootUrl).href);
    };

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

    const applyProductAvailability = () => {
        document.querySelectorAll("a[href], [data-product-key]").forEach((element) => {
            const productKey = getProductKeyForElement(element);

            if (productKey && !isProductEnabled(productKey)) {
                hideRetiredElement(element, "product");
            }
        });

        document.querySelectorAll(".guides-api-heading").forEach((heading) => {
            const productKey = getProductKeyForElement(heading.querySelector("a")) || getProductKeyForValue(heading.textContent);

            if (!productKey || isProductEnabled(productKey)) {
                return;
            }

            let sectionNode = heading;
            while (sectionNode && (sectionNode === heading || !sectionNode.classList.contains("guides-api-heading"))) {
                hideRetiredElement(sectionNode, "product");
                sectionNode = sectionNode.nextElementSibling;
            }
        });

        document.querySelectorAll(".nav-links-block-2").forEach((group) => {
            if (!group.querySelector("a:not([hidden])")) {
                hideRetiredElement(group, "product");
            }
        });

        document.querySelectorAll(".links-footer-wrapper").forEach((group) => {
            if (!group.querySelector(".link-footer:not([hidden])")) {
                hideRetiredElement(group, "product");
            }
        });

        document.querySelectorAll(".show-more-wrapper").forEach((group) => {
            if (!group.querySelector("a:not([hidden])")) {
                hideRetiredElement(group, "product");
            }
        });

        document.querySelectorAll(".apis-cards-side-wrapper").forEach((group) => {
            if (group.querySelector("a") && !group.querySelector("a:not([hidden])")) {
                hideRetiredElement(group, "product");
            }
        });

        document.querySelectorAll(".nav-link-subtext-2").forEach((element) => {
            if (
                normalizeProductValue(element.textContent) ===
                normalizeProductValue("Useful guides about our Email validation API, IP geolocation API, Phone validation API and more.")
            ) {
                element.textContent = "Useful guides about our Email Intelligence API.";
            }
        });

        document.querySelectorAll(".catalogue-menu").forEach((menu) => {
            const activeProductCount = menu.querySelectorAll(".nav-link-block-desktop-2:not([hidden])").length;
            menu.classList.toggle("is-single-product", activeProductCount === 1);
        });
    };

    const applyPageAvailability = () => {
        document.querySelectorAll("a[href], [data-page-key]").forEach((element) => {
            const pageKey = getPageKeyForElement(element);

            if (pageKey && !isPageEnabled(pageKey)) {
                hideRetiredElement(element, "page");
            }
        });

        // document.querySelectorAll(".resources-menu").forEach((menu) => {
        document.querySelectorAll(".company-menu").forEach((menu) => {            
            if (menu.querySelector("a:not([hidden])")) {
                return;
            }

            hideRetiredElement(menu, "page");

            const trigger = document.getElementById(menu.id.replace("-menu", "-dropdown"));
            hideRetiredElement(trigger, "page");
        });
    };

    const applyFeatureFlags = () => {
        if (!theme.features.heroRainAnimation.enabled) {
            const rainCanvas = document.getElementById("rain-canvas");
            if (rainCanvas) {
                rainCanvas.hidden = true;
            }
        }

        if (!theme.features.decorativeLottieAnimations) {
            document.querySelectorAll('[data-animation-type="lottie"]').forEach((element) => {
                element.hidden = true;
                element.removeAttribute("data-animation-type");
                element.removeAttribute("data-src");
            });
        }
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
    redirectDisabledProductPage();

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            applyBrandAssets();
            applyBrandLinks();
            applyProductAvailability();
            applyPageAvailability();
            applyFeatureFlags();
            updateStructuredBrandData();
        });
    } else {
        applyBrandAssets();
        applyBrandLinks();
        applyProductAvailability();
        applyPageAvailability();
        applyFeatureFlags();
        updateStructuredBrandData();
    }
})();
