import { initScroll } from './scroll.js';
import { initAkt1 } from './acts/akt1.js';
import { initAkt1Yt } from './acts/akt1-yt.js';
import { initAkt3Zutaten } from './acts/akt3-zutaten.js';
import { initSiteHeader } from './site-header.js';
import { initContactForm } from './contact-form.js';
import { initSiteModal } from './site-modal.js';
import { initReveal } from './reveal.js';
import { initGallery } from './gallery.js';
// Wizard ist ~50-80 KB gzip — lazy-load on first trigger-click statt eager.
// Spart das Bundle wenn User Catering nicht öffnet (~80% Besucher).

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
  // Respect saveData + slow connections — skip 400KB background-download.
  const conn = navigator.connection || navigator.webkitConnection;
  if (conn) {
    if (conn.saveData === true) return;
    if (['slow-2g', '2g'].includes(conn.effectiveType)) return;
  }
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

// Hoststar-Viewport-Fix: Der Hoststar-Designer injectet oft eine eigene
// viewport-meta ohne `width=device-width` → Mobile rendert Desktop-Layout.
// Wir überschreiben SOFORT bei Script-Load, bevor andere meta-tags greifen.
(function forceResponsiveViewport() {
  const CONTENT = 'width=device-width, initial-scale=1, viewport-fit=cover';
  let vp = document.querySelector('meta[name="viewport"]');
  if (vp) {
    if (vp.getAttribute('content') !== CONTENT) vp.setAttribute('content', CONTENT);
  } else {
    vp = document.createElement('meta');
    vp.name = 'viewport';
    vp.content = CONTENT;
    document.head.appendChild(vp);
  }
})();

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

// Wizard-Lazy-Loader: lädt mount.js + 9 Steps erst bei erstem Click auf [data-wizard-open].
let wizardLoading = false;
async function lazyLoadWizard(e) {
  if (wizardLoading) return;
  wizardLoading = true;
  e.preventDefault();
  const trigger = e.currentTarget;
  try {
    const { initWizard } = await import('./wizard/mount.js');
    initWizard();
    // Loader-Listeners entfernen; wizard mount.js hat jetzt eigene.
    document.querySelectorAll('[data-wizard-open]').forEach((el) =>
      el.removeEventListener('click', lazyLoadWizard)
    );
    // Click replay: wizard-mount hat seinen Handler jetzt registriert.
    requestAnimationFrame(() => trigger.click());
  } catch (err) {
    console.error('[wizard] lazy-load failed:', err);
    wizardLoading = false;
  }
}

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
  initGallery();
  // Wizard lazy: klick-trigger bekommen Loader-Listener. Erst bei echtem Klick wird wizard/mount.js dyn. geladen.
  document.querySelectorAll('[data-wizard-open]').forEach((el) =>
    el.addEventListener('click', lazyLoadWizard)
  );
  preloadZutaten();
});

// One more safety · after all assets loaded
window.addEventListener('load', () => {
  requestAnimationFrame(() => window.scrollTo(0, 0));
});
