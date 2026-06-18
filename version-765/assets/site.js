(function () {
  var navButton = document.querySelector('[data-nav-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (navButton && mobileNav) {
    navButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('is-missing');
    });
  });

  document.querySelectorAll('[data-hero-carousel]').forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        restart();
      });
    }

    restart();
  });

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    var scope = panel.parentElement;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.searchable-card'));
    var input = panel.querySelector('[data-filter-search]');
    var selects = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-field]'));
    var empty = scope.querySelector('[data-empty-state]');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      var query = normalize(input ? input.value : '');
      var visible = 0;
      var filters = {};

      selects.forEach(function (select) {
        filters[select.getAttribute('data-filter-field')] = normalize(select.value);
      });

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var match = true;

        if (query && haystack.indexOf(query) === -1) {
          match = false;
        }

        Object.keys(filters).forEach(function (key) {
          var value = filters[key];
          if (!value) {
            return;
          }
          var cardValue = normalize(card.getAttribute('data-' + key));
          if (cardValue.indexOf(value) === -1) {
            match = false;
          }
        });

        card.classList.toggle('is-hidden', !match);
        if (match) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilters);
    }

    selects.forEach(function (select) {
      select.addEventListener('change', applyFilters);
    });
  });

  document.querySelectorAll('[data-video-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var hlsInstance = null;
    var prepared = false;

    function prepareVideo() {
      if (!video || prepared) {
        return;
      }

      var stream = video.getAttribute('data-stream');
      if (!stream) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }

      prepared = true;
    }

    function playVideo() {
      prepareVideo();
      if (button) {
        button.classList.add('is-hidden');
      }
      if (video) {
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
