import { initScroll } from './scroll.js';
import { initAkt1 } from './acts/akt1.js';
import { initAkt1Yt } from './acts/akt1-yt.js';
import { initAkt3Zutaten } from './acts/akt3-zutaten.js';
import { initSiteHeader } from './site-header.js';
import { initContactForm } from './contact-form.js';
import { initSiteModal } from './site-modal.js';
import { initReveal } from './reveal.js';

// Force scroll to top on every load/reload — strict
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
// Clear URL fragment to avoid browser scrolling to hash-section on reload
if (window.location.hash) {
  history.replaceState(null, '', window.location.pathname + window.location.search);
}
window.scrollTo(0, 0);
window.addEventListener('beforeunload', () => window.scrollTo(0, 0));
window.addEventListener('pageshow', (e) => { if (e.persisted) window.scrollTo(0, 0); });

document.addEventListener('DOMContentLoaded', () => {
  // Multiple rAFs · force top even after layout/fonts
  requestAnimationFrame(() => {
    window.scrollTo(0, 0);
    requestAnimationFrame(() => window.scrollTo(0, 0));
  });
  initScroll();
  initSiteHeader();
  initAkt1Yt();
  initAkt1();
  initAkt3Zutaten();
  initSiteModal();
  initContactForm();
  initReveal();
});

// One more safety · after all assets loaded
window.addEventListener('load', () => {
  requestAnimationFrame(() => window.scrollTo(0, 0));
});
