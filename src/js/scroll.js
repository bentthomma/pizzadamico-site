// Smooth scroll via Lenis + JS-based dominant-section snap on scroll-end.
// Lenis interpolates momentum for butter-smooth scrolling.
// Snap respects user velocity: fast scrolls = no fight with snap.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const SCROLLEND_DEBOUNCE = 200;
const PROGRAMMATIC_LOCK_MS = 1100;
const MIN_OFFSET_TO_SNAP = 12;
const USER_INTENT_VELOCITY = 0.35;  // Lenis velocity (normalized)

let lenis = null;
let programmaticLock = false;
let pendingSnapTimer = null;
let scrollVelocity = 0;
let footer = null;
let lastScrollY = 0;
let lastScrollTime = 0;

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

  if (footer) {
    const fr = footer.getBoundingClientRect();
    if (fr.top < window.innerHeight - 40) return;
  }

  const maxY = document.documentElement.scrollHeight - window.innerHeight;
  if (window.scrollY > maxY - 20) return;

  const target = dominantSection();
  if (!target) return;
  const rect = target.getBoundingClientRect();

  // scroll-padding-top: 72px in CSS means target.top should be ~72 not 0
  const idealTop = 0;  // Lenis + scrollTo with offset handles padding
  if (Math.abs(rect.top - idealTop) < MIN_OFFSET_TO_SNAP) return;

  if (Math.abs(scrollVelocity) > USER_INTENT_VELOCITY) {
    schedulePendingSnap();
    return;
  }

  programmaticLock = true;
  if (lenis) {
    lenis.scrollTo(target, {
      duration: 0.9,
      easing: (t) => 1 - Math.pow(1 - t, 3),  // ease-out cubic
      lock: true,
    });
  } else {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  setTimeout(() => { programmaticLock = false; }, PROGRAMMATIC_LOCK_MS);
}

function schedulePendingSnap() {
  clearTimeout(pendingSnapTimer);
  pendingSnapTimer = setTimeout(maybeSnap, SCROLLEND_DEBOUNCE);
}

export function initScroll() {
  footer = document.querySelector('.site-footer');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reduceMotion) {
    // Lenis instance — butter-smooth momentum scroll
    lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,  // native-touch on mobile feels better
      wheelMultiplier: 1.0,
      touchMultiplier: 2.0,
    });

    // Canonical Lenis + GSAP ScrollTrigger integration
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    // Track velocity + schedule snap on scroll-stop
    lenis.on('scroll', ({ scroll, velocity }) => {
      scrollVelocity = velocity;
      clearTimeout(pendingSnapTimer);
      if (Math.abs(velocity) < USER_INTENT_VELOCITY * 2) {
        schedulePendingSnap();
      }
    });
  } else {
    // No Lenis for reduced-motion users — use native scroll + scrollend
    lastScrollY = window.scrollY;
    lastScrollTime = performance.now();
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      const t = performance.now();
      const dt = Math.max(1, t - lastScrollTime);
      scrollVelocity = (y - lastScrollY) / dt;
      lastScrollY = y;
      lastScrollTime = t;
      clearTimeout(pendingSnapTimer);
    }, { passive: true });
    if ('onscrollend' in window) {
      window.addEventListener('scrollend', schedulePendingSnap);
    } else {
      window.addEventListener('scroll', schedulePendingSnap, { passive: true });
    }
  }

  window.addEventListener('resize', () => ScrollTrigger.refresh());
}

export function scrollTo(target, opts = {}) {
  programmaticLock = true;
  setTimeout(() => { programmaticLock = false; }, PROGRAMMATIC_LOCK_MS);

  if (lenis) {
    lenis.scrollTo(target, { duration: opts.instant ? 0 : 0.9 });
    return;
  }

  const behavior = opts.instant ? 'instant' : 'smooth';
  if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior });
  } else if (typeof target === 'string') {
    const el = document.querySelector(target);
    if (el) el.scrollIntoView({ behavior, block: 'start' });
  } else if (target && target.scrollIntoView) {
    target.scrollIntoView({ behavior, block: 'start' });
  }
}

export function destroyScroll() {
  if (lenis) { lenis.destroy(); lenis = null; }
}
