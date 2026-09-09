(function () {
    var root = document.documentElement;
    var stage = document.querySelector('.mkt-signal-stage');

    if (!stage) {
        return;
    }

    var reducedMotion = false;

    try {
        reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (err) {
        reducedMotion = false;
    }

    if (reducedMotion) {
        root.style.setProperty('--mkt-hero-implode', '0');
        return;
    }

    var ticking = false;
    var collapseDistance = 280;

    function apply() {
        var progress = Math.min(Math.max(window.scrollY / collapseDistance, 0), 1);
        root.style.setProperty('--mkt-hero-implode', progress.toFixed(4));
        root.toggleAttribute('data-hero-console-expanded', progress < 0.02);
        ticking = false;
    }

    function requestApply() {
        if (ticking) {
            return;
        }

        ticking = true;
        window.requestAnimationFrame(apply);
    }

    window.addEventListener('scroll', requestApply, { passive: true });
    window.addEventListener('resize', requestApply, { passive: true });
    apply();
})();
