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

    // Reveal-sweep for ornate dividers (reuses the same IntersectionObserver pattern as .reveal,
    // kept separate since dividers use their own ::after shimmer, not opacity/transform).
    var dividers = document.querySelectorAll('.ornate-divider, .divider');
    if (dividers.length && 'IntersectionObserver' in window) {
        var divObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    divObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.4 });
        dividers.forEach(function(el) { divObserver.observe(el); });
    }

    // Cursor torch-glow - a soft radial light that follows the pointer, lerped for smoothness.
    // Skipped on touch devices and when the user prefers reduced motion (both checked via media
    // queries so no JS work happens at all on those setups, not just a hidden/inert element).
    var finePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (finePointer && !reducedMotion) {
        var glow = document.createElement('div');
        glow.className = 'cursor-glow';
        document.body.appendChild(glow);
        var glowX = 0, glowY = 0, targetX = 0, targetY = 0, glowActive = false;
        document.addEventListener('mousemove', function(e) {
            targetX = e.clientX;
            targetY = e.clientY;
            if (!glowActive) {
                glowActive = true;
                glow.classList.add('active');
            }
        }, { passive: true });
        var tickGlow = function() {
            glowX += (targetX - glowX) * 0.12;
            glowY += (targetY - glowY) * 0.12;
            glow.style.transform = 'translate(' + glowX + 'px, ' + glowY + 'px) translate(-50%, -50%)';
            requestAnimationFrame(tickGlow);
        };
        requestAnimationFrame(tickGlow);

        // Subtle 3D tilt on cards/steps/packages, following pointer position within each card.
        var tiltTargets = document.querySelectorAll('.card, .step, .package');
        tiltTargets.forEach(function(el) {
            el.addEventListener('mousemove', function(e) {
                var rect = el.getBoundingClientRect();
                var px = (e.clientX - rect.left) / rect.width - 0.5;
                var py = (e.clientY - rect.top) / rect.height - 0.5;
                var rotY = px * 10;
                var rotX = py * -10;
                el.style.transform = 'perspective(700px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) translateY(-6px)';
            });
            el.addEventListener('mouseleave', function() {
                el.style.transform = '';
            });
        });
    }

    // Fixed film-grain overlay, added once site-wide for a less flat/digital dark background.
    var grain = document.createElement('div');
    grain.className = 'grain-overlay';
    document.body.appendChild(grain);

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
