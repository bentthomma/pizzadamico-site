import { initScroll } from './scroll.js';
import { initAkt1 } from './acts/akt1.js';
import { initAkt1Yt } from './acts/akt1-yt.js';
import { initAkt3Zutaten } from './acts/akt3-zutaten.js';
import { initSiteHeader } from './site-header.js';
import { initContactForm } from './contact-form.js';
import { initSiteModal } from './site-modal.js';
import { initReveal } from './reveal.js';
import { initWizard } from './wizard/mount.js';
import { initGallery } from './gallery.js';

// Echte JS-Bild-Preloads fuer Wizard-Schritt 6 (Zutaten). Prefetch-Links
// im HTML sind nur Browser-Hints — oft ignoriert. Mit new Image() erzwingen
// wir den Download + Cache. Im Idle ausgeloest, damit Hero-Render Vorrang hat.
const ZUTATEN_IMAGES = [
  'champignons','zwiebeln','zucchetti','spinat','aubergine','peperoni',
  'artischocken','oliven','kapern','knoblauch','schinken','salami','speck',
  'thunfisch','sardellen','rahm','gorgonzola'
];
function preloadZutaten() {
  const schedule = window.requestIdleCallback || ((cb) => setTimeout(cb, 600));
  schedule(() => {
    ZUTATEN_IMAGES.forEach((id) => {
      const img = new Image();
      img.src = `/zutaten/${id}.png`;
      // Erzwingt decode in Memory -> bei Step 6 instant paint, kein pop-in.
      img.decode().catch(() => { /* fallback: browser will decode on demand */ });
    });
  }, { timeout: 2500 });
}

// Force scroll to top on every load/reload — strict
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (window.location.hash) {
  history.replaceState(null, '', window.location.pathname + window.location.search);
}
window.scrollTo(0, 0);
window.addEventListener('beforeunload', () => window.scrollTo(0, 0));
window.addEventListener('pageshow', (e) => { if (e.persisted) window.scrollTo(0, 0); });

document.addEventListener('DOMContentLoaded', () => {
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
  initWizard();
  initGallery();
  preloadZutaten();
});

// One more safety · after all assets loaded
window.addEventListener('load', () => {
  requestAnimationFrame(() => window.scrollTo(0, 0));
});
