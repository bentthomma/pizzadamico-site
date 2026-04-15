// YouTube IFrame API · Akt 1 Hero background
// Video: guoy7x3VtfY · loop cut 10s → 1:14 (74s) · 0.75× speed · muted

const VIDEO_ID = 'guoy7x3VtfY';
const START_AT = 10;    // seconds
const END_AT   = 74;    // 1:14
const RATE     = 0.75;

let apiLoading = false;

function loadApi() {
  if (apiLoading || (window.YT && window.YT.Player)) return;
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
        end: END_AT,
        disablekb: 1,
        iv_load_policy: 3,
        fs: 0,
      },
      events: {
        onReady: (e) => {
          try {
            e.target.mute();
            e.target.setPlaybackRate(RATE);
            e.target.seekTo(START_AT, true);
            e.target.playVideo();
            startLoopWatcher(e.target);
          } catch (err) {
            console.warn('[akt1-yt] onReady:', err);
          }
        },
        onStateChange: (e) => {
          // When YouTube hits end=74 it fires ENDED (0) or just restarts via loop — seek back manually
          if (e.data === 0) {
            try {
              e.target.seekTo(START_AT, true);
              e.target.setPlaybackRate(RATE);
              e.target.playVideo();
            } catch { /* ignore */ }
          }
          if (e.data === 1) {
            // playing — reassert rate (YT sometimes resets on quality change)
            try { e.target.setPlaybackRate(RATE); } catch { /* ignore */ }
          }
        },
      },
    });
    window.__damicoYtPlayer = player;
  };

  // Watch currentTime; pre-empt end and seek back to START_AT for smooth loop.
  // Prevents the brief flash to 0s that YouTube's native loop would cause.
  function startLoopWatcher(player) {
    setInterval(() => {
      try {
        const t = player.getCurrentTime();
        if (t >= END_AT - 0.25) {
          player.seekTo(START_AT, true);
          player.setPlaybackRate(RATE);
        }
      } catch { /* player may not be ready */ }
    }, 250);
  }

  if (window.YT && window.YT.Player) {
    boot();
    return;
  }

  const prev = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = () => {
    try { prev && prev(); } catch { /* ignore */ }
    boot();
  };

  loadApi();
}
