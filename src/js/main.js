import { initScroll } from './scroll.js';
import { initAkt1 } from './acts/akt1.js';
import { initAkt3Biga } from './acts/akt3-biga.js';
import { initAkt4 } from './acts/akt4.js';
import { initAkt5Pietro } from './acts/akt5-pietro.js';
import { initAkt6Climax } from './acts/akt6-climax.js';
import { initAkt7 } from './acts/akt7.js';
import { initPill } from './acts/pill.js';
import { initModal } from './modal/modal.js';
import { initDeepLink } from './modal/deeplink.js';
import { initWizard } from './wizard/mount.js';
import { initPricingView } from './wizard/pricing-view.js';
import { attachPlaces, initAkt7Map } from './maps.js';

document.addEventListener('DOMContentLoaded', () => {
  initScroll();
  initAkt1();
  initAkt3Biga();
  initAkt4();
  initAkt5Pietro();
  initAkt6Climax();
  initAkt7();
  initPill();
  initModal();
  initDeepLink();
  initWizard();
  initPricingView();

  // Wizard Step 3 mount hook — attach Places Autocomplete to the input
  document.addEventListener('wizard:step3-mounted', (e) => {
    attachPlaces(e.detail.inputEl).catch((err) => console.warn('[maps] autocomplete failed:', err));
  });

  // Akt 7 Map — lazy-load when section scrolls into view
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
