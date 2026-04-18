import { createEl, empty } from '../../lib/dom.js';
import { getState, setField } from '../state.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

const EVENTS = [
  {
    id: 'hochzeit',
    title: 'Hochzeit',
    sub: 'Der schönste Tag — einmalig, nicht wiederholbar.',
    icon: (svg) => {
      // Two interlocking rings
      svg.appendChild(svgEl('circle', { cx: '9', cy: '14', r: '5' }));
      svg.appendChild(svgEl('circle', { cx: '15', cy: '14', r: '5' }));
    },
  },
  {
    id: 'firma',
    title: 'Firmenevent',
    sub: 'Sommerfest, Weihnachtsfeier, Team-Offsite.',
    icon: (svg) => {
      // Building with windows
      svg.appendChild(svgPath('M3 21h18'));
      svg.appendChild(svgPath('M5 21V7l7-4 7 4v14'));
      svg.appendChild(svgPath('M9 9h2'));
      svg.appendChild(svgPath('M13 9h2'));
      svg.appendChild(svgPath('M9 13h2'));
      svg.appendChild(svgPath('M13 13h2'));
      svg.appendChild(svgPath('M9 17h2'));
      svg.appendChild(svgPath('M13 17h2'));
    },
  },
  {
    id: 'geburtstag',
    title: 'Geburtstag',
    sub: 'Runder, halbrunder, oder einfach so.',
    icon: (svg) => {
      // Cake with candle
      svg.appendChild(svgPath('M4 18h16v3H4z'));
      svg.appendChild(svgPath('M6 14c0-2 2-4 6-4s6 2 6 4v4H6z'));
      svg.appendChild(svgPath('M12 3v5'));
      svg.appendChild(svgPath('M9 6h6'));
    },
  },
  {
    id: 'privat',
    title: 'Privates Fest',
    sub: 'Hausfest, Jubiläum, Einladung im Garten.',
    icon: (svg) => {
      // Simple house
      svg.appendChild(svgPath('M3 12l9-8 9 8v8H3z'));
      svg.appendChild(svgPath('M9 20v-6h6v6'));
    },
  },
];

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}

function svgPath(d) {
  return svgEl('path', { d });
}

function buildIcon(event) {
  const svg = svgEl('svg', {
    class: 'wz-card-icon',
    viewBox: '0 0 24 24',
    stroke: 'currentColor',
    'stroke-width': '1.4',
    fill: 'none',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'aria-hidden': 'true',
  });
  event.icon(svg);
  return svg;
}

export function renderStep1(stage) {
  empty(stage);

  const section = createEl('section', { class: 'wizard-step is-mounting' });

  // Head
  const head = createEl('div', { class: 'wizard-step-head' }, [
    createEl('div', { class: 'wizard-step-kicker' }, ['Schritt 2 von 9']),
    createEl('h2', { class: 'wizard-step-title' }, ['Was für ein Anlass?']),
    createEl('p', { class: 'wizard-step-lede' }, [
      'Einer dieser vier — damit Pietro weiss, was euch wichtig ist.',
    ]),
  ]);

  // Body
  const grid = createEl('div', { class: 'wz-card-grid' });

  const buttons = [];
  const currentSelected = getState().eventType;

  for (const ev of EVENTS) {
    const isSelected = currentSelected === ev.id;
    const btn = createEl('button', {
      type: 'button',
      class: 'wz-card',
      'aria-pressed': isSelected ? 'true' : 'false',
      dataset: { event: ev.id },
      tabindex: '0',
    });

    btn.appendChild(buildIcon(ev));
    btn.appendChild(createEl('div', { class: 'wz-card-title' }, [ev.title]));
    btn.appendChild(createEl('div', { class: 'wz-card-sub' }, [ev.sub]));

    btn.addEventListener('click', () => {
      setField('eventType', ev.id);
      // Sync aria-pressed across all cards
      for (const b of buttons) {
        b.setAttribute('aria-pressed', b.dataset.event === ev.id ? 'true' : 'false');
      }
    });

    btn.addEventListener('keydown', (e) => {
      const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
      if (!keys.includes(e.key)) return;
      e.preventDefault();
      const idx = buttons.indexOf(btn);
      if (idx === -1) return;
      let nextIdx = idx;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        nextIdx = (idx - 1 + buttons.length) % buttons.length;
      } else {
        nextIdx = (idx + 1) % buttons.length;
      }
      buttons[nextIdx].focus();
    });

    buttons.push(btn);
    grid.appendChild(btn);
  }

  const body = createEl('div', { class: 'wizard-step-body' }, [grid]);

  section.appendChild(head);
  section.appendChild(body);
  stage.appendChild(section);
}
