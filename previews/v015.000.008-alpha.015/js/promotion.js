/* ==========================================================================
   Paravane homepage behavior-triggered campaign

   Update CAMPAIGN to change campaign content, eligibility, suppression, or
   destinations. Changing campaignKey allows a new version to display even
   when an earlier campaign has already been dismissed or selected.
   ========================================================================== */
(function () {
    "use strict";

    var CAMPAIGN = {
        enabled: true,
        campaignKey: "smtprs-homepage-risk-preview-v1",
        minimumTime: 25000,
        minimumScrollDepth: 0.35,
        dismissalSuppressionDays: 14,
        idleRetryDelay: 1000,
        closeTransitionDuration: 220,
        primaryCtaDestination: "../pages/products/smtprs#live-preview",
        secondaryCtaDestination: "../pages/auth/register",
        eyebrow: "Email validation & risk scoring API",
        headline: "Your signup form checks syntax. smtpRS checks the risk.",
        bodyText: "Evaluate an email address using syntax, domain, mail, authentication, disposable-email, and related risk signals before it reaches your application.",
        primaryCtaLabel: "Run the live preview",
        secondaryCtaLabel: "Create an account",
        note: "The public preview uses public signals and does not require an account."
    };

    var STORAGE_PREFIX = "paravane-promotion:";
    var MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
    var root = document.documentElement;
    var backdrop = document.querySelector("[data-campaign-promo-backdrop]");
    var dialog = document.querySelector("[data-campaign-promo-dialog]");
    var closeButton = document.querySelector("[data-campaign-promo-close]");
    var timeQualified = false;
    var scrollQualified = false;
    var hasOpenedThisPageview = false;
    var isOpen = false;
    var eligibilityTimer = null;
    var idleRetryTimer = null;
    var closeTimer = null;
    var previousFocus = null;
    var lockedScrollY = 0;
    var savedBodyStyles = null;

    function storageKey() {
        return STORAGE_PREFIX + CAMPAIGN.campaignKey;
    }

    function readCampaignState() {
        var raw;

        try {
            raw = window.localStorage.getItem(storageKey());
            return raw ? JSON.parse(raw) : null;
        } catch (err) {
            return null;
        }
    }

    function writeCampaignState(action, detail) {
        var state = {
            campaignKey: CAMPAIGN.campaignKey,
            action: action,
            detail: detail || "",
            timestamp: Date.now()
        };

        try {
            window.localStorage.setItem(storageKey(), JSON.stringify(state));
        } catch (err) {}
    }

    function campaignIsSuppressed() {
        var state = readCampaignState();
        var suppressionWindow;

        if (!state || state.campaignKey !== CAMPAIGN.campaignKey || !state.timestamp) return false;
        if (state.action === "cta") return true;
        if (state.action !== "dismissed") return false;

        suppressionWindow = Math.max(0, CAMPAIGN.dismissalSuppressionDays) * MILLISECONDS_PER_DAY;
        return Date.now() - Number(state.timestamp) < suppressionWindow;
    }

    function setCampaignContent() {
        var headline = backdrop.querySelector("[data-campaign-promo-headline]");
        var body = backdrop.querySelector("[data-campaign-promo-body]");
        var eyebrow = backdrop.querySelector("[data-campaign-promo-eyebrow]");
        var note = backdrop.querySelector("[data-campaign-promo-note]");
        var primaryCta = backdrop.querySelector('[data-campaign-promo-cta="preview"]');
        var secondaryCta = backdrop.querySelector('[data-campaign-promo-cta="account"]');

        if (headline) headline.textContent = CAMPAIGN.headline;
        if (body) body.textContent = CAMPAIGN.bodyText;
        if (eyebrow) eyebrow.textContent = CAMPAIGN.eyebrow;
        if (note) note.textContent = CAMPAIGN.note;

        if (primaryCta) {
            primaryCta.href = CAMPAIGN.primaryCtaDestination;
            primaryCta.innerHTML = CAMPAIGN.primaryCtaLabel + ' <span aria-hidden="true">&rarr;</span>';
        }

        if (secondaryCta) {
            secondaryCta.href = CAMPAIGN.secondaryCtaDestination;
            secondaryCta.textContent = CAMPAIGN.secondaryCtaLabel;
        }
    }

    function scrollDepth() {
        var scrollingElement = document.scrollingElement || root;
        var availableScroll = Math.max(0, scrollingElement.scrollHeight - window.innerHeight);

        if (availableScroll === 0) return 1;
        return Math.min(1, Math.max(0, window.scrollY || scrollingElement.scrollTop || 0) / availableScroll);
    }

    function uiIsBusy() {
        var header = document.querySelector(".site-header");
        var startupLoader = document.querySelector(".animationload");

        if (document.hidden) return true;
        if (root.classList.contains("mobile-nav-is-open")) return true;
        if (root.classList.contains("site-loader-active")) return true;
        if (root.classList.contains("site-is-leaving")) return true;
        if (root.classList.contains("site-is-arriving")) return true;
        if (header && header.querySelector(".nav-catalog.is-open")) return true;
        if (startupLoader && !startupLoader.classList.contains("is-hidden") && !root.classList.contains("site-platform-loader-skipped")) return true;
        return false;
    }

    function focusableElements() {
        return Array.prototype.slice.call(dialog.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )).filter(function (element) {
            return element.getClientRects().length > 0;
        });
    }

    function moveFocusIntoDialog() {
        if (!isOpen) return;

        closeButton.focus({ preventScroll: true });

        /* Keep keyboard users inside the dialog if the browser rejects focus
           while the backdrop is transitioning into its rendered state. */
        if (!dialog.contains(document.activeElement)) {
            dialog.focus({ preventScroll: true });
        }
    }

    function setBackgroundInert(active) {
        Array.prototype.forEach.call(document.body.children, function (element) {
            if (element === backdrop) return;

            if (active) {
                if (!element.inert) {
                    element.inert = true;
                    element.setAttribute("data-campaign-promo-inert", "");
                }
            } else if (element.hasAttribute("data-campaign-promo-inert")) {
                element.inert = false;
                element.removeAttribute("data-campaign-promo-inert");
            }
        });
    }

    function lockPageScroll() {
        var body = document.body;

        lockedScrollY = window.scrollY || 0;
        savedBodyStyles = {
            position: body.style.position,
            top: body.style.top,
            right: body.style.right,
            left: body.style.left,
            width: body.style.width,
            overflow: body.style.overflow
        };

        body.style.position = "fixed";
        body.style.top = -lockedScrollY + "px";
        body.style.right = "0";
        body.style.left = "0";
        body.style.width = "100%";
        body.style.overflow = "hidden";
        root.classList.add("campaign-promo-is-open");
    }

    function unlockPageScroll() {
        var body = document.body;
        var priorScrollBehavior = root.style.scrollBehavior;

        if (!savedBodyStyles) return;

        body.style.position = savedBodyStyles.position;
        body.style.top = savedBodyStyles.top;
        body.style.right = savedBodyStyles.right;
        body.style.left = savedBodyStyles.left;
        body.style.width = savedBodyStyles.width;
        body.style.overflow = savedBodyStyles.overflow;
        root.classList.remove("campaign-promo-is-open");
        root.style.scrollBehavior = "auto";
        window.scrollTo(0, lockedScrollY);

        window.requestAnimationFrame(function () {
            root.style.scrollBehavior = priorScrollBehavior;
        });

        savedBodyStyles = null;
    }

    function stopEligibilityTracking() {
        window.clearTimeout(eligibilityTimer);
        window.clearTimeout(idleRetryTimer);
        window.removeEventListener("scroll", evaluateScrollEligibility);
        window.removeEventListener("resize", evaluateScrollEligibility);
    }

    function openPromotion() {
        if (isOpen || hasOpenedThisPageview || campaignIsSuppressed() || uiIsBusy()) return;

        hasOpenedThisPageview = true;
        isOpen = true;
        previousFocus = document.activeElement !== document.body ? document.activeElement : null;
        stopEligibilityTracking();
        window.clearTimeout(closeTimer);
        backdrop.hidden = false;
        setBackgroundInert(true);
        lockPageScroll();

        window.requestAnimationFrame(function () {
            backdrop.classList.add("is-open");
            window.requestAnimationFrame(moveFocusIntoDialog);
        });
    }

    function closePromotion(reason) {
        if (!isOpen) return;

        isOpen = false;
        writeCampaignState("dismissed", reason);
        backdrop.classList.remove("is-open");
        setBackgroundInert(false);
        unlockPageScroll();

        if (previousFocus && previousFocus.isConnected && typeof previousFocus.focus === "function") {
            previousFocus.focus({ preventScroll: true });
        }

        window.clearTimeout(closeTimer);
        closeTimer = window.setTimeout(function () {
            if (!isOpen) backdrop.hidden = true;
        }, CAMPAIGN.closeTransitionDuration);
    }

    function tryToOpen() {
        if (!timeQualified || !scrollQualified || hasOpenedThisPageview || campaignIsSuppressed()) return;

        if (uiIsBusy()) {
            window.clearTimeout(idleRetryTimer);
            idleRetryTimer = window.setTimeout(tryToOpen, CAMPAIGN.idleRetryDelay);
            return;
        }

        openPromotion();
    }

    function evaluateScrollEligibility() {
        scrollQualified = scrollDepth() >= CAMPAIGN.minimumScrollDepth;
        tryToOpen();
    }

    function handleDialogKeydown(event) {
        var focusable;
        var first;
        var last;

        if (!isOpen) return;

        if (event.key === "Escape") {
            event.preventDefault();
            closePromotion("escape");
            return;
        }

        if (event.key !== "Tab") return;

        focusable = focusableElements();
        if (!focusable.length) {
            event.preventDefault();
            dialog.focus();
            return;
        }

        first = focusable[0];
        last = focusable[focusable.length - 1];

        if (!dialog.contains(document.activeElement)) {
            event.preventDefault();
            (event.shiftKey ? last : first).focus({ preventScroll: true });
            return;
        }

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    function initializeCampaign() {
        var ctaLinks;

        if (!CAMPAIGN.enabled || !backdrop || !dialog || !closeButton || campaignIsSuppressed()) return;

        setCampaignContent();
        ctaLinks = backdrop.querySelectorAll("[data-campaign-promo-cta]");

        closeButton.addEventListener("click", function () {
            closePromotion("close-button");
        });

        backdrop.addEventListener("click", function (event) {
            if (event.target === backdrop) closePromotion("backdrop");
        });

        Array.prototype.forEach.call(ctaLinks, function (link) {
            link.addEventListener("click", function () {
                writeCampaignState("cta", link.getAttribute("data-campaign-promo-cta"));
            });
        });

        document.addEventListener("keydown", handleDialogKeydown);
        document.addEventListener("visibilitychange", tryToOpen);
        window.addEventListener("load", tryToOpen, { once: true });
        window.addEventListener("scroll", evaluateScrollEligibility, { passive: true });
        window.addEventListener("resize", evaluateScrollEligibility, { passive: true });
        window.addEventListener("paravane:mobile-nav-statechange", tryToOpen);

        eligibilityTimer = window.setTimeout(function () {
            timeQualified = true;
            tryToOpen();
        }, Math.max(0, CAMPAIGN.minimumTime));

        evaluateScrollEligibility();
    }

    initializeCampaign();
})();
