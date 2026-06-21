(function() {
    'use strict';
    const toggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.main-nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', function() {
        const isOpen = nav.classList.toggle('active');
        toggle.setAttribute('aria-expanded', isOpen);
        toggle.textContent = isOpen ? '✕' : '☰';
    });

    document.addEventListener('click', function(e) {
        if (!nav.contains(e.target) && !toggle.contains(e.target)) {
            nav.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.textContent = '☰';
        }
    });
})();
