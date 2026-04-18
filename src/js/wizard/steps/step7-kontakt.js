import { createEl, empty } from '../../lib/dom.js';
import { getState, setField, subscribe } from '../state.js';

// Inline style for textarea min-height (wizard.css handles the rest)
function ensureStyle() {
  if (document.getElementById('step7-inline-style')) return;
  const style = createEl('style', { id: 'step7-inline-style' });
  style.textContent = `
    .step7-textarea { min-height: 100px; resize: vertical; }
  `;
  document.head.appendChild(style);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateName(v) {
  return (v || '').trim().length >= 2 ? null : 'Name angeben.';
}
function validateEmail(v) {
  return EMAIL_RE.test((v || '').trim()) ? null : 'Gültige E-Mail.';
}
function validatePhone(v) {
  const digits = (v || '').replace(/\D/g, '');
  return digits.length >= 8 ? null : 'Telefonnummer angeben.';
}

export function renderStep7(stage) {
  ensureStyle();
  empty(stage);
  const s = getState();

  // Local error state — cleared on input, populated on blur
  const errors = { name: null, email: null, phone: null };

  // Header
  stage.appendChild(createEl('div', { class: 'kicker' }, ['Schritt 8 / 9']));
  stage.appendChild(
    createEl('h3', { class: 'display', style: 'font-size: clamp(26px, 3.2vw, 44px);' }, [
      'Wie dürfen wir euch erreichen?',
    ])
  );
  stage.appendChild(
    createEl('p', { class: 'lede editorial' }, [
      'Für Rückfragen zur Reservation — keine Newsletter, keine Weitergabe.',
    ])
  );

  const form = createEl('div', {
    class: 'step7-form',
    style: 'display: flex; flex-direction: column; gap: 20px; margin-top: 24px;',
  });
  stage.appendChild(form);

  // Refs so we can update error elements & input values (subscribe path)
  const refs = {};

  // --- Helper: build a single text-input field with label/error/helper ---
  function buildField({ key, label, type, autocomplete, inputmode, helper, validate }) {
    const fieldWrap = createEl('div', { class: 'wz-field' });
    fieldWrap.appendChild(
      createEl('label', { class: 'wz-label', for: `step7-${key}` }, [label])
    );

    const inputAttrs = {
      id: `step7-${key}`,
      name: key,
      type,
      class: 'wz-input',
      autocomplete,
      required: 'required',
      value: s[key] ?? '',
    };
    if (inputmode) inputAttrs.inputmode = inputmode;

    const input = createEl('input', inputAttrs);

    const errorEl = createEl('p', { class: 'wz-error', role: 'alert' }, ['']);

    input.addEventListener('input', (e) => {
      // Store as-typed (trim only on blur/validation); setField commits immediately
      setField(key, e.target.value);
      // Clear any existing error on new input
      if (errors[key]) {
        errors[key] = null;
        errorEl.textContent = '';
      }
    });

    input.addEventListener('blur', () => {
      const msg = validate(input.value);
      errors[key] = msg;
      errorEl.textContent = msg || '';
    });

    fieldWrap.appendChild(input);
    if (helper) {
      fieldWrap.appendChild(createEl('p', { class: 'wz-helper' }, [helper]));
    }
    fieldWrap.appendChild(errorEl);

    refs[key] = { input, errorEl };
    return fieldWrap;
  }

  // --- Name ---
  form.appendChild(
    buildField({
      key: 'name',
      label: 'Name',
      type: 'text',
      autocomplete: 'name',
      validate: validateName,
    })
  );

  // --- E-Mail ---
  form.appendChild(
    buildField({
      key: 'email',
      label: 'E-Mail',
      type: 'email',
      autocomplete: 'email',
      inputmode: 'email',
      validate: validateEmail,
    })
  );

  // --- Telefon ---
  form.appendChild(
    buildField({
      key: 'phone',
      label: 'Telefon',
      type: 'tel',
      autocomplete: 'tel',
      inputmode: 'tel',
      helper: 'Schweizer Nummer — mit Ländercode wenn möglich (+41 …).',
      validate: validatePhone,
    })
  );

  // --- Nachricht (optional) — textarea ---
  const noteWrap = createEl('div', { class: 'wz-field' });
  noteWrap.appendChild(
    createEl('label', { class: 'wz-label', for: 'step7-note' }, ['Nachricht (optional)'])
  );
  const textarea = createEl('textarea', {
    id: 'step7-note',
    name: 'note',
    class: 'wz-textarea step7-textarea',
    rows: '4',
  });
  textarea.value = s.note ?? '';
  textarea.addEventListener('input', (e) => setField('note', e.target.value));
  noteWrap.appendChild(textarea);
  noteWrap.appendChild(
    createEl('p', { class: 'wz-helper' }, [
      'Besonderheiten, Wünsche, Fragen — Pietro liest es vor dem Event.',
    ])
  );
  form.appendChild(noteWrap);
  refs.note = { input: textarea };

  // --- Auto-focus first empty required field ---
  const focusOrder = ['name', 'email', 'phone'];
  requestAnimationFrame(() => {
    for (const key of focusOrder) {
      const el = refs[key]?.input;
      if (el && !(el.value || '').trim()) {
        el.focus();
        return;
      }
    }
    // All filled? Focus first regardless so user knows where they are.
    refs.name?.input?.focus();
  });

  // --- Subscribe: restore values if state changes externally (e.g. back/forward nav) ---
  const unsubscribe = subscribe((snap) => {
    for (const key of ['name', 'email', 'phone', 'note']) {
      const ref = refs[key];
      if (!ref || !ref.input) continue;
      const target = snap[key] ?? '';
      // Only update if different AND input isn't currently focused (don't hijack typing)
      if (ref.input.value !== target && document.activeElement !== ref.input) {
        ref.input.value = target;
      }
    }
  });

  // Cleanup subscription when stage is emptied by next render.
  // MutationObserver lets us detach without needing an explicit teardown contract.
  const mo = new MutationObserver(() => {
    if (!stage.contains(form)) {
      unsubscribe();
      mo.disconnect();
    }
  });
  mo.observe(stage, { childList: true });
}
