(function () {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.querySelector(".mobile-menu");

    if (toggle && menu) {
        toggle.addEventListener("click", function () {
            menu.classList.toggle("open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var index = 0;

    function showSlide(nextIndex) {
        if (!slides.length) {
            return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === index);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === index);
        });
    }

    dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
            showSlide(dotIndex);
        });
    });

    if (slides.length > 1) {
        showSlide(0);
        setInterval(function () {
            showSlide(index + 1);
        }, 5200);
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll(".search-input"));

    searchInputs.forEach(function (input) {
        var scopeSelector = input.getAttribute("data-scope") || "body";
        var scope = document.querySelector(scopeSelector) || document.body;
        var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
        var noResults = scope.querySelector(".no-results");

        input.addEventListener("input", function () {
            var keyword = input.value.trim().toLowerCase();
            var visible = 0;

            cards.forEach(function (card) {
                var text = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-meta") || "")).toLowerCase();
                var matched = !keyword || text.indexOf(keyword) !== -1;
                card.classList.toggle("hidden", !matched);

                if (matched) {
                    visible += 1;
                }
            });

            if (noResults) {
                noResults.classList.toggle("visible", visible === 0);
            }
        });
    });
})();
