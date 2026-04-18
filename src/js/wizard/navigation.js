// Wizard navigation: dot-based progress indicator, prev/next buttons, footer meta.
// Subscribes to state, renders UI reactively, and drives step changes via
// an onStepChange({ step, direction }) callback provided by mount.js.

import { getState, setField, subscribe } from './state.js';
import { validateStep, canAdvance } from './validation.js';
import { qs, empty, createEl, setText } from '../lib/dom.js';

const STEP_LABELS = [
  'Willkommen',   // 1 — Info (always advanceable)
  'Anlass',       // 2
  'Datum',        // 3
  'Ort',          // 4
  'Gäste',        // 5
  'Zutaten',      // 6
  'Setup',        // 7
  'Kontakt',      // 8
  'Übersicht',    // 9
];
const TOTAL_STEPS = STEP_LABELS.length; // 9

// Step 3 is special: the "Weiter"-button must be clickable once date/time/duration
// are filled, so the click itself can trigger the availability check. Full
// canAdvance() requires availabilityChecked + result.available, which only
// happens *after* the click.
function step3FieldsReady(state) {
  return Boolean(state.date && state.time && state.durationHours);
}

// Short hints shown in the footer meta line when the step is not yet advanceable.
// Step 1 has its own welcome hint (always shown, advanceable or not).
function hintForStep(step) {
  switch (step) {
    case 2: return 'Anlass wählen';
    case 3: return 'Datum, Uhrzeit und Dauer wählen';
    case 4: return 'Adresse mit km-Berechnung';
    case 5: return 'Mindestens 30 Gäste';
    case 6: return 'Bis zu 6 Zutaten wählen';
    case 7: return 'Alle 4 Fragen beantworten';
    case 8: return 'Name, E-Mail und Telefon';
    case 9: return 'AGB bestätigen';
    default: return '';
  }
}

