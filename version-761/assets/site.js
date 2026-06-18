(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function initMenu() {
        var button = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            var isOpen = panel.hasAttribute("hidden");
            if (isOpen) {
                panel.removeAttribute("hidden");
            } else {
                panel.setAttribute("hidden", "");
            }
            button.setAttribute("aria-expanded", String(isOpen));
        });
    }

    function initHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
        var prev = root.querySelector(".hero-prev");
        var next = root.querySelector(".hero-next");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function cardText(card) {
        return normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.tags,
            card.textContent
        ].join(" "));
    }

    function filterCards(scope, query, region, type, year) {
        var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .compact-card"));
        var q = normalize(query);
        var r = normalize(region);
        var t = normalize(type);
        var y = normalize(year);
        cards.forEach(function (card) {
            var ok = true;
            if (q && cardText(card).indexOf(q) === -1) {
                ok = false;
            }
            if (r && normalize(card.dataset.region).indexOf(r) === -1) {
                ok = false;
            }
            if (t && normalize(card.dataset.type).indexOf(t) === -1) {
                ok = false;
            }
            if (y && normalize(card.dataset.year) !== y) {
                ok = false;
            }
            card.classList.toggle("card-hidden", !ok);
        });
    }

    function initSearchPage() {
        var page = document.querySelector("[data-search-page]");
        if (!page) {
            return;
        }
        var input = page.querySelector("#searchInput");
        var region = page.querySelector("#regionFilter");
        var type = page.querySelector("#typeFilter");
        var year = page.querySelector("#yearFilter");
        var scope = page.querySelector(".filter-scope");
        var params = new URLSearchParams(window.location.search);
        if (params.get("q") && input) {
            input.value = params.get("q");
        }
        function run() {
            filterCards(scope, input.value, region.value, type.value, year.value);
        }
        [input, region, type, year].forEach(function (control) {
            if (control) {
                control.addEventListener("input", run);
                control.addEventListener("change", run);
            }
        });
        run();
    }

    function initInlineFilters() {
        var bars = Array.prototype.slice.call(document.querySelectorAll(".filter-bar"));
        bars.forEach(function (bar) {
            var section = bar.closest(".content-section");
            if (!section) {
                return;
            }
            var scope = section.querySelector(".filter-scope");
            var input = bar.querySelector(".inline-filter");
            var year = bar.querySelector(".inline-year");
            function run() {
                filterCards(scope, input ? input.value : "", "", "", year ? year.value : "");
            }
            if (input) {
                input.addEventListener("input", run);
            }
            if (year) {
                year.addEventListener("change", run);
            }
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var overlay = player.querySelector(".player-overlay");
            if (!video) {
                return;
            }
            var hlsInstance = null;

            function attach() {
                if (video.dataset.ready === "1") {
                    return;
                }
                var url = video.getAttribute("data-video");
                if (!url) {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(url);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = url;
                }
                video.dataset.ready = "1";
            }

            function play() {
                attach();
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {});
                }
            }

            if (overlay) {
                overlay.addEventListener("click", play);
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener("play", function () {
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
            });
            video.addEventListener("pause", function () {
                if (overlay && video.currentTime === 0) {
                    overlay.classList.remove("is-hidden");
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
        var playLinks = Array.prototype.slice.call(document.querySelectorAll(".scroll-play"));
        playLinks.forEach(function (link) {
            link.addEventListener("click", function (event) {
                event.preventDefault();
                var player = document.querySelector("[data-player]");
                if (player) {
                    player.scrollIntoView({ behavior: "smooth", block: "center" });
                    var button = player.querySelector(".player-overlay");
                    if (button) {
                        button.click();
                    }
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initSearchPage();
        initInlineFilters();
        initPlayers();
    });
})();
