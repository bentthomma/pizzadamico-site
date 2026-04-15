// YouTube IFrame API · Akt 1 Hero background
// Video: guoy7x3VtfY · start @10s · playback 0.75× · muted loop

const VIDEO_ID = 'guoy7x3VtfY';
const START_AT = 10;
const RATE     = 0.75;

let apiLoading = false;
let apiReady = false;

function loadApi() {
  if (apiLoading || apiReady) return;
  apiLoading = true;
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
}

export function initAkt1Yt() {
  const host = document.getElementById('akt1-yt-player');
  if (!host) return;

  const boot = () => {
    // eslint-disable-next-line no-undef
    const player = new YT.Player('akt1-yt-player', {
      videoId: VIDEO_ID,
      playerVars: {
        autoplay: 1,
        mute: 1,
        controls: 0,
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
        loop: 1,
        playlist: VIDEO_ID,
        start: START_AT,
        disablekb: 1,
        iv_load_policy: 3,   // no video annotations
        fs: 0,               // no fullscreen control
      },
      events: {
        onReady: (e) => {
          try {
            e.target.mute();
            e.target.setPlaybackRate(RATE);
            e.target.playVideo();
          } catch (err) {
            console.warn('[akt1-yt] onReady:', err);
          }
        },
        onStateChange: (e) => {
          // On loop-back to 0s, re-seek to START_AT and ensure rate persists
          // YT.PlayerState.ENDED === 0; loop=1 auto-replays but resets time to 0
          if (e.data === 0) {
            try {
              e.target.seekTo(START_AT, true);
              e.target.setPlaybackRate(RATE);
            } catch { /* ignore */ }
          }
          if (e.data === 1) {
            // Playing — reassert rate (YouTube sometimes resets on quality change)
            try { e.target.setPlaybackRate(RATE); } catch { /* ignore */ }
          }
        },
      },
    });
    window.__damicoYtPlayer = player;
  };

  if (window.YT && window.YT.Player) {
    boot();
    return;
  }

  const prev = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = () => {
    apiReady = true;
    try { prev && prev(); } catch { /* ignore */ }
    boot();
  };

  loadApi();
}
