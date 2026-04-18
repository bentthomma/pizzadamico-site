import { createEl, empty } from '../../lib/dom.js';
import { getState, setField, subscribe } from '../state.js';

// Step 6 – Setup-Checkliste
// 4 Fragen (power, space, shelter, access), je 3 Kartenoptionen.
// Zusatz: optionale Notiz (geteiltes state.note Feld mit Step 7).

const STYLE_ID = 'step6-setup-style';

const QUESTIONS = [
  {
    field: 'power',
    label: 'Strom vor Ort?',
    options: [
      { value: '230v',   title: '230V',             sub: 'Normaler Hausstrom-Anschluss' },
      { value: '380v',   title: '380V Starkstrom',  sub: 'CEE-Stecker, 3-phasig' },
      { value: 'nein',   title: 'Kein Strom',       sub: 'Nicht verfügbar' },
      { value: 'unklar', title: 'Unklar',           sub: 'Wir klären das per Telefon' },
    ],
  },
];

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .step6-question { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
    .step6-question-head .wizard-step-kicker {
      font-size: 13px;
      color: var(--wz-fg);
      letter-spacing: 0.1em;
      font-weight: 600;
    }
    .step6-options {
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 8px;
    }
    .step6-option { text-align: left; padding: 10px 14px; }
    .step6-option .wz-card-title { font-size: 14px; font-weight: 600; }
    .step6-option .wz-card-sub { font-size: 12px; margin-top: 2px; }
    .step6-summary {
      margin-top: 16px;
      padding: 14px 18px;
      border: 1px solid var(--wz-success);
      border-radius: 10px;
      color: var(--wz-success);
      font-size: 14px;
      display: none;
    }
    .step6-summary[data-state="complete"] { display: block; }
  `;
  document.head.appendChild(style);
}

function setSetupField(field, value) {
  const next = { ...getState().setup, [field]: value };
  setField('setup', next);
}

export function renderStep6(stage) {
  empty(stage);
  ensureStyles();

  // Header
  stage.appendChild(createEl('div', { class: 'kicker' }, ['Schritt 7 / 9']));
  stage.appendChild(createEl('h3', {
    class: 'display',
    style: 'font-size: clamp(26px, 3.2vw, 44px);',
  }, ['Ist alles bereit für den Truck?']));
  stage.appendChild(createEl('p', { class: 'lede editorial' }, [
    "Kurzer Check — damit vor Ort nichts fehlt. Bei Unklarheit: melde uns 'unklar', wir rufen an.",
  ]));

  // Container for questions (so we can rebind cleanly)
  const questionsRoot = createEl('div', { class: 'step6-questions' });
  stage.appendChild(questionsRoot);

  // Build each question
  const optionButtonsByField = {}; // field -> Map<value, button>
  for (const q of QUESTIONS) {
    const row = createEl('div', { class: 'step6-question' });

    const head = createEl('div', { class: 'step6-question-head' });
    head.appendChild(createEl('div', { class: 'wizard-step-kicker' }, [q.label]));
    row.appendChild(head);

    const grid = createEl('div', { class: 'wz-card-grid step6-options' });
    const buttonMap = new Map();

    for (const opt of q.options) {
      const btn = createEl('button', {
        type: 'button',
        class: 'wz-card step6-option',
        'aria-pressed': 'false',
        dataset: { field: q.field, value: opt.value },
        onclick: () => setSetupField(q.field, opt.value),
      }, [
        createEl('div', { class: 'wz-card-title' }, [opt.title]),
        createEl('div', { class: 'wz-card-sub' }, [opt.sub]),
      ]);
      buttonMap.set(opt.value, btn);
      grid.appendChild(btn);
    }

    optionButtonsByField[q.field] = buttonMap;
    row.appendChild(grid);
    questionsRoot.appendChild(row);
  }

  // Note field removed — Step 8 Kontakt has its own "Nachricht" textarea.
  // Summary banner removed — Weiter button state is signal enough.

  // Subscribe: keep aria-pressed in sync with state
  const unsubscribe = subscribe((s) => {
    const setup = s.setup || {};

    for (const q of QUESTIONS) {
      const current = setup[q.field];
      const map = optionButtonsByField[q.field];
      if (!map) continue;
      for (const [val, btn] of map.entries()) {
        const pressed = current === val;
        btn.setAttribute('aria-pressed', pressed ? 'true' : 'false');
      }
    }
  });

  // Tear down subscription when the stage is emptied or replaced.
  const observer = new MutationObserver(() => {
    if (!stage.contains(questionsRoot)) {
      unsubscribe();
      observer.disconnect();
    }
  });
  observer.observe(stage, { childList: true });
}
