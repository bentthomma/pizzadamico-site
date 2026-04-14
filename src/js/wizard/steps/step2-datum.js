import { createEl, empty } from '../../lib/dom.js';
import { getState, setField } from '../state.js';

const DURATIONS = [
  { id: '2h', label: '2 Stunden' },
  { id: '3h', label: '3 Stunden' },
  { id: '4h', label: '4 Stunden' },
  { id: 'long', label: 'länger' },
];

export function renderStep2(stage) {
  empty(stage);
  const s = getState();

  stage.appendChild(createEl('div', { class: 'kicker' }, ['Schritt 2 / 8']));
  stage.appendChild(createEl('h3', { class: 'display', style: 'font-size: clamp(26px, 3.2vw, 44px);' }, ['Wann?']));

  const row = createEl('div', { style: 'display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top: 20px;' });

  row.appendChild(fieldInput('Datum', 'date', 'date', s.date ?? '', (v) => setField('date', v)));
  row.appendChild(fieldInput('Uhrzeit', 'time', 'time', s.time ?? '', (v) => setField('time', v)));

  stage.appendChild(row);

  stage.appendChild(createEl('label', { class: 'meta', style: 'display:block; margin-top: 24px;' }, ['Dauer']));
  const durRow = createEl('div', { style: 'display:flex; gap:10px; flex-wrap:wrap; margin-top: 8px;' });
  for (const d of DURATIONS) {
    const btn = createEl('button', {
      type: 'button',
      dataset: { state: s.duration === d.id ? 'selected' : 'default' },
      onclick: () => { setField('duration', d.id); renderStep2(stage); },
      style: 'padding: 10px 18px; border: 1px solid var(--c-inchiostro); border-radius: 999px; font-family: var(--ff-mono); font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; background: transparent; color: var(--c-inchiostro); cursor: pointer;' + (s.duration === d.id ? ' background: var(--c-inchiostro); color: var(--c-farina);' : ''),
    }, [d.label]);
    durRow.appendChild(btn);
  }
  stage.appendChild(durRow);
}

function fieldInput(label, name, type, value, onChange) {
  const wrap = createEl('div');
  wrap.appendChild(createEl('label', { class: 'meta', for: name, style: 'display:block; margin-bottom: 6px;' }, [label]));
  const input = createEl('input', {
    id: name, name, type, value,
    style: 'width: 100%; padding: 10px 12px; background: transparent; border: 1px solid var(--c-line); border-radius: 4px; font-family: var(--ff-mono); font-size: 14px; color: var(--c-inchiostro);',
  });
  input.addEventListener('input', (e) => onChange(e.target.value));
  wrap.appendChild(input);
  return wrap;
}
