import gsap from 'gsap';
import { reduceMotion } from '../reduced-motion.js';

export function initAkt7() {
  const section = document.querySelector('.akt-7');
  if (!section) return;

  if (reduceMotion.value) return;

  gsap.from(section.querySelectorAll('.akt-7-title, .akt-7-map, .akt-7-contact'), {
    scrollTrigger: { trigger: section, start: 'top 75%', end: 'top 35%', scrub: 1 },
    opacity: 0, y: 24, stagger: 0.1,
  });
}
