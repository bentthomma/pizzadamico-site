import { initScroll } from './scroll.js';
import { initAkt1 } from './acts/akt1.js';
import { initAkt1Yt } from './acts/akt1-yt.js';
import { initSiteHeader } from './site-header.js';
import { initContactForm } from './contact-form.js';
import { initSiteModal } from './site-modal.js';
import { initReveal } from './reveal.js';

// Always start at top on (re)load — disable browser's scroll-restoration
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.addEventListener('beforeunload', () => window.scrollTo(0, 0));

document.addEventListener('DOMContentLoaded', () => {
  // Force top on init (covers cache/BFCache reloads too)
  requestAnimationFrame(() => window.scrollTo(0, 0));
  initScroll();
  initSiteHeader();
  initAkt1Yt();
  initAkt1();
  initSiteModal();
  initContactForm();
  initReveal();
});
