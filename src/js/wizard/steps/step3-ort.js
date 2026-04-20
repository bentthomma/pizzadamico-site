// Step 3 — Ort mit Adress-Autocomplete + km-Berechnung (OpenRouteService)
// Debounced Suche ueber searchAddress(); bei Auswahl wird calculateDistance()
// aufgerufen und distanceKm im State persistiert.

import { createEl, empty } from '../../lib/dom.js';
import { getState, patch, setField } from '../state.js';
import { searchAddress, calculateDistance } from '../ors-api.js';

const STYLE_ID = 'wz-step3-style';

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .step3-root { display: flex; flex-direction: column; gap: 16px; }
    .step3-suggestions {
      list-style: none;
      margin: 4px 0 0;
      padding: 0;
      border: 1px solid var(--wz-line);
      border-radius: 8px;
      max-height: 240px;
      overflow: auto;
      background: color-mix(in srgb, var(--wz-bg) 94%, var(--wz-fg));
      box-shadow: 0 12px 28px -18px color-mix(in srgb, var(--wz-bg) 80%, black);
    }
    .step3-suggestions:empty { display: none; }
    .step3-suggestions[hidden] { display: none; }
    .step3-suggestions li {
      padding: 10px 14px;
      cursor: pointer;
      font-size: 15px;
      line-height: 1.4;
      color: var(--wz-fg);
      transition: background 120ms ease;
    }
    .step3-suggestions li + li {
      border-top: 1px solid var(--wz-line-soft);
    }
    .step3-suggestions li:hover,
    .step3-suggestions li[aria-selected="true"] {
      background: color-mix(in srgb, var(--wz-fg) 8%, transparent);
      outline: none;
    }
    .step3-loading {
      margin-top: 8px;
      font-family: var(--ff-mono);
      font-size: 12px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--wz-fg-dim);
    }
    .step3-address-badge {
      display: flex;
      gap: 12px;
      align-items: center;
      padding: 16px 20px;
      border: 1px solid var(--wz-accent);
      border-radius: 12px;
      background: color-mix(in srgb, var(--wz-accent) 8%, transparent);
      margin-top: 12px;
    }
    .step3-address-badge-text {
      flex: 1;
      min-width: 0;
      font-size: 17px;
      line-height: 1.35;
      color: var(--wz-fg);
      overflow-wrap: anywhere;
      word-break: break-word;
    }
    .step3-address-badge-km {
      font-variant-numeric: tabular-nums;
      font-family: var(--ff-mono);
      color: var(--wz-accent);
      white-space: nowrap;
    }
    .step3-address-badge-clear {
      appearance: none;
      background: transparent;
      border: 1px solid var(--wz-line);
      width: 32px;
      height: 32px;
      border-radius: 999px;
      color: var(--wz-fg-soft);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      line-height: 1;
      transition: border-color 150ms ease, color 150ms ease, background 150ms ease;
    }
    .step3-address-badge-clear:hover {
      border-color: var(--wz-fg-soft);
      color: var(--wz-fg);
      background: color-mix(in srgb, var(--wz-fg) 6%, transparent);
    }
    .step3-error {
      margin-top: 8px;
      font-size: 13px;
      color: #ff6b6b;
    }
  `;
  document.head.appendChild(style);
}

export function renderStep3(stage) {
  ensureStyle();
  empty(stage);
  const s = getState();

  stage.appendChild(createEl('div', { class: 'kicker' }, ['Schritt 4 / 9']));
  stage.appendChild(createEl('h3', { class: 'display', style: 'font-size: clamp(26px, 3.2vw, 44px);' }, ["Wo findet's statt?"]));
  stage.appendChild(createEl('p', { class: 'lede editorial' }, ["Pietros Foodtruck steht in Münsingen — wir rechnen die Anfahrt direkt aus."]));

  const root = createEl('div', { class: 'step3-root', style: 'margin-top: 20px;' });
  stage.appendChild(root);

  // Field + suggestions container
  const fieldWrap = createEl('div', { class: 'wz-field' });
  fieldWrap.appendChild(createEl('label', { class: 'wz-label', for: 'step3-address-input' }, ['Event-Adresse']));

  const input = createEl('input', {
    id: 'step3-address-input',
    type: 'search',
    class: 'wz-input',
    autocomplete: 'off',
    placeholder: 'Strasse, Hausnummer, PLZ Ort',
    aria: { autocomplete: 'list', controls: 'step3-suggestions', expanded: 'false' },
    role: 'combobox',
  });

  const suggestionsEl = createEl('ul', {
    id: 'step3-suggestions',
    class: 'step3-suggestions',
    role: 'listbox',
    hidden: 'hidden',
  });

  fieldWrap.appendChild(input);
  fieldWrap.appendChild(suggestionsEl);
  root.appendChild(fieldWrap);

  // Badge / loading / error containers (managed imperatively)
  const loadingEl = createEl('p', { class: 'step3-loading', hidden: 'hidden' }, ['Berechne Distanz …']);
  const badgeHost = createEl('div');
  const errorEl = createEl('p', { class: 'wz-error step3-error', hidden: 'hidden' }, ['']);

  root.appendChild(loadingEl);
  root.appendChild(badgeHost);
  root.appendChild(errorEl);

  // ---- Local UI state ----
  let currentSuggestions = [];
  let activeIndex = -1;

  function showError(msg) {
    if (!msg) {
      errorEl.hidden = true;
      errorEl.textContent = '';
      return;
    }
    errorEl.hidden = false;
    errorEl.textContent = msg;
  }

  function setLoading(on) {
    loadingEl.hidden = !on;
  }

  function clearSuggestionsUI() {
    empty(suggestionsEl);
    suggestionsEl.hidden = true;
    currentSuggestions = [];
    activeIndex = -1;
    input.setAttribute('aria-expanded', 'false');
  }

  function setActive(index) {
    const items = suggestionsEl.querySelectorAll('li');
    activeIndex = index;
    items.forEach((li, i) => {
      const active = i === index;
      if (active) {
        li.setAttribute('aria-selected', 'true');
        li.scrollIntoView({ block: 'nearest' });
      } else {
        li.removeAttribute('aria-selected');
      }
    });
  }

  function renderSuggestions(list) {
    currentSuggestions = Array.isArray(list) ? list : [];
    empty(suggestionsEl);
    if (!currentSuggestions.length) {
      suggestionsEl.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      return;
    }
    currentSuggestions.forEach((sg, i) => {
      const li = createEl('li', {
        role: 'option',
        id: `step3-sugg-${i}`,
        dataset: { index: String(i) },
      }, [sg.label]);
      li.addEventListener('mousedown', (ev) => {
        // mousedown so the click fires before the input blur-hide
        ev.preventDefault();
        selectSuggestion(i);
      });
      li.addEventListener('mouseenter', () => setActive(i));
      suggestionsEl.appendChild(li);
    });
    suggestionsEl.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    activeIndex = -1;
  }

  function selectSuggestion(i) {
    const sg = currentSuggestions[i];
    if (!sg) return;
    patch({ address: sg.label, addressCoords: sg.coords, distanceKm: null });
    input.value = sg.label;
    clearSuggestionsUI();
    showError(null);
    setLoading(true);
    renderBadge(sg.label, null); // temporary badge while loading
    calculateDistance(sg.coords)
      .then((km) => {
        setLoading(false);
        setField('distanceKm', km);
        renderBadge(sg.label, km);
      })
      .catch(() => {
        setLoading(false);
        // Keep address, but clear any stale km; surface error
        setField('distanceKm', null);
        renderBadge(sg.label, null);
        showError('Distanz konnte nicht berechnet werden.');
      });
  }

  function renderBadge(address, km) {
    empty(badgeHost);
    if (!address) return;
    const badge = createEl('div', { class: 'step3-address-badge' });
    const text = createEl('span', { class: 'step3-address-badge-text' }, [`✓ ${address}`]);
    const kmEl = createEl('span', { class: 'step3-address-badge-km' },
      [km != null ? `${km.toFixed ? km.toFixed(1) : km} km` : '– km']);
    const clearBtn = createEl('button', {
      type: 'button',
      class: 'step3-address-badge-clear',
      'aria-label': 'Adresse zurücksetzen',
      title: 'Adresse zurücksetzen',
      onclick: () => {
        patch({ address: null, addressCoords: null, distanceKm: null });
        empty(badgeHost);
        showError(null);
        setLoading(false);
        input.value = '';
        clearSuggestionsUI();
        input.focus();
      },
    }, ['×']);
    badge.appendChild(text);
    badge.appendChild(kmEl);
    badge.appendChild(clearBtn);
    badgeHost.appendChild(badge);
  }

  // ---- Wire up events ----
  input.addEventListener('input', (e) => {
    const v = e.target.value;
    showError(null);
    // Re-searching clears the previously chosen address
    if (getState().address) {
      patch({ address: null, addressCoords: null, distanceKm: null });
      empty(badgeHost);
    }
    if (!v || !v.trim()) {
      clearSuggestionsUI();
      return;
    }
    searchAddress(v, (list) => {
      // Only render if the input still has focus/value to avoid ghost menus
      if (document.activeElement !== input) return;
      renderSuggestions(list);
    });
  });

  input.addEventListener('keydown', (ev) => {
    if (ev.key === 'ArrowDown') {
      if (!currentSuggestions.length) return;
      ev.preventDefault();
      const next = Math.min((activeIndex < 0 ? 0 : activeIndex + 1), currentSuggestions.length - 1);
      setActive(next);
    } else if (ev.key === 'ArrowUp') {
      if (!currentSuggestions.length) return;
      ev.preventDefault();
      const next = Math.max(activeIndex - 1, 0);
      setActive(next);
    } else if (ev.key === 'Enter') {
      if (activeIndex >= 0 && currentSuggestions[activeIndex]) {
        ev.preventDefault();
        selectSuggestion(activeIndex);
      }
    } else if (ev.key === 'Escape') {
      clearSuggestionsUI();
    }
  });

  // Hide suggestions when focus leaves the field wrapper
  input.addEventListener('blur', () => {
    // Delay so mousedown on <li> wins the race
    setTimeout(() => {
      if (document.activeElement !== input && !fieldWrap.contains(document.activeElement)) {
        clearSuggestionsUI();
      }
    }, 120);
  });

  // ---- Initial state ----
  if (s.address) {
    input.value = s.address;
    renderBadge(s.address, s.distanceKm);
    if (s.distanceKm == null && s.addressCoords) {
      // Recompute distance if we have coords but no km (e.g. reload after fail)
      setLoading(true);
      calculateDistance(s.addressCoords)
        .then((km) => {
          setLoading(false);
          setField('distanceKm', km);
          renderBadge(s.address, km);
        })
        .catch(() => {
          setLoading(false);
          showError('Distanz konnte nicht berechnet werden.');
        });
    }
  }

  document.dispatchEvent(new CustomEvent('wizard:step3-mounted', { detail: { inputEl: input } }));
}
