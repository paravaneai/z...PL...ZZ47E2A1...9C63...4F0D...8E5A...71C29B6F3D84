(function () {
    "use strict";

    var target = "../pages/careers/jobs/";
    var countdown = document.querySelector("[data-careers-return-countdown]");
    var emailStatus = document.querySelector("[data-careers-email-status]");
    var confirmation = new URLSearchParams(window.location.search).get("confirmation");
    var seconds = 6;

    function renderEmailStatus() {
        if (!emailStatus || !confirmation) return;
        emailStatus.hidden = false;
        emailStatus.textContent = confirmation === "sent"
            ? "A confirmation email has been sent to the address provided with your application."
            : "Your application was received, but the confirmation email could not be sent. Please do not submit the application again.";
    }

    function render() {
        if (countdown) countdown.textContent = String(seconds);
    }

    function navigate() {
        var url = new URL(target, window.location.origin);
        if (window.ParavanePageTransition && typeof window.ParavanePageTransition.begin === "function") {
            window.ParavanePageTransition.begin(url);
            return;
        }
        window.location.replace(url.href);
    }

    renderEmailStatus();
    render();
    var interval = window.setInterval(function () {
        seconds -= 1;
        render();
        if (seconds <= 0) {
            window.clearInterval(interval);
            navigate();
        }
    }, 1000);
})();
