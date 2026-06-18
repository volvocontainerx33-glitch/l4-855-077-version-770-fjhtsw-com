(function () {
  var header = document.querySelector('[data-header]');
  var toggle = document.querySelector('[data-nav-toggle]');

  function updateHeader() {
    if (!header) {
      return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (toggle && header) {
    toggle.addEventListener('click', function () {
      var open = header.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var active = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    function startHero() {
      timer = window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startHero();
      });
    });

    startHero();
  }

  var params = new URLSearchParams(window.location.search);
  var keyword = params.get('q') || params.get('search') || '';
  var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
  var empty = document.querySelector('[data-empty-state]');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function getCardText(card) {
    return normalize([
      card.getAttribute('data-title'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-region'),
      card.getAttribute('data-year'),
      card.getAttribute('data-tags'),
      card.textContent
    ].join(' '));
  }

  function filterCards(value) {
    var query = normalize(value);
    var visible = 0;
    cards.forEach(function (card) {
      var match = !query || getCardText(card).indexOf(query) !== -1;
      card.classList.toggle('is-hidden', !match);
      if (match) {
        visible += 1;
      }
    });
    if (empty) {
      empty.classList.toggle('is-visible', visible === 0 && cards.length > 0);
    }
  }

  inputs.forEach(function (input) {
    input.value = keyword;
    input.addEventListener('input', function () {
      filterCards(input.value);
    });
  });

  Array.prototype.slice.call(document.querySelectorAll('[data-local-search-form]')).forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('[data-search-input]');
      filterCards(input ? input.value : '');
    });
  });

  if (keyword) {
    filterCards(keyword);
  }
})();
