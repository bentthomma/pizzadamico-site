import { qs, qsa } from './lib/dom.js';

export function initSiteHeader() {
  const header = qs('.site-header');
  if (!header) return;

  const burger = qs('.site-burger', header);
  const mobileMenu = qs('#site-mobile-menu');
  const navLinks = qsa('a[data-nav-target]');

  const akte = qsa('.akt');
  if (akte.length === 0) return;

  // Initial state · Akt 1 · header hidden
  applyAkt(akte[0].dataset.akt, akte[0].dataset.theme || 'brace');

  // Header update: sofort bei Sektionswechsel (section-active, ohne Cooldown)
  // und zusaetzlich bei settled fuer Safety-Net
  const onSectionChange = (e) => {
    const section = e.detail && e.detail.section;
    if (!section || !section.classList || !section.classList.contains('akt')) return;
    applyAkt(section.dataset.akt, section.dataset.theme || 'farina');
  };
  window.addEventListener('section-active', onSectionChange);
  window.addEventListener('section-settled', onSectionChange);

  function applyAkt(aktNum, theme) {
    header.dataset.theme = theme;
    // Hero (Akt 1) + Akt 3 Zutaten (Desktop + Mobile) hide the header (full-bleed)
    header.dataset.hidden = (aktNum === '1' || aktNum === '3') ? 'true' : 'false';
    document.body.dataset.currentAkt = aktNum;
    // Active state on nav links
    navLinks.forEach((a) => {
      a.dataset.active = a.dataset.navTarget === aktNum ? 'true' : 'false';
    });
  }

  // Click handler · smooth scroll + close mobile menu
  const onNavClick = (e) => {
    const link = e.currentTarget;
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    const target = qs(href);
    if (!target) return;
    e.preventDefault();
    closeMobileMenu();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  navLinks.forEach((a) => a.addEventListener('click', onNavClick));

  // Burger toggle
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      const expanded = burger.getAttribute('aria-expanded') === 'true';
      if (expanded) closeMobileMenu();
      else openMobileMenu();
    });
    // Close on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        closeMobileMenu();
      }
    });
  }

  function openMobileMenu() {
    if (!mobileMenu || !burger) return;
    mobileMenu.setAttribute('aria-hidden', 'false');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMobileMenu() {
    if (!mobileMenu || !burger) return;
    mobileMenu.setAttribute('aria-hidden', 'true');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
}
