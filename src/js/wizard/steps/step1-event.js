import { createEl, empty } from '../../lib/dom.js';
import { getState, setField } from '../state.js';

const OPTIONS = [
  { id: 'hochzeit',   label: 'Hochzeit' },
  { id: 'firma',      label: 'Firmenfeier' },
  { id: 'geburtstag', label: 'Geburtstag' },
  { id: 'privat',     label: 'Privatfest' },
  { id: 'sonstiges',  label: 'Sonstiges' },
];

export function renderStep1(stage) {
  empty(stage);

  stage.appendChild(createEl('div', { class: 'kicker' }, ['Schritt 1 / 8']));
  stage.appendChild(createEl('h3', { class: 'display', style: 'font-size: clamp(26px, 3.2vw, 44px);' }, ['Was ist der Anlass?']));
  stage.appendChild(createEl('p', { class: 'lede editorial' }, ['Damit Pietro weiss, in welcher Tonlage er plant.']));

  const chips = createEl('div', { class: 'chip-row', style: 'display:flex; flex-wrap:wrap; gap:10px; margin-top: 20px;' });
  const selected = getState().eventType;

  for (const opt of OPTIONS) {
    const btn = createEl('button', {
      type: 'button',
      class: 'chip',
      dataset: { state: selected === opt.id ? 'selected' : 'default' },
      onclick: () => { setField('eventType', opt.id); renderStep1(stage); },
      style: 'padding: 10px 18px; border: 1px solid var(--c-inchiostro); border-radius: 999px; font-family: var(--ff-mono); font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; background: transparent; color: var(--c-inchiostro); cursor: pointer;',
    }, [opt.label]);
    if (selected === opt.id) {
      btn.style.background = 'var(--c-inchiostro)';
      btn.style.color = 'var(--c-farina)';
    }
    chips.appendChild(btn);
  }
  stage.appendChild(chips);
}
