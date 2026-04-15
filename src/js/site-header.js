import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { qs, qsa } from './lib/dom.js';

export function initSiteHeader() {
  const header = qs('.site-header');
  if (!header) return;

  const akte = qsa('.akt');
  if (akte.length === 0) return;

  for (const akt of akte) {
    const theme = akt.dataset.theme || 'farina';
    const aktNum = akt.dataset.akt;
    ScrollTrigger.create({
      trigger: akt,
      start: 'top 64px',
      end: 'bottom 64px',
      onEnter:     () => applyAkt(aktNum, theme),
      onEnterBack: () => applyAkt(aktNum, theme),
    });
  }

  // Initial state — Akt 1 is hero, header hidden
  applyAkt(akte[0].dataset.akt, akte[0].dataset.theme || 'brace');

  function applyAkt(aktNum, theme) {
    header.dataset.theme = theme;
    header.dataset.hidden = aktNum === '1' ? 'true' : 'false';
  }
}
