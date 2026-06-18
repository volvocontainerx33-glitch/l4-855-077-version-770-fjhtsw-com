(() => {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('is-open');
        });
    }

    const markMissingImages = () => {
        document.querySelectorAll('img').forEach((image) => {
            const parent = image.parentElement;
            const mark = () => {
                if (parent) {
                    parent.classList.add('image-missing');
                }
                image.style.opacity = '0';
            };

            if (image.complete && image.naturalWidth === 0) {
                mark();
            }

            image.addEventListener('error', mark, { once: true });
        });
    };

    markMissingImages();

    const hero = document.querySelector('[data-hero]');
    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let current = 0;
        let timer = null;

        const showSlide = (index) => {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        const startTimer = () => {
            window.clearInterval(timer);
            timer = window.setInterval(() => showSlide(current + 1), 5200);
        };

        dots.forEach((dot) => {
            dot.addEventListener('click', () => {
                showSlide(Number(dot.dataset.heroDot || 0));
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener('click', () => {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', () => {
                showSlide(current + 1);
                startTimer();
            });
        }

        showSlide(0);
        startTimer();
    }

    const panels = Array.from(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach((panel) => {
        const container = panel.parentElement;
        if (!container) {
            return;
        }
        const cards = Array.from(container.querySelectorAll('[data-movie-list] .movie-card'));
        const searchInput = panel.querySelector('[data-search-input]');
        const typeFilter = panel.querySelector('[data-type-filter]');
        const genreFilter = panel.querySelector('[data-genre-filter]');

        const normalize = (value) => String(value || '').trim().toLowerCase();

        const applyFilters = () => {
            const query = normalize(searchInput ? searchInput.value : '');
            const type = normalize(typeFilter ? typeFilter.value : '');
            const genre = normalize(genreFilter ? genreFilter.value : '');

            cards.forEach((card) => {
                const haystack = normalize(card.dataset.search);
                const cardType = normalize(card.dataset.type);
                const cardGenre = normalize(card.dataset.genre);
                const matchesQuery = !query || haystack.includes(query);
                const matchesType = !type || cardType === type;
                const matchesGenre = !genre || cardGenre.includes(genre);
                card.classList.toggle('is-hidden', !(matchesQuery && matchesType && matchesGenre));
            });
        };

        [searchInput, typeFilter, genreFilter].forEach((control) => {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });
    });

    const player = document.getElementById('movie-player');
    const playButton = document.querySelector('[data-play-button]');
    let hlsInstance = null;

    const loadHlsLibrary = (callback) => {
        if (window.Hls) {
            callback();
            return;
        }

        const existing = document.querySelector('script[data-hls-loader]');
        if (existing) {
            existing.addEventListener('load', callback, { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
        script.async = true;
        script.dataset.hlsLoader = 'true';
        script.onload = callback;
        document.head.appendChild(script);
    };

    const showPlaybackMessage = (message) => {
        if (!playButton) {
            return;
        }
        const title = playButton.querySelector('strong');
        if (title) {
            title.textContent = message;
        }
        playButton.classList.remove('is-hidden');
    };

    const beginPlayback = () => {
        if (!player) {
            return;
        }

        const source = player.dataset.src;
        if (!source) {
            showPlaybackMessage('当前视频源暂不可用');
            return;
        }

        if (playButton) {
            playButton.classList.add('is-hidden');
        }

        if (player.canPlayType('application/vnd.apple.mpegurl')) {
            if (player.src !== source) {
                player.src = source;
            }
            player.play().catch(() => showPlaybackMessage('点击视频继续播放'));
            return;
        }

        loadHlsLibrary(() => {
            if (window.Hls && window.Hls.isSupported()) {
                if (!hlsInstance) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(player);
                }
                player.play().catch(() => showPlaybackMessage('点击视频继续播放'));
            } else {
                player.src = source;
                player.play().catch(() => showPlaybackMessage('当前浏览器无法直接播放该视频源'));
            }
        });
    };

    if (player && playButton) {
        playButton.addEventListener('click', beginPlayback);
        player.addEventListener('click', () => {
            if (player.paused) {
                beginPlayback();
            }
        });
        player.addEventListener('error', () => showPlaybackMessage('视频加载失败，请稍后重试'));
    }
})();
