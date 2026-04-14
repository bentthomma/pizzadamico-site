import { createEl, empty } from '../../lib/dom.js';
import { getState, patch } from '../state.js';

const QUESTIONS = [
  { id: 'power',   q: 'Ist ein Stromanschluss (230V / 16A) vor Ort?' },
  { id: 'space',   q: 'Gibt es Platz für einen Pferdeanhänger von ca. 7 × 3 m?' },
  { id: 'shelter', q: 'Ist die Stelle überdacht oder hast du einen Plan B bei Regen?' },
];

export function renderStep6(stage) {
  empty(stage);
  const s = getState();

  stage.appendChild(createEl('div', { class: 'kicker' }, ['Schritt 6 / 8']));
  stage.appendChild(createEl('h3', { class: 'display', style: 'font-size: clamp(26px, 3.2vw, 44px);' }, ['Setup-Check.']));
  stage.appendChild(createEl('p', { class: 'lede editorial' }, ['Wir kommen flexibel (inklusive Strom-Aggregat bei Bedarf). Dein „Nein" ist kein Problem – wir bringen Lösung mit.']));

  for (const q of QUESTIONS) {
    const row = createEl('fieldset', { style: 'margin-top: 18px; padding: 0; border: 0;' });
    row.appendChild(createEl('legend', { class: 'meta', style: 'margin-bottom: 8px;' }, [q.q]));

    const row2 = createEl('div', { style: 'display:flex; gap: 10px;' });
    for (const val of [true, false]) {
      const label = val ? 'Ja' : 'Nein';
      const selected = s.setup[q.id] === val;
      const btn = createEl('button', {
        type: 'button',
        dataset: { state: selected ? 'selected' : 'default' },
        onclick: () => { patch({ setup: { ...getState().setup, [q.id]: val } }); renderStep6(stage); },
        style: `padding: 8px 16px; border: 1px solid var(--c-inchiostro); border-radius: 999px; font-family: var(--ff-mono); font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; background: ${selected ? 'var(--c-inchiostro)' : 'transparent'}; color: ${selected ? 'var(--c-farina)' : 'var(--c-inchiostro)'}; cursor: pointer;`,
      }, [label]);
      row2.appendChild(btn);
    }
    row.appendChild(row2);
    stage.appendChild(row);
  }
}
