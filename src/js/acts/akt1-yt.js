// Hero-Video · native <video> · 0.75× playback rate
// Mit preload="none" feuert canplaythrough NIE bis user interaction —
// wir rufen v.load() explizit, dann canplaythrough (oder readyState>=3 / loadeddata) → play.

const RATE = 0.75;

export function initAkt1Yt() {
  const v = document.getElementById('akt1-video');
  if (!v) return;

  // Respect saveData / slow networks / reduced-motion → poster only, kein Video-Download
  const conn = navigator.connection || navigator.webkitConnection;
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const slowNetwork = conn && (conn.saveData === true || ['slow-2g', '2g'].includes(conn.effectiveType));
  if (prefersReduced || slowNetwork) return;  // Poster-Image bleibt sichtbar, ~16MB gespart

  const apply = () => {
    try { v.playbackRate = RATE; } catch { /* ignore */ }
  };
  v.addEventListener('loadedmetadata', apply, { once: true });
  v.addEventListener('play', apply);

  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    apply();
    v.classList.add('is-ready');
    v.play().catch(() => { /* autoplay blocked, retry auf nächsten user gesture */ });
  };

  // Sanity: wenn preload="none" gesetzt ist, triggern wir load() explizit damit
  // canplaythrough überhaupt feuern kann. Ohne das bleibt Hero leer auf Desktop.
  const needsLoad = v.preload === 'none' || v.networkState === 0;
  if (needsLoad) {
    try { v.load(); } catch { /* ignore */ }
  }

  if (v.readyState >= 3) {
    start();
  } else {
    v.addEventListener('canplaythrough', start, { once: true });
    v.addEventListener('loadeddata', () => {
      if (!started && v.readyState >= 3) start();
    }, { once: true });
    // Fallback falls nichts feuert (kaputtes Netzwerk, Safari-Preload-Quirk): nach 6s doch starten
    setTimeout(() => {
      if (!started) start();
    }, 6000);
  }
}
