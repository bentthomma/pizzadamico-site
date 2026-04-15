// Hero-Video · native <video> · 0.75× playback rate
// (was YouTube iframe before — swapped to local mp4 for instant start)

const RATE = 0.75;

export function initAkt1Yt() {
  const v = document.getElementById('akt1-video');
  if (!v) return;

  const apply = () => {
    try { v.playbackRate = RATE; } catch { /* ignore */ }
  };

  v.addEventListener('loadedmetadata', apply, { once: true });
  v.addEventListener('play', apply);
  if (v.readyState >= 1) apply();

  // Ensure autoplay starts (some browsers need an explicit play() after DOMContentLoaded)
  const tryPlay = () => {
    v.play().catch(() => { /* user gesture required — autoplay will retry */ });
  };
  if (v.readyState >= 2) tryPlay();
  else v.addEventListener('canplay', tryPlay, { once: true });
}
