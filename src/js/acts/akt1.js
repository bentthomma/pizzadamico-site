import gsap from 'gsap';
import { reduceMotion } from '../reduced-motion.js';

export function initAkt1() {
  const hero = document.querySelector('.akt-1-hero');
  if (!hero) return;
  const kicker = hero.querySelector('.akt-1-kicker');
  const brand  = hero.querySelector('.akt-1-brand');
  const sub    = hero.querySelector('.akt-1-sub');
  const cta    = hero.querySelector('.akt-1-cta');
  const parts  = [kicker, brand, sub, cta].filter(Boolean);
  if (parts.length === 0) return;

  gsap.set(parts, { opacity: 0, y: 14 });

  if (reduceMotion.value) {
    gsap.set(parts, { opacity: 1, y: 0 });
    return;
  }

  // Hero reveal timeline · plays on load · hero stays visible after (no scrub-out)
  gsap.timeline({ delay: 0.35 })
    .to(kicker, { opacity: 1, y: 0, duration: 1.0, ease: 'expo.out' }, 0)
    .to(brand,  { opacity: 1, y: 0, duration: 1.6, ease: 'expo.out' }, 0.15)
    .to(sub,    { opacity: 0.85, y: 0, duration: 1.2, ease: 'expo.out' }, 0.6)
    .to(cta,    { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out' }, 1.0);
}
