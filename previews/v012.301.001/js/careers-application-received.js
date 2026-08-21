(function () {
    "use strict";

    var target = "../pages/careers/jobs/";
    var countdown = document.querySelector("[data-careers-return-countdown]");
    var seconds = 6;

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
