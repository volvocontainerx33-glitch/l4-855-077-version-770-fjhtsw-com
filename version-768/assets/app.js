(function () {
  function normalizeText(value) {
    return (value || '').toString().toLowerCase().normalize('NFKC').trim();
  }

  function setupMobileNav() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
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

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function filterScope(scope, query) {
    var items = Array.prototype.slice.call(scope.querySelectorAll('.searchable-item'));
    var empty = document.querySelector('[data-empty-result]');
    var term = normalizeText(query);
    var visible = 0;
    items.forEach(function (item) {
      var haystack = normalizeText(item.getAttribute('data-search-text'));
      var matched = !term || haystack.indexOf(term) !== -1;
      item.classList.toggle('is-filtered-out', !matched);
      if (matched) {
        visible += 1;
      }
    });
    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  function setupLocalSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-local-search]'));
    forms.forEach(function (form) {
      var input = form.querySelector('input[type="search"]');
      var scope = document.querySelector('[data-search-scope]');
      if (!input || !scope) {
        return;
      }
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        filterScope(scope, input.value);
      });
      input.addEventListener('input', function () {
        filterScope(scope, input.value);
      });
    });
  }

  function setupSearchPage() {
    var form = document.querySelector('[data-search-page-form]');
    var scope = document.querySelector('[data-search-scope]');
    if (!form || !scope) {
      return;
    }
    var input = form.querySelector('[data-search-input]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (input) {
      input.value = initial;
      filterScope(scope, initial);
      input.addEventListener('input', function () {
        filterScope(scope, input.value);
      });
    }
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      filterScope(scope, input ? input.value : '');
    });
  }

  function setupGlobalSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-global-search]'));
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = form.getAttribute('action');
        }
      });
    });
  }

  function setupPlayer(streamUrl) {
    var player = document.querySelector('[data-player]');
    if (!player) {
      return;
    }
    var video = player.querySelector('video');
    var overlay = player.querySelector('.player-overlay');
    var hls = null;
    var ready = false;

    function bindSource() {
      if (ready || !video) {
        return;
      }
      ready = true;
      video.controls = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function play() {
      bindSource();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {});
      }
    }

    function toggle() {
      if (!ready || video.paused) {
        play();
      } else {
        video.pause();
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', toggle);
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
      video.addEventListener('ended', function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.initMoviePlayer = setupPlayer;

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileNav();
    setupHero();
    setupLocalSearch();
    setupSearchPage();
    setupGlobalSearch();
  });
})();
