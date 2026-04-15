import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { qs, qsa } from './lib/dom.js';

export function initSiteHeader() {
  const header = qs('.site-header');
  if (!header) return;

  const burger = qs('.site-burger', header);
  const mobileMenu = qs('#site-mobile-menu');
  const navLinks = qsa('a[data-nav-target]');

  // Per-akt ScrollTrigger for header theme + nav active state
  const akte = qsa('.akt');
  if (akte.length === 0) return;

  for (const akt of akte) {
    const theme = akt.dataset.theme || 'farina';
    const aktNum = akt.dataset.akt;
    ScrollTrigger.create({
      trigger: akt,
      start: 'top 56%',
      end: 'bottom 56%',
      onEnter:     () => applyAkt(aktNum, theme),
      onEnterBack: () => applyAkt(aktNum, theme),
    });
  }
  applyAkt(akte[0].dataset.akt, akte[0].dataset.theme || 'brace');

  function applyAkt(aktNum, theme) {
    header.dataset.theme = theme;
    // Hero shows no header, all other sections show
    header.dataset.hidden = aktNum === '1' ? 'true' : 'false';
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
