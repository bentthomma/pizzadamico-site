import { createEl, empty, setText } from '../../lib/dom.js';
import { getState, setField, patch, totalGuests } from '../state.js';

export function renderStep4(stage) {
  empty(stage);
  const s = getState();

  stage.appendChild(createEl('div', { class: 'kicker' }, ['Schritt 4 / 8']));
  stage.appendChild(createEl('h3', { class: 'display', style: 'font-size: clamp(26px, 3.2vw, 44px);' }, ['Wie viele Gäste?']));
  stage.appendChild(createEl('p', { class: 'lede editorial' }, ['Pizza à discrétion · Kinder 5–10 Jahre reduziert · Vegetarisch/Vegan per Slider.']));

  const row = createEl('div', { style: 'display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top: 20px;' });
  row.appendChild(counter('Erwachsene', s.adults, (v) => setField('adults', Math.max(0, v))));
  row.appendChild(counter('Kinder 5–10 J.', s.children, (v) => setField('children', Math.max(0, v))));
  stage.appendChild(row);

  const sliderWrap = createEl('div', { style: 'margin-top: 24px;' });
  sliderWrap.appendChild(createEl('label', { class: 'meta', for: 'veg-slider', style: 'display:block;' },
    [`Vegetarisch / Vegan Anteil: ${s.vegPercent}%`]));
  const slider = createEl('input', {
    id: 'veg-slider', type: 'range', min: '0', max: '100', step: '5', value: String(s.vegPercent),
    style: 'width: 100%; margin-top: 8px; accent-color: var(--c-inchiostro);',
  });
  slider.addEventListener('input', (e) => {
    setField('vegPercent', parseInt(e.target.value, 10));
    setText(sliderWrap.querySelector('label'), `Vegetarisch / Vegan Anteil: ${e.target.value}%`);
  });
  sliderWrap.appendChild(slider);
  stage.appendChild(sliderWrap);

  const guests = totalGuests();
  if (guests > 0 && guests < 30) {
    const warn = createEl('aside', {
      class: 'wizard-warning',
      role: 'note',
      style: 'margin-top: 24px; padding: 16px 18px; border: 1px solid var(--c-pane); background: color-mix(in srgb, var(--c-pane) 12%, transparent); border-radius: 4px;',
    });
    warn.appendChild(createEl('p', { class: 'meta', style: 'color: var(--c-pane); margin: 0 0 4px;' }, ['Weniger als 30 Personen?']));
    warn.appendChild(createEl('p', { style: 'margin: 0 0 10px; max-width: 50ch;' },
      ['Für kleinere Anlässe melde dich bitte direkt bei Pietro – wir finden zusammen die beste Lösung.']));
    const btn = createEl('a', {
      href: 'tel:+41763313259',
      class: 'meta',
      style: 'display:inline-block; padding: 8px 14px; background: var(--c-inchiostro); color: var(--c-farina); border-radius: 999px; text-decoration: none; letter-spacing: 2px;',
    }, ['076 331 32 59 anrufen']);
    warn.appendChild(btn);
    stage.appendChild(warn);
  }
}

function counter(label, value, onChange) {
  const wrap = createEl('div');
  wrap.appendChild(createEl('label', { class: 'meta', style: 'display:block; margin-bottom: 6px;' }, [label]));
  const row = createEl('div', { style: 'display:flex; align-items:center; gap:12px; padding: 8px 12px; border: 1px solid var(--c-line); border-radius: 4px;' });
  const dec = createEl('button', { type: 'button', onclick: () => onChange(value - 1), style: counterBtnStyle() }, ['−']);
  const val = createEl('span', { style: 'flex:1; text-align:center; font-family: var(--ff-mono); font-size: 22px; font-variant-numeric: tabular-nums;' }, [String(value)]);
  const inc = createEl('button', { type: 'button', onclick: () => onChange(value + 1), style: counterBtnStyle() }, ['+']);
  row.append(dec, val, inc);
  wrap.appendChild(row);
  return wrap;
}

function counterBtnStyle() {
  return 'width: 28px; height: 28px; border-radius: 50%; border: 1px solid var(--c-inchiostro); font-size: 16px; background: transparent; color: var(--c-inchiostro); cursor: pointer; line-height: 1;';
}
