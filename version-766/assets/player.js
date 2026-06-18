(function () {
  var video = document.getElementById('movieVideo');
  var overlay = document.getElementById('playOverlay');
  var button = document.getElementById('playButton');
  var prepared = false;
  var hlsPlayer = null;

  function prepare() {
    if (!video || prepared || typeof movieStreamUrl === 'undefined') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = movieStreamUrl;
    } else if (typeof Hls !== 'undefined' && Hls.isSupported()) {
      hlsPlayer = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsPlayer.loadSource(movieStreamUrl);
      hlsPlayer.attachMedia(video);
    } else {
      video.src = movieStreamUrl;
    }

    prepared = true;
  }

  function start() {
    if (!video) {
      return;
    }
    prepare();
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    video.controls = true;
    var attempt = video.play();
    if (attempt && attempt.catch) {
      attempt.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      start();
    });
  }

  if (overlay) {
    overlay.addEventListener('click', start);
    overlay.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        start();
      }
    });
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
  }

  window.addEventListener('beforeunload', function () {
    if (hlsPlayer) {
      hlsPlayer.destroy();
    }
  });
})();
