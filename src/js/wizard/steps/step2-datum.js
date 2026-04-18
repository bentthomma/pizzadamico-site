// Step 3 · Datum & Uhrzeit
// - Datum / Startzeit / Dauer
// - Smart Defaults je nach eventType
// - Availability-Check läuft jetzt beim Klick auf "Weiter" (siehe navigation.js)
// - Nur Konflikt/Fehler werden inline unter den Feldern gerendert (Erfolg = direktes Advance)

import { createEl, empty } from '../../lib/dom.js';
import {
  getState,
  setField,
  patch,
  subscribe,
  getStartDateTimeISO,
  getEndDateTimeISO,
} from '../state.js';
import { checkAvailability } from '../calendar-api.js';

/* =========================================================
   Styles · einmalig in <head> injizieren
   ========================================================= */

const STYLE_FLAG = 'wz-step2-styles';

function ensureStyles() {
  if (document.getElementById(STYLE_FLAG)) return;
  const style = createEl('style', { id: STYLE_FLAG }, [`
    .step2-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 22px;
    }
    @media (max-width: 640px) { .step2-grid { grid-template-columns: 1fr; } }

    .step2-duration .wz-card-grid {
      grid-template-columns: repeat(4, 1fr);
    }
    @media (max-width: 900px) {
      .step2-duration .wz-card-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 520px) {
      .step2-duration .wz-card-grid { grid-template-columns: 1fr; }
    }
    .step2-duration .wz-card { padding: 18px 18px; }
    .step2-duration .wz-card-badge {
      display: inline-block;
      font-family: var(--ff-mono);
      font-size: 10px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--wz-accent);
      margin-top: 4px;
    }

    .step2-duration input[type="number"]::-webkit-outer-spin-button,
    .step2-duration input[type="number"]::-webkit-inner-spin-button {
      -webkit-appearance: none; margin: 0;
    }
    .step2-duration input[type="number"] { -moz-appearance: textfield; max-width: 180px; }
    .step2-placeholder-span {
      font-family: var(--ff-mono);
      font-size: 12px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--wz-fg-dim);
    }

    .step2-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      border: 1px solid var(--wz-line);
      border-radius: 999px;
      font-family: var(--ff-editorial);
      font-style: italic;
      font-size: 13.5px;
      color: var(--wz-fg-soft);
      background: color-mix(in srgb, var(--wz-accent) 6%, transparent);
      align-self: flex-start;
    }

    .step3-status {
      border: 1px solid var(--wz-line);
      border-radius: 14px;
      padding: 18px 22px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      background: color-mix(in srgb, var(--wz-fg) 2%, transparent);
      transition: border-color 260ms var(--wz-e-soft),
                  background 260ms linear;
    }
    .step3-status:empty {
      display: none;
    }
    .step3-status[data-state="conflict"] {
      border-color: color-mix(in srgb, var(--wz-danger) 45%, var(--wz-line));
      background: color-mix(in srgb, var(--wz-danger) 5%, transparent);
    }
    .step3-status[data-state="error"] {
      border-color: color-mix(in srgb, var(--wz-danger) 40%, var(--wz-line));
    }

    .step3-status-line {
      display: flex;
      align-items: baseline;
      gap: 10px;
      font-size: 17px;
      line-height: 1.4;
    }
    .step3-status-line[data-tone="conflict"] { color: var(--wz-fg); }
    .step3-status-line[data-tone="error"]    { color: var(--wz-danger); }
    .step3-status-icon {
      font-size: 18px;
      line-height: 1;
      flex: 0 0 auto;
    }

    .step2-alt-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .step2-alt-title {
      font-family: var(--ff-mono);
      font-size: 11px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--wz-fg-dim);
    }

    .step2-alt-slots {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .step2-alt-chip {
      appearance: none;
      background: transparent;
      border: 1px solid var(--wz-line);
      color: var(--wz-fg);
      padding: 8px 14px;
      border-radius: 999px;
      font-family: var(--ff-mono);
      font-size: 13px;
      letter-spacing: 0.06em;
      cursor: pointer;
      transition: background 200ms linear, border-color 200ms linear,
                  transform 200ms var(--wz-e-soft);
    }
    .step2-alt-chip:hover {
      background: color-mix(in srgb, var(--wz-accent) 12%, transparent);
      border-color: var(--wz-accent);
      transform: translateY(-1px);
    }

    .step2-alt-days {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .step2-alt-day {
      appearance: none;
      text-align: left;
      background: transparent;
      border: 1px solid var(--wz-line);
      color: var(--wz-fg);
      padding: 10px 14px;
      border-radius: 10px;
      font-family: var(--ff-display);
      font-size: 15px;
      cursor: pointer;
      transition: background 200ms linear, border-color 200ms linear;
    }
    .step2-alt-day:hover {
      background: color-mix(in srgb, var(--wz-accent) 10%, transparent);
      border-color: var(--wz-accent);
    }
  `]);
  document.head.appendChild(style);
}

