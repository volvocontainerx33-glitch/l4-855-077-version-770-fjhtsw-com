(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".mobile-menu");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupSlider(slideSelector, dotSelector, intervalTime) {
    var slides = Array.prototype.slice.call(document.querySelectorAll(slideSelector));
    var dots = Array.prototype.slice.call(document.querySelectorAll(dotSelector));
    if (slides.length === 0) {
      return;
    }
    var index = 0;
    var timer;

    function activate(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        activate(index + 1);
      }, intervalTime);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        activate(i);
        start();
      });
    });

    activate(0);
    start();
  }

  function setupSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll(".movie-search"));
    inputs.forEach(function (input) {
      var section = input.closest("section") || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll(".movie-card"));
      var clear = section.querySelector(".clear-search");

      function apply() {
        var keyword = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
          card.classList.toggle("is-hidden", keyword && text.indexOf(keyword) === -1);
        });
      }

      input.addEventListener("input", apply);
      if (clear) {
        clear.addEventListener("click", function () {
          input.value = "";
          apply();
          input.focus();
        });
      }
    });
  }

  ready(function () {
    setupMenu();
    setupSlider(".hero-slide", ".hero-dot", 5200);
    setupSlider(".feature-slide", ".feature-dot", 4600);
    setupSearch();
  });
})();
