// Native scroll with JS-based dominant-section snap (desktop only).
// When scrolling stops, snap to the section with the largest visible area.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const DESKTOP_BREAKPOINT = 901;
const SCROLL_END_DEBOUNCE = 120;
const PROGRAMMATIC_LOCK_MS = 900;
const MIN_OFFSET_TO_SNAP = 8;

let programmaticLock = false;
let endTimer = null;
let footer = null;

function dominantSection() {
  const sections = document.querySelectorAll('.akt');
  const vh = window.innerHeight;
  let best = null;
  let bestVisible = 0;
  for (const s of sections) {
    const r = s.getBoundingClientRect();
    const visible = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
    if (visible > bestVisible) {
      bestVisible = visible;
      best = s;
    }
  }
  return best;
}

function maybeSnap() {
  if (programmaticLock) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // Auto-snap active on all viewports (desktop + mobile)

  // Skip snap as soon as the footer is (or about to be) visible — user is exiting content
  if (footer) {
    const fr = footer.getBoundingClientRect();
    if (fr.top < window.innerHeight - 40) return;
  }

  // Skip snap if user is near end of document (can't fully scroll to target anyway)
  const maxY = document.documentElement.scrollHeight - window.innerHeight;
  if (window.scrollY > maxY - 20) return;

  const target = dominantSection();
  if (!target) return;
  const rect = target.getBoundingClientRect();
  if (Math.abs(rect.top) < MIN_OFFSET_TO_SNAP) return;

  programmaticLock = true;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(() => { programmaticLock = false; }, PROGRAMMATIC_LOCK_MS);
}

export function initScroll() {
  footer = document.querySelector('.site-footer');

  window.addEventListener('resize', () => ScrollTrigger.refresh());

  const hasScrollEnd = 'onscrollend' in window;
  if (hasScrollEnd) {
    window.addEventListener('scrollend', maybeSnap);
  } else {
    window.addEventListener('scroll', () => {
      clearTimeout(endTimer);
      endTimer = setTimeout(maybeSnap, SCROLL_END_DEBOUNCE);
    }, { passive: true });
  }
}

export function scrollTo(target, opts = {}) {
  const behavior = opts.instant ? 'instant' : 'smooth';
  programmaticLock = true;
  setTimeout(() => { programmaticLock = false; }, PROGRAMMATIC_LOCK_MS);

  if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior });
  } else if (typeof target === 'string') {
    const el = document.querySelector(target);
    if (el) el.scrollIntoView({ behavior, block: 'start' });
  } else if (target && target.scrollIntoView) {
    target.scrollIntoView({ behavior, block: 'start' });
  }
}

export function destroyScroll() { /* no-op */ }
