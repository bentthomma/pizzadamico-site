import gsap from 'gsap';
import { splitWords } from '../lib/split-text.js';
import { reduceMotion } from '../reduced-motion.js';

export function initAkt5Pietro() {
  const statement = document.querySelector('.akt-5-statement');
  if (!statement) return;

  const words = [];
  statement.querySelectorAll('.s-line').forEach((ln) => words.push(...splitWords(ln)));
  gsap.set(words, { opacity: 0, y: '0.2em' });

  if (reduceMotion.value) {
    gsap.set(words, { opacity: 1, y: 0 });
    return;
  }

  gsap.to(words, {
    scrollTrigger: { trigger: statement, start: 'top 70%', end: 'bottom 40%', scrub: 1.5 },
    opacity: 1, y: 0, stagger: { each: 0.04 }, ease: 'none',
  });
}
