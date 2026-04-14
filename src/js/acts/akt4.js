import gsap from 'gsap';
import { reduceMotion } from '../reduced-motion.js';

export function initAkt4() {
  const section = document.querySelector('.akt-4');
  if (!section) return;

  const nodes = section.querySelectorAll('.kicker, .akt-4-title, .akt-4-lede, .akt-4-diagram');
  const quote = section.querySelector('.akt-4-quote');

  if (reduceMotion.value) {
    gsap.set([...nodes, quote], { opacity: 1, y: 0 });
    return;
  }

  const tl = gsap.timeline({
    scrollTrigger: { trigger: section, start: 'top 70%', end: 'top 30%', scrub: 1 },
  });
  tl.from(nodes, { opacity: 0, y: 22, duration: 0.6, stagger: 0.12 });

  gsap.from(quote, {
    scrollTrigger: { trigger: quote, start: 'top 75%', end: 'top 50%', scrub: 1 },
    opacity: 0, y: 26, duration: 0.8,
  });
}
