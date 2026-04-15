import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { qs, qsa } from './lib/dom.js';

export function initSiteHeader() {
  const header = qs('.site-header');
  if (!header) return;

  const akte = qsa('.akt');
  if (akte.length === 0) return;

  // Per-Akt ScrollTrigger sets header theme matching the akt currently crossing top of viewport
  for (const akt of akte) {
    const theme = akt.dataset.theme || 'farina';
    ScrollTrigger.create({
      trigger: akt,
      start: 'top 64px',       // header is ~64px tall, switch when akt crosses under it
      end: 'bottom 64px',
      onEnter:     () => { header.dataset.theme = theme; },
      onEnterBack: () => { header.dataset.theme = theme; },
    });
  }

  // Initial state — the first akt's theme
  header.dataset.theme = akte[0].dataset.theme || 'brace';
}
