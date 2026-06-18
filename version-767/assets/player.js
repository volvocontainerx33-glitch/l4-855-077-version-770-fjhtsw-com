(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  window.initPlayer = function (sourceUrl) {
    ready(function () {
      var video = document.getElementById("movieVideo");
      var overlay = document.getElementById("playerOverlay");
      var playButton = document.getElementById("playButton");
      var hlsInstance = null;
      var isReady = false;

      if (!video || !sourceUrl) {
        return;
      }

      function attach() {
        if (isReady) {
          return;
        }
        isReady = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = sourceUrl;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(sourceUrl);
          hlsInstance.attachMedia(video);
          return;
        }

        video.src = sourceUrl;
      }

      function begin(event) {
        if (event) {
          event.preventDefault();
        }
        attach();
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      attach();
      video.addEventListener("click", begin);
      if (overlay) {
        overlay.addEventListener("click", begin);
      }
      if (playButton) {
        playButton.addEventListener("click", begin);
      }
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  };
})();
