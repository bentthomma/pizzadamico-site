import { createEl, empty, setText } from '../../lib/dom.js';
import { getState, setField, subscribe } from '../state.js';

const STYLE_ID = 'wz-step4-inline-style';
const STYLE_CSS = `
.step4-summary {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid var(--wz-accent-soft);
  border-radius: 12px;
  background: color-mix(in srgb, var(--wz-accent) 6%, transparent);
}
.step4-summary-total {
  display: flex;
  gap: 8px;
  align-items: baseline;
  font-size: 18px;
}
.step4-total-value {
  font-family: var(--ff-display);
  font-size: 32px;
  font-weight: 540;
  color: var(--wz-accent);
  font-variant-numeric: tabular-nums;
  min-width: 2ch;
  display: inline-block;
}
.step4-summary-warn {
  margin-top: 8px;
  font-size: 14px;
  color: var(--wz-fg-soft);
}
.step4-summary-warn[data-state="warn"] { color: var(--c-fuoco); }
.step4-summary-warn[data-state="ok"]   { color: var(--wz-success); }
.step4-counters {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Editable counter value input */
input.wz-counter-value {
  background: transparent;
  border: none;
  outline: none;
  font: inherit;
  color: var(--wz-fg);
  text-align: center;
  font-variant-numeric: tabular-nums;
  font-size: 22px;
  font-weight: 540;
  min-width: 3ch;
  width: 3ch;
  padding: 0;
  -moz-appearance: textfield;
  appearance: textfield;
}
input.wz-counter-value::-webkit-outer-spin-button,
input.wz-counter-value::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input.wz-counter-value:focus-visible {
  outline: 2px solid var(--wz-accent);
  outline-offset: 4px;
  border-radius: 4px;
}

/* Under-30 popup modal */
.step4-under30-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 20;
  display: grid;
  place-items: center;
  padding: 24px;
  opacity: 0;
  animation: step4-under30-fade 240ms ease forwards;
}
.step4-under30-dialog {
  max-width: 480px;
  width: 100%;
  background: var(--wz-bg);
  border: 1px solid var(--wz-line);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  box-shadow: 0 20px 60px -20px rgba(0, 0, 0, 0.6);
  transform: scale(0.96);
  animation: step4-under30-pop 240ms cubic-bezier(0.2, 0.7, 0.3, 1) forwards;
}
.step4-under30-title {
  font-family: var(--ff-display, 'Bricolage Grotesque', serif);
  font-size: 28px;
  font-weight: 540;
  color: var(--wz-fg);
  margin: 0;
  line-height: 1.15;
}
.step4-under30-text {
  font-family: var(--ff-editorial, 'Tinos', Georgia, serif);
  font-style: italic;
  font-size: 16px;
  line-height: 1.5;
  color: var(--wz-fg-soft);
  margin: 16px 0 24px;
}
.step4-under30-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}
.step4-under30-actions .wizard-btn {
  text-decoration: none;
}
.step4-under30-meta {
  margin-top: 16px;
  font-size: 13px;
  opacity: 0.7;
  color: var(--wz-fg-soft);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}
@keyframes step4-under30-fade {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes step4-under30-pop {
  from { transform: scale(0.96); }
  to   { transform: scale(1); }
}
@media (prefers-reduced-motion: reduce) {
  .step4-under30-overlay,
  .step4-under30-dialog {
    animation-duration: 1ms;
  }
}
`;

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const tag = document.createElement('style');
  tag.id = STYLE_ID;
  tag.textContent = STYLE_CSS;
  document.head.appendChild(tag);
}

const MIN_ADULTS = 0;
const MAX_ADULTS = 200;
const MIN_CHILDREN = 0;
const MAX_CHILDREN = 50;

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function vibrate() {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(8);
    }
  } catch { /* ignore */ }
}

