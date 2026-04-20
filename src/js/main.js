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
  // Hidden-DOM-Scaffold mit <picture>: AVIF-first, WebP-fallback.
  // Browser dekodiert + komponiert. Bei Step 6 / Akt 3 sofortiger Render.
  const schedule = window.requestIdleCallback || ((cb) => setTimeout(cb, 400));
  schedule(() => {
    const host = document.createElement('div');
    host.setAttribute('aria-hidden', 'true');
    host.setAttribute('data-zutaten-preload', '');
    host.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;pointer-events:none;';
    ZUTATEN_IMAGES.forEach((id) => {
      const pic = document.createElement('picture');
      const sAvif = document.createElement('source');
      sAvif.srcset = `/zutaten/${id}.avif`;
      sAvif.type = 'image/avif';
      const sWebp = document.createElement('source');
      sWebp.srcset = `/zutaten/${id}.webp`;
      sWebp.type = 'image/webp';
      const img = document.createElement('img');
      img.src = `/zutaten/${id}.png`;
      img.alt = '';
      img.width = 1;
      img.height = 1;
      img.loading = 'eager';
      img.decoding = 'sync';
      pic.append(sAvif, sWebp, img);
      host.appendChild(pic);
    });
    document.body.appendChild(host);
  }, { timeout: 2500 });
}

// Force scroll to top on every load/reload — strict.
// Hash preservation: Wir behalten #akt-*-Deeplinks damit Social-Shares funktionieren.
// Nur interne modal-hashes (#modal-*) werden gestrippt weil die vom site-modal.js
// explizit geöffnet werden sollen und nicht als Scroll-Anker.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (window.location.hash && window.location.hash.startsWith('#modal-')) {
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
