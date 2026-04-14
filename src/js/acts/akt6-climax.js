import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduceMotion } from '../reduced-motion.js';

export function initAkt6Climax() {
  const section = document.querySelector('.akt-6');
  const pizza = document.querySelector('.akt-6-pizza');
  const fire = document.querySelector('.akt-6-fire');
  const caption = document.querySelector('.akt-6-caption');
  if (!section || !pizza) return;

  gsap.set([pizza, caption], { opacity: 0 });

  if (reduceMotion.value) { gsap.set([pizza, caption], { opacity: 1 }); return; }

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section, start: 'top top', end: '+=200%',
      pin: '.akt-6-stage', scrub: 1.2, anticipatePin: 1, invalidateOnRefresh: true,
    },
  });
  tl
    .from(fire,    { opacity: 0.4, duration: 0.4 }, 0)
    .to(fire,      { scale: 1.08, duration: 1.0 }, 0)
    .fromTo(pizza, { opacity: 0, scale: 0.82 }, { opacity: 1, scale: 1, duration: 0.7 }, 0.35)
    .fromTo(caption, { opacity: 0, x: 24 }, { opacity: 1, x: 0, duration: 0.5 }, 0.7);

  if (fire && fire.tagName === 'VIDEO') {
    ScrollTrigger.create({
      trigger: section, start: 'top top', end: '+=200%',
      onUpdate: (st) => { if (fire.duration && isFinite(fire.duration)) fire.currentTime = st.progress * fire.duration; },
    });
  }
}
