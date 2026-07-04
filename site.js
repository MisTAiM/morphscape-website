(function() {
    // Nav gets a solid background once the page scrolls past the hero.
    var nav = document.querySelector('nav');
    if (nav) {
        var onScroll = function() {
            if (window.scrollY > 40) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        };
        document.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    // Fade + rise-in animation for cards/sections as they enter the viewport.
    var revealTargets = document.querySelectorAll('.reveal');
    if (revealTargets.length) {
        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15 });
            revealTargets.forEach(function(el) { observer.observe(el); });
        } else {
            revealTargets.forEach(function(el) { el.classList.add('in-view'); });
        }
    }

    // Floating embers inside any .embers container (hero backgrounds).
    document.querySelectorAll('.embers').forEach(function(container) {
        var count = 22;
        for (var i = 0; i < count; i++) {
            var ember = document.createElement('span');
            ember.className = 'ember';
            var left = Math.random() * 100;
            var duration = 6 + Math.random() * 7;
            var delay = Math.random() * 10;
            var drift = (Math.random() * 80 - 40) + 'px';
            var size = 2 + Math.random() * 3;
            ember.style.left = left + '%';
            ember.style.width = size + 'px';
            ember.style.height = size + 'px';
            ember.style.animationDuration = duration + 's';
            ember.style.animationDelay = delay + 's';
            ember.style.setProperty('--drift', drift);
            container.appendChild(ember);
        }
    });
})();
