// Generic Modal Handler
// Triggers: elements with [data-modal-target="id"]
// Close actions: elements with [data-modal-close] inside the modal, ESC key, backdrop click
// Desktop (>=900px): modals render inline (no overlay behavior needed) — opening is a no-op
// Modal-Stack: Wenn child-modal (z.B. AGB) aus offenem parent (Kontakt) geöffnet wird,
// bleibt parent im Hintergrund (inert), child rendert darüber, close pop't zurück.

const DESKTOP_BREAKPOINT = 900;

let openModalEl = null;
const modalStack = [];
let prevBodyOverflow = '';
let prevFocus = null;

function isMobileViewport() {
  return window.matchMedia('(max-width: 899px)').matches;
}

export function initSiteModal() {
  // A11y · alle geschlossenen Modals initial inert setzen (aria-hidden alone erlaubt Tab-Focus).
  document.querySelectorAll('.site-modal[aria-hidden="true"], .wizard-modal[aria-hidden="true"]').forEach((m) => {
    m.setAttribute('inert', '');
  });

  // Delegation: jedes Element mit [data-modal-target] oeffnet das entsprechende Modal.
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-modal-target]');
    if (!trigger) return;
    e.preventDefault();
    const id = trigger.dataset.modalTarget;
    const modal = document.getElementById(id);
    if (!modal) return;
    openModal(modal);
  });

  // Delegate close handlers (backdrop, close button, custom)
  document.addEventListener('click', (e) => {
    const closer = e.target.closest('[data-modal-close]');
    if (!closer) return;
    const modal = closer.closest('.site-modal');
    if (!modal) return;
    closeModal(modal);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && openModalEl) {
      closeModal(openModalEl);
    }
    if (e.key === 'Tab' && openModalEl) {
      trapFocus(e);
    }
  });

  // Consent-Labels: click auf <a> darin darf NICHT checkbox toggeln
  document.querySelectorAll('.form-consent a, .wz-check a, .step8-agb a').forEach((link) => {
    link.addEventListener('click', (e) => { e.stopPropagation(); });
  });
}

export function openModal(modal) {
  if (!modal) return;
  const alwaysOverlay = modal.classList.contains('site-modal-overlay');
  if (!alwaysOverlay && window.innerWidth >= DESKTOP_BREAKPOINT) return;  // inline on desktop
  if (openModalEl === modal) return;  // already open

  // Parent-Modal pausieren (inert + z-index unten) statt schließen
  if (openModalEl) {
    openModalEl.setAttribute('inert', '');
    modalStack.push(openModalEl);
    // Child rendert über parent: höherer z-index
    modal.style.zIndex = String(1400 + modalStack.length * 10);
  } else {
    prevBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    prevFocus = document.activeElement;
  }

  modal.setAttribute('aria-hidden', 'false');
  modal.removeAttribute('inert');
  openModalEl = modal;

  requestAnimationFrame(() => {
    const closeBtn = modal.querySelector('.site-modal-close');
    // Mobile: NICHT in Input fokussieren — sonst springt Tastatur direkt auf.
    // Desktop: erstes input ok weil User Tastatur eh hat.
    const focusTarget = isMobileViewport()
      ? closeBtn
      : (modal.querySelector('input, textarea, select') || closeBtn);
    focusTarget?.focus();
  });
}

export function closeModal(modal) {
  if (!modal) return;
  modal.setAttribute('aria-hidden', 'true');
  modal.setAttribute('inert', '');
  modal.style.zIndex = '';

  // Parent-Modal restoren wenn Stack vorhanden
  if (openModalEl === modal && modalStack.length > 0) {
    const parent = modalStack.pop();
    parent.removeAttribute('inert');
    openModalEl = parent;
    // Focus zurück in parent-modal
    const parentCloseBtn = parent.querySelector('.site-modal-close');
    parentCloseBtn?.focus();
  } else if (openModalEl === modal) {
    // Letztes Modal geschlossen — body-scroll + prev focus restoren
    document.body.style.overflow = prevBodyOverflow || '';
    if (prevFocus && typeof prevFocus.focus === 'function') prevFocus.focus();
    openModalEl = null;
  }
}

function trapFocus(e) {
  if (!openModalEl) return;
  const focusables = openModalEl.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  if (focusables.length === 0) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  } else {
    if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}
