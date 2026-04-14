import { createEl, empty } from '../../lib/dom.js';
import { getState, setField } from '../state.js';

export function renderStep7(stage) {
  empty(stage);
  const s = getState();

  stage.appendChild(createEl('div', { class: 'kicker' }, ['Schritt 7 / 8']));
  stage.appendChild(createEl('h3', { class: 'display', style: 'font-size: clamp(26px, 3.2vw, 44px);' }, ['Wie erreichen wir dich?']));

  const fields = [
    { name: 'name',  label: 'Name',    type: 'text',  auto: 'name' },
    { name: 'email', label: 'E-Mail',  type: 'email', auto: 'email' },
    { name: 'phone', label: 'Telefon', type: 'tel',   auto: 'tel' },
  ];

  for (const f of fields) {
    const wrap = createEl('div', { style: 'margin-top: 16px;' });
    wrap.appendChild(createEl('label', { class: 'meta', for: f.name, style: 'display:block; margin-bottom: 6px;' }, [f.label]));
    const input = createEl('input', {
      id: f.name, name: f.name, type: f.type, autocomplete: f.auto,
      value: s[f.name] ?? '',
      style: 'width: 100%; padding: 10px 12px; background: transparent; border: 1px solid var(--c-line); border-radius: 4px; font-family: var(--ff-editorial); font-size: 16px; color: var(--c-inchiostro);',
    });
    input.addEventListener('input', (e) => setField(f.name, e.target.value));
    wrap.appendChild(input);
    stage.appendChild(wrap);
  }

  const noteWrap = createEl('div', { style: 'margin-top: 20px;' });
  noteWrap.appendChild(createEl('label', { class: 'meta', for: 'note', style: 'display:block; margin-bottom: 6px;' }, ['Besondere Wünsche · optional']));
  const ta = createEl('textarea', {
    id: 'note', name: 'note', rows: '4',
    style: 'width: 100%; padding: 10px 12px; background: transparent; border: 1px solid var(--c-line); border-radius: 4px; font-family: var(--ff-editorial); font-size: 15px; color: var(--c-inchiostro); resize: vertical;',
  });
  ta.value = s.note ?? '';
  ta.addEventListener('input', (e) => setField('note', e.target.value));
  noteWrap.appendChild(ta);
  stage.appendChild(noteWrap);
}
