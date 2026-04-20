// Generic Modal Handler
// Triggers: elements with [data-modal-target="id"]
// Close actions: elements with [data-modal-close] inside the modal, ESC key, backdrop click
// Desktop (>=900px): modals render inline (no overlay behavior needed) — opening is a no-op

const DESKTOP_BREAKPOINT = 900;

let openModalEl = null;
let prevBodyOverflow = '';
let prevFocus = null;

export function initSiteModal() {
  // A11y · alle geschlossenen Modals initial inert setzen (aria-hidden alone erlaubt Tab-Focus).
  document.querySelectorAll('.site-modal[aria-hidden="true"], .wizard-modal[aria-hidden="true"]').forEach((m) => {
    m.setAttribute('inert', '');
  });

  // Delegation: jedes Element mit [data-modal-target] oeffnet das entsprechende Modal.
  // Vorher nur '.site-modal-trigger' — damit neue Buttons (Gallery, Geschichte) auch funktionieren.
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
}

export function openModal(modal) {
  if (!modal) return;
  if (openModalEl && openModalEl !== modal) closeModal(openModalEl);
  const alwaysOverlay = modal.classList.contains('site-modal-overlay');
  if (!alwaysOverlay && window.innerWidth >= DESKTOP_BREAKPOINT) return;  // inline on desktop

  modal.setAttribute('aria-hidden', 'false');
  modal.removeAttribute('inert');
  prevBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  prevFocus = document.activeElement;
  openModalEl = modal;

  requestAnimationFrame(() => {
    const firstInput = modal.querySelector('input, textarea, select');
    const closeBtn = modal.querySelector('.site-modal-close');
    (firstInput || closeBtn)?.focus();
  });
}

export function closeModal(modal) {
  if (!modal) return;
  modal.setAttribute('aria-hidden', 'true');
  modal.setAttribute('inert', '');
  document.body.style.overflow = prevBodyOverflow || '';
  if (prevFocus && typeof prevFocus.focus === 'function') {
    prevFocus.focus();
  }
  if (openModalEl === modal) openModalEl = null;
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
