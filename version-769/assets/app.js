(function () {
    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function one(selector, root) {
        return (root || document).querySelector(selector);
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function openMobileNav() {
        var toggle = one('[data-nav-toggle]');
        var nav = one('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function bindSearchForms() {
        all('[data-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = one('input[name="q"]', form);
                var query = input ? input.value.trim() : '';
                var action = form.getAttribute('action') || './search.html';
                var joiner = action.indexOf('?') === -1 ? '?' : '&';
                window.location.href = action + joiner + 'q=' + encodeURIComponent(query);
            });
        });
    }

    function heroCarousel() {
        var wrap = one('[data-hero-carousel]');
        if (!wrap) {
            return;
        }
        var slides = all('.hero-slide', wrap);
        var dots = all('.hero-dot', wrap);
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(index);
                start();
            });
        });
        show(0);
        start();
    }

    function featuredCarousel() {
        var wrap = one('[data-featured-carousel]');
        if (!wrap) {
            return;
        }
        var track = one('.featured-track', wrap);
        var slides = all('.featured-slide', wrap);
        var buttons = all('.carousel-tabs button', wrap);
        if (!track || !slides.length) {
            return;
        }
        var current = 0;
        function show(index) {
            current = (index + slides.length) % slides.length;
            track.style.transform = 'translateX(-' + current * 100 + '%)';
            buttons.forEach(function (button, buttonIndex) {
                button.classList.toggle('is-active', buttonIndex === current);
            });
        }
        buttons.forEach(function (button, index) {
            button.addEventListener('click', function () {
                show(index);
            });
        });
        window.setInterval(function () {
            show(current + 1);
        }, 5600);
        show(0);
    }

    function cardFilters() {
        all('[data-filter-panel]').forEach(function (panel) {
            var input = one('[data-filter-input]', panel);
            var region = one('[data-filter-region]', panel);
            var type = one('[data-filter-type]', panel);
            var year = one('[data-filter-year]', panel);
            var targetSelector = panel.getAttribute('data-filter-target');
            var target = targetSelector ? one(targetSelector) : null;
            var cards = target ? all('.movie-card', target) : all('.movie-card');
            var empty = target ? one('.empty-state', target.parentNode) : one('.empty-state');
            var status = one('[data-filter-status]', panel);
            function apply() {
                var query = normalize(input && input.value);
                var regionValue = normalize(region && region.value);
                var typeValue = normalize(type && type.value);
                var yearValue = normalize(year && year.value);
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-genre')
                    ].join(' '));
                    var match = true;
                    if (query && haystack.indexOf(query) === -1) {
                        match = false;
                    }
                    if (regionValue && normalize(card.getAttribute('data-region')) !== regionValue) {
                        match = false;
                    }
                    if (typeValue && normalize(card.getAttribute('data-type')) !== typeValue) {
                        match = false;
                    }
                    if (yearValue && normalize(card.getAttribute('data-year')) !== yearValue) {
                        match = false;
                    }
                    card.style.display = match ? '' : 'none';
                    if (match) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
                if (status) {
                    status.textContent = visible === 0 ? '没有匹配的影片' : '筛选结果已更新';
                }
            }
            [input, region, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
            var params = new URLSearchParams(window.location.search);
            if (input && params.has('q')) {
                input.value = params.get('q') || '';
            }
            apply();
        });
    }

    window.initMoviePlayer = function (videoId, buttonId, sourceUrl) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        if (!video || !sourceUrl) {
            return;
        }
        var ready = false;
        var hlsInstance = null;
        function attach() {
            if (ready) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
            ready = true;
        }
        function play() {
            attach();
            video.controls = true;
            if (button) {
                button.classList.add('is-hidden');
            }
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    if (button) {
                        button.classList.remove('is-hidden');
                    }
                });
            }
        }
        if (button) {
            button.addEventListener('click', play);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        openMobileNav();
        bindSearchForms();
        heroCarousel();
        featuredCarousel();
        cardFilters();
    });
})();