function buildCounter({ field, title, hint, ariaLabel, getValue, getMin, getMax }) {
  const wrap = createEl('div', { class: 'wz-counter' });

  const labelWrap = createEl('div', { class: 'wz-counter-label' }, [
    createEl('div', { class: 'wz-counter-title' }, [title]),
    createEl('div', { class: 'wz-counter-hint' }, [hint]),
  ]);

  const dec = createEl('button', {
    class: 'wz-counter-btn',
    type: 'button',
    'data-dec': '',
    'aria-label': 'Weniger',
  }, ['−']);

  const valueEl = createEl('input', {
    type: 'text',
    inputmode: 'numeric',
    pattern: '[0-9]*',
    class: 'wz-counter-value',
    value: String(getValue()),
    'aria-label': ariaLabel || `${title} Anzahl`,
    'aria-live': 'polite',
    maxlength: '3',
    autocomplete: 'off',
  });

  const inc = createEl('button', {
    class: 'wz-counter-btn',
    type: 'button',
    'data-inc': '',
    'aria-label': 'Mehr',
  }, ['+']);

  const controls = createEl('div', { class: 'wz-counter-controls' }, [dec, valueEl, inc]);

  wrap.appendChild(labelWrap);
  wrap.appendChild(controls);

  function step(delta) {
    const current = getValue();
    const next = clamp(current + delta, getMin(), getMax());
    if (next === current) return false;
    setField(field, next);
    vibrate();
    return true;
  }

  dec.addEventListener('click', () => step(-1));
  inc.addEventListener('click', () => step(+1));

  function handleKey(e, direction) {
    // direction: -1 for dec button, +1 for inc button
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      step(direction);
      return;
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault();
      step(e.shiftKey ? 5 : 1);
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault();
      step(e.shiftKey ? -5 : -1);
      return;
    }
  }

  dec.addEventListener('keydown', (e) => handleKey(e, -1));
  inc.addEventListener('keydown', (e) => handleKey(e, +1));

  // --- Input (typing) behaviour -----------------------------------------
  // Strip any non-digit characters defensively (handles paste + IME).
  function sanitizeDigits(raw) {
    return String(raw).replace(/\D+/g, '').slice(0, 3);
  }

  valueEl.addEventListener('input', () => {
    const raw = valueEl.value;
    const digits = sanitizeDigits(raw);
    // If sanitization changed the string (e.g. user pasted "abc12"), reflect it back.
    if (digits !== raw) {
      valueEl.value = digits;
    }
    if (digits === '') {
      // Allow empty while typing; don't write to state yet. Restored on blur.
      return;
    }
    const parsed = parseInt(digits, 10);
    if (!Number.isFinite(parsed)) return;
    const clamped = clamp(parsed, getMin(), getMax());
    if (clamped !== parsed) {
      // Reflect the clamp visually while user is typing (e.g. typed 999 → 200).
      valueEl.value = String(clamped);
    }
    if (clamped !== getValue()) {
      setField(field, clamped);
    }
  });

  valueEl.addEventListener('focus', () => {
    // Defer so the native focus selection doesn't fight us.
    requestAnimationFrame(() => {
      try { valueEl.select(); } catch { /* ignore */ }
    });
  });

  valueEl.addEventListener('blur', () => {
    // Restore a valid numeric string matching current state.
    const v = getValue();
    valueEl.value = String(v);
  });

  valueEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      valueEl.blur();
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      step(e.shiftKey ? 5 : 1);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      step(e.shiftKey ? -5 : -1);
      return;
    }
    if (e.key === 'Escape') {
      // Cancel typing: restore state value and drop focus.
      e.preventDefault();
      valueEl.value = String(getValue());
      valueEl.blur();
    }
  });

  function sync() {
    const v = getValue();
    const min = getMin();
    const max = getMax();
    // Skip DOM write if the user is currently typing in this input.
    if (document.activeElement !== valueEl) {
      valueEl.value = String(v);
    }
    dec.disabled = v <= min;
    inc.disabled = v >= max;
  }

  sync();

  return { el: wrap, sync };
}

export function renderStep4(stage) {
  empty(stage);
  ensureStyle();

  const step = createEl('div', { class: 'wizard-step', 'data-enter': 'active' });

  // Head
  const head = createEl('div', { class: 'wizard-step-head' }, [
    createEl('div', { class: 'wizard-step-kicker' }, ['Schritt 5 / 9']),
    createEl('h2', { class: 'wizard-step-title' }, ['Wer kommt?']),
    createEl('p', { class: 'wizard-step-lede' }, [
      'Ab 30 Personen — darunter ruft euch Pietro persönlich an, um die Details zu klären.',
    ]),
  ]);

  // Counters container
  const countersWrap = createEl('div', { class: 'wizard-step-body step4-counters' });

  const adultsCounter = buildCounter({
    field: 'adults',
    title: 'Erwachsene',
    hint: 'ab 11 Jahren · CHF 25.–',
    ariaLabel: 'Erwachsene Anzahl',
    getValue: () => getState().adults || 0,
    getMin: () => MIN_ADULTS,
    getMax: () => MAX_ADULTS,
  });

  const childrenCounter = buildCounter({
    field: 'children',
    title: 'Kinder (5–10)',
    hint: 'CHF 12.– · unter 5 Jahren gratis',
    ariaLabel: 'Kinder Anzahl',
    getValue: () => getState().children || 0,
    getMin: () => MIN_CHILDREN,
    getMax: () => MAX_CHILDREN,
  });

  countersWrap.appendChild(adultsCounter.el);
  countersWrap.appendChild(childrenCounter.el);

  // Summary
  const totalValueEl = createEl('strong', { class: 'step4-total-value' }, ['0']);
  const warnEl = createEl('div', { class: 'step4-summary-warn wz-helper', 'data-state': 'warn' }, ['']);

  const summary = createEl('div', { class: 'step4-summary' }, [
    createEl('div', { class: 'step4-summary-total' }, [
      createEl('span', {}, ['Gesamt']),
      totalValueEl,
      createEl('span', {}, ['Personen']),
    ]),
    warnEl,
  ]);

  step.appendChild(head);
  step.appendChild(countersWrap);
  step.appendChild(summary);
  stage.appendChild(step);

  function updateSummary() {
    const s = getState();
    const adults = s.adults || 0;
    const children = s.children || 0;
    const total = adults + children;

    setText(totalValueEl, String(total));

    if (total >= 30) {
      warnEl.setAttribute('data-state', 'ok');
      setText(warnEl, '');
    } else {
      warnEl.setAttribute('data-state', 'warn');
      setText(warnEl, 'Unter 30? Pietro klärt das persönlich mit euch.');
    }
  }

  // Subscribe → keep values, disabled states, totals and warning in sync
  const unsub = subscribe(() => {
    adultsCounter.sync();
    childrenCounter.sync();
    updateSummary();
  });

  // Teardown: if the stage is emptied later, release the subscription.
  // Use MutationObserver so we don't leak across step changes.
  const mo = new MutationObserver(() => {
    if (!stage.contains(step)) {
      unsub();
      mo.disconnect();
    }
  });
  mo.observe(stage, { childList: true });
}