export function initWizardNav({ onStepChange }) {
  const stepsOl = qs('#wizard-steps');
  const prevBtn = qs('#wizard-prev');
  const nextBtn = qs('#wizard-next');
  const progressNum = qs('#wizard-progress-num');
  const progressTitle = qs('#wizard-progress-title');
  const footerMeta = qs('#wizard-footer-meta');
  const modal = qs('#wizard-modal');

  let prevStep = null;
  // Guard against double-invocation of the step-3 availability check.
  let isCheckingAvailability = false;

  // --- Build dots once -------------------------------------------------------
  const dots = [];
  if (stepsOl) {
    empty(stepsOl);
    for (let i = 0; i < TOTAL_STEPS; i++) {
      const stepNum = i + 1;
      const li = createEl('li', {
        'aria-label': STEP_LABELS[i],
        dataset: { step: String(stepNum), state: 'pending' },
      });
      li.addEventListener('click', () => {
        // Only dots in "done" state are clickable.
        if (li.dataset.state !== 'done') return;
        const current = getState().step;
        if (stepNum === current) return;
        setField('step', stepNum);
      });
      li.addEventListener('keydown', (ev) => {
        if (li.dataset.state !== 'done') return;
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          const current = getState().step;
          if (stepNum === current) return;
          setField('step', stepNum);
        }
      });
      stepsOl.appendChild(li);
      dots.push(li);
    }
  }

  // --- Dot + label rendering -------------------------------------------------
  function renderDots(state) {
    for (let i = 0; i < TOTAL_STEPS; i++) {
      const stepNum = i + 1;
      let dataState;
      if (stepNum < state.step) dataState = 'done';
      else if (stepNum === state.step) dataState = 'active';
      else dataState = 'pending';

      const li = dots[i];
      if (!li) continue;
      li.dataset.state = dataState;

      // Accessibility: done dots are focusable/clickable; others are not.
      if (dataState === 'done') {
        li.setAttribute('role', 'button');
        li.setAttribute('tabindex', '0');
        li.classList.add('is-clickable');
      } else {
        li.removeAttribute('role');
        li.removeAttribute('tabindex');
        li.classList.remove('is-clickable');
      }

      if (dataState === 'active') li.setAttribute('aria-current', 'step');
      else li.removeAttribute('aria-current');
    }

    if (stepsOl) stepsOl.setAttribute('aria-valuenow', String(state.step));
  }

  function renderLabels(state) {
    setText(progressNum, `Schritt ${state.step} von ${TOTAL_STEPS}`);
    setText(progressTitle, STEP_LABELS[state.step - 1] || '');
  }

  // --- Buttons ---------------------------------------------------------------
  function renderButtons(state) {
    const isFirst = state.step <= 1;
    const isLast = state.step === TOTAL_STEPS;

    // Step 3 can advance either:
    //  - via normal canAdvance() (availability already checked & free), or
    //  - via fields-ready alone — the click itself will fire the check.
    let advanceable;
    if (state.step === 3) {
      advanceable = canAdvance(3, state) || step3FieldsReady(state);
    } else {
      advanceable = canAdvance(state.step, state);
    }

    if (prevBtn) {
      prevBtn.disabled = isFirst;
      prevBtn.hidden = isFirst;
      prevBtn.setAttribute('aria-hidden', isFirst ? 'true' : 'false');
    }

    if (nextBtn) {
      // Don't clobber the button while a check/submit is in flight.
      if (isCheckingAvailability) return;

      if (isLast) {
        // Single-label submit button on step 9.
        nextBtn.textContent = 'Reservation bestätigen';
      } else {
        // Restore the two-span structure with arrow.
        empty(nextBtn);
        nextBtn.appendChild(createEl('span', {}, ['Weiter']));
        nextBtn.appendChild(createEl('span', { 'aria-hidden': 'true' }, ['→']));
      }
      nextBtn.disabled = !advanceable;
      nextBtn.setAttribute('aria-disabled', advanceable ? 'false' : 'true');
      nextBtn.dataset.final = isLast ? 'true' : 'false';
    }
  }

  // --- Footer meta -----------------------------------------------------------
  function renderFooterMeta(state) {
    if (!footerMeta) return;
    if (state.step === 1) {
      setText(footerMeta, 'Nimm dir kurz Zeit — dann los.');
      return;
    }
    // Step 3: footer meta only nags while fields are incomplete — once fields
    // are ready, the button is clickable and the check happens on click.
    if (state.step === 3) {
      setText(footerMeta, step3FieldsReady(state) ? '' : hintForStep(3));
      return;
    }
    const advanceable = canAdvance(state.step, state);
    setText(footerMeta, advanceable ? '' : hintForStep(state.step));
  }

  // --- Subscribe -------------------------------------------------------------
  subscribe((state) => {
    renderDots(state);
    renderLabels(state);
    renderButtons(state);
    renderFooterMeta(state);

    if (prevStep === null) {
      // First delivery from subscribe() = initial render.
      prevStep = state.step;
      if (typeof onStepChange === 'function') {
        onStepChange({ step: state.step, direction: 'initial' });
      }
    } else if (state.step !== prevStep) {
      const direction = state.step > prevStep ? 'forward' : 'backward';
      prevStep = state.step;
      if (typeof onStepChange === 'function') {
        onStepChange({ step: state.step, direction });
      }
    }
  });

  // --- Prev / Next clicks ----------------------------------------------------
  function goPrev() {
    const s = getState();
    if (s.step <= 1) return;
    setField('step', s.step - 1);
    // subscribe() above fires onStepChange with direction 'backward'.
  }

  async function goNext() {
    const s = getState();

    // Final step: dispatch submit intent if advanceable, else surface errors.
    if (s.step === TOTAL_STEPS) {
      const errors = validateStep(s.step, s);
      if (errors.length > 0 || !canAdvance(s.step, s)) {
        document.dispatchEvent(new CustomEvent('wizard:invalid', {
          detail: { step: s.step, errors },
        }));
        return;
      }
      document.dispatchEvent(new CustomEvent('wizard:submit'));
      return;
    }

    // --- Step 3: intercept & auto-check availability on Weiter-click --------
    if (s.step === 3) {
      // Fast path: already checked & free → advance immediately (no re-call).
      if (s.availabilityChecked && s.availabilityResult && s.availabilityResult.available === true) {
        setField('step', s.step + 1);
        return;
      }

      // Fields not ready: show inline error + dispatch wizard:invalid.
      if (!step3FieldsReady(s)) {
        try {
          const mod = await import('./steps/step2-datum.js');
          mod.renderAvailabilityError?.('Bitte Datum, Uhrzeit und Dauer ausfüllen.');
        } catch { /* ignore */ }
        document.dispatchEvent(new CustomEvent('wizard:invalid', {
          detail: { step: 3, errors: validateStep(3, s) },
        }));
        return;
      }

      if (isCheckingAvailability) return;
      isCheckingAvailability = true;
      setAvailabilityCheckLoading(true);

      try {
        const mod = await import('./steps/step2-datum.js');
        const res = await mod.runAvailabilityCheck();

        if (res.ok) {
          // Success: advance. Clear loading then move forward.
          setAvailabilityCheckLoading(false);
          setField('step', s.step + 1);
          return;
        }

        if (res.result) {
          // Conflict: render alternatives inline, keep step 3 open.
          mod.renderAvailabilityConflict?.(res.result);
          setAvailabilityCheckLoading(false);
          return;
        }

        // Error path (no result): inline error + wizard:invalid dispatch.
        mod.renderAvailabilityError?.(res.error || 'Verbindung fehlgeschlagen. Noch einmal?');
        document.dispatchEvent(new CustomEvent('wizard:invalid', {
          detail: {
            step: 3,
            errors: [{ field: 'availabilityResult', msg: res.error || 'Verbindung fehlgeschlagen.' }],
          },
        }));
        setAvailabilityCheckLoading(false);
      } catch (err) {
        try {
          const mod = await import('./steps/step2-datum.js');
          mod.renderAvailabilityError?.('Verbindung fehlgeschlagen. Noch einmal?');
        } catch { /* ignore */ }
        setAvailabilityCheckLoading(false);
      }
      return;
    }

    if (!canAdvance(s.step, s)) {
      // Surface errors visibly on contact step (8); other steps fail silently
      // (button is disabled by renderButtons anyway).
      if (s.step === 8) {
        const errors = validateStep(s.step, s);
        if (errors.length > 0) {
          document.dispatchEvent(new CustomEvent('wizard:invalid', {
            detail: { step: s.step, errors },
          }));
        }
      }
      return;
    }

    // Step 5 (Gäste): validation passed, but if total guests < 30 we intercept
    // advance and show the under-30 popup instead of moving to step 6. Pietro
    // wants a personal call for small events.
    if (s.step === 5) {
      const totalGuests = (Number(s.adults) || 0) + (Number(s.children) || 0);
      if (totalGuests < 30) {
        const stage = qs('#wizard-stage');
        if (stage) {
          import('./steps/step4-gaeste.js')
            .then((mod) => {
              if (typeof mod.showUnder30Popup === 'function') {
                mod.showUnder30Popup(stage);
              }
            })
            .catch(() => { /* fail silently — fallback: just stay on step 5 */ });
        }
        return;
      }
    }

    setField('step', s.step + 1);
    // subscribe() above fires onStepChange with direction 'forward'.
  }

  if (prevBtn) prevBtn.addEventListener('click', goPrev);
  if (nextBtn) nextBtn.addEventListener('click', goNext);

  // --- Availability-check loading state (step 3 Weiter-click) ---------------
  // We replace the button's label with "Prüfe Verfügbarkeit …" and disable it.
  // We do NOT add `.is-loading` (which makes text transparent + runs a dot
  // animation via ::after) — we want the label visible. Under reduced motion
  // the behavior is identical; no animation runs either way.
  function setAvailabilityCheckLoading(loading) {
    if (!nextBtn) return;
    if (loading) {
      isCheckingAvailability = true;
      empty(nextBtn);
      nextBtn.appendChild(document.createTextNode('Prüfe Verfügbarkeit …'));
      nextBtn.disabled = true;
      nextBtn.setAttribute('aria-disabled', 'true');
      nextBtn.setAttribute('aria-busy', 'true');
      nextBtn.style.cursor = 'wait';
    } else {
      isCheckingAvailability = false;
      nextBtn.removeAttribute('aria-busy');
      nextBtn.style.cursor = '';
      // Re-render from current state (restores Weiter + arrow + disabled).
      const s = getState();
      renderButtons(s);
      renderFooterMeta(s);
    }
  }

  // --- Submit lifecycle: drive the nav button's loading state ---------------
  // submit.js fires these three events. We own the visual feedback on
  // #wizard-next so the user gets immediate response after clicking
  // "Reservation bestätigen" — the Apps Script round-trip can take several
  // seconds and must not look frozen.
  function setNextLoading() {
    if (!nextBtn) return;
    empty(nextBtn);
    nextBtn.appendChild(document.createTextNode('Sende Anfrage …'));
    nextBtn.classList.add('is-loading');
    nextBtn.disabled = true;
    nextBtn.setAttribute('aria-disabled', 'true');
    nextBtn.setAttribute('aria-busy', 'true');
    nextBtn.style.cursor = 'wait';
    if (prevBtn) {
      prevBtn.disabled = true;
      prevBtn.setAttribute('aria-disabled', 'true');
    }
  }

  function clearNextLoading() {
    if (!nextBtn) return;
    nextBtn.classList.remove('is-loading');
    nextBtn.removeAttribute('aria-busy');
    nextBtn.style.cursor = '';
    // Re-render buttons from state so labels/arrows/disabled reflect reality.
    const s = getState();
    renderButtons(s);
    renderFooterMeta(s);
    if (prevBtn) prevBtn.removeAttribute('aria-disabled');
  }

  document.addEventListener('wizard:submitting', setNextLoading);
  document.addEventListener('wizard:submitted', clearNextLoading);
  document.addEventListener('wizard:error', (ev) => {
    clearNextLoading();
    // Surface the error via the footer-meta line for immediate visibility;
    // result-panel.js also renders a .wz-error toast at the top of the stage.
    const msg = (ev && ev.detail && ev.detail.msg) || '';
    if (msg && footerMeta) setText(footerMeta, msg);
  });

  // --- Keyboard: Enter triggers next when modal is open ---------------------
  document.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Enter') return;
    if (!modal) return;
    const isOpen = modal.getAttribute('aria-hidden') === 'false' || modal.classList.contains('is-open');
    if (!isOpen) return;

    const t = ev.target;
    if (!(t instanceof HTMLElement)) return;
    const tag = t.tagName;

    // Don't hijack Enter inside editable fields, buttons, links, or elements
    // that opt out via data-no-enter.
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (t.isContentEditable) return;
    if (tag === 'BUTTON' || tag === 'A') return;
    if (t.closest('[data-no-enter]')) return;

    ev.preventDefault();
    if (nextBtn) nextBtn.click();
  });
}
