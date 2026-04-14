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
});
