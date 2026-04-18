// Wizard lifecycle: open/close, focus trap, mobile sidebar, step orchestration.
// Called once from main.js on DOMContentLoaded.

import { initWizardNav } from './navigation.js';
import { animateStepChange } from './transitions.js';
import { getState, reset } from './state.js';
import { qs, qsa } from '../lib/dom.js';

import { renderStep1Intro } from './steps/step1-intro.js';
import { renderStep1 as renderEvent }     from './steps/step1-event.js';
import { renderStep2 as renderDatum }     from './steps/step2-datum.js';
import { renderStep3 as renderOrt }       from './steps/step3-ort.js';
import { renderStep4 as renderGaeste }    from './steps/step4-gaeste.js';
import { renderStep5 as renderZutaten }   from './steps/step5-zutaten.js';
import { renderStep6 as renderSetup }     from './steps/step6-setup.js';
import { renderStep7 as renderKontakt }   from './steps/step7-kontakt.js';
import { renderStep8 as renderUebersicht } from './steps/step8-uebersicht.js';

// 9 steps: 1=Intro, 2=Anlass, 3=Datum, 4=Ort, 5=Gäste, 6=Zutaten, 7=Setup, 8=Kontakt, 9=Übersicht
const RENDERERS = [
  null,
  renderStep1Intro,
  renderEvent,
  renderDatum,
  renderOrt,
  renderGaeste,
  renderZutaten,
  renderSetup,
  renderKontakt,
  renderUebersicht,
];

const OPEN_FOCUS_DELAY = 400;
const CLOSE_ANIM_MS = 600;

const FOCUSABLE_SEL = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function initWizard() {
  const modal = qs('#wizard-modal');
  if (!modal) return; // no wizard markup in this page — silent no-op.

  const stage = qs('#wizard-stage');
  const shell = modal.querySelector('.wizard-shell');
  const openTriggers = qsa('[data-wizard-open]');
  const closeTriggers = qsa('[data-wizard-close]');

  let lastFocused = null;
  let closeTimer = null;

  // --- Step orchestration ----------------------------------------------------
  const onStepChange = ({ step, direction }) => {
    const renderer = RENDERERS[step];
    if (!renderer || !stage) return;
    animateStepChange(stage, (stg) => renderer(stg), direction);
  };

  // Subsystems with their own listeners — fire once, unconditionally.
  initWizardNav({ onStepChange });
  tryInitResultPanel();
  tryInitSubmit();

  // --- Open ------------------------------------------------------------------
  function openWizard() {
    if (modal.classList.contains('is-open')) return;
    lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    // Fresh start after a completed submission.
    if (getState().submitted) reset();

    document.body.classList.add('wizard-open-lock');
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.remove('is-closing');
    modal.classList.add('is-open');
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }

    setTimeout(() => {
      if (stage && modal.classList.contains('is-open')) {
        stage.setAttribute('tabindex', '-1');
        try { stage.focus({ preventScroll: true }); } catch { stage.focus(); }
      }
    }, OPEN_FOCUS_DELAY);
  }

  // --- Close -----------------------------------------------------------------
  function closeWizard() {
    if (!modal.classList.contains('is-open') && modal.getAttribute('aria-hidden') !== 'false') return;

    modal.classList.remove('is-open');
    modal.classList.add('is-closing');

    closeTimer = setTimeout(() => {
      modal.setAttribute('aria-hidden', 'true');
      modal.classList.remove('is-closing');
      document.body.classList.remove('wizard-open-lock');
      closeTimer = null;
    }, CLOSE_ANIM_MS);

    if (lastFocused && typeof lastFocused.focus === 'function') {
      try { lastFocused.focus({ preventScroll: true }); } catch { lastFocused.focus(); }
    }
  }

  // --- Open/close triggers ---------------------------------------------------
  for (const el of openTriggers) {
    el.addEventListener('click', (ev) => {
      ev.preventDefault();
      openWizard();
    });
  }
  // Event delegation: covers initial close triggers AND ones added later
  // (e.g. the "Schliessen" button in the success panel, rendered after submit).
  modal.addEventListener('click', (ev) => {
    const target = ev.target instanceof Element ? ev.target.closest('[data-wizard-close]') : null;
    if (!target) return;
    ev.preventDefault();
    closeWizard();
  });

  // --- Escape + focus trap ---------------------------------------------------
  document.addEventListener('keydown', (ev) => {
    const isOpen = modal.classList.contains('is-open') || modal.getAttribute('aria-hidden') === 'false';
    if (!isOpen) return;

    if (ev.key === 'Escape') {
      ev.preventDefault();
      closeWizard();
      return;
    }

    if (ev.key !== 'Tab' || !shell) return;

    const focusables = Array.from(shell.querySelectorAll(FOCUSABLE_SEL))
      .filter((n) => n instanceof HTMLElement && !n.hasAttribute('disabled') && n.offsetParent !== null);
    if (focusables.length === 0) {
      ev.preventDefault();
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    const insideShell = active instanceof Node && shell.contains(active);

    if (!insideShell) {
      ev.preventDefault();
      (ev.shiftKey ? last : first).focus();
      return;
    }

    if (ev.shiftKey && active === first) {
      ev.preventDefault();
      last.focus();
    } else if (!ev.shiftKey && active === last) {
      ev.preventDefault();
      first.focus();
    }
  });

  // --- Submitted event → close handled by result-panel; nothing to dupe ----
  // We still listen so future hooks (e.g. analytics) can latch on without
  // touching mount. State persistence is handled by submit.js.
  document.addEventListener('wizard:submitted', () => {
    // Intentionally empty. result-panel.js renders the outcome into #wizard-stage.
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// result-panel currently only exports showResult(); if an init hook is later
// added, call it here. For now we just confirm the module loads.
async function tryInitResultPanel() {
  try {
    const mod = await import('./result-panel.js');
    if (typeof mod.initResultPanel === 'function') mod.initResultPanel();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[wizard] result-panel init failed:', err);
  }
}

// submit.js currently exports submitReservation/checkAvailability but no
// initSubmit. If/when it exposes one, mount it; otherwise wire the
// wizard:submit dispatch to submitReservation here.
async function tryInitSubmit() {
  try {
    const mod = await import('../submit.js');
    if (typeof mod.initSubmit === 'function') {
      mod.initSubmit();
      return;
    }
    // Fallback wiring: translate wizard:submit into a reservation call and
    // hand the result to result-panel.
    if (typeof mod.submitReservation === 'function') {
      document.addEventListener('wizard:submit', async () => {
        const result = await mod.submitReservation();
        try {
          const rp = await import('./result-panel.js');
          if (typeof rp.showResult === 'function') rp.showResult(result);
        } catch { /* ignore */ }
        document.dispatchEvent(new CustomEvent('wizard:submitted', { detail: result }));
      });
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[wizard] submit init failed:', err);
  }
}
