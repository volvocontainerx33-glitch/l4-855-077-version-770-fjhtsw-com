(function () {
  window.setupMoviePlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var button = document.getElementById(options.buttonId);
    var overlay = document.getElementById(options.overlayId);
    var streamUrl = options.source;
    var started = false;
    var hls = null;

    if (!video || !button || !overlay || !streamUrl) {
      return;
    }

    function showError(message) {
      overlay.classList.remove('is-hidden');
      overlay.innerHTML = '<span class="player-button">!</span><strong>' + message + '</strong>';
    }

    function attachVideo() {
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showError('视频加载失败，请稍后再试');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else {
        showError('当前浏览器无法播放此内容');
      }
    }

    function start() {
      if (!started) {
        started = true;
        video.controls = true;
      }
      overlay.classList.add('is-hidden');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          overlay.classList.remove('is-hidden');
        });
      }
    }

    attachVideo();
    button.addEventListener('click', start);
    overlay.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
