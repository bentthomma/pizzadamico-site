// Step 8 · Übersicht + AGB-Bestätigung
// Grouped summary of all entered data with per-section edit buttons,
// price total card, and AGB confirmation checkbox.

import { createEl, empty } from '../../lib/dom.js';
import { getState, setField, subscribe } from '../state.js';
import { calcPricing, formatChf } from '../pricing.js';
import { validateStep } from '../validation.js';
import { openModal } from '../../site-modal.js';

const WEEKDAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const MONTHS_LONG = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

function formatLongDate(iso) {
  if (!iso || typeof iso !== 'string') return '—';
  const parts = iso.split('-');
  if (parts.length !== 3) return iso;
  const [y, m, d] = parts.map(n => parseInt(n, 10));
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return iso;
  const dt = new Date(Date.UTC(y, m - 1, d));
  const wd = WEEKDAYS[dt.getUTCDay()];
  return `${wd}, ${d}. ${MONTHS_LONG[m - 1]} ${y}`;
}

const EVENT_LABELS = {
  hochzeit: 'Hochzeit',
  firma: 'Firmenfeier',
  geburtstag: 'Geburtstag',
  privat: 'Privatfest',
  sonstiges: 'Sonstiges',
};

// Must mirror step6-setup.js values (strings, not booleans).
const SETUP_LABELS = {
  power: {
    ja: 'Stromanschluss 230V',
    nein: 'Kein Strom verfügbar',
    unklar: 'Unklar · wir klären telefonisch',
  },
  space: {
    gross: 'Grosszügig · ≥ 4 × 4 m',
    klein: 'Kompakt · 3 × 3 m',
    eng: 'Enger Platz',
  },
  shelter: {
    dach: 'Festes Dach vorhanden',
    zelt: 'Zelt / Pavillon',
    keins: 'Offener Platz',
  },
  access: {
    direkt: 'Anfahrt direkt zum Aufstellort',
    kurz: 'max. 20 m Umschlag',
    lang: 'Längere Strecke (Tragen nötig)',
  },
};

// Must mirror step5-zutaten.js TOPPINGS array (17 toppings).
const TOPPING_LABELS = {
  'champignons':  'Champignons',
  'zwiebeln':     'Zwiebeln',
  'zucchetti':    'Zucchetti',
  'spinat':       'Spinat',
  'aubergine':    'Aubergine',
  'peperoni':     'Peperoni',
  'artischocken': 'Artischocken',
  'oliven':       'Oliven',
  'kapern':       'Kapern',
  'knoblauch':    'Knoblauch',
  'schinken':     'Schinken',
  'salami':       'Salami',
  'speck':        'Speck',
  'thunfisch':    'Thunfisch',
  'sardellen':    'Sardellen',
  'rahm':         'Rahm',
  'gorgonzola':   'Gorgonzola',
};

function toppingLabel(id) {
  if (TOPPING_LABELS[id]) return TOPPING_LABELS[id];
  if (typeof id !== 'string' || id.length === 0) return id;
  return id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' ');
}

function setupLabel(key, value) {
  const map = SETUP_LABELS[key];
  if (map && map[value] != null) return map[value];
  return '—';
}

function ensureStyle() {
  const ID = 'step8-style';
  if (document.getElementById(ID)) return;
  const style = document.createElement('style');
  style.id = ID;
  style.textContent = `
.step8-summary { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 14px; }
.step8-group { border: 1px solid var(--wz-line); border-radius: 12px; padding: 10px 14px; background: color-mix(in srgb, var(--wz-fg) 2%, transparent); }
.step8-group-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 4px; }
.step8-group-head .wizard-step-kicker { color: var(--wz-fg-dim); letter-spacing: 0.14em; margin: 0; font-size: 10px; }
.step8-edit { appearance: none; background: transparent; border: none; color: var(--wz-accent); font-family: var(--ff-mono); font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer; padding: 2px 6px; border-radius: 4px; transition: background 180ms ease; }
.step8-edit:hover { background: color-mix(in srgb, var(--wz-accent) 12%, transparent); }
.step8-edit:focus-visible { outline: 2px solid var(--wz-accent); outline-offset: 2px; }
.step8-group-body { font-size: 14px; color: var(--wz-fg); line-height: 1.4; }
.step8-toppings { list-style: none; padding: 0; margin: 0 0 4px 0; display: flex; flex-wrap: wrap; gap: 4px; }
.step8-toppings li { padding: 2px 8px; border: 1px solid var(--wz-line); border-radius: 999px; font-size: 11px; background: color-mix(in srgb, var(--wz-fg) 3%, transparent); }
.step8-total { margin-top: 14px; padding: 14px 18px; border: 1px solid var(--wz-accent); border-radius: 14px; background: color-mix(in srgb, var(--wz-accent) 8%, transparent); text-align: center; display: flex; flex-direction: column; gap: 2px; }
.step8-total-label { font-family: var(--ff-mono); font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--wz-fg-dim); }
.step8-total-amount { font-family: var(--ff-display); font-size: clamp(26px, 3vw, 36px); font-weight: 540; color: var(--wz-accent); font-variant-numeric: tabular-nums; line-height: 1.1; }
.step8-total-split { display: flex; flex-wrap: wrap; justify-content: center; gap: 4px 8px; font-family: var(--ff-editorial); font-style: italic; color: var(--wz-fg-soft); font-size: 12px; margin-top: 2px; }
.step8-agb { margin-top: 10px; padding: 12px 14px; border: 1px dashed var(--wz-line); border-radius: 10px; display: flex; align-items: flex-start; gap: 12px; font-size: 13px; }
.step8-agb a { color: var(--wz-accent); text-decoration: underline; text-underline-offset: 2px; }
.step8-agb-text { flex: 1; line-height: 1.4; font-size: 13px; }
@media (max-width: 640px) {
  .step8-summary { grid-template-columns: 1fr; }
}
  `;
  document.head.appendChild(style);
}

