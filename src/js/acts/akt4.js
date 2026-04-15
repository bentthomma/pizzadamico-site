import gsap from 'gsap';
import { reduceMotion } from '../reduced-motion.js';

export function initAkt4() {
  const section = document.querySelector('.akt-4');
  if (!section) return;

  const nodes = section.querySelectorAll('.kicker, .akt-4-title, .akt-4-lede, .akt-4-media');

  if (reduceMotion.value) {
    gsap.set([...nodes], { opacity: 1, y: 0 });
    return;
  }

  gsap.from(nodes, {
    scrollTrigger: { trigger: section, start: 'top 70%', end: 'top 30%', scrub: 1 },
    opacity: 0, y: 22, duration: 0.6, stagger: 0.12,
  });
}
