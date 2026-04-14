import gsap from 'gsap';
import { createEl, empty } from '../lib/dom.js';
import { reduceMotion } from '../reduced-motion.js';

const UPCOMING_DATES = [
  { date: '2026-05-03', where: 'Bern · Bundesplatz Food-Event', time: '11:00 – 22:00' },
  { date: '2026-05-17', where: 'Münsingen · Schlossstrasse 15',  time: '17:00 – 22:00' },
  { date: '2026-05-24', where: 'Thun · Hofstettenfest',            time: '12:00 – 23:00' },
];

const MONATE = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];

function formatDateDe(iso) {
  const [y, m, d] = iso.split('-');
  return `${d} ${MONATE[parseInt(m, 10) - 1]} ${y}`;
}

export function initAkt7() {
  const section = document.querySelector('.akt-7');
  if (!section) return;

  const list = document.getElementById('akt7-dates');
  if (list) {
    empty(list);
    for (const d of UPCOMING_DATES) {
      const li = createEl('li', {}, [
        createEl('span', { class: 'd-date' },  [formatDateDe(d.date)]),
        createEl('span', { class: 'd-where' }, [d.where]),
        createEl('span', { class: 'd-time' },  [d.time]),
      ]);
      list.appendChild(li);
    }
  }

  if (reduceMotion.value) return;

  gsap.from(section.querySelectorAll('.akt-7-title, .akt-7-map, .akt-7-dates, .akt-7-contact'), {
    scrollTrigger: { trigger: section, start: 'top 75%', end: 'top 35%', scrub: 1 },
    opacity: 0, y: 24, stagger: 0.1,
  });
}
