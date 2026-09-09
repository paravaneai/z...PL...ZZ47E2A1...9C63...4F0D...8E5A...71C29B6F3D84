(() => {
    "use strict";
    const selector = "[data-visual-clock]";
    const pad = (value) => String(value).padStart(2, "0");
    function update() {
        const now = new Date();
        const display = `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())} UTC`;
        const datetime = now.toISOString();
        document.querySelectorAll(selector).forEach((clock) => {
            clock.textContent = display;
            clock.setAttribute("datetime", datetime);
        });
    }
    function start() {
        if (!document.querySelector(selector)) return;
        update();
        const delay = 1000 - (Date.now() % 1000);
        window.setTimeout(() => { update(); window.setInterval(update, 1000); }, delay);
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
    else start();
})();
