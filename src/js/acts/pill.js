import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initPill() {
  const pill = document.getElementById('cta-pill');
  const akt2 = document.querySelector('.akt-2');
  const akt6 = document.querySelector('.akt-6');
  if (!pill || !akt2) return;

  ScrollTrigger.create({
    trigger: akt2,
    start: 'top 75%',
    end: 'bottom top',
    onEnter: () => pill.dataset.state = 'visible',
    onLeaveBack: () => pill.dataset.state = 'hidden',
  });

  if (akt6) {
    ScrollTrigger.create({
      trigger: akt6,
      start: 'top 50%',
      end: 'bottom 50%',
      onEnter: () => pill.dataset.state = 'hidden',
      onLeave: () => pill.dataset.state = 'visible',
      onLeaveBack: () => pill.dataset.state = 'visible',
    });
  }

  pill.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('modal:open', { detail: { source: 'pill' } }));
  });
}
