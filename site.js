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

    // Scroll progress bar.
    var progress = document.createElement('div');
    progress.className = 'scroll-progress';
    document.body.appendChild(progress);
    var updateProgress = function() {
        var scrollable = document.documentElement.scrollHeight - window.innerHeight;
        var pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
        progress.style.width = pct + '%';
    };
    document.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    updateProgress();

    // Mobile nav toggle.
    var links = document.querySelector('nav .links');
    if (links && nav) {
        var toggle = document.createElement('button');
        toggle.className = 'nav-toggle';
        toggle.setAttribute('aria-label', 'Toggle menu');
        toggle.innerHTML = '<span></span>';
        nav.appendChild(toggle);

        var scrim = document.createElement('div');
        scrim.className = 'nav-scrim';
        document.body.appendChild(scrim);

        var closeMenu = function() {
            toggle.classList.remove('open');
            links.classList.remove('open');
            scrim.classList.remove('open');
        };
        var openMenu = function() {
            toggle.classList.add('open');
            links.classList.add('open');
            scrim.classList.add('open');
        };

        toggle.addEventListener('click', function() {
            if (links.classList.contains('open')) closeMenu();
            else openMenu();
        });
        scrim.addEventListener('click', closeMenu);
        links.querySelectorAll('a').forEach(function(a) {
            a.addEventListener('click', closeMenu);
        });
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

    // Animated count-up for .stat-block .num elements once they enter view.
    var statNums = document.querySelectorAll('.stat-block .num[data-count]');
    if (statNums.length && 'IntersectionObserver' in window) {
        var animateCount = function(el) {
            var target = parseFloat(el.getAttribute('data-count'));
            var suffix = el.getAttribute('data-suffix') || '';
            var duration = 1400;
            var start = null;
            var step = function(ts) {
                if (!start) start = ts;
                var progress = Math.min((ts - start) / duration, 1);
                var eased = 1 - Math.pow(1 - progress, 3);
                var value = Math.floor(eased * target);
                el.textContent = value.toLocaleString() + suffix;
                if (progress < 1) requestAnimationFrame(step);
                else el.textContent = target.toLocaleString() + suffix;
            };
            requestAnimationFrame(step);
        };
        var statObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    animateCount(entry.target);
                    statObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.4 });
        statNums.forEach(function(el) { statObserver.observe(el); });
    }
})();
