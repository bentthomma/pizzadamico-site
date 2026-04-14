import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduceMotion } from './reduced-motion.js';

gsap.registerPlugin(ScrollTrigger);

let lenis = null;

export function initScroll() {
  if (lenis) return lenis;

  if (reduceMotion.value) {
    ScrollTrigger.config({ ignoreMobileResize: true });
    return null;
  }

  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: false,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);

  window.addEventListener('resize', () => ScrollTrigger.refresh());

  return lenis;
}

export function scrollTo(target, opts = {}) {
  if (!lenis) {
    if (typeof target === 'number') window.scrollTo({ top: target, behavior: 'smooth' });
    else if (typeof target === 'string') document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
    return;
  }
  lenis.scrollTo(target, { duration: 1.2, ...opts });
}

export function destroyScroll() {
  if (!lenis) return;
  lenis.destroy();
  lenis = null;
}
