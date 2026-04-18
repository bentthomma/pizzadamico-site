// Hero-Video · native <video> · 0.75× playback rate
// Wartet auf `canplaythrough` → Video startet erst wenn voll gebuffert (kein Stuttering)
// Poster-Image bleibt sichtbar bis dann (smooth UX auf mobile)

const RATE = 0.75;

export function initAkt1Yt() {
  const v = document.getElementById('akt1-video');
  if (!v) return;

  const apply = () => {
    try { v.playbackRate = RATE; } catch { /* ignore */ }
  };
  v.addEventListener('loadedmetadata', apply, { once: true });
  v.addEventListener('play', apply);

  // Warte auf canplaythrough (voll gebuffert · kein Stuttering beim Start)
  const start = () => {
    apply();
    v.classList.add('is-ready');
    v.play().catch(() => { /* autoplay blocked, retry auf nächsten user gesture */ });
  };

  if (v.readyState >= 4) {
    start();
  } else {
    v.addEventListener('canplaythrough', start, { once: true });
    // Fallback falls canplaythrough nicht feuert (kaputtes Netzwerk): nach 8s doch starten
    setTimeout(() => {
      if (!v.classList.contains('is-ready')) start();
    }, 8000);
  }
}
