import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { setText } from '../lib/dom.js';
import { reduceMotion } from '../reduced-motion.js';

const PHASES = [
  { h: 0, label: 'Ansatz' },
  { h: 6, label: 'erste Gärung' },
  { h: 12, label: 'Volumen verdoppelt' },
  { h: 18, label: 'Säure entwickelt' },
  { h: 24, label: 'Aromenbildung' },
  { h: 30, label: 'Backreif' },
];

function phaseFor(h) { let last = PHASES[0].label; for (const p of PHASES) if (h >= p.h) last = p.label; return last; }

export function initAkt3Biga() {
  const pin = document.getElementById('akt3-pin');
  const video = document.querySelector('.akt-3-biga');
  const hourEl = document.querySelector('[data-bind="biga-hour"]');
  const phaseEl = document.querySelector('[data-bind="biga-phase"]');
  if (!pin || !video || !hourEl || !phaseEl) return;

  video.pause();

  const applyProgress = (p) => {
    if (video.duration && isFinite(video.duration)) video.currentTime = p * video.duration;
    const h = Math.round(p * 30);
    setText(hourEl, `${String(h).padStart(2, '0')} h`);
    setText(phaseEl, phaseFor(h));
  };

  if (reduceMotion.value) { applyProgress(1); return; }

  ScrollTrigger.create({
    trigger: pin,
    start: 'top top',
    end: '+=300%',
    pin: '.akt-3-stage',
    scrub: 1.5,
    invalidateOnRefresh: true,
    anticipatePin: 1,
    onUpdate: (st) => applyProgress(st.progress),
  });

  const ready = () => applyProgress(0);
  if (video.readyState >= 1) ready();
  else video.addEventListener('loadedmetadata', ready, { once: true });
}
