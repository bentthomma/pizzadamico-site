import { initScroll } from './scroll.js';
import { initAkt1 } from './acts/akt1.js';
import { initAkt1Yt } from './acts/akt1-yt.js';
import { initAkt4 } from './acts/akt4.js';
import { initAkt7 } from './acts/akt7.js';
import { initAkt7Map } from './maps.js';
import { initSiteHeader } from './site-header.js';

document.addEventListener('DOMContentLoaded', () => {
  initScroll();
  initSiteHeader();
  initAkt1Yt();
  initAkt1();
  initAkt4();
  initAkt7();

  // Lazy-load the Akt 7 dark map when visible
  const mapEl = document.getElementById('akt7-map');
  if (mapEl) {
    const mapObs = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) { initAkt7Map(); mapObs.disconnect(); break; }
      }
    }, { rootMargin: '200px' });
    mapObs.observe(mapEl);
  }
});