/* =========================================================
   Konstanten · Smart Defaults · Labels
   ========================================================= */

// Duration is now a free numeric input (1-12h), no preset cards.

const EVENT_DEFAULTS = {
  hochzeit:   { time: '16:00', duration: 5 },
  firma:      { time: '18:00', duration: 4 },
  geburtstag: { time: '18:00', duration: 4 },
  privat:     { time: '18:30', duration: 4 },
};

const EVENT_LABELS = {
  hochzeit:   'Hochzeit',
  firma:      'Firmenevent',
  geburtstag: 'Geburtstag',
  privat:     'Privates Fest',
};

const DAY_SHORT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const MONTH_SHORT = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sept.', 'Okt.', 'Nov.', 'Dez.'];

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}


function formatDayHuman(iso) {
  // iso: yyyy-mm-dd
  try {
    const [y, m, d] = iso.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return `${DAY_SHORT[dt.getDay()]}, ${d}. ${MONTH_SHORT[m - 1]}`;
  } catch { return iso; }
}

function applySmartDefaults() {
  const s = getState();
  if (!s.eventType) return;
  const def = EVENT_DEFAULTS[s.eventType];
  if (!def) return;
  const patchObj = {};
  if (!s.time) patchObj.time = def.time;
  if (!s.durationHours) patchObj.durationHours = def.duration;
  if (Object.keys(patchObj).length) patch(patchObj);
}

function resetAvailability() {
  patch({ availabilityChecked: false, availabilityResult: null });
  // Inline-Status ebenfalls leeren (falls auf der Seite)
  const status = document.querySelector('.step3-status');
  if (status) {
    status.dataset.state = 'idle';
    empty(status);
  }
}

/* =========================================================
   Render
   ========================================================= */

