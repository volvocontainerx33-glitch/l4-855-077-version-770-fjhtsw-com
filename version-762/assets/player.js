import { H as Hls } from './hls.js';

function initPlayer() {
    const shell = document.querySelector('[data-player]');
    const video = shell?.querySelector('video');
    const button = shell?.querySelector('[data-play-button]');
    const configNode = document.getElementById('player-config');
    if (!shell || !video || !button || !configNode) {
        return;
    }

    let config = {};
    try {
        config = JSON.parse(configNode.textContent || '{}');
    } catch (error) {
        config = {};
    }

    const source = config.src;
    let attached = false;
    let hls = null;

    const playVideo = () => {
        const result = video.play();
        if (result && typeof result.catch === 'function') {
            result.catch(() => {});
        }
    };

    const attachSource = () => {
        if (attached || !source) {
            return;
        }
        attached = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', playVideo, { once: true });
            return;
        }
        if (Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90,
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, playVideo);
            hls.on(Hls.Events.ERROR, (event, data) => {
                if (!data.fatal) {
                    return;
                }
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                } else {
                    hls.destroy();
                }
            });
        }
    };

    const start = () => {
        attachSource();
        button.classList.add('is-hidden');
        playVideo();
    };

    button.addEventListener('click', start);
    video.addEventListener('click', () => {
        if (!attached) {
            start();
        }
    });
    video.addEventListener('play', () => {
        button.classList.add('is-hidden');
    });
    video.addEventListener('pause', () => {
        if (video.currentTime === 0) {
            button.classList.remove('is-hidden');
        }
    });
}

initPlayer();
