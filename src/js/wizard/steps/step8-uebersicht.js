import { createEl, empty } from '../../lib/dom.js';
import { getState } from '../state.js';
import { validateStep } from '../validation.js';

const MONATE = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];
function fmtDate(iso) { if (!iso) return '—'; const [y,m,d] = iso.split('-'); return `${d} ${MONATE[parseInt(m,10)-1]} ${y}`; }
function fmtEvent(id) { return ({ hochzeit:'Hochzeit', firma:'Firmenfeier', geburtstag:'Geburtstag', privat:'Privatfest', sonstiges:'Sonstiges' })[id] ?? '—'; }
function fmtBool(v) { return v === true ? 'Ja' : v === false ? 'Nein' : '—'; }

export function renderStep8(stage) {
  empty(stage);
  const s = getState();
  const errs = validateStep(8, s);

  stage.appendChild(createEl('div', { class: 'kicker' }, ['Schritt 8 / 8']));
  stage.appendChild(createEl('h3', { class: 'display', style: 'font-size: clamp(26px, 3.2vw, 44px);' }, ['Übersicht.']));

  if (errs.length > 0) {
    const warn = createEl('aside', {
      role: 'note',
      style: 'margin-top: 16px; padding: 14px; border: 1px solid var(--c-pomodoro); background: color-mix(in srgb, var(--c-pomodoro) 10%, transparent); border-radius: 4px;',
    });
    warn.appendChild(createEl('p', { class: 'meta', style: 'color: var(--c-pomodoro); margin: 0 0 6px;' }, [`${errs.length} fehlende Angaben`]));
    const ul = createEl('ul', { style: 'margin: 0; padding-left: 18px; font-family: var(--ff-editorial); font-size: 14px;' });
    for (const e of errs) ul.appendChild(createEl('li', {}, [e.msg]));
    warn.appendChild(ul);
    stage.appendChild(warn);
  }

  const rows = [
    ['Anlass',    fmtEvent(s.eventType)],
    ['Datum',     `${fmtDate(s.date)} · ${s.time ?? '—'} · ${s.duration ?? '—'}`],
    ['Ort',       s.address ?? '—'],
    ['Anfahrt',   s.distanceKm != null ? `${(s.distanceKm * 2).toFixed(1)} km` : '—'],
    ['Gäste',     `${s.adults} Erw · ${s.children} Kinder · ${s.vegPercent}% veggi/vegan`],
    ['Zutaten',   s.toppings.join(', ') || '—'],
    ['Strom',     fmtBool(s.setup.power)],
    ['Platz',     fmtBool(s.setup.space)],
    ['Dach',      fmtBool(s.setup.shelter)],
    ['Name',      s.name ?? '—'],
    ['E-Mail',    s.email ?? '—'],
    ['Telefon',   s.phone ?? '—'],
    ['Notiz',     s.note ?? ''],
  ];

  const dl = createEl('dl', { style: 'margin-top: 20px; display:grid; grid-template-columns: 140px 1fr; gap: 8px 16px; font-family: var(--ff-editorial); font-size: 15px;' });
  for (const [k, v] of rows) {
    dl.appendChild(createEl('dt', { class: 'meta', style: 'margin:0;' }, [k]));
    dl.appendChild(createEl('dd', { style: 'margin: 0;' }, [v]));
  }
  stage.appendChild(dl);
}
