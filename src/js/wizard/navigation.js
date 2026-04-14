import { getState, setField, subscribe } from './state.js';
import { canAdvance, validateStep } from './validation.js';
import { qs, empty, createEl } from '../lib/dom.js';

const STEP_LABELS = [
  '1 Anlass',
  '2 Datum',
  '3 Ort',
  '4 Gäste',
  '5 Zutaten',
  '6 Setup',
  '7 Kontakt',
  '8 Übersicht',
];

export function initWizardNav({ onStepChange }) {
  const stepsList = qs('#wizard-steps');
  const prev = qs('#wizard-prev');
  const next = qs('#wizard-next');

  function renderSteps(current) {
    empty(stepsList);
    STEP_LABELS.forEach((label, idx) => {
      const i = idx + 1;
      const li = createEl('li', {
        dataset: { state: i === current ? 'active' : (i < current ? 'done' : 'pending') },
        onclick: () => { setField('step', i); },
      }, [label]);
      stepsList.appendChild(li);
    });
  }

  function updateButtons(state) {
    prev.disabled = state.step <= 1;
    prev.style.visibility = state.step <= 1 ? 'hidden' : 'visible';
    if (state.step >= 8) {
      next.textContent = 'Anfrage senden';
    } else {
      next.textContent = 'Weiter →';
    }
    next.disabled = !canAdvance(state.step, state);
  }

  prev.addEventListener('click', () => {
    const s = getState();
    if (s.step > 1) setField('step', s.step - 1);
  });

  next.addEventListener('click', () => {
    const s = getState();
    const errors = validateStep(s.step, s);
    if (errors.length > 0 && s.step === 7) {
      document.dispatchEvent(new CustomEvent('wizard:invalid', { detail: { step: s.step, errors } }));
      return;
    }
    if (s.step >= 8) {
      document.dispatchEvent(new CustomEvent('wizard:submit'));
    } else {
      setField('step', s.step + 1);
    }
  });

  subscribe((s) => {
    renderSteps(s.step);
    updateButtons(s);
    onStepChange?.(s);
  });
}
