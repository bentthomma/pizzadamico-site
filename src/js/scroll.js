// Native scroll with CSS scroll-snap + GSAP ScrollTrigger.
// Lenis temporarily disabled — CSS mandatory snap conflicts with Lenis virtual-scroll.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initScroll() {
  // Ensure ScrollTrigger updates on native scroll
  window.addEventListener('resize', () => ScrollTrigger.refresh());
  return null;
}

export function scrollTo(target, opts = {}) {
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

export function destroyScroll() { /* no-op */ }
