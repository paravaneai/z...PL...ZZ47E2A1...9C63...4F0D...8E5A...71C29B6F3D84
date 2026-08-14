(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-nav-links]');

    if (!toggle || !nav) {
        return;
    }

    toggle.addEventListener('click', function () {
        var isOpen = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    nav.addEventListener('click', function (event) {
        if (event.target.tagName.toLowerCase() === 'a') {
            nav.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });
}());