// --- Under-30 popup modal -------------------------------------------------
// Shown when user tries to advance with fewer than 30 guests.
// Acts as a within-step modal: overlay + dialog + two actions.

const UNDER30_OVERLAY_CLASS = 'step4-under30-overlay';
const PHONE_TEL = '+41763313259';
const PHONE_DISPLAY = '076 331 32 59';

/**
 * Renders the under-30 popup, appending it to the stage.
 * Returns the overlay element and a cleanup() function.
 * @param {HTMLElement} stage
 * @returns {{ el: HTMLElement, cleanup: () => void }}
 */
export function renderUnder30Popup(stage) {
  ensureStyle();

  // Ensure positioning context on the stage so the absolute overlay anchors to it.
  const computed = getComputedStyle(stage);
  if (computed.position === 'static') {
    stage.style.position = 'relative';
  }

  const overlay = createEl('div', {
    class: UNDER30_OVERLAY_CLASS,
    role: 'presentation',
  });

  const title = createEl('h3', {
    class: 'step4-under30-title',
    id: 'step4-under30-title',
  }, ['Unter 30 Personen?']);

  const text = createEl('p', {
    class: 'step4-under30-text',
    id: 'step4-under30-desc',
  }, [
    'Für kleinere Events ruft euch Pietro gerne persönlich an, um die Details zu klären. So finden wir die beste Lösung für euren Anlass.',
  ]);

  // Primary action: tel: link styled as button.
  const callBtn = createEl('a', {
    class: 'wizard-btn wizard-btn-primary',
    href: `tel:${PHONE_TEL}`,
    'data-action': 'call',
  }, ['📞 Pietro anrufen']);

  // Secondary action: close popup, stay on step 5.
  const backBtn = createEl('button', {
    class: 'wizard-btn wizard-btn-secondary',
    type: 'button',
    'data-action': 'back',
  }, ['Zurück zur Eingabe']);

  const actions = createEl('div', { class: 'step4-under30-actions' }, [callBtn, backBtn]);
  const meta = createEl('div', { class: 'step4-under30-meta' }, [PHONE_DISPLAY]);

  const dialog = createEl('div', {
    class: 'step4-under30-dialog',
    role: 'dialog',
    'aria-modal': 'true',
    'aria-labelledby': 'step4-under30-title',
    'aria-describedby': 'step4-under30-desc',
    tabindex: '-1',
  }, [title, text, actions, meta]);

  overlay.appendChild(dialog);
  stage.appendChild(overlay);

  // Focus-trap-lite: remember previous focus, move focus to dialog.
  const previouslyFocused = document.activeElement instanceof HTMLElement
    ? document.activeElement
    : null;
  // Defer focus until after the entry animation tick.
  requestAnimationFrame(() => {
    try { dialog.focus(); } catch { /* ignore */ }
  });

  let cleaned = false;
  function cleanup() {
    if (cleaned) return;
    cleaned = true;
    document.removeEventListener('keydown', onKey, true);
    overlay.removeEventListener('click', onOverlayClick);
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
      try { previouslyFocused.focus(); } catch { /* ignore */ }
    }
  }

  // Escape closes the popup (same as secondary action).
  function onKey(ev) {
    if (ev.key === 'Escape') {
      ev.preventDefault();
      ev.stopPropagation();
      cleanup();
    }
  }
  document.addEventListener('keydown', onKey, true);

  // Clicking the overlay (not dialog) closes.
  function onOverlayClick(ev) {
    if (ev.target === overlay) {
      cleanup();
    }
  }
  overlay.addEventListener('click', onOverlayClick);

  backBtn.addEventListener('click', () => cleanup());
  // Phone link: leave native tel: behaviour; also close popup so user isn't stuck.
  callBtn.addEventListener('click', () => {
    // Slight delay so the tel: intent fires before cleanup mutates DOM.
    setTimeout(cleanup, 50);
  });

  return { el: overlay, cleanup };
}

/**
 * Idempotently opens the under-30 popup in the given stage.
 * If a popup is already mounted, this is a no-op.
 * @param {HTMLElement} stage
 * @returns {HTMLElement | null}
 */
export function showUnder30Popup(stage) {
  if (!stage) return null;
  const existing = stage.querySelector(`.${UNDER30_OVERLAY_CLASS}`);
  if (existing) return existing;
  const { el } = renderUnder30Popup(stage);
  return el;
}
