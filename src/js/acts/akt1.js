import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduceMotion } from '../reduced-motion.js';

export function initAkt1() {
  const hero = document.querySelector('.akt-1-hero');
  if (!hero) return;
  const kicker = hero.querySelector('.akt-1-kicker');
  const brand  = hero.querySelector('.akt-1-brand');
  const sub    = hero.querySelector('.akt-1-sub');
  const parts  = [kicker, brand, sub].filter(Boolean);
  if (parts.length === 0) return;

  gsap.set(parts, { opacity: 0, y: 14 });

  if (reduceMotion.value) {
    gsap.set(parts, { opacity: 1, y: 0 });
    return;
  }

  gsap.timeline({ delay: 0.35 })
    .to(kicker, { opacity: 1, y: 0, duration: 1.0, ease: 'expo.out' }, 0)
    .to(brand,  { opacity: 1, y: 0, duration: 1.6, ease: 'expo.out' }, 0.15)
    .to(sub,    { opacity: 0.85, y: 0, duration: 1.2, ease: 'expo.out' }, 0.6);

  gsap.to(parts, {
    scrollTrigger: { trigger: '.akt-1', start: 'top top', end: 'bottom top', scrub: 1 },
    y: -60,
    opacity: 0,
    ease: 'none',
  });
}
