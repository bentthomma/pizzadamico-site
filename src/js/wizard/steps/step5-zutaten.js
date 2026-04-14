import { createEl, empty } from '../../lib/dom.js';
import { getState, setField } from '../state.js';

const POOL = [
  { cat: 'Gemüse',  items: ['Champignons', 'Zwiebeln', 'Zucchetti', 'Spinat', 'Aubergine', 'Peperoni', 'Artischocken', 'Oliven', 'Kapern', 'Knoblauch'] },
  { cat: 'Fleisch', items: ['Schinken', 'Salami', 'Speck'] },
  { cat: 'Fisch',   items: ['Thunfisch', 'Sardellen'] },
  { cat: 'Käse',    items: ['Rahm', 'Gorgonzola'] },
];
const MAX = 6;

export function renderStep5(stage) {
  empty(stage);
  const s = getState();

  stage.appendChild(createEl('div', { class: 'kicker' }, ['Schritt 5 / 8']));
  stage.appendChild(createEl('h3', { class: 'display', style: 'font-size: clamp(26px, 3.2vw, 44px);' }, [`Wähle bis zu ${MAX} Zutaten.`]));
  stage.appendChild(createEl('p', { class: 'lede editorial' }, ['Basis ist immer Mozzarella Fior di Latte und San-Marzano-Tomate. Die folgenden Zutaten wählst du für dein Event.']));

  const counter = createEl('p', { class: 'meta', style: 'margin-top: 10px;' }, [`${s.toppings.length} / ${MAX} gewählt`]);
  stage.appendChild(counter);

  for (const group of POOL) {
    stage.appendChild(createEl('h4', { class: 'meta', style: 'margin: 20px 0 8px;' }, [group.cat]));
    const grid = createEl('div', { style: 'display:grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px;' });
    for (const it of group.items) {
      const checked = s.toppings.includes(it);
      const disabled = !checked && s.toppings.length >= MAX;
      const btn = createEl('button', {
        type: 'button',
        disabled: disabled ? 'disabled' : null,
        onclick: () => {
          const t = new Set(getState().toppings);
          if (t.has(it)) t.delete(it); else if (t.size < MAX) t.add(it);
          setField('toppings', Array.from(t));
          renderStep5(stage);
        },
        style: `padding: 10px 12px; border: 1px solid var(--c-inchiostro); border-radius: 4px; text-align:left; font-family: var(--ff-editorial); font-size: 14px; background: ${checked ? 'var(--c-inchiostro)' : 'transparent'}; color: ${checked ? 'var(--c-farina)' : 'var(--c-inchiostro)'}; cursor: ${disabled ? 'not-allowed' : 'pointer'}; opacity: ${disabled ? '0.35' : '1'};`,
      }, [it]);
      grid.appendChild(btn);
    }
    stage.appendChild(grid);
  }
}
