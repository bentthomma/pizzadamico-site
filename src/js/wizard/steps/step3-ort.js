import { createEl, empty } from '../../lib/dom.js';
import { getState, patch } from '../state.js';

export function renderStep3(stage) {
  empty(stage);
  const s = getState();

  stage.appendChild(createEl('div', { class: 'kicker' }, ['Schritt 3 / 8']));
  stage.appendChild(createEl('h3', { class: 'display', style: 'font-size: clamp(26px, 3.2vw, 44px);' }, ['Wo findet das Event statt?']));
  stage.appendChild(createEl('p', { class: 'lede editorial' }, ['Wir berechnen die Anfahrt automatisch ab Schlossstrasse 15, Münsingen (hin und zurück).']));

  const input = createEl('input', {
    id: 'address-input', type: 'text', placeholder: 'Adresse suchen…',
    value: s.address ?? '',
    autocomplete: 'off',
    style: 'width: 100%; padding: 12px 14px; background: transparent; border: 1px solid var(--c-line); border-radius: 4px; font-family: var(--ff-editorial); font-size: 16px; color: var(--c-inchiostro); margin-top: 16px;',
  });
  input.addEventListener('input', (e) => patch({ address: e.target.value, addressPlaceId: null, distanceKm: null }));

  stage.appendChild(input);

  const distRow = createEl('p', { class: 'meta', id: 'address-distance', style: 'margin-top: 10px;' },
    [s.distanceKm != null ? `Entfernung: ${s.distanceKm.toFixed(1)} km · Anfahrt ${(s.distanceKm * 2).toFixed(1)} km` : 'Entfernung wird berechnet sobald eine Adresse gewählt ist.']);
  stage.appendChild(distRow);

  document.dispatchEvent(new CustomEvent('wizard:step3-mounted', { detail: { inputEl: input } }));
}