function buildGroup({ kicker, gotoStep, body }) {
  const head = createEl('div', { class: 'step8-group-head' }, [
    createEl('div', { class: 'wizard-step-kicker' }, [kicker]),
    createEl('button', {
      class: 'step8-edit',
      type: 'button',
      'data-goto': String(gotoStep),
      'aria-label': `${kicker} bearbeiten`,
    }, ['Ändern']),
  ]);
  const bodyEl = createEl('div', { class: 'step8-group-body' }, Array.isArray(body) ? body : [body]);
  return createEl('section', { class: 'step8-group' }, [head, bodyEl]);
}

export function renderStep8(stage) {
  empty(stage);
  ensureStyle();

  const s = getState();
  const pricing = calcPricing(s);

  // ─── Header ─────────────────────────────────────────
  stage.appendChild(createEl('div', { class: 'wizard-step-kicker' }, ['Schritt 9 / 9']));
  stage.appendChild(createEl('h3', {
    class: 'display',
    style: 'font-size: clamp(26px, 3.2vw, 44px); margin: 4px 0 8px;',
  }, ['Passt alles?']));
  stage.appendChild(createEl('p', {
    class: 'wz-helper',
    style: 'margin-bottom: 14px; font-size: 14px;',
  }, [
    'Alle Angaben auf einen Blick. Nach Bestätigung sendet Pietro euch die TWINT-QR per E-Mail — sobald die CHF 250.– eingegangen sind, ist die Reservation definitiv.',
  ]));

  // ─── Missing fields warning ─────────────────────────
  // Validate steps 2-8 (step 1 Info has no fields, step 9 is current).
  const allErrors = [];
  for (let st = 2; st <= 8; st++) allErrors.push(...validateStep(st, s));
  if (allErrors.length > 0) {
    const labels = allErrors.map(e => e.msg).join(' · ');
    stage.appendChild(createEl('p', {
      class: 'wz-error',
      style: 'margin-bottom: 10px; padding: 8px 12px; border: 1px solid var(--wz-danger); border-radius: 8px; background: color-mix(in srgb, var(--wz-danger) 8%, transparent); font-size: 13px;',
    }, [`Bitte ergänze: ${labels}`]));
  }

  // ─── Summary sections ───────────────────────────────
  const summary = createEl('div', { class: 'step8-summary' });

  // Anlass (step 2 in 9-step wizard)
  summary.appendChild(buildGroup({
    kicker: 'Anlass',
    gotoStep: 2,
    body: EVENT_LABELS[s.eventType] ?? '—',
  }));

  // Datum · Uhrzeit · Dauer (step 3)
  const dateParts = [
    formatLongDate(s.date),
    s.time ?? '—',
    s.durationHours ? `${s.durationHours} Stunden` : '—',
  ];
  summary.appendChild(buildGroup({
    kicker: 'Datum · Uhrzeit · Dauer',
    gotoStep: 3,
    body: dateParts.join(' · '),
  }));

  // Ort (step 4)
  const ortBody = s.address
    ? `${s.address}${typeof s.distanceKm === 'number' ? ` · ${s.distanceKm.toFixed(1)} km` : ''}`
    : '—';
  summary.appendChild(buildGroup({
    kicker: 'Ort',
    gotoStep: 4,
    body: ortBody,
  }));

  // Gäste (step 5)
  const adults = Number(s.adults) || 0;
  const children = Number(s.children) || 0;
  const vegetarian = Number(s.vegetarian) || 0;
  summary.appendChild(buildGroup({
    kicker: 'Gäste',
    gotoStep: 5,
    body: `${adults} Erwachsene · ${children} Kinder · ${vegetarian} vegi`,
  }));

  // Zutaten
  const toppings = Array.isArray(s.toppings) ? s.toppings : [];
  const toppingsBodyEls = [];
  if (toppings.length === 0) {
    toppingsBodyEls.push(createEl('p', { style: 'margin:0 0 4px 0;' }, ['—']));
  } else if (toppings.length > 4) {
    // Compact summary: count + first 3 names + "…"
    const preview = toppings.slice(0, 3).map(toppingLabel).join(', ');
    toppingsBodyEls.push(createEl('p', { style: 'margin:0 0 4px 0;' }, [
      `${toppings.length} Zutaten · ${preview}…`,
    ]));
  } else {
    const ul = createEl('ul', { class: 'step8-toppings' });
    for (const t of toppings) {
      ul.appendChild(createEl('li', {}, [toppingLabel(t)]));
    }
    toppingsBodyEls.push(ul);
  }
  toppingsBodyEls.push(createEl('p', { class: 'wz-helper', style: 'margin: 0; font-size: 11px;' }, [
    'Immer dabei: Tomatensauce · Fior di Latte · frische handgemachte Pizzabasen',
  ]));
  summary.appendChild(buildGroup({
    kicker: 'Zutaten',
    gotoStep: 6,
    body: toppingsBodyEls,
  }));

  // Setup
  const setup = s.setup || {};
  const setupBody =
    `Strom: ${setupLabel('power', setup.power)} · ` +
    `Platz: ${setupLabel('space', setup.space)} · ` +
    `Dach: ${setupLabel('shelter', setup.shelter)}`;
  summary.appendChild(buildGroup({
    kicker: 'Setup',
    gotoStep: 7,
    body: setupBody,
  }));

  // Kontakt
  const contactParts = [s.name, s.email, s.phone].filter(v => v && String(v).trim() !== '');
  let contactBody = contactParts.length ? contactParts.join(' · ') : '—';
  if (s.note && String(s.note).trim()) contactBody += ` · Notiz: ${s.note}`;
  summary.appendChild(buildGroup({
    kicker: 'Kontakt',
    gotoStep: 8,
    body: contactBody,
  }));

  stage.appendChild(summary);

  // ─── Edit-button delegation ─────────────────────────
  summary.addEventListener('click', (e) => {
    const btn = e.target.closest('.step8-edit');
    if (!btn) return;
    const target = parseInt(btn.dataset.goto, 10);
    if (Number.isFinite(target) && target >= 1 && target <= 9) {
      setField('step', target);
    }
  });

  // ─── Price total ────────────────────────────────────
  const total = createEl('div', { class: 'step8-total' }, [
    createEl('div', { class: 'step8-total-label' }, ['Voraussichtlicher Gesamtbetrag']),
    createEl('div', { class: 'step8-total-amount' }, [`CHF ${formatChf(pricing.total)}`]),
    createEl('div', { class: 'step8-total-split' }, [
      createEl('span', {}, [`CHF ${formatChf(pricing.netto)} netto`]),
      createEl('span', { 'aria-hidden': 'true' }, ['·']),
      createEl('span', {}, [`+ ${formatChf(pricing.vat)} MwSt (8.1 %)`]),
      createEl('span', { 'aria-hidden': 'true' }, ['·']),
      createEl('span', {}, ['davon CHF 250.– Reservation per TWINT']),
    ]),
  ]);
  stage.appendChild(total);

  // ─── AGB checkbox ───────────────────────────────────
  const checkbox = createEl('input', { type: 'checkbox', 'data-agb': '' });
  checkbox.checked = !!s.acceptedTerms;
  checkbox.addEventListener('change', (e) => {
    setField('acceptedTerms', !!e.target.checked);
  });

  const checkBox = createEl('span', { class: 'wz-check-box' });
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 14 14');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(svgNS, 'path');
  path.setAttribute('d', 'M2 7l3 3 7-7');
  svg.appendChild(path);
  checkBox.appendChild(svg);

  const agbLink = createEl('a', {
    href: '#',
    'data-modal-target': 'modal-agb',
  }, ['AGB & Bedingungen']);
  agbLink.addEventListener('click', (e) => {
    e.preventDefault();
    const modal = document.getElementById('modal-agb');
    if (modal) openModal(modal);
  });

  const agbText = createEl('span', { class: 'step8-agb-text' }, [
    'Ich habe die ',
    agbLink,
    ' gelesen und akzeptiere sie. Mir ist bewusst, dass die Reservation erst nach Eingang der CHF 250.– Anzahlung per TWINT definitiv ist.',
  ]);

  const agbLabel = createEl('label', { class: 'wz-check step8-agb' }, [
    checkbox, checkBox, agbText,
  ]);
  stage.appendChild(agbLabel);

  // ─── Sync checkbox with state (draft restore / external changes) ──
  const unsubscribe = subscribe((next) => {
    if (!stage.isConnected) {
      unsubscribe();
      return;
    }
    if (checkbox.checked !== !!next.acceptedTerms) {
      checkbox.checked = !!next.acceptedTerms;
    }
  });
}