export function renderStep2(stage) {
  ensureStyles();
  empty(stage);

  // Smart Defaults falls leer
  applySmartDefaults();

  const section = createEl('section', { class: 'wizard-step is-mounting' });

  // --- Head ---
  const head = createEl('div', { class: 'wizard-step-head' }, [
    createEl('div', { class: 'wizard-step-kicker' }, ['Schritt 3 von 9']),
    createEl('h2', { class: 'wizard-step-title' }, ["Wann soll's stattfinden?"]),
    createEl('p', { class: 'wizard-step-lede' }, [
      'Pietro hält euch das Datum frei, sobald die CHF 250.– Anzahlung per TWINT eingegangen ist.',
    ]),
  ]);

  // --- Felder ---
  const gridRow = createEl('div', { class: 'step2-grid' });

  // Datum
  const dateField = createEl('div', { class: 'wz-field' });
  dateField.appendChild(createEl('label', { class: 'wz-label', for: 'step2-date' }, ['Datum']));
  const dateInput = createEl('input', {
    id: 'step2-date',
    type: 'date',
    class: 'wz-input',
    min: todayISO(),
    value: getState().date ?? '',
  });
  dateInput.addEventListener('change', (e) => {
    setField('date', e.target.value || null);
    resetAvailability();
  });
  dateField.appendChild(dateInput);
  gridRow.appendChild(dateField);

  // Uhrzeit
  const timeField = createEl('div', { class: 'wz-field' });
  timeField.appendChild(createEl('label', { class: 'wz-label', for: 'step2-time' }, ['Startzeit']));
  const timeInput = createEl('input', {
    id: 'step2-time',
    type: 'time',
    class: 'wz-input',
    value: getState().time ?? '',
  });
  timeInput.addEventListener('change', (e) => {
    setField('time', e.target.value || null);
    resetAvailability();
  });
  timeField.appendChild(timeInput);
  gridRow.appendChild(timeField);

  // --- Dauer (einfache Zahleneingabe in Stunden) ---
  const durationField = createEl('div', { class: 'wz-field step2-duration' });
  durationField.appendChild(createEl('div', { class: 'wz-label' }, ['Dauer (Stunden)']));

  const durationInput = createEl('input', {
    id: 'step2-duration',
    type: 'number',
    min: '1',
    max: '12',
    step: '1',
    class: 'wz-input',
    inputmode: 'numeric',
    placeholder: 'z.B. 4',
    value: Number.isInteger(getState().durationHours) ? String(getState().durationHours) : '',
  });
  durationInput.addEventListener('input', () => {
    const raw = durationInput.value.trim();
    if (raw === '') return;
    const n = parseInt(raw, 10);
    if (Number.isInteger(n) && n >= 1 && n <= 12) {
      setField('durationHours', n);
      resetAvailability();
    }
  });
  durationInput.addEventListener('blur', () => {
    const s = getState();
    if (Number.isInteger(s.durationHours)) {
      durationInput.value = String(s.durationHours);
    } else {
      durationInput.value = '';
    }
  });

  durationField.appendChild(durationInput);
  durationField.appendChild(createEl('p', { class: 'wz-helper' }, ['Zwischen 1 und 12 Stunden.']));

  // --- Inline-Statusbereich (nur bei Konflikt/Fehler sichtbar) ---
  const statusEl = createEl('div', {
    class: 'step3-status',
    dataset: { state: 'idle' },
    'aria-live': 'polite',
  });

  // --- Body zusammenbauen ---
  const body = createEl('div', { class: 'wizard-step-body' }, [
    gridRow,
    durationField,
    statusEl,
  ]);

  section.appendChild(head);
  section.appendChild(body);
  stage.appendChild(section);

  // --- State-Subscription für Back-Nav / Externe Änderungen ---
  const unsubscribe = subscribe((s) => {
    // Inputs sync
    if (document.body.contains(dateInput)) {
      if ((dateInput.value || '') !== (s.date || '')) dateInput.value = s.date || '';
    }
    if (document.body.contains(timeInput)) {
      if ((timeInput.value || '') !== (s.time || '')) timeInput.value = s.time || '';
    }
    // Duration input sync (skip if user currently typing)
    const h = s.durationHours;
    if (document.activeElement !== durationInput) {
      const str = Number.isInteger(h) ? String(h) : '';
      if (durationInput.value !== str) durationInput.value = str;
    }
    // Bei Unmount: Listener abmelden
    if (!document.body.contains(statusEl)) {
      unsubscribe();
    }
  });
}

/* =========================================================
   Availability-Runner + Conflict-Renderer
   Wird von navigation.js beim "Weiter"-Klick aufgerufen.
   ========================================================= */

function canCheck() {
  const s = getState();
  return Boolean(s.date && s.time && s.durationHours);
}

/**
 * Führt den Availability-Check aus.
 * Liefert { ok, result?, error? }.
 *   ok=true  → Termin frei, direkt weitergehen.
 *   ok=false + result      → Konflikt (oder Alternativen) → renderAvailabilityConflict aufrufen.
 *   ok=false + error (kein result) → Netzwerk-/Validierungsfehler → Fehlertext.
 */
