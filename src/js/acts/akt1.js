import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduceMotion } from '../reduced-motion.js';

export function initAkt1() {
  const word = document.querySelector('.akt-1-word');
  if (!word) return;
  gsap.set(word, { opacity: 0, y: 12 });

  if (reduceMotion.value) {
    gsap.set(word, { opacity: 1, y: 0 });
    return;
  }

  gsap.timeline().to(word, { opacity: 1, y: 0, duration: 1.8, ease: 'expo.out', delay: 0.4 });

  gsap.to(word, {
    scrollTrigger: { trigger: '.akt-1', start: 'top top', end: 'bottom top', scrub: 1 },
    y: -80,
    opacity: 0,
    ease: 'none',
  });
}
