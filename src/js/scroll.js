// Native scroll with JS-based dominant-section snap.
// When scrolling stops, snap to the section with the largest visible area.
// Cancels pending snap if user starts scrolling again (avoids fighting user input).
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const SCROLLEND_DEBOUNCE = 180;     // wait for real scroll-stop
const PROGRAMMATIC_LOCK_MS = 1100;  // lock slightly longer than smooth-scroll-duration
const MIN_OFFSET_TO_SNAP = 12;      // ignore tiny misalignments
const USER_INTENT_VELOCITY = 0.25;  // px/ms — above this we consider the scroll "fast"

let programmaticLock = false;
let pendingSnapTimer = null;
let lastScrollY = 0;
let lastScrollT = 0;
let scrollVelocity = 0;
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

  // Skip snap when footer is (or about to be) visible — user is exiting content
  if (footer) {
    const fr = footer.getBoundingClientRect();
    if (fr.top < window.innerHeight - 40) return;
  }

  // Skip snap near end of document (can't reach target anyway)
  const maxY = document.documentElement.scrollHeight - window.innerHeight;
  if (window.scrollY > maxY - 20) return;

  const target = dominantSection();
  if (!target) return;
  const rect = target.getBoundingClientRect();
  if (Math.abs(rect.top) < MIN_OFFSET_TO_SNAP) return;

  // If the user is still scrolling fast, delay — don't fight their input
  if (Math.abs(scrollVelocity) > USER_INTENT_VELOCITY) {
    schedulePendingSnap();
    return;
  }

  programmaticLock = true;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(() => { programmaticLock = false; }, PROGRAMMATIC_LOCK_MS);
}

function schedulePendingSnap() {
  clearTimeout(pendingSnapTimer);
  pendingSnapTimer = setTimeout(maybeSnap, SCROLLEND_DEBOUNCE);
}

export function initScroll() {
  footer = document.querySelector('.site-footer');

  window.addEventListener('resize', () => ScrollTrigger.refresh());

  // Track velocity on every scroll so maybeSnap can skip when user is still active
  lastScrollY = window.scrollY;
  lastScrollT = performance.now();
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const t = performance.now();
    const dt = Math.max(1, t - lastScrollT);
    scrollVelocity = (y - lastScrollY) / dt;
    lastScrollY = y;
    lastScrollT = t;
    // Cancel pending snap — user is still scrolling
    clearTimeout(pendingSnapTimer);
  }, { passive: true });

  const hasScrollEnd = 'onscrollend' in window;
  if (hasScrollEnd) {
    window.addEventListener('scrollend', () => {
      // Small debounce even with native scrollend — user may resume quickly
      schedulePendingSnap();
    });
  } else {
    // Fallback: no native scrollend → debounce the scroll event
    window.addEventListener('scroll', () => {
      schedulePendingSnap();
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
