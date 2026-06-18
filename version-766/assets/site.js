(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  ready(function () {
    var header = document.querySelector('.site-header');
    var menuButton = document.querySelector('.mobile-menu-button');
    var mobileNav = document.querySelector('.mobile-nav');

    if (header) {
      var onScroll = function () {
        header.classList.toggle('is-scrolled', window.scrollY > 12);
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    if (menuButton && mobileNav) {
      menuButton.addEventListener('click', function () {
        var open = mobileNav.classList.toggle('is-open');
        menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    document.querySelectorAll('.hero-search').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var value = input ? input.value.trim() : '';
        var url = './search.html';
        if (value) {
          url += '?q=' + encodeURIComponent(value);
        }
        window.location.href = url;
      });
    });

    var hero = document.querySelector('.hero-slider');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
      var prev = hero.querySelector('.hero-prev');
      var next = hero.querySelector('.hero-next');
      var current = 0;

      var show = function (index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('active', i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('active', i === current);
        });
      };

      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
        });
      });

      if (prev) {
        prev.addEventListener('click', function () {
          show(current - 1);
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(current + 1);
        });
      }

      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    var featured = document.querySelector('.featured-carousel');
    if (featured) {
      var featuredSlides = Array.prototype.slice.call(featured.querySelectorAll('.featured-slide'));
      var featuredDots = Array.prototype.slice.call(featured.querySelectorAll('.featured-dot'));
      var featuredIndex = 0;
      var showFeatured = function (index) {
        if (!featuredSlides.length) {
          return;
        }
        featuredIndex = (index + featuredSlides.length) % featuredSlides.length;
        featuredSlides.forEach(function (slide, i) {
          slide.classList.toggle('active', i === featuredIndex);
        });
        featuredDots.forEach(function (dot, i) {
          dot.classList.toggle('active', i === featuredIndex);
        });
      };
      featuredDots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          showFeatured(i);
        });
      });
      window.setInterval(function () {
        showFeatured(featuredIndex + 1);
      }, 5800);
    }

    var panel = document.querySelector('.filter-panel');
    var target = document.querySelector('.filter-target');
    if (panel && target) {
      var input = panel.querySelector('input[name="q"]');
      var category = panel.querySelector('select[name="category"]');
      var type = panel.querySelector('select[name="type"]');
      var region = panel.querySelector('select[name="region"]');
      var year = panel.querySelector('select[name="year"]');
      var cards = Array.prototype.slice.call(target.querySelectorAll('.movie-card'));
      var empty = document.querySelector('.filter-empty');
      var params = new URLSearchParams(window.location.search);

      if (input && params.get('q')) {
        input.value = params.get('q');
      }

      var apply = function () {
        var q = normalize(input && input.value);
        var c = normalize(category && category.value);
        var t = normalize(type && type.value);
        var r = normalize(region && region.value);
        var y = normalize(year && year.value);
        var visible = 0;

        cards.forEach(function (card) {
          var blob = normalize([
            card.dataset.title,
            card.dataset.genre,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.category,
            card.dataset.tags
          ].join(' '));
          var ok = true;
          if (q && blob.indexOf(q) === -1) {
            ok = false;
          }
          if (c && normalize(card.dataset.category) !== c) {
            ok = false;
          }
          if (t && normalize(card.dataset.type) !== t) {
            ok = false;
          }
          if (r && normalize(card.dataset.region) !== r) {
            ok = false;
          }
          if (y && normalize(card.dataset.year) !== y) {
            ok = false;
          }
          card.style.display = ok ? '' : 'none';
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      };

      [input, category, type, region, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      apply();
    }
  });
})();