export async function runAvailabilityCheck() {
  if (!canCheck()) {
    return { ok: false, error: 'Bitte Datum, Uhrzeit und Dauer ausfüllen.' };
  }

  const startISO = getStartDateTimeISO();
  const endISO   = getEndDateTimeISO();

  try {
    const result = await checkAvailability(startISO, endISO);
    patch({ availabilityChecked: true, availabilityResult: result });
    return { ok: result && result.available === true, result };
  } catch (err) {
    patch({ availabilityChecked: false, availabilityResult: null });
    return { ok: false, error: 'Verbindung fehlgeschlagen. Noch einmal?' };
  }
}

/**
 * Rendert Konflikt-Ergebnis (mit Alternativen) in den Inline-Statusbereich.
 * Aufrufer: navigation.js, wenn runAvailabilityCheck() mit ok=false + result zurückkommt.
 */
export function renderAvailabilityConflict(result) {
  const statusEl = document.querySelector('.step3-status');
  if (!statusEl) return;

  empty(statusEl);
  statusEl.dataset.state = 'conflict';

  const conflictText = result?.conflictOn
    ? `Leider belegt. ${result.conflictOn}.`
    : 'Leider belegt.';
  statusEl.appendChild(createEl('div', {
    class: 'step3-status-line',
    dataset: { tone: 'conflict' },
  }, [
    createEl('span', { class: 'step3-status-icon' }, ['✕']),
    createEl('span', null, [conflictText]),
  ]));

  // Same-day Alternativen
  const sameDay = Array.isArray(result?.alternativesSameDay) ? result.alternativesSameDay : [];
  if (sameDay.length) {
    const group = createEl('div', { class: 'step2-alt-group' });
    group.appendChild(createEl('div', { class: 'step2-alt-title' }, ['Andere Zeiten am selben Tag']));
    const slots = createEl('div', { class: 'step2-alt-slots' });
    for (const alt of sameDay) {
      const timeStr = typeof alt === 'string' ? alt : (alt.time || alt.start || '');
      if (!timeStr) continue;
      const chip = createEl('button', {
        type: 'button',
        class: 'step2-alt-chip',
        dataset: { time: timeStr },
      }, [timeStr]);
      chip.addEventListener('click', () => {
        setField('time', timeStr);
        resetAvailability();
      });
      slots.appendChild(chip);
    }
    group.appendChild(slots);
    statusEl.appendChild(group);
  }

  // Next-available-days
  const nextDays = Array.isArray(result?.nextAvailableDays) ? result.nextAvailableDays.slice(0, 5) : [];
  if (nextDays.length) {
    const group = createEl('div', { class: 'step2-alt-group' });
    group.appendChild(createEl('div', { class: 'step2-alt-title' }, ['Nächste freie Tage']));
    const days = createEl('div', { class: 'step2-alt-days' });
    for (const d of nextDays) {
      const dateStr = typeof d === 'string' ? d : (d.date || '');
      if (!dateStr) continue;
      const fromTime = typeof d === 'object' ? (d.from || d.time || '') : '';
      const label = fromTime
        ? `${formatDayHuman(dateStr)} · frei ab ${fromTime}`
        : `${formatDayHuman(dateStr)} · frei`;
      const btn = createEl('button', {
        type: 'button',
        class: 'step2-alt-day',
        dataset: { date: dateStr },
      }, [label]);
      btn.addEventListener('click', () => {
        setField('date', dateStr);
        if (fromTime) setField('time', fromTime);
        resetAvailability();
      });
      days.appendChild(btn);
    }
    group.appendChild(days);
    statusEl.appendChild(group);
  }
}

/**
 * Rendert eine generische Fehlermeldung (z. B. Netzwerkfehler) inline.
 */
export function renderAvailabilityError(message) {
  const statusEl = document.querySelector('.step3-status');
  if (!statusEl) return;

  empty(statusEl);
  statusEl.dataset.state = 'error';
  statusEl.appendChild(createEl('div', {
    class: 'step3-status-line',
    dataset: { tone: 'error' },
  }, [
    createEl('span', { class: 'step3-status-icon' }, ['⚠']),
    createEl('span', null, [message || 'Verbindung fehlgeschlagen. Noch einmal?']),
  ]));
}
